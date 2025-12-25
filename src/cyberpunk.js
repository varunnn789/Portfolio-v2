/**
 * ============================================
 * CYBERPUNK CORE - Interactive Vertex Orbs
 * ============================================
 * 
 * LEARNING: Interactive 3D Elements
 * 
 * The central structure now has clickable orbs
 * at vertices that trigger section switches.
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
 * Create the central cyberpunk structure with interactive vertex orbs
 */
export function createCyberpunkCore() {
    const group = new THREE.Group();
    group.name = 'cyberpunkCore';

    // ============================================
    // OUTER CAGE - Rotating wireframe
    // ============================================
    const outerGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const outerMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const outerCage = new THREE.Mesh(outerGeo, outerMat);
    outerCage.name = 'outerCage';
    group.add(outerCage);

    // ============================================
    // MIDDLE RINGS
    // ============================================
    const torusGeo = new THREE.TorusGeometry(2.2, 0.06, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.4,
        metalness: 0.8,
        roughness: 0.2
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2;
    torus.name = 'middleRing';
    group.add(torus);

    const torus2 = new THREE.Mesh(torusGeo.clone(), torusMat.clone());
    torus2.material.color.setHex(0x00ffff);
    torus2.material.emissive.setHex(0x00ffff);
    torus2.rotation.x = Math.PI / 3;
    torus2.rotation.y = Math.PI / 4;
    torus2.name = 'middleRing2';
    group.add(torus2);

    // ============================================
    // INNER CORE
    // ============================================
    const coreGeo = new THREE.OctahedronGeometry(0.8, 0);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.name = 'innerCore';
    group.add(core);

    // ============================================
    // INTERACTIVE VERTEX ORBS - One per section
    // ============================================
    const vertexOrbs = new THREE.Group();
    vertexOrbs.name = 'vertexOrbs';

    const sections = ['about', 'skills', 'projects', 'experience', 'contact'];
    const orbPositions = [
        new THREE.Vector3(0, 3.5, 0),      // Top - About
        new THREE.Vector3(2.5, 1, 2),      // Right front - Skills
        new THREE.Vector3(-2.5, 1, 2),     // Left front - Projects
        new THREE.Vector3(2.5, 1, -2),     // Right back - Experience
        new THREE.Vector3(-2.5, 1, -2)     // Left back - Contact
    ];

    sections.forEach((section, i) => {
        const orbGroup = new THREE.Group();
        orbGroup.name = `orb_${section}`;

        // Main orb
        const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const orbMat = new THREE.MeshStandardMaterial({
            color: SECTION_COLORS[section],
            emissive: SECTION_COLORS[section],
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orbGroup.add(orb);

        // Outer ring around orb
        const ringGeo = new THREE.TorusGeometry(0.35, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: SECTION_COLORS[section],
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.name = 'orbRing';
        orbGroup.add(ring);

        // Position
        orbGroup.position.copy(orbPositions[i]);

        // Store section data for click detection
        orbGroup.userData = {
            type: 'sectionOrb',
            section: section,
            baseScale: 1,
            targetScale: 1,
            baseEmissive: 0.5
        };

        vertexOrbs.add(orbGroup);
    });

    group.add(vertexOrbs);

    // ============================================
    // CONNECTING LINES - From core to orbs
    // ============================================
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x444466,
        transparent: true,
        opacity: 0.3
    });

    orbPositions.forEach(pos => {
        const points = [new THREE.Vector3(0, 0, 0), pos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    });

    // ============================================
    // POINT LIGHTS
    // ============================================
    const coreLight = new THREE.PointLight(0xff6600, 1.5, 10);
    group.add(coreLight);

    const accentLight1 = new THREE.PointLight(0x00ffff, 0.5, 8);
    accentLight1.position.set(3, 2, 0);
    group.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff00ff, 0.5, 8);
    accentLight2.position.set(-3, -1, 2);
    group.add(accentLight2);

    // Position whole structure
    group.position.y = 4;

    console.log('🔷 Cyberpunk core with vertex orbs created');
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

    orb.userData.targetScale = highlight ? 1.3 : 1;

    const ring = orb.getObjectByName('orbRing');
    if (ring) {
        ring.material.opacity = highlight ? 0.9 : 0.5;
    }

    // Increase emissive on hover
    orb.children.forEach(child => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = highlight ? 1 : 0.5;
        }
    });
}

/**
 * Animate the cyberpunk core (call each frame)
 */
export function animateCyberpunkCore(core, time, activeSection = null) {
    if (!core) return;

    // Outer cage - slow rotation
    const outerCage = core.getObjectByName('outerCage');
    if (outerCage) {
        outerCage.rotation.x = time * 0.08;
        outerCage.rotation.y = time * 0.12;
    }

    // Middle rings
    const ring1 = core.getObjectByName('middleRing');
    const ring2 = core.getObjectByName('middleRing2');
    if (ring1) ring1.rotation.z = time * 0.2;
    if (ring2) ring2.rotation.z = -time * 0.18;

    // Inner core - pulsing
    const innerCore = core.getObjectByName('innerCore');
    if (innerCore) {
        innerCore.rotation.x = time * 0.4;
        innerCore.rotation.y = time * 0.5;
        const pulse = 1 + Math.sin(time * 2) * 0.08;
        innerCore.scale.setScalar(pulse);
    }

    // Vertex orbs - rotate rings and animate scale
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach((orbGroup, i) => {
            // Rotate the ring
            const ring = orbGroup.getObjectByName('orbRing');
            if (ring) {
                ring.rotation.x = time * 1.5;
                ring.rotation.y = time * 0.8;
            }

            // Smooth scale transition
            const currentScale = orbGroup.scale.x;
            const targetScale = orbGroup.userData.targetScale;
            orbGroup.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);

            // Highlight active section orb
            if (activeSection && orbGroup.userData.section === activeSection) {
                orbGroup.userData.targetScale = 1.2;
            }

            // Gentle float
            orbGroup.position.y = orbGroup.position.y + Math.sin(time * 1.5 + i) * 0.002;
        });
    }

    // Pulsing core light
    const lights = core.children.filter(c => c.type === 'PointLight');
    if (lights[0]) {
        lights[0].intensity = 1.5 + Math.sin(time * 3) * 0.5;
    }
}
