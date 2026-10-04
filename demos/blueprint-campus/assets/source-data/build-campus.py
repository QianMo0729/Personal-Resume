"""Create local portfolio geometry from archived OpenStreetMap data.

No third-party dependencies. Native OSM footprints are retained; elevations are
explicit estimates when a measured height tag is absent. Coordinates are metres,
with east +x and south +z. Run from any working directory with Python 3.
"""
import json
import math
import re
from pathlib import Path
from html import escape

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent
RAW = json.loads((HERE / 'osm-campus-raw.json').read_text(encoding='utf-8'))
ELEMENTS = RAW['elements']
ORIGIN = {'lon': 113.994, 'lat': 22.6025}
MX = 111320 * math.cos(math.radians(ORIGIN['lat']))


def project(p):
    return [(p['lon'] - ORIGIN['lon']) * MX,
            -(p['lat'] - ORIGIN['lat']) * 111320]


def ring(geometry):
    result = [project(p) for p in geometry]
    if result and result[0] == result[-1]:
        result.pop()
    return result


def rounded(points):
    return [[round(x, 2), round(z, 2)] for x, z in points]


def inside(p, polygon):
    x, z = p
    result = False
    for a, b in zip(polygon, polygon[1:] + polygon[:1]):
        if (a[1] > z) != (b[1] > z):
            if x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]:
                result = not result
    return result


def center(points):
    return [sum(p[i] for p in points) / len(points) for i in (0, 1)]


def combine_members(members, role):
    """Join OSM multipolygon way fragments by their shared exact endpoints."""
    pending = [[project(p) for p in m['geometry']] for m in members
               if m.get('role') == role and m.get('geometry')]
    result = []
    while pending:
        line = pending.pop(0)
        while line[0] != line[-1]:
            for index, other in enumerate(pending):
                if line[-1] == other[0]:
                    line.extend(other[1:])
                elif line[-1] == other[-1]:
                    line.extend(other[-2::-1])
                elif line[0] == other[-1]:
                    line = other[:-1] + line
                elif line[0] == other[0]:
                    line = list(reversed(other[1:])) + line
                else:
                    continue
                pending.pop(index)
                break
            else:
                break
        if len(line) > 3 and line[0] == line[-1]:
            result.append(line[:-1])
    return result


def polygons(e):
    if e['type'] == 'way':
        p = ring(e.get('geometry', []))
        return [(p, [])] if len(p) >= 3 else []
    outer = combine_members(e.get('members', []), 'outer')
    inner = combine_members(e.get('members', []), 'inner')
    return [(p, [h for h in inner if inside(h[0], p)]) for p in outer]


campus_element = next(e for e in ELEMENTS if e['id'] == 456349157)
campus_boundary = ring(campus_element['geometry'])
# The OSM university boundary predates the third research building. Its footprint
# is kept explicitly: the 2025 campus bus map labels Research Building 3 here.
research3 = next(e for e in ELEMENTS if e['id'] == 1506997102)
r3 = ring(research3['geometry'])
r3_box = [[min(p[0] for p in r3)-35, min(p[1] for p in r3)-35],
          [max(p[0] for p in r3)+35, min(p[1] for p in r3)-35],
          [max(p[0] for p in r3)+35, max(p[1] for p in r3)+70],
          [min(p[0] for p in r3)-35, max(p[1] for p in r3)+70]]


def in_campus(p):
    return inside(p, campus_boundary) or inside(p, r3_box)


def numeric(v):
    match = re.match(r'^\s*(\d+(?:\.\d+)?)', str(v or ''))
    return float(match.group(1)) if match else None


def elevation(tags):
    h = numeric(tags.get('height'))
    if h:
        return round(h, 2), 'osm:height'
    levels = numeric(tags.get('building:levels'))
    if levels:
        floor_height = 3.2 if tags.get('building') in ['dormitory', 'apartments'] else 3.8
        return round(levels * floor_height, 2), 'estimated:osm-building-levels'
    defaults = {'roof': 4, 'shed': 4, 'garage': 4, 'garages': 4,
                'dormitory': 21, 'apartments': 30, 'university': 20,
                'school': 14, 'yes': 14}
    return defaults.get(tags.get('building'), 16), 'estimated:building-type'


buildings = []
relation_outer_ways = {m['ref'] for e in ELEMENTS if e['type'] == 'relation'
                       and e.get('tags', {}).get('building')
                       for m in e.get('members', []) if m.get('role') == 'outer'}
