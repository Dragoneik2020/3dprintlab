export function parseSTL(buffer: ArrayBuffer): { vertices: number[]; normals: number[] } {
  const dv = new DataView(buffer);
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
  } else {
    const text = new TextDecoder().decode(buffer);
    const facetRegex = /facet normal ([\d.\-e]+) ([\d.\-e]+) ([\d.\-e]+)[\s\S]*?endfacet/g;
    const vertexRegex = /vertex ([\d.\-e]+) ([\d.\-e]+) ([\d.\-e]+)/g;
    let match: RegExpExecArray | null;
    while ((match = facetRegex.exec(text)) !== null) {
      normals.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
      const facetText = match[0];
      let vMatch: RegExpExecArray | null;
      const vRegex = /vertex ([\d.\-e]+) ([\d.\-e]+) ([\d.\-e]+)/g;
      while ((vMatch = vRegex.exec(facetText)) !== null) {
        vertices.push(parseFloat(vMatch[1]), parseFloat(vMatch[2]), parseFloat(vMatch[3]));
      }
    }
  }

  return { vertices, normals };
}

export function exportSTLAsBlob(vertices: number[], normals: number[]): Blob {
  let body = 'solid export\n';
  for (let i = 0; i < vertices.length; i += 9) {
    const ni = (i / 9) * 3;
    body += `facet normal ${normals[ni].toFixed(6)} ${normals[ni + 1].toFixed(6)} ${normals[ni + 2].toFixed(6)}\n`;
    body += `  outer loop\n`;
    for (let j = 0; j < 3; j++) {
      const vi = i + j * 3;
      body += `    vertex ${vertices[vi].toFixed(6)} ${vertices[vi + 1].toFixed(6)} ${vertices[vi + 2].toFixed(6)}\n`;
    }
    body += `  endloop\n`;
    body += `endfacet\n`;
  }
  body += 'endsolid export\n';
  return new Blob([body], { type: 'application/sla' });
}