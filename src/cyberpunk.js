/**
 * ============================================
 * CYBERPUNK CORE - Solar System Style
 * ============================================
 * 
 * - Vertex orbs FIXED on exact positions (no floating)
 * - Solar system style rotating rings
 * - Core expands on section click
 */

import * as THREE from 'three';

const SECTION_COLORS = {
    about: 0x00ffff,
    skills: 0xff00ff,
    projects: 0x00ff88,
    experience: 0xff6600,
    contact: 0xffff00
};

/**
 * Create the cyberpunk core
 */
export function createCyberpunkCore() {
    const group = new THREE.Group();
    group.name = 'cyberpunkCore';

    // ============================================
    // LAYERED WIREFRAME SHELLS
    // ============================================

    const layer1Geo = new THREE.IcosahedronGeometry(4.5, 1);
    const layer1Mat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.06
    });
    const layer1 = new THREE.Mesh(layer1Geo, layer1Mat);
    layer1.name = 'layer1';
    group.add(layer1);

    const layer2Geo = new THREE.IcosahedronGeometry(3.5, 1);
    const layer2Mat = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const layer2 = new THREE.Mesh(layer2Geo, layer2Mat);
    layer2.name = 'layer2';
    group.add(layer2);

    const layer3Geo = new THREE.IcosahedronGeometry(2.5, 1);
    const layer3Mat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const layer3 = new THREE.Mesh(layer3Geo, layer3Mat);
    layer3.name = 'layer3';
    group.add(layer3);

    // ============================================
    // INNER CORE
    // ============================================

    const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff6600,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.name = 'innerCore';
    group.add(core);

    // Core glow
    const glowGeo = new THREE.SphereGeometry(2, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.name = 'coreGlow';
    group.add(glow);

    // ============================================
    // VERTEX ORBS - Fixed positions, solar system rings
    // ============================================

    const vertexOrbs = new THREE.Group();
    vertexOrbs.name = 'vertexOrbs';

    const sections = ['about', 'skills', 'projects', 'experience', 'contact'];

    // Exact vertex positions on outer shell
    const orbPositions = [
        new THREE.Vector3(0, 4.8, 0),       // Top
        new THREE.Vector3(4.2, 1.5, 1.5),   // Right front
        new THREE.Vector3(-4.2, 1.5, 1.5),  // Left front
        new THREE.Vector3(3, -2.5, -3),     // Right back low
        new THREE.Vector3(-3, -2.5, -3)     // Left back low
    ];

    sections.forEach((section, i) => {
        const orbGroup = new THREE.Group();
        orbGroup.name = `orb_${section}`;

        // Central sphere
        const orbGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const orbMat = new THREE.MeshStandardMaterial({
            color: SECTION_COLORS[section],
            emissive: SECTION_COLORS[section],
            emissiveIntensity: 0.9,
            metalness: 0.5,
            roughness: 0.2
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orbGroup.add(orb);

        // Orbital ring 1 (tilted)
        const ring1Geo = new THREE.TorusGeometry(0.25, 0.008, 8, 32);
        const ring1Mat = new THREE.MeshBasicMaterial({
            color: SECTION_COLORS[section],
            transparent: true,
            opacity: 0.6
        });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.x = Math.PI / 3;
        ring1.name = 'ring1';
        orbGroup.add(ring1);

        // Orbital ring 2 (different tilt)
        const ring2 = new THREE.Mesh(ring1Geo.clone(), ring1Mat.clone());
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.y = Math.PI / 2;
        ring2.name = 'ring2';
        orbGroup.add(ring2);

        // Small orbiting moon
        const moonGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(0.25, 0, 0);
        moon.name = 'moon';
        orbGroup.add(moon);

        // Point light
        const light = new THREE.PointLight(SECTION_COLORS[section], 0.4, 4);
        orbGroup.add(light);

        // FIXED position (no floating)
        orbGroup.position.copy(orbPositions[i]);

        orbGroup.userData = {
            type: 'sectionOrb',
            section: section,
            baseScale: 1,
            targetScale: 1,
            fixedPosition: orbPositions[i].clone() // Store original
        };

        vertexOrbs.add(orbGroup);
    });

    group.add(vertexOrbs);

    // ============================================
    // CONNECTING LINES
    // ============================================

    const lineMat = new THREE.LineBasicMaterial({
        color: 0x333355,
        transparent: true,
        opacity: 0.15
    });

    orbPositions.forEach(pos => {
        const points = [new THREE.Vector3(0, 0, 0), pos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    });

    // ============================================
    // LIGHTS
    // ============================================

    const coreLight = new THREE.PointLight(0xff6600, 2.5, 15);
    group.add(coreLight);

    // Position left to account for right panel
    group.position.set(-2, 4, 0);

    // Store for expansion animation
    group.userData = {
        baseScale: 1,
        targetScale: 1
    };

    console.log('🔷 Cyberpunk core (solar system style) created');
    return group;
}

/**
 * Get orbs for raycasting
 */
export function getInteractiveOrbs(core) {
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (!vertexOrbs) return [];
    return vertexOrbs.children;
}

/**
 * Highlight orb
 */
export function highlightOrb(orb, highlight = true) {
    if (!orb) return;

    orb.userData.targetScale = highlight ? 1.8 : 1;

    orb.children.forEach(child => {
        if (child.name === 'ring1' || child.name === 'ring2') {
            child.material.opacity = highlight ? 1 : 0.6;
        }
        if (child.type === 'PointLight') {
            child.intensity = highlight ? 1.2 : 0.4;
        }
        if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = highlight ? 1.5 : 0.9;
        }
    });
}

/**
 * Animate core
 */
export function animateCyberpunkCore(core, time, activeSection = null) {
    if (!core) return;

    // Rotate layers at different speeds
    const layer1 = core.getObjectByName('layer1');
    const layer2 = core.getObjectByName('layer2');
    const layer3 = core.getObjectByName('layer3');

    if (layer1) {
        layer1.rotation.x = time * 0.04;
        layer1.rotation.y = time * 0.06;
    }
    if (layer2) {
        layer2.rotation.x = -time * 0.05;
        layer2.rotation.y = time * 0.04;
    }
    if (layer3) {
        layer3.rotation.x = time * 0.08;
        layer3.rotation.y = -time * 0.07;
    }

    // Inner core pulse
    const innerCore = core.getObjectByName('innerCore');
    const coreGlow = core.getObjectByName('coreGlow');
    if (innerCore) {
        innerCore.rotation.x = time * 0.2;
        innerCore.rotation.y = time * 0.3;
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        innerCore.scale.setScalar(pulse);
    }
    if (coreGlow) {
        coreGlow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.1);
        coreGlow.material.opacity = 0.08 + Math.sin(time * 2) * 0.04;
    }

    // Vertex orbs - animate rings and moons (NO FLOATING)
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach((orbGroup, i) => {
            // Spin rings
            const ring1 = orbGroup.getObjectByName('ring1');
            const ring2 = orbGroup.getObjectByName('ring2');
            if (ring1) ring1.rotation.z = time * 3;
            if (ring2) ring2.rotation.z = -time * 2.5;

            // Orbit moon
            const moon = orbGroup.getObjectByName('moon');
            if (moon) {
                const moonAngle = time * 2 + i;
                moon.position.x = Math.cos(moonAngle) * 0.25;
                moon.position.z = Math.sin(moonAngle) * 0.25;
            }

            // Smooth scale (for hover)
            const currentScale = orbGroup.scale.x;
            const targetScale = orbGroup.userData.targetScale;
            orbGroup.scale.setScalar(currentScale + (targetScale - currentScale) * 0.15);

            // Keep position FIXED (no floating)
            orbGroup.position.copy(orbGroup.userData.fixedPosition);

            // Highlight active
            if (activeSection && orbGroup.userData.section === activeSection) {
                orbGroup.userData.targetScale = 1.5;
            }
        });
    }

    // Core expansion
    const currentScale = core.scale.x;
    const targetScale = core.userData.targetScale;
    core.scale.setScalar(currentScale + (targetScale - currentScale) * 0.05);

    // Pulsing core light
    const coreLight = core.children.find(c => c.type === 'PointLight');
    if (coreLight) {
        coreLight.intensity = 2.5 + Math.sin(time * 3) * 0.5;
    }
}

/**
 * Expand core when section is clicked
 */
export function expandCore(core, expand = true) {
    core.userData.targetScale = expand ? 1.3 : 1;
}
