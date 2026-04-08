export function initSections() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const heroTitle = document.querySelector(".hero-title");
  const text = heroTitle.textContent;
  heroTitle.innerHTML = text
    .split("")
    .map((char) => `<span class="hero-letter">${char === " " ? "&nbsp;" : char}</span>`)
    .join("");

  gsap.from(".hero-letter", {
    y: -40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out",
    delay: 0.2,
  });

  gsap.from(".hero-tagline", {
    opacity: 0,
    y: 24,
    duration: 0.8,
    delay: 1.2,
  });

  const statItems = document.querySelectorAll("[data-target]");
  let counted = false;

  ScrollTrigger.create({
    trigger: "#section-2",
    start: "top 60%",
    onEnter: () => {
      if (counted) return;
      counted = true;

      statItems.forEach((item) => {
        const target = Number(item.dataset.target);
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            item.textContent = Math.floor(state.value).toLocaleString();
          },
        });
      });
    },
  });

  gsap.from("#section-2 .about-panel", {
    x: 140,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#section-2",
      start: "top 65%",
    },
  });

  gsap.from(".feature-card", {
    y: 80,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#section-3",
      start: "top 62%",
    },
  });

  if (window.VanillaTilt) {
    window.VanillaTilt.init(document.querySelectorAll(".team-card"), {
      max: 9,
      speed: 450,
      glare: true,
      "max-glare": 0.18,
    });
  }

  const form = document.querySelector(".contact-form");
  const button = form.querySelector("button");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const burstWrap = document.createElement("div");
    burstWrap.className = "burst-wrap";
    button.appendChild(burstWrap);

    for (let i = 0; i < 24; i += 1) {
      const dot = document.createElement("span");
      dot.className = "burst-dot";
      burstWrap.appendChild(dot);

      const angle = (Math.PI * 2 * i) / 24;
      const dist = 30 + Math.random() * 26;

      gsap.fromTo(
        dot,
        { x: 0, y: 0, scale: 1, opacity: 1 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          scale: 0.1,
          opacity: 0,
          duration: 0.55,
          ease: "power2.out",
        }
      );
    }

    gsap.to(button, {
      boxShadow: "0 0 28px rgba(0,245,255,0.95)",
      duration: 0.18,
      yoyo: true,
      repeat: 1,
      onComplete: () => burstWrap.remove(),
    });
  });
}
