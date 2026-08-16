/* Song He — AI product portfolio (paper edition)
   Vanilla JS: i18n, evidence-led case rendering, kinetic text,
   capability-to-case motion, dock magnification, and ID-card motion.

   To add a project, append one entry to the `projects` array below and drop
   its image into assets/. Numbering, layout, both languages and animations
   are handled automatically — the grid wraps to any number of projects. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

/* ── content ─────────────────────────────────────────────────────────── */

const translations = {
  zh: {
    pageTitle: "宋和 | AI 产品经理方向",
    pageDescription:
      "宋和的 AI 产品经理作品集：从问题定义、体验设计到 AI 协作交付与公开上线。",
    pageDescription_education:
      "宋和的教育与校园实践：南方科技大学本科在读，关注产品定义、AI 能力产品化与 0→1 交付。",
    pageDescription_work:
      "宋和的 AI 产品案例：用真实上线结果呈现产品定义、AI 能力产品化、体验设计与 0→1 交付。",
    skipLink: "跳到主体内容",
    statusPill: "在找 AI 产品实习",
    dockHome: "首页",
    dockEducation: "教育",
    dockWork: "案例",
    dockLang: "语言",
    langAria: "Switch to English",
    heroHello: "你好，我是",
    heroEyebrow: "宋和 · AI 产品经理实习方向",
    heroTitle: "做 AI 产品，也负责把它送上线。",
    heroRole:
      "南方科技大学 2029 届",
    ctaApp: "查看 AI 产品案例 →",
    ctaProfile: "了解我的背景",
    heroLoc: "深圳 · 中国",
    heroHint: "往下看",
    proofApps: "App Store 上线应用",
    proofUsers: "App Store 真实用户",
    proofProjects: "项目经历",
    proofAria: "关键数据",
    capKicker: "AI 产品实践",
    capTitle: "从判断，到上线。",
    capFrameTitle: "产品定义",
    capAiTitle: "AI 能力产品化",
    capDeliveryTitle: "AI 协作与 0→1 交付",
    capValidateTitle: "上线验证与迭代",
    capVisualLabel: "四个阶段",
    routeFrame: "定义",
    routeAi: "转译",
    routeDelivery: "交付",
    routeValidate: "验证",
    capCaseLink: "查看对应案例 →",
    capStepsAria: "AI 产品实践的四个关键步骤",
    kineticText: "想清楚，做出来，然后接着改。",
    eduKicker: "教育",
    eduTitle: "南方科技大学",
    eduNote: "通识与学科基础部，本科在读。平时关注产品怎么定义、AI 怎么变成真能用的功能，也会把课上和生活里遇到的问题做成实际的东西。",
    eduFocusLabel: "关注方向",
    focusProduct: "产品定义",
    focusInteraction: "体验设计",
    focusIos: "iOS 产品",
    focusAi: "AI 能力产品化",
    focusPrototype: "快速原型",
    gyroEnable: "开启陀螺仪校牌",
    gyroRetry: "未开启，再试一次",
    gyroActive: "陀螺仪校牌已开启",
    gyroDenied: "未获得动作权限，校牌保持静态。",
    idField1: "身份",
    idRole: "本科在读",
    idField2: "院系",
    idDept: "通识与学科基础部",
    idField3: "年份",
    campusKicker: "校园",
    campusTitle: "校园里的问题，也当成题目来做。",
    campusNote:
      "学生会、提案大赛、学生发展与指导中心，以及 SSVEP 脑机接口竞赛项目——在校园里练习协作、表达与落地。",
    campusC1Title: "学生会",
    campusC1Desc: "跨部门协作，推动校园活动落地。",
    campusC2Title: "提案大赛",
    campusC2Desc: "校园提案 · 一等奖。",
    campusC3Title: "学生发展与指导中心",
    campusC3Desc: "服务同学的成长与发展。",
    campusC4Title: "SSVEP 脑机接口机器人控制系统",
    campusC4Desc: "中国国际大学生创新大赛项目。",
    workKicker: "作品",
    workTitle: "作品集",
    workCount: "共 {n} 个项目",
    workAll: "GitHub 全部仓库 ↗",
    casesKicker: "案例",
    casesTitle: "三个项目，从开发到部署上线。",
    roleLabel: "我的职责",
    decisionLabel: "关键取舍",
    otherKicker: "其他实践",
    otherTitle: "课程与校园里的产品练习",
    pageTitle_education: "宋和 | 教育与产品实践",
    pageTitle_work: "宋和 | AI 产品案例",
    footRights: "保留所有权利。",
  },
  en: {
    pageTitle: "Song He | AI Product Management",
    pageDescription:
      "Song He's AI product management portfolio: problem framing, experience design, AI-assisted delivery, and public launches.",
    pageDescription_education:
      "Song He's education and campus practice at SUSTech, focused on product framing, AI capability productization, and 0-to-1 delivery.",
    pageDescription_work:
      "Song He's AI product cases, with shipped evidence across product framing, AI capability productization, experience design, and 0-to-1 delivery.",
    skipLink: "Skip to main content",
    statusPill: "Looking for an AI product internship",
    dockHome: "Home",
    dockEducation: "Education",
    dockWork: "Cases",
    dockLang: "Lang",
    langAria: "切换到中文",
    heroHello: "Hi, I'm",
    heroEyebrow: "Song He · AI Product Management Intern Candidate",
    heroTitle: "I build AI products, and I ship them.",
    heroRole:
      "SUSTech, Class of 2029",
    ctaApp: "View AI product cases →",
    ctaProfile: "About my background",
    heroLoc: "Shenzhen, China",
    heroHint: "Scroll down",
    proofApps: "Apps shipped on the App Store",
    proofUsers: "Real users on the App Store",
    proofProjects: "Projects",
    proofAria: "Key numbers",
    capKicker: "AI Product Practice",
    capTitle: "From judgment to launch.",
    capFrameTitle: "Product Framing",
    capAiTitle: "AI Capability Productization",
    capDeliveryTitle: "AI-assisted 0-to-1 Delivery",
    capValidateTitle: "Launch Validation & Iteration",
    capVisualLabel: "FOUR STAGES",
    routeFrame: "Frame",
    routeAi: "Translate",
    routeDelivery: "Deliver",
    routeValidate: "Validate",
    capCaseLink: "See the matching cases →",
    capStepsAria: "Four key steps in AI product practice",
    kineticText: "Think it through, build it, then keep fixing it.",
    eduKicker: "Education",
    eduTitle: "SUSTech",
    eduNote:
      "Undergraduate in General & Foundational Studies. I spend my time on how products get defined and how AI turns into features people can actually use, and I build things out of problems I run into in class and daily life.",
    eduFocusLabel: "Focus",
    focusProduct: "Product Framing",
    focusInteraction: "Experience Design",
    focusIos: "iOS Products",
    focusAi: "AI Productization",
    focusPrototype: "Rapid Prototyping",
    gyroEnable: "Enable motion ID card",
    gyroRetry: "Not enabled, try again",
    gyroActive: "Motion ID card enabled",
    gyroDenied: "Motion permission was not granted. The card stays static.",
    idField1: "Status",
    idRole: "Undergraduate",
    idField2: "Department",
    idDept: "General & Foundational Studies",
    idField3: "Years",
    campusKicker: "Campus",
    campusTitle: "Campus problems, treated as things to actually solve.",
    campusNote:
      "Student Union, the proposal competition, the Student Development Center, and an SSVEP brain-computer interface competition project — practicing collaboration, communication, and delivery.",
    campusC1Title: "Student Union",
    campusC1Desc: "Cross-team collaboration to deliver campus events.",
    campusC2Title: "Proposal Competition",
    campusC2Desc: "Campus proposal · First prize.",
    campusC3Title: "Student Development Center",
    campusC3Desc: "Supporting students' growth and development.",
    campusC4Title: "SSVEP Brain-Computer Interface Robot Control",
    campusC4Desc: "Entry in the China International College Students' Innovation Competition.",
    workKicker: "Work",
    workTitle: "Portfolio",
    workCount: "{n} projects",
    workAll: "All repositories on GitHub ↗",
    casesKicker: "Cases",
    casesTitle: "Three projects, from build to launch.",
    roleLabel: "My role",
    decisionLabel: "Key trade-off",
    otherKicker: "Other Practice",
    otherTitle: "Product practice in coursework and campus life",
    pageTitle_education: "Song He | Education & Product Practice",
    pageTitle_work: "Song He | AI Product Cases",
    footRights: "All rights reserved.",
  },
};

