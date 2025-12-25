/**
 * ============================================
 * MAIN - Cyberpunk Portfolio
 * ============================================
 * 
 * LEARNING: Scene Composition
 * 
 * Dark cyberpunk aesthetic with:
 * - Central rotating 3D structure
 * - Floating particles
 * - Polished content panel on right
 * - Section navigation with camera movement
 */

import * as THREE from 'three';
import { createCyberpunkCore, animateCyberpunkCore } from './cyberpunk.js';
import { createParticles, animateParticles } from './particles.js';
import { sections } from './data.js';

// ============================================
// SCENE SETUP
// ============================================

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();

// Dark cyberpunk background
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 4, 12);
camera.lookAt(0, 4, 0);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ============================================
// LIGHTING
// ============================================

// Dim ambient
const ambient = new THREE.AmbientLight(0x222233, 0.3);
scene.add(ambient);

// Key light - cool blue
const keyLight = new THREE.DirectionalLight(0x4488ff, 0.4);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

// Rim light - magenta
const rimLight = new THREE.DirectionalLight(0xff00ff, 0.3);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

// ============================================
// GROUND - Subtle grid
// ============================================

const gridHelper = new THREE.GridHelper(30, 30, 0x222244, 0x111122);
gridHelper.material.opacity = 0.3;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Ground plane for fog effect
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x050508,
    roughness: 1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
scene.add(ground);

// ============================================
// CYBERPUNK CORE & PARTICLES
// ============================================

const core = createCyberpunkCore();
scene.add(core);

const particles = createParticles(100);
// Make particles more cyberpunk colored
particles.children.forEach(p => {
    const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xff6600];
    p.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
    p.material.opacity = 0.3 + Math.random() * 0.3;
});
scene.add(particles);

// ============================================
// CAMERA POSITIONS FOR SECTIONS
// ============================================

const cameraPositions = {
    about: { pos: new THREE.Vector3(0, 4, 12), lookAt: new THREE.Vector3(0, 4, 0) },
    skills: { pos: new THREE.Vector3(6, 5, 10), lookAt: new THREE.Vector3(0, 4, 0) },
    projects: { pos: new THREE.Vector3(-6, 4, 10), lookAt: new THREE.Vector3(0, 4, 0) },
    experience: { pos: new THREE.Vector3(0, 2, 10), lookAt: new THREE.Vector3(0, 3, 0) },
    contact: { pos: new THREE.Vector3(0, 6, 14), lookAt: new THREE.Vector3(0, 4, 0) }
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

    // Animate cyberpunk core
    animateCyberpunkCore(core, time);

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

console.log('🔮 Cyberpunk Portfolio loaded');
