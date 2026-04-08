import * as THREE from "three";

const CYAN = new THREE.Color("#00f0ff");
const BLUE = new THREE.Color("#0088ff");
const AMBER = new THREE.Color("#ff9500");
const WHITE = new THREE.Color("#e8f4ff");

/**
 * Create a hexagonal grid texture for the eye iris detail
 */
function createIrisTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#001a33";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Hexagonal grid pattern
  ctx.strokeStyle = "#003366";
  ctx.lineWidth = 1;
  const spacing = 16;
  const rows = Math.ceil(canvas.height / spacing);
  const cols = Math.ceil(canvas.width / spacing);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing + (row % 2) * (spacing / 2);
      const y = row * spacing;

      const size = spacing * 0.35;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  return new THREE.CanvasTexture(canvas);
}

export function initRobot({ scene, addUpdater, isMobile }) {
  const gsap = window.gsap;

  const robotGroup = new THREE.Group();
  robotGroup.position.y = 0;
  robotGroup.rotation.z = Math.PI;
  if (isMobile) robotGroup.scale.setScalar(0.6);
  scene.add(robotGroup);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 1: SKULL / CRANIUM BASE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const skullMat = new THREE.MeshStandardMaterial({
    color: "#141428",
    metalness: 0.85,
    roughness: 0.2,
  });
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1.8, 64, 64), skullMat);
  skull.scale.set(1.0, 1.15, 0.72);
  robotGroup.add(skull);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 2: FOREHEAD PLATE + SLOTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const foreheadMat = new THREE.MeshStandardMaterial({
    color: "#1e2040",
    metalness: 0.9,
    roughness: 0.15,
  });
  const foreheadPlate = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.65, 0.15),
    foreheadMat
  );
  foreheadPlate.position.set(0, 0.82, 0.68);
  robotGroup.add(foreheadPlate);

  // Forehead slot lines
  const slotMat = new THREE.MeshStandardMaterial({
    color: CYAN,
    emissive: CYAN,
    emissiveIntensity: 0.6,
  });
  const slotPositions = [0.9, 0.84, 0.78];
  for (const yPos of slotPositions) {
    const slot = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.04),
      slotMat.clone()
    );
    slot.position.set(0, yPos, 0.76);
    robotGroup.add(slot);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 3: BROW RIDGES (L and R)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const browMat = new THREE.MeshStandardMaterial({
    color: "#0d0d22",
    metalness: 1.0,
    roughness: 0.1,
  });
  const browEmissiveMat = new THREE.MeshStandardMaterial({
    color: CYAN,
    emissive: CYAN,
    emissiveIntensity: 1.2,
  });

  for (const side of [-1, 1]) {
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.18, 0.22),
      browMat
    );
    brow.position.set(side * 0.72, 0.52, 0.72);
    brow.rotation.z = side * 0.15;
    robotGroup.add(brow);

    // Emissive line under brow
    const browLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.025),
      browEmissiveMat.clone()
    );
    browLine.position.set(side * 0.72, 0.50, 0.80);
    robotGroup.add(browLine);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 4: EYES (the most important detail)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const eyeSocketMat = new THREE.MeshStandardMaterial({
    color: "#030308",
    metalness: 0.5,
    roughness: 0.8,
  });

  const irisTexture = createIrisTexture();

  const eyeLensMat = new THREE.MeshStandardMaterial({
    color: CYAN,
    map: irisTexture,
    transparent: true,
    opacity: 0,
    emissive: CYAN,
    emissiveIntensity: 0,
  });

  const eyeGlowMat = new THREE.MeshStandardMaterial({
    color: CYAN,
    emissive: CYAN,
    transparent: true,
    opacity: 0.15,
  });

  const eyeMeshes = [];
  const rectAreaLights = [];
  const eyeStates = [];

  for (const side of [-1, 1]) {
    // Eye socket (recessed area)
    const socket = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.26, 0.08),
      eyeSocketMat
    );
    socket.position.set(side * 0.68, 0.28, 0.70);
    robotGroup.add(socket);

    // Eye lens (the glowing surface)
    const lens = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.20),
      eyeLensMat.clone()
    );
    lens.position.set(side * 0.68, 0.28, 0.74);
    robotGroup.add(lens);
    eyeMeshes.push(lens);

    // Eye glow plane (larger, softer)
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.70, 0.30),
      eyeGlowMat.clone()
    );
    glow.position.set(side * 0.68, 0.28, 0.73);
    robotGroup.add(glow);
    eyeMeshes.push(glow);

    // RectAreaLight for realistic eye glow
    const light = new THREE.RectAreaLight(CYAN, 8, 0.5, 0.2);
    light.position.set(side * 0.68, 0.28, 0.78);
    robotGroup.add(light);
    rectAreaLights.push(light);

    eyeStates.push({ activated: false, flashTime: 0 });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 5: NOSE / CENTER RIDGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const noseMat = new THREE.MeshStandardMaterial({
    color: "#0a0a1a",
    metalness: 0.95,
    roughness: 0.08,
  });
  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.42, 0.16),
    noseMat
  );
  nose.position.set(0, 0.04, 0.78);
  robotGroup.add(nose);

  // Nose flanking plates
  for (const side of [-1, 1]) {
    const flank = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.22, 0.12),
      new THREE.MeshStandardMaterial({
        color: "#141428",
        metalness: 0.88,
        roughness: 0.18,
      })
    );
    flank.position.set(side * 0.25, -0.02, 0.74);
    robotGroup.add(flank);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 6: CHEEKBONE PLATES (L and R)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const cheekMat = new THREE.MeshStandardMaterial({
    color: "#1e2040",
    metalness: 0.88,
    roughness: 0.18,
  });

  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.52, 0.18),
      cheekMat
    );
    cheek.position.set(side * 0.88, 0.06, 0.60);
    robotGroup.add(cheek);

    // Diagonal amber accent line on cheek
    const accentLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.08),
      new THREE.MeshStandardMaterial({
        color: AMBER,
        emissive: AMBER,
        emissiveIntensity: 0.4,
      })
    );
    accentLine.position.set(side * 0.88, 0.06, 0.68);
    accentLine.rotation.z = side * 0.6;
    robotGroup.add(accentLine);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 7: JAW / LOWER FACE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const jawMat = new THREE.MeshStandardMaterial({
    color: "#0d0d22",
    metalness: 0.9,
    roughness: 0.12,
  });
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.55, 0.20),
    jawMat
  );
  jaw.position.set(0, -0.52, 0.62);
  robotGroup.add(jaw);

  // Jaw vent slots (6 vertical slots)
  const slotVentPositions = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];
  for (const xPos of slotVentPositions) {
    // Slot opening
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.35, 0.05),
      new THREE.MeshBasicMaterial({ color: "#000000" })
    );
    slot.position.set(xPos, -0.52, 0.70);
    robotGroup.add(slot);

    // Inner emissive glow behind slot
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.35),
      new THREE.MeshStandardMaterial({
        color: CYAN,
        emissive: CYAN,
        emissiveIntensity: 0.3,
      })
    );
    glow.position.set(xPos, -0.52, 0.72);
    robotGroup.add(glow);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 8: CHIN PLATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const chin = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.28, 0.22),
    new THREE.MeshStandardMaterial({
      color: "#141428",
      metalness: 0.92,
      roughness: 0.1,
    })
  );
  chin.position.set(0, -0.82, 0.55);
  robotGroup.add(chin);

  // Center chin arc light
  const chinArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.015, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({
      color: CYAN,
      emissive: CYAN,
      emissiveIntensity: 1.5,
    })
  );
  chinArc.rotation.x = Math.PI;
  chinArc.position.set(0, -0.82, 0.62);
  robotGroup.add(chinArc);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 9: TEMPLE PANELS (L and R sides)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const templePanelMat = new THREE.MeshStandardMaterial({
    color: "#1a1a35",
    metalness: 0.8,
  });

  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.72, 0.55),
      templePanelMat
    );
    panel.position.set(side * 1.72, 0.20, 0.0);
    robotGroup.add(panel);

    // 4 horizontal emissive lines per temple
    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.12),
        new THREE.MeshStandardMaterial({
          color: AMBER,
          emissive: AMBER,
          emissiveIntensity: 0.5,
        })
      );
      line.position.set(side * 1.72, 0.2 + i * 0.18, 0.08);
      robotGroup.add(line);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 10: EAR MODULES (technical protrusions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const side of [-1, 1]) {
    // Sensor node
    const sensor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.32, 16),
      new THREE.MeshStandardMaterial({
        color: "#0a0a1a",
        metalness: 1.0,
      })
    );
    sensor.position.set(side * 1.88, 0.28, 0.0);
    robotGroup.add(sensor);

    // Glowing ring around sensor
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.012, 8, 32),
      new THREE.MeshStandardMaterial({
        color: CYAN,
        emissive: CYAN,
        emissiveIntensity: 2.0,
      })
    );
    ring.position.set(side * 1.88, 0.28, 0.0);
    ring.rotation.x = Math.PI / 2;
    robotGroup.add(ring);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 11: PANEL SEAM LINES (critical for Iron Man look)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const seamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(CYAN).multiplyScalar(0.3),
    emissive: CYAN,
    emissiveIntensity: 0.4,
  });

  const seamLines = [
    { pos: [0, 0.62, 0.7], scale: [2.8, 0.008, 0.02] }, // forehead-brow
    { pos: [0, -0.25, 0.7], scale: [2.2, 0.008, 0.02] }, // cheek-jaw
    { pos: [0.18, 0.10, 0.8], scale: [0.008, 0.3, 0.02] }, // nose-right
    { pos: [-0.18, 0.10, 0.8], scale: [0.008, 0.3, 0.02] }, // nose-left
  ];

  for (const seam of seamLines) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(...seam.scale), seamMat);
    line.position.set(...seam.pos);
    robotGroup.add(line);
  }

  // Eye socket seam outlines (8 lines total, 4 per eye)
  for (const eyeSide of [-1, 1]) {
    // Top of socket
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.008, 0.02),
      seamMat
    );
    top.position.set(eyeSide * 0.68, 0.41, 0.70);
    robotGroup.add(top);

    // Bottom of socket
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.008, 0.02),
      seamMat
    );
    bottom.position.set(eyeSide * 0.68, 0.15, 0.70);
    robotGroup.add(bottom);

    // Left side of socket
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.26, 0.02),
      seamMat
    );
    left.position.set(eyeSide * 0.97, 0.28, 0.70);
    robotGroup.add(left);

    // Right side of socket
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.26, 0.02),
      seamMat
    );
    right.position.set(eyeSide * 0.39, 0.28, 0.70);
    robotGroup.add(right);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 12: BACK PANEL (for 180° rotation)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const spineMat = new THREE.MeshStandardMaterial({
    color: "#0d0d22",
    metalness: 0.95,
  });
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 1.6, 0.12),
    spineMat
  );
  spine.position.set(0, 0, -0.7);
  robotGroup.add(spine);

  // Back reactor glow
  const reactorMat = new THREE.MeshStandardMaterial({
    color: CYAN,
    emissive: CYAN,
    emissiveIntensity: 1.2,
  });
  const reactor = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    reactorMat
  );
  reactor.position.set(0, 0, -0.72);
  robotGroup.add(reactor);

  const reactorLight = new THREE.PointLight(CYAN, 4, 3);
  reactorLight.position.set(0, 0, -0.72);
  robotGroup.add(reactorLight);

    // Back panel lines (6 horizontal)
  for (let i = 0; i < 6; i++) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.008),
      new THREE.MeshStandardMaterial({
        color: CYAN,
        emissive: CYAN,
        emissiveIntensity: 0.3,
      })
    );
    line.position.set(0, -0.4 + i * 0.15, -0.63);
    robotGroup.add(line);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PARTICLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const particleCount = isMobile ? 500 : 2000;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 15;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 14;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: CYAN,
    size: isMobile ? 0.016 : 0.02,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATE & ANIMATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const state = {
    baseY: 0,
    eyeColor: CYAN.clone(),
    mouseX: 0,
    mouseY: 0,
    mode: "stars",
    eyeInitialized: false,
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
    // Eye startup animation only once
    if (!state.eyeInitialized) {
      state.eyeInitialized = true;

      for (let i = 0; i < eyeMeshes.length; i += 2) {
        const lens = eyeMeshes[i];
        const glow = eyeMeshes[i + 1];

        // Phase 1: dark (0.3s)
        // Phase 2: flash to 1.0 instantly
        // Phase 3: flicker (3 pulses)
        // Phase 4: settle to 0.82
        // Phase 5: continuous breathing

        gsap.to(lens.material, { opacity: 0, duration: 0.3, ease: "power2.inOut" });
        gsap.to(glow.material, { opacity: 0, duration: 0.3, ease: "power2.inOut" });

        gsap.to(lens.material, {
          opacity: 1.0,
          duration: 0,
          delay: 0.3,
        });
        gsap.to(glow.material, {
          opacity: 0.15,
          duration: 0,
          delay: 0.3,
        });

        // Flicker (3 quick pulses)
        for (let f = 0; f < 3; f++) {
          gsap.to(lens.material, {
            opacity: 0.2,
            duration: 0.05,
            delay: 0.3 + f * 0.1,
          });
          gsap.to(lens.material, {
            opacity: 1.0,
            duration: 0.05,
            delay: 0.3 + f * 0.1 + 0.05,
          });
        }

        // Settle to 0.82
        gsap.to(lens.material, {
          opacity: 0.82,
          duration: 0.3,
          delay: 0.6,
          ease: "power2.out",
        });
      }
    }

    gsap.to(robotGroup.rotation, {
      z: 0,
      duration: 1.8,
      ease: "power3.out",
      delay: 0.5,
    });
  }

  function exitToSection4() {
    gsap.to(robotGroup.position, {
      y: 5.2,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(robotGroup.scale, {
      x: 0.7,
      y: 0.7,
      z: 0.7,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  function returnFromSection4() {
    gsap.to(robotGroup.position, {
      y: 0.8,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(robotGroup.scale, {
      x: isMobile ? 0.6 : 1,
      y: isMobile ? 0.6 : 1,
      z: isMobile ? 0.6 : 1,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === "nebula") {
      particleMaterial.color.set("#3f79ff");
      particleMaterial.opacity = 0.45;
    } else if (mode === "warp") {
      particleMaterial.color.set(AMBER);
      particleMaterial.opacity = 0.85;
    } else {
      particleMaterial.color.set(CYAN);
      particleMaterial.opacity = 0.6;
    }
  }

  function setMouse(nx, ny) {
    state.mouseX = nx;
    state.mouseY = ny;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN UPDATE LOOP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  addUpdater((elapsed) => {
    // Breathing scale pulse
    const breathe = 1 + Math.sin(elapsed * 0.8) * 0.004;
    robotGroup.scale.set(
      breathe * (isMobile ? 0.6 : 1),
      breathe * (isMobile ? 0.6 : 1),
      breathe * (isMobile ? 0.6 : 1)
    );

    // Eye breathing animation
    const eyeBreath = Math.sin(elapsed * 1.8) * 0.12 + 0.82;
    for (let i = 0; i < eyeMeshes.length; i += 2) {
      eyeMeshes[i].material.opacity = eyeBreath;
      eyeMeshes[i].material.emissiveIntensity = eyeBreath * 0.4;
    }

    // Update eye color
    for (const eye of eyeMeshes) {
      if (eye.material.map) eye.material.emissive.copy(state.eyeColor);
    }

    // RectAreaLight intensity breathing
    for (const light of rectAreaLights) {
      light.intensity = 6 + Math.sin(elapsed * 1.8 + light.position.x * 3) * 2;
    }

    // Reactor pulsing (back panel)
    reactor.material.emissiveIntensity = 0.6 + Math.sin(elapsed * 1.5) * 0.4;
    reactorLight.intensity = 4 + Math.sin(elapsed * 1.5) * 1.5;

    // Particle animation
    const p = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
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

    // Robot parallax with mouse
    robotGroup.rotation.x = state.mouseY * 0.08;
    robotGroup.rotation.y = state.baseY + state.mouseX * 0.02;
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
      CYAN: "#00f0ff",
      BLUE: "#0088ff",
      AMBER: "#ff9500",
    },
  };
}