/* Kinetic statement: substrings that get accent colors (in order). */
const kineticHighlights = {
  zh: ["做出来", "接着改"],
  en: ["build it", "keep fixing it"],
};

/* Public cases first; supporting practice stays visually secondary. */
const projects = [
  {
    id: "hardnest",
    primary: true,
    accent: "#ff6714",
    image: "assets/hardnest-card.webp",
    capabilities: ["framing", "experience", "delivery"],
    status: { zh: "LIVE DEMO · 已部署", en: "LIVE DEMO · DEPLOYED" },
    tags: {
      zh: ["品牌命题", "响应式体验", "静态部署"],
      en: ["Brand premise", "Responsive experience", "Static deployment"],
    },
    title: { zh: "Hard Nest 品牌概念网站", en: "Hard Nest Brand Concept" },
    metrics: [
      { k: { zh: "三页 Demo", en: "Three pages" }, v: { zh: "完整叙事", en: "Full narrative" } },
      { k: { zh: "响应式", en: "Responsive" }, v: { zh: "桌面与手机", en: "Desktop & mobile" } },
      { k: { zh: "静态部署", en: "Static deploy" }, v: { zh: "公开可访问", en: "Publicly live" } },
    ],
    desc: {
      zh: "围绕“人宠共居”梳理品牌叙事、视觉系统与响应式浏览体验，完成可在桌面和手机访问的三页静态 Demo。",
      en: "Translated the shared-living premise into a brand narrative, visual system, and responsive browsing experience, delivered as a three-page static demo across desktop and mobile.",
    },
    role: {
      zh: "负责品牌命题、信息结构、视觉方向与体验验收；页面实现由 AI 分担。",
      en: "Owned the brand premise, information structure, visual direction, and experience acceptance; AI handled part of the page implementation.",
    },
    decision: {
      zh: "只用几个关键场景建立记忆点；项目定位为概念稿，不包装成商业委托案例。",
      en: "Only a few key scenes carry the memory points; positioned as a concept site, not presented as client work.",
    },
    links: [
      {
        label: { zh: "查看 Live Demo", en: "View Live Demo" },
        href: "/demos/hardnest/",
      },
    ],
  },
  {
    id: "echonote",
    primary: true,
    accent: "#6e5bff",
    image: "assets/echonote-lecture-card.webp",
    capabilities: ["framing", "experience", "intelligence", "delivery"],
    status: { zh: "APP STORE · 已上线", en: "APP STORE · SHIPPED" },
    tags: {
      zh: ["AI 能力产品化", "端侧隐私", "学习体验"],
      en: ["AI productization", "On-device privacy", "Learning experience"],
    },
    title: { zh: "EchoNote Lecture", en: "EchoNote Lecture" },
    metrics: [
      { k: { zh: "端侧处理", en: "On-device" }, v: { zh: "核心不上云", en: "Core stays local" } },
      { k: { zh: "实时转写", en: "Live transcript" }, v: { zh: "课堂英文", en: "English lectures" } },
      { k: { zh: "逐句翻译", en: "Sentence-level" }, v: { zh: "中文对照", en: "Chinese alongside" } },
    ],
    desc: {
      zh: "把课堂录音、实时英文转写与逐句中文翻译组织成端侧学习流程。核心处理不上传云端；首次下载语言资源需要联网。",
      en: "Structured recording, live English transcription, and sentence-level Chinese translation into an on-device lecture workflow. Core processing stays off the cloud; the first language-resource download needs a connection.",
    },
    role: {
      zh: "定义上课记录与课后复习场景，负责核心流程、隐私边界与发布验收。",
      en: "Defined the lecture-capture and review scenario; owned the core flow, the privacy boundary, and release acceptance.",
    },
    decision: {
      zh: "录音与原文始终可回放；翻译作为逐句参考，不替代原始内容。",
      en: "Audio and source text stay replayable; translation serves as sentence-level reference rather than a replacement.",
    },
    links: [
      {
        label: { zh: "App Store", en: "App Store" },
        href: "https://apps.apple.com/us/app/echonote-lecture/id6793649753",
      },
    ],
  },
  {
    id: "liquid",
    primary: true,
    accent: "#2fbf9b",
    images: [
      {
        src: "assets/liquid-deadline-at-a-glance.png",
        alt: {
          zh: "Liquid Deadline 应用内任务时间线界面",
          en: "Liquid Deadline in-app task timeline",
        },
      },
      {
        src: "assets/liquid-deadline-home-screen.png",
        alt: {
          zh: "Liquid Deadline 真实桌面小组件界面",
          en: "Liquid Deadline real home-screen widgets",
        },
      },
    ],
    capabilities: ["framing", "experience", "delivery"],
    status: { zh: "APP STORE · 已上线", en: "APP STORE · SHIPPED" },
    tags: {
      zh: ["0→1 产品", "时间可视化", "发布验收"],
      en: ["0-to-1 product", "Time visualization", "Release acceptance"],
    },
    title: { zh: "Liquid Deadline", en: "Liquid Deadline" },
    metrics: [
      { k: { zh: "App Store", en: "App Store" }, v: { zh: "可下载", en: "Downloadable" } },
      { k: { zh: "iCloud 同步", en: "iCloud sync" }, v: { zh: "可选开启", en: "Optional" } },
      { k: { zh: "桌面小组件", en: "Home widgets" }, v: { zh: "一眼可见", en: "At a glance" } },
    ],
    desc: {
      zh: "围绕“截止时间如何一眼可见”完成任务时间线、可选 iCloud 同步与桌面小组件，并推进到 App Store 可下载版本。",
      en: "Built around making deadlines visible at a glance, with a task timeline, optional iCloud sync, and home-screen widgets, then carried it through to an App Store release.",
    },
    role: {
      zh: "负责问题定义、信息层级、版本范围、测试与上架；原型与实现由 AI 分担。",
      en: "Owned problem definition, information hierarchy, release scope, testing, and publishing; AI handled part of the prototyping and implementation.",
    },
    decision: {
      zh: "不做成复杂的项目管理工具；优先让剩余时间与任务优先级在主屏上一眼可见。",
      en: "Not built as a full project-management tool; remaining time and task priority come first, visible at a glance from the home screen.",
    },
    links: [
      {
        label: { zh: "App Store", en: "App Store" },
        href: "https://apps.apple.com/us/app/liquid-deadline/id6760516153",
      },
      {
        label: { zh: "GitHub", en: "GitHub" },
        href: "https://github.com/QianMo0729/liquid-deadline",
      },
    ],
  },
  {
    id: "xiangqi",
    accent: "#c0453a",
    image: "assets/xiangqi-card.png",
    status: { zh: "课程项目", en: "COURSE PROJECT" },
    tags: { zh: ["规则实现", "可玩原型"], en: ["Rules", "Playable prototype"] },
    title: { zh: "SUSTech XiangQi", en: "SUSTech XiangQi" },
    desc: {
      zh: "SUSTech CS109 课程中的中国象棋实现，完成可用对弈流程。",
      en: "A Chinese-chess implementation for SUSTech CS109, completed as a playable flow.",
    },
    links: [
      {
        label: { zh: "GitHub", en: "GitHub" },
        href: "https://github.com/QianMo0729/SUSTech-XiangQi",
      },
    ],
  },
  {
    id: "campus",
    accent: "#e8890c",
    image: "assets/campus-proposal-card.png",
    status: { zh: "校园实践", en: "CAMPUS PRACTICE" },
    tags: { zh: ["问题调研", "方案表达"], en: ["Problem research", "Proposal"] },
    title: { zh: "校园提案 · 一等奖", en: "Campus Proposal · First Prize" },
    desc: {
      zh: "从校园真实问题出发形成提案并获得一等奖；当前作为履历自述展示。",
      en: "Turned a real campus problem into a first-prize proposal, presented here as a resume claim.",
    },
    links: [
      {
        label: { zh: "校园经历", en: "Campus context" },
        href: "education.html#campus",
      },
    ],
  },
];

