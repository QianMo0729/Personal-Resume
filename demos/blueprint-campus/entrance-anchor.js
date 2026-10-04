/**
 * Pick an exterior facade anchor for a camera transition, not a surveyed door.
 *
 * `towardCamera` is the horizontal direction FROM the building TO the camera
 * (for an orbit camera: { x: Math.sin(yaw), z: Math.cos(yaw) }).
 * Coordinates and edgeLength are metres, as in assets/campus-data.json.
 *
 * Returns { x, z, nx, nz, edgeLength }, with x/z ON an outer-ring edge midpoint
 * and nx/nz a unit exterior normal. Returns null for invalid geometry or when
 * no safe visible midpoint can be established. Never substitutes a courtyard
 * center or claims the point is a real entrance.
 *
 * Compute once when the destination is selected; keep it fixed during a flight.
 */
export function findEntrance(building, towardCamera = { x: 0, z: 1 }) {
  const outline = cleanRing(building?.outline);
  if (outline.length < 3) return null;
  const holes = (building?.holes || []).map(cleanRing).filter(ring => ring.length >= 3);
  const signedArea = outline.reduce((sum, a, index) => {
    const b = outline[(index + 1) % outline.length];
    return sum + a[0] * b[1] - b[0] * a[1];
  }, 0) / 2;
  if (!Number.isFinite(signedArea) || Math.abs(signedArea) < 0.01) return null;

  const suppliedLength = Math.hypot(towardCamera?.x, towardCamera?.z);
  const direction = suppliedLength > 1e-8 && Number.isFinite(suppliedLength)
    ? { x: towardCamera.x / suppliedLength, z: towardCamera.z / suppliedLength }
    : { x: 0, z: 1 };
  const projections = outline.map(([x, z]) => x * direction.x + z * direction.z);
  const minProjection = Math.min(...projections);
  const span = Math.max(1, Math.max(...projections) - minProjection);
  const candidates = [];

  for (let index = 0; index < outline.length; index++) {
    const a = outline[index];
    const b = outline[(index + 1) % outline.length];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const edgeLength = Math.hypot(dx, dz);
    // Tiny segmentation edges are poor camera destinations and unstable normals.
    if (edgeLength < 1) continue;
    const winding = signedArea > 0 ? 1 : -1;
    const nx = winding * dz / edgeLength;
    const nz = -winding * dx / edgeLength;
    const x = (a[0] + b[0]) / 2;
    const z = (a[1] + b[1]) / 2;
    const outside = offset(x, z, nx, nz, 0.2);
    const nearOutside = offset(x, z, nx, nz, 0.01);
    const nearInside = offset(x, z, nx, nz, -0.01);

    // The 20 cm probe is explicitly exterior. A 1 cm pair validates which side
    // of this particular edge is inside, independently of concavity elsewhere.
    if (pointInRing(outside, outline) || pointInRing(nearOutside, outline) ||
        !pointInRing(nearInside, outline) ||
        holes.some(hole => pointInRing(outside, hole) || pointInRing(nearInside, hole))) {
      continue;
    }
    const facing = nx * direction.x + nz * direction.z;
    if (facing <= 0.015) continue;

    // A camera-facing edge in a concave building may still be hidden behind
    // another wing. Reject it when the camera-facing ray meets the building.
    if (rayHitsRing(outside, direction, outline) ||
        holes.some(hole => rayHitsRing(outside, direction, hole))) {
      continue;
    }
    const front = (x * direction.x + z * direction.z - minProjection) / span;
    const lengthScore = Math.min(1, edgeLength / 90);
    const score = facing * 0.68 + front * 0.22 + lengthScore * 0.10;
    candidates.push({ x, z, nx, nz, edgeLength, score, index });
  }

  // Prefer substantial facades. If all valid edges are under 4 m, a safe small
  // edge is usable; all normal and occlusion checks still apply to that fallback.
  const substantial = candidates.filter(candidate => candidate.edgeLength >= 4);
  const pool = substantial.length ? substantial : candidates;
  pool.sort((a, b) => b.score - a.score || b.edgeLength - a.edgeLength || a.index - b.index);
  if (!pool.length) return null;
  const { x, z, nx, nz, edgeLength } = pool[0];
  return { x, z, nx, nz, edgeLength };
}

function cleanRing(raw) {
  if (!Array.isArray(raw)) return [];
  const result = [];
  for (const point of raw) {
    if (!Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return [];
    const last = result[result.length - 1];
    if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) > 1e-7) {
      result.push([point[0], point[1]]);
    }
  }
  if (result.length > 1 && Math.hypot(result[0][0] - result.at(-1)[0], result[0][1] - result.at(-1)[1]) < 1e-7) {
    result.pop();
  }
  return result;
}

function offset(x, z, nx, nz, distance) {
  return [x + nx * distance, z + nz * distance];
}

function pointInRing([x, z], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if ((a[1] > z) !== (b[1] > z) &&
        x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

function rayHitsRing(origin, direction, ring) {
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const sx = b[0] - a[0];
    const sz = b[1] - a[1];
    const determinant = direction.x * sz - direction.z * sx;
    if (Math.abs(determinant) < 1e-10) continue;
    const qx = a[0] - origin[0];
    const qz = a[1] - origin[1];
    const t = (qx * sz - qz * sx) / determinant;
    const u = (qx * direction.z - qz * direction.x) / determinant;
    if (t > 1e-5 && u >= -1e-8 && u <= 1 + 1e-8) return true;
  }
  return false;
}
