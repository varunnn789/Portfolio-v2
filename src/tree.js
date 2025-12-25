/**
 * ============================================
 * FAIRY TREE - Magical 3D Tree
 * ============================================
 * 
 * LEARNING: Procedural Geometry
 * 
 * We create organic-looking shapes by:
 * 1. Using curves (CatmullRomCurve3) for branches
 * 2. Layering spheres for foliage
 * 3. Adding glow with emissive materials
 * 4. Animating subtly for a living feel
 */

import * as THREE from 'three';

/**
 * Create the trunk using a tapered cylinder
 */
function createTrunk() {
    const group = new THREE.Group();

    // Main trunk - tapered
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.6, 4, 12, 1, false);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.9,
        metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    group.add(trunk);

    // Root bumps at base
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const rootGeo = new THREE.SphereGeometry(0.25, 8, 6);
        const root = new THREE.Mesh(rootGeo, trunkMat);
        root.position.set(
            Math.cos(angle) * 0.5,
            0.1,
            Math.sin(angle) * 0.5
        );
        root.scale.set(1, 0.5, 1);
        group.add(root);
    }

    return group;
}

/**
 * Create branches using curves
 */
function createBranches() {
    const group = new THREE.Group();

    const branchMat = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.85
    });

    // Create several branches at different angles
    const branchConfigs = [
        { angle: 0, tilt: 0.4, length: 2.5 },
        { angle: Math.PI * 0.4, tilt: 0.5, length: 2.2 },
        { angle: Math.PI * 0.8, tilt: 0.35, length: 2.8 },
        { angle: Math.PI * 1.2, tilt: 0.45, length: 2.4 },
        { angle: Math.PI * 1.6, tilt: 0.5, length: 2.6 }
    ];

    branchConfigs.forEach(config => {
        const branchGeo = new THREE.CylinderGeometry(0.05, 0.15, config.length, 6);
        const branch = new THREE.Mesh(branchGeo, branchMat);

        // Position at top of trunk
        branch.position.y = 3.5;
        branch.position.x = Math.cos(config.angle) * 0.2;
        branch.position.z = Math.sin(config.angle) * 0.2;

        // Tilt outward
        branch.rotation.z = config.tilt * Math.cos(config.angle);
        branch.rotation.x = config.tilt * Math.sin(config.angle);

        // Offset pivot to base
        branch.geometry.translate(0, config.length / 2, 0);

        group.add(branch);
    });

    return group;
}

/**
 * Create foliage - layered spheres with glow
 */
function createFoliage() {
    const group = new THREE.Group();

    // Leaf colors - sage to gold gradient
    const leafColors = [0x7d9a6a, 0x8fae7b, 0xa8c686, 0xc4d89a, 0xd4af37];

    // Create multiple foliage clusters
    const clusters = [
        { x: 0, y: 5.5, z: 0, size: 1.8 },
        { x: -1.2, y: 4.8, z: 0.5, size: 1.2 },
        { x: 1.0, y: 5.0, z: -0.5, size: 1.3 },
        { x: 0.5, y: 4.5, z: 1.0, size: 1.0 },
        { x: -0.8, y: 5.2, z: -0.8, size: 1.1 },
        { x: 0, y: 6.2, z: 0, size: 1.0 },
        { x: 1.5, y: 4.2, z: 0.3, size: 0.9 },
        { x: -1.5, y: 4.3, z: -0.3, size: 0.95 }
    ];

    clusters.forEach((cluster, i) => {
        const color = leafColors[i % leafColors.length];

        // Main sphere
        const sphereGeo = new THREE.SphereGeometry(cluster.size, 16, 12);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.1,
            emissive: color,
            emissiveIntensity: 0.05
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(cluster.x, cluster.y, cluster.z);

        // Slightly squash for organic look
        sphere.scale.y = 0.7 + Math.random() * 0.3;

        group.add(sphere);
    });

    return group;
}

/**
 * Create inner glow light
 */
function createInnerGlow() {
    const group = new THREE.Group();

    // Central warm glow
    const glowLight = new THREE.PointLight(0xffd700, 0.8, 8);
    glowLight.position.set(0, 5, 0);
    group.add(glowLight);

    // Secondary softer glow
    const glow2 = new THREE.PointLight(0xffecb3, 0.4, 6);
    glow2.position.set(0, 4, 0);
    group.add(glow2);

    // Visible glow sphere
    const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.6
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    glowSphere.position.set(0, 5, 0);
    group.add(glowSphere);

    return group;
}

/**
 * Create the complete fairy tree
 */
export function createFairyTree() {
    const tree = new THREE.Group();
    tree.name = 'fairyTree';

    // Add all components
    tree.add(createTrunk());
    tree.add(createBranches());
    tree.add(createFoliage());
    tree.add(createInnerGlow());

    // Store references for animation
    tree.userData = {
        baseRotation: 0,
        swayAmount: 0.02,
        swaySpeed: 0.5
    };

    console.log('🌳 Fairy tree created');
    return tree;
}

/**
 * Animate the tree (call each frame)
 */
export function animateTree(tree, time) {
    if (!tree) return;

    // Gentle sway
    tree.rotation.z = Math.sin(time * tree.userData.swaySpeed) * tree.userData.swayAmount;
    tree.rotation.x = Math.cos(time * tree.userData.swaySpeed * 0.7) * tree.userData.swayAmount * 0.5;

    // Pulse the inner glow
    const glowLight = tree.getObjectByProperty('type', 'PointLight');
    if (glowLight) {
        glowLight.intensity = 0.8 + Math.sin(time * 2) * 0.2;
    }
}
