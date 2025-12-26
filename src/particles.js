/**
 * ============================================
 * PARTICLES - Wider Orbit
 * ============================================
 */

import * as THREE from 'three';

export function createParticles(count = 80) {
    const particles = new THREE.Group();
    particles.name = 'particles';

    particles.userData.particleData = [];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // WIDER radius: 5-12 from center
        const radius = 5 + Math.random() * 7;
        const height = (Math.random() - 0.5) * 10;

        const size = 0.02 + Math.random() * 0.05;
        const geo = new THREE.SphereGeometry(size, 4, 4);

        const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xff6600, 0xffff00];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.25 + Math.random() * 0.35
        });

        const particle = new THREE.Mesh(geo, mat);
        particle.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        particles.add(particle);

        particles.userData.particleData.push({
            mesh: particle,
            angle: angle,
            radius: radius,
            baseHeight: height,
            speed: 0.05 + Math.random() * 0.1,
            verticalSpeed: 0.2 + Math.random() * 0.3,
            verticalOffset: Math.random() * Math.PI * 2
        });
    }

    console.log('✨ Wide-orbit particles created:', count);
    return particles;
}

export function animateParticles(particles, time, corePosition = { x: 0, y: 0, z: 0 }) {
    if (!particles || !particles.userData.particleData) return;

    particles.userData.particleData.forEach(data => {
        data.angle += data.speed * 0.01;

        const verticalOffset = Math.sin(time * data.verticalSpeed + data.verticalOffset) * 0.8;

        data.mesh.position.x = corePosition.x + Math.cos(data.angle) * data.radius;
        data.mesh.position.z = corePosition.z + Math.sin(data.angle) * data.radius;
        data.mesh.position.y = corePosition.y + data.baseHeight + verticalOffset;

        data.mesh.material.opacity = 0.2 + Math.sin(time * 1.5 + data.angle) * 0.15;
    });
}

/**
 * ============================================
 * ENERGY FLOW - Particles flowing from core to orbs
 * ============================================
 */

export function createEnergyFlow(orbPositions, count = 25) {
    const energyFlow = new THREE.Group();
    energyFlow.name = 'energyFlow';

    const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xff6600, 0xffff00];

    energyFlow.userData = {
        flowData: [],
        focusedOrbIndex: -1 // -1 means no focus, particles go to all orbs
    };

    for (let i = 0; i < count; i++) {
        const size = 0.04 + Math.random() * 0.06;
        const geo = new THREE.SphereGeometry(size, 6, 6);

        const orbIndex = i % orbPositions.length;
        const color = colors[orbIndex];

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });

        const particle = new THREE.Mesh(geo, mat);
        particle.name = `energyParticle_${i}`;
        energyFlow.add(particle);

        // Flow data for each particle
        energyFlow.userData.flowData.push({
            mesh: particle,
            orbIndex: orbIndex,
            progress: Math.random(), // 0 = at core, 1 = at orb
            speed: 0.3 + Math.random() * 0.4,
            curve: Math.random() * 0.5 + 0.3, // How much the path curves
            color: color
        });
    }

    console.log('⚡ Energy flow particles created:', count);
    return energyFlow;
}

export function animateEnergyFlow(energyFlow, orbPositions, time, focusedOrbIndex = -1) {
    if (!energyFlow || !energyFlow.userData.flowData) return;
    if (orbPositions.length === 0) return;

    energyFlow.userData.focusedOrbIndex = focusedOrbIndex;

    energyFlow.userData.flowData.forEach((data, i) => {
        // Advance progress
        data.progress += data.speed * 0.008;

        // Loop back to core when reaching orb
        if (data.progress >= 1) {
            data.progress = 0;

            // If focused, converge all particles to the focused orb
            if (focusedOrbIndex >= 0) {
                data.orbIndex = focusedOrbIndex;
            } else {
                // Otherwise, pick a random orb
                data.orbIndex = Math.floor(Math.random() * orbPositions.length);
            }
        }

        const targetIndex = data.orbIndex;
        const targetPos = orbPositions[targetIndex] || { x: 6, y: 0, z: 0 };

        // Ease-in-out progress for smoother movement
        const t = data.progress;
        const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Create curved path from core (0,0,0) to orb
        // Use a bezier-like curve with a control point offset
        const controlPointOffset = data.curve * 3;

        // Perpendicular direction for curve
        const perpX = -targetPos.z;
        const perpZ = targetPos.x;
        const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
        const normPerpX = (perpX / perpLen) * controlPointOffset;
        const normPerpZ = (perpZ / perpLen) * controlPointOffset;

        // Quadratic bezier interpolation
        const oneMinusT = 1 - easedT;
        const midX = normPerpX + targetPos.x * 0.5;
        const midY = data.curve * 2; // Lift in the middle
        const midZ = normPerpZ + targetPos.z * 0.5;

        // Position = (1-t)²*P0 + 2*(1-t)*t*P1 + t²*P2
        const x = oneMinusT * oneMinusT * 0 + 2 * oneMinusT * easedT * midX + easedT * easedT * targetPos.x;
        const y = oneMinusT * oneMinusT * 0 + 2 * oneMinusT * easedT * midY + easedT * easedT * targetPos.y;
        const z = oneMinusT * oneMinusT * 0 + 2 * oneMinusT * easedT * midZ + easedT * easedT * targetPos.z;

        data.mesh.position.set(x, y, z);

        // Fade in at start, out at end
        let opacity = 0.7;
        if (t < 0.1) opacity = t * 7;
        if (t > 0.9) opacity = (1 - t) * 7;
        data.mesh.material.opacity = opacity;

        // Pulse size
        const pulse = 1 + Math.sin(time * 5 + i) * 0.2;
        data.mesh.scale.setScalar(pulse);
    });
}
