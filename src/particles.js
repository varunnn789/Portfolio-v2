/**
 * ============================================
 * PARTICLES - Orbiting Around Core
 * ============================================
 * 
 * Particles orbit tightly around the central core,
 * not scattered across the scene.
 */

import * as THREE from 'three';

/**
 * Create particles that orbit the core
 */
export function createParticles(count = 60) {
    const particles = new THREE.Group();
    particles.name = 'particles';

    particles.userData.particleData = [];

    for (let i = 0; i < count; i++) {
        // Start in tight orbit around core center
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 4; // Orbit radius 2-6
        const height = (Math.random() - 0.5) * 6; // Vertical spread

        const size = 0.02 + Math.random() * 0.04;
        const geo = new THREE.SphereGeometry(size, 4, 4);

        // Cyberpunk colors
        const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xff6600, 0xffff00];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.4
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
            speed: 0.1 + Math.random() * 0.2, // Orbit speed
            verticalSpeed: 0.3 + Math.random() * 0.5,
            verticalOffset: Math.random() * Math.PI * 2
        });
    }

    console.log('✨ Orbiting particles created:', count);
    return particles;
}

/**
 * Animate particles orbiting around core
 */
export function animateParticles(particles, time, corePosition = { x: -2, y: 4, z: 0 }) {
    if (!particles || !particles.userData.particleData) return;

    particles.userData.particleData.forEach(data => {
        // Orbit around core position
        data.angle += data.speed * 0.015;

        // Gentle vertical wave
        const verticalOffset = Math.sin(time * data.verticalSpeed + data.verticalOffset) * 0.5;

        // Update position relative to core
        data.mesh.position.x = corePosition.x + Math.cos(data.angle) * data.radius;
        data.mesh.position.z = corePosition.z + Math.sin(data.angle) * data.radius;
        data.mesh.position.y = corePosition.y + data.baseHeight + verticalOffset;

        // Pulse opacity
        data.mesh.material.opacity = 0.3 + Math.sin(time * 2 + data.angle) * 0.2;
    });
}
