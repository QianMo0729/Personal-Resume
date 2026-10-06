# 校园蓝图 · 交互 Demo

网站首页：**https://moorn.online/**

保留的 Demo 入口：**https://moorn.online/demos/blueprint-campus/**

本地入口：**http://127.0.0.1:8765/demos/blueprint-campus/**

在项目根目录用 PowerShell 启动：

```powershell
powershell -ExecutionPolicy Bypass -File .\demos\blueprint-campus\Start-Demo.ps1
```

启动器在后台打开本地 Node.js 服务；再次执行会复用同一服务。服务仅监听 `127.0.0.1`，整个项目作为静态根目录，因此返回主页和既有作品的相对链接仍然有效。没有安装依赖步骤；需要 Node.js。端口被其他程序占用时，添加 `-Port 8766`。

也可以直接前台运行：

```powershell
node .\demos\blueprint-campus\server.mjs
```

关闭前台服务使用 `Ctrl+C`。后台服务的 PID 会在启动时显示；需要关闭时使用 PowerShell 的 `Stop-Process -Id <显示的PID>`。

## 交互

1. **校园卡 → 图案特写 → 3D 校园**：向下滚动，先以卡面俯视图为中心放大整张卡，让这块平面图铺满视野；此时建筑仍是平的。随后同一图案切入空间渲染，建筑逐渐升起、镜头倾斜并展开完整校园。两段按 `object-fit:contain` 的实际图像区域对齐；向上滚动会依次压平建筑、缩回校园卡。
2. **校园 → 走廊 → 推门进入**：选择工学院南楼、学生宿舍15栋或学生宿舍11栋，同一个镜头从鸟瞰降到入口，沿走廊向前，再穿门进入对应空间。科研使用滑动玻璃门，两处宿舍（校园与书院、作品集）共用格栅单扇门的宿舍门厅。门上的观察窗可提前看到同一室内。返回时从当前镜头位置沿原路退回；途中可取消或跳过，切换经历会经过校园后进入新目标。
3. **走出校园**：实习经历发生在校外，标记放在一号门而不是某栋建筑。镜头从校内一侧降到门口，沿道路穿过门廊与抬起的道闸，到达示意的黑客松现场；一号门没有建筑轮廓，朝向取最近一段校园边界的内法线（`entrance-anchor.js` 的 `findGateAnchor`）。返回、Escape、浏览器后退与其他入口一致。
4. **快速阅读**：通过“快速浏览”直接阅读内容；“减少动态”可降低运镜与连续动态效果，页面也尊重系统的减少动态设置。

## 资料与范围

- 校园使用真实 OpenStreetMap 建筑轮廓、路网与水体，三处建筑入口与一号门经过公开校图及导航点位核对。`assets/campus-data.json` 与校园卡底图 `assets/campus-plan.svg` 同源。
- 当前包含 **111 栋建筑、285 段道路、9 个水体**。所有楼高都是渲染估计：83 栋按照 OSM 层数和假定层高计算，28 栋根据建筑类型估计。真实轮廓不代表已有精确建筑高度、立面或地形模型。
- 实验室、书院、书桌与黑客松现场均为交互示意，校门的门廊、岗亭与道闸同样是示意。经历正文来自本人提供的信息；实习起止时间、此前实验室的结束时间、可公开的研究结果、照片与作品证据仍需补齐，不要把示意内容当作已经核实的个人成果。
- 本 Demo 独立放在 `demos/blueprint-campus/`；发布记录及回滚信息见 `source-data/deployment/`。
- 地图数据署名 **© OpenStreetMap contributors**；来源、许可与处理说明见 [assets/source-data/README.md](assets/source-data/README.md)。

服务日志保存到 `source-data/runtime/`。页面开发完成后刷新即可读取本地最新文件；静态服务不缓存资源。

## 修改内容

