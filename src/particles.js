/**
 * ============================================
 * PARTICLES - Magical Fireflies
 * ============================================
 * 
 * LEARNING: Particle Systems
 * 
 * Particles are tiny points that create atmosphere.
 * We animate them in a swirling pattern around the tree.
 */

import * as THREE from 'three';

/**
 * Create firefly particles that orbit the tree
 */
export function createParticles(count = 80) {
    const particles = new THREE.Group();
    particles.name = 'particles';

    // Store particle data for animation
    particles.userData.particleData = [];

    for (let i = 0; i < count; i++) {
        // Random starting position in a cylinder around tree
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 3;
        const height = 1 + Math.random() * 6;

        // Create glowing sphere
        const size = 0.03 + Math.random() * 0.05;
        const geo = new THREE.SphereGeometry(size, 6, 6);

        // Warm golden color with slight variation
        const hue = 0.12 + Math.random() * 0.05; // Gold range
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.4
        });

        const particle = new THREE.Mesh(geo, mat);
        particle.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        particles.add(particle);

        // Store animation data
        particles.userData.particleData.push({
            mesh: particle,
            angle: angle,
            radius: radius,
            height: height,
            speed: 0.2 + Math.random() * 0.3,
            verticalSpeed: 0.5 + Math.random() * 0.5,
            verticalOffset: Math.random() * Math.PI * 2,
            flickerSpeed: 2 + Math.random() * 3,
            flickerOffset: Math.random() * Math.PI * 2
        });
    }

    console.log('✨ Particles created:', count);
    return particles;
}

/**
 * Animate particles (call each frame)
 */
export function animateParticles(particles, time) {
    if (!particles || !particles.userData.particleData) return;

    particles.userData.particleData.forEach(data => {
        // Orbit around tree
        data.angle += data.speed * 0.01;

        // Gentle vertical bobbing
        const verticalOffset = Math.sin(time * data.verticalSpeed + data.verticalOffset) * 0.3;

        // Update position
        data.mesh.position.x = Math.cos(data.angle) * data.radius;
        data.mesh.position.z = Math.sin(data.angle) * data.radius;
        data.mesh.position.y = data.height + verticalOffset;

        // Flicker opacity
        data.mesh.material.opacity = 0.3 + Math.sin(time * data.flickerSpeed + data.flickerOffset) * 0.3;
    });
}
