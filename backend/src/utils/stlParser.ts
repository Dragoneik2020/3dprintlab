import fs from 'fs';

export interface STLData {
  vertices: number[];
  normals: number[];
  triangleCount: number;
}

export function parseSTL(filePath: string): STLData {
  const buffer = fs.readFileSync(filePath);
  const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const isBinary = dv.getUint32(80, true) > 0;
  const vertices: number[] = [];
  const normals: number[] = [];

  if (isBinary) {
    const triCount = dv.getUint32(80, true);
    let offset = 84;
    for (let i = 0; i < triCount; i++) {
      normals.push(dv.getFloat32(offset, true), dv.getFloat32(offset + 4, true), dv.getFloat32(offset + 8, true));
      offset += 12;
      for (let j = 0; j < 3; j++) {
        vertices.push(dv.getFloat32(offset, true), dv.getFloat32(offset + 4, true), dv.getFloat32(offset + 8, true));
        offset += 12;
      }
      offset += 2;
    }
    return { vertices, normals, triangleCount: triCount };
  }

  const text = buffer.toString('utf-8');
  const facetRegex = /facet normal ([\d.\-eE]+) ([\d.\-eE]+) ([\d.\-eE]+)[\s\S]*?endfacet/g;
  const vertexRegex = /vertex ([\d.\-eE]+) ([\d.\-eE]+) ([\d.\-eE]+)/g;
  let match: RegExpExecArray | null;

  while ((match = facetRegex.exec(text)) !== null) {
    normals.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
    const facetText = match[0];
    let vMatch: RegExpExecArray | null;
    const vRegex = /vertex ([\d.\-eE]+) ([\d.\-eE]+) ([\d.\-eE]+)/g;
    while ((vMatch = vRegex.exec(facetText)) !== null) {
      vertices.push(parseFloat(vMatch[1]), parseFloat(vMatch[2]), parseFloat(vMatch[3]));
    }
  }

  return { vertices, normals, triangleCount: vertices.length / 9 };
}