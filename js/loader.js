import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export async function runLoaderSequence({ onRevealMain }) {
  const gsap = window.gsap;

  await document.fonts.ready;

  const wrap = document.getElementById("loader");
  const canvas = document.getElementById("loader-canvas");
  const mainCanvas = document.getElementById("main-canvas");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#000000");

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20);
  camera.position.set(0, 0.16, 5.4);

  const light = new THREE.PointLight(0xffffff, 2.6, 12);
  light.position.set(0, 1.8, 2.9);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const rim = new THREE.DirectionalLight(0x84b7ff, 0.8);
  rim.position.set(-2, 1.6, -1.8);
  scene.add(rim);

  const laptop = new THREE.Group();
  laptop.rotation.x = Math.PI / 2;
  laptop.rotation.z = -0.16;
  laptop.rotation.y = 0.14;
  scene.add(laptop);

  const shellMat = new THREE.MeshStandardMaterial({
    color: "#c0c0c0",
    metalness: 0.94,
    roughness: 0.14,
    transparent: true,
    opacity: 1,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: "#97a0aa",
    metalness: 0.96,
    roughness: 0.1,
    transparent: true,
    opacity: 1,
  });

  const base = new THREE.Mesh(new RoundedBoxGeometry(2.45, 0.115, 1.62, 6, 0.065), shellMat);
  base.position.y = -0.57;
  laptop.add(base);

  const palmInset = new THREE.Mesh(new RoundedBoxGeometry(2.24, 0.026, 1.4, 4, 0.03), trimMat);
  palmInset.position.set(0, -0.5, 0.01);
  laptop.add(palmInset);

  const hinge = new THREE.Group();
  hinge.position.set(0, -0.51, -0.78);
  laptop.add(hinge);

  const lid = new THREE.Mesh(new RoundedBoxGeometry(2.45, 1.45, 0.072, 6, 0.06), shellMat);
  lid.position.set(0, 0.72, 0.036);
  hinge.add(lid);

  const txCanvas = document.createElement("canvas");
  txCanvas.width = 1024;
  txCanvas.height = 512;
  const tx = txCanvas.getContext("2d");
  const glow = { value: 0 };

  const letters = "OPENLOOP".split("").map((char) => ({ char, scale: 0.44, alpha: 0 }));
  const wordScale = { value: 1 };

  function drawScreen() {
    tx.clearRect(0, 0, txCanvas.width, txCanvas.height);
    tx.fillStyle = "#000000";
    tx.fillRect(0, 0, txCanvas.width, txCanvas.height);

    tx.fillStyle = "#001a2e";
    tx.globalAlpha = glow.value;
    tx.fillRect(0, 0, txCanvas.width, txCanvas.height);
    tx.globalAlpha = 1;

    tx.textAlign = "center";
    tx.textBaseline = "middle";
    tx.font = "900 118px Orbitron";

    const step = 96;
    const startX = txCanvas.width / 2 - ((letters.length - 1) * step) / 2;

    for (let i = 0; i < letters.length; i += 1) {
      const letter = letters[i];
      tx.save();
      tx.translate(startX + i * step, txCanvas.height / 2);
      const scale = letter.scale * wordScale.value;
      tx.scale(scale, scale);
      tx.globalAlpha = letter.alpha;
      tx.fillStyle = "#f5faff";
      tx.shadowColor = "#001a2e";
      tx.shadowBlur = 0;
      tx.shadowOffsetX = 2;
      tx.shadowOffsetY = 2;
      tx.fillText(letter.char, 0, 0);
      tx.restore();
    }

    screenTexture.needsUpdate = true;
  }

  const screenTexture = new THREE.CanvasTexture(txCanvas);
  drawScreen();

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.21, 1.24),
    new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true })
  );
  screen.position.set(0, 0.72, 0.076);
  hinge.add(screen);

  let running = true;
  function tick() {
    if (!running) return;
    drawScreen();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  const totalDuration = 5.5;
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  tl.to(
    hinge.rotation,
    {
      x: -THREE.MathUtils.degToRad(105),
      duration: 2.8,
    },
    0.5
  );

  tl.to(
    glow,
    {
      value: 1,
      duration: 2.8,
      onUpdate: drawScreen,
    },
    0.5
  );

  letters.forEach((letter, i) => {
    tl.to(
      letter,
      {
        scale: 1,
        alpha: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
        onUpdate: drawScreen,
      },
      1.25 + i * 0.08
    );
  });

  tl.to(
    wordScale,
    {
      value: 1.28,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: drawScreen,
    },
    2.7
  );

  tl.to(
    camera.position,
    {
      z: 0.2,
      x: -0.46,
      y: 0.68,
      duration: 1.5,
      ease: "power2.inOut",
    },
    3.58
  );

  tl.to(
    camera,
    {
      fov: 20,
      duration: 1.5,
      onUpdate: () => camera.updateProjectionMatrix(),
    },
    3.58
  );

  tl.to(
    glow,
    {
      value: 1.25,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: drawScreen,
    },
    3.58
  );

  tl.to(
    laptop.scale,
    {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.1,
      ease: "power2.in",
    },
    4.05
  );

  tl.to(
    [shellMat, screen.material],
    {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    },
    4.2
  );

  tl.to(
    mainCanvas,
    {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
      onStart: () => {
        if (onRevealMain) onRevealMain();
      },
    },
    totalDuration - 0.6
  );

  tl.to(
    wrap,
    {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        running = false;
        renderer.dispose();
        wrap.style.display = "none";
      },
    },
    totalDuration - 0.6
  );

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", resize);

  return tl;
}
