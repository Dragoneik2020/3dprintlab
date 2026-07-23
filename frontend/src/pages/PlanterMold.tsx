import ModelUpload from '../components/ModelUpload';
import MoldPreview3D from '../components/MoldPreview3D';
import MoldConfig from '../components/MoldConfig';
import ExportButton from '../components/ExportButton';
import { useMoldGenerator } from '../hooks/useMoldGenerator';
import { useStore } from '../store/useStore';
import { useResponsive } from '../hooks/useResponsive';

export default function PlanterMold() {
  const { uploadedFile, isProcessing, error } = useStore();
  const { generatePlanterMold } = useMoldGenerator();
  const { isMobile } = useResponsive();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? 12 : 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
        <ModelUpload />
        <MoldPreview3D />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
        <div style={{ padding: isMobile ? 16 : 20, borderRadius: 12, background: '#12121a', border: '1px solid #1f1f2a' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Configuración</h2>
          <MoldConfig />
        </div>
        <button
          onClick={generatePlanterMold}
          disabled={!uploadedFile || isProcessing}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: !uploadedFile || isProcessing ? '#1f1f2a' : 'linear-gradient(135deg, #f97316, #ec4899)',
            color: !uploadedFile || isProcessing ? '#555' : '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: !uploadedFile || isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isProcessing ? '⏳ Procesando...' : '⚡ Generar Molde Macetero'}
        </button>
        {error && (
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13 }}>
            {error}
          </div>
        )}
        <ExportButton />
      </div>
    </div>
  );
}