skipped = []
for e in ELEMENTS:
    tags = e.get('tags', {})
    if 'building' not in tags or tags.get('building') == 'no':
        continue
    if e['type'] == 'way' and e['id'] in relation_outer_ways:
        continue
    parts = polygons(e)
    if e['type'] == 'relation' and not parts:
        skipped.append({'id': e['id'], 'reason': 'No closed outer ring; retain independently tagged component ways instead.'})
    for i, (outline, holes) in enumerate(parts):
        if not in_campus(center(outline)) and e['id'] != 1506997102:
            continue
        height, height_source = elevation(tags)
        buildings.append({
            'id': f"{e['type']}/{e['id']}" + (f'/{i}' if len(parts) > 1 else ''),
            'name': tags.get('name:zh', tags.get('name', '校园建筑')),
            'outline': rounded(outline), 'holes': [rounded(h) for h in holes],
            'height': height, 'heightSource': height_source,
            'levels': numeric(tags.get('building:levels')),
            'kind': tags.get('building'),
            'sourceUrl': f"https://www.openstreetmap.org/{e['type']}/{e['id']}",
        })


def intersection_parameters(a, b, polygon):
    """Cut a line only at exact polygon edge intersections."""
    rx, rz = b[0]-a[0], b[1]-a[1]
    values = [0.0, 1.0]
    for c, d in zip(polygon, polygon[1:] + polygon[:1]):
        sx, sz = d[0]-c[0], d[1]-c[1]
        det = rx*sz-rz*sx
        if abs(det) < 1e-9:
            continue
        qx, qz = c[0]-a[0], c[1]-a[1]
        t, u = (qx*sz-qz*sx)/det, (qx*rz-qz*rx)/det
        if 0 < t < 1 and 0 <= u <= 1:
            values.append(t)
    return values


def clipped_lines(points):
    lines, current = [], []
    for a, b in zip(points, points[1:]):
        ts = sorted(set(intersection_parameters(a, b, campus_boundary) +
                        intersection_parameters(a, b, r3_box)))
        at = lambda t: [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t]
        for t0, t1 in zip(ts, ts[1:]):
            if in_campus(at((t0+t1)/2)):
                p0, p1 = at(t0), at(t1)
                if current and math.dist(current[-1], p0) > 0.01:
                    lines.append(current)
                    current = []
                if not current:
                    current.append(p0)
                current.append(p1)
            elif current:
                lines.append(current)
                current = []
    if current:
        lines.append(current)
    return lines


roads = []
for e in ELEMENTS:
    tags = e.get('tags', {})
    kind = tags.get('highway')
    if not kind or e['type'] != 'way' or tags.get('area') == 'yes':
        continue
    if kind in ['proposed', 'construction', 'motorway', 'motorway_link']:
        continue
    width = numeric(tags.get('width'))
    if not width:
        width = {'footway': 2.2, 'path': 1.8, 'steps': 2.5, 'cycleway': 2.8,
                 'service': 5, 'residential': 7, 'tertiary': 9,
                 'secondary': 13, 'primary': 16}.get(kind, 5)
    for n, points in enumerate(clipped_lines([project(p) for p in e.get('geometry', [])])):
        if sum(math.dist(a, b) for a, b in zip(points, points[1:])) < 2:
            continue
        roads.append({'id': f"way/{e['id']}/{n}",
                      'name': tags.get('name:zh', tags.get('name', '')),
                      'points': rounded(points), 'width': width,
                      'kind': kind, 'widthSource': 'osm:width' if tags.get('width') else 'estimated:highway-type'})


waters = []
for e in ELEMENTS:
    if e.get('tags', {}).get('natural') != 'water':
        continue
    # Reservoirs outside the campus are intentionally excluded from the local scene.
    if e['id'] in [2936795, 919070252, 1425706238, 1425706240, 916377055, 17467637]:
        continue
    for i, (outline, holes) in enumerate(polygons(e)):
        if not any(in_campus(p) for p in outline):
            continue
        waters.append({'id': f"{e['type']}/{e['id']}/{i}",
                       'name': e.get('tags', {}).get('name:zh', e.get('tags', {}).get('name', '校园水体')),
                       'outline': rounded(outline), 'holes': [rounded(h) for h in holes],
                       'sourceUrl': f"https://www.openstreetmap.org/{e['type']}/{e['id']}"})


landmarks = {}
for key, lon, lat, name, building_id, anchor_source in [
    ('research', 113.99110, 22.60328, '工学院南楼', 'way/695571961', 'OSM south building northern wing; cross-checked with 2025 campus map'),
    ('college', 113.9952891995979, 22.60504180349547, '学生宿舍15栋', 'way/695571951', 'Public campus navigation POI; lies within OSM footprint'),
    # Off-campus experience has no building: it is anchored at a gate and
    # carries no buildingId, so the renderer never opens an interior for it.
    ('internship', 113.9944801104224, 22.59560217717079, '一号门', None, 'Public campus navigation gate POI (Gate 1); a point on the campus edge, not a building'),
]:
    x, z = project({'lon': lon, 'lat': lat})
    landmarks[key] = {'x': round(x, 2), 'z': round(z, 2), 'name': name,
                      'source': anchor_source, 'lon': lon, 'lat': lat}
    if building_id:
        landmarks[key]['buildingId'] = building_id

