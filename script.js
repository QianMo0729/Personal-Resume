/* Song He — AI product portfolio (paper edition)
   Vanilla JS shared by work.html, education.html and contact.html:
   i18n, evidence-led case rendering, dock magnification, and ID-card motion.
   The homepage (index.html) is the blueprint campus scene and does not load
   this file.

   To add a project, append one entry to the `projects` array below and drop
   its image into assets/. Numbering, layout, both languages and animations
   are handled automatically. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

/* ── content ─────────────────────────────────────────────────────────── */

const translations = {
  zh: {
    pageTitle: "宋和 | AI 产品经理方向",
    pageDescription:
      "宋和的 AI 产品经理作品集：从问题定义、体验设计到 AI 协作交付与公开上线。",
    pageTitle_education: "宋和 | 经历",
    pageDescription_education:
      "宋和的经历：众白科技实习、南方科技大学的科研与校园实践，目标岗位为 AI 产品经理。",
    pageTitle_work: "宋和 | AI 产品案例",
    pageDescription_work:
      "宋和的 AI 产品案例：用真实上线结果呈现产品定义、AI 能力产品化、体验设计与 0→1 交付。",
    pageTitle_contact: "宋和 | 联系",
    pageDescription_contact: "联系宋和：邮箱、电话与 GitHub。目标岗位为 AI 产品经理。",
    skipLink: "跳到主体内容",
    statusPill: "在找 AI 产品经理实习",
    navMain: "主导航",
    dockHome: "首页",
    dockEducation: "经历",
    dockWork: "案例",
    dockContact: "联系",
    dockLang: "语言",
    langAria: "Switch to English",
    xpKicker: "经历",
    xpTitle: "实习、科研与校园。",
    xpNavAria: "页内导航",
    xpNavIntern: "实习",
    xpNavResearch: "科研",
    xpNavEdu: "教育",
    xpNavCampus: "校园与书院",
    internKicker: "实习",
    internTitle: "众白科技",
    internNote: "校外实习。参与深圳进化酒馆黑客松的筹备，担任技术与产品团队负责人。",
    internWhen: "2026.09.21 – 24",
    internWhenLabel: "活动时间",
    internOrg: "深圳进化酒馆黑客松",
    internRole: "技术与产品团队负责人",
    internDesc: "参与进化酒馆 Agent 黑客松深圳收官场的筹备工作。活动连续四天，设四个赛道。",
    internLinkEvent: "黑客松官网",
    internLinkCompany: "众白科技",
    researchKicker: "科研",
    researchTitle: "从脑机接口，到数据可视化。",
    researchNote: "先后进入两个实验室：先做脑机接口解码，现在转向可视化方向。",
    lab1When: "2026.09 加入",
    lab1Tag: "当前",
    lab1Org: "马昱欣实验室",
    lab1Role: "可视化方向",
    lab1Desc: "围绕数据可视化与可视分析，探索信息如何被理解、表达与使用。刚加入，课题确定中。",
    lab1Link: "实验室研究方向",
    lab2When: "2026.04 加入",
    lab2Tag: "此前",
    lab2Org: "脑-机器人实验室",
    lab2Role: "张明明老师课题组 · 脑机接口相对距离解码",
    lab2Point1: "尝试用新的神经网络模型做代码适配与调参，对比 MAE 与 CC 能否进一步提升。",
    lab2Point2: "负责代码的修改与维护。",
    eduKicker: "教育",
    eduTitle: "南方科技大学",
    eduNote:
      "计算机科学与技术专业，2025 级本科在读，预计 2029 年毕业。平时关注产品怎么定义、AI 怎么变成真能用的功能，也会把课上和生活里遇到的问题做成实际的东西。",
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
    idField2: "专业",
    idDept: "计算机科学与技术",
    idField3: "年份",
    campusKicker: "校园与书院",
    campusTitle: "校园里的问题，也当成题目来做。",
    campusNote:
      "校园提案大赛、学生互助工作组和树仁书院学生会——在校园里练习发现问题、协作与落地。",
    campusC1Title: "校园提案大赛 · 一等奖",
    campusC1Desc:
      "“权系你我·智汇南科”校园提案大赛，四人团队，全场唯一的一等奖。提案主题是校园电动车整治：我提出电动车道“两侧低、中间高，弯多易打滑”的问题，是所有提案中唯一引发热烈讨论的议题。",
    campusC2Title: "学生互助工作组",
    campusC2Desc:
      "隶属学生发展与指导中心。负责“树仁卷心菜”群聊的管理与维护，参与搭子匹配的方案讨论，并负责系统开发。",
    campusC2Link: "查看树仁搭子案例",
    campusC3Title: "树仁书院学生会 · 秘书处",
    campusC3Desc: "负责会议纪要的撰写与整理，以及物资采购。",
    casesKicker: "案例",
    casesTitle: "五个项目，从开发到上线。",
    roleLabel: "我的职责",
    decisionLabel: "关键取舍",
    otherKicker: "其他实践",
    otherTitle: "课程与竞赛里的产品练习",
    contactKicker: "联系",
    contactTitle: "来聊聊。",
    contactNote: "日常实习、项目协作，或只是聊聊设计与产品——都欢迎。",
    contactMail: "发邮件 ↗",
    contactCopy: "复制邮箱",
    contactCopied: "已复制",
    footRights: "保留所有权利。",
  },
  en: {
    pageTitle: "Song He | AI Product Management",
    pageDescription:
      "Song He's AI product management portfolio: problem framing, experience design, AI-assisted delivery, and public launches.",
    pageTitle_education: "Song He | Experience",
    pageDescription_education:
      "Song He's experience: an internship at Zhonbai, research and campus practice at SUSTech, aiming for AI product management.",
    pageTitle_work: "Song He | AI Product Cases",
    pageDescription_work:
      "Song He's AI product cases, with shipped evidence across product framing, AI capability productization, experience design, and 0-to-1 delivery.",
    pageTitle_contact: "Song He | Contact",
    pageDescription_contact:
      "Contact Song He by email, phone, or GitHub. Aiming for AI product management.",
    skipLink: "Skip to main content",
    statusPill: "Seeking an AI product manager internship",
    navMain: "Main navigation",
    dockHome: "Home",
    dockEducation: "Experience",
    dockWork: "Cases",
    dockContact: "Contact",
    dockLang: "Lang",
    langAria: "切换到中文",
    xpKicker: "Experience",
    xpTitle: "Internship, research, and campus.",
    xpNavAria: "On this page",
    xpNavIntern: "Internship",
    xpNavResearch: "Research",
    xpNavEdu: "Education",
    xpNavCampus: "Campus & College",
    internKicker: "Internship",
    internTitle: "Zhonbai Technology",
    internNote:
      "Off-campus internship. Helped organize the EvoTavern hackathon in Shenzhen as lead of the technology and product team.",
    internWhen: "Sep 21 – 24, 2026",
    internWhenLabel: "Event dates",
    internOrg: "EvoTavern Hackathon · Shenzhen",
    internRole: "Technology & Product Team Lead",
    internDesc:
      "Helped prepare the Shenzhen final round of the EvoTavern Agent Hackathon, a four-day event with four tracks.",
    internLinkEvent: "Hackathon site",
    internLinkCompany: "Zhonbai",
    researchKicker: "Research",
    researchTitle: "From brain-computer interfaces to data visualization.",
    researchNote:
      "Two labs so far: first brain-computer interface decoding, now visualization.",
    lab1When: "Joined 2026.09",
    lab1Tag: "Current",
    lab1Org: "Yuxin Ma's Lab",
    lab1Role: "Visualization",
    lab1Desc:
      "Data visualization and visual analytics: how information is understood, expressed, and used. Newly joined; the research topic is being defined.",
    lab1Link: "Lab research areas",
    lab2When: "Joined 2026.04",
    lab2Tag: "Previous",
    lab2Org: "Brain–Robot Lab",
    lab2Role: "Prof. Mingming Zhang's group · Relative-distance decoding for brain-computer interfaces",
    lab2Point1:
      "Adapted new neural-network models to the existing code and tuned them to test whether MAE and CC could improve further.",
    lab2Point2: "Modified and maintained the code.",
    eduKicker: "Education",
    eduTitle: "SUSTech",
    eduNote:
      "Undergraduate in Computer Science and Technology, enrolled 2025, expected to graduate in 2029. I spend my time on how products get defined and how AI turns into features people can actually use, and I build things out of problems I run into in class and daily life.",
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
    idField2: "Major",
    idDept: "Computer Science & Technology",
    idField3: "Years",
    campusKicker: "Campus & College",
    campusTitle: "Campus problems, treated as things to actually solve.",
    campusNote:
      "A proposal competition, the Peer Support Working Group, and the Shuren College Student Union — practicing problem finding, collaboration, and delivery on campus.",
    campusC1Title: "Campus Proposal Competition · First Prize",
    campusC1Desc:
      "SUSTech's campus proposal competition “权系你我·智汇南科”. Team of four; the only first prize awarded. Our proposal addressed e-bike management on campus: I raised that the e-bike lane is low at the edges, high in the middle, and winding, which makes it easy to skid. It was the only issue among all proposals that sparked heated discussion.",
    campusC2Title: "Peer Support Working Group",
    campusC2Desc:
      "Part of the Student Development Center. I manage and maintain the “Shuren Cabbage” group chat, take part in designing the study-buddy matching scheme, and build the system.",
    campusC2Link: "See the Shuren Study Buddy case",
    campusC3Title: "Shuren College Student Union · Secretariat",
    campusC3Desc: "Write and organize meeting minutes, and handle supply purchasing.",
    casesKicker: "Cases",
    casesTitle: "Five projects, from build to launch.",
    roleLabel: "My role",
    decisionLabel: "Key trade-off",
    otherKicker: "Other Practice",
    otherTitle: "Product practice in coursework and competitions",
    contactKicker: "Contact",
    contactTitle: "Let's talk.",
    contactNote:
      "Internships, project collaboration, or just a chat about design and product — all welcome.",
    contactMail: "Send email ↗",
    contactCopy: "Copy email",
    contactCopied: "Copied",
    footRights: "All rights reserved.",
  },
};