/* ── helpers ─────────────────────────────────────────────────────────── */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

/* ── reveal-on-scroll ────────────────────────────────────────────────── */

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
      )
    : null;

const observeReveal = (element) => {
  if (!prefersReducedMotion.matches && element.dataset.delay) {
    element.style.transitionDelay = Number(element.dataset.delay) * 90 + "ms";
    element.addEventListener(
      "transitionend",
      () => {
        element.style.transitionDelay = "0ms";
      },
      { once: true }
    );
  }
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add("is-in");
};

/* ── pointer FX: glare vars + ID-card tilt ───────────────────────────── */

const bindGlare = (element) => {
  if (!canHover.matches || prefersReducedMotion.matches) return;
  if (element.dataset.fxBound) return;
  element.dataset.fxBound = "1";

  element.addEventListener("pointerenter", () => {
    if (element.hasAttribute("data-holo") && !element.classList.contains("is-gyro-live")) {
      element.classList.add("is-pointer-live");
    }
  });
  element.addEventListener("pointermove", (event) => {
    if (element.hasAttribute("data-holo") && element.classList.contains("is-gyro-live")) return;
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    element.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    if (element.hasAttribute("data-holo")) {
      element.style.setProperty("--id-rx", (-(py - 0.5) * 9).toFixed(2) + "deg");
      element.style.setProperty("--id-ry", ((px - 0.5) * 11).toFixed(2) + "deg");
    }
  });
  element.addEventListener("pointerleave", () => {
    if (!element.hasAttribute("data-holo") || element.classList.contains("is-gyro-live")) return;
    element.classList.remove("is-pointer-live");
    element.style.setProperty("--id-rx", "0deg");
    element.style.setProperty("--id-ry", "0deg");
    element.style.setProperty("--mx", "50%");
    element.style.setProperty("--my", "50%");
  });
};

