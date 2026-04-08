import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// Initialize Smooth Scroll
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ==========================================
// SCENE SETUP (JARVIS HUD)
// ==========================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030303, 0.04); // Dark HUD fog

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8; // Starting distance

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
const cyanSpot = new THREE.PointLight(0x06b6d4, 50, 20); // Bright cyan
cyanSpot.position.set(4, 4, 4);
scene.add(cyanSpot);
const purpleSpot = new THREE.PointLight(0x7c3aed, 30, 20); // Neon purple
purpleSpot.position.set(-4, -4, 4);
scene.add(purpleSpot);
const topRim = new THREE.DirectionalLight(0xffffff, 1.5);
topRim.position.set(0, 5, -5);
scene.add(topRim);

// HDR Environment for metal reflections
new RGBELoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/royal_esplanade_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

// ==========================================
// BACKGROUND (HOLOGRAPHIC GRID + RAIN)
// ==========================================
const gridGroup = new THREE.Group();
const gridHelper = new THREE.GridHelper(60, 60, 0x06b6d4, 0x06b6d4);
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.05;
gridGroup.add(gridHelper);

const circularGrid = new THREE.PolarGridHelper(10, 16, 8, 64, 0x06b6d4, 0x06b6d4);
circularGrid.material.transparent = true;
circularGrid.material.opacity = 0.1;
circularGrid.rotation.x = Math.PI / 2; // Face camera initially
gridGroup.add(circularGrid);

gridGroup.position.set(0, -3, -5); // Below and behind
gridGroup.rotation.x = Math.PI / 4; // Tilt floor
scene.add(gridGroup);

const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 800;
const posArr = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount; i++) {
    posArr[i*3] = (Math.random() - 0.5) * 30; // x
    posArr[i*3+1] = Math.random() * 30 - 15;  // y
    posArr[i*3+2] = (Math.random() - 0.5) * 15 - 5; // z
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0x7c3aed, transparent: true, opacity: 0.4 });
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// ==========================================
// PORTAL INTRO SEQUENCE (THE LAPTOP)
// ==========================================
const introGroup = new THREE.Group();

// Canvas for glowing "loop" screen
const canvas = document.createElement('canvas');
canvas.width = 1024; canvas.height = 512;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 1024, 512);
ctx.fillStyle = '#06b6d4'; // Cyan neon
ctx.font = 'bold 150px "JetBrains Mono", monospace';
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
// Engraved look with shadow
ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 40;
ctx.fillText('l o o p', 512, 256);
const screenTexture = new THREE.CanvasTexture(canvas);

// Laptop Geometry
const laptopMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.2 });
const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 3), laptopMat);
const hinge = new THREE.Group();
hinge.position.set(0, 0.05, -1.5); // Back pivot

const lidBase = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.1), laptopMat);
lidBase.position.set(0, 1.5, 0.05); // Pivot compensation
const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 2.8),
    new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true })
);
screenMesh.position.set(0, 1.5, 0.11); // Slightly in front of lid

hinge.add(lidBase); hinge.add(screenMesh);
introGroup.add(baseMesh); introGroup.add(hinge);

// Initial pose: Standing closed on its side
introGroup.rotation.x = -Math.PI / 2;
introGroup.rotation.y = -Math.PI / 4;
introGroup.position.set(0, -1, 0);
scene.add(introGroup);

// UI Pre-intro state
gsap.set('.hud-frame, #app', { opacity: 0, pointerEvents: 'none' });

let mainModelReady = false;
let introComplete = false;

// ==========================================
// MAIN ROBOT HEAD (AI CORE)
// ==========================================
let aiCore;
const loader = new GLTFLoader();
loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
    aiCore = gltf.scene;
    
    // JARVIS Black & Neon styling
    aiCore.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
                color: 0x020202, // Abyss black
                metalness: 1.0, 
                roughness: 0.3,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                envMapIntensity: 2.0,
                emissive: 0x06b6d4, // Cyan glow
                emissiveIntensity: 0.0// Will pulse later
            });
            // Override emission map if it exists to keep geometric details glowing cyan
            if(child.material.emissiveMap) {
               child.material.emissiveIntensity = 0.5;
            }
        }
    });

    aiCore.scale.set(0, 0, 0); // Hide initially
    aiCore.position.set(0, 0, 0);
    scene.add(aiCore);
    mainModelReady = true;

    startIntroSequence();
});

