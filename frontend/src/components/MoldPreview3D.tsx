import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { useStore } from '../store/useStore';
import { useResponsive } from '../hooks/useResponsive';
import TransformToolbar from './TransformToolbar';

export default function MoldPreview3D() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const { uploadedFile, result, transform } = useStore();
  const { isMobile } = useResponsive();
  const data = result?.topPart || result?.bottomPart || result?.moldGeometry || result?.planterMold || uploadedFile?.data;

  const geo = useMemo(() => {
    if (!data) return null;
    try {
      const loader = new STLLoader();
      const g = loader.parse(data);
      g.computeVertexNormals();
      return g;
    } catch {
      return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || !geo) return;

    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12121a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const d1 = new THREE.DirectionalLight(0xffffff, 1.5);
    d1.position.set(5, 10, 5);
    scene.add(d1);

    const d2 = new THREE.DirectionalLight(0xffffff, 0.5);
    d2.position.set(-5, -5, -5);
    scene.add(d2);

    scene.add(new THREE.GridHelper(10, 10));

    const mesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
      color: 0xf97316,
      metalness: 0.1,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    }));
    meshRef.current = mesh;
    scene.add(mesh);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      if (w2 > 0 && h2 > 0) {
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [geo]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.set(transform.position[0], transform.position[1], transform.position[2]);
    meshRef.current.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
    meshRef.current.scale.set(transform.scale[0], transform.scale[1], transform.scale[2]);
  }, [transform]);

  if (!data) {
    return (
      <div style={{ height: isMobile ? 250 : 400, borderRadius: 12, background: '#12121a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1f1f2a', color: '#555' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? 28 : 32, marginBottom: 8 }}>🔮</div>
          <div style={{ fontSize: 14 }}>Sube un modelo para previsualizar</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        ref={containerRef}
        style={{ height: isMobile ? 280 : 450, borderRadius: 12, overflow: 'hidden', border: '1px solid #1f1f2a' }}
      />
      <div style={{ padding: isMobile ? 12 : 16, borderRadius: 12, background: '#12121a', border: '1px solid #1f1f2a' }}>
        <TransformToolbar />
      </div>
    </div>
  );
}