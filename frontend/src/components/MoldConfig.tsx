import { useStore } from '../store/useStore';
import type { MoldType } from '../types';

const moldTypes: { value: MoldType; label: string; desc: string }[] = [
  { value: 'two-part', label: 'Dos Partes', desc: 'Base + tapa con pestañas de alineación' },
  { value: 'adaptive', label: 'Adaptativo', desc: 'Paredes flexibles que se ajustan a la forma' },
  { value: 'base', label: 'Con Base', desc: 'Molde con plataforma plana y soporte' },
  { value: 'planter', label: 'Macetero', desc: 'Hueco interior con drenaje integrado' },
];

export default function MoldConfig() {
  const { config, setConfig, setMoldType } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8, display: 'block' }}>Tipo de Molde</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {moldTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setMoldType(t.value)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${config.moldType === t.value ? '#f97316' : '#2a2a35'}`,
                background: config.moldType === t.value ? 'rgba(249,115,22,0.08)' : 'transparent',
                color: config.moldType === t.value ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Slider label="Grosor de pared" value={config.wallThickness} min={1} max={8} step={0.5} unit="mm" onChange={(v) => setConfig({ wallThickness: v })} />
      <Slider label="Altura de base" value={config.baseHeight} min={1} max={20} step={1} unit="mm" onChange={(v) => setConfig({ baseHeight: v })} />

      {config.moldType === 'two-part' && (
        <>
          <Slider label="Altura de corte" value={config.cutHeight} min={0.1} max={0.9} step={0.05} unit="%" onChange={(v) => setConfig({ cutHeight: v })} />
          <Slider label="Diámetro pestañas" value={config.tabDiameter} min={3} max={20} step={1} unit="mm" onChange={(v) => setConfig({ tabDiameter: v })} />
          <Slider label="Cantidad pestañas" value={config.tabCount} min={2} max={12} step={1} unit="" onChange={(v) => setConfig({ tabCount: v })} />
        </>
      )}

      {config.moldType === 'planter' && (
        <>
          <Slider label="Diámetro drenaje" value={config.drainDiameter} min={2} max={15} step={1} unit="mm" onChange={(v) => setConfig({ drainDiameter: v })} />
          <Slider label="Altura de labio" value={config.lipHeight} min={2} max={30} step={1} unit="mm" onChange={(v) => setConfig({ lipHeight: v })} />
        </>
      )}

      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8, display: 'block' }}>Resolución</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['low', 'medium', 'high'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setConfig({ resolution: r })}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${config.resolution === r ? '#f97316' : '#2a2a35'}`,
                background: config.resolution === r ? 'rgba(249,115,22,0.08)' : 'transparent',
                color: config.resolution === r ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: config.resolution === r ? 600 : 400,
                textTransform: 'capitalize',
              }}
            >
              {r === 'low' ? 'Baja' : r === 'medium' ? 'Media' : 'Alta'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: '#888' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#f97316' }}
      />
    </div>
  );
}