/**
 * ============================================
 * SPACEY CYBERPUNK CORE
 * ============================================
 * 
 * When orb is clicked:
 * - ENTIRE structure expands to fill screen
 * - Camera rotates to focus on clicked orb
 * 
 * Structure:
 * - Small central core
 * - 2 orbital rings (only 2!)
 * - Wireframe shells
 * - 5 distributed orbs
 */

import * as THREE from 'three';

const SECTION_COLORS = {
    about: 0x00ffff,
    skills: 0xff00ff,
    projects: 0x00ff88,
    experience: 0xff6600,
    contact: 0xffff00
};

const SECTION_LABELS = {
    about: 'ABOUT',
    skills: 'SKILLS',
    projects: 'PROJECTS',
    experience: 'EXPERIENCE',
    contact: 'CONTACT'
};

/**
 * Distributed vertex positions using Fibonacci sphere
 */
function getDistributedPositions(count, radius) {
    const positions = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < count; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);

        const x = Math.cos(theta) * Math.sin(phi) * radius;
        const y = Math.cos(phi) * radius;
        const z = Math.sin(theta) * Math.sin(phi) * radius;

        positions.push(new THREE.Vector3(x, y, z));
    }

    return positions;
}

/**
 * Create the spacey cyberpunk core
 */
export function createCyberpunkCore() {
    const group = new THREE.Group();
    group.name = 'cyberpunkCore';

    const outerRadius = 6;

    // Store base scale for expansion
    group.userData = {
        baseScale: 1,
        currentScale: 1,
        targetScale: 1,
        isExpanded: false,
        focusedOrb: null
    };

    // ============================================
    // INNER CORE - Smaller
    // ============================================

    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff6600,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.95
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.name = 'innerCore';
    group.add(core);

    // Core glow
    const glowGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.name = 'coreGlow';
    group.add(glow);

    // ============================================
    // ONLY 2 ORBITAL RINGS
    // ============================================

    // Ring 1 - Horizontal
    const ring1Geo = new THREE.TorusGeometry(3.5, 0.02, 8, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2;
    ring1.name = 'orbitalRing1';
    group.add(ring1);

    // Ring 2 - Tilted
    const ring2Geo = new THREE.TorusGeometry(4.5, 0.018, 8, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.25
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    ring2.name = 'orbitalRing2';
    group.add(ring2);

    // ============================================
    // WIREFRAME SHELLS
    // ============================================

    const shell1Geo = new THREE.IcosahedronGeometry(outerRadius, 1);
    const shell1Edges = new THREE.EdgesGeometry(shell1Geo);
    const shell1Mat = new THREE.LineBasicMaterial({
        color: 0x00aaaa,
        transparent: true,
        opacity: 0.25
    });
    const shell1 = new THREE.LineSegments(shell1Edges, shell1Mat);
    shell1.name = 'shell1';
    group.add(shell1);

    const shell2Geo = new THREE.IcosahedronGeometry(outerRadius * 0.7, 1);
    const shell2Edges = new THREE.EdgesGeometry(shell2Geo);
    const shell2Mat = new THREE.LineBasicMaterial({
        color: 0xaa00aa,
        transparent: true,
        opacity: 0.2
    });
    const shell2 = new THREE.LineSegments(shell2Edges, shell2Mat);
    shell2.name = 'shell2';
    group.add(shell2);

    // ============================================
    // VERTEX ORBS - Distributed
    // ============================================

    const vertexOrbs = new THREE.Group();
    vertexOrbs.name = 'vertexOrbs';

    const sections = ['about', 'skills', 'projects', 'experience', 'contact'];
    const orbPositions = getDistributedPositions(5, outerRadius);

    sections.forEach((section, i) => {
        const orbGroup = new THREE.Group();
        orbGroup.name = `orb_${section}`;

        // Planet sphere
        const orbGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const orbMat = new THREE.MeshStandardMaterial({
            color: SECTION_COLORS[section],
            emissive: SECTION_COLORS[section],
            emissiveIntensity: 0.9,
            metalness: 0.3,
            roughness: 0.3
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.name = 'sphere';
        orbGroup.add(orb);

        // Ring
        const ringGeo = new THREE.TorusGeometry(0.55, 0.02, 8, 48);
        const ringMat = new THREE.MeshBasicMaterial({
            color: SECTION_COLORS[section],
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        ring.name = 'ring';
        orbGroup.add(ring);

        // Moon
        const moonGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(0.55, 0, 0);
        moon.name = 'moon';
        orbGroup.add(moon);

        // Light
        const light = new THREE.PointLight(SECTION_COLORS[section], 0.5, 5);
        orbGroup.add(light);

        orbGroup.position.copy(orbPositions[i]);

        orbGroup.userData = {
            type: 'sectionOrb',
            section: section,
            label: SECTION_LABELS[section],
            worldPosition: orbPositions[i].clone()
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
        opacity: 0.25
    });

    orbPositions.forEach(pos => {
        const points = [new THREE.Vector3(0, 0, 0), pos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    });

    // Core light
    const coreLight = new THREE.PointLight(0xff6600, 2.5, 20);
    group.add(coreLight);

    console.log('🚀 Spacey cyberpunk core created');
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
 * Highlight orb on hover
 */
export function highlightOrb(orb, highlight = true) {
    if (!orb) return;

    orb.children.forEach(child => {
        if (child.name === 'ring') {
            child.material.opacity = highlight ? 0.9 : 0.6;
        }
        if (child.type === 'PointLight') {
            child.intensity = highlight ? 1 : 0.5;
        }
        if (child.name === 'sphere') {
            child.material.emissiveIntensity = highlight ? 1.3 : 0.9;
        }
    });
}

/**
 * EXPAND the entire structure and focus on an orb
 * Returns the world position of the clicked orb for camera targeting
 */
export function expandToOrb(core, orb) {
    if (!core || !orb) return null;

    core.userData.isExpanded = true;
    core.userData.targetScale = 3; // Expand 3x to fill screen
    core.userData.focusedOrb = orb;

    // Get the orb's position in world space
    const worldPos = new THREE.Vector3();
    orb.getWorldPosition(worldPos);

    console.log('🎯 Expanding to orb:', orb.userData.section, 'at', worldPos);

    return worldPos;
}

/**
 * Collapse back to normal view
 */
export function collapseCore(core) {
    if (!core) return;

    core.userData.isExpanded = false;
    core.userData.targetScale = 1;
    core.userData.focusedOrb = null;

    console.log('📦 Collapsing core');
}

/**
 * Animate core
 */
export function animateCyberpunkCore(core, time) {
    if (!core) return;

    // ============================================
    // SCALE ANIMATION - Expand/Collapse whole structure
    // ============================================

    const currentScale = core.userData.currentScale || 1;
    const targetScale = core.userData.targetScale || 1;
    const newScale = currentScale + (targetScale - currentScale) * 0.06;
    core.userData.currentScale = newScale;
    core.scale.setScalar(newScale);

    // ============================================
    // Rotate orbital rings
    // ============================================

    const ring1 = core.getObjectByName('orbitalRing1');
    const ring2 = core.getObjectByName('orbitalRing2');

    if (ring1) ring1.rotation.z = time * 0.1;
    if (ring2) ring2.rotation.z = -time * 0.08;

    // Rotate inner shell slowly
    const shell2 = core.getObjectByName('shell2');
    if (shell2) {
        shell2.rotation.x = time * 0.015;
        shell2.rotation.y = time * 0.012;
    }

    // ============================================
    // Inner core pulse
    // ============================================

    const innerCore = core.getObjectByName('innerCore');
    const coreGlow = core.getObjectByName('coreGlow');

    if (innerCore) {
        innerCore.rotation.x = time * 0.08;
        innerCore.rotation.y = time * 0.1;
        const pulse = 1 + Math.sin(time * 2) * 0.03;
        innerCore.scale.setScalar(pulse);
    }

    if (coreGlow) {
        coreGlow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.08);
        coreGlow.material.opacity = 0.08 + Math.sin(time * 2) * 0.03;
    }

    // ============================================
    // Animate orbs (ring spin, moon orbit)
    // ============================================

    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach((orbGroup, i) => {
            const ring = orbGroup.getObjectByName('ring');
            if (ring) ring.rotation.z = time * 0.4;

            const moon = orbGroup.getObjectByName('moon');
            if (moon) {
                const moonAngle = time * 1.5 + i * 1.2;
                moon.position.x = Math.cos(moonAngle) * 0.55;
                moon.position.z = Math.sin(moonAngle) * 0.55;
            }
        });
    }
}
