export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
}

export function computeBoundingBox(vertices: number[]): BoundingBox {
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
    size: [maxX - minX, maxY - minY, maxZ - minZ],
  };
}

export function centerVertices(vertices: number[]): number[] {
  const bb = computeBoundingBox(vertices);
  const result = new Float32Array(vertices.length);
  for (let i = 0; i < vertices.length; i += 3) {
    result[i] = vertices[i] - bb.center[0];
    result[i + 1] = vertices[i + 1] - bb.center[1];
    result[i + 2] = vertices[i + 2] - bb.center[2];
  }
  return Array.from(result);
}