/* ── mobile ID card: device-orientation tilt ───────────────────────── */

const bindIdCardMotion = () => {
  const idCard = document.querySelector(".id-card[data-holo]");
  const toggle = document.querySelector("[data-gyro-toggle]");
  const toggleLabel = document.querySelector("[data-gyro-label]");
  const status = document.querySelector("[data-gyro-status]");
  const OrientationEvent = window.DeviceOrientationEvent;

  if (!idCard || !toggle || !toggleLabel || !status) return;

  const mobileViewport = window.matchMedia("(max-width: 900px) and (pointer: coarse)");
  const needsPermission =
    Boolean(OrientationEvent) && typeof OrientationEvent.requestPermission === "function";
  const supportsOrientation = Boolean(OrientationEvent) && window.isSecureContext;
  let permissionGranted = !needsPermission;
  let sensorAttached = false;
  let cardInView = !("IntersectionObserver" in window);
  let baseline = null;
  let animationFrame = 0;
  let current = { rx: 0, ry: 0 };
  let target = { rx: 0, ry: 0 };

  const setCopy = (labelKey, statusKey = "") => {
    const dictionary = translations[currentLanguage()];
    toggleLabel.dataset.i18n = labelKey;
    toggleLabel.textContent = dictionary[labelKey];
    if (statusKey) {
      status.dataset.i18n = statusKey;
      status.textContent = dictionary[statusKey];
    } else {
      status.removeAttribute("data-i18n");
      status.textContent = "";
    }
  };

  const screenTilt = (beta, gamma) => {
    const rawAngle = window.screen?.orientation?.angle ?? window.orientation ?? 0;
    const angle = ((Math.round(Number(rawAngle) / 90) * 90) % 360 + 360) % 360;
    if (angle === 90) return { x: beta, y: -gamma };
    if (angle === 180) return { x: -gamma, y: -beta };
    if (angle === 270) return { x: -beta, y: gamma };
    return { x: gamma, y: beta };
  };

  const writePose = () => {
    idCard.style.setProperty("--id-rx", current.rx.toFixed(3) + "deg");
    idCard.style.setProperty("--id-ry", current.ry.toFixed(3) + "deg");
    idCard.style.setProperty("--mx", (50 + (current.ry / 5) * 22).toFixed(2) + "%");
    idCard.style.setProperty("--my", (50 - (current.rx / 4) * 18).toFixed(2) + "%");
  };

  const animatePose = () => {
    animationFrame = 0;
    current.rx += (target.rx - current.rx) * 0.18;
    current.ry += (target.ry - current.ry) * 0.18;
    writePose();

    const distance = Math.max(Math.abs(target.rx - current.rx), Math.abs(target.ry - current.ry));
    if (distance > 0.015 && sensorAttached && !prefersReducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(animatePose);
    }
  };

  const schedulePose = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(animatePose);
  };

  const resetPose = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    baseline = null;
    current = { rx: 0, ry: 0 };
    target = { rx: 0, ry: 0 };
    idCard.classList.remove("is-gyro-live");
    idCard.style.setProperty("--id-rx", "0deg");
    idCard.style.setProperty("--id-ry", "0deg");
    idCard.style.setProperty("--mx", "50%");
    idCard.style.setProperty("--my", "50%");
  };

  const onOrientation = (event) => {
    if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    const tilt = screenTilt(event.beta, event.gamma);

    if (!baseline) {
      baseline = tilt;
      idCard.classList.remove("is-pointer-live");
      idCard.classList.add("is-gyro-live");
      setCopy("gyroEnable", "gyroActive");
      return;
    }

    const horizontal = clamp(tilt.x - baseline.x, -18, 18);
    const vertical = clamp(tilt.y - baseline.y, -18, 18);
    target.ry = (horizontal / 18) * 5;
    target.rx = (-vertical / 18) * 4;
    schedulePose();
  };

  const detachSensor = () => {
    if (sensorAttached) window.removeEventListener("deviceorientation", onOrientation);
    sensorAttached = false;
    resetPose();
  };

  const canRun = () =>
    supportsOrientation &&
    mobileViewport.matches &&
    !prefersReducedMotion.matches &&
    permissionGranted &&
    cardInView &&
    document.visibilityState !== "hidden";

  const refreshSensor = () => {
    if (!canRun()) {
      detachSensor();
      return;
    }
    if (!sensorAttached) {
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
      sensorAttached = true;
    }
  };

  const updateAvailability = () => {
    const available =
      supportsOrientation && mobileViewport.matches && !prefersReducedMotion.matches;

    if (!available) {
      toggle.hidden = true;
      toggle.setAttribute("aria-pressed", "false");
      detachSensor();
      return;
    }

    if (needsPermission && !permissionGranted) {
      toggle.hidden = !cardInView;
      detachSensor();
      return;
    }

    toggle.hidden = true;
    refreshSensor();
  };

  toggle.addEventListener("click", async () => {
    let permissionRequest;
    try {
      permissionRequest = OrientationEvent.requestPermission();
    } catch {
      setCopy("gyroRetry", "gyroDenied");
      return;
    }

    toggle.disabled = true;
    try {
      const permission = await permissionRequest;
      permissionGranted = permission === "granted";
      toggle.setAttribute("aria-pressed", permissionGranted ? "true" : "false");
      if (permissionGranted) setCopy("gyroEnable", "gyroActive");
      else setCopy("gyroRetry", "gyroDenied");
    } catch {
      permissionGranted = false;
      toggle.setAttribute("aria-pressed", "false");
      setCopy("gyroRetry", "gyroDenied");
    } finally {
      toggle.disabled = false;
      updateAvailability();
    }
  });

  const resetForOrientationChange = () => {
    resetPose();
    refreshSensor();
  };

  if (window.screen?.orientation?.addEventListener) {
    window.screen.orientation.addEventListener("change", resetForOrientationChange);
  } else {
    window.addEventListener("orientationchange", resetForOrientationChange);
  }

  mobileViewport.addEventListener?.("change", updateAvailability);
  prefersReducedMotion.addEventListener?.("change", updateAvailability);
  document.addEventListener("visibilitychange", updateAvailability);
  window.addEventListener("focus", updateAvailability);
  window.addEventListener("pagehide", detachSensor);
  window.addEventListener("pageshow", updateAvailability);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        cardInView = Boolean(entry?.isIntersecting);
        updateAvailability();
      },
      { threshold: 0.1 }
    );
    visibilityObserver.observe(idCard);
  } else {
    updateAvailability();
  }
};

