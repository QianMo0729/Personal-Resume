const header = document.querySelector("[data-header]");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const sceneWord = document.querySelector("[data-scene-word]");
const wordCurrent = document.querySelector("[data-word-current]");
const wordNext = document.querySelector("[data-word-next]");
const langToggle = document.querySelector("[data-lang-toggle]");
const langCurrent = document.querySelector("[data-lang-current]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const translations = {
  zh: {
    pageTitle: "宋和 | iOS Product Engineer",
    pageDescription: "宋和的个人简历网站：iOS 产品工程、SwiftUI、CloudKit、WidgetKit、算法与真实项目经历。",
    navProfile: "概览",
    navEducation: "教育",
    navSkills: "技能",
    navProjects: "项目",
    navContact: "联系",
    heroEyebrow: "iOS Product Engineering / Internship",
    heroName: "宋和",
    heroLeadOne: "南方科技大学本科在读。",
    heroLeadTwo: "目标：iOS 开发 / 产品经理日常实习。",
    ctaApp: "查看上线应用",
    profileTitle: "能从需求、界面、工程到上线完整推进产品。",
    profileBody: "我关注 iOS 产品的完整链路：从真实问题、交互取舍，到 SwiftUI 实现、CloudKit 同步和 App Store 发布。",
    profileCardClient: "SwiftUI、MVVM 和系统组件。",
    profileCardAlgorithm: "Minimax 与 Alpha-Beta 剪枝。",
    profileCardProduct: "从真实需求到可交付产品。",
    educationTitle: "南方科技大学（SUSTech）",
    educationBody: "通识与学科基础部，本科在读。2025.09 - 2029.06。",
    metricGrad: "预计本科毕业",
    metricSchool: "南方科技大学",
    metricCity: "当前城市",
    skillsTitle: "围绕 iOS 产品交付建立工程能力。",
    skillLanguagesLabel: "Languages",
    skillLanguages: "Java、Python、Swift",
    skillIosLabel: "iOS Development",
    skillIos: "SwiftUI、MVVM、WidgetKit、Core Data、CloudKit、AppIntents",
    skillAlgoLabel: "Algorithms & Engineering",
    skillAlgo: "数据结构与算法、Minimax、Alpha-Beta 剪枝、Git",
    skillWorkflowLabel: "Product Workflow",
    skillWorkflow: "需求拆解、原型判断、AI 辅助调试与文档整理",
    projectsTitle: "项目经历",
    liquidMeta: "iOS / 2026.02 - Now",
    liquidBody: "已上架 App Store。独立完成 SwiftUI + MVVM、Core Data + CloudKit、WidgetKit + AppIntents 与 ICS 日历订阅，把截止日期管理做成可使用、可同步、可迭代的 iOS 产品。",
    xiangqiMeta: "Java / JavaFX / 2025.10 - 2025.12",
    xiangqiTitle: "中国象棋桌面应用",
    xiangqiBody: "课程没有要求完整产品化，但我按可交付应用推进：规则引擎、AI 对弈、安全存档、界面状态与跨平台打包，最终形成可运行的桌面产品。",
    repoLink: "查看仓库",
    shippingMeta: "Product",
    shippingTitle: "完整交付意识",
    shippingBody: "在课程要求之外补齐账号、存档、状态恢复和打包细节，把功能练习推进到更接近真实产品的完成度。",
    awardTitle: "南方科技大学“权系你我·智汇南科”校园提案大赛一等奖",
    awardBody: "围绕校园电动车管理提出系统性方案，覆盖停车规划、车道安全、夜间照明等问题，并参与答辩与材料整合。",
    contactTitle: "聊聊 iOS、产品实习或协作。",
    footerNote: "Static resume demo for GitHub Pages",
  },
  en: {
    pageTitle: "Song He | iOS Product Engineer",
    pageDescription: "Song He's resume site: iOS product engineering, SwiftUI, CloudKit, WidgetKit, algorithms, and shipped work.",
    navProfile: "Profile",
    navEducation: "Education",
    navSkills: "Skills",
    navProjects: "Work",
    navContact: "Contact",
    heroEyebrow: "iOS Product Engineering / Internship",
    heroName: "Song He",
    heroLeadOne: "Undergraduate at SUSTech.",
    heroLeadTwo: "Seeking off-cycle internships in iOS development or product management.",
    ctaApp: "View App Store",
    profileTitle: "I turn product questions into shipped iOS work.",
    profileBody: "I work across the full iOS product loop: user problem, interaction decisions, SwiftUI implementation, CloudKit sync, and App Store release.",
    profileCardClient: "SwiftUI, MVVM, and Apple platform components.",
    profileCardAlgorithm: "Minimax with Alpha-Beta pruning.",
    profileCardProduct: "From real needs to deliverable products.",
    educationTitle: "Southern University of Science and Technology",
    educationBody: "General and foundational studies. Undergraduate student, 2025.09 - 2029.06.",
    metricGrad: "Expected graduation",
    metricSchool: "Southern University of Science and Technology",
    metricCity: "Current city",
    skillsTitle: "Engineering skills shaped around iOS product delivery.",
    skillLanguagesLabel: "Languages",
    skillLanguages: "Java, Python, Swift",
    skillIosLabel: "iOS Development",
    skillIos: "SwiftUI, MVVM, WidgetKit, Core Data, CloudKit, AppIntents",
    skillAlgoLabel: "Algorithms & Engineering",
    skillAlgo: "Data structures, Minimax, Alpha-Beta pruning, Git",
    skillWorkflowLabel: "Product Workflow",
    skillWorkflow: "Requirement breakdown, product judgment, AI-assisted debugging, and documentation",
    projectsTitle: "Selected Work",
    liquidMeta: "iOS / 2026.02 - Now",
    liquidBody: "Published on the App Store. I built SwiftUI + MVVM, Core Data + CloudKit, WidgetKit + AppIntents, and ICS calendar subscriptions to make deadline management usable, synced, and ready to iterate.",
    xiangqiMeta: "Java / JavaFX / 2025.10 - 2025.12",
    xiangqiTitle: "Chinese Chess Desktop App",
    xiangqiBody: "The course did not require a complete product, but I treated it as one: rules engine, AI play, secure saves, UI state, and cross-platform packaging.",
    repoLink: "Repository",
    shippingMeta: "Product",
    shippingTitle: "Product Completion",
    shippingBody: "Beyond the assignment scope, I completed account, save, recovery, and packaging details so the work behaved closer to a real product.",
    awardTitle: "First Prize, SUSTech Campus Proposal Competition",
    awardBody: "Proposed a systematic e-bike management plan covering parking, lane safety, night lighting, and campus governance, then supported the pitch and materials.",
    contactTitle: "Open to iOS, product internships, and collaboration.",
    footerNote: "Static resume demo for GitHub Pages",
  },
};

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
    // Static previews can restrict storage; language still switches for the session.
  }
};

const setMetaContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("content", value);
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

  let fallbackFrame = null;

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
  sceneWord?.style.removeProperty("--scene-word-y");
  sceneWord?.style.removeProperty("--scene-word-scale");
  gsap.set(sceneWord, { y: 0, scale: 1, autoAlpha: 1, transformOrigin: "right bottom" });

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
      { y: 90, scale: 0.97, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 1.05, ease: "power4.out" },
      "-=0.82"
    );

    gsap.fromTo(sceneWord, {
      y: 0,
      scale: 1,
    }, {
      y: () => Math.max(-220, -window.innerHeight * 0.22),
      scale: isDesktop ? 1.14 : 1.08,
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

  let refreshTimer = null;
  const scheduleRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
  };

  window.addEventListener("load", scheduleRefresh, { once: true });
  window.addEventListener("resize", scheduleRefresh);
};

setLanguage(readStoredLanguage() || "zh");
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