// ==========================================
// THE CINEMATIC SEQUENCE
// ==========================================
function startIntroSequence() {
    const tl = gsap.timeline();

    // 1. Laptop rotates to face user
    tl.to(introGroup.rotation, {
        x: 0, y: 0, z: 0,
        duration: 2, ease: "power3.inOut"
    }, 0.5);

    // 2. Hinge opens, revealing 'loop'
    tl.to(hinge.rotation, {
        x: -Math.PI * 0.6, // Open angle
        duration: 2, ease: "power2.out"
    }, 2.0)
    .to(ambientLight, { intensity: 1, duration: 2 }, 2.0); // Screen glares

    // 3. Portal Dive: Camera moves FORWARD through second 'o' 
    // Approx position of second 'o' on screen local space is mapping to x>0
    tl.to(camera.position, {
        z: -1.4, // Push completely through screen
        y: 1.5,
        x: 0.4, // Target the right side 'o'
        duration: 2.5, ease: "power4.in"
    }, 3.5)
    
    // 4. Scene Swaps inside the 'portal' blinding light
    .add(() => {
        scene.remove(introGroup); // Remove laptop
        // Flash screen white/cyan
        renderer.setClearColor(0x06b6d4, 1);
        setTimeout(() => renderer.setClearColor(0x000000, 0), 100);
        
        // Reset camera for main scene
        camera.position.set(0, 0, 8);
        
        // Appear AI Core
        gsap.to(aiCore.scale, { x: 2, y: 2, z: 2, duration: 2, ease: "elastic.out(1, 0.7)" });
        gsap.to('.hud-frame, #app', { opacity: 1, duration: 1, pointerEvents: 'auto' });
        
        introComplete = true;
        initScrollTriggers();
    }, 5.8);
}

// ==========================================
// SCROLL ROTATION SYSTEM & HUD Transitions
// ==========================================
function initScrollTriggers() {
    // Single continuous rotation tied to scroll body
    // 4 sections * 100vh = full scroll journey. We want to end at Math.PI * 2
    gsap.to(aiCore.rotation, {
        scrollTrigger: {
            trigger: "#app",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5, // Smooth inertia scrub
        },
        y: Math.PI * 2, // Full 360 degree journey, stopping nicely at 90 deg intervals physically
        ease: "none"
    });

    // Slight Y movement to follow text rhythm
    gsap.to(aiCore.position, {
        scrollTrigger: {
            trigger: "#app",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
        },
        y: -1, 
        ease: "sine.inOut"
    });

    // HUD Content Entrances
    gsap.utils.toArray('.transition-el').forEach(el => {
        gsap.fromTo(el, 
            { opacity: 0, y: 40 },
            { 
               opacity: 1, y: 0, 
               duration: 1, ease: "power2.out",
               scrollTrigger: {
                   trigger: el,
                   start: "top 80%",
                   toggleActions: "play none none reverse"
               }
            }
        );
    });
}

// ==========================================
// RENDER LOOP & PARALLAX
// ==========================================
let mouseX = 0; let mouseY = 0;
let targetCubeX = 0; let targetCubeY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

const clock = new THREE.Clock();

function animate() {
    const time = clock.getElapsedTime();

    if(introComplete && aiCore) {
        // Subtle idle multi-axis floating
        targetCubeX = mouseX * 0.001;
        targetCubeY = mouseY * 0.001;
        
        // Gentle parallax lerp
        aiCore.position.x += (targetCubeX - aiCore.position.x) * 0.05;
        aiCore.rotation.x += (targetCubeY - aiCore.rotation.x) * 0.05;
        aiCore.position.y += Math.sin(time) * 0.002; // breathing
    }

    if(introComplete) {
        // Animate Grid and Rain slowly
        circularGrid.rotation.z = time * 0.05;
        
        const positions = particlesMesh.geometry.attributes.position.array;
        for(let i = 1; i < particlesCount * 3; i += 3) {
            positions[i] -= 0.02; // slow rain
            if(positions[i] < -15) positions[i] = 15;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