/* ── evidence-led project cases ──────────────────────────────────────── */

const projectsGrid = document.querySelector("[data-projects-grid]");
const otherProjectsGrid = document.querySelector("[data-other-projects]");
let projectsRenderedOnce = false;

const appendProjectLinks = (container, project, language) => {
  if (!project.links?.length) return;
  const links = document.createElement("div");
  links.className = "case-links";

  project.links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.textContent = link.label[language] + " ↗";
    if (/^https?:/.test(link.href)) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }
    links.appendChild(anchor);
  });

  container.appendChild(links);
};

const buildProjectMedia = (project, language, index, className, badges = true) => {
  const media = document.createElement("div");
  media.className = className;

  if (project.images?.length) {
    media.classList.add("is-screenshots");
    const screenshots = document.createElement("div");
    screenshots.className = "case-screenshot-pair";
    project.images.forEach((image) => {
      const screenshot = document.createElement("img");
      screenshot.className = "case-screenshot";
      screenshot.src = image.src;
      screenshot.alt = image.alt?.[language] || "";
      screenshot.loading = "lazy";
      screenshot.decoding = "async";
      screenshots.appendChild(screenshot);
    });
    media.appendChild(screenshots);
  } else if (project.image) {
    media.style.backgroundImage = "url('" + project.image + "')";
  }

  if (!badges) return media;

  const status = document.createElement("span");
  status.className = "case-status";
  status.innerHTML = '<i aria-hidden="true"></i><span></span>';
  status.querySelector("span").textContent = project.status[language];
  media.appendChild(status);

  const number = document.createElement("span");
  number.className = "case-number";
  number.textContent = String(index + 1).padStart(2, "0");
  media.appendChild(number);
  return media;
};

