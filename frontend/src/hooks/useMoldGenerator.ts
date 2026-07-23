import { useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { useStore } from '../store/useStore';

export function useMoldGenerator() {
  const { uploadedFile, config, setResult, setProcessing, setError } = useStore();

  const loadSTL = useCallback((data: ArrayBuffer): THREE.BufferGeometry => {
    const loader = new STLLoader();
    const geo = loader.parse(data);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const geometryToBuffer = useCallback((geo: THREE.BufferGeometry): ArrayBuffer => {
    const positions = geo.getAttribute('position');
    if (!positions) throw new Error('No position data');
    const indices = geo.getIndex();
    const verts = positions.array;
    const tris = indices ? Array.from(indices.array) : [];

    let body = 'solid mold\n';
    for (let i = 0; i < tris.length; i += 3) {
      const a = tris[i] * 3, b = tris[i + 1] * 3, c = tris[i + 2] * 3;
      const ax = verts[a], ay = verts[a + 1], az = verts[a + 2];
      const bx = verts[b], by = verts[b + 1], bz = verts[b + 2];
      const cx = verts[c], cy = verts[c + 1], cz = verts[c + 2];
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
    return new TextEncoder().encode(body).buffer as ArrayBuffer;
  }, []);

  const sliceMeshAtHeight = useCallback((geo: THREE.BufferGeometry, heightRatio: number): [THREE.BufferGeometry, THREE.BufferGeometry] => {
    const pos = geo.getAttribute('position');
    const verts = pos.array;
    const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geo));
    const minY = bbox.min.y;
    const maxY = bbox.max.y;
    const cutY = minY + (maxY - minY) * heightRatio;

    const aboveVerts: number[] = [];
    const belowVerts: number[] = [];
    const indices = geo.getIndex();
    const tris = indices ? Array.from(indices.array) : [];

    for (let i = 0; i < tris.length; i += 3) {
      const a = tris[i] * 3, b = tris[i + 1] * 3, c = tris[i + 2] * 3;
      const ay = verts[a + 1], by = verts[b + 1], cy = verts[c + 1];
      if (ay >= cutY || by >= cutY || cy >= cutY) {
        aboveVerts.push(verts[a], verts[a + 1], verts[a + 2]);
        aboveVerts.push(verts[b], verts[b + 1], verts[b + 2]);
        aboveVerts.push(verts[c], verts[c + 1], verts[c + 2]);
      }
      if (ay <= cutY || by <= cutY || cy <= cutY) {
        belowVerts.push(verts[a], verts[a + 1], verts[a + 2]);
        belowVerts.push(verts[b], verts[b + 1], verts[b + 2]);
        belowVerts.push(verts[c], verts[c + 1], verts[c + 2]);
      }
    }

    const above = new THREE.BufferGeometry();
    above.setAttribute('position', new THREE.Float32BufferAttribute(aboveVerts, 3));
    above.computeVertexNormals();

    const below = new THREE.BufferGeometry();
    below.setAttribute('position', new THREE.Float32BufferAttribute(belowVerts, 3));
    below.computeVertexNormals();

    return [above, below];
  }, []);

  const offsetGeometry = useCallback((geo: THREE.BufferGeometry, distance: number): THREE.BufferGeometry => {
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    if (!norm) {
      geo.computeVertexNormals();
    }
    const normals = geo.getAttribute('normal')!;
    const verts = pos.array;
    const n = normals.array;
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
  }, []);

  const addFlatBase = useCallback((geo: THREE.BufferGeometry, baseHeight: number): THREE.BufferGeometry => {
    const pos = geo.getAttribute('position');
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
  }, []);

  const generateTwoPartMold = useCallback(async () => {
    if (!uploadedFile) return;
    setProcessing(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const mesh = loadSTL(uploadedFile.data);
      const [top, bottom] = sliceMeshAtHeight(mesh, config.cutHeight);
      const moldTop = offsetGeometry(top, config.wallThickness);
      const moldBottom = offsetGeometry(bottom, config.wallThickness);
      const base = addFlatBase(moldBottom, config.baseHeight);

      setResult({
        topPart: geometryToBuffer(moldTop),
        bottomPart: geometryToBuffer(moldBottom),
        base: geometryToBuffer(base),
      });
    } catch (err: any) {
      setError(err.message || 'Error generando molde');
    }
  }, [uploadedFile, config, loadSTL, sliceMeshAtHeight, offsetGeometry, addFlatBase, geometryToBuffer, setResult, setProcessing, setError]);

  const generateAdaptiveMold = useCallback(async () => {
    if (!uploadedFile) return;
    setProcessing(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const mesh = loadSTL(uploadedFile.data);
      const outer = offsetGeometry(mesh, config.wallThickness);
      setResult({ moldGeometry: geometryToBuffer(outer) });
    } catch (err: any) {
      setError(err.message || 'Error generando molde adaptativo');
    }
  }, [uploadedFile, config, loadSTL, offsetGeometry, geometryToBuffer, setResult, setProcessing, setError]);

  const generateBaseMold = useCallback(async () => {
    if (!uploadedFile) return;
    setProcessing(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const mesh = loadSTL(uploadedFile.data);
      const outer = offsetGeometry(mesh, config.wallThickness);
      const base = addFlatBase(outer, config.baseHeight);
      setResult({ moldGeometry: geometryToBuffer(outer), base: geometryToBuffer(base) });
    } catch (err: any) {
      setError(err.message || 'Error generando molde con base');
    }
  }, [uploadedFile, config, loadSTL, offsetGeometry, addFlatBase, geometryToBuffer, setResult, setProcessing, setError]);

  const generatePlanterMold = useCallback(async () => {
    if (!uploadedFile) return;
    setProcessing(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const mesh = loadSTL(uploadedFile.data);
      const outer = offsetGeometry(mesh, config.wallThickness);
      const result = addFlatBase(outer, config.baseHeight);
      setResult({ planterMold: geometryToBuffer(result) });
    } catch (err: any) {
      setError(err.message || 'Error generando molde macetero');
    }
  }, [uploadedFile, config, loadSTL, offsetGeometry, addFlatBase, geometryToBuffer, setResult, setProcessing, setError]);

  return { generateTwoPartMold, generateAdaptiveMold, generateBaseMold, generatePlanterMold };
}