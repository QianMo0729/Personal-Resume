const header = document.querySelector("[data-header]");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const sceneWord = document.querySelector("[data-scene-word]");
const wordCurrent = document.querySelector("[data-word-current]");
const wordNext = document.querySelector("[data-word-next]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const sceneWords = [
  { text: "SONG HE", color: "#10110f", opacity: 0.075 },
  { text: "PROFILE", color: "#25a87f", opacity: 0.08 },
  { text: "SUSTech", color: "#f58220", opacity: 0.13 },
  { text: "STACK", color: "#25a87f", opacity: 0.1 },
  { text: "⧖", color: "#7b61ff", opacity: 0.17 },
  { text: "1st", color: "#f58220", opacity: 0.13 },
  { text: "HELLO", color: "#10110f", opacity: 0.08 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
let activeWordIndex = 0;
let activeWordSignature = `${sceneWords[0].text}|${sceneWords[0].color}`;
let activeWordAnimation = null;
let wordTransitionTimer = null;

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const applyCurrentWord = (config) => {
  if (!sceneWord || !wordCurrent) return;
  wordCurrent.textContent = config.text;
  sceneWord.style.setProperty("--word-current-color", config.color);
  sceneWord.style.setProperty("--word-current-opacity", config.opacity);
};

const showReducedMotion = () => {
  applyCurrentWord(sceneWords[0]);
  revealItems.forEach((item) => item.classList.add("is-visible"));
  if (window.gsap) {
    window.gsap.set(revealItems, { autoAlpha: 1, y: 0, clearProps: "transform,visibility" });
    window.gsap.set(sceneWord, { autoAlpha: 1, y: 0, scale: 1 });
  }
};

const setSceneWord = (nextIndex, immediate = false) => {
  if (!sceneWord || !wordCurrent) return;

  const safeIndex = clamp(nextIndex, 0, sceneWords.length - 1);
  const config = sceneWords[safeIndex];
  const signature = `${config.text}|${config.color}`;

  if (signature === activeWordSignature && !immediate) return;

  if (immediate || !window.gsap || !wordNext) {
    applyCurrentWord(config);
    activeWordIndex = safeIndex;
    activeWordSignature = signature;
    return;
  }

  const direction = safeIndex > activeWordIndex ? 1 : -1;
  activeWordAnimation?.kill();
  clearTimeout(wordTransitionTimer);

  wordNext.textContent = config.text;
  window.gsap.set(wordNext, {
    y: direction * 46,
    autoAlpha: 0,
    color: config.color,
  });

  activeWordAnimation = window.gsap.timeline({
    defaults: { duration: 0.48, ease: "power3.inOut", overwrite: true },
    onComplete: () => {
      applyCurrentWord(config);
      activeWordIndex = safeIndex;
      activeWordSignature = signature;
      wordNext.textContent = "";
      window.gsap.set(wordCurrent, {
        y: 0,
        autoAlpha: config.opacity,
        color: config.color,
        clearProps: "visibility",
      });
      window.gsap.set(wordNext, { y: 0, autoAlpha: 0 });
    },
  });

  activeWordAnimation
    .to(wordCurrent, { y: -direction * 46, autoAlpha: 0 }, 0)
    .to(wordNext, { y: 0, autoAlpha: config.opacity }, 0);
};

const initFallbackMotion = () => {
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
    const center = window.innerHeight * 0.54;
    let activeIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    scenes.forEach((scene, index) => {
      const rect = scene.getBoundingClientRect();
      const progress = clamp((center - rect.top) / Math.max(1, rect.height), 0, 1);
      const distance = Math.abs(rect.top + rect.height * 0.5 - center);

      scene.style.setProperty("--scene-enter", `${((0.5 - progress) * 40).toFixed(2)}px`);
      scene.style.setProperty("--scene-visual-y", `${((0.5 - progress) * 54).toFixed(2)}px`);
      scene.style.setProperty("--scene-visual-x", `${((progress - 0.5) * 34).toFixed(2)}px`);
      scene.style.setProperty("--scene-rotate", `${((progress - 0.5) * 5).toFixed(2)}deg`);
      scene.style.setProperty("--scene-scale", `${(1 + Math.sin(progress * Math.PI) * 0.025).toFixed(4)}`);

      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    setSceneWord(activeIndex);
    if (sceneWord) {
      sceneWord.style.setProperty("--scene-word-y", `${(window.scrollY * -0.018).toFixed(2)}px`);
      sceneWord.style.setProperty("--scene-word-scale", `${(1 + activeIndex * 0.018).toFixed(3)}`);
    }
  };

  updateSceneMotion();
  window.addEventListener("scroll", updateSceneMotion, { passive: true });
  window.addEventListener("resize", updateSceneMotion);
};

const initGsapMotion = ({ isDesktop }) => {
  const { gsap, ScrollTrigger } = window;
  document.documentElement.classList.add("gsap-ready");
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ duration: 0.72, ease: "power3.out" });

  const revealTargets = revealItems.filter((item) => !item.closest(".hero"));
  gsap.set(".hero .reveal", { autoAlpha: 1, y: 0 });
  gsap.set(revealTargets, { autoAlpha: 0, y: 34 });
  setSceneWord(0, true);
  gsap.set(sceneWord, { "--scene-word-y": "0px", "--scene-word-scale": 1, autoAlpha: 1 });

  const heroTimeline = gsap.timeline({
    defaults: { duration: 0.76, ease: "power3.out" },
  });

  heroTimeline
    .from(header, { y: -18, autoAlpha: 0, duration: 0.66 })
    .from(".hero .eyebrow", { y: 18, autoAlpha: 0, duration: 0.5 }, "-=0.18")
    .from(".hero h1", { y: 42, scale: 0.985, autoAlpha: 0, duration: 0.84 }, "-=0.32")
    .from(".hero .lead span", { y: 28, autoAlpha: 0, stagger: 0.08 }, "-=0.48")
    .from(".hero-actions .button", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.52 }, "-=0.36");

  if (sceneWord) {
    heroTimeline.fromTo(
      sceneWord,
      { "--scene-word-y": "90px", "--scene-word-scale": 0.97, autoAlpha: 0 },
      { "--scene-word-y": "0px", "--scene-word-scale": 1, autoAlpha: 1, duration: 1.05, ease: "power4.out" },
      "-=0.82"
    );

    gsap.fromTo(sceneWord, {
      "--scene-word-y": "0px",
      "--scene-word-scale": 1,
    }, {
      "--scene-word-y": () => `${Math.max(-220, -window.innerHeight * 0.22)}px`,
      "--scene-word-scale": isDesktop ? 1.14 : 1.08,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.1,
      },
    });
  }

  ScrollTrigger.batch(revealTargets, {
    start: "top 86%",
    once: true,
    interval: 0.08,
    batchMax: 4,
    onEnter: (batch) => {
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: { each: 0.07, from: "start" },
        overwrite: true,
      });
    },
  });

  scenes.forEach((scene, index) => {
    gsap.fromTo(
      scene,
      {
        "--scene-enter": "34px",
        "--scene-visual-y": "58px",
        "--scene-visual-x": "-28px",
        "--scene-rotate": "-3.8deg",
        "--scene-scale": 0.985,
      },
      {
        "--scene-enter": "-34px",
        "--scene-visual-y": "-58px",
        "--scene-visual-x": "28px",
        "--scene-rotate": "3.8deg",
        "--scene-scale": 1.025,
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.85,
          refreshPriority: index,
        },
      }
    );

    ScrollTrigger.create({
      trigger: scene,
      start: "top 58%",
      end: "bottom 42%",
      refreshPriority: index,
      onEnter: () => setSceneWord(index),
      onEnterBack: () => setSceneWord(index),
    });
  });

  gsap.to(".project-visual .mini-product-card", {
    y: isDesktop ? -18 : -10,
    rotation: isDesktop ? -2.2 : -1,
    ease: "none",
    scrollTrigger: {
      trigger: ".project-visual",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.75,
    },
  });

  gsap.to(".project-visual .mint-rings-small", {
    x: isDesktop ? -32 : -16,
    y: isDesktop ? -16 : -8,
    rotation: isDesktop ? 8 : 4,
    ease: "none",
    scrollTrigger: {
      trigger: ".project-visual",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.9,
    },
  });

  gsap.to(".launch-card", {
    y: isDesktop ? -28 : -14,
    rotation: isDesktop ? 2.2 : 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".launch-frame",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.9,
    },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (window.gsap && window.ScrollTrigger) {
  const media = window.gsap.matchMedia();

  media.add(
    {
      isDesktop: "(min-width: 760px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      if (context.conditions.reduceMotion) {
        showReducedMotion();
        return;
      }

      initGsapMotion(context.conditions);
    }
  );
} else if (prefersReducedMotion.matches) {
  showReducedMotion();
} else {
  initFallbackMotion();
}
