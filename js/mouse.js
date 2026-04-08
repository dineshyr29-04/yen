export function initMouse({ robot, particles }) {
  const state = { x: 0, y: 0 };

  window.addEventListener("mousemove", (event) => {
    state.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.y = (event.clientY / window.innerHeight) * 2 - 1;
    robot.setMouse(state.x, -state.y);
  });

  return {
    update() {
      particles.rotation.y += state.x * 0.0003;
    },
  };
}
