/**
 * Three schematic, blueprinted entrances with distinct architectural forms.
 * Coordinates are continuous with interior-scene.js; this is not a surveyed
 * SUSTech corridor. There is deliberately no independent animation loop.
 */
export function createEntrance(THREE, kind = 'research') {
  kind = ['research', 'college'].includes(kind) ? kind : 'research';
  const group = new THREE.Group();
  group.name = `blueprint-entrance-${kind}`;
  group.userData.illustrative = true;
  group.userData.description = 'Illustrative entrance; not a surveyed SUSTech doorway.';
  group.userData.entranceType = { research: 'sliding-glass', college: 'arched-lattice' }[kind];

  const geometrySet = new Set();
  const materialSet = new Set();
  const textureSet = new Set();
  const colors = { wall: 0x0738a5, inset: 0x063293, raised: 0x083caf };
  const opacity = { strong: 0.82, normal: 0.47, soft: 0.24, faint: 0.11 };
  const OPEN_ANGLE = 100 * Math.PI / 180;
  let disposed = false, opening = 0;

  // A separate batch for moving door geometry keeps static draw calls low.
  function builder(parent) {
    const surfaces = new Map();
    const lines = new Map();
    function segment(a, b, tier = 'normal') {
      if (!lines.has(tier)) lines.set(tier, []);
      lines.get(tier).push(...a, ...b);
    }
    function path(points, tier = 'normal', closed = false) {
      for (let i = 1; i < points.length; i++) segment(points[i - 1], points[i], tier);
      if (closed) segment(points[points.length - 1], points[0], tier);
    }
    function quad(a, b, c, d, color) {
      if (!surfaces.has(color)) surfaces.set(color, []);
      surfaces.get(color).push(...a, ...b, ...c, ...a, ...c, ...d);
    }
    function box(x, y, z, w, h, d, tier = 'normal', color = colors.wall) {
      const v = [
        [x - w / 2, y - h / 2, z - d / 2], [x + w / 2, y - h / 2, z - d / 2],
        [x + w / 2, y + h / 2, z - d / 2], [x - w / 2, y + h / 2, z - d / 2],
        [x - w / 2, y - h / 2, z + d / 2], [x + w / 2, y - h / 2, z + d / 2],
        [x + w / 2, y + h / 2, z + d / 2], [x - w / 2, y + h / 2, z + d / 2],
      ];
      if (color !== null) {
        for (const face of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3], [1, 2, 6, 5], [3, 7, 6, 2], [0, 1, 5, 4]]) {
          quad(v[face[0]], v[face[1]], v[face[2]], v[face[3]], color);
        }
      }
      for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
        segment(v[a], v[b], tier);
      }
    }
    function finish() {
      for (const [color, positions] of surfaces) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();
        const material = new THREE.MeshBasicMaterial({
          color, side: THREE.DoubleSide, polygonOffset: true,
          polygonOffsetFactor: 1, polygonOffsetUnits: 1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'batched-entrance-surfaces';
        parent.add(mesh);
        geometrySet.add(geometry);
        materialSet.add(material);
      }
      for (const [tier, positions] of lines) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();
        const material = new THREE.LineBasicMaterial({
          color: 0xf5f9ff, transparent: true, opacity: opacity[tier], depthWrite: false,
        });
        const line = new THREE.LineSegments(geometry, material);
        line.name = `batched-entrance-lines-${tier}`;
        parent.add(line);
        geometrySet.add(geometry);
        materialSet.add(material);
      }
    }
    return { box, segment, path, quad, finish };
  }

  const architecture = builder(group);
  const { box, segment, path, quad } = architecture;

  // Native triangle strips produce curved ribs without an extra draw call.
  function arch(z, radius = 4.78, thickness = 0.11, depth = 0.18) {
    const outer = [], inner = [];
    for (let i = 0; i <= 32; i++) {
      const angle = i * Math.PI / 32;
      outer.push([10 + (radius + thickness) * Math.cos(angle), 4 + (radius + thickness) * Math.sin(angle), z]);
      inner.push([10 + radius * Math.cos(angle), 4 + radius * Math.sin(angle), z]);
    }
    for (let i = 1; i < outer.length; i++) {
      const a = outer[i - 1], b = outer[i], c = inner[i], d = inner[i - 1];
      for (const dz of [-depth / 2, depth / 2]) {
        quad([a[0], a[1], z + dz], [b[0], b[1], z + dz], [c[0], c[1], z + dz], [d[0], d[1], z + dz], colors.raised);
      }
      quad([b[0], b[1], z - depth / 2], [a[0], a[1], z - depth / 2], [a[0], a[1], z + depth / 2], [b[0], b[1], z + depth / 2], colors.raised);
      quad([c[0], c[1], z - depth / 2], [d[0], d[1], z - depth / 2], [d[0], d[1], z + depth / 2], [c[0], c[1], z + depth / 2], colors.raised);
    }
    path(outer, 'normal'); path(inner, 'strong');
    for (const x of [10 - radius - thickness / 2, 10 + radius + thickness / 2]) box(x, 2, z, thickness, 4, depth, 'normal', colors.raised);
  }

  function glass(parent, x, y, z, w, h, alpha = 0.07) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const material = new THREE.MeshBasicMaterial({ color: 0x99bdff, transparent: true, opacity: alpha, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'door-glass'; mesh.position.set(x, y, z);
    parent.add(mesh); geometrySet.add(geometry); materialSet.add(material);
  }

  // Continuous floor and opaque walls/ceiling keep the exterior out of view.
  // The foyer floor reaches z=9, meeting the existing room floor. Walls and
  // ceiling stop at z=19, behind the final camera at (10,6,16), so the corridor
  // cannot obscure the established final room composition.
  const halfWidth = 5;
  const ceiling = 9;
  const left = 10 - halfWidth, right = 10 + halfWidth;
  box(10, -0.09, 28.5, halfWidth * 2 + 0.2, 0.18, 39, 'soft', colors.wall);
  box(left - 0.1, ceiling / 2, 33.5, 0.2, ceiling, 29, 'normal', colors.wall);
  box(right + 0.1, ceiling / 2, 33.5, 0.2, ceiling, 29, 'normal', colors.wall);
  box(10, ceiling + 0.1, 33.5, halfWidth * 2 + 0.4, 0.2, 29, 'soft', colors.inset);

  // The entrance facade frames an open 10 m passage; nothing closes its mouth.
  box(-2.5, 8, 48.1, 15, 16, 0.24, 'soft', colors.wall);
  box(22.5, 8, 48.1, 15, 16, 0.24, 'soft', colors.wall);
  box(10, 12.5, 48.1, 10, 7, 0.24, 'normal', colors.wall);
  box(4.82, 4.5, 48.22, 0.2, 9, 0.12, 'strong', colors.raised);
  box(15.18, 4.5, 48.22, 0.2, 9, 0.12, 'strong', colors.raised);
  box(10, 9.06, 48.22, 10.56, 0.16, 0.12, 'strong', colors.raised);
  box(10, -0.04, 49, 11.6, 0.08, 2.0, 'normal', colors.wall);

  for (const x of [left + 0.025, right - 0.025]) {
    for (const y of [0.18, 0.32]) segment([x, y, 19.05], [x, y, 47.95], y === 0.32 ? 'normal' : 'soft');
  }

  if (kind === 'research') {
    // A precise, compact technical passage: chamfered ribs, overhead service
    // trays and two continuous guide lines lead directly to the glass slider.
    for (const z of [46.8, 38.5, 30.4]) {
      path([[5.15, 0.2, z], [5.15, 7.35, z], [6.55, 8.82, z], [13.45, 8.82, z], [14.85, 7.35, z], [14.85, 0.2, z]], 'strong');
      for (const x of [5.18, 14.82]) box(x, 3.67, z, 0.11, 7.34, 0.12, 'soft', colors.raised);
    }
    for (const x of [6.0, 14.0]) {
      box(x, 8.61, 38.5, 0.9, 0.13, 18, 'soft', colors.raised);
      for (let z = 30; z < 48; z += 1.2) segment([x - 0.4, 8.52, z], [x + 0.4, 8.52, z], 'faint');
    }
    for (const x of [8.15, 11.85]) segment([x, 0.022, 9.1], [x, 0.022, 47.95], 'normal');
    for (let z = 10; z <= 48; z += 3) segment([5.1, 0.014, z], [14.9, 0.014, z], 'faint');
    for (const z of [45, 39, 33]) {
      box(10, 8.88, z, 3.4, 0.1, 0.34, 'strong', colors.raised);
      path([[9.45, 0.025, z], [10, 0.025, z - 0.7], [10.55, 0.025, z]], 'soft');
    }
    for (const [x, z] of [[5.04, 39], [14.96, 34]]) {
      path([[x, 2.2, z - 1.4], [x, 6.45, z - 1.4], [x, 6.45, z + 1.4], [x, 2.2, z + 1.4]], 'normal', true);
      for (let y = 2.7; y < 6.0; y += 0.55) segment([x, y, z - 1.05], [x, y, z + 0.9], 'faint');
      path([[x, 7.25, z - 2], [x, 7.25, z + 2], [x, 6.6, z + 2]], 'soft');
    }
    // Sliding-door overhead rail and a small reader make the door action clear.
    box(10, 8.15, 28.3, 9.2, 0.20, 0.5, 'strong', colors.raised);
    box(14.12, 4.35, 28.23, 0.43, 0.9, 0.14, 'normal', colors.inset);
    segment([13.97, 4.45, 28.31], [14.27, 4.45, 28.31], 'strong');
    for (const y of [10.7, 11.0, 14.8]) segment([-8.7, y, 48.24], [28.7, y, 48.24], 'faint');
    for (const x of [-7.8, -6.8, -5.8, 25.8, 26.8, 27.8]) segment([x, 2.0, 48.25], [x, 7.2, 48.25], 'soft');
  } else if (kind === 'college') {
    // An intimate residential hall: rounded timber-like lattice ribs, a bench,
    // and framed noticeboards replace the laboratory's straight service lines.
    for (const z of [46.4, 39.4, 32.4]) arch(z);
    for (const x of [5.08, 14.92]) {
      for (let z = 29.8; z < 47.6; z += 0.66) box(x, 3.7, z, 0.13, 6.8, 0.095, 'soft', colors.raised);
      for (const y of [1.0, 6.9]) box(x, y, 38.8, 0.18, 0.13, 18.8, 'normal', colors.raised);
    }
    for (const [x, z] of [[5.8, 40.3], [14.2, 34.0]]) {
      box(x, 1.48, z, 1.36, 0.22, 4.8, 'normal', colors.raised);
      for (const legZ of [z - 1.95, z + 1.95]) box(x, 0.7, legZ, 0.92, 1.4, 0.16, 'soft', colors.inset);
      for (const dx of [-0.38, 0, 0.38]) segment([x + dx, 1.6, z - 2.25], [x + dx, 1.6, z + 2.25], 'faint');
    }
    for (const [x, z] of [[5.18, 34.4], [14.82, 41.8]]) {
      path([[x, 2.5, z - 1.7], [x, 6.5, z - 1.7], [x, 6.5, z + 1.7], [x, 2.5, z + 1.7]], 'strong', true);
      for (const dz of [-0.9, 0.8]) path([[x, 3.0, z + dz - 0.5], [x, 5.8, z + dz - 0.5], [x, 5.8, z + dz + 0.5], [x, 3.0, z + dz + 0.5]], 'soft', true);
    }
    for (let z = 10; z < 48; z += 1.7) {
      for (let x = 5.5; x < 14.4; x += 2.5) path([[x, 0.016, z], [x + 1.15, 0.016, z - 0.62], [x + 2.3, 0.016, z]], 'faint');
    }
    // Rounded arch line on the outer facade; the required rectangular mouth
    // itself stays completely open (all decoration is above it or beside it).
    const facadeArc = [];
    for (let i = 0; i <= 32; i++) { const a = i * Math.PI / 32; facadeArc.push([10 + 6.1 * Math.cos(a), 9.15 + 4.8 * Math.sin(a), 48.25]); }
    path(facadeArc, 'strong');
    for (const start of [-8.5, 18]) for (let x = start; x < start + 10.8; x += 0.72) {
      if (x < 4.8 || x > 15.2) box(x, 5.1, 48.3, 0.10, 8.6, 0.12, 'soft', colors.raised);
    }
  }

  // z=28 partition: only its side piers and lintel are opaque. The clear door
  // aperture is x=6.5..13.5, y=0..8, and remains unobstructed after opening.
  const pierWidth = 6.5 - left;
  box(left + pierWidth / 2, ceiling / 2, 28, pierWidth, ceiling, 0.3, 'normal', colors.wall);
  box(right - pierWidth / 2, ceiling / 2, 28, pierWidth, ceiling, 0.3, 'normal', colors.wall);
  box(10, (ceiling + 8) / 2, 28, 7, ceiling - 8, 0.3, 'normal', colors.wall);
  box(6.42, 4, 28.07, 0.12, 8, 0.26, 'strong', colors.raised);
  box(13.58, 4, 28.07, 0.12, 8, 0.26, 'strong', colors.raised);
  box(10, 8.065, 28.07, 7.28, 0.13, 0.26, 'strong', colors.raised);
  box(10, 0.023, 28, 7.0, 0.035, 0.72, 'soft', colors.raised);
  const labelY = kind === 'research' ? 8.60 : 8.52;
  box(10, labelY, 28.18, 5.8, 0.67, 0.04, 'soft', colors.inset);
  architecture.finish();

  let moveDoors;
  if (kind === 'research') {
    const leaves = [];
    for (let side = 0; side < 2; side++) {
      const leaf = new THREE.Group(); leaf.name = side === 0 ? 'sliding-door-left' : 'sliding-door-right';
      leaf.position.set(side === 0 ? 6.5 : 10, 0, 28); group.add(leaf); leaves.push(leaf);
      const door = builder(leaf);
      for (const x of [0.055, 3.445]) door.box(x, 4, 0, 0.11, 8, 0.14, 'strong', colors.raised);
      for (const y of [0.07, 7.93]) door.box(1.75, y, 0, 3.5, 0.14, 0.14, 'strong', colors.raised);
      door.box(1.75, 2.65, 0, 3.4, 0.08, 0.12, 'normal', colors.raised);
      for (const y of [4.35, 4.62]) door.segment([0.18, y, 0.08], [3.32, y, 0.08], 'soft');
      door.box(side === 0 ? 3.14 : 0.36, 3.9, 0.13, 0.08, 1.35, 0.14, 'strong', colors.raised);
      door.finish(); glass(leaf, 1.75, 4, 0.006, 3.28, 7.72, 0.085);
    }
    moveDoors = p => { leaves[0].position.x = 6.5 - 3.72 * p; leaves[1].position.x = 10 + 3.72 * p; };
  } else if (kind === 'college') {
    const hinge = new THREE.Group(); hinge.name = 'college-inward-hinged-door';
    hinge.position.set(6.5, 0, 28); group.add(hinge);
    const door = builder(hinge);
    door.box(3.5, 4, 0, 7, 8, 0.16, 'strong', colors.raised);
    door.box(3.5, 1.25, 0.09, 6.52, 2.1, 0.035, 'soft', colors.inset);
    door.path([[0.19, 2.6, 0.10], [6.81, 2.6, 0.10], [6.81, 7.8, 0.10], [0.19, 7.8, 0.10]], 'normal', true);
    for (let x = 0.48; x < 6.7; x += 0.44) door.box(x, 5.18, 0.105, 0.055, 4.94, 0.055, 'normal', colors.raised);
    door.box(6.18, 4.0, 0.24, 0.1, 1.3, 0.13, 'strong', colors.raised);
    for (const y of [1.2, 4.0, 6.8]) door.box(0.025, y, 0, 0.11, 0.38, 0.26, 'normal', colors.inset);
    door.finish(); moveDoors = p => { hinge.rotation.y = OPEN_ANGLE * p; };
  }

  const labels = {
    research: '马昱欣实验室',
    college: '书院公共空间',
  };
  const label = labels[kind] || labels.research;
  group.userData.label = label;
  let canvas = null;
  if (typeof document !== 'undefined') canvas = document.createElement('canvas');
  else if (typeof OffscreenCanvas !== 'undefined') canvas = new OffscreenCanvas(1024, 128);
  if (canvas) {
    canvas.width = 1024;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, 1024, 128);
      context.fillStyle = '#f4f8ff';
      context.font = '700 74px "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(label, 512, 66, 930);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.PlaneGeometry(5.36, 0.67);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const sign = new THREE.Mesh(geometry, material);
      sign.name = 'room-name-sign';
      sign.position.set(10, labelY, 28.208);
      group.add(sign);
      textureSet.add(texture);
      geometrySet.add(geometry);
      materialSet.add(material);
    }
  }

  const api = {
    group,
    /** Compatible opening indicator: 0..100 degrees; equivalent openness for sliders. */
    get doorAngle() { return OPEN_ANGLE * opening; },
    /** Accepts a normalized opening amount; the caller owns all timing. */
    setProgress(t = 0) {
      if (disposed) return;
      const p = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
      opening = p * p * (3 - 2 * p);
      moveDoors(opening);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const geometry of geometrySet) geometry.dispose();
      for (const material of materialSet) material.dispose();
      for (const texture of textureSet) texture.dispose();
      group.removeFromParent();
      group.clear();
      geometrySet.clear();
      materialSet.clear();
      textureSet.clear();
    },
  };
  api.setProgress(0);
  return api;
}
