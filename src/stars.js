/**
 * ============================================
 * STARFIELD - Deep Space Background
 * ============================================
 * 
 * Creates an immersive star field with:
 * - Hundreds of stars at varying depths
 * - Subtle twinkling effect
 * - Slow rotation for parallax
 */

import * as THREE from 'three';

/**
 * Create the starfield
 */
export function createStarfield(count = 800) {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkleOffsets = new Float32Array(count); // For twinkling

    for (let i = 0; i < count; i++) {
        // Distribute stars in a large sphere around the scene
        const radius = 80 + Math.random() * 120; // 80-200 units away
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Star colors - mostly white with hints of blue/yellow
        const colorChoice = Math.random();
        if (colorChoice < 0.7) {
            // White
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        } else if (colorChoice < 0.85) {
            // Blue-white
            colors[i * 3] = 0.8;
            colors[i * 3 + 1] = 0.9;
            colors[i * 3 + 2] = 1;
        } else {
            // Yellow-white
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.95;
            colors[i * 3 + 2] = 0.8;
        }

        // Varying sizes
        sizes[i] = 0.3 + Math.random() * 1.2;

        // Random twinkle offset so stars don't all twinkle in sync
        twinkleOffsets[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('twinkleOffset', new THREE.BufferAttribute(twinkleOffsets, 1));

    // Custom shader material for twinkling
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: `
      attribute float size;
      attribute float twinkleOffset;
      varying vec3 vColor;
      varying float vTwinkle;
      uniform float time;
      uniform float pixelRatio;
      
      void main() {
        vColor = color;
        vTwinkle = twinkleOffset;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Twinkle effect
        float twinkle = 0.7 + 0.3 * sin(time * 2.0 + twinkleOffset * 6.28);
        
        gl_PointSize = size * pixelRatio * twinkle * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
        fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        // Circular star shape with soft edges
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        // Soft glow falloff
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(geometry, material);
    stars.name = 'starfield';

    // Store reference for animation
    stars.userData = {
        twinkleOffsets: twinkleOffsets
    };

    console.log('✨ Starfield created with', count, 'stars');
    return stars;
}

/**
 * Animate the starfield
 */
export function animateStarfield(stars, time) {
    if (!stars) return;

    // Update time uniform for twinkling
    stars.material.uniforms.time.value = time;

    // Slow rotation for parallax effect
    stars.rotation.y = time * 0.005;
    stars.rotation.x = time * 0.002;
}

/**
 * Create nebula clouds - large semi-transparent spheres with gradient colors
 */
export function createNebula() {
    const nebulaGroup = new THREE.Group();
    nebulaGroup.name = 'nebula';

    // Nebula cloud 1 - Deep purple
    const nebula1Geo = new THREE.SphereGeometry(150, 32, 32);
    const nebula1Mat = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0x1a0033) },
            color2: { value: new THREE.Color(0x0a0015) },
            time: { value: 0 }
        },
        vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float time;
      varying vec3 vPosition;
      
      void main() {
        float mixFactor = (vPosition.y + 150.0) / 300.0;
        mixFactor += sin(vPosition.x * 0.02 + time * 0.1) * 0.1;
        vec3 color = mix(color2, color1, mixFactor);
        gl_FragColor = vec4(color, 0.3);
      }
    `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
    });
    const nebula1 = new THREE.Mesh(nebula1Geo, nebula1Mat);
    nebula1.name = 'nebula1';
    nebulaGroup.add(nebula1);

    // Nebula cloud 2 - Dark blue
    const nebula2Geo = new THREE.SphereGeometry(140, 32, 32);
    const nebula2Mat = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0x001133) },
            color2: { value: new THREE.Color(0x000511) },
            time: { value: 0 }
        },
        vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float time;
      varying vec3 vPosition;
      
      void main() {
        float mixFactor = (vPosition.x + 140.0) / 280.0;
        mixFactor += sin(vPosition.z * 0.015 + time * 0.08) * 0.15;
        vec3 color = mix(color2, color1, mixFactor);
        gl_FragColor = vec4(color, 0.25);
      }
    `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
    });
    const nebula2 = new THREE.Mesh(nebula2Geo, nebula2Mat);
    nebula2.rotation.z = Math.PI / 4;
    nebula2.name = 'nebula2';
    nebulaGroup.add(nebula2);

    // Nebula cloud 3 - Subtle cyan accent
    const nebula3Geo = new THREE.SphereGeometry(130, 32, 32);
    const nebula3Mat = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0x003344) },
            color2: { value: new THREE.Color(0x001122) },
            time: { value: 0 }
        },
        vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float time;
      varying vec3 vPosition;
      
      void main() {
        float mixFactor = (vPosition.z + 130.0) / 260.0;
        mixFactor += sin(vPosition.y * 0.025 + time * 0.12) * 0.1;
        vec3 color = mix(color2, color1, mixFactor);
        gl_FragColor = vec4(color, 0.2);
      }
    `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
    });
    const nebula3 = new THREE.Mesh(nebula3Geo, nebula3Mat);
    nebula3.rotation.x = Math.PI / 3;
    nebula3.name = 'nebula3';
    nebulaGroup.add(nebula3);

    console.log('🌌 Nebula clouds created');
    return nebulaGroup;
}

/**
 * Animate nebula clouds
 */
export function animateNebula(nebula, time) {
    if (!nebula) return;

    // Update shader time uniforms
    nebula.children.forEach(cloud => {
        if (cloud.material.uniforms) {
            cloud.material.uniforms.time.value = time;
        }
    });

    // Very slow rotation
    nebula.rotation.y = time * 0.002;
}
