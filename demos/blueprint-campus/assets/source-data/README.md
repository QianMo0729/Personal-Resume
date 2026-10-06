# Campus geometry sources

Generated on 2026-09-07 for the local blueprint portfolio demo.

## Files

- `../campus-data.json`: renderer data in metres, east +X and south +Z.
- `../campus-plan.svg`: a north-up, white-line drawing of the same source geometry, with a transparent background. It contains no generated-image building guesses.
- `osm-campus-raw.json`: archived Overpass response, 919 ways/relations. Source database timestamp: **2026-09-07T08:30:50Z**.
- `overpass-query.txt`: exact bounding-box query.
- `fetch-osm.py`: network acquisition script.
- `build-campus.py`: dependency-free conversion script. Run `python -X utf8 demos/blueprint-campus/assets/source-data/build-campus.py` from the project root; it also works from other directories.
- `processing-report.json`: output counts, bounds, height methods, and rejected invalid relation.
- `campus-plan-preview.png`: diagnostic raster preview of the native SVG; not a replacement for source geometry.

## Four experience anchors

| Experience | Geometry | Anchor | Validation |
|---|---|---|---|
| 科研经历 · 工学院南楼 | [OSM way 695571961](https://www.openstreetmap.org/way/695571961) | 113.99110, 22.60328 | Anchor is on the northern wing of the south building and lies within its footprint. The 2025 bus map labels this group COE South Tower. |
| 校园与书院 · 学生宿舍15栋 | [OSM way 695571951](https://www.openstreetmap.org/way/695571951) | 113.9952891995979, 22.60504180349547 | Public campus-navigation POI lies inside this named OSM footprint. |
| 作品集 · 学生宿舍11栋 | [OSM way 695571955](https://www.openstreetmap.org/way/695571955) | 113.9941226436831, 22.60503138537687 | Public campus-navigation POI lies inside this named OSM footprint. |
| 实习经历 · 一号门 | 无建筑轮廓，仅为点位 | 113.9944801104224, 22.59560217717079 | Public campus-navigation gate POI (Gate 1) on the campus edge. Off-campus experience is anchored here; the landmark carries no `buildingId`, and the renderer leaves through the gate along the inward normal of the nearest campus-boundary edge. |

The public navigation source is [bus.sustcra.com/geojson/sustech_bldg.json](https://bus.sustcra.com/geojson/sustech_bldg.json). Its point coordinates are used only for anchors; building footprints come from OSM ways and multipolygons.

## Accuracy boundaries

- 111 building footprints, 285 clipped road segments, and 9 water polygons are included.
- The university boundary is [OSM way 456349157](https://www.openstreetmap.org/way/456349157). Building selection uses this boundary, with an explicit inclusion for [Research Building 3, way 1506997102](https://www.openstreetmap.org/way/1506997102), which is outside the older boundary but clearly appears in the November 2025 campus map. Road geometry is clipped at boundary intersections plus a small display envelope around that building; no new road alignment is invented.
- No building in the selected dataset has a numeric measured-height tag. **All displayed heights are estimates:** 83 use OSM level counts and assumed floor heights; 28 use generic building-type estimates. These methods are retained as `heightSource`. The south engineering building has 10 levels in OSM and is shown as 38 m; Dorm 15 has 7 levels and is shown as 22.4 m. These are rendering estimates, not surveyed heights.
- SUSTech Center is a low platform multipolygon (`building:levels=1`, `layer=1`) with seven holes, alongside separately mapped building volumes. Its 3.8 m platform must not be treated as the full height of every part of the complex.
- OSM relation 19871797 (`工学院`) has only inner members and no outer ring. It cannot be rendered as a valid multipolygon. The separately tagged south/north building outlines and connecting part are retained. No guessed outer ring is added.
- Terrain, roofs, trees, building façades, windows, and interiors are not contained in this data. This is an extrudable footprint model, not a survey or photogrammetric reconstruction. The rendering should not imply otherwise.

## Supporting references

- [November 2025 SUSTech campus bus map, v5.0](https://mirrors.sustech.edu.cn/site/sustech-online/documents/campus-map/SUSTech-Campus-Map-v5-0.pdf): used to cross-check the relative location and labels of the engineering buildings, 15th dormitory and the campus center. No PDF geometry was traced or copied into the dataset.
- [Official campus map page](https://www.sustech.edu.cn/zh/contact_us.html).

## Attribution and data license

Visible map attribution should read **© OpenStreetMap contributors** and link to [OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

The raw geographic data and its adapted geographic database in `campus-data.json` are made available under the **Open Database License (ODbL) 1.0**. See [ODbL](https://opendatacommons.org/licenses/odbl/1-0/). The SVG is a produced work from that data; retain the attribution and data-source notice when sharing it. This statement concerns the geographic database and map, not the surrounding portfolio source code or the user's portrait.
