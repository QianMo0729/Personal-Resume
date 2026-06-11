const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const sceneWord = document.querySelector("[data-scene-word]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const sceneWords = [
  { text: "SUSTech", color: "#f58220", opacity: 0.14 },
  { text: "Ship", color: "#25a87f", opacity: 0.13 },
  { text: "⧖", color: "#7b61ff", opacity: 0.18 },
  { text: "Work", color: "#7b61ff", opacity: 0.12 },
  { text: "Stack", color: "#25a87f", opacity: 0.1 },
  { text: "2029", color: "#f58220", opacity: 0.11 },
  { text: "Hello", color: "#10110f", opacity: 0.08 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    )
  : null;

if (revealObserver) {
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const updateSceneMotion = () => {
  setHeaderState();
  if (prefersReducedMotion.matches) return;

  const center = window.innerHeight * 0.54;
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  scenes.forEach((scene, index) => {
    const rect = scene.getBoundingClientRect();
    const progress = clamp((center - rect.top) / Math.max(1, rect.height), 0, 1);
    const distance = Math.abs(rect.top + rect.height * 0.5 - center);
    const lift = (0.5 - progress) * 40;
    const visualY = (0.5 - progress) * 54;
    const visualX = (progress - 0.5) * 34;
    const rotate = (progress - 0.5) * 5;
    const scale = 1 + Math.sin(progress * Math.PI) * 0.025;

    scene.style.setProperty("--scene-enter", `${lift.toFixed(2)}px`);
    scene.style.setProperty("--scene-visual-y", `${visualY.toFixed(2)}px`);
    scene.style.setProperty("--scene-visual-x", `${visualX.toFixed(2)}px`);
    scene.style.setProperty("--scene-rotate", `${rotate.toFixed(2)}deg`);
    scene.style.setProperty("--scene-scale", scale.toFixed(4));

    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  if (sceneWord) {
    const config = sceneWords[Math.min(activeIndex, sceneWords.length - 1)];
    sceneWord.textContent = config.text;
    sceneWord.style.setProperty("--scene-word-color", config.color);
    sceneWord.style.setProperty("--scene-word-opacity", config.opacity);
    sceneWord.style.setProperty("--scene-word-x", `${((activeIndex % 2) * 24).toFixed(2)}px`);
    sceneWord.style.setProperty("--scene-word-y", `${(window.scrollY * -0.018).toFixed(2)}px`);
    sceneWord.style.setProperty("--scene-word-scale", `${(1 + activeIndex * 0.018).toFixed(3)}`);
  }
};

updateSceneMotion();
window.addEventListener("scroll", updateSceneMotion, { passive: true });
window.addEventListener("resize", updateSceneMotion);
