import * as THREE from "three";

const CYAN = new THREE.Color("#00f5ff");
const BLUE = new THREE.Color("#0088ff");
const AMBER = new THREE.Color("#ffaa00");

export function initRobot({ scene, addUpdater, isMobile }) {
  const gsap = window.gsap;

  const robotGroup = new THREE.Group();
  robotGroup.position.y = 0.8;
  robotGroup.rotation.z = Math.PI;
  if (isMobile) robotGroup.scale.setScalar(0.6);
  scene.add(robotGroup);

  const headMat = new THREE.MeshStandardMaterial({
    color: "#1a1a2e",
    metalness: 0.82,
    roughness: 0.22,
    emissive: "#09101f",
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 1,
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), headMat);
  head.scale.set(1, 0.85, 1);
  robotGroup.add(head);

  const cranialBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.08, 24, 100),
    new THREE.MeshStandardMaterial({
      color: "#2a3042",
      metalness: 0.9,
      roughness: 0.2,
      emissive: "#101626",
      emissiveIntensity: 0.2,
    })
  );
  cranialBand.rotation.x = Math.PI / 2;
  cranialBand.position.set(0, 0.02, 0.05);
  robotGroup.add(cranialBand);

  const faceplate = new THREE.Mesh(
    new THREE.BoxGeometry(1.08, 0.95, 0.12),
    new THREE.MeshStandardMaterial({
      color: "#0b0f1b",
      metalness: 0.7,
      roughness: 0.28,
      emissive: "#090c1b",
      emissiveIntensity: 0.2,
    })
  );
  faceplate.position.z = 0.78;
  faceplate.scale.set(0.98, 0.94, 1);
  robotGroup.add(faceplate);

  const browPlate = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08, 0.62, 8, 12),
    new THREE.MeshStandardMaterial({
      color: "#202a3a",
      metalness: 0.88,
      roughness: 0.24,
      emissive: "#0a1120",
      emissiveIntensity: 0.2,
    })
  );
  browPlate.rotation.z = Math.PI / 2;
  browPlate.position.set(0, 0.26, 0.89);
  robotGroup.add(browPlate);

  const noseBridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.35, 0.08),
    new THREE.MeshStandardMaterial({
      color: "#1b2332",
      metalness: 0.82,
      roughness: 0.26,
      emissive: "#0b1224",
      emissiveIntensity: 0.2,
    })
  );
  noseBridge.position.set(0, -0.04, 0.9);
  robotGroup.add(noseBridge);

  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 24, 24),
      new THREE.MeshStandardMaterial({
        color: "#1d2435",
        metalness: 0.8,
        roughness: 0.28,
        emissive: "#0b1325",
        emissiveIntensity: 0.25,
      })
    );
    cheek.scale.set(0.95, 0.72, 0.5);
    cheek.position.set(side * 0.42, -0.3, 0.8);
    robotGroup.add(cheek);
  }

  const foreheadStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.06, 0.03),
    new THREE.MeshStandardMaterial({
      color: "#05253a",
      emissive: CYAN,
      emissiveIntensity: 1.2,
      metalness: 0.1,
      roughness: 0.4,
    })
  );
  foreheadStripe.position.set(0, 0.48, 0.84);
  robotGroup.add(foreheadStripe);

  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 0.36, 0.48),
    new THREE.MeshStandardMaterial({
      color: "#121224",
      metalness: 0.72,
      roughness: 0.26,
      emissive: "#111a2b",
      emissiveIntensity: 0.35,
    })
  );
  jaw.position.set(0, -0.84, 0.35);
  jaw.scale.x = 1.05;
  jaw.scale.z = 0.88;
  robotGroup.add(jaw);

  const mouthSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.05, 0.02),
    new THREE.MeshStandardMaterial({
      color: "#04121e",
      emissive: CYAN,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.6,
    })
  );
  mouthSlot.position.set(0, -0.88, 0.63);
  robotGroup.add(mouthSlot);

  const jawLineMat = new THREE.MeshStandardMaterial({
    color: "#031018",
    emissive: CYAN,
    emissiveIntensity: 1,
    metalness: 0.2,
    roughness: 0.5,
  });

  const jawLineL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.03), jawLineMat);
  jawLineL.position.set(-0.22, -0.79, 0.62);
  robotGroup.add(jawLineL);

  const jawLineR = jawLineL.clone();
  jawLineR.position.x = 0.22;
  robotGroup.add(jawLineR);

  const templeGroup = new THREE.Group();
  robotGroup.add(templeGroup);

  const templePanelMat = new THREE.MeshStandardMaterial({
    color: "#111221",
    metalness: 0.5,
    roughness: 0.45,
    emissive: "#1d1203",
    emissiveIntensity: 0.35,
  });
  const templeLineMat = new THREE.MeshStandardMaterial({
    color: "#2b1f0a",
    emissive: AMBER,
    emissiveIntensity: 1.1,
    metalness: 0.2,
    roughness: 0.6,
  });

  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.35), templePanelMat);
    panel.position.set(side * 0.98, 0.08, 0.12);
    templeGroup.add(panel);

    const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.03), templeLineMat);
    line.position.set(side * 1.04, 0.08, 0.27);
    templeGroup.add(line);
  }

  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: "#02111a",
    emissive: CYAN,
    emissiveIntensity: 1.2,
    metalness: 0.05,
    roughness: 0.5,
  });

  const eyeMeshes = [];
  const ringMeshes = [];

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.1), eyeMaterial.clone());
    eye.position.set(side * 0.27, 0.07, 0.89);
    robotGroup.add(eye);
    eyeMeshes.push(eye);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.007, 12, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
    );
    ring.position.set(side * 0.27, 0.07, 0.9);
    ring.rotation.x = Math.PI / 2;
    robotGroup.add(ring);
    ringMeshes.push(ring);

    const eyeLight = new THREE.RectAreaLight(0x00f5ff, 2.2, 0.22, 0.08);
    eyeLight.position.set(side * 0.27, 0.07, 0.93);
    eyeLight.lookAt(side * 0.27, 0.07, 2.3);
    robotGroup.add(eyeLight);
    ringMeshes.push(eyeLight);
  }



  const particleCount = isMobile ? 500 : 2000;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 15;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 14;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: "#00f5ff",
    size: isMobile ? 0.016 : 0.02,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const state = {
    baseY: 0,
    eyeColor: CYAN.clone(),
    mouseX: 0,
    mouseY: 0,
    mode: "stars",
  };

  function setEyeColor(hex) {
    const next = new THREE.Color(hex);
    gsap.to(state.eyeColor, {
      r: next.r,
      g: next.g,
      b: next.b,
      duration: 0.8,
      ease: "power2.inOut",
    });
  }

  function setBaseRotation(targetY) {
    gsap.to(state, {
      baseY: targetY,
      duration: 1.2,
      ease: "power2.inOut",
    });
  }

  function entryAnimation() {
    gsap.to(robotGroup.rotation, {
      z: 0,
      duration: 1.8,
      ease: "power3.out",
      delay: 0.5,
    });
  }

  function exitToSection4() {
    gsap.to(robotGroup.position, { y: 5.2, duration: 1, ease: "power2.inOut" });
    gsap.to(robotGroup.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 1, ease: "power2.inOut" });
    gsap.to(headMat, { opacity: 0.4, duration: 1, ease: "power2.out" });
  }

  function returnFromSection4() {
    gsap.to(robotGroup.position, { y: 0.8, duration: 1, ease: "power2.inOut" });
    gsap.to(robotGroup.scale, { x: isMobile ? 0.6 : 1, y: isMobile ? 0.6 : 1, z: isMobile ? 0.6 : 1, duration: 1, ease: "power2.inOut" });
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === "nebula") {
      particleMaterial.color.set("#3f79ff");
      particleMaterial.opacity = 0.45;
    } else if (mode === "warp") {
      particleMaterial.color.set("#ffaa00");
      particleMaterial.opacity = 0.85;
    } else {
      particleMaterial.color.set("#00f5ff");
      particleMaterial.opacity = 0.6;
    }
  }

  function setMouse(nx, ny) {
    state.mouseX = nx;
    state.mouseY = ny;
  }

  addUpdater((elapsed) => {
    const pulse = Math.sin(elapsed * 2) * 0.3 + 1.0;

    for (const eye of eyeMeshes) {
      eye.material.emissive.copy(state.eyeColor);
      eye.material.emissiveIntensity = pulse;
    }

    foreheadStripe.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 2.2) * 0.45;
    mouthSlot.material.emissiveIntensity = 0.7 + Math.sin(elapsed * 2.7 + 0.3) * 0.25;
    jawLineL.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 1.7) * 0.35;
    jawLineR.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 1.7 + 0.5) * 0.35;



    const p = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const baseX = p[i3];
      const baseY = p[i3 + 1];
      const baseZ = p[i3 + 2];

      p[i3] = baseX + Math.sin(elapsed * 0.25 + i * 0.13) * 0.0012;
      p[i3 + 1] = baseY + Math.cos(elapsed * 0.22 + i * 0.07) * 0.0012;

      if (state.mode === "warp") {
        p[i3 + 2] += 0.12;
        if (p[i3 + 2] > 8) p[i3 + 2] = -10;
      } else {
        p[i3 + 2] = baseZ + Math.sin(elapsed * 0.3 + i * 0.11) * 0.002;
      }
    }
    particleGeometry.attributes.position.needsUpdate = true;

    robotGroup.rotation.x = state.mouseY * 0.08;
    robotGroup.rotation.y = state.baseY + state.mouseX * 0.02;

    for (const ring of ringMeshes) {
      if (ring.isMesh) ring.rotation.z += 0.008;
      if (ring.isRectAreaLight) ring.intensity = 1.2 + Math.sin(elapsed * 2 + ring.position.x * 3) * 0.35;
    }
  });

  return {
    robotGroup,
    particles,
    setEyeColor,
    setBaseRotation,
    entryAnimation,
    exitToSection4,
    returnFromSection4,
    setMode,
    setMouse,
    eyePresets: {
      CYAN: "#00f5ff",
      BLUE: "#0088ff",
      AMBER: "#ffaa00",
    },
  };
}
