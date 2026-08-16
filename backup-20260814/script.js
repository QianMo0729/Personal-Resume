/* Song He — resume site (aurora edition)
   Vanilla JS: i18n, data-driven bento project grid, kinetic scrubbed text,
   dock magnification, pointer glare/tilt, sticky phone showcase.

   To add a project, append one entry to the `projects` array below and drop
   its image into assets/. Numbering, layout, both languages and animations
   are handled automatically — the grid wraps to any number of projects. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

/* ── content ─────────────────────────────────────────────────────────── */

const translations = {
  zh: {
    pageTitle: "宋和 | iOS Product Engineer",
    pageDescription:
      "宋和的个人简历网站：iOS 产品工程、SwiftUI、CloudKit、WidgetKit、算法与真实项目经历。",
    skipLink: "跳到主体内容",
    statusPill: "开放实习机会",
    dockHome: "首页",
    dockEducation: "教育",
    dockCampus: "校园",
    dockWork: "作品",
    dockContact: "联系",
    dockLang: "语言",
    langAria: "Switch to English",
    heroHello: "你好，我是",
    heroRole: "iOS 工程师 · 产品思维 · 南方科技大学 2029 届",
    ctaApp: "查看上线应用 ↗",
    heroLoc: "深圳 · 中国",
    heroHint: "向下滚动",
    kineticText: "代码要被做完、被打磨、被真实的人用起来。",
    eduKicker: "教育",
    eduTitle: "南方科技大学",
    eduNote: "通识与学科基础部，本科在读。在数理与编程基础之上，把课程知识持续变成能交付的作品。",
    eduStackLabel: "技术栈",
    idField1: "身份",
    idRole: "本科在读",
    idField2: "院系",
    idDept: "通识与学科基础部",
    idField3: "年份",
    campusKicker: "校园",
    campusTitle: "把真实问题，推进成方案。",
    campusNote: "学生会、提案大赛、学生发展与指导中心——在校园里练习协作、表达与落地。",
    campusC1Title: "学生会",
    campusC1Desc: "跨部门协作，推动校园活动落地。",
    campusC2Title: "提案大赛",
    campusC2Desc: "校园提案 · 一等奖。",
    campusC3Title: "学生发展与指导中心",
    campusC3Desc: "服务同学的成长与发展。",
    showKicker: "代表作",
    showS1T: "设计",
    showS1D: "液态玻璃视觉、克制的界面与轻盈的交互。",
    showS2T: "开发",
    showS2D: "SwiftUI 构建，CloudKit 同步，WidgetKit 桌面小组件。",
    showS3T: "上架",
    showS3D: "通过 App Store 审核，正式对外发布。",
    showLink: "在 App Store 查看 ↗",
    workKicker: "作品",
    workTitle: "作品集",
    workCount: "共 {n} 个项目",
    workAll: "GitHub 全部仓库 ↗",
    contactKicker: "联系",
    contactTitle: "来聊聊。",
    contactNote: "日常实习、项目协作，或只是聊聊 iOS 与产品——都欢迎。",
    contactMail: "发邮件 ↗",
    contactCopy: "复制邮箱",
    contactCopied: "已复制 ✓",
    footNote: "本站由 HTML / CSS / JS 手写完成，无框架。",
    footRights: "保留所有权利。",
  },
  en: {
    pageTitle: "Song He | iOS Product Engineer",
    pageDescription:
      "Song He's resume site: iOS product engineering, SwiftUI, CloudKit, WidgetKit, algorithms, and shipped work.",
    skipLink: "Skip to main content",
    statusPill: "Open to internships",
    dockHome: "Home",
    dockEducation: "Education",
    dockCampus: "Campus",
    dockWork: "Work",
    dockContact: "Contact",
    dockLang: "Lang",
    langAria: "切换到中文",
    heroHello: "Hi, I'm",
    heroRole: "iOS Engineer · Product Thinking · SUSTech Class of 2029",
    ctaApp: "Live on App Store ↗",
    heroLoc: "Shenzhen, China",
    heroHint: "Scroll",
    kineticText: "Code should be finished, polished, and used by real people.",
    eduKicker: "Education",
    eduTitle: "SUSTech",
    eduNote:
      "General & foundational studies, undergraduate. Building on math and programming fundamentals — turning coursework into shippable work.",
    eduStackLabel: "Stack",
    idField1: "Status",
    idRole: "Undergraduate",
    idField2: "Department",
    idDept: "General & Foundational Studies",
    idField3: "Years",
    campusKicker: "Campus",
    campusTitle: "Turning real problems into working plans.",
    campusNote:
      "Student Union, the proposal competition, and the Student Development Center — practicing collaboration, communication, and delivery.",
    campusC1Title: "Student Union",
    campusC1Desc: "Cross-team collaboration to deliver campus events.",
    campusC2Title: "Proposal Competition",
    campusC2Desc: "Campus proposal · First prize.",
    campusC3Title: "Student Development Center",
    campusC3Desc: "Supporting students' growth and development.",
    showKicker: "Featured work",
    showS1T: "Design",
    showS1D: "Liquid-glass visuals, restrained UI, lightweight interactions.",
    showS2T: "Build",
    showS2D: "Built with SwiftUI; CloudKit sync; WidgetKit widgets.",
    showS3T: "Ship",
    showS3D: "Approved and released on the App Store.",
    showLink: "View on App Store ↗",
    workKicker: "Work",
    workTitle: "Portfolio",
    workCount: "{n} projects",
    workAll: "All repositories on GitHub ↗",
    contactKicker: "Contact",
    contactTitle: "Say hello.",
    contactNote: "Internships, collaboration, or just talking iOS and product — all welcome.",
    contactMail: "Email me ↗",
    contactCopy: "Copy email",
    contactCopied: "Copied ✓",
    footNote: "Hand-built with vanilla HTML / CSS / JS — no frameworks.",
    footRights: "All rights reserved.",
  },
};

