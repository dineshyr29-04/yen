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

  ScrollTrigger.create({
    trigger: ".rotation-track",
    start: "top top",
    end: "bottom bottom",
    pin: false,
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      if (p < 0.33 && phase !== 1) {
        phase = 1;
        robot.setBaseRotation(0);
        robot.setEyeColor(robot.eyePresets.CYAN);
      } else if (p >= 0.33 && p < 0.66 && phase !== 2) {
        phase = 2;
        robot.setBaseRotation(Math.PI / 2);
        robot.setEyeColor(robot.eyePresets.BLUE);
      } else if (p >= 0.66 && phase !== 3) {
        phase = 3;
        robot.setBaseRotation(Math.PI);
        robot.setEyeColor(robot.eyePresets.AMBER);
      }
    },
  });

  ScrollTrigger.create({
    trigger: "#section-4",
    start: "top 65%",
    onEnter: () => {
      robot.exitToSection4();
      robot.setMode("nebula");
    },
    onLeaveBack: () => {
      robot.returnFromSection4();
      robot.setMode("stars");
    },
  });

  ScrollTrigger.create({
    trigger: "#section-5",
    start: "top 70%",
    onEnter: () => robot.setMode("warp"),
    onLeaveBack: () => robot.setMode("nebula"),
  });

  return { lenis, ScrollTrigger };
}
