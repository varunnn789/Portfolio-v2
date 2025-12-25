/**
 * ============================================
 * CYBERPUNK CORE - Refined Version
 * ============================================
 * 
 * Changes:
 * - Removed middle rings and orbiting cubes
 * - Smaller vertex orbs on outer vertices
 * - Added depth with multiple layers
 * - Core positioned more to the left
 */

import * as THREE from 'three';

// Section colors
const SECTION_COLORS = {
    about: 0x00ffff,    // Cyan
    skills: 0xff00ff,   // Magenta
    projects: 0x00ff88, // Green
    experience: 0xff6600, // Orange
    contact: 0xffff00   // Yellow
};

/**
 * Create the central cyberpunk structure
 */
export function createCyberpunkCore() {
    const group = new THREE.Group();
    group.name = 'cyberpunkCore';

    // ============================================
    // OUTER WIREFRAME LAYERS - For depth perception
    // ============================================

    // Layer 1 - Outermost, very transparent
    const outer1Geo = new THREE.IcosahedronGeometry(4, 1);
    const outer1Mat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const outer1 = new THREE.Mesh(outer1Geo, outer1Mat);
    outer1.name = 'outerLayer1';
    group.add(outer1);

    // Layer 2 - Middle layer
    const outer2Geo = new THREE.IcosahedronGeometry(3.2, 1);
    const outer2Mat = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const outer2 = new THREE.Mesh(outer2Geo, outer2Mat);
    outer2.name = 'outerLayer2';
    group.add(outer2);

    // Layer 3 - Inner wireframe
    const outer3Geo = new THREE.IcosahedronGeometry(2.4, 1);
    const outer3Mat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    const outer3 = new THREE.Mesh(outer3Geo, outer3Mat);
    outer3.name = 'outerLayer3';
    group.add(outer3);

    // ============================================
    // INNER CORE - Solid glowing shape
    // ============================================

    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff6600,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.name = 'innerCore';
    group.add(core);

    // Core glow sphere (larger, more transparent)
    const glowGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.08
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.name = 'coreGlow';
    group.add(glow);

    // ============================================
    // INTERACTIVE VERTEX ORBS - Small, on outer vertices
    // ============================================

    const vertexOrbs = new THREE.Group();
    vertexOrbs.name = 'vertexOrbs';

    const sections = ['about', 'skills', 'projects', 'experience', 'contact'];

    // Positions on the outermost icosahedron vertices
    const orbPositions = [
        new THREE.Vector3(0, 4.2, 0),       // Top - About
        new THREE.Vector3(3.8, 1.2, 1.5),   // Right front - Skills
        new THREE.Vector3(-3.8, 1.2, 1.5),  // Left front - Projects
        new THREE.Vector3(2.5, -2, -3),     // Right back low - Experience
        new THREE.Vector3(-2.5, -2, -3)     // Left back low - Contact
    ];

    sections.forEach((section, i) => {
        const orbGroup = new THREE.Group();
        orbGroup.name = `orb_${section}`;

        // Small glowing orb
        const orbGeo = new THREE.SphereGeometry(0.15, 12, 12);
        const orbMat = new THREE.MeshStandardMaterial({
            color: SECTION_COLORS[section],
            emissive: SECTION_COLORS[section],
            emissiveIntensity: 0.8,
            metalness: 0.5,
            roughness: 0.2
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orbGroup.add(orb);

        // Outer ring (subtle)
        const ringGeo = new THREE.TorusGeometry(0.22, 0.015, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: SECTION_COLORS[section],
            transparent: true,
            opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.name = 'orbRing';
        orbGroup.add(ring);

        // Point light for each orb
        const orbLight = new THREE.PointLight(SECTION_COLORS[section], 0.3, 3);
        orbGroup.add(orbLight);

        orbGroup.position.copy(orbPositions[i]);

        orbGroup.userData = {
            type: 'sectionOrb',
            section: section,
            baseScale: 1,
            targetScale: 1,
            basePosition: orbPositions[i].clone()
        };

        vertexOrbs.add(orbGroup);
    });

    group.add(vertexOrbs);

    // ============================================
    // CONNECTING LINES - Thin lines from core to orbs
    // ============================================

    const lineMat = new THREE.LineBasicMaterial({
        color: 0x333355,
        transparent: true,
        opacity: 0.2
    });

    orbPositions.forEach(pos => {
        const points = [new THREE.Vector3(0, 0, 0), pos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    });

    // ============================================
    // CENTRAL LIGHT
    // ============================================

    const coreLight = new THREE.PointLight(0xff6600, 2, 12);
    group.add(coreLight);

    // Position the core to the LEFT to account for right panel
    group.position.set(-2, 4, 0);

    console.log('🔷 Cyberpunk core created (refined)');
    return group;
}

/**
 * Get all interactive orbs for raycasting
 */
export function getInteractiveOrbs(core) {
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (!vertexOrbs) return [];
    return vertexOrbs.children;
}

/**
 * Highlight an orb on hover
 */
export function highlightOrb(orb, highlight = true) {
    if (!orb) return;

    orb.userData.targetScale = highlight ? 1.6 : 1;

    const ring = orb.getObjectByName('orbRing');
    if (ring) {
        ring.material.opacity = highlight ? 0.9 : 0.4;
    }

    // Increase light intensity on hover
    orb.children.forEach(child => {
        if (child.type === 'PointLight') {
            child.intensity = highlight ? 1 : 0.3;
        }
        if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = highlight ? 1.2 : 0.8;
        }
    });
}

/**
 * Animate the cyberpunk core
 */
export function animateCyberpunkCore(core, time, activeSection = null) {
    if (!core) return;

    // Outer layers - different rotation speeds for depth
    const layer1 = core.getObjectByName('outerLayer1');
    const layer2 = core.getObjectByName('outerLayer2');
    const layer3 = core.getObjectByName('outerLayer3');

    if (layer1) {
        layer1.rotation.x = time * 0.05;
        layer1.rotation.y = time * 0.08;
    }
    if (layer2) {
        layer2.rotation.x = -time * 0.07;
        layer2.rotation.y = time * 0.06;
    }
    if (layer3) {
        layer3.rotation.x = time * 0.1;
        layer3.rotation.y = -time * 0.09;
    }

    // Inner core - pulsing
    const innerCore = core.getObjectByName('innerCore');
    const coreGlow = core.getObjectByName('coreGlow');
    if (innerCore) {
        innerCore.rotation.x = time * 0.3;
        innerCore.rotation.y = time * 0.4;
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        innerCore.scale.setScalar(pulse);
    }
    if (coreGlow) {
        const glowPulse = 1 + Math.sin(time * 1.5) * 0.1;
        coreGlow.scale.setScalar(glowPulse);
        coreGlow.material.opacity = 0.06 + Math.sin(time * 2) * 0.03;
    }

    // Vertex orbs
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach((orbGroup, i) => {
            // Rotate ring
            const ring = orbGroup.getObjectByName('orbRing');
            if (ring) {
                ring.rotation.x = time * 2;
                ring.rotation.y = time * 1.2;
            }

            // Smooth scale transition
            const currentScale = orbGroup.scale.x;
            const targetScale = orbGroup.userData.targetScale;
            orbGroup.scale.setScalar(currentScale + (targetScale - currentScale) * 0.12);

            // Highlight active section
            if (activeSection && orbGroup.userData.section === activeSection) {
                orbGroup.userData.targetScale = 1.4;
            }

            // Subtle float
            const basePos = orbGroup.userData.basePosition;
            if (basePos) {
                orbGroup.position.y = basePos.y + Math.sin(time * 1.2 + i * 1.5) * 0.1;
            }
        });
    }

    // Pulsing core light
    const coreLight = core.children.find(c => c.type === 'PointLight' && c.color.getHex() === 0xff6600);
    if (coreLight) {
        coreLight.intensity = 2 + Math.sin(time * 3) * 0.5;
    }
}
