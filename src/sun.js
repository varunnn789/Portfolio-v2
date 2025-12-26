/**
 * ============================================
 * REALISTIC SUN
 * ============================================
 * 
 * Shader-based sun with:
 * - Animated plasma surface (Perlin noise)
 * - Corona glow (Fresnel)
 * - Slow rotation
 * - Point light emission
 */

import * as THREE from 'three';

// ============================================
// NOISE FUNCTIONS (for shader)
// ============================================

const sunVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const sunFragmentShader = `
uniform float time;
uniform vec3 colorCore;
uniform vec3 colorMid;
uniform vec3 colorOuter;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Hash function for Voronoi
vec3 hash3(vec3 p) {
    p = vec3(
        dot(p, vec3(127.1, 311.7, 74.7)),
        dot(p, vec3(269.5, 183.3, 246.1)),
        dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(p) * 43758.5453123);
}

// Voronoi noise - returns distance to nearest cell center
float voronoi(vec3 p) {
    vec3 b = floor(p);
    vec3 f = fract(p);
    
    float minDist = 1.0;
    
    for (int z = -1; z <= 1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec3 offset = vec3(float(x), float(y), float(z));
                vec3 cellCenter = hash3(b + offset);
                vec3 diff = offset + cellCenter - f;
                float dist = length(diff);
                minDist = min(minDist, dist);
            }
        }
    }
    
    return minDist;
}

// Simplex noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    vec3 pos = normalize(vPosition);
    float t = time * 0.08;
    
    // ==========================================
    // GRANULATION (Voronoi cellular pattern)
    // ==========================================
    
    // Large convection cells
    float cells1 = voronoi(pos * 8.0 + vec3(t * 0.2, t * 0.15, t * 0.1));
    
    // Medium granulation
    float cells2 = voronoi(pos * 16.0 + vec3(-t * 0.3, t * 0.2, -t * 0.15));
    
    // Fine detail
    float cells3 = voronoi(pos * 32.0 + vec3(t * 0.4, -t * 0.3, t * 0.2));
    
    // Combine Voronoi layers - cells are dark (0), centers are bright (1)
    float granulation = cells1 * 0.5 + cells2 * 0.35 + cells3 * 0.15;
    granulation = 1.0 - granulation;  // Invert: centers bright, edges dark
    granulation = pow(granulation, 1.5);  // Increase contrast
    
    // ==========================================
    // TURBULENCE (Simplex noise for variation)
    // ==========================================
    
    float turb1 = snoise(pos * 3.0 + vec3(t * 0.5, t * 0.3, t * 0.2));
    float turb2 = snoise(pos * 6.0 + vec3(-t * 0.4, t * 0.6, -t * 0.3));
    float turbulence = turb1 * 0.6 + turb2 * 0.4;
    turbulence = turbulence * 0.5 + 0.5;  // 0-1 range
    
    // ==========================================
    // COMBINE FOR FINAL PLASMA
    // ==========================================
    
    float plasma = granulation * 0.7 + turbulence * 0.3;
    plasma = smoothstep(0.2, 0.9, plasma);  // Increase contrast
    
    // Add random bright hotspots
    float hotspot = snoise(pos * 12.0 + vec3(t * 0.8, -t * 0.6, t * 0.4));
    hotspot = smoothstep(0.6, 1.0, hotspot);  // Only keep brightest areas
    plasma = max(plasma, hotspot * 0.8);
    
    // ==========================================
    // COLOR MAPPING - Deep reds to bright whites
    // ==========================================
    
    vec3 darkRed = vec3(0.4, 0.05, 0.0);     // Very dark red (cell edges)
    vec3 deepOrange = vec3(0.8, 0.2, 0.0);   // Deep orange
    vec3 brightOrange = vec3(1.0, 0.5, 0.05); // Bright orange
    vec3 yellow = vec3(1.0, 0.85, 0.3);       // Yellow
    vec3 white = vec3(1.0, 1.0, 0.9);         // Hot white
    
    vec3 color;
    if (plasma < 0.2) {
        color = mix(darkRed, deepOrange, plasma / 0.2);
    } else if (plasma < 0.45) {
        color = mix(deepOrange, brightOrange, (plasma - 0.2) / 0.25);
    } else if (plasma < 0.7) {
        color = mix(brightOrange, yellow, (plasma - 0.45) / 0.25);
    } else {
        color = mix(yellow, white, (plasma - 0.7) / 0.3);
    }
    
    // Boost brightness overall
    color *= 1.15;
    
    // Add subtle rim darkening (limb effect)
    float rim = 1.0 - pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 0.3);
    color *= 0.85 + rim * 0.15;
    
    gl_FragColor = vec4(color, 1.0);
}
`;