- `index.html`：重新设计的校园蓝图卡，卡面仅使用官方校徽校名、宋和、本科生和2029届，以及真实校园俯视图；不再展示照片。
- `styles.css`：蓝图色彩、字体、卡片与响应式布局。
- `app.js`：顶部 `locations` 是四个入口的标题与正文，可用 `captions` 覆盖运镜途中的四句提示；滚动展开、建筑投影、运镜、返回和降级也在此文件。
- `interior-scene.js`：四处示意空间（实验室、书院阅读中庭、宿舍书桌与电脑、黑客松现场）。
- `entrance-scene.js`：连通室内的走廊、门牌、观察窗与可开合门叶，以及校门的露天门廊与道闸。
- `entrance-anchor.js`：在真实建筑外轮廓上选取朝向镜头、无凹角遮挡的运镜锚点；它不代表测绘或核实过的真实门位。
- `assets/portrait-blue.png`：先前版本的人像，现已停用，不随当前网站发布。
- `vendor/`：本地 Three.js 0.180.0 与 MIT 许可；运行过程无需外部 CDN。

## 学校信息来源

各榜单保留各自年份，不混写成同一年度排名。2026-10-03 核实：QS、THE、ARWU 采用各机构已发布的最新版本；U.S. News 官网暂无法直接访问，学校官网仍列 2025/26 版，因此保留有官方来源支持的历史版本，未将未经一手来源核实的 2026/27 版写入页面。