/* Kinetic statement: substrings that get accent colors (in order). */
const kineticHighlights = {
  zh: ["做完", "打磨", "用起来"],
  en: ["finished", "polished", "used"],
};

const CONTACT_EMAIL = "12512808@mail.sustech.edu.cn";

/* Add new projects here — one entry each, any number of them. */
const projects = [
  {
    id: "liquid",
    featured: true,
    accent: "#2fbf9b",
    image: "assets/liquid-deadline-card.png",
    tags: { zh: ["SwiftUI", "CloudKit", "WidgetKit"], en: ["SwiftUI", "CloudKit", "WidgetKit"] },
    title: { zh: "Liquid Deadline", en: "Liquid Deadline" },
    desc: {
      zh: "独立开发并上架 App Store 的 iOS 应用：SwiftUI 构建，iCloud 同步，桌面小组件。",
      en: "Independently built and shipped to the App Store: SwiftUI, iCloud sync, home-screen widgets.",
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
    tags: { zh: ["Java", "JavaFX", "算法"], en: ["Java", "JavaFX", "Algorithms"] },
    title: { zh: "SUSTech XiangQi", en: "SUSTech XiangQi" },
    desc: {
      zh: "用 Java / JavaFX 实现的中国象棋对弈程序。",
      en: "Chinese chess (XiangQi) built with Java / JavaFX.",
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
    tags: { zh: ["产品", "提案"], en: ["Product", "Proposal"] },
    title: { zh: "校园提案 · 一等奖", en: "Campus Proposal · First Prize" },
    desc: {
      zh: "校园提案大赛一等奖方案。",
      en: "First-prize proposal in the campus proposal competition.",
    },
    links: [
      {
        label: { zh: "联系了解", en: "Contact" },
        href: "mailto:" + CONTACT_EMAIL,
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

  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    element.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    if (element.hasAttribute("data-holo")) {
      element.style.transform =
        "perspective(900px) rotateX(" +
        (-(py - 0.5) * 9).toFixed(2) +
        "deg) rotateY(" +
        ((px - 0.5) * 11).toFixed(2) +
        "deg)";
    }
  });
  element.addEventListener("pointerleave", () => {
    if (element.hasAttribute("data-holo")) element.style.transform = "";
  });
};

/* ── project grid (scales to any number of projects) ─────────────────── */

const projectsGrid = document.querySelector("[data-projects-grid]");
const projectCount = document.querySelector("[data-project-count]");
let projectsRenderedOnce = false;

const renderProjects = (language) => {
  if (!projectsGrid) return;
  const instant = projectsRenderedOnce;

  projectsGrid.innerHTML = "";
  projects.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "card" + (project.featured ? " featured" : "");
    card.setAttribute("data-rise", "");
    card.style.setProperty("--accent", project.accent || "#2fbf9b");
    if (instant) card.classList.add("is-in");
    else if (!project.featured) card.dataset.delay = String(index % 3);

    const media = document.createElement("div");
    media.className = "card-media";
    media.style.backgroundImage = "url('" + project.image + "')";
    const number = document.createElement("span");
    number.className = "card-no";
    number.textContent = String(index + 1).padStart(2, "0");
    media.appendChild(number);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = project.title[language];
    body.appendChild(title);

    const tags = project.tags?.[language] || [];
    if (tags.length) {
      const tagRow = document.createElement("div");
      tagRow.className = "card-tags";
      tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.textContent = tag;
        tagRow.appendChild(chip);
      });
      body.appendChild(tagRow);
    }

    const desc = document.createElement("p");
    desc.textContent = project.desc[language];
    body.appendChild(desc);

    if (project.links?.length) {
      const links = document.createElement("div");
      links.className = "card-links";
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
      body.appendChild(links);
    }

    card.appendChild(media);
    card.appendChild(body);
    projectsGrid.appendChild(card);

    if (!instant) observeReveal(card);
    bindGlare(card);
  });

  if (projectCount) {
    projectCount.textContent = translations[language].workCount.replace(
      "{n}",
      String(projects.length)
    );
  }

  projectsRenderedOnce = true;
};

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