// Corona glow shader
const coronaVertexShader = `
varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coronaFragmentShader = `
uniform vec3 glowColor;
uniform float intensity;
uniform float power;

varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
    // Fresnel effect - brighter at edges
    float fresnel = pow(1.0 - abs(dot(vNormal, vPositionNormal)), power);
    vec3 color = glowColor * fresnel * intensity;
    float alpha = fresnel * 0.6;
    
    gl_FragColor = vec4(color, alpha);
}
`;

/**
 * Create the realistic sun
 */
export function createSun(radius = 1.8) {
    const group = new THREE.Group();
    group.name = 'sun';

    // ============================================
    // SOLAR SURFACE (Photosphere)
    // ============================================

    const surfaceGeometry = new THREE.SphereGeometry(radius, 64, 64);
    const surfaceMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            colorCore: { value: new THREE.Color(0.8, 0.2, 0.05) },    // Deep orange-red
            colorMid: { value: new THREE.Color(1.0, 0.5, 0.1) },      // Bright orange
            colorOuter: { value: new THREE.Color(1.0, 0.85, 0.4) }    // Yellow
        },
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader
    });

    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.name = 'solarSurface';
    group.add(surface);

    // ============================================
    // CORONA GLOW (Inner)
    // ============================================

    const coronaInnerGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
    const coronaInnerMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(1.0, 0.6, 0.2) },
            intensity: { value: 1.5 },
            power: { value: 2.5 }
        },
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const coronaInner = new THREE.Mesh(coronaInnerGeometry, coronaInnerMaterial);
    coronaInner.name = 'coronaInner';
    group.add(coronaInner);

    // ============================================
    // CORONA GLOW (Outer)
    // ============================================

    const coronaOuterGeometry = new THREE.SphereGeometry(radius * 1.4, 32, 32);
    const coronaOuterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(1.0, 0.4, 0.1) },
            intensity: { value: 0.8 },
            power: { value: 3.5 }
        },
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });


    const coronaOuter = new THREE.Mesh(coronaOuterGeometry, coronaOuterMaterial);
    coronaOuter.name = 'coronaOuter';
    group.add(coronaOuter);

    // ============================================
    // POINT LIGHT
    // ============================================

    const sunLight = new THREE.PointLight(0xffaa44, 3, 100);
    sunLight.name = 'sunLight';
    group.add(sunLight);

    // Store reference for animation
    group.userData = {
        surface: surface,
        surfaceMaterial: surfaceMaterial,
        coronaInnerMaterial: coronaInnerMaterial,
        coronaOuterMaterial: coronaOuterMaterial
    };

    console.log('☀️ Realistic sun created');
    return group;
}

/**
 * Animate the sun
 */
export function animateSun(sun, time) {
    if (!sun || !sun.userData.surfaceMaterial) return;

    const data = sun.userData;

    // Slow rotation of surface
    if (data.surface) {
        data.surface.rotation.y = time * 0.02;
    }

    // Update shader time uniform
    data.surfaceMaterial.uniforms.time.value = time;

    // Subtle corona pulse
    const pulse = 1.0 + Math.sin(time * 0.5) * 0.1;
    data.coronaInnerMaterial.uniforms.intensity.value = 1.5 * pulse;
    data.coronaOuterMaterial.uniforms.intensity.value = 0.8 * pulse;
}
