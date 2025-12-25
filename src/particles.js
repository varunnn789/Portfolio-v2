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