/* A shipped case gets a full-width stage: copy on one side, product art on the
   other, sides alternating down the page. */
const buildCaseCard = (project, language, index, instant) => {
  const stage = document.createElement("article");
  stage.className = "stage";
  stage.dataset.case = project.id;
  stage.dataset.capabilities = project.capabilities.join(" ");
  stage.setAttribute("data-rise", "");
  stage.style.setProperty("--accent", project.accent);
  stage.dataset.delay = String(index);
  if (instant) stage.classList.add("is-in");

  const inner = document.createElement("div");
  inner.className = "stage-inner";

  const copy = document.createElement("div");
  copy.className = "stage-copy";

  const eyebrow = document.createElement("p");
  eyebrow.className = "stage-eyebrow";
  eyebrow.innerHTML = '<i aria-hidden="true"></i><span></span><b aria-hidden="true"></b>';
  eyebrow.querySelector("span").textContent = project.status[language];
  eyebrow.querySelector("b").textContent = String(index + 1).padStart(2, "0");
  copy.appendChild(eyebrow);

  const title = document.createElement("h2");
  title.className = "stage-title";
  title.textContent = project.title[language];
  copy.appendChild(title);

  const lede = document.createElement("p");
  lede.className = "stage-lede";
  lede.textContent = project.desc[language];
  copy.appendChild(lede);

  if (project.metrics?.length) {
    const spec = document.createElement("dl");
    spec.className = "stage-spec";
    project.metrics.forEach((metric) => {
      const cell = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = metric.k[language];
      detail.textContent = metric.v[language];
      cell.append(term, detail);
      spec.appendChild(cell);
    });
    copy.appendChild(spec);
  }

  const notes = document.createElement("div");
  notes.className = "stage-notes";
  [
    [translations[language].roleLabel, project.role[language]],
    [translations[language].decisionLabel, project.decision[language]],
  ].forEach(([label, value]) => {
    const note = document.createElement("div");
    note.className = "stage-note";
    const heading = document.createElement("h3");
    const body = document.createElement("p");
    heading.textContent = label;
    body.textContent = value;
    note.append(heading, body);
    notes.appendChild(note);
  });
  copy.appendChild(notes);

  const tags = document.createElement("div");
  tags.className = "stage-tags";
  (project.tags?.[language] || []).forEach((tag) => {
    const chip = document.createElement("span");
    chip.textContent = tag;
    tags.appendChild(chip);
  });
  copy.appendChild(tags);

  appendProjectLinks(copy, project, language);

  const media = buildProjectMedia(project, language, index, "stage-media", false);
  inner.append(copy, media);
  stage.appendChild(inner);

  return stage;
};

const buildPracticeCard = (project, language, index, instant) => {
  const card = document.createElement("article");
  card.className = "practice-card";
  card.setAttribute("data-rise", "");
  card.style.setProperty("--accent", project.accent);
  card.dataset.delay = String(index);
  if (instant) card.classList.add("is-in");

  const media = buildProjectMedia(project, language, index, "practice-media");
  card.appendChild(media);

  const body = document.createElement("div");
  body.className = "practice-body";
  const tags = document.createElement("p");
  tags.className = "practice-tags";
  tags.textContent = (project.tags?.[language] || []).join(" · ");
  const title = document.createElement("h3");
  title.textContent = project.title[language];
  const desc = document.createElement("p");
  desc.textContent = project.desc[language];
  body.append(tags, title, desc);
  appendProjectLinks(body, project, language);
  card.appendChild(body);

  return card;
};

const renderProjects = (language) => {
  if (!projectsGrid && !otherProjectsGrid) return;
  const instant = projectsRenderedOnce;
  const primaryProjects = projects.filter((project) => project.primary);
  const supportingProjects = projects.filter((project) => !project.primary);

  if (projectsGrid) {
    projectsGrid.innerHTML = "";
    primaryProjects.forEach((project, index) => {
      const card = buildCaseCard(project, language, index, instant);
      projectsGrid.appendChild(card);
      if (!instant) observeReveal(card);
    });
  }

  if (otherProjectsGrid) {
    otherProjectsGrid.innerHTML = "";
    supportingProjects.forEach((project, index) => {
      const card = buildPracticeCard(project, language, index, instant);
      otherProjectsGrid.appendChild(card);
      if (!instant) observeReveal(card);
    });
  }

  projectsRenderedOnce = true;
};

/* ── homepage capability story → matching project evidence ───────────── */

