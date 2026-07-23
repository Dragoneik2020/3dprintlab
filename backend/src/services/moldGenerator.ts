import * as THREE from 'three';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class MoldGeneratorService {
  private loadSTL(filePath: string): THREE.BufferGeometry {
    const data = fs.readFileSync(filePath);
    const text = data.toString('utf-8');
    const vertices: number[] = [];
    const vertexRegex = /vertex\s+([\d.\-eE]+)\s+([\d.\-eE]+)\s+([\d.\-eE]+)/g;
    let match: RegExpExecArray | null;
    while ((match = vertexRegex.exec(text)) !== null) {
      vertices.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  private saveSTL(geo: THREE.BufferGeometry): string {
    const pos = geo.getAttribute('position');
    if (!pos) throw new Error('No position data');
    const verts = pos.array;
    const outDir = path.resolve(__dirname, '../../output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const filePath = path.join(outDir, `${uuidv4()}.stl`);

    let body = 'solid mold\n';
    for (let i = 0; i < verts.length; i += 9) {
      const ax = verts[i], ay = verts[i + 1], az = verts[i + 2];
      const bx = verts[i + 3], by = verts[i + 4], bz = verts[i + 5];
      const cx = verts[i + 6], cy = verts[i + 7], cz = verts[i + 8];
      const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
      const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
      const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - az);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      body += `facet normal ${(nx / len).toFixed(6)} ${(ny / len).toFixed(6)} ${(nz / len).toFixed(6)}\n`;
      body += `  outer loop\n`;
      body += `    vertex ${ax.toFixed(6)} ${ay.toFixed(6)} ${az.toFixed(6)}\n`;
      body += `    vertex ${bx.toFixed(6)} ${by.toFixed(6)} ${bz.toFixed(6)}\n`;
      body += `    vertex ${cx.toFixed(6)} ${cy.toFixed(6)} ${cz.toFixed(6)}\n`;
      body += `  endloop\n`;
      body += `endfacet\n`;
    }
    body += 'endsolid mold\n';
    fs.writeFileSync(filePath, body);
    return filePath;
  }

  private sliceAtHeight(geo: THREE.BufferGeometry, heightRatio: number): [THREE.BufferGeometry, THREE.BufferGeometry] {
    const pos = geo.getAttribute('position')!;
    const verts = pos.array;
    const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geo));
    const minY = bbox.min.y;
    const maxY = bbox.max.y;
    const cutY = minY + (maxY - minY) * heightRatio;

    const above: number[] = [];
    const below: number[] = [];

    for (let i = 0; i < verts.length; i += 9) {
      const ay = verts[i + 1], by = verts[i + 4], cy = verts[i + 7];
      if (ay >= cutY || by >= cutY || cy >= cutY) {
        above.push(verts[i], verts[i + 1], verts[i + 2]);
        above.push(verts[i + 3], verts[i + 4], verts[i + 5]);
        above.push(verts[i + 6], verts[i + 7], verts[i + 8]);
      }
      if (ay <= cutY || by <= cutY || cy <= cutY) {
        below.push(verts[i], verts[i + 1], verts[i + 2]);
        below.push(verts[i + 3], verts[i + 4], verts[i + 5]);
        below.push(verts[i + 6], verts[i + 7], verts[i + 8]);
      }
    }

    const top = new THREE.BufferGeometry();
    top.setAttribute('position', new THREE.Float32BufferAttribute(above, 3));
    top.computeVertexNormals();

    const bottom = new THREE.BufferGeometry();
    bottom.setAttribute('position', new THREE.Float32BufferAttribute(below, 3));
    bottom.computeVertexNormals();

    return [top, bottom];
  }

  private offsetGeometry(geo: THREE.BufferGeometry, distance: number): THREE.BufferGeometry {
    geo.computeVertexNormals();
    const pos = geo.getAttribute('position')!;
    const norm = geo.getAttribute('normal')!;
    const verts = pos.array;
    const n = norm.array;
    const offset = new Float32Array(verts.length);

    for (let i = 0; i < verts.length; i += 3) {
      offset[i] = verts[i] + n[i] * distance;
      offset[i + 1] = verts[i + 1] + n[i + 1] * distance;
      offset[i + 2] = verts[i + 2] + n[i + 2] * distance;
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(offset, 3));
    result.computeVertexNormals();
    return result;
  }

  private addBase(geo: THREE.BufferGeometry, baseHeight: number): THREE.BufferGeometry {
    const pos = geo.getAttribute('position')!;
    const verts = pos.array;
    const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geo));
    const minY = bbox.min.y;
    const newVerts = new Float32Array(verts.length + 12);
    newVerts.set(verts);
    const baseY = minY - baseHeight;
    const minX = bbox.min.x, maxX = bbox.max.x;
    const minZ = bbox.min.z, maxZ = bbox.max.z;
    const offset = verts.length;
    newVerts[offset] = minX; newVerts[offset + 1] = baseY; newVerts[offset + 2] = minZ;
    newVerts[offset + 3] = maxX; newVerts[offset + 4] = baseY; newVerts[offset + 5] = minZ;
    newVerts[offset + 6] = maxX; newVerts[offset + 7] = baseY; newVerts[offset + 8] = maxZ;
    newVerts[offset + 9] = minX; newVerts[offset + 10] = baseY; newVerts[offset + 11] = maxZ;

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(newVerts, 3));
    result.computeVertexNormals();
    return result;
  }

  async generateTwoPartMold(filePath: string, config: any) {
    const mesh = this.loadSTL(filePath);
    const cutHeight = config.cutHeight ?? 0.5;
    const wallThickness = config.wallThickness ?? 3;
    const baseHeight = config.baseHeight ?? 5;

    const [top, bottom] = this.sliceAtHeight(mesh, cutHeight);
    const moldTop = this.offsetGeometry(top, wallThickness);
    const moldBottom = this.offsetGeometry(bottom, wallThickness);
    const base = this.addBase(moldBottom, baseHeight);

    return {
      topPart: this.saveSTL(moldTop),
      bottomPart: this.saveSTL(moldBottom),
      base: this.saveSTL(base),
    };
  }

  async generateAdaptiveMold(filePath: string, config: any) {
    const mesh = this.loadSTL(filePath);
    const wallThickness = config.wallThickness ?? 3;
    const outer = this.offsetGeometry(mesh, wallThickness);
    return { moldGeometry: this.saveSTL(outer) };
  }

  async generateBaseMold(filePath: string, config: any) {
    const mesh = this.loadSTL(filePath);
    const wallThickness = config.wallThickness ?? 3;
    const baseHeight = config.baseHeight ?? 5;
    const outer = this.offsetGeometry(mesh, wallThickness);
    const base = this.addBase(outer, baseHeight);
    return { moldGeometry: this.saveSTL(outer), base: this.saveSTL(base) };
  }

  async generatePlanterMold(filePath: string, config: any) {
    const mesh = this.loadSTL(filePath);
    const wallThickness = config.wallThickness ?? 3;
    const baseHeight = config.baseHeight ?? 5;
    const outer = this.offsetGeometry(mesh, wallThickness);
    const result = this.addBase(outer, baseHeight);
    return { planterMold: this.saveSTL(result) };
  }
}