all_points = [p for b in buildings for p in b['outline']]
all_points += [p for r in roads for p in r['points']]
all_points += [p for w in waters for p in w['outline']]
bounds = {'minX': math.floor(min(p[0] for p in all_points))-30,
          'maxX': math.ceil(max(p[0] for p in all_points))+30,
          'minZ': math.floor(min(p[1] for p in all_points))-30,
          'maxZ': math.ceil(max(p[1] for p in all_points))+30}
sources = [
    {'title': 'OpenStreetMap contributors', 'url': 'https://www.openstreetmap.org/copyright',
     'note': 'Building footprints, road centerlines, water polygons and level tags. Open Database License (ODbL). Retrieved 2026-09-07; data timestamp ' + RAW['osm3s']['timestamp_osm_base']},
    {'title': 'SUSTech public campus navigation POIs', 'url': 'https://bus.sustcra.com/geojson/sustech_bldg.json',
     'note': 'Community-maintained coordinates for Dorm Block 15 and Gate 1; points are not substituted for building polygons.'},
    {'title': '南科手册 / SUSTransit 校园公交地图 v5.0', 'url': 'https://mirrors.sustech.edu.cn/site/sustech-online/documents/campus-map/SUSTech-Campus-Map-v5-0.pdf',
     'note': 'November 2025 map used for positional cross-checking, including College of Engineering South/North, Dorm 15 and Research Building 3. No PDF geometry copied.'},
]
data = {'origin': ORIGIN, 'bounds': bounds, 'buildings': buildings, 'roads': roads,
        'waters': waters, 'landmarks': landmarks, 'sources': sources,
        'campusBoundary': rounded(campus_boundary),
        'notes': ['Geometry is derived from OSM, not a survey or a photogrammetric model.',
                  'Heights derived from OSM floor counts use assumed floor-to-floor values; heightSource states the method.',
                  'Terrain elevations are intentionally not supplied: this data is a flat-ground footprint model.',
                  'Malformed OSM engineering relation 19871797 has no outer ring and is omitted; its independently tagged south/north buildings are retained.']}
(ASSETS / 'campus-data.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def path(points, closed=True):
    return 'M' + ' L'.join(f'{x:g},{z:g}' for x, z in points) + (' Z' if closed else '')


svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{bounds["minX"]} {bounds["minZ"]} {bounds["maxX"]-bounds["minX"]} {bounds["maxZ"]-bounds["minZ"]}" fill="none">',
       '<title>南方科技大学校园蓝图 · 真实建筑轮廓与路网</title>',
       '<desc>Derived from OpenStreetMap contributors, ODbL. East right, north up. All building positions and outlines come from OSM; this map is not for navigation.</desc>']
svg.append('<g stroke="#fff" stroke-width="2" stroke-linejoin="round" opacity=".52">')
for w in waters:
    d = path(w['outline']) + ''.join(path(h) for h in w['holes'])
    svg.append(f'<path d="{d}" fill="#fff" fill-opacity=".08" fill-rule="evenodd"/>')
svg.append('</g><g stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".38">')
for r in roads:
    svg.append(f'<path d="{path(r["points"], False)}"/>')
svg.append('</g><g stroke="#fff" stroke-width="1.7" stroke-linejoin="round" fill="#fff" fill-opacity=".07">')
for b in buildings:
    d = path(b['outline']) + ''.join(path(h) for h in b['holes'])
    svg.append(f'<path d="{d}" fill-rule="evenodd"><title>{escape(b["name"])}</title></path>')
svg.append('</g><g stroke="#fff" stroke-width="2">')
for landmark in landmarks.values():
    svg.append(f'<circle cx="{landmark["x"]}" cy="{landmark["z"]}" r="8" fill="#fff"/><circle cx="{landmark["x"]}" cy="{landmark["z"]}" r="19"/>')
svg.append('</g></svg>')
(ASSETS / 'campus-plan.svg').write_text('\n'.join(svg), encoding='utf-8')
(HERE / 'processing-report.json').write_text(json.dumps({
    'buildings': len(buildings), 'roads': len(roads), 'waters': len(waters),
    'bounds': bounds, 'heightSources': {s: sum(b['heightSource'] == s for b in buildings) for s in sorted({b['heightSource'] for b in buildings})},
    'skippedRelations': skipped,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'buildings': len(buildings), 'roads': len(roads), 'waters': len(waters), 'bounds': bounds, 'landmarks': landmarks}, ensure_ascii=False, indent=2))
