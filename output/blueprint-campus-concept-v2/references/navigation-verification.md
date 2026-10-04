# 校园导航核验记录

核验日期：2026-09-07（UTC；本地任务日为2026-09-06）

## 可直接供示意图参考的图片

- `sustech-campus-bus-map-v5-0-page1.png`：2025年11月南科手册/SUSTransit校园公交线路图，图中明确写自2025-11-24生效。PNG由公开PDF第一页直接渲染，非重绘；全校园北向地理关系、建筑轮廓、道路和水体清晰。
- `sustech-campus-map-v4-1-page1.png`：2025年10月公交路线图，图内自2025-10-01适用。南科手册主页虽称“校园地图v4.1”，实际链接内容是公交地图，不应误称纯建筑平面图。
- `sustech-official-campus-map-2024-05.jpg`：南科大官网“联系我们→校园地图”原图，URL目录2024/05，不代表精准建筑现状核验日期；根代理也保存了同一来源的`official-campus-map-2024.jpg`，可优先使用根代理文件，避免重复。

## 导航数据

- `sustech-buildings.geojson`：76个公开校园建筑/设施POI点，来自南科手册开源组件明确请求的URL。源未给修订日期。这是点位数据，不是测绘级建筑外形或楼高。
- `sustech-gates.geojson`：公开校门POI。
- `verified-navigation-anchors.geojson`：从上述原始POI提取的两个目标。
- `line1.geojson`、`line2.geojson`：公开仓库历史公交线路数据；仅供道路走向辅助，不用于声称现行公交运行方案。
- `CampusMap.vue`、`RealtimeMapv2.vue`、`BusMapV2.vue`：下载的公开组件源码，用于核实数据来源。地图样式采用Protomaps/OpenStreetMap；`pmtiles-light.json`指向20250114.pmtiles，但不等于所有地点信息均于当日测绘。

## 目标点与场地对应

| 页面入口 | 核验结果 | 适合绘图的约束 |
|---|---|---|
| 科研经历 | 工学院分南北楼；2025导航图显示两个相邻大庭院式组团，位于校园西侧，二期学生宿舍西侧 | 保留多个矩形庭院与分段连廊体量，勿画成单独摩天楼；目标落在南楼。下载POI无工学院项，勿把同名校巴站经纬度当建筑中心 |
| 书院经历 | 宿舍15栋：经度113.9952891995979，纬度22.60504180349547；南科手册宿舍表列15栋为树仁 | 在二期宿舍东部，14栋东北侧、16栋西南侧；15栋南侧紧邻狭长水体/绿地坡地，北侧为二期宿舍组团内部空间。不能标到湖畔1-6栋 |
| 校园经历 | 南科大中心：经度113.9923345196037，纬度22.59998770717294；学工部官网办公表明确学生事务中心在南科大中心208 | 以南科大中心综合体为建筑标记，位于湖畔宿舍以南、主教学区以北、校园主路东侧；一丹图书馆属于该综合体相邻/一体空间。不要凭“学生中心”一词创造新建筑 |

来源中的坐标顺序为经度、纬度，第三项0为原始点位占位高程，不能作为真实建筑高程。以上位置可支持概念定位，不支持正式导航精度承诺。

## 水体和道路轮廓

2025导航图显示：校园建筑主要在西侧，北部欣园为沿坡道路串联的狭长片区；荔园/创园/慧园位于二期宿舍北侧；二期宿舍南侧有沿东北—西南方向延伸的细长水体，继续连入湖畔宿舍和教师公寓之间的湖面；主教学区南侧有环绕的一段河道。校园西侧道路经过工学院再向南弯曲经过科研楼，南部绕一号门，东侧沿二号门—三号门向北回到生活区。不要改成对称中轴、环形人工岛或规则棋盘格城市。

## 原始来源

1. 南科手册地图和版权说明：https://sustech.online/ （页面列v4.1，2025年10月；CC-BY-SA 4.0）
2. 南科手册交通页：https://sustech.online/transport/ （列公交图v5.0，2025年11月）
3. v5.0原PDF：https://mirrors.sustech.edu.cn/site/sustech-online/documents/campus-map/SUSTech-Campus-Map-v5-0.pdf
4. v4.1原PDF：https://mirrors.sustech.edu.cn/site/sustech-online/documents/campus-map/%E5%8D%97%E6%96%B9%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%A6%E6%A0%A1%E5%9B%AD%E5%9C%B0%E5%9B%BE-v4-1.pdf
5. 学校官网地图页：https://sustech.edu.cn/zh/contact_us.html
6. 官网原图：https://sustech.edu.cn/uploads/images/2024/05/10103209_79587.jpg
7. 建筑说明与宿舍楼栋表：https://sustech.online/facility/ （工学院南北楼；15栋树仁；部分照片标明2019或2022，不能说是最新航拍）
8. 学工部现行公开办公表：https://osa.sustech.edu.cn/about/contact/ （学生事务中心：南科大中心208）
9. 官方新闻2022-01-11：https://newshub.sustech.edu.cn/html/202201/41689.html （学生事务中心南科大中心二楼）
10. 公开建筑点位：https://bus.sustcra.com/geojson/sustech_bldg.json
11. 公开校门点位：https://bus.sustcra.com/geojson/sustech_gate.json
12. 数据源代码：https://github.com/sustech-cra/sustech-online-ng/blob/master/docs/.vuepress/components/RealtimeMapv2.vue

若发布基于南科手册地图的演绎图，需按其CC-BY-SA 4.0要求署名、指明改动并使用相同许可；底图另有OpenStreetMap署名。这里只是为设计核对保存来源，没有进行网站代码修改。