const capabilityStoryContent = {
  zh: [
    {
      kicker: "问题 → 范围 → 核心流程",
      title: "EchoNote · Liquid Deadline · Hard Nest",
      proof: "三个项目都从明确的使用场景开始，再决定第一版真正需要什么。",
    },
    {
      kicker: "语音 → 转写 → 翻译",
      title: "EchoNote Lecture",
      proof: "把端侧语音识别与逐句翻译放进课堂流程，并明确首次资源下载与隐私边界。",
    },
    {
      kicker: "研究 → 原型 → 实现 → 验收",
      title: "三个可运行项目",
      proof: "AI 加速制作；需求判断、体验取舍、测试与最终发布验收由我负责。",
    },
    {
      kicker: "APP STORE × 2 · LIVE DEMO × 1",
      title: "公开上线，是验证的起点",
      proof: "用可下载应用与可访问 Demo 代替能力自评，让下一轮迭代有真实起点。",
    },
  ],
  en: [
    {
      kicker: "PROBLEM → SCOPE → CORE FLOW",
      title: "EchoNote · Liquid Deadline · Hard Nest",
      proof: "Each project starts from a clear use context before deciding what the first release truly needs.",
    },
    {
      kicker: "SPEECH → TRANSCRIPTION → TRANSLATION",
      title: "EchoNote Lecture",
      proof: "Places on-device speech recognition and sentence-level translation inside a lecture flow, with explicit download and privacy boundaries.",
    },
    {
      kicker: "RESEARCH → PROTOTYPE → BUILD → ACCEPT",
      title: "Three working products",
      proof: "AI accelerates making; I retain ownership of requirements, experience trade-offs, testing, and final release acceptance.",
    },
    {
      kicker: "APP STORE × 2 · LIVE DEMO × 1",
      title: "Public launch starts validation",
      proof: "Downloadable apps and an accessible demo replace self-ratings with evidence and give the next iteration a real starting point.",
    },
  ],
};

const capabilityStory = document.querySelector("[data-capability-story]");
const capabilityStepButtons = capabilityStory
  ? Array.from(capabilityStory.querySelectorAll("[data-capability-step-button]"))
  : [];
const capabilityStageCopy = capabilityStory?.querySelector("[data-capability-stage-copy]");
const capabilityStageKicker = capabilityStory?.querySelector("[data-capability-stage-kicker]");
const capabilityStageTitle = capabilityStory?.querySelector("[data-capability-stage-title]");
const capabilityStageProof = capabilityStory?.querySelector("[data-capability-stage-proof]");
const capabilityRouteNodes = capabilityStory
  ? Array.from(capabilityStory.querySelectorAll(".route-node"))
  : [];
let activeCapabilityStep = 0;
let capabilityStepObserver = null;

const activateCapabilityStory = (
  requestedIndex,
  language = currentLanguage(),
  animate = true,
) => {
  if (!capabilityStory || !capabilityStepButtons.length) return;
  const index = clamp(Number(requestedIndex) || 0, 0, capabilityStepButtons.length - 1);
  const content = capabilityStoryContent[language][index];
  const changed = index !== activeCapabilityStep;
  activeCapabilityStep = index;
  capabilityStory.dataset.capabilityStep = String(index);

  capabilityStepButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  capabilityRouteNodes.forEach((node, nodeIndex) => {
    node.classList.toggle("is-reached", nodeIndex <= index);
    node.classList.toggle("is-current", nodeIndex === index);
  });

  capabilityStageKicker.textContent = content.kicker;
  capabilityStageTitle.textContent = content.title;
  capabilityStageProof.textContent = content.proof;

  if (
    animate &&
    changed &&
    !prefersReducedMotion.matches &&
    typeof capabilityStageCopy?.animate === "function"
  ) {
    capabilityStageCopy.getAnimations().forEach((animation) => animation.cancel());
    capabilityStageCopy.animate(
      [
        { opacity: 0.16, transform: "translate3d(0, 6px, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
      ],
      { duration: 280, easing: "cubic-bezier(.2,0,0,1)" },
    );
  }
};

capabilityStepButtons.forEach((button) => {
  const step = Number(button.dataset.capabilityStepButton);
  button.addEventListener("click", () => activateCapabilityStory(step));
  button.addEventListener("focus", () => activateCapabilityStory(step));
  if (canHover.matches) {
    button.addEventListener("pointerenter", () => activateCapabilityStory(step));
  }
});

const configureCapabilityStoryObserver = () => {
  capabilityStepObserver?.disconnect();
  capabilityStepObserver = null;
  if (
    !capabilityStory ||
    !window.matchMedia("(min-width: 901px)").matches ||
    prefersReducedMotion.matches ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  capabilityStepObserver = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries.find((entry) => entry.isIntersecting);
      if (activeEntry) {
        activateCapabilityStory(activeEntry.target.dataset.capabilityStepButton);
      }
    },
    { rootMargin: "-47% 0px -47% 0px", threshold: 0 },
  );
  capabilityStepButtons.forEach((button) => capabilityStepObserver.observe(button));
};

prefersReducedMotion.addEventListener?.("change", configureCapabilityStoryObserver);
window.matchMedia("(min-width: 901px)").addEventListener?.(
  "change",
  configureCapabilityStoryObserver,
);
configureCapabilityStoryObserver();

/* ── kinetic statement (scroll-scrubbed character fill) ──────────────── */

const kineticSection = document.querySelector("[data-kinetic]");
const kineticTextEl = document.querySelector("[data-kinetic-text]");
let kineticTokens = [];

const buildKinetic = (language) => {
  if (!kineticTextEl) return;
  const text = translations[language].kineticText;
  kineticTextEl.setAttribute("aria-label", text);

  const ranges = [];
  let cursor = 0;
  (kineticHighlights[language] || []).forEach((phrase, order) => {
    const at = text.indexOf(phrase, cursor);
    if (at !== -1) {
      ranges.push({ start: at, end: at + phrase.length, order });
      cursor = at + phrase.length;
    }
  });

  const tokens =
    language === "zh" ? Array.from(text) : text.split(/(\s+)/).filter((part) => part.length);

  kineticTextEl.textContent = "";
  kineticTokens = [];
  let offset = 0;
  tokens.forEach((token) => {
    const span = document.createElement("span");
    span.className = /^\s+$/.test(token) ? "ch sp" : "ch";
    span.setAttribute("aria-hidden", "true");
    const range = ranges.find(
      (candidate) => offset < candidate.end && offset + token.length > candidate.start
    );
    if (range) span.classList.add("hl-" + (range.order % 3));
    span.textContent = token;
    kineticTextEl.appendChild(span);
    kineticTokens.push(span);
    offset += token.length;
  });

  updateKinetic();
};

