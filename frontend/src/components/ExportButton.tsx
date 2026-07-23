import { useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

function geometryToSTL(geo: THREE.BufferGeometry): ArrayBuffer {
  const positions = geo.getAttribute('position');
  if (!positions) throw new Error('No position attribute');
  const indices = geo.getIndex();
  const verts = positions.array;
  const tris: number[] = indices ? Array.from(indices.array) : [];

  const header = 'solid mold\n';
  let body = '';
  for (let i = 0; i < tris.length; i += 3) {
    const a = tris[i] * 3, b = tris[i + 1] * 3, c = tris[i + 2] * 3;
    const ax = verts[a], ay = verts[a + 1], az = verts[a + 2];
    const bx = verts[b], by = verts[b + 1], bz = verts[b + 2];
    const cx = verts[c], cy = verts[c + 1], cz = verts[c + 2];
    const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
    const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
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
  return new TextEncoder().encode(header + body).buffer as ArrayBuffer;
}

export default function ExportButton() {
  const { result, isProcessing, setProcessing } = useStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      if (result.topPart) zip.file('molde_parte_superior.stl', new Blob([result.topPart]));
      if (result.bottomPart) zip.file('molde_parte_inferior.stl', new Blob([result.bottomPart]));
      if (result.base) zip.file('base.stl', new Blob([result.base]));
      if (result.planterMold) zip.file('macetero.stl', new Blob([result.planterMold]));
      if (result.moldGeometry) zip.file('molde.stl', new Blob([result.moldGeometry]));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rincon-z-moldes.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const hasResult = !!result && (!!result.topPart || !!result.bottomPart || !!result.moldGeometry || !!result.planterMold);

  if (!hasResult) return null;

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        width: '100%',
        padding: '14px 24px',
        borderRadius: 12,
        border: 'none',
        background: 'linear-gradient(135deg, #f97316, #ec4899)',
        color: '#fff',
        fontWeight: 600,
        fontSize: 15,
        cursor: exporting ? 'not-allowed' : 'pointer',
        opacity: exporting ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {exporting ? 'Generando ZIP...' : '⬇ Descargar Moldes (STL)'}
    </button>
  );
}