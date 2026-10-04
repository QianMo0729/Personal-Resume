/**
 * Lightweight, deliberately schematic interiors for the campus blueprint demo.
 * These are spatial illustrations, not surveyed models of SUSTech rooms.
 * Static surfaces and linework are batched. Small, locally drawn engineering
 * labels use canvas textures; no external assets, lights or animation loop.
 */
export function createInterior(THREE, kind = 'research') {
  const group = new THREE.Group();
  group.name = `blueprint-interior-${kind}`;

  const surfaceBatches = new Map();
  const lineBatches = new Map();
  const animatedClouds = [];
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const palette = { paper: 0x0738a5, raised: 0x0839ad, screen: 0x06349e };
  const lineOpacity = { strong: 0.88, normal: 0.52, soft: 0.25, faint: 0.13 };
  let disposed = false;

  function surface(vertices, color = palette.paper) {
    if (!surfaceBatches.has(color)) surfaceBatches.set(color, []);
    surfaceBatches.get(color).push(...vertices);
  }

  function segment(a, b, tier = 'normal') {
    if (!lineBatches.has(tier)) lineBatches.set(tier, []);
    lineBatches.get(tier).push(...a, ...b);
  }

  function path(points, tier = 'normal', close = false) {
    for (let i = 1; i < points.length; i++) segment(points[i - 1], points[i], tier);
    if (close && points.length > 2) segment(points[points.length - 1], points[0], tier);
  }

  function quad(a, b, c, d, color = palette.paper) {
    surface([...a, ...b, ...c, ...a, ...c, ...d], color);
  }

  function wireBox(x, y, z, width, height, depth, tier = 'normal', color = palette.paper, rotation = 0) {
    const w = width / 2, h = height / 2, d = depth / 2;
    const v = [
      [x - w, y - h, z - d], [x + w, y - h, z - d],
      [x + w, y + h, z - d], [x - w, y + h, z - d],
      [x - w, y - h, z + d], [x + w, y - h, z + d],
      [x + w, y + h, z + d], [x - w, y + h, z + d],
    ];
    if (rotation) {
      const cosine = Math.cos(rotation), sine = Math.sin(rotation);
      for (const point of v) {
        const dx = point[0] - x, dz = point[2] - z;
        point[0] = x + dx * cosine + dz * sine;
        point[2] = z - dx * sine + dz * cosine;
      }
    }
    if (color !== null) {
      for (const face of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3], [1, 2, 6, 5], [3, 7, 6, 2], [0, 1, 5, 4]]) {
        quad(v[face[0]], v[face[1]], v[face[2]], v[face[3]], color);
      }
    }
    for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
      segment(v[a], v[b], tier);
    }
  }

  function rect(x, y, z, width, height, tier = 'normal') {
    const w = width / 2, h = height / 2;
    path([[x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z]], tier, true);
  }

  function cylinder(x, y, z, radius, height, tier = 'normal', steps = 24) {
    const low = y - height / 2, high = y + height / 2;
    for (let i = 0; i < steps; i++) {
      const a = i * Math.PI * 2 / steps, b = (i + 1) * Math.PI * 2 / steps;
      const p = [x + Math.cos(a) * radius, low, z + Math.sin(a) * radius];
      const q = [x + Math.cos(b) * radius, low, z + Math.sin(b) * radius];
      const r = [q[0], high, q[2]], s = [p[0], high, p[2]];
      quad(p, q, r, s, palette.raised);
      surface([x, high, z, ...s, ...r], palette.raised);
      segment(s, r, tier);
      segment(p, q, 'soft');
      if (i % 6 === 0) segment(p, s, 'soft');
    }
  }

  function polar(cx, y, cz, radius, angle) {
    return [cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius];
  }

  function arcLine(cx, y, cz, radius, start = 0, end = Math.PI * 2, tier = 'soft', steps = 48) {
    const points = [];
    for (let i = 0; i <= steps; i++) points.push(polar(cx, y, cz, radius, start + (end - start) * i / steps));
    path(points, tier);
  }

  function arcSlab(cx, cz, inner, outer, base, height, start, end, tier = 'normal', steps = 40) {
    const top = base + height;
    for (let i = 0; i < steps; i++) {
      const a = start + (end - start) * i / steps, b = start + (end - start) * (i + 1) / steps;
      const ai = polar(cx, top, cz, inner, a), ao = polar(cx, top, cz, outer, a);
      const bi = polar(cx, top, cz, inner, b), bo = polar(cx, top, cz, outer, b);
      const al = polar(cx, base, cz, inner, a), bl = polar(cx, base, cz, inner, b);
      const ar = polar(cx, base, cz, outer, a), br = polar(cx, base, cz, outer, b);
      quad(ai, ao, bo, bi, palette.raised);
      quad(al, ai, bi, bl, palette.paper);
      quad(ar, br, bo, ao, palette.paper);
      segment(ai, bi, tier);
      segment(ao, bo, tier);
      segment(al, bl, 'soft');
      segment(ar, br, 'soft');
      if (i === 0) { quad(al, ar, ao, ai); path([al, ar, ao, ai], tier, true); }
      if (i === steps - 1) { quad(bl, bi, bo, br); path([bl, bi, bo, br], tier, true); }
    }
  }

  function engineeringLabel(text, x, y, z, worldWidth = 3, worldHeight = 0.38) {
    let canvas = null;
    if (typeof document !== 'undefined') canvas = document.createElement('canvas');
    else if (typeof OffscreenCanvas !== 'undefined') canvas = new OffscreenCanvas(1024, 128);
    if (!canvas) return;
    canvas.width = 1024; canvas.height = 128;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, 1024, 128);
    context.fillStyle = '#f4f8ff';
    context.font = '700 76px Consolas, "Microsoft YaHei", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 512, 66, 976);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.77, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'schematic-engineering-label';
    mesh.position.set(x, y, z);
    group.add(mesh);
    textures.add(texture); geometries.add(geometry); materials.add(material);
  }

  function horizontalDimension(x1, x2, y, z, label) {
    segment([x1, y, z], [x2, y, z], 'soft');
    for (const x of [x1, x2]) segment([x - 0.09, y - 0.13, z], [x + 0.09, y + 0.13, z], 'normal');
    engineeringLabel(label, (x1 + x2) / 2, y + 0.28, z + 0.025, 2.3, 0.3);
  }

  function desk(x, z, width = 5, depth = 2.2, top = 2.3, tier = 'normal') {
    wireBox(x, top, z, width, 0.14, depth, tier, palette.raised);
    for (const dx of [-width / 2 + 0.18, width / 2 - 0.18]) {
      for (const dz of [-depth / 2 + 0.16, depth / 2 - 0.16]) {
        wireBox(x + dx, top / 2, z + dz, 0.1, top - 0.08, 0.1, 'soft');
      }
    }
    segment([x - width / 2 + 0.18, top - 0.4, z - depth / 2 + 0.16], [x + width / 2 - 0.18, top - 0.4, z - depth / 2 + 0.16], 'soft');
  }

  function chair(x, z, rotation = 0, lounge = false) {
    // Local chair coordinates are rotated into world coordinates before batching.
    const turn = (point) => [x + point[0] * Math.cos(rotation) + point[2] * Math.sin(rotation), point[1], z - point[0] * Math.sin(rotation) + point[2] * Math.cos(rotation)];
    const width = lounge ? 1.55 : 1.12;
    const depth = lounge ? 1.5 : 1.1;
    const seatY = lounge ? 0.85 : 1.1;
    const w = width / 2, d = depth / 2;
    const seat = [[-w, seatY, -d], [w, seatY, -d], [w, seatY, d], [-w, seatY, d]].map(turn);
    quad(...seat, palette.raised);
    path(seat, 'normal', true);
    const back = [[-w, seatY, d], [w, seatY, d], [w, seatY + 1.3, d + 0.17], [-w, seatY + 1.3, d + 0.17]].map(turn);
    quad(...back, palette.raised);
    path(back, 'normal', true);
    for (const dx of [-w + 0.1, w - 0.1]) {
      for (const dz of [-d + 0.1, d - 0.1]) segment(turn([dx, seatY, dz]), turn([dx * 1.05, 0.05, dz * 1.05]), 'soft');
      path([[dx, seatY, -0.3], [dx, seatY + 0.45, -0.3], [dx, seatY + 0.45, d + 0.06]].map(turn), 'soft');
    }
    for (let i = 1; i <= 5; i++) {
      const yy = seatY + i * 0.19;
      segment(turn([-w + 0.08, yy, d + 0.17 * (yy - seatY) / 1.3 + 0.012]), turn([w - 0.08, yy, d + 0.17 * (yy - seatY) / 1.3 + 0.012]), 'faint');
    }
  }

  function chart(x, y, z, width, height, variant = 0) {
    const left = x - width * 0.39, bottom = y - height * 0.33;
    const right = x + width * 0.39, top = y + height * 0.32;
    path([[left, top, z], [left, bottom, z], [right, bottom, z]], 'soft');
    for (let i = 1; i <= 4; i++) segment([left, bottom + (top - bottom) * i / 4, z], [right, bottom + (top - bottom) * i / 4, z], 'faint');
    if (variant === 1) {
      const nodes = [];
      for (let i = 0; i < 14; i++) {
        const theta = i * 2.39996;
        const radius = Math.sqrt((i + 1) / 14);
        nodes.push([x + Math.cos(theta) * width * 0.34 * radius, y + Math.sin(theta) * height * 0.29 * radius, z + 0.012]);
      }
      nodes.forEach((p, i) => {
        segment(p, nodes[(i + 3) % nodes.length], 'soft');
        const e = width * 0.008;
        segment([p[0] - e, p[1], p[2]], [p[0] + e, p[1], p[2]], 'strong');
        segment([p[0], p[1] - e, p[2]], [p[0], p[1] + e, p[2]], 'strong');
      });
    } else {
      for (let k = 0; k < 3; k++) {
        const points = [];
        for (let i = 0; i <= 24; i++) {
          const t = i / 24;
          const value = 0.16 + k * 0.15 + t * 0.28 + Math.sin(t * 9.4 + k * 1.7) * 0.085;
          points.push([left + (right - left) * t, bottom + (top - bottom) * value, z + 0.014]);
        }
        path(points, k === 0 ? 'normal' : 'soft');
      }
    }
  }

  function pointCloud(x, y, z, width, height, seed = 1, count = 300) {
    // Seeded geometry is illustrative. It encodes no research measurements.
    let state = seed * 1337 + 29;
    const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
    const vertices = [];
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2;
      const b = Math.acos(2 * random() - 1);
      const r = Math.pow(random(), 0.4);
      const ripple = 0.83 + Math.sin(a * 3 + b * 2) * 0.17;
      vertices.push(Math.cos(a) * Math.sin(b) * width * 0.37 * r * ripple, Math.cos(b) * height * 0.35 * r, Math.sin(a) * Math.sin(b) * 0.035 * r);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xf7fbff, size: 0.022, sizeAttenuation: true, transparent: true, opacity: 0.78, depthWrite: false });
    const cloud = new THREE.Points(geometry, material);
    cloud.name = 'illustrative-point-cloud';
    cloud.position.set(x, y, z + 0.06);
    group.add(cloud);
    geometries.add(geometry);
    materials.add(material);
    animatedClouds.push({ cloud, phase: seed * 0.7 });
  }

  function monitor(x, y, z, width = 2, height = 1.4, variant = 0, large = false) {
    wireBox(x, y, z, width, height, 0.11, large ? 'strong' : 'normal', palette.screen);
    const front = z + 0.064;
    rect(x, y + 0.025, front, width - 0.12, height - 0.16, 'soft');
    wireBox(x, y - height / 2 - 0.17, z - 0.02, 0.13, 0.32, 0.13, 'soft');
    wireBox(x, y - height / 2 - 0.32, z + 0.08, width * 0.37, 0.055, 0.4, 'soft');
    if (variant === 0) {
      const cx = large ? x - width * 0.1 : x;
      pointCloud(cx, y + 0.03, front, large ? width * 0.76 : width * 0.9, height * 0.8, Math.round(x * 7 + 40), large ? 620 : 200);
      const ax = x - width * 0.34, ay = y - height * 0.29;
      path([[ax, ay + height * 0.24, front + 0.02], [ax, ay, front + 0.02], [ax + width * 0.22, ay, front + 0.02]], 'soft');
      segment([ax, ay, front + 0.02], [ax + width * 0.1, ay + height * 0.13, front + 0.02], 'soft');
      if (large) {
        const divider = x + width * 0.27;
        segment([divider, y - height * 0.36, front + 0.02], [divider, y + height * 0.35, front + 0.02], 'soft');
        for (let i = 0; i < 11; i++) {
          const yy = y + height * 0.3 - i * height * 0.055;
          segment([divider + width * 0.035, yy, front + 0.024], [divider + width * (i % 3 === 0 ? 0.14 : 0.1), yy, front + 0.024], i % 3 === 0 ? 'normal' : 'soft');
        }
      }
    } else chart(x, y, front + 0.025, width * 0.94, height * 0.85, variant % 2);
    segment([x + width * 0.36, y - height * 0.44, front + 0.02], [x + width * 0.39, y - height * 0.44, front + 0.02], 'strong');
  }

  function keyboard(x, y, z, width = 2, depth = 0.64) {
    wireBox(x, y, z, width, 0.05, depth, 'normal');
    for (let row = 1; row < 4; row++) segment([x - width / 2 + 0.06, y + 0.028, z - depth / 2 + row * depth / 4], [x + width / 2 - 0.06, y + 0.028, z - depth / 2 + row * depth / 4], 'soft');
    for (let col = 1; col < 12; col++) segment([x - width / 2 + col * width / 12, y + 0.028, z - depth / 2 + 0.05], [x - width / 2 + col * width / 12, y + 0.028, z + depth / 2 - 0.05], 'soft');
  }

  function book(x, y, z, width = 0.52, height = 0.12, depth = 0.7, tier = 'soft') {
    wireBox(x, y, z, width, height, depth, tier, palette.raised);
    segment([x - width / 2 + 0.05, y, z + depth / 2 + 0.003], [x + width / 2 - 0.05, y, z + depth / 2 + 0.003], 'faint');
  }

  function shelf(x, z, width = 3.2, height = 5.6, rows = 4, filled = true) {
    wireBox(x - width / 2, height / 2, z, 0.075, height, 1, 'soft');
    wireBox(x + width / 2, height / 2, z, 0.075, height, 1, 'soft');
    for (let row = 0; row <= rows; row++) {
      const yy = 0.25 + row * (height - 0.25) / rows;
      wireBox(x, yy, z, width, 0.06, 1, 'soft');
      if (filled && row < rows) {
        for (let i = 0; i < Math.floor(width / 0.31) - 1; i++) {
          const h = 0.6 + ((i * 3 + row * 2) % 5) * 0.08;
          const bx = x - width / 2 + 0.3 + i * 0.3;
          wireBox(bx, yy + h / 2 + 0.04, z + 0.09, 0.18 + (i % 2) * 0.055, h, 0.56, 'soft', palette.raised);
          segment([bx - 0.05, yy + h * 0.72, z + 0.38], [bx + 0.05, yy + h * 0.72, z + 0.38], 'faint');
        }
      }
    }
  }

  function noticeBoard(x, y, z, width, height, variant = 0) {
    wireBox(x, y, z, width, height, 0.09, 'normal');
    rect(x, y, z + 0.051, width - 0.15, height - 0.15, 'soft');
    if (variant === 0) chart(x, y, z + 0.062, width * 0.84, height * 0.82, 1);
    else {
      for (let i = 0; i < 3; i++) {
        const px = x + (i - 1) * width * 0.26;
        rect(px, y + height * 0.13, z + 0.07, width * 0.21, height * 0.35, 'normal');
        for (let j = 0; j < 4; j++) segment([px - width * 0.09, y - height * (0.1 + j * 0.06), z + 0.072], [px + width * (j === 3 ? 0.04 : 0.09), y - height * (0.1 + j * 0.06), z + 0.072], 'soft');
      }
    }
  }

  function researchArchitecture() {
    quad([-10, -0.02, -12], [12, -0.02, -12], [12, -0.02, 9], [-10, -0.02, 9]);
    // A cutaway room: opaque back wall, open front and right side for the camera.
    quad([-5, 0, -12.04], [12, 0, -12.04], [12, 8, -12.04], [-5, 8, -12.04]);
    for (let x = -10; x <= 12; x += 1.5) segment([x, 0.003, -12], [x, 0.003, 9], 'faint');
    for (let z = -12; z <= 9; z += 1.5) segment([-10, 0.003, z], [12, 0.003, z], 'faint');
    path([[-5, 0, -12], [-5, 8, -12], [12, 8, -12], [12, 0, -12]], 'normal');
    path([[-5, 0.14, -11.98], [12, 0.14, -11.98], [12, 0.14, 7]], 'soft');
    path([[-5, 7.65, -11.98], [12, 7.65, -11.98], [12, 7.65, 7]], 'soft');
    for (let z = -12; z <= 6; z += 3) {
      segment([-3, 8, z], [12, 8, z], 'faint');
      segment([12, 0, z], [12, 8, z], 'soft');
    }
    for (let x = -3; x <= 12; x += 3) segment([x, 8, -12], [x, 8, 6], 'faint');
    for (const z of [-8.5, -2.5, 3.5]) wireBox(5.3, 7.78, z, 7.4, 0.09, 0.26, 'normal');
    // Architectural doorway and window mullions.
    rect(-3.2, 2.42, -11.99, 2.15, 4.84, 'normal');
    rect(-3.2, 2.42, -11.975, 1.91, 4.6, 'soft');
    segment([-2.49, 2.1, -11.94], [-2.14, 2.1, -11.94], 'normal');
    for (const y of [2.5, 5.7]) segment([11.995, y, -11.8], [11.995, y, 0], 'soft');
    wireBox(11.85, 4, -11.8, 0.2, 8, 0.2, 'normal');
    // Exposed rectangular steelwork distinguishes this industrial lab from the
    // curved college atrium and the tall, pitched-roof campus forum.
    for (const z of [-9.9, -3.8, 2.2]) {
      wireBox(4.4, 7.98, z, 15.1, 0.15, 0.14, 'normal', palette.raised);
      segment([-3.15, 7.35, z], [11.95, 7.35, z], 'soft');
      for (let x = -3.15; x < 11.9; x += 2.15) {
        segment([x, 7.98, z], [x + 1.075, 7.35, z], 'soft');
        segment([x + 1.075, 7.35, z], [Math.min(x + 2.15, 11.95), 7.98, z], 'soft');
      }
    }
    horizontalDimension(-5, 12, 8.43, -11.9, '17.00 M');
    engineeringLabel('VISUALIZATION / LAB', 7.1, 7.36, -11.88, 4.9, 0.26);
  }

  function research() {
    researchArchitecture();
    shelf(-0.7, -8.1, 2.5, 5.3, 4, true);
    desk(6.6, -8.7, 10, 2.2, 2.32, 'soft');
    [2.4, 5.15, 7.9, 10.45].forEach((x, i) => {
      monitor(x, 3.42, -8.65, 1.98, 1.42, i % 3);
      keyboard(x, 2.43, -7.94, 1.48, 0.48);
      chair(x, -6.65, Math.PI);
    });
    [2.35, 6.2, 10.05].forEach((x, i) => {
      noticeBoard(x, 5.83, -11.92, 3.45, 2.7, 0);
      if (i !== 1) pointCloud(x, 5.86, -11.8, 2.7, 2.1, i + 3, 320);
    });
    desk(8.0, 2.1, 6.4, 3.25, 2.35, 'strong');
    monitor(8.35, 3.93, 1.95, 3.78, 2.34, 0, true);
    keyboard(8.16, 2.46, 3.12, 2.22, 0.69);
    wireBox(10.04, 2.47, 3.12, 0.36, 0.1, 0.53, 'soft');
    book(5.75, 2.48, 2.86, 1.12, 0.08, 1.4, 'normal');
    book(5.84, 2.57, 2.83, 1.08, 0.1, 1.32, 'normal');
    book(10.55, 2.51, 1.5, 0.96, 0.15, 1.06);
    book(10.49, 2.67, 1.56, 0.89, 0.15, 1.01);
    wireBox(10.56, 0.95, 1.4, 1.09, 1.9, 1.1, 'soft');
    for (let i = 0; i < 3; i++) {
      rect(10.56, 0.4 + i * 0.55, 1.956, 0.9, 0.44, 'soft');
      segment([10.43, 0.47 + i * 0.55, 1.97], [10.69, 0.47 + i * 0.55, 1.97], 'normal');
    }
    chair(7.75, 4.75, 0);
  }

  function college() {
    const cx = 6, cz = -3, start = Math.PI, end = Math.PI * 2;
    // A circular reading atrium, cut away on the camera side. The only straight
    // slab is the small connection to the shared entrance foyer at z=9.
    cylinder(cx, -0.085, cz, 10, 0.13, 'soft', 80);
    wireBox(10, -0.085, 7.9, 10, 0.13, 2.2, 'faint');
    for (const radius of [2, 4, 6, 8, 9.4]) arcLine(cx, 0.005, cz, radius, 0, Math.PI * 2, 'faint', 80);
    for (let i = 0; i < 16; i++) segment(polar(cx, 0.01, cz, 1.4, i * Math.PI / 8), polar(cx, 0.01, cz, 9.5, i * Math.PI / 8), 'faint');

    // One continuous concave book wall rather than two freestanding bookcases.
    arcSlab(cx, cz, 8.7, 8.9, 0, 8.5, start, end, 'normal', 56);
    const shelfLevels = [0.35, 1.65, 2.95, 4.25, 5.55, 6.85];
    for (const level of shelfLevels) arcSlab(cx, cz, 7.55, 8.52, level, 0.09, start, end, 'normal', 56);
    const bays = 14;
    for (let i = 0; i <= bays; i++) {
      const angle = start + Math.PI * i / bays;
      const lowerInner = polar(cx, 0.35, cz, 7.55, angle), lowerOuter = polar(cx, 0.35, cz, 8.52, angle);
      const upperInner = polar(cx, 6.94, cz, 7.55, angle), upperOuter = polar(cx, 6.94, cz, 8.52, angle);
      quad(lowerInner, lowerOuter, upperOuter, upperInner, palette.raised);
      path([lowerInner, lowerOuter, upperOuter, upperInner], 'soft', true);
      if (i === bays) continue;
      for (let row = 0; row < 5; row++) {
        for (let b = 0; b < 3; b++) {
          const a = angle + Math.PI / bays * (0.24 + b * 0.24);
          const h = 0.7 + ((i + row * 2 + b * 3) % 5) * 0.09;
          const position = polar(cx, shelfLevels[row] + 0.10 + h / 2, cz, 8.03, a);
          wireBox(...position, 0.22 + (b % 2) * 0.08, h, 0.54, 'soft', palette.raised, Math.PI / 2 - a);
        }
      }
    }

    // Curved roof ribs rise into a large open oculus. No solid front wall or
    // roof plane obstructs the incoming camera or the opening above the books.
    arcSlab(cx, cz, 8.72, 9.15, 8.43, 0.18, start, end, 'strong', 56);
    arcLine(cx, 7.72, cz, 8.65, start, end, 'soft', 56);
    for (let i = 0; i <= 8; i++) {
      const angle = start + Math.PI * i / 8;
      const rib = [];
      for (let j = 0; j <= 12; j++) {
        const t = j / 12;
        rib.push(polar(cx, 8.62 + Math.sin(t * Math.PI / 2) * 2.18, cz, 8.91 - t * 4.71, angle));
      }
      path(rib, i % 2 ? 'soft' : 'normal');
    }
    arcSlab(cx, cz, 4.12, 4.30, 10.72, 0.11, start, end, 'strong', 48);
    arcLine(cx, 10.77, cz, 4.2, 0, Math.PI, 'soft', 48);
    arcLine(cx, 10.89, cz, 4.2, 0, Math.PI, 'faint', 48);

    // Concentric low seating descends towards a shared reading island.
    arcSlab(cx, cz, 5.05, 5.90, 0, 0.48, start + 0.06, end - 0.06, 'normal', 48);
    arcSlab(cx, cz, 5.98, 6.84, 0, 0.90, start + 0.06, end - 0.06, 'normal', 48);
    for (let i = 1; i < 9; i++) {
      const angle = start + Math.PI * i / 9;
      segment(polar(cx, 0.493, cz, 5.15, angle), polar(cx, 0.493, cz, 5.80, angle), 'soft');
      segment(polar(cx, 0.913, cz, 6.08, angle), polar(cx, 0.913, cz, 6.74, angle), 'soft');
    }
    cylinder(cx, 0.095, cz, 3.35, 0.19, 'normal', 64);
    cylinder(cx, 1.57, cz + 0.25, 1.8, 0.14, 'strong', 48);
    cylinder(cx, 0.83, cz + 0.25, 0.42, 1.34, 'soft', 20);
    book(5.25, 1.73, -2.45, 0.7, 0.12, 1.0, 'normal');
    book(6.6, 1.73, -3.18, 0.82, 0.12, 1.0, 'normal');
    book(6.56, 1.86, -3.12, 0.76, 0.12, 0.93, 'normal');
    chair(3.35, -1.45, -0.85, true);
    chair(7.7, -0.47, 0.6, true);
    // An open crescent sofa on the near right reinforces the circular plan.
    arcSlab(cx, cz, 4.2, 5.18, 0, 0.82, 0.03, 1.31, 'strong', 28);
    arcSlab(cx, cz, 5.02, 5.19, 0.82, 0.95, 0.03, 1.31, 'normal', 28);
    for (const angle of [0.36, 0.69, 1.02]) segment(polar(cx, 0.837, cz, 4.3, angle), polar(cx, 0.837, cz, 4.96, angle), 'soft');

    horizontalDimension(-2.9, 14.9, 9.05, -3.15, 'Ø 17.80 M');
    engineeringLabel('READING ATRIUM', 6.1, 7.43, -11.49, 4.7, 0.32);
  }

  function campus() {
    // A double-height gabled forum. Its roof section, long structural bays and
    // stepped audience area are intentionally unlike either other interior.
    quad([-9, -0.02, -15], [17, -0.02, -15], [17, -0.02, 9], [-9, -0.02, 9]);
    quad([-4, 0, -15.06], [16, 0, -15.06], [16, 10, -15.06], [-4, 10, -15.06]);
    surface([-4, 10, -15.06, 16, 10, -15.06, 6, 14, -15.06], palette.paper);
    for (let x = -9; x <= 17; x += 2) segment([x, 0.008, -15], [x, 0.008, 9], 'faint');
    for (let z = -15; z <= 9; z += 2) segment([-9, 0.008, z], [17, 0.008, z], 'faint');
    for (const z of [-14.8, -8.2, -1.6, 5]) {
      const section = [[-4, 0, z], [-4, 10, z], [6, 14, z], [16, 10, z], [16, 0, z]];
      path(section, 'normal');
      path([[-3.83, 9.8, z], [6, 13.75, z], [15.83, 9.8, z]], 'soft');
      segment([-3.83, 9.8, z], [15.83, 9.8, z], 'soft');
      for (const x of [1, 6, 11]) {
        const roofY = 14 - Math.abs(x - 6) * 0.4;
        segment([x, 9.8, z], [x, roofY - 0.16, z], 'soft');
        segment([x - 2.5, 9.8, z], [x, roofY - 0.16, z], 'faint');
      }
      wireBox(15.92, 5, z, 0.16, 10, 0.16, 'normal', palette.raised);
    }
    for (const [x, y] of [[-4, 10], [1, 12], [6, 14], [11, 12], [16, 10]]) segment([x, y, -15], [x, y, 6], 'soft');
    for (const y of [0.18, 3.25, 7.4]) segment([16, y, -15], [16, y, 5], 'soft');

    // A broad proposal wall rises above a raised presentation platform.
    wireBox(6.55, 0.34, -11.35, 12.1, 0.68, 5.2, 'strong', palette.raised);
    wireBox(6.55, 0.18, -8.32, 8.6, 0.36, 0.8, 'normal', palette.raised);
    wireBox(7, 6.35, -14.93, 13.2, 8.2, 0.12, 'strong', palette.screen);
    rect(7, 6.35, -14.862, 12.87, 7.88, 'soft');
    [2.8, 7, 11.2].forEach((x, i) => {
      rect(x, 6.42, -14.845, 3.72, 6.92, 'normal');
      engineeringLabel(['观察', '共议', '行动'][i], x, 9.15, -14.818, 1.4, 0.44);
      if (i === 0) {
        // A small abstract floor-plan diagram, without invented outcome data.
        const z = -14.814;
        rect(x, 6.65, z, 2.6, 2.95, 'normal');
        path([[x - 1.3, 6.9, z], [x - 0.4, 6.9, z], [x - 0.4, 8.1, z]], 'soft');
        path([[x - 0.4, 6.9, z], [x + 0.55, 6.9, z], [x + 0.55, 5.18, z]], 'soft');
        path([[x + 0.55, 7.45, z], [x + 1.3, 7.45, z]], 'soft');
        rect(x - 0.84, 7.52, z, 0.46, 0.52, 'faint');
        rect(x + 0.88, 6.04, z, 0.42, 0.9, 'faint');
      } else if (i === 1) {
        for (let j = 0; j < 3; j++) {
          const yy = 7.7 - j * 1.08;
          rect(x + (j % 2 ? 0.24 : -0.24), yy, -14.814, 1.95, 0.65, 'normal');
          if (j < 2) segment([x, yy - 0.325, -14.81], [x, yy - 0.755, -14.81], 'soft');
        }
      } else {
        for (let j = 0; j < 4; j++) {
          const yy = 7.9 - j * 0.76;
          rect(x - 1.05, yy, -14.814, 0.3, 0.3, 'normal');
          segment([x - 0.68, yy + 0.08, -14.814], [x + 1.12, yy + 0.08, -14.814], 'soft');
          segment([x - 0.68, yy - 0.13, -14.814], [x + 0.63, yy - 0.13, -14.814], 'faint');
        }
      }
      for (let line = 0; line < 3; line++) segment([x - 1.3, 4.55 - line * 0.3, -14.814], [x + (line === 2 ? 0.7 : 1.3), 4.55 - line * 0.3, -14.814], 'soft');
    });

    // Six deep bleacher rows, with a separate half-rise stair aisle. The high
    // end is nearest the viewer; the lower rows face the presentation platform.
    for (let row = 0; row < 6; row++) {
      const z = -5.15 + row * 1.55, rise = 0.45 * (row + 1);
      wireBox(10.65, rise / 2, z, 7.5, rise, 1.55, 'normal', palette.raised);
      segment([6.99, rise + 0.015, z + 0.67], [14.30, rise + 0.015, z + 0.67], 'strong');
      for (const x of [7.4, 9.15, 10.9, 12.65]) {
        wireBox(x + 0.54, rise + 0.07, z - 0.05, 1.14, 0.10, 0.64, 'soft', palette.raised);
      }
    }
    for (let step = 0; step < 12; step++) {
      const rise = 0.225 * (step + 1), z = -5.54 + step * 0.775;
      wireBox(15.03, rise / 2, z, 0.98, rise, 0.775, 'soft', palette.paper);
    }
    path([[15.67, 1.2, -5.9], [15.67, 3.96, 3.25]], 'normal');
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      segment([15.67, 0.2 + 2.7 * t, -5.9 + 9.15 * t], [15.67, 1.2 + 2.76 * t, -5.9 + 9.15 * t], 'soft');
    }
    // A folded lectern marks the platform without repeating a desk-and-monitor.
    quad([2.7, 0.68, -10.9], [3.8, 0.68, -10.9], [3.57, 2.98, -11.22], [2.93, 2.98, -11.22], palette.raised);
    path([[2.7, 0.68, -10.9], [2.93, 2.98, -11.22], [3.57, 2.98, -11.22], [3.8, 0.68, -10.9]], 'normal');
    quad([2.56, 2.97, -11.65], [3.94, 2.97, -11.65], [3.94, 3.15, -10.92], [2.56, 3.15, -10.92], palette.raised);
    path([[2.56, 2.97, -11.65], [3.94, 2.97, -11.65], [3.94, 3.15, -10.92], [2.56, 3.15, -10.92]], 'strong', true);
    horizontalDimension(-4, 16, 14.54, -14.95, '20.00 M');
    segment([16.7, 0, -14.92], [16.7, 14, -14.92], 'soft');
    for (const y of [0, 14]) segment([16.55, y, -14.92], [16.86, y, -14.92], 'normal');
    engineeringLabel('H 14.00 M', 15.25, 11.62, -14.88, 2.6, 0.28);
    engineeringLabel('CAMPUS FORUM', 6.65, 0.33, -8.725, 4.3, 0.3);
  }

  if (kind === 'college') college();
  else if (kind === 'campus') campus();
  else research();

  for (const [color, vertices] of surfaceBatches) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeBoundingSphere();
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'batched-blueprint-surfaces';
    group.add(mesh);
    geometries.add(geometry);
    materials.add(material);
  }

  for (const [tier, vertices] of lineBatches) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeBoundingSphere();
    const material = new THREE.LineBasicMaterial({ color: 0xf5f9ff, transparent: true, opacity: lineOpacity[tier], depthWrite: false });
    const lines = new THREE.LineSegments(geometry, material);
    lines.name = `batched-blueprint-lines-${tier}`;
    group.add(lines);
    geometries.add(geometry);
    materials.add(material);
  }

  group.userData.illustrative = true;
  group.userData.kind = kind;
  group.userData.description = 'Conceptual interior; not a surveyed or photographic reconstruction.';
  const framing = {
    research: { camera: [10, 6, 16], target: [0, 3, -3], silhouette: 'rectangular steel-frame visualization lab' },
    college: { camera: [12, 7.6, 16], target: [1.5, 3.1, -4], silhouette: 'curved book wall, circular reading atrium and open oculus' },
    campus: { camera: [12.5, 8.7, 17], target: [1, 4, -5], silhouette: 'double-height gabled forum with tiered audience seating' },
  };
  const view = framing[kind] || framing.research;
  group.userData.silhouette = view.silhouette;

  return {
    group,
    cameraPosition: new THREE.Vector3(...view.camera),
    lookAt: new THREE.Vector3(...view.target),
    update(t = 0) {
      if (disposed || !Number.isFinite(t)) return;
      for (const { cloud, phase } of animatedClouds) cloud.rotation.z = Math.sin(t * 0.035 + phase) * 0.025;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
      group.removeFromParent();
      group.clear();
      animatedClouds.length = 0;
      geometries.clear();
      materials.clear();
      textures.clear();
    },
  };
}
