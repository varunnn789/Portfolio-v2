/**
 * ============================================
 * CYBERPUNK SHAPES - Convoluted 3D Geometry
 * ============================================
 * 
 * LEARNING: Complex Geometry Composition
 * 
 * We create an interesting visual by:
 * 1. Layering multiple geometries
 * 2. Using wireframe and solid materials
 * 3. Animating rotations at different speeds
 * 4. Adding emissive glow effects
 */

import * as THREE from 'three';

/**
 * Create the central cyberpunk structure
 */
export function createCyberpunkCore() {
    const group = new THREE.Group();
    group.name = 'cyberpunkCore';

    // ============================================
    // OUTER CAGE - Rotating wireframe icosahedron
    // ============================================
    const outerGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const outerMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const outerCage = new THREE.Mesh(outerGeo, outerMat);
    outerCage.name = 'outerCage';
    group.add(outerCage);

    // ============================================
    // MIDDLE RING - Torus with glow
    // ============================================
    const torusGeo = new THREE.TorusGeometry(2.5, 0.08, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2;
    torus.name = 'middleRing';
    group.add(torus);

    // Second torus at different angle
    const torus2 = new THREE.Mesh(torusGeo.clone(), torusMat.clone());
    torus2.material.color.setHex(0x00ffff);
    torus2.material.emissive.setHex(0x00ffff);
    torus2.rotation.x = Math.PI / 3;
    torus2.rotation.y = Math.PI / 4;
    torus2.name = 'middleRing2';
    group.add(torus2);

    // ============================================
    // INNER CORE - Glowing octahedron
    // ============================================
    const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.name = 'innerCore';
    group.add(core);

    // Core wireframe overlay
    const coreWireGeo = new THREE.OctahedronGeometry(1.25, 0);
    const coreWireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const coreWire = new THREE.Mesh(coreWireGeo, coreWireMat);
    coreWire.name = 'coreWire';
    group.add(coreWire);

    // ============================================
    // FLOATING CUBES - Orbiting elements
    // ============================================
    const cubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const cubeMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.3
    });

    const cubesGroup = new THREE.Group();
    cubesGroup.name = 'orbitingCubes';

    for (let i = 0; i < 8; i++) {
        const cube = new THREE.Mesh(cubeGeo, cubeMat.clone());
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2.8;
        const height = (Math.random() - 0.5) * 2;

        cube.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        cube.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        cube.userData.orbitAngle = angle;
        cube.userData.orbitRadius = radius;
        cube.userData.orbitHeight = height;
        cube.userData.orbitSpeed = 0.3 + Math.random() * 0.3;

        cubesGroup.add(cube);
    }
    group.add(cubesGroup);

    // ============================================
    // POINT LIGHT - Inner glow
    // ============================================
    const coreLight = new THREE.PointLight(0xff6600, 1.5, 10);
    coreLight.position.set(0, 0, 0);
    group.add(coreLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(0x00ffff, 0.5, 8);
    accentLight1.position.set(3, 2, 0);
    group.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff00ff, 0.5, 8);
    accentLight2.position.set(-3, -1, 2);
    group.add(accentLight2);

    // Position the whole thing
    group.position.y = 4;

    console.log('🔷 Cyberpunk core created');
    return group;
}

/**
 * Animate the cyberpunk core (call each frame)
 */
export function animateCyberpunkCore(core, time) {
    if (!core) return;

    // Outer cage - slow rotation
    const outerCage = core.getObjectByName('outerCage');
    if (outerCage) {
        outerCage.rotation.x = time * 0.1;
        outerCage.rotation.y = time * 0.15;
    }

    // Middle rings - opposite rotations
    const ring1 = core.getObjectByName('middleRing');
    const ring2 = core.getObjectByName('middleRing2');
    if (ring1) ring1.rotation.z = time * 0.3;
    if (ring2) ring2.rotation.z = -time * 0.25;

    // Inner core - pulsing rotation
    const innerCore = core.getObjectByName('innerCore');
    const coreWire = core.getObjectByName('coreWire');
    if (innerCore) {
        innerCore.rotation.x = time * 0.5;
        innerCore.rotation.y = time * 0.7;
        // Pulse scale
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        innerCore.scale.setScalar(pulse);
    }
    if (coreWire) {
        coreWire.rotation.x = -time * 0.4;
        coreWire.rotation.y = -time * 0.6;
    }

    // Orbiting cubes
    const cubesGroup = core.getObjectByName('orbitingCubes');
    if (cubesGroup) {
        cubesGroup.children.forEach(cube => {
            cube.userData.orbitAngle += cube.userData.orbitSpeed * 0.02;
            cube.position.x = Math.cos(cube.userData.orbitAngle) * cube.userData.orbitRadius;
            cube.position.z = Math.sin(cube.userData.orbitAngle) * cube.userData.orbitRadius;
            cube.position.y = cube.userData.orbitHeight + Math.sin(time + cube.userData.orbitAngle) * 0.3;

            cube.rotation.x += 0.02;
            cube.rotation.y += 0.03;
        });
    }

    // Pulsing core light
    const coreLight = core.children.find(c => c.type === 'PointLight' && c.color.getHex() === 0xff6600);
    if (coreLight) {
        coreLight.intensity = 1.5 + Math.sin(time * 3) * 0.5;
    }
}
