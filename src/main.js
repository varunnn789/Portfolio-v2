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
// CUSTOM CAMERA VIEWS for specific sections
// Positions divided by 3 (to compensate for no core expansion)
const SECTION_CAMERAS = {
    experience: {
        position: new THREE.Vector3(10.035, -7.462, -1.904),
        target: new THREE.Vector3(2.342, -1.68, -3.055)
    },
    about: {
        position: new THREE.Vector3(5.269, 9.817, 5.901),
        target: new THREE.Vector3(3.250, 2.659, 0.970)
    },
    skills: {
        position: new THREE.Vector3(-7.715, 7.373, -6.582),  // -23.144/3, 22.12/3, -19.747/3
        target: new THREE.Vector3(-0.946, 0.56, -0.867),     // -2.838/3, 1.68/3, -2.6/3
        panelSide: 'left'  // Panel opens on LEFT for this section
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

    // Check if this section needs panel on left
    const customCamera = SECTION_CAMERAS[sectionId];
    const panelSide = customCamera?.panelSide || 'right';

    if (contentPanel) {
        contentPanel.classList.remove('panel-left', 'panel-right');
        contentPanel.classList.add(`panel-${panelSide}`);
        contentPanel.classList.add('visible');
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    console.log('📍 Showing:', sectionId, `(panel ${panelSide})`);
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
