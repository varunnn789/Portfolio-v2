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
        focusedOrb: null,
        // Ring speed burst
        ringSpeedMultiplier: 1,
        targetRingSpeed: 1
    };

    // (Inner core removed - sun shader now provides the visual center)

    // ============================================
    // ENERGY PULSE RINGS (for expansion effect)
    // ============================================

    const pulseRings = new THREE.Group();
    pulseRings.name = 'pulseRings';

    // Create pool of 3 pulse rings (reusable)
    for (let i = 0; i < 3; i++) {
        const pulseGeo = new THREE.TorusGeometry(1, 0.08, 8, 64);
        const pulseMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
        pulseRing.rotation.x = Math.PI / 2;
        pulseRing.name = `pulseRing_${i}`;
        pulseRing.userData = {
            active: false,
            startTime: 0,
            duration: 1.5, // seconds
            color: 0x00ffff
        };
        pulseRings.add(pulseRing);
    }

    group.add(pulseRings);

    // (Orbital rings and wireframe shells removed for cleaner planet look)

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

        // ==========================================
        // PLANET BODY - Larger sphere
        // ==========================================

        const planetRadius = 0.8;
        const orbGeo = new THREE.SphereGeometry(planetRadius, 32, 32);
        const orbMat = new THREE.MeshStandardMaterial({
            color: SECTION_COLORS[section],
            emissive: SECTION_COLORS[section],
            emissiveIntensity: 0.4,
            metalness: 0.2,
            roughness: 0.6
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.name = 'sphere';
        orbGroup.add(orb);

        // ==========================================
        // ATMOSPHERE GLOW - Fresnel-like effect
        // ==========================================

        const atmosGeo = new THREE.SphereGeometry(planetRadius * 1.15, 32, 32);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: SECTION_COLORS[section],
            transparent: true,
            opacity: 0.25,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        atmosphere.name = 'atmosphere';
        orbGroup.add(atmosphere);

        // Outer glow
        const glowGeo = new THREE.SphereGeometry(planetRadius * 1.4, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: SECTION_COLORS[section],
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.name = 'glow';
        orbGroup.add(glow);

        // Light
        const light = new THREE.PointLight(SECTION_COLORS[section], 0.8, 6);
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

    // (Connecting lines removed for cleaner look)

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
 * Also applies spotlight effect - dims other orbs, brightens focused one
 * @param skipExpansion - If true, don't expand the core (useful for custom camera views)
 */
export function expandToOrb(core, orb, time = performance.now() / 1000, skipExpansion = false) {
    if (!core || !orb) return null;

    core.userData.isExpanded = true;
    // Only expand if not skipped
    core.userData.targetScale = skipExpansion ? 1 : 3;
    core.userData.focusedOrb = orb;
    core.userData.targetRingSpeed = skipExpansion ? 1 : 5; // No speed burst if skipping

    // SPOTLIGHT EFFECT: Dim all orbs except the focused one
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach(orbGroup => {
            const isFocused = orbGroup === orb;

            orbGroup.children.forEach(child => {
                if (child.name === 'sphere') {
                    // Focused orb glows bright, others dim
                    child.material.emissiveIntensity = isFocused ? 2.0 : 0.2;
                    child.material.opacity = isFocused ? 1 : 0.3;
                }
                if (child.name === 'ring') {
                    child.material.opacity = isFocused ? 1 : 0.15;
                }
                if (child.type === 'PointLight') {
                    child.intensity = isFocused ? 2 : 0.1;
                }
                if (child.name === 'moon') {
                    child.visible = isFocused;
                }
            });

            // Mark for animation
            orbGroup.userData.isFocused = isFocused;
        });
    }

    // TRIGGER ENERGY PULSE (always, even when not expanding)
    triggerEnergyPulse(core, SECTION_COLORS[orb.userData.section] || 0x00ffff, time);

    // Get the orb's position in world space
    const worldPos = new THREE.Vector3();
    orb.getWorldPosition(worldPos);

    console.log('🎯 Focusing orb:', orb.userData.section, skipExpansion ? '(custom camera)' : '(expand + spotlight)');

    return worldPos;
}

/**
 * Collapse back to normal view
 * Resets all orbs to normal state
 */
export function collapseCore(core) {
    if (!core) return;

    core.userData.isExpanded = false;
    core.userData.targetScale = 1;
    core.userData.focusedOrb = null;
    core.userData.targetRingSpeed = 1; // Reset ring speed

    // RESET SPOTLIGHT: Restore all orbs to normal
    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach(orbGroup => {
            orbGroup.children.forEach(child => {
                if (child.name === 'sphere') {
                    child.material.emissiveIntensity = 0.9;
                    child.material.opacity = 1;
                }
                if (child.name === 'ring') {
                    child.material.opacity = 0.6;
                }
                if (child.type === 'PointLight') {
                    child.intensity = 0.5;
                }
                if (child.name === 'moon') {
                    child.visible = true;
                }
            });

            orbGroup.userData.isFocused = false;
        });
    }

    console.log('📦 Collapsing core, spotlight off');
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
    // Animate planets - slow rotation
    // ============================================

    const vertexOrbs = core.getObjectByName('vertexOrbs');
    if (vertexOrbs) {
        vertexOrbs.children.forEach((orbGroup, i) => {
            // Slow planet rotation
            const sphere = orbGroup.getObjectByName('sphere');
            if (sphere) {
                sphere.rotation.y = time * (0.1 + i * 0.02);
            }

            // Subtle atmosphere pulse
            const atmosphere = orbGroup.getObjectByName('atmosphere');
            if (atmosphere) {
                const pulse = 1 + Math.sin(time * 1.5 + i) * 0.02;
                atmosphere.scale.setScalar(pulse);
            }
        });
    }

    // ============================================
    // ENERGY PULSE RINGS ANIMATION
    // ============================================

    const pulseRings = core.getObjectByName('pulseRings');
    if (pulseRings) {
        pulseRings.children.forEach(ring => {
            if (!ring.userData.active) return;

            const elapsed = time - ring.userData.startTime;
            const progress = elapsed / ring.userData.duration;

            if (progress >= 1) {
                // Reset ring
                ring.userData.active = false;
                ring.material.opacity = 0;
                ring.scale.setScalar(1);
            } else {
                // Ease-out: fast start, slow end
                const eased = 1 - Math.pow(1 - progress, 3);

                // Expand from 1 to 12
                const scale = 1 + eased * 11;
                ring.scale.setScalar(scale);

                // Fade out
                ring.material.opacity = (1 - progress) * 0.8;
            }
        });
    }
}

// Global time tracker for pulse triggering
let globalAnimTime = 0;

/**
 * Trigger an energy pulse from the core
 */
function triggerEnergyPulse(core, color, time) {
    const pulseRings = core.getObjectByName('pulseRings');
    if (!pulseRings) return;

    // Find an inactive ring
    const availableRing = pulseRings.children.find(r => !r.userData.active);
    if (availableRing) {
        availableRing.userData.active = true;
        availableRing.userData.startTime = time;
        availableRing.userData.color = color;
        availableRing.material.color.setHex(color);
        availableRing.scale.setScalar(1);
        console.log('💫 Energy pulse triggered');
    }
}
