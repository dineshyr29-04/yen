import * as THREE from "three";

/**
 * Initialize Three.js scene with professional cinema-grade lighting
 * for the Iron Man robot face centerpiece
 */
export function initScene() {
  const canvas = document.getElementById("main-canvas");

  const scene = new THREE.Scene();
  // Deep void background - near black with subtle blue undertone
  scene.background = new THREE.Color("#03010a");

  // Camera: positioned to view full 1.8-unit face (±0.9 on x-axis)
  // with ~90% viewport fill, looking straight at the face
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 3.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROFESSIONAL CINEMA-GRADE LIGHTING SETUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Ambient: very dark blue, barely fills shadows
  const ambientLight = new THREE.AmbientLight("#0a0a20", 0.35);
  scene.add(ambientLight);

  // Key Light (Main): bright cyan from upper right front
  // This is the primary sculpting light that defines the robot's form
  const keyLight = new THREE.DirectionalLight("#00f0ff", 1.8);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  // Fill Light (Secondary): warm amber from left side
  // Fills shadow areas without washing out the cyan key
  const fillLight = new THREE.DirectionalLight("#ff9500", 0.7);
  fillLight.position.set(-3, 1, 2);
  scene.add(fillLight);

  // Uplighting: cyan from below
  // Illuminates jaw and lower face, creates sci-fi glow effect
  const underLight = new THREE.PointLight("#00f0ff", 3, 5);
  underLight.position.set(0, -2.5, 1);
  scene.add(underLight);

  // Specular Highlight: white from above
  // Creates bright specular shine on metallic surfaces (eyes, forehead)
  const specularLight = new THREE.PointLight("#ffffff", 1.2, 4);
  specularLight.position.set(0, 4, 2);
  scene.add(specularLight);

  // Accent Danger Light: subtle red from far left
  // Adds eerie, surveillance-camera feel (barely visible, subliminal)
  const dangerLight = new THREE.PointLight("#ff2244", 0.5, 6);
  dangerLight.position.set(-4, -1, 1);
  scene.add(dangerLight);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    clock,
  };
}