const setLanguage = (language) => {
  const nextLanguage = translations[language] ? language : "zh";
  const dictionary = translations[nextLanguage];

  document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
  document.title = dictionary.pageTitle;
  setMetaContent('meta[name="description"]', dictionary.pageDescription);
  setMetaContent('meta[property="og:title"]', dictionary.pageTitle);
  setMetaContent('meta[property="og:description"]', dictionary.pageDescription);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value !== undefined) element.textContent = value;
  });

  buildKinetic(nextLanguage);
  renderProjects(nextLanguage);

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

if (dock && "IntersectionObserver" in window) {
  const spyLinks = new Map(
    dockItems.filter((item) => item.dataset.spy).map((item) => [item.dataset.spy, item])
  );
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spyLinks.forEach((link, id) => {
          link.classList.toggle("is-active", id === entry.target.id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  spyLinks.forEach((link, id) => {
    const section = document.getElementById(id);
    if (section) spyObserver.observe(section);
  });
}

/* ── hero floating chips parallax ────────────────────────────────────── */

const hero = document.querySelector("[data-hero]");
const floatChips = Array.from(document.querySelectorAll(".f-chip"));

if (hero && floatChips.length && canHover.matches && !prefersReducedMotion.matches) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    floatChips.forEach((chip) => {
      const depth = Number(chip.dataset.depth) || 1;
      chip.style.transform =
        "translate3d(" + (nx * -34 * depth).toFixed(1) + "px, " + (ny * -24 * depth).toFixed(1) + "px, 0)";
    });
  });
  hero.addEventListener("pointerleave", () => {
    floatChips.forEach((chip) => {
      chip.style.transform = "";
    });
  });
}

/* ── showcase steps → phone tilt ─────────────────────────────────────── */

const showcase = document.querySelector("[data-showcase]");
if (showcase && "IntersectionObserver" in window) {
  const steps = Array.from(showcase.querySelectorAll(".step"));
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-on");
        showcase.dataset.step = entry.target.dataset.step;
      });
    },
    { threshold: 0.6 }
  );
  steps.forEach((step) => stepObserver.observe(step));
}

/* ── contact: copy email ─────────────────────────────────────────────── */

const copyButton = document.querySelector("[data-copy-email]");
let copyResetTimer = null;

copyButton?.addEventListener("click", async () => {
  const dictionary = translations[currentLanguage()];
  try {
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    copyButton.textContent = dictionary.contactCopied;
  } catch {
    copyButton.textContent = CONTACT_EMAIL;
  }
  window.clearTimeout(copyResetTimer);
  copyResetTimer = window.setTimeout(() => {
    copyButton.textContent = translations[currentLanguage()].contactCopy;
  }, 2000);
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

langToggle?.addEventListener("click", () => {
  setLanguage(currentLanguage() === "zh" ? "en" : "zh");
});