/* Public cases first; supporting practice stays visually secondary. */
const projects = [
  {
    id: "hardnest",
    primary: true,
    accent: "#ff6714",
    image: "assets/hardnest-card.webp",
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
      {
        label: { zh: "GitHub", en: "GitHub" },
        href: "https://github.com/QianMo0729/HardNest",
      },
    ],
  },
  {
    id: "echonote",
    primary: true,
    accent: "#6e5bff",
    image: "assets/echonote-lecture-card.webp",
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
        src: "assets/liquid-deadline-at-a-glance.webp",
        alt: {
          zh: "Liquid Deadline 应用内任务时间线界面",
          en: "Liquid Deadline in-app task timeline",
        },
      },
      {
        src: "assets/liquid-deadline-home-screen.webp",
        alt: {
          zh: "Liquid Deadline 真实桌面小组件界面",
          en: "Liquid Deadline real home-screen widgets",
        },
      },
    ],
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
    id: "shuren-buddy",
    primary: true,
    accent: "#0d7a6f",
    image: "assets/shuren-buddy-card.webp",
    status: { zh: "LIVE · 已部署", en: "LIVE · DEPLOYED" },
    tags: {
      zh: ["校园场景", "匹配推荐", "隐私边界"],
      en: ["Campus use case", "Matching", "Privacy boundary"],
    },
    title: { zh: "树仁搭子", en: "Shuren Study Buddy" },
    metrics: [
      { k: { zh: "校园邮箱", en: "Campus email" }, v: { zh: "验证后激活", en: "Verified sign-up" } },
      { k: { zh: "学习问卷", en: "Study survey" }, v: { zh: "生成推荐", en: "Drives matching" } },
      { k: { zh: "联系申请", en: "Contact request" }, v: { zh: "双方同意", en: "Mutual consent" } },
    ],
    desc: {
      zh: "面向南科大树仁书院同学的学习搭子匹配平台。校园邮箱激活后填写学习问卷，系统按时间、目标和学习偏好推荐合拍的同学，也可以主动检索。",
      en: "A study-buddy matching platform for students of SUSTech's Shuren College. After campus-email activation and a study survey, it recommends compatible peers by schedule, goals, and study preferences, and also supports direct search.",
    },
    role: {
      zh: "在学生互助工作组参与搭子匹配的方案讨论，并负责系统开发。",
      en: "Took part in designing the matching scheme within the Peer Support Working Group, and built the system.",
    },
    decision: {
      zh: "联系方式只在联系申请被对方接受后才向双方开放；账号必须通过校园邮箱验证。",
      en: "Contact details open to both sides only after a request is accepted; every account must verify a campus email.",
    },
    links: [
      {
        label: { zh: "在线访问", en: "Visit site" },
        href: "https://pair.moorn.online/",
      },
      {
        label: { zh: "GitHub", en: "GitHub" },
        href: "https://github.com/QianMo0729/shuren-study-buddy",
      },
    ],
  },
  {
    id: "markpdf",
    primary: true,
    accent: "#3f5bd8",
    image: "assets/markpdf-card.webp",
    status: { zh: "桌面应用 · 已发布", en: "DESKTOP APP · RELEASED" },
    tags: {
      zh: ["AI 能力产品化", "学习工具", "桌面应用"],
      en: ["AI productization", "Study tool", "Desktop app"],
    },
    title: { zh: "MarkPDF", en: "MarkPDF" },
    metrics: [
      { k: { zh: "双平台", en: "Two platforms" }, v: { zh: "Windows 与 macOS", en: "Windows & macOS" } },
      { k: { zh: "实时转写", en: "Live transcript" }, v: { zh: "逐句翻译", en: "Sentence translation" } },
      { k: { zh: "AI 纠错", en: "AI correction" }, v: { zh: "默认关闭", en: "Off by default" } },
    ],
    desc: {
      zh: "把 PDF、Markdown 笔记和课堂录音放在一起：围绕同一份课件阅读、标注、记录和回听，笔记、转写与翻译面板可以自由分栏。",
      en: "Brings PDFs, Markdown notes, and lecture recordings together: read, annotate, record, and replay around the same slides, with notes, transcript, and translation panels in flexible splits.",
    },
    decision: {
      zh: "上下文纠错默认关闭，使用用户自己配置的 AI 服务；修正后仍可展开核对原始转写。",
      en: "Context-aware correction is off by default and runs on the user's own AI service; the original transcript stays one click away after a fix.",
    },
    links: [
      {
        label: { zh: "下载", en: "Download" },
        href: "https://github.com/QianMo0729/MarkPDF/releases/latest",
      },
      {
        label: { zh: "GitHub", en: "GitHub" },
        href: "https://github.com/QianMo0729/MarkPDF",
      },
    ],
  },
  {
    id: "xiangqi",
    accent: "#c0453a",
    image: "assets/xiangqi-card.webp",
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
    id: "ssvep",
    accent: "#0a84ff",
    media: "signal",
    status: { zh: "竞赛项目", en: "COMPETITION PROJECT" },
    tags: { zh: ["脑机接口", "康复辅助"], en: ["Brain-computer interface", "Rehab assistance"] },
    title: { zh: "智行无碍", en: "Zhixing Wu'ai" },
    desc: {
      zh: "基于 SSVEP 脑机接口的新时代交互系统：通过脑机接口控制康复机器人，辅助残障人士恢复。获“日新·创未来”南科大校园创新大赛红旅赛道三等奖，并获得推荐省赛的资格。",
      en: "An interaction system built on an SSVEP brain-computer interface: controlling a rehabilitation robot to assist the recovery of people with disabilities. Third prize in the Red Tour track of SUSTech's “日新·创未来” campus innovation competition, and recommended for the provincial round.",
    },
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
  } else if (project.media === "signal") {
    /* No photograph exists for the BCI project: a frequency-tagged signal
       motif stands in instead of an unrelated stock image. */
    media.classList.add("is-signal");
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
  stage.id = "case-" + project.id;
  stage.dataset.case = project.id;
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
    [translations[language].roleLabel, project.role?.[language]],
    [translations[language].decisionLabel, project.decision?.[language]],
  ].forEach(([label, value]) => {
    if (!value) return;
    const note = document.createElement("div");
    note.className = "stage-note";
    const heading = document.createElement("h3");
    const body = document.createElement("p");
    heading.textContent = label;
    body.textContent = value;
    note.append(heading, body);
    notes.appendChild(note);
  });
  if (notes.childElementCount) copy.appendChild(notes);

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

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = dictionary[element.dataset.i18nAriaLabel];
    if (value !== undefined) element.setAttribute("aria-label", value);
  });

  renderProjects(nextLanguage);

  if (langCurrent) langCurrent.textContent = nextLanguage === "zh" ? "EN" : "中";
  if (langToggle) langToggle.setAttribute("aria-label", dictionary.langAria);

  writeStoredLanguage(nextLanguage);
};

/* ── dock: magnification + current page ──────────────────────────────── */

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

/* ── contact: copy the email address ─────────────────────────────────── */

const copyButton = document.querySelector("[data-copy-email]");
if (copyButton) {
  let resetTimer = 0;
  copyButton.addEventListener("click", async () => {
    const email = copyButton.dataset.copyEmail;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch {
      copied = false;
    }
    /* Clipboard access can be refused; showing the address still lets the
       visitor select it by hand. */
    copyButton.textContent = copied ? translations[currentLanguage()].contactCopied : email;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      copyButton.textContent = translations[currentLanguage()].contactCopy;
    }, 1800);
  });
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
