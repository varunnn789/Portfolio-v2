/**
 * ============================================
 * MAIN - Interactive Cyberpunk Portfolio
 * ============================================
 * 
 * Click the glowing orbs to navigate sections.
 * Each orb triggers dramatic camera movement.
 */

import * as THREE from 'three';
import { createCyberpunkCore, animateCyberpunkCore, getInteractiveOrbs, highlightOrb } from './cyberpunk.js';
import { createParticles, animateParticles } from './particles.js';
import { AudioManager } from './audio.js';
import { sections } from './data.js';

// ============================================
// SCENE SETUP
// ============================================

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.025);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(-3, 5, 14);
camera.lookAt(-2, 4, 0);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ============================================
// AUDIO
// ============================================

const audio = new AudioManager();

// Initialize audio on first click
canvas.addEventListener('click', () => audio.init(), { once: true });

// ============================================
// LIGHTING
// ============================================

const ambient = new THREE.AmbientLight(0x222233, 0.3);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0x4488ff, 0.4);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xff00ff, 0.3);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

// ============================================
// GROUND
// ============================================

const gridHelper = new THREE.GridHelper(30, 30, 0x222244, 0x111122);
gridHelper.material.opacity = 0.3;
gridHelper.material.transparent = true;
scene.add(gridHelper);

const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
scene.add(ground);

// ============================================
// CYBERPUNK CORE & PARTICLES
// ============================================

const core = createCyberpunkCore();
scene.add(core);

const particles = createParticles(80);
scene.add(particles);

// ============================================
// RAYCASTER FOR ORB INTERACTION
// ============================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredOrb = null;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

canvas.addEventListener('click', () => {
    if (hoveredOrb && hoveredOrb.userData.section) {
        switchSection(hoveredOrb.userData.section);
        audio.playClick();
    }
});

function updateRaycast() {
    raycaster.setFromCamera(mouse, camera);

    const orbs = getInteractiveOrbs(core);
    const intersects = raycaster.intersectObjects(orbs, true);

    if (intersects.length > 0) {
        // Find the parent orb group
        let target = intersects[0].object;
        while (target && !target.userData.section) {
            target = target.parent;
        }

        if (target !== hoveredOrb) {
            // Unhighlight previous
            if (hoveredOrb) highlightOrb(hoveredOrb, false);

            // Highlight new
            hoveredOrb = target;
            highlightOrb(hoveredOrb, true);
            audio.playHover();

            canvas.style.cursor = 'pointer';
        }
    } else {
        if (hoveredOrb) {
            highlightOrb(hoveredOrb, false);
            hoveredOrb = null;
            canvas.style.cursor = 'default';
        }
    }
}

// ============================================
// CAMERA POSITIONS - More dramatic angles
// ============================================

const cameraPositions = {
    about: {
        pos: new THREE.Vector3(-3, 5, 14),
        lookAt: new THREE.Vector3(-2, 4, 0),
        coreRotation: 0
    },
    skills: {
        pos: new THREE.Vector3(5, 8, 10),
        lookAt: new THREE.Vector3(-2, 5, 0),
        coreRotation: Math.PI * 0.5
    },
    projects: {
        pos: new THREE.Vector3(-10, 3, 8),
        lookAt: new THREE.Vector3(-2, 4, 0),
        coreRotation: -Math.PI * 0.6
    },
    experience: {
        pos: new THREE.Vector3(2, 1, 12),
        lookAt: new THREE.Vector3(-2, 3, 0),
        coreRotation: Math.PI
    },
    contact: {
        pos: new THREE.Vector3(-6, 10, 12),
        lookAt: new THREE.Vector3(-2, 4, 0),
        coreRotation: -Math.PI * 0.3
    }
};

let currentSection = 'about';
let targetCameraPos = cameraPositions.about.pos.clone();
let targetLookAt = cameraPositions.about.lookAt.clone();
let currentLookAt = new THREE.Vector3(0, 4, 0);
let targetCoreRotation = 0;

// ============================================
// SECTION SWITCHING
// ============================================

const navButtons = document.querySelectorAll('.nav-btn');
const contentPanel = document.getElementById('content');
const sectionTitle = document.getElementById('section-title');
const sectionContent = document.getElementById('section-content');

function switchSection(sectionId) {
    if (!sections[sectionId] || sectionId === currentSection) return;

    currentSection = sectionId;

    // Play transition sound
    audio.playTransition();

    // Update content panel with animation
    contentPanel.classList.add('transitioning');

    setTimeout(() => {
        sectionTitle.textContent = sections[sectionId].title;
        sectionContent.innerHTML = sections[sectionId].content;
        contentPanel.classList.remove('transitioning');
    }, 200);

    // Update nav active state
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // Update camera and core targets
    if (cameraPositions[sectionId]) {
        targetCameraPos = cameraPositions[sectionId].pos.clone();
        targetLookAt = cameraPositions[sectionId].lookAt.clone();
        targetCoreRotation = cameraPositions[sectionId].coreRotation;
    }

    console.log('📍 Switched to:', sectionId);
}

// Nav button clicks
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchSection(btn.dataset.section);
        audio.playClick();
    });
});

// Initialize
switchSection('about');

// ============================================
// ANIMATION LOOP
// ============================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Update raycast for orb hover
    updateRaycast();

    // Animate core with active section
    animateCyberpunkCore(core, time, currentSection);

    // Smooth core rotation towards target
    core.rotation.y += (targetCoreRotation - core.rotation.y) * 0.02;

    // Animate particles around core
    const corePos = { x: core.position.x, y: core.position.y, z: core.position.z };
    animateParticles(particles, time, corePos);

    // Smooth camera movement
    camera.position.lerp(targetCameraPos, 0.025);
    currentLookAt.lerp(targetLookAt, 0.025);
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

setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 500);
    }
}, 500);

animate();

console.log('🔮 Interactive Cyberpunk Portfolio loaded');
console.log('💡 Click the glowing orbs to navigate!');
