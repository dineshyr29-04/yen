import { initScene } from "./scene.js";
import { initRobot } from "./robot.js";
import { runLoaderSequence } from "./loader.js";
import { initScroll } from "./scroll.js";
import { initSections } from "./sections.js";
import { initMouse } from "./mouse.js";

const sceneKit = initScene();
const isMobile = window.matchMedia("(max-width: 767px)").matches;

const robot = initRobot({
  scene: sceneKit.scene,
  addUpdater: sceneKit.addUpdater,
  isMobile,
});

const mouse = initMouse({ robot, particles: robot.particles });
sceneKit.addUpdater(() => mouse.update());

initSections();

document.getElementById("main-canvas").style.opacity = "0";

runLoaderSequence({
  onRevealMain: () => {
    robot.entryAnimation();
    initScroll({ robot });
  },
});

function loop() {
  sceneKit.renderFrame();
  requestAnimationFrame(loop);
}
loop();
