/**
 * ============================================
 * MAIN - Fairy Tree Portfolio
 * ============================================
 * 
 * LEARNING: Scene Composition
 * 
 * This file brings everything together:
 * 1. Scene setup (camera, lights, renderer)
 * 2. Tree and particles
 * 3. Navigation and section switching
 * 4. Animations
 */

import * as THREE from 'three';
import { createFairyTree, animateTree } from './tree.js';
import { createParticles, animateParticles } from './particles.js';
import { sections } from './data.js';

// ============================================
// SCENE SETUP
// ============================================

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();

// Twilight gradient background
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.04);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 4, 10);
camera.lookAt(0, 4, 0);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// ============================================
// LIGHTING
// ============================================

// Ambient - soft blue twilight
const ambient = new THREE.AmbientLight(0x4a5568, 0.4);
scene.add(ambient);

// Moon light from above/behind
const moonLight = new THREE.DirectionalLight(0xc4d4e0, 0.6);
moonLight.position.set(-5, 15, -5);
scene.add(moonLight);

// Warm fill from front
const warmFill = new THREE.DirectionalLight(0xffecd2, 0.3);
warmFill.position.set(5, 5, 10);
scene.add(warmFill);

// ============================================
// GROUND
// ============================================

const groundGeo = new THREE.CircleGeometry(15, 64);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2d3436,
    roughness: 1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grass ring around tree
const grassGeo = new THREE.RingGeometry(0.8, 3, 32);
const grassMat = new THREE.MeshStandardMaterial({
    color: 0x4a5d4a,
    roughness: 0.9
});
const grass = new THREE.Mesh(grassGeo, grassMat);
grass.rotation.x = -Math.PI / 2;
grass.position.y = 0.01;
scene.add(grass);

// ============================================
// TREE & PARTICLES
// ============================================

const tree = createFairyTree();
scene.add(tree);

const particles = createParticles(60);
scene.add(particles);

// ============================================
// CAMERA POSITIONS FOR SECTIONS
// ============================================

const cameraPositions = {
    about: { pos: new THREE.Vector3(0, 3, 9), lookAt: new THREE.Vector3(0, 3, 0) },
    skills: { pos: new THREE.Vector3(4, 5, 7), lookAt: new THREE.Vector3(0, 4.5, 0) },
    projects: { pos: new THREE.Vector3(-4, 4, 8), lookAt: new THREE.Vector3(0, 4, 0) },
    experience: { pos: new THREE.Vector3(0, 2, 8), lookAt: new THREE.Vector3(0, 2.5, 0) },
    contact: { pos: new THREE.Vector3(0, 5, 10), lookAt: new THREE.Vector3(0, 4, 0) }
};

let currentSection = 'about';
let targetCameraPos = cameraPositions.about.pos.clone();
let targetLookAt = cameraPositions.about.lookAt.clone();
let currentLookAt = new THREE.Vector3(0, 4, 0);

// ============================================
// NAVIGATION
// ============================================

const navButtons = document.querySelectorAll('.nav-btn');
const contentPanel = document.getElementById('content');
const sectionTitle = document.getElementById('section-title');
const sectionContent = document.getElementById('section-content');

function switchSection(sectionId) {
    if (!sections[sectionId]) return;

    currentSection = sectionId;

    // Update content panel
    sectionTitle.textContent = sections[sectionId].title;
    sectionContent.innerHTML = sections[sectionId].content;

    // Update nav active state
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // Update camera target
    if (cameraPositions[sectionId]) {
        targetCameraPos = cameraPositions[sectionId].pos.clone();
        targetLookAt = cameraPositions[sectionId].lookAt.clone();
    }

    // Animate content in
    contentPanel.classList.add('transitioning');
    setTimeout(() => contentPanel.classList.remove('transitioning'), 300);

    console.log('📍 Switched to:', sectionId);
}

// Setup nav click handlers
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchSection(btn.dataset.section);
    });
});

// Initialize with About section
switchSection('about');

// ============================================
// ANIMATION LOOP
// ============================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Animate tree
    animateTree(tree, time);

    // Animate particles
    animateParticles(particles, time);

    // Smooth camera movement
    camera.position.lerp(targetCameraPos, 0.02);
    currentLookAt.lerp(targetLookAt, 0.02);
    camera.lookAt(currentLookAt);

    renderer.render(scene, camera);
}

// ============================================
// RESIZE
// ============================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================
// START
// ============================================

// Hide loading
setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 500);
    }
}, 500);

animate();

console.log('🌟 Fairy Tree Portfolio loaded');
