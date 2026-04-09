export function initScroll({ robot }) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Lenis = window.Lenis;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.9,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  let phase = 1;

  // Track rotation through the 4 sections
  ScrollTrigger.create({
    trigger: ".rotation-track",
    start: "top top",
    end: "bottom bottom",
    pin: false,
    scrub: 0.1,  // smooth slightly
    onUpdate: (self) => {
      const p = self.progress;

      // Update rotation logically continuously mapped to progress
      robot.setRotationProgress(p);

      // Eye colors based on quadrant
      if (p < 0.25 && phase !== 1) {
        phase = 1;
        robot.setEyeColor(robot.eyePresets.CYAN);
      } else if (p >= 0.25 && p < 0.5 && phase !== 2) {
        phase = 2;
        robot.setEyeColor(robot.eyePresets.BLUE);
      } else if (p >= 0.5 && p < 0.75 && phase !== 3) {
        phase = 3;
        robot.setEyeColor(robot.eyePresets.AMBER);
      } else if (p >= 0.75 && phase !== 4) {
        phase = 4;
        // Keep amber or switch to another? Let's use WHITE/AMBER
        robot.setEyeColor(robot.eyePresets.AMBER);
      }
    },
  });

  // Track the fade backward transition in Themes section
  ScrollTrigger.create({
    trigger: "#section-themes",
    start: "top 60%", // start transition early to feel smooth
    end: "top 10%",
    scrub: true,
    onUpdate: (self) => {
      robot.setFadeTransition(self.progress);
    },
    onEnter: () => {
      robot.setMode("nebula");
    },
    onLeaveBack: () => {
      robot.setMode("stars");
    },
  });

  // Themes Assembly logic will be handled mostly in sections.js / CSS, 
  // but we can add mode switch here
  ScrollTrigger.create({
    trigger: "#section-footer",
    start: "top 80%",
    onEnter: () => robot.setMode("warp"),
    onLeaveBack: () => robot.setMode("nebula"),
  });

  return { lenis, ScrollTrigger };
}
