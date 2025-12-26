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
import { createStarfield, animateStarfield, createNebula, animateNebula } from './stars.js';
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

// Default camera position (starting view)
const defaultCameraPos = new THREE.Vector3(-0.317, 0.139, 11.766);
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
controls.panSpeed = 1.5;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.minDistance = 2;
controls.maxDistance = 100;
controls.target.set(0, 0, 0);

// Explicit mouse button config
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.DOLLY
};
controls.screenSpacePanning = true;  // Pan parallel to screen

// ============================================
// CAMERA ANIMATION STATE
// ============================================

let cameraAnimating = false;
let cameraStartPos = defaultCameraPos.clone();
let cameraTargetPos = defaultCameraPos.clone();
let cameraStartLookAt = defaultLookAt.clone();
let cameraTargetLookAt = defaultLookAt.clone();
let cameraAnimProgress = 0;
const CAMERA_ANIM_DURATION = 1.2; // seconds
let cameraAnimStartTime = 0;

// Ease-in-out cubic for smooth camera movement
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
// CUSTOM CAMERA VIEWS for all sections
// All positions are direct (no core expansion)
const SECTION_CAMERAS = {
    about: {
        position: new THREE.Vector3(9.625, 8.19, 3.325),
        target: new THREE.Vector3(3.925, 3.077, -1.106)
    },
    experience: {
        position: new THREE.Vector3(10.207, -7.396, -3.623),
        target: new THREE.Vector3(2.753, -1.393, -4.432)
    },
    projects: {
        position: new THREE.Vector3(4.187, 1.733, 10.242),   // 12.562/3, 5.2/3, 30.726/3
        target: new THREE.Vector3(3.103, 0.427, 0.985)       // 9.31/3, 1.282/3, 2.956/3
    },
    contact: {
        position: new THREE.Vector3(-6.162, -5.383, 6.752),  // -18.487/3, -16.15/3, 20.255/3
        target: new THREE.Vector3(-1.235, -2.171, 3.527),    // -3.706/3, -6.513/3, 10.58/3
        panelSide: 'left'
    },
    skills: {
        position: new THREE.Vector3(-8.223, 6.514, -6.01),
        target: new THREE.Vector3(1.019, 0.781, -3.457),
        panelSide: 'left'
    }
};

function animateCameraToOrb(orbWorldPos, sectionId = null) {
    // Check if this section has a custom camera view
    const customCamera = SECTION_CAMERAS[sectionId];
    if (customCamera) {
        cameraStartPos = camera.position.clone();
        cameraStartLookAt = controls.target.clone();
        cameraTargetPos = customCamera.position.clone();
        cameraTargetLookAt = customCamera.target.clone();

        cameraAnimating = true;
        cameraAnimStartTime = performance.now() / 1000;
        controls.enabled = false;

        console.log(`📷 ${sectionId.toUpperCase()}: Custom view`);
        return;
    }

    // Other sections: require orbWorldPos
    if (!orbWorldPos) return;

    cameraStartPos = camera.position.clone();
    cameraStartLookAt = controls.target.clone();

    // Calculate camera position based on orb
    const direction = orbWorldPos.clone().normalize();
    const sideOffset = direction.clone().multiplyScalar(22);
    const upOffset = new THREE.Vector3(0, 8, 0);

    cameraTargetPos = sideOffset.add(upOffset);

    const lookAtPoint = orbWorldPos.clone().multiplyScalar(0.7);
    cameraTargetLookAt = lookAtPoint;

    cameraAnimating = true;
    cameraAnimStartTime = performance.now() / 1000;
    controls.enabled = false;

    console.log('📷 Camera easing to orb (cinematic)');
}

function animateCameraToDefault() {
    cameraStartPos = camera.position.clone();
    cameraStartLookAt = controls.target.clone();
    cameraTargetPos = defaultCameraPos.clone();
    cameraTargetLookAt = defaultLookAt.clone();

    cameraAnimating = true;
    cameraAnimStartTime = performance.now() / 1000;

    // Re-enable controls after animation completes
    setTimeout(() => {
        controls.enabled = true;
    }, CAMERA_ANIM_DURATION * 1000);

    console.log('📷 Camera easing to default (cinematic)');
}

