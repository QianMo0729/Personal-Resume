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

  function laptop(x, y, z, width = 1.2, rotation = 0, tier = 'normal') {
    // The lid leans away from the camera side (+z); rotation turns it on the desk.
    const cosine = Math.cos(rotation), sine = Math.sin(rotation);
    const turn = (point) => [x + point[0] * cosine + point[2] * sine, point[1], z - point[0] * sine + point[2] * cosine];
    const w = width / 2, d = width * 0.34, h = width * 0.64, lean = h * 0.3;
    const base = [[-w, y, -d], [w, y, -d], [w, y, d], [-w, y, d]].map(turn);
    quad(...base, palette.raised);
    path(base, tier, true);
    const lid = [[-w, y, -d], [w, y, -d], [w, y + h, -d - lean], [-w, y + h, -d - lean]].map(turn);
    quad(...lid, palette.screen);
    path(lid, tier, true);
    for (let i = 1; i <= 3; i++) {
      const t = i / 4.4;
      segment(turn([-w * 0.7, y + h * t, -d - lean * t + 0.012]), turn([w * (i === 2 ? 0.2 : 0.62), y + h * t, -d - lean * t + 0.012]), 'soft');
    }
    segment(turn([-w * 0.3, y + 0.004, d * 0.45]), turn([w * 0.3, y + 0.004, d * 0.45]), 'faint');
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
    // curved college atrium.
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

  function venue() {
    // A gabled event hall dressed for a hackathon: a four-day schedule wall
    // behind the stage, team tables on the floor and an organiser desk. The
    // roof section and long structural bays are unlike either other interior.
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

    // Stage, with the event schedule as four day columns. The blocks are an
    // abstract rhythm of sessions; they encode no real agenda items.
    wireBox(6.55, 0.34, -11.35, 12.1, 0.68, 5.2, 'strong', palette.raised);
    wireBox(6.55, 0.18, -8.32, 8.6, 0.36, 0.8, 'normal', palette.raised);
    wireBox(7, 6.35, -14.93, 13.2, 8.2, 0.12, 'strong', palette.screen);
    rect(7, 6.35, -14.862, 12.87, 7.88, 'soft');
    [2.2, 5.4, 8.6, 11.8].forEach((x, i) => {
      const z = -14.814;
      rect(x, 6.42, -14.845, 2.86, 6.92, 'normal');
      engineeringLabel('DAY ' + (i + 1), x, 9.3, -14.818, 1.5, 0.4);
      for (let j = 0; j < 3; j++) {
        const height = 0.95 + ((i + j) % 3) * 0.18;
        const yy = 8.05 - j * 1.48 - (i % 2) * 0.16;
        rect(x, yy, z, 2.3, height, j === 0 ? 'normal' : 'soft');
        segment([x - 0.95, yy + height * 0.18, z], [x + 0.6, yy + height * 0.18, z], 'soft');
        segment([x - 0.95, yy - height * 0.16, z], [x + 0.1, yy - height * 0.16, z], 'faint');
      }
      segment([x - 1.15, 3.7, z], [x + 1.15, 3.7, z], 'soft');
    });
    // A folded lectern marks the pitch position.
    quad([2.7, 0.68, -10.9], [3.8, 0.68, -10.9], [3.57, 2.98, -11.22], [2.93, 2.98, -11.22], palette.raised);
    path([[2.7, 0.68, -10.9], [2.93, 2.98, -11.22], [3.57, 2.98, -11.22], [3.8, 0.68, -10.9]], 'normal');
    quad([2.56, 2.97, -11.65], [3.94, 2.97, -11.65], [3.94, 3.15, -10.92], [2.56, 3.15, -10.92], palette.raised);
    path([[2.56, 2.97, -11.65], [3.94, 2.97, -11.65], [3.94, 3.15, -10.92], [2.56, 3.15, -10.92]], 'strong', true);

    // Team tables face the stage: two laptops and two chairs each.
    for (const [x, z] of [[8.3, -5.4], [13.0, -5.4], [8.3, -1.6], [13.0, -1.6], [8.3, 2.2], [13.0, 2.2]]) {
      desk(x, z, 3.7, 1.5, 2.05, 'normal');
      laptop(x - 0.95, 2.13, z - 0.05, 1.05, 0.12);
      laptop(x + 0.9, 2.13, z + 0.02, 1.05, -0.1);
      chair(x - 0.95, z + 1.3, 0);
      chair(x + 0.9, z + 1.3, 0);
    }
    // Organiser desk beside the stage.
    desk(0.3, -5.9, 4.2, 1.7, 2.25, 'strong');
    monitor(-0.4, 3.32, -6.0, 2.1, 1.36, 1);
    laptop(1.4, 2.33, -5.85, 1.2, -0.25);
    chair(0.3, -4.2, 0);

    horizontalDimension(-4, 16, 14.54, -14.95, '20.00 M');
    segment([16.7, 0, -14.92], [16.7, 14, -14.92], 'soft');
    for (const y of [0, 14]) segment([16.55, y, -14.92], [16.86, y, -14.92], 'normal');
    engineeringLabel('H 14.00 M', 15.25, 11.62, -14.88, 2.6, 0.28);
    engineeringLabel('AGENT HACKATHON / SHENZHEN', 6, 11.5, -14.99, 7.4, 0.36);
    engineeringLabel('HACKATHON VENUE', 6.65, 0.33, -8.725, 4.6, 0.3);
  }

  function portfolio() {
    // A dormitory study bay, cut away on the camera side. A loft bed over a
    // wardrobe sets the scale; one oversized workstation carries the work.
    quad([-8, -0.02, -10], [14, -0.02, -10], [14, -0.02, 9], [-8, -0.02, 9]);
    quad([-5, 0, -10.04], [14, 0, -10.04], [14, 8, -10.04], [-5, 8, -10.04]);
    for (let x = -8; x <= 14; x += 1.5) segment([x, 0.003, -10], [x, 0.003, 9], 'faint');
    for (let z = -10; z <= 9; z += 1.5) segment([-8, 0.003, z], [14, 0.003, z], 'faint');
    path([[-5, 0, -10], [-5, 8, -10], [14, 8, -10], [14, 0, -10]], 'normal');
    path([[-5, 0.14, -9.98], [14, 0.14, -9.98], [14, 0.14, 7]], 'soft');
    for (let z = -10; z <= 6; z += 4) segment([14, 0, z], [14, 8, z], 'soft');
    segment([14, 8, -10], [14, 8, 7], 'soft');
    // Balcony window on the back wall.
    rect(10.2, 4.7, -9.99, 5.6, 4.6, 'normal');
    for (const x of [8.33, 10.2, 12.07]) segment([x, 2.4, -9.985], [x, 7.0, -9.985], 'soft');
    segment([7.4, 5.6, -9.985], [13.0, 5.6, -9.985], 'soft');

    // Loft bed along the back wall, with a ladder at its near end.
    wireBox(-0.2, 5.05, -8.0, 8.4, 0.26, 3.6, 'normal', palette.raised);
    wireBox(-0.2, 5.36, -8.0, 8.0, 0.34, 3.2, 'soft', palette.raised);
    wireBox(-3.3, 5.68, -8.0, 1.5, 0.3, 2.4, 'soft', palette.raised);
    for (const x of [-4.3, 3.9]) for (const z of [-9.7, -6.3]) wireBox(x, 2.52, z, 0.16, 5.04, 0.16, 'normal', palette.raised);
    segment([-4.3, 6.35, -6.3], [3.9, 6.35, -6.3], 'normal');
    for (let x = -4.3; x <= 3.91; x += 1.025) segment([x, 5.2, -6.3], [x, 6.35, -6.3], 'soft');
    for (const x of [4.3, 5.0]) segment([x, 0, -6.1], [x, 6.3, -6.9], 'normal');
    for (let i = 1; i <= 6; i++) segment([4.3, 6.3 * i / 7, -6.1 - 0.8 * i / 7], [5.0, 6.3 * i / 7, -6.1 - 0.8 * i / 7], 'soft');
    // Under the bed: bookshelf and wardrobe.
    shelf(-2.6, -8.7, 2.8, 4.5, 3, true);
    wireBox(1.6, 2.3, -8.5, 3.6, 4.6, 1.9, 'soft', palette.raised);
    segment([1.6, 0.1, -7.54], [1.6, 4.5, -7.54], 'soft');
    for (const x of [1.35, 1.85]) segment([x, 2.1, -7.53], [x, 2.7, -7.53], 'normal');

    // The workstation. Its monitor is the room's subject: one window listing
    // the five projects, drawn as tiles rather than invented screenshots.
    desk(9.2, 2.6, 8.4, 3.4, 2.35, 'strong');
    const sx = 9.3, sy = 4.98, sz = 1.75, screenWidth = 5.9, screenHeight = 3.5;
    const front = sz + 0.085, zf = front + 0.02;
    wireBox(sx, sy, sz, screenWidth, screenHeight, 0.15, 'strong', palette.screen);
    rect(sx, sy + 0.03, front, screenWidth - 0.18, screenHeight - 0.22, 'soft');
    wireBox(sx, 2.84, sz - 0.03, 0.22, 0.78, 0.16, 'normal');
    wireBox(sx, 2.46, sz + 0.1, 2.0, 0.06, 0.9, 'normal');
    const leftEdge = sx - screenWidth / 2 + 0.2, rightEdge = sx + screenWidth / 2 - 0.2;
    const topEdge = sy + screenHeight / 2 - 0.16, bottomEdge = sy - screenHeight / 2 + 0.2;
    const bar = topEdge - 0.34, side = leftEdge + 1.25;
    segment([leftEdge, bar, zf], [rightEdge, bar, zf], 'normal');
    for (let i = 0; i < 3; i++) rect(leftEdge + 0.2 + i * 0.2, topEdge - 0.17, zf, 0.09, 0.09, 'normal');
    rect(sx + 0.3, topEdge - 0.17, zf, 2.2, 0.16, 'faint');
    segment([side, bottomEdge, zf], [side, bar, zf], 'soft');
    for (let i = 0; i < 6; i++) {
      const yy = bar - 0.38 - i * 0.36;
      segment([leftEdge + 0.18, yy, zf], [leftEdge + (i === 0 ? 1.0 : 0.72 + (i % 2) * 0.2), yy, zf], i === 0 ? 'strong' : 'soft');
    }
    engineeringLabel('PORTFOLIO', side + 1.05, bar - 0.28, zf + 0.004, 1.7, 0.2);
    const glyph = (index, cx, cy, z, w, h) => {
      if (index === 0) {
        // Hard Nest: a website in a browser frame.
        rect(cx, cy, z, w, h, 'soft');
        segment([cx - w / 2, cy + h * 0.28, z], [cx + w / 2, cy + h * 0.28, z], 'soft');
        segment([cx - w * 0.3, cy - h * 0.05, z], [cx + w * 0.3, cy - h * 0.05, z], 'normal');
        segment([cx - w * 0.2, cy - h * 0.25, z], [cx + w * 0.2, cy - h * 0.25, z], 'faint');
      } else if (index === 1 || index === 2) {
        // The two iOS apps: a phone, then a waveform or a deadline stack.
        rect(cx - w * 0.28, cy, z, h * 0.5, h, 'soft');
        if (index === 1) {
          const points = [];
          for (let k = 0; k <= 16; k++) points.push([cx - w * 0.02 + k * w * 0.032, cy + Math.sin(k * 1.25) * h * (0.12 + (k % 4) * 0.06), z]);
          path(points, 'normal');
        } else {
          for (let k = 0; k < 3; k++) segment([cx - w * 0.02, cy + h * (0.25 - k * 0.25), z], [cx + w * (0.5 - k * 0.14), cy + h * (0.25 - k * 0.25), z], k === 0 ? 'normal' : 'soft');
        }
      } else if (index === 3) {
        // Shuren Study Buddy: two matched people.
        for (const dx of [-0.28, 0.28]) rect(cx + w * dx, cy, z, h * 0.42, h * 0.42, 'normal');
        segment([cx - w * 0.28 + h * 0.21, cy, z], [cx + w * 0.28 - h * 0.21, cy, z], 'soft');
      } else {
        // MarkPDF: a document split into page and notes.
        rect(cx, cy, z, w * 0.8, h, 'soft');
        segment([cx, cy - h / 2, z], [cx, cy + h / 2, z], 'soft');
        for (let k = 0; k < 3; k++) {
          const yy = cy + h * (0.25 - k * 0.22);
          segment([cx - w * 0.33, yy, z], [cx - w * 0.08, yy, z], 'faint');
          segment([cx + w * 0.08, yy, z], [cx + w * 0.33, yy, z], 'faint');
        }
      }
    };
    const gap = 0.2, tileWidth = (rightEdge - side - gap * 4) / 3, tileHeight = 0.94;
    ['Hard Nest', 'EchoNote', 'Liquid Deadline', '树仁搭子', 'MarkPDF'].forEach((name, index) => {
      const row = index < 3 ? 0 : 1, column = row ? index - 3 : index;
      const cx = side + gap + tileWidth / 2 + column * (tileWidth + gap) + (row ? (tileWidth + gap) / 2 : 0);
      const cy = bar - 0.56 - tileHeight / 2 - row * (tileHeight + 0.16);
      rect(cx, cy, zf, tileWidth, tileHeight, 'normal');
      glyph(index, cx, cy + 0.14, zf + 0.004, tileWidth * 0.62, tileHeight * 0.5);
      engineeringLabel(name, cx, cy - tileHeight / 2 + 0.15, zf + 0.006, tileWidth * 0.9, 0.13);
    });

    keyboard(9.0, 2.46, 3.5, 2.6, 0.78);
    wireBox(10.95, 2.47, 3.5, 0.34, 0.1, 0.56, 'soft');
    laptop(5.9, 2.43, 3.0, 1.9, 0.38);
    // A phone on a stand: two of the projects ship on iOS.
    wireBox(12.75, 3.12, 2.95, 0.7, 1.36, 0.07, 'normal', palette.screen);
    rect(12.75, 3.12, 2.99, 0.58, 1.22, 'soft');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) rect(12.57 + c * 0.18, 3.52 - r * 0.2, 2.992, 0.11, 0.11, 'faint');
    wireBox(12.75, 2.44, 2.9, 0.5, 0.05, 0.4, 'soft');
    // Desk lamp, books and a mug.
    path([[6.2, 2.42, 1.5], [6.2, 4.5, 1.5], [7.25, 5.15, 1.75]], 'normal');
    path([[7.0, 5.2, 1.5], [7.5, 5.1, 2.0], [7.62, 4.72, 2.08], [6.82, 4.86, 1.34]], 'soft', true);
    wireBox(6.2, 2.45, 1.5, 0.7, 0.06, 0.7, 'soft');
    book(12.6, 2.48, 1.7, 1.1, 0.1, 1.3, 'normal');
    book(12.55, 2.59, 1.72, 1.0, 0.11, 1.2);
    cylinder(7.45, 2.62, 3.45, 0.2, 0.4, 'soft', 12);
    chair(9.0, 5.9, 0);
    engineeringLabel('PORTFOLIO / WORKSTATION', 5.2, 7.36, -9.88, 5.6, 0.26);
  }

  if (kind === 'college') college();
  else if (kind === 'portfolio') portfolio();
  else if (kind === 'internship') venue();
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
    portfolio: { camera: [10.2, 5.5, 14.5], target: [4.2, 3.9, -3], silhouette: 'dormitory study bay with a loft bed and one oversized workstation' },
    internship: { camera: [12.5, 8.7, 17], target: [1, 4, -5], silhouette: 'gabled event hall with a schedule wall and team tables' },
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
