# Song He Resume Site

纯静态个人简历网站，可直接用于 GitHub Pages。原创「Liquid / Aurora」视觉：瓷白底色上漂移的薄荷 / 鸢尾紫 / 琥珀极光渐变，毛玻璃面板，macOS 风格底部 Dock 导航（悬停放大 + 滚动定位），双语层叠字标（宋和 / SONG HE 描边），滚动驱动的逐字点亮金句，全息学生卡，sticky iPhone 展示区，光标追光的 Bento 作品栅格，深圳实时时钟，页脚手写签名描边动画。支持中 / 英双语（Dock 内切换，localStorage 记忆）。

## 文件结构

- `index.html`：页面结构（作品卡片由 `script.js` 数据渲染）
- `styles.css`：视觉样式、动效关键帧与响应式布局
- `script.js`：i18n、作品数据、Dock 放大、滚动与指针交互
- `assets/`：卡片图片
- `.github/workflows/deploy-pages.yml`：GitHub Pages 静态部署工作流

## 如何新增一个作品（任意数量）

打开 `script.js`，在 `projects` 数组末尾追加一个对象即可——编号、Bento 栅格布局、入场动画、双语文案全部自动处理，作品数量不限（栅格会自动换行）：

```js
{
  id: "my-new-app",
  accent: "#6e5bff",                      // 该项目的主题色（编号、标签、悬停光晕）
  // featured: true,                      // 可选：横跨两列的大卡片
  image: "assets/my-new-app-card.png",    // 图片放进 assets/，建议约 1568×1003
  tags: { zh: ["SwiftUI", "..."], en: ["SwiftUI", "..."] },
  title: { zh: "我的新应用", en: "My New App" },
  desc: { zh: "一句话介绍。", en: "One-line description." },
  links: [
    { label: { zh: "App Store", en: "App Store" }, href: "https://..." },
    { label: { zh: "GitHub", en: "GitHub" }, href: "https://..." },
  ],
},
```

作品区标题旁的「共 N 个项目」计数也会自动更新。

## GitHub Pages

把本目录内容放到仓库根目录（当前工作流即如此），push 到 `main` 后自动部署。
