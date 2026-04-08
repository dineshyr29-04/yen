import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

// Initialize Lenis Smooth Scroll
const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00f3ff, 20);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const violetLight = new THREE.PointLight(0x7d00ff, 15);
violetLight.position.set(-5, -2, 2);
scene.add(violetLight);

// Environment Map for Realism
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/venice_sunset_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

// Load Model
let model;
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';

loader.load(modelUrl, (gltf) => {
    model = gltf.scene;
    model.scale.set(2, 2, 2);
    model.rotation.y = Math.PI;
    scene.add(model);

    // Initial Appearance Animation
    gsap.from(model.scale, {
        x: 0, y: 0, z: 0,
        duration: 2,
        ease: "power4.out",
        delay: 0.5
    });

    // Remove Loader
    const loaderElem = document.getElementById('loader');
    gsap.to(loaderElem, {
        opacity: 0,
        duration: 1,
        onComplete: () => loaderElem.remove()
    });

    // Animate Hero Content
    gsap.to('.hero h1', { opacity: 1, y: 0, duration: 1, delay: 1 });
    gsap.to('.hero .tagline', { opacity: 1, y: 0, duration: 1, delay: 1.2 });
    gsap.to('.cta-group', { opacity: 1, y: 0, duration: 1, delay: 1.4 });
});

camera.position.z = 5;

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.5
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;

    // Cursor Glow follow
    const cursor = document.getElementById('cursor-glow');
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: "power2.out"
    });
});

// Scroll Interaction logic
let scrollPos = 0;
lenis.on('scroll', (e) => {
    scrollPos = e.scroll;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    if (model) {
        // Subtle Floating
        model.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
        
        // Mouse Parallax
        model.rotation.y = Math.PI + (mouseX * 0.5);
        model.rotation.x = (mouseY * 0.3);

        // Scroll Rotation
        model.rotation.y += (scrollPos * 0.005);
        
        // Move model based on scroll
        model.position.z = -scrollPos * 0.002;
    }

    // Particles animation
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = -elapsedTime * 0.02;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
