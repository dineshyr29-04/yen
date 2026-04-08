import * as THREE from "three";

const MAIN_BG = 0x050510;

export function initScene() {
  const canvas = document.getElementById("main-canvas");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(MAIN_BG);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(2.5, 3.5, 2);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x00f5ff, 2, 6);
  pointLight.position.set(0, 2.2, 2.4);
  scene.add(pointLight);

  const clock = new THREE.Clock();
  const updaters = [];

  function addUpdater(fn) {
    updaters.push(fn);
  }

  function renderFrame(external) {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    if (external) external(elapsed, delta);
    for (const fn of updaters) fn(elapsed, delta);

    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", resize);

  return {
    THREE,
    scene,
    camera,
    renderer,
    addUpdater,
    renderFrame,
  };
}
