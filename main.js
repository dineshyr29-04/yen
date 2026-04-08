import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
});

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
renderer.toneMappingExposure = 1.5;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const cyanLight = new THREE.PointLight(0x06b6d4, 30, 20); // Cyan Blue
cyanLight.position.set(5, 5, 5);
scene.add(cyanLight);

const purpleLight = new THREE.PointLight(0x7c3aed, 20, 20); // Neon Purple
purpleLight.position.set(-5, -2, 5);
scene.add(purpleLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 2);
rimLight.position.set(0, 5, -5);
scene.add(rimLight);

// Environment Map for Realism
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/venice_sunset_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

// Circular Dotted Background Mesh
const circleGeometry = new THREE.TorusGeometry(3.5, 0.01, 16, 100);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.2 });
const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
scene.add(circleMesh);

// Add dots to circle for technical feel
const dotsGeometry = new THREE.BufferGeometry();
const dotsCount = 60;
const dotPositions = new Float32Array(dotsCount * 3);
for(let i=0; i < dotsCount; i++) {
    const angle = (i / dotsCount) * Math.PI * 2;
    dotPositions[i*3] = Math.cos(angle) * 3.5;
    dotPositions[i*3+1] = Math.sin(angle) * 3.5;
    dotPositions[i*3+2] = 0;
}
dotsGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
const dotsMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0x06b6d4 });
const dotsMesh = new THREE.Points(dotsGeometry, dotsMaterial);
scene.add(dotsMesh);

// Load Model
let model;
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';

loader.load(modelUrl, (gltf) => {
    model = gltf.scene;
    
    // Position it slightly profile as in the sample
    model.rotation.y = Math.PI * 1.25; 
    model.scale.set(0, 0, 0);
    scene.add(model);

    // Initial Appearance Animation
    gsap.to(model.scale, {
        x: 2.2, y: 2.2, z: 2.2,
        duration: 2.5,
        ease: "expo.out",
        delay: 0.5
    });

    // Remove Loader
    const loaderElem = document.getElementById('loader');
    gsap.to(loaderElem, {
        opacity: 0,
        duration: 1,
        delay: 2,
        onComplete: () => loaderElem.remove()
    });

    // Animate Hero Content
    const heroTl = gsap.timeline({ delay: 2.2 });
    heroTl.to('.hero h1', { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" })
          .to('.hero .tagline', { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.8")
          .to('.hero-stats', { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.8")
          .to('.cta-group', { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.8");

    // Immersive Scroll Transition (Fade out Robot)
    gsap.to(model.scale, {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom center",
            scrub: 1,
        },
        x: 0, y: 0, z: 0
    });

    gsap.to(model.rotation, {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom center",
            scrub: 1,
        },
        y: Math.PI * 2
    });
    
    gsap.to(circleMesh.scale, {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom center",
            scrub: 1,
        },
        x: 2, y: 2, z: 2
    });
    
    gsap.to([circleMesh.material, dotsMaterial], {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom center",
            scrub: 1,
        },
        opacity: 0
    });
});

camera.position.z = 6;

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 4000;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.01,
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.6
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
    if(cursor) {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.8,
            ease: "power2.out"
        });
    }
});

// Animation Loop
function animate() {
    const time = performance.now() * 0.001;

    if (model) {
        model.position.y = Math.sin(time * 0.5) * 0.1;
        model.rotation.y += mouseX * 0.05;
        model.rotation.x += mouseY * 0.05;
    }

    particlesMesh.rotation.y = time * 0.02;
    particlesMesh.position.z = Math.sin(time * 0.1) * 2;
    
    circleMesh.rotation.z = time * 0.1;
    dotsMesh.rotation.z = time * 0.12;

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
