/**
 * ============================================
 * MAIN - Core Expansion + Camera Focus
 * ============================================
 * 
 * When orb is clicked:
 * 1. ENTIRE core structure expands (3x scale)
 * 2. Camera animates to focus on the clicked orb
 * 3. Panel slides in
 * 
 * Closing panel:
 * 1. Core collapses back
 * 2. Camera returns to default
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
    createCyberpunkCore,
    animateCyberpunkCore,
    getInteractiveOrbs,
    highlightOrb,
    expandToOrb,
    collapseCore
} from './cyberpunk.js';
import { createParticles, animateParticles } from './particles.js';
import { AudioManager } from './audio.js';
import { sections } from './data.js';

// ============================================
// SCENE SETUP
// ============================================

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.012);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

// Default camera position
const defaultCameraPos = new THREE.Vector3(0, 2, 18);
const defaultLookAt = new THREE.Vector3(0, 0, 0);

camera.position.copy(defaultCameraPos);
camera.lookAt(defaultLookAt);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ============================================
// ORBIT CONTROLS
// ============================================

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.panSpeed = 0.5;
controls.enableZoom = true;
controls.zoomSpeed = 0.8;
controls.minDistance = 8;
controls.maxDistance = 40;
controls.target.set(0, 0, 0);

// ============================================
// CAMERA ANIMATION STATE
// ============================================

let cameraAnimating = false;
let cameraTargetPos = defaultCameraPos.clone();
let cameraTargetLookAt = defaultLookAt.clone();

function animateCameraToOrb(orbWorldPos) {
    if (!orbWorldPos) return;

    // Calculate camera position:
    // Position camera so BOTH the clicked orb AND the core are visible
    // Camera goes to the SAME SIDE as the orb, but further back
    // This puts the orb in the foreground with the core visible behind/beside it

    const direction = orbWorldPos.clone().normalize();

    // Camera position: on the SAME SIDE as the orb, but further out
    // This creates a view where orb is prominent with core visible
    // Add some offset so we see orb + core together
    const sideOffset = direction.clone().multiplyScalar(16); // Same direction as orb
    const upOffset = new THREE.Vector3(0, 4, 0); // Slight elevation

    cameraTargetPos = sideOffset.add(upOffset);

    // Look at a point BETWEEN the orb and the core center
    // This keeps both in frame
    const midpoint = orbWorldPos.clone().multiplyScalar(0.6); // 60% towards the orb from center
    cameraTargetLookAt = midpoint;

    cameraAnimating = true;
    controls.enabled = false; // Disable controls during animation

    console.log('📷 Camera focusing: orb in foreground, core visible');
}

function animateCameraToDefault() {
    cameraTargetPos = defaultCameraPos.clone();
    cameraTargetLookAt = defaultLookAt.clone();
    cameraAnimating = true;

    // Re-enable controls after a delay
    setTimeout(() => {
        controls.enabled = true;
    }, 800);

    console.log('📷 Camera returning to default');
}

function updateCameraAnimation() {
    if (!cameraAnimating) return;

    // Smooth camera position
    camera.position.lerp(cameraTargetPos, 0.04);

    // Smooth look-at
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(cameraTargetLookAt, 0.04);
    camera.lookAt(cameraTargetLookAt);

    // Update controls target
    controls.target.lerp(cameraTargetLookAt, 0.04);

    // Check if animation is done
    if (camera.position.distanceTo(cameraTargetPos) < 0.1) {
        cameraAnimating = false;
    }
}

// ============================================
// AUDIO
// ============================================

const audio = new AudioManager();

const btnToggleSound = document.getElementById('btn-toggle-sound');
const btnSwitchSong = document.getElementById('btn-switch-song');
const songNameEl = document.getElementById('song-name');
const iconSoundOn = btnToggleSound?.querySelector('.icon-sound-on');
const iconSoundOff = btnToggleSound?.querySelector('.icon-sound-off');

if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
        const isOn = audio.toggle();
        if (iconSoundOn) iconSoundOn.style.display = isOn ? 'inline' : 'none';
        if (iconSoundOff) iconSoundOff.style.display = isOn ? 'none' : 'inline';
        if (songNameEl) songNameEl.textContent = isOn ? audio.getCurrentSong() : 'Muted';
    });
}

if (btnSwitchSong) {
    btnSwitchSong.addEventListener('click', () => {
        const newSong = audio.nextSong();
        if (songNameEl) songNameEl.textContent = newSong;
    });
}

canvas.addEventListener('click', () => {
    if (!audio.audioElement) {
        audio.init();
        if (songNameEl) songNameEl.textContent = audio.getCurrentSong();
    }
}, { once: true });

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

const gridHelper = new THREE.GridHelper(50, 50, 0x222244, 0x111122);
gridHelper.material.opacity = 0.15;
gridHelper.material.transparent = true;
gridHelper.position.y = -10;
scene.add(gridHelper);

// ============================================
// CORE & PARTICLES
// ============================================

const core = createCyberpunkCore();
scene.add(core);

const particles = createParticles(100);
scene.add(particles);

// ============================================
// ORB LABELS
// ============================================

const labelContainer = document.getElementById('labels');

function createLabels() {
    if (!labelContainer) return;

    const orbs = getInteractiveOrbs(core);

    orbs.forEach(orbGroup => {
        const label = document.createElement('div');
        label.className = 'orb-label';
        label.textContent = orbGroup.userData.label;
        label.dataset.section = orbGroup.userData.section;
        label.style.color = '#' + orbGroup.children[0].material.color.getHexString();
        labelContainer.appendChild(label);
    });
}

function updateLabels() {
    if (!labelContainer) return;

    const orbs = getInteractiveOrbs(core);
    const labels = labelContainer.querySelectorAll('.orb-label');

    orbs.forEach((orbGroup, i) => {
        const label = labels[i];
        if (!label) return;

        // Get world position (includes core scaling)
        const worldPos = new THREE.Vector3();
        orbGroup.getWorldPosition(worldPos);

        const screenPos = worldPos.clone().project(camera);

        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight;

        if (screenPos.z > 1) {
            label.style.display = 'none';
        } else {
            label.style.display = 'block';
            label.style.left = x + 'px';
            label.style.top = (y - 50) + 'px';
        }
    });
}

createLabels();

// ============================================
// RAYCASTER
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
        // Expand core and focus camera on this orb
        const orbWorldPos = expandToOrb(core, hoveredOrb);
        animateCameraToOrb(orbWorldPos);

        showSection(hoveredOrb.userData.section);
        audio.playClick();
    }
});

function updateRaycast() {
    raycaster.setFromCamera(mouse, camera);

    const orbs = getInteractiveOrbs(core);
    const intersects = raycaster.intersectObjects(orbs, true);

    if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target && !target.userData.section) {
            target = target.parent;
        }

        if (target !== hoveredOrb) {
            if (hoveredOrb) highlightOrb(hoveredOrb, false);

            hoveredOrb = target;
            highlightOrb(hoveredOrb, true);
            audio.playHover();

            canvas.style.cursor = 'pointer';
        }
    } else {
        if (hoveredOrb) {
            highlightOrb(hoveredOrb, false);
            hoveredOrb = null;
            canvas.style.cursor = 'grab';
        }
    }
}

// ============================================
// PANEL CONTROL
// ============================================

const contentPanel = document.getElementById('content');
const sectionTitle = document.getElementById('section-title');
const sectionContent = document.getElementById('section-content');
const closeBtn = document.getElementById('close-panel');

let currentSection = null;
let panelVisible = false;

function showSection(sectionId) {
    if (!sections[sectionId]) return;

    currentSection = sectionId;
    panelVisible = true;

    audio.playTransition();

    if (sectionTitle) sectionTitle.textContent = sections[sectionId].title;
    if (sectionContent) sectionContent.innerHTML = sections[sectionId].content;

    if (contentPanel) contentPanel.classList.add('visible');

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    console.log('📍 Showing:', sectionId);
}

function hidePanel() {
    panelVisible = false;
    currentSection = null;

    if (contentPanel) contentPanel.classList.remove('visible');

    // Collapse core and return camera
    collapseCore(core);
    animateCameraToDefault();

    // Remove nav active states
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
}

if (closeBtn) {
    closeBtn.addEventListener('click', hidePanel);
}

// Nav buttons also trigger expansion
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;

        // Find the corresponding orb
        const orbs = getInteractiveOrbs(core);
        const targetOrb = orbs.find(o => o.userData.section === sectionId);

        if (targetOrb) {
            const orbWorldPos = expandToOrb(core, targetOrb);
            animateCameraToOrb(orbWorldPos);
        }

        showSection(sectionId);
        audio.playClick();
    });
});

// ============================================
// ANIMATION
// ============================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    controls.update();
    updateCameraAnimation();
    updateRaycast();
    updateLabels();

    animateCyberpunkCore(core, time);

    const corePos = { x: core.position.x, y: core.position.y, z: core.position.z };
    animateParticles(particles, time, corePos);

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

console.log('🔮 Spacey Portfolio - Core expands, camera focuses on clicked orb');
