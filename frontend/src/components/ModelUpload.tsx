import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { useStore } from '../store/useStore';

export default function ModelUpload() {
  const { uploadedFile, setUploadedFile, setError, transform, setTransform } = useStore();

  const modelInfo = useMemo(() => {
    if (!uploadedFile) return null;
    try {
      const loader = new STLLoader();
      const geo = loader.parse(uploadedFile.data);
      const pos = geo.getAttribute('position');
      const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geo));
      const size = new THREE.Vector3();
      bbox.getSize(size);
      return {
        vertices: pos ? pos.count : 0,
        triangles: pos ? pos.count / 3 : 0,
        size: [size.x, size.y, size.z],
      };
    } catch {
      return null;
    }
  }, [uploadedFile]);

  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    const file = accepted[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['stl', 'obj', '3mf'].includes(ext || '')) {
      setError('Solo archivos STL, OBJ o 3MF');
      return;
    }
    file.arrayBuffer().then((buf) => {
      setUploadedFile({ name: file.name, size: file.size, data: buf });
    });
  }, [setUploadedFile, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'model/stl': ['.stl'], 'model/obj': ['.obj'] },
    maxFiles: 1,
  });

  if (uploadedFile) {
    return (
      <div style={{ padding: 16, background: '#1a1a24', borderRadius: 12, border: '1px solid #2a2a35' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: modelInfo ? 12 : 0 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{uploadedFile.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{(uploadedFile.size / 1024).toFixed(1)} KB</div>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            style={{ background: 'none', border: '1px solid #3f3f4a', color: '#e4e4e7', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}
          >
            Cambiar
          </button>
        </div>
        {modelInfo && (
          <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>Triángulos: {modelInfo.triangles.toLocaleString()}</span>
            <span>Vértices: {modelInfo.vertices.toLocaleString()}</span>
            <span>Dimensiones: {modelInfo.size.map((v) => `${v.toFixed(1)}`).join(' × ')}</span>
          </div>
        )}
        <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => {
                const cur = transform.scale[0];
                setTransform({ scale: [s, s, s] });
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${Math.abs(transform.scale[0] - s) < 0.01 ? '#f97316' : '#2a2a35'}`,
                background: Math.abs(transform.scale[0] - s) < 0.01 ? 'rgba(249,115,22,0.08)' : 'transparent',
                color: Math.abs(transform.scale[0] - s) < 0.01 ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {s}x
            </button>
          ))}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            <span style={{ fontSize: 11, color: '#666' }}>Escala:</span>
            <input
              type="number"
              step={0.1}
              min={0.01}
              value={parseFloat(transform.scale[0].toFixed(2))}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 1;
                setTransform({ scale: [v, v, v] });
              }}
              style={{
                width: 60,
                padding: '3px 6px',
                borderRadius: 6,
                border: '1px solid #2a2a35',
                background: '#0a0a0f',
                color: '#e4e4e7',
                fontSize: 12,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#f97316' : '#2a2a35'}`,
        borderRadius: 12,
        padding: 40,
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragActive ? 'rgba(249,115,22,0.05)' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      <input {...getInputProps()} />
      <div style={{ fontSize: 40, marginBottom: 8 }}>📐</div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
        {isDragActive ? 'Suelta tu archivo aquí' : 'Sube tu modelo 3D'}
      </div>
      <div style={{ fontSize: 13, color: '#888' }}>STL, OBJ o 3MF · Arrastra o haz clic</div>
    </div>
  );
}