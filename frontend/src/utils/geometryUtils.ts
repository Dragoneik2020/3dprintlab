export function computeBoundingBox(vertices: number[]): { min: number[]; max: number[]; center: number[] } {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < vertices.length; i += 3) {
    minX = Math.min(minX, vertices[i]);
    minY = Math.min(minY, vertices[i + 1]);
    minZ = Math.min(minZ, vertices[i + 2]);
    maxX = Math.max(maxX, vertices[i]);
    maxY = Math.max(maxY, vertices[i + 1]);
    maxZ = Math.max(maxZ, vertices[i + 2]);
  }

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
  };
}

export function translateVertices(vertices: number[], tx: number, ty: number, tz: number): number[] {
  const result = new Float32Array(vertices.length);
  for (let i = 0; i < vertices.length; i += 3) {
    result[i] = vertices[i] + tx;
    result[i + 1] = vertices[i + 1] + ty;
    result[i + 2] = vertices[i + 2] + tz;
  }
  return Array.from(result);
}

export function scaleVertices(vertices: number[], sx: number, sy: number, sz: number): number[] {
  const result = new Float32Array(vertices.length);
  for (let i = 0; i < vertices.length; i += 3) {
    result[i] = vertices[i] * sx;
    result[i + 1] = vertices[i + 1] * sy;
    result[i + 2] = vertices[i + 2] * sz;
  }
  return Array.from(result);
}