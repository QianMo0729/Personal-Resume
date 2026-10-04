# Song He Portfolio Site

纯静态个人作品网站，多页面结构（首页 / 经历 / 案例 / 联系）。首页是「校园蓝图」3D 场景：从一张校园卡展开成可旋转的南科大校园，点击标记进入科研、校园与书院、实习三类经历。经历、案例与联系页是「Paper / Ink」视觉：瓷白纸面纹理底色，薄荷 / 鸢尾紫 / 琥珀强调色，毛玻璃面板，macOS 风格底部 Dock 导航，手机陀螺仪校牌，页脚签名动画。这三页支持中 / 英双语（Dock 内切换，localStorage 记忆）。

## 文件结构

- `index.html`：首页。内容与 `demos/blueprint-campus/index.html` 相同，只多了 `<base href="/demos/blueprint-campus/">` 和 canonical，两份需要同步修改
- `demos/blueprint-campus/`：首页的样式、场景脚本、校园数据与 Three.js（`vendor/` 下为官方 0.180.0 压缩版），详见该目录的 README
- `education.html` / `work.html` / `contact.html`：Dock 对应的独立分页
  - `education.html` 是「经历」页，文件名保留以免旧链接失效。四个板块依次为 `01 实习`、`02 科研`、`03 教育`（陀螺仪学生卡 + 关注方向）与 `04 校园与书院`（三张卡片），文案在 `script.js` 的 `translations` 里
  - `work.html` 含主案例与「其他实践」卡片，均由 `script.js` 渲染
  - `contact.html` 是联系页：邮箱、电话与 GitHub
- `styles.css`：经历 / 案例 / 联系页共用的视觉样式、动效关键帧与响应式布局
- `script.js`：经历 / 案例 / 联系页共用的 i18n、作品数据、Dock 放大与指针交互（按 `body[data-page]` 识别当前页）。首页不加载这两个文件
- `assets/`：卡片图片（WebP）与字体
- `.github/workflows/deploy-pages.yml`：GitHub Pages 静态部署工作流

## 如何新增一个作品（任意数量）

打开 `script.js`，在 `projects` 数组末尾追加一个对象即可——编号、入场动画、双语文案全部自动处理：

```js
{
  id: "my-new-app",
  accent: "#6e5bff",                      // 该项目的主题色（编号、标签、链接）
  image: "assets/my-new-app-card.webp",   // 图片放进 assets/，1568×1003，用 WebP（PNG 体积约大 20 倍）
  status: { zh: "课程项目", en: "COURSE PROJECT" },
  tags: { zh: ["SwiftUI", "..."], en: ["SwiftUI", "..."] },
  title: { zh: "我的新应用", en: "My New App" },
  desc: { zh: "一句话介绍。", en: "One-line description." },
  links: [
    { label: { zh: "App Store", en: "App Store" }, href: "https://..." },
    { label: { zh: "GitHub", en: "GitHub" }, href: "https://..." },
  ],
},
```

这样会出现在「其他实践」的小卡片里。没有图片时可以用 `media: "signal"` 换成信号波形底图。想让它成为整行展示的主案例，再加上 `primary: true`，并补上 `role`、`decision` 和 `metrics`（都可选，建议写全），写法参考数组里已有的案例。主案例数量变化后，记得同步修改 `casesTitle` 里的数字。

## GitHub Pages

把本目录内容放到仓库根目录（当前工作流即如此），push 到 `main` 后自动部署。