const updateKinetic = () => {
  if (!kineticSection || !kineticTokens.length || prefersReducedMotion.matches) return;
  const rect = kineticSection.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = clamp((vh * 0.92 - rect.top) / (vh * 0.72), 0, 1);
  const count = kineticTokens.length;

  kineticTokens.forEach((token, index) => {
    const local = clamp((progress - (index / count) * 0.72) / 0.28, 0, 1);
    token.style.opacity = (0.13 + local * 0.87).toFixed(3);
  });
};

/* ── i18n ────────────────────────────────────────────────────────────── */

const langToggle = document.querySelector("[data-lang-toggle]");
const langCurrent = document.querySelector("[data-lang-current]");
const pageId = document.body.dataset.page || "home";

const setLanguage = (language) => {
  const nextLanguage = translations[language] ? language : "zh";
  const dictionary = translations[nextLanguage];
  const pageTitle = dictionary["pageTitle_" + pageId] || dictionary.pageTitle;
  const pageDescription =
    dictionary["pageDescription_" + pageId] || dictionary.pageDescription;

  document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
  document.title = pageTitle;
  setMetaContent('meta[name="description"]', pageDescription);
  setMetaContent('meta[property="og:title"]', pageTitle);
  setMetaContent('meta[property="og:description"]', pageDescription);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value !== undefined) element.textContent = value;
  });

  /* Bilingual label pairs: the active language sits on top, the other one
     underneath. Switching languages swaps which is which. */
  const alternate = translations[nextLanguage === "zh" ? "en" : "zh"];
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const value = alternate[element.dataset.i18nAlt];
    if (value !== undefined) element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = dictionary[element.dataset.i18nAriaLabel];
    if (value !== undefined) element.setAttribute("aria-label", value);
  });

  buildKinetic(nextLanguage);
  renderProjects(nextLanguage);
  activateCapabilityStory(activeCapabilityStep, nextLanguage, false);

  if (langCurrent) langCurrent.textContent = nextLanguage === "zh" ? "EN" : "中";
  if (langToggle) langToggle.setAttribute("aria-label", dictionary.langAria);

  writeStoredLanguage(nextLanguage);
};

/* ── dock: magnification + scrollspy ─────────────────────────────────── */

const dock = document.querySelector("[data-dock]");
const dockItems = dock ? Array.from(dock.querySelectorAll(".dock-item")) : [];

if (dock && canHover.matches && !prefersReducedMotion.matches) {
  dock.addEventListener("pointerenter", () => dock.classList.add("is-magnify"));
  dock.addEventListener("pointermove", (event) => {
    dockItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
      const influence = clamp(1 - distance / 115, 0, 1);
      const eased = influence * influence;
      item.style.transform =
        "translateY(" + (-9 * eased).toFixed(2) + "px) scale(" + (1 + 0.36 * eased).toFixed(3) + ")";
    });
  });
  dock.addEventListener("pointerleave", () => {
    dock.classList.remove("is-magnify");
    dockItems.forEach((item) => {
      item.style.transform = "";
    });
  });
}

/* Multi-page: highlight the dock item matching the current file. */
const currentFile = window.location.pathname.split("/").pop() || "index.html";
dockItems.forEach((item) => {
  if (item.getAttribute("href") === currentFile) {
    item.classList.add("is-active");
    item.setAttribute("aria-current", "page");
  }
});

/* ── clock (Shenzhen time) ───────────────────────────────────────────── */

const clockEl = document.querySelector("[data-clock]");
if (clockEl) {
  let clockFormat = null;
  try {
    clockFormat = new Intl.DateTimeFormat("zh-CN", {
      hour12: false,
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    clockFormat = null;
  }
  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = clockFormat
      ? clockFormat.format(now)
      : now.toTimeString().slice(0, 8);
  };
  updateClock();
  window.setInterval(updateClock, 1000);
}

/* ── signature draw-on ───────────────────────────────────────────────── */

const signature = document.querySelector("[data-signature]");
if (signature) {
  if ("IntersectionObserver" in window) {
    const signatureObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          signature.classList.add("is-in");
          signatureObserver.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    signatureObserver.observe(signature);
  } else {
    signature.classList.add("is-in");
  }
}

/* ── scroll loop (kinetic scrub) ─────────────────────────────────────── */

let scrollTicking = false;
const onScroll = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    scrollTicking = false;
    updateKinetic();
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

/* ── init ────────────────────────────────────────────────────────────── */

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

setLanguage(readStoredLanguage() || "zh");

document.querySelectorAll("[data-rise]").forEach((element) => {
  if (!element.closest("[data-projects-grid]")) observeReveal(element);
});

document.querySelectorAll(".card, .id-card").forEach(bindGlare);
bindIdCardMotion();

langToggle?.addEventListener("click", () => {
  setLanguage(currentLanguage() === "zh" ? "en" : "zh");
});
