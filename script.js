const header = document.querySelector("[data-header]");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const sceneWord = document.querySelector("[data-scene-word]");
const wordCurrent = document.querySelector("[data-word-current]");
const wordNext = document.querySelector("[data-word-next]");
const langToggle = document.querySelector("[data-lang-toggle]");
const langCurrent = document.querySelector("[data-lang-current]");
const portfolioOrbit = document.querySelector("[data-portfolio-orbit]");
const portfolioCards = Array.from(document.querySelectorAll("[data-work-card]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const translations = {
  zh: {
    pageTitle: "宋和 | iOS Product Engineer",
    pageDescription: "宋和的个人简历网站：iOS 产品工程、SwiftUI、CloudKit、WidgetKit、算法与真实项目经历。",
    skipLink: "跳到主体内容",
    navHome: "首页",
    navEducation: "教育",
    navCampus: "校园",
    navPortfolio: "作品",
    navContact: "联系",
    heroName: "宋和",
    heroLeadOne: "南方科技大学本科。",
    heroLeadTwo: "目标：iOS 开发 / 产品经理日常实习。",
    ctaApp: "查看上线应用",
    educationTitleDegree: "本科",
    educationTitleSchool: "南方科技大学",
    educationBody: "通识与学科基础部 · 本科在读 · 2025.09 - 2029.06",
    metricGrad: "预计毕业",
    metricSchool: "南方科技大学",
    educationStackLabel: "技术栈",
    campusTitleCampus: "校园",
    campusTitleExperience: "经历",
    campusBody: "学生会、提案大赛、学生发展与指导中心，把真实问题推进成可协作的校园方案。",
    campusTagUnion: "学生会",
    campusTagProposal: "提案大赛",
    campusTagDevelopment: "学生发展与指导中心",
    campusStudentUnionTitle: "学生会",
    campusProposalTitle: "提案大赛",
    campusDevelopmentTitle: "学生发展与指导中心",
    portfolioTitle: "作品集",
    contactTitle: "聊聊 iOS、产品实习或协作。",
  },
  en: {
    pageTitle: "Song He | iOS Product Engineer",
    pageDescription: "Song He's resume site: iOS product engineering, SwiftUI, CloudKit, WidgetKit, algorithms, and shipped work.",
    skipLink: "Skip to main content",
    navHome: "Home",
    navEducation: "Education",
    navCampus: "Campus",
    navPortfolio: "Work",
    navContact: "Contact",
    heroName: "Song He",
    heroLeadOne: "Undergraduate at SUSTech.",
    heroLeadTwo: "Seeking daily internships in iOS development or product management.",
    ctaApp: "View App Store",
    educationTitleDegree: "Undergraduate",
    educationTitleSchool: "SUSTech",
    educationBody: "General and foundational studies · 2025.09 - 2029.06",
    metricGrad: "Expected graduation",
    metricSchool: "Southern University of Science and Technology",
    educationStackLabel: "Stack",
    campusTitleCampus: "Campus",
    campusTitleExperience: "Experience",
    campusBody: "Student Union, proposal competition, and student-development support translated into collaborative campus solutions.",
    campusTagUnion: "Student Union",
    campusTagProposal: "Proposal Competition",
    campusTagDevelopment: "Student Development Center",
    campusStudentUnionTitle: "Student Union",
    campusProposalTitle: "Proposal Competition",
    campusDevelopmentTitle: "Student Development Center",
    portfolioTitle: "Portfolio",
    contactTitle: "Open to iOS, product internships, and collaboration.",
  },
};

const portfolioContent = {
  zh: {
    liquid: {
      title: "Liquid Deadline",
      primary: { label: "App Store", href: "https://apps.apple.com/us/app/liquid-deadline/id6760516153" },
      secondary: { label: "GitHub", href: "https://github.com/QianMo0729/liquid-deadline" },
    },
    xiangqi: {
      title: "SUSTech XiangQi",
      primary: { label: "GitHub", href: "https://github.com/QianMo0729/SUSTech-XiangQi" },
      secondary: null,
    },
    campus: {
      title: "校园提案一等奖",
      primary: { label: "联系了解", href: "mailto:12512808@mail.sustech.edu.cn" },
      secondary: null,
    },
  },
  en: {
    liquid: {
      title: "Liquid Deadline",
      primary: { label: "App Store", href: "https://apps.apple.com/us/app/liquid-deadline/id6760516153" },
      secondary: { label: "GitHub", href: "https://github.com/QianMo0729/liquid-deadline" },
    },
    xiangqi: {
      title: "SUSTech XiangQi",
      primary: { label: "GitHub", href: "https://github.com/QianMo0729/SUSTech-XiangQi" },
      secondary: null,
    },
    campus: {
      title: "Campus Proposal",
      primary: { label: "Contact", href: "mailto:12512808@mail.sustech.edu.cn" },
      secondary: null,
    },
  },
};

const sceneWords = [
  { text: "SONG HE", color: "#11120f", opacity: 0.075 },
  { text: "SUSTech", color: "#f58220", opacity: 0.14 },
  { text: "CAMPUS", color: "#f58220", opacity: 0.11 },
  { text: "WORKS", color: "#7666ff", opacity: 0.12 },
  { text: "HELLO", color: "#11120f", opacity: 0.08 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const nearestSceneIndex = (anchor = 0.54) => {
  const viewportAnchor = window.innerHeight * anchor;
  let closest = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  scenes.forEach((scene, index) => {
    const rect = scene.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height * 0.5 - viewportAnchor);
    if (distance < closestDistance) {
      closest = index;
      closestDistance = distance;
    }
  });

  return closest;
};

let activeWordIndex = 0;
let activeWordSignature = `${sceneWords[0].text}|${sceneWords[0].color}`;
let activeWordAnimation = null;
let activeWork = "liquid";
let portfolioOrbitMetrics = null;

const portfolioDetailEls = {
  title: document.querySelector("[data-portfolio-title]"),
  primary: document.querySelector("[data-portfolio-primary]"),
  secondary: document.querySelector("[data-portfolio-secondary]"),
};

const currentLanguage = () => (document.documentElement.lang === "en" ? "en" : "zh");

const readStoredLanguage = () => {
  try {
    return window.localStorage.getItem("resume-language");
  } catch {
    return null;
  }
};

const writeStoredLanguage = (language) => {
  try {
    window.localStorage.setItem("resume-language", language);
  } catch {
    // Static previews can restrict storage; the visible switch still works.
  }
};

const setMetaContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("content", value);
};

const setPortfolioLink = (element, link) => {
  if (!element) return;
  if (!link) {
    element.hidden = true;
    element.removeAttribute("href");
    element.textContent = "";
    return;
  }
  element.hidden = false;
  element.href = link.href;
  element.textContent = link.label;
};

const setPortfolioDetail = (work = activeWork) => {
  if (!portfolioDetailEls.title) return;

  const language = currentLanguage();
  const content = portfolioContent[language][work] || portfolioContent[language].liquid;
  activeWork = work;

  portfolioDetailEls.title.textContent = content.title;
  setPortfolioLink(portfolioDetailEls.primary, content.primary);
  setPortfolioLink(portfolioDetailEls.secondary, content.secondary);

  portfolioCards.forEach((card) => {
    const selected = card.dataset.work === activeWork;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", selected ? "true" : "false");
  });
};

const setLanguage = (language) => {
  const nextLanguage = translations[language] ? language : "zh";
  const dictionary = translations[nextLanguage];

  document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
  document.title = dictionary.pageTitle;
  setMetaContent('meta[name="description"]', dictionary.pageDescription);
  setMetaContent('meta[property="og:title"]', dictionary.pageTitle);
  setMetaContent('meta[property="og:description"]', dictionary.pageDescription);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  if (langCurrent) langCurrent.textContent = nextLanguage === "zh" ? "EN" : "中";
  if (langToggle) {
    langToggle.setAttribute(
      "aria-label",
      nextLanguage === "zh" ? "Switch to English" : "切换到中文"
    );
  }

  writeStoredLanguage(nextLanguage);
  setPortfolioDetail(activeWork);
};

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

  activeWordAnimation?.kill();
  activeWordIndex = safeIndex;
  activeWordSignature = signature;

  wordNext.textContent = config.text;
  window.gsap.set(wordCurrent, { y: 0 });
  window.gsap.set(wordNext, {
    y: 0,
    autoAlpha: 0,
    color: config.color,
  });

  activeWordAnimation = window.gsap.timeline({
    defaults: { duration: 0.48, ease: "power3.inOut", overwrite: true },
    onComplete: () => {
      applyCurrentWord(config);
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
    .to(wordCurrent, { autoAlpha: 0 }, 0)
    .to(wordNext, { autoAlpha: config.opacity }, 0);
};

const revealWithFallback = () => {
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
};

const showReducedMotion = () => {
  applyCurrentWord(sceneWords[0]);
  revealItems.forEach((item) => item.classList.add("is-visible"));
  arrangePortfolioOrbit(Math.PI / 2);
  if (window.gsap) {
    window.gsap.set(revealItems, { autoAlpha: 1, y: 0, clearProps: "transform,visibility" });
    window.gsap.set(sceneWord, { autoAlpha: 1, y: 0, scale: 1 });
  }
};

const initFallbackMotion = () => {
  revealWithFallback();

  let fallbackFrame = null;

  const updateSceneMotion = () => {
    setHeaderState();
    const center = window.innerHeight * 0.54;

    scenes.forEach((scene, index) => {
      const rect = scene.getBoundingClientRect();
      const progress = clamp((center - rect.top) / Math.max(1, rect.height), 0, 1);

      scene.style.setProperty("--scene-enter", `${((0.5 - progress) * 32).toFixed(2)}px`);
      scene.style.setProperty("--scene-visual-y", `${((0.5 - progress) * 42).toFixed(2)}px`);
      scene.style.setProperty("--scene-visual-x", `${((progress - 0.5) * 26).toFixed(2)}px`);
      scene.style.setProperty("--scene-rotate", `${((progress - 0.5) * 4).toFixed(2)}deg`);
      scene.style.setProperty("--scene-scale", `${(1 + Math.sin(progress * Math.PI) * 0.02).toFixed(4)}`);
    });

    const activeIndex = nearestSceneIndex();
    if (sceneWord) {
      sceneWord.style.setProperty("--scene-word-y", `${(window.scrollY * -0.014).toFixed(2)}px`);
      sceneWord.style.setProperty("--scene-word-scale", `${(1 + activeIndex * 0.014).toFixed(3)}`);
    }
    setSceneWord(activeIndex);
  };

  const requestSceneMotion = () => {
    if (fallbackFrame) return;
    fallbackFrame = window.requestAnimationFrame(() => {
      fallbackFrame = null;
      updateSceneMotion();
    });
  };

  updateSceneMotion();
  window.addEventListener("scroll", requestSceneMotion, { passive: true });
  window.addEventListener("resize", requestSceneMotion);
};

const measurePortfolioOrbit = () => {
  if (!portfolioOrbit || !portfolioCards.length) return;

  const rect = portfolioOrbit.getBoundingClientRect();
  const cardWidth = portfolioCards[0]?.getBoundingClientRect().width || 260;
  const isNarrow = window.innerWidth < 760;
  const maxNarrowRadius = Math.max(72, rect.width / 2 - cardWidth * 0.44);
  const radius = isNarrow
    ? clamp(Math.min(rect.width, rect.height) * 0.2, 72, maxNarrowRadius)
    : Math.max(120, Math.min(rect.width, rect.height) * 0.33);

  portfolioOrbitMetrics = {
    radius,
    yRadius: radius * (isNarrow ? 0.5 : 0.42),
  };

  return portfolioOrbitMetrics;
};

const arrangePortfolioOrbit = (rotation) => {
  if (!portfolioOrbit || !portfolioCards.length) return;

  const cardCount = portfolioCards.length;
  const step = (Math.PI * 2) / cardCount;
  const metrics = portfolioOrbitMetrics || measurePortfolioOrbit();
  if (!metrics) return;

  portfolioCards.forEach((card, index) => {
    const theta = rotation + index * step;
    const x = Math.cos(theta) * metrics.radius;
    const y = Math.sin(theta) * metrics.yRadius;
    const depth = (Math.sin(theta) + 1) / 2;
    const scale = 0.78 + depth * 0.22;
    const opacity = 0.58 + depth * 0.42;
    const rotate = Math.cos(theta) * -7;

    card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`;
    card.style.opacity = opacity.toFixed(3);
    card.style.zIndex = String(Math.round(100 + depth * 100));
  });
};

const initPortfolioOrbit = () => {
  if (!portfolioOrbit || !portfolioCards.length) return;

  const step = (Math.PI * 2) / portfolioCards.length;
  let targetRotation = Math.PI / 2;
  let renderedRotation = targetRotation;
  let velocity = 0;
  let lastTime = performance.now();
  let animationFrame = null;
  let orbitActive = true;
  let isDragging = false;
  let pointerStartX = 0;
  let pointerLastX = 0;
  let dragDistance = 0;

  const setSelectedRotation = (work) => {
    const index = Math.max(0, portfolioCards.findIndex((card) => card.dataset.work === work));
    targetRotation = Math.PI / 2 - index * step;
  };

  const selectWorkCard = (card) => {
    if (!card?.dataset.work) return;
    setPortfolioDetail(card.dataset.work);
    setSelectedRotation(card.dataset.work);
    requestOrbitFrame();
  };

  const findClosestCard = (x, y) => {
    const candidates = portfolioCards
      .map((card) => {
        const rect = card.getBoundingClientRect();
        const inside =
          x >= rect.left - 8 &&
          x <= rect.right + 8 &&
          y >= rect.top - 8 &&
          y <= rect.bottom + 8;
        const distance = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2));
        return { card, inside, distance };
      })
      .filter((candidate) => candidate.inside)
      .sort((a, b) => a.distance - b.distance);

    return candidates[0]?.card || null;
  };

  setSelectedRotation(activeWork);
  measurePortfolioOrbit();
  arrangePortfolioOrbit(renderedRotation);

  const requestOrbitFrame = () => {
    if (animationFrame || prefersReducedMotion.matches) return;
    animationFrame = window.requestAnimationFrame(tick);
  };

  portfolioCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (dragDistance > 7) {
        event.preventDefault();
        return;
      }
      selectWorkCard(card);
    });
  });

  portfolioOrbit.addEventListener("click", (event) => {
    if (dragDistance > 7) return;

    const closestCard = findClosestCard(event.clientX, event.clientY);
    if (closestCard) {
      event.preventDefault();
      selectWorkCard(closestCard);
    }
  });

  portfolioOrbit.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    isDragging = true;
    pointerStartX = event.clientX;
    pointerLastX = event.clientX;
    dragDistance = 0;
    portfolioOrbit.classList.add("is-dragging");
    portfolioOrbit.setPointerCapture?.(event.pointerId);
    measurePortfolioOrbit();
    requestOrbitFrame();
  });

  portfolioOrbit.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const dx = event.clientX - pointerLastX;
    pointerLastX = event.clientX;
    dragDistance = Math.max(dragDistance, Math.abs(event.clientX - pointerStartX));
    targetRotation -= dx * 0.012;
    velocity = clamp(-dx * 0.00024, -0.0048, 0.0048);
    arrangePortfolioOrbit(targetRotation);
    requestOrbitFrame();
  });

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    portfolioOrbit.classList.remove("is-dragging");
    portfolioOrbit.releasePointerCapture?.(event.pointerId);
    window.setTimeout(() => {
      dragDistance = 0;
    }, 0);
  };

  portfolioOrbit.addEventListener("pointerup", endDrag);
  portfolioOrbit.addEventListener("pointercancel", endDrag);

  if (prefersReducedMotion.matches) return;

  const portfolioSection = portfolioOrbit.closest(".portfolio-section");
  if ("IntersectionObserver" in window && portfolioSection) {
    const orbitObserver = new IntersectionObserver(
      (entries) => {
        orbitActive = entries.some((entry) => entry.isIntersecting);
        if (orbitActive) requestOrbitFrame();
      },
      { threshold: 0.12 }
    );
    orbitObserver.observe(portfolioSection);
  }

  window.addEventListener("resize", () => {
    measurePortfolioOrbit();
    arrangePortfolioOrbit(renderedRotation);
  });

  const tick = (time) => {
    animationFrame = null;
    const delta = Math.min(34, time - lastTime);
    lastTime = time;

    if (!isDragging) {
      targetRotation += velocity * delta;
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.00002) velocity = 0;
      renderedRotation += (targetRotation - renderedRotation) * 0.12;
      arrangePortfolioOrbit(renderedRotation);
    }

    const stillSettling = Math.abs(targetRotation - renderedRotation) > 0.001;
    if (isDragging || (orbitActive && (velocity !== 0 || stillSettling))) {
      requestOrbitFrame();
    }
  };

  requestOrbitFrame();
};

const initSectionSettle = () => {
  if (
    prefersReducedMotion.matches ||
    !window.matchMedia("(pointer: fine) and (min-width: 760px)").matches ||
    scenes.length < 2
  ) {
    return;
  }

  let gestureStartIndex = null;
  let gestureDirection = 0;
  let settleTimer = null;
  let isSettling = false;

  const settleToScene = () => {
    if (gestureStartIndex === null || gestureDirection === 0) return;

    const targetIndex = clamp(gestureStartIndex + gestureDirection, 0, scenes.length - 1);
    const target = scenes[targetIndex];
    gestureStartIndex = null;
    gestureDirection = 0;

    if (!target) return;
    isSettling = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      isSettling = false;
    }, 760);
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < 22) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (isSettling) return;

      if (gestureStartIndex === null) gestureStartIndex = nearestSceneIndex(0.5);
      gestureDirection = event.deltaY > 0 ? 1 : -1;

      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleToScene, 130);
    },
    { passive: true }
  );
};

const initGsapMotion = ({ isDesktop }) => {
  const { gsap, ScrollTrigger } = window;
  document.documentElement.classList.add("gsap-ready");
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ duration: 0.72, ease: "power3.out" });

  const revealTargets = revealItems.filter((item) => !item.closest(".hero"));
  const campusCards = gsap.utils.toArray("[data-campus-card]");
  const workCardInners = gsap.utils.toArray(".work-card-inner");

  gsap.set(".hero .reveal", { autoAlpha: 1, y: 0 });
  gsap.set(revealTargets, { autoAlpha: 0, y: 34 });
  gsap.set(campusCards, {
    "--deal-x": (index) => `${(index - 1) * -42}px`,
    "--deal-y": "230px",
    "--deal-r": "-12deg",
    autoAlpha: 0,
  });
  gsap.set(workCardInners, { "--flight-x": "0px", "--flight-scale": 1, autoAlpha: 1 });
  setSceneWord(0, true);
  sceneWord?.style.removeProperty("--scene-word-y");
  sceneWord?.style.removeProperty("--scene-word-scale");
  gsap.set(sceneWord, { y: 0, scale: 1, autoAlpha: 1, transformOrigin: "right bottom" });

  const heroTimeline = gsap.timeline({
    defaults: { duration: 0.76, ease: "power3.out" },
  });

  heroTimeline
    .from(header, { y: -18, autoAlpha: 0, duration: 0.66 })
    .from(".hero h1", { y: 42, scale: 0.985, autoAlpha: 0, duration: 0.84 }, "-=0.18")
    .from(".hero .lead span", { y: 28, autoAlpha: 0, stagger: 0.08 }, "-=0.48")
    .from(".hero-actions .button", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.52 }, "-=0.36");

  if (sceneWord) {
    heroTimeline.fromTo(
      sceneWord,
      { y: 88, scale: 0.97, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 1.05, ease: "power4.out" },
      "-=0.82"
    );

    gsap.fromTo(
      sceneWord,
      { y: 0, scale: 1 },
      {
        y: () => Math.max(-190, -window.innerHeight * 0.2),
        scale: isDesktop ? 1.12 : 1.06,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      }
    );
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

  const revealVisibleTargets = () => {
    const visibleTargets = revealTargets.filter((target) => {
      const rect = target.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    });

    if (visibleTargets.length) {
      gsap.to(visibleTargets, {
        autoAlpha: 1,
        y: 0,
        stagger: { each: 0.05, from: "start" },
        overwrite: true,
      });
    }
  };

  let sceneWordFrame = null;
  const updateSceneWordFromViewport = () => {
    sceneWordFrame = null;
    setSceneWord(nearestSceneIndex());
  };
  const requestSceneWordUpdate = () => {
    if (sceneWordFrame) return;
    sceneWordFrame = window.requestAnimationFrame(updateSceneWordFromViewport);
  };

  scenes.forEach((scene, index) => {
    gsap.fromTo(
      scene,
      {
        "--scene-enter": "28px",
        "--scene-visual-y": "46px",
        "--scene-visual-x": "-22px",
        "--scene-rotate": "-3.2deg",
        "--scene-scale": 0.988,
      },
      {
        "--scene-enter": "-28px",
        "--scene-visual-y": "-46px",
        "--scene-visual-x": "22px",
        "--scene-rotate": "3.2deg",
        "--scene-scale": 1.018,
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
  });

  window.addEventListener("scroll", requestSceneWordUpdate, { passive: true });
  ScrollTrigger.addEventListener("refresh", requestSceneWordUpdate);
  requestSceneWordUpdate();

  if (campusCards.length) {
    gsap.to(campusCards, {
      "--deal-y": "0px",
      "--deal-x": "0px",
      "--deal-r": "0deg",
      autoAlpha: 1,
      duration: 0.92,
      stagger: { each: 0.14, from: "start" },
      ease: "back.out(1.08)",
      scrollTrigger: {
        trigger: ".campus-section",
        start: "top 62%",
        once: true,
      },
    });
  }

  if (workCardInners.length) {
    gsap.fromTo(
      workCardInners,
      { "--flight-x": "280px", "--flight-scale": 0.94, autoAlpha: 0 },
      {
        "--flight-x": "0px",
        "--flight-scale": 1,
        autoAlpha: 1,
        duration: 0.92,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".portfolio-section",
          start: "top 62%",
          once: true,
        },
      }
    );
  }

  let refreshTimer = null;
  const scheduleRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      revealVisibleTargets();
    }, 180);
  };

  window.addEventListener("load", scheduleRefresh, { once: true });
  window.addEventListener("resize", scheduleRefresh);
  window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    revealVisibleTargets();
  });
};

setLanguage(readStoredLanguage() || "zh");
setPortfolioDetail(activeWork);
initPortfolioOrbit();
initSectionSettle();

langToggle?.addEventListener("click", () => {
  const nextLanguage = document.documentElement.lang === "zh-CN" ? "en" : "zh";
  setLanguage(nextLanguage);
});

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (window.gsap && window.ScrollTrigger) {
  const media = window.gsap.matchMedia();

  media.add(
    {
      isDesktop: "(min-width: 760px)",
      isMobile: "(max-width: 759px)",
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