- [QS 2027：317](https://www.topuniversities.com/universities/southern-university-science-technology-sustech)
- [THE 2027：=163](https://www.timeshighereducation.com/world-university-rankings/southern-university-science-and-technology-sustech)（[官方发布报道](https://www.timeshighereducation.com/news/world-university-rankings-2027-results-announced)，2026-09-30 发布、2026-10-01 更新）
- [ARWU 2026：101–150](https://www.shanghairanking.com/universities/southern-university-of-science-and-technology)
- [U.S. News 2025/26：123，学校全球交流办公室](https://global.sustech.edu.cn/about/world_no)
- [校徽与校名组合：南科大官网原始资源](https://www.sustech.edu.cn/static/images/sustech-logo-cn.png)
- [马昱欣教师主页](https://www.sustech.edu.cn/zh/faculties/mayuxin.html)

## 已完成的浏览器验证

Chrome / Playwright：1440×900、390×844、844×390、320×568。

- 三处建筑与一号门标记的点击进入、返回校园、Escape 返回与浏览器后退。
- 快速浏览入口、移动端文字边界、室内横竖屏切换。
- 系统减少动态、提前进入地图后的拖动旋转。
- 主动模拟室内 WebGL 上下文丢失，验证平面图降级、返回和再次进入。
- 最终运行没有页面 JavaScript 异常或失败资源请求。

验证记录及截图位于 `source-data/qa/`，其中 `verification.json` 记录测试时间与通过项目。

2026-09-07 交互修订验证记录为 `source-data/qa/zoom-verification.json`：检查先放大图案、铺满屏幕时建筑高度仍为零、平面交接、反向滚动恢复、小屏尺寸及进入实验室后返回。截图 `11` 至 `16` 展示这一转场的分段状态。

建筑入口使用连续的透视相机，走廊和室内与外部校园处在同一场景坐标中，入口开口通过局部裁剪连通原建筑体块，期间没有整屏淡出切换。初次进入前预编译材质，静止后停止逐帧渲染。完整进入和返回均为约500ms，正文出现为90ms；“减少动态”与“跳过运镜”可直接抵达。

校园旋转采用真实几何的固定世界包围球取景，中心和画面比例不随朝向改变，避免不规则校园的投影外框变化造成忽大忽小。旋转按钮和俯视切换用500ms过渡；鼠标拖动直接跟随指针。

固定旋转与速度验证位于 `source-data/qa/orbit/verification.json`：桌面1440×900、手机390×844各旋转完整一圈，实际相机跨度保持恒定；拖动时同样不变。三个入口从点击到进入完成实测约207–229ms，返回约203–206ms（本机Chrome）；窗口改变尺寸时会保持当前展开进度。

连续入口的浏览器记录为 `source-data/qa/entrance/verification.json`，通过三楼完整进入与原路退出、运镜中 Escape 反向、跳过和排队切换入口、浏览器后退、移动端飞行中旋转屏幕、飞行中减少动态，以及返回/切换期间 WebGL 丢失后的意图保留。最后一轮没有页面异常或失败资源请求；该目录同时保存门前、走廊、开门、穿门及最终室内截图。

## 2026-09-13 设计与交互修订

- 开场卡面重绘为地图主体的竖式蓝图卡，移除头像与仿真卡纹；放大时保留 SVG 清晰度，再连续展开同源三维模型。
- 科研为工业梁架实验室、书院为弧形书墙与圆形阅读中庭、校园为挑高阶梯论坛；三处采用独立的建筑轮廓、门厅和最终取景。
- 标题加至900字重；标题、正文与图签遵循桌面32px、手机24px网格。现场文字采用相同的工程制图风格。
- 入口前进轨迹在外立面与走廊处匹配速度，消除分段停顿；沿中心线过门后再移向各自的室内取景，进入与返回仍为200ms。
- 本轮 Chrome 验证在 `source-data/qa/refinement/verification.json`：三场景进入实测205–225ms、返回200–206ms；完整旋转取景比例固定，四种屏幕尺寸无横向溢出，减少动态、场景切换、后退均通过，无页面异常或失败资源。截图同目录。

最终路线检查见 `source-data/qa/refinement/route-verification.json`：7种默认视口加桌面/手机四个旋转朝向，共45组场景、54,000段路径，均未与可见校园、入口或室内碰撞。镜头先对准入口再下降，周边建筑渐隐为目标建筑让出剖面视野；过门前至少提前约12.7ms全开。入口与走廊接缝匹配位置及速度，抵达时使用各空间独立的最终姿态。

`fallback-verification.json` 另记录返回过程中 WebGL 丢失后仍回到校园，并可继续进入与退出平面图模式下的书院章节。

## 已上线

首次独立 Demo 发布为 `20260914T045343Z-blueprint-campus`，以新静态 release 原子切换，旧站原有页面保持原字节内容。旧版本 `20260816T114515Z-stats-09` 保留用于回滚；部署清单、激活记录及回滚脚本都在 `source-data/deployment/`，不对外发布。

正式网址 Chrome 检查见 `source-data/qa/refinement/published-verification.json`：HTTP200、正常WebGL渲染、三个场景进入和返回、390×844手机布局均通过，无页面异常或失败请求。线上截图以 `published-` 开头。

## 首页与经历内容更新

根 `index.html` 已替换为校园蓝图，使用 `/demos/blueprint-campus/` 作为资源基址；根地址的场景链接、刷新、返回与跳过正文均在首页路径内工作。独立Demo入口继续保留。当前首页发布与回滚记录见 `source-data/deployment/homepage/activation-record.json`。

用户确认的经历分类（2026-10-04 更新，书院与校园合并，新增校外实习）：

- 实习（一号门 · 走出校园）：众白科技，深圳进化酒馆黑客松筹备，技术与产品团队负责人。
- 科研（工学院南楼）：马昱欣实验室，2026.09 加入；此前为张明明老师的脑-机器人实验室，2026.04 加入。
- 校园与书院（学生宿舍15栋）：树仁书院学生会秘书处、学生互助工作组、校园提案大赛一等奖。
- 作品集（学生宿舍11栋）：五个项目的清单，室内是一张摆着显示器的书桌，屏幕上是五个项目的示意图标。
- 竞赛项目“智行无碍”（SSVEP 脑机接口）改放在案例页的「其他实践」。

原南科大中心入口已随合并移除；它的坡屋顶大厅改造成了实习入口的黑客松现场。

进入/退出建筑、按钮旋转与俯视切换统一为500ms。鼠标拖动保持直接跟随，滚动展开仍由滚动进度控制。`source-data/qa/homepage/500ms-local-verification.json` 记录进入508–517ms、返回502–505ms、旋转503ms的实测，以及中途反向和减少动态检查。

`source-data/qa/homepage/` 保存首页路径、更新后的经历文字、小屏布局和公开网址的浏览器检查；未修改的作品页、教育经历页及其资源随旧release完整保留。

500ms更新已发布为 `20260914T061003Z-blueprint-motion500`。正式首页实测进入508–518ms、返回503–506ms、旋转502ms；更新后的经历、途中返回和减少动态均通过。记录：`source-data/qa/homepage/500ms-public-verification.json`。旧首页版本与此前独立Demo版本都保留在服务器release目录中。