function updateCameraAnimation() {
    if (!cameraAnimating) return;

    const currentTime = performance.now() / 1000;
    const elapsed = currentTime - cameraAnimStartTime;
    const progress = Math.min(elapsed / CAMERA_ANIM_DURATION, 1);

    // Apply easing
    const easedProgress = easeInOutCubic(progress);

    // Interpolate position
    camera.position.lerpVectors(cameraStartPos, cameraTargetPos, easedProgress);

    // Interpolate look-at target
    const currentLookAt = new THREE.Vector3().lerpVectors(
        cameraStartLookAt,
        cameraTargetLookAt,
        easedProgress
    );
    camera.lookAt(currentLookAt);
    controls.target.copy(currentLookAt);

    // Check if animation is done
    if (progress >= 1) {
        cameraAnimating = false;
        controls.enabled = true; // Re-enable rotation/zoom!
        console.log('✅ Camera animation complete - controls enabled');
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
// NEBULA (furthest back)
// ============================================

const nebula = createNebula();
scene.add(nebula);

// ============================================
// STARFIELD (behind everything)
// ============================================

const starfield = createStarfield(800);
scene.add(starfield);

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
        const sectionId = hoveredOrb.userData.section;
        const skipExpansion = !!SECTION_CAMERAS[sectionId];  // Skip expansion if has custom camera
        const orbWorldPos = expandToOrb(core, hoveredOrb, clock.getElapsedTime(), skipExpansion);
        animateCameraToOrb(orbWorldPos, sectionId);  // Pass sectionId for custom views

        showSection(sectionId);
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
// SECTION CONTROL (Panel removed for overhaul)
// ============================================

let currentSection = null;

function showSection(sectionId) {
    if (!sections[sectionId]) return;

    currentSection = sectionId;
    audio.playTransition();

    // Update nav button states
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    console.log('📍 Selected:', sectionId);
}

function hideSection() {
    currentSection = null;

    // Collapse core and return camera
    collapseCore(core);
    animateCameraToDefault();

    // Remove nav active states
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    console.log('📍 Section closed');
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
            const skipExpansion = !!SECTION_CAMERAS[sectionId];  // Skip expansion if has custom camera
            const orbWorldPos = expandToOrb(core, targetOrb, clock.getElapsedTime(), skipExpansion);
            animateCameraToOrb(orbWorldPos, sectionId);  // Pass sectionId for custom views
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

    // Camera animation takes priority over controls
    updateCameraAnimation();

    // Only update OrbitControls when NOT animating camera
    if (!cameraAnimating) {
        controls.update();
    }

    updateRaycast();
    updateLabels();

    animateNebula(nebula, time);
    animateStarfield(starfield, time);
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

// ============================================
// DEV TOOL: Export Camera Position
// ============================================
// Press 'E' to export current camera settings

window.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
        const camData = {
            position: {
                x: parseFloat(camera.position.x.toFixed(3)),
                y: parseFloat(camera.position.y.toFixed(3)),
                z: parseFloat(camera.position.z.toFixed(3))
            },
            target: {
                x: parseFloat(controls.target.x.toFixed(3)),
                y: parseFloat(controls.target.y.toFixed(3)),
                z: parseFloat(controls.target.z.toFixed(3))
            }
        };

        console.log('📷 CAMERA EXPORT:');
        console.log(JSON.stringify(camData, null, 2));

        // Also copy to clipboard
        const exportString = JSON.stringify(camData);
        navigator.clipboard.writeText(exportString).then(() => {
            console.log('✅ Copied to clipboard!');
        }).catch(() => {
            console.log('Copy the JSON above manually');
        });
    }
});

console.log('💡 DEV: Press "E" to export camera position');

console.log('🔮 Spacey Portfolio - Core expands, camera focuses on clicked orb');
