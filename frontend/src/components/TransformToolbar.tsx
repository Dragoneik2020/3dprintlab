import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { TransformMode, ModelTransform } from '../types';
import { useResponsive } from '../hooks/useResponsive';

const modes: { value: TransformMode; label: string; icon: string }[] = [
  { value: 'translate', label: 'Mover', icon: '⇔' },
  { value: 'rotate', label: 'Rotar', icon: '⟳' },
  { value: 'scale', label: 'Escalar', icon: '⤢' },
];

const axisColor: Record<string, string> = { X: '#ff4444', Y: '#44ff44', Z: '#4488ff' };

function AxisSlider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  const [showNum, setShowNum] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: axisColor[label], width: 14, textAlign: 'center' }}>{label}</span>
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            flex: 1,
            height: 4,
            WebkitAppearance: 'none',
            appearance: 'none',
            background: `linear-gradient(to right, ${axisColor[label]} 0%, ${axisColor[label]} ${pct}%, #2a2a35 ${pct}%, #2a2a35 100%)`,
            borderRadius: 2,
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
      <button
        onClick={() => setShowNum(!showNum)}
        style={{
          background: showNum ? '#1f1f2a' : 'transparent',
          border: 'none',
          color: showNum ? '#fff' : '#555',
          cursor: 'pointer',
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4,
          fontFamily: 'monospace',
          minWidth: 40,
          textAlign: 'right',
        }}
        title="Cambiar a número"
      >
        {showNum ? (
          <input
            type="number"
            step={step}
            value={parseFloat(value.toFixed(3))}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => setShowNum(false)}
            autoFocus
            style={{
              width: '100%',
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: '#e4e4e7',
              fontSize: 10,
              fontFamily: 'monospace',
              textAlign: 'right',
              outline: 'none',
            }}
          />
        ) : (
          <span>{parseFloat(value.toFixed(2))}</span>
        )}
      </button>
    </div>
  );
}

export default function TransformToolbar() {
  const { transformMode, setTransformMode, transform, setTransform } = useStore();
  const { isMobile } = useResponsive();

  const updateAxis = (field: keyof ModelTransform, axis: 0 | 1 | 2, value: number) => {
    const arr = [...transform[field]] as [number, number, number];
    arr[axis] = value;
    setTransform({ [field]: arr });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
      <div style={{ display: 'flex', gap: 4, background: '#0a0a0f', borderRadius: 10, padding: 3 }}>
        {modes.map((m) => {
          const isActive = transformMode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => setTransformMode(m.value)}
              style={{
                flex: 1,
                padding: '8px 6px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#1f1f2a' : 'transparent',
                color: isActive ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: isActive ? 16 : 14 }}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 12 }}>
        <FieldGroup label="Posición" field="position" min={-10} max={10} step={0.05} updateAxis={updateAxis} />
        <FieldGroup label="Rotación" field="rotation" min={-180} max={180} step={1} updateAxis={updateAxis} />
        <FieldGroup label="Escala" field="scale" min={0.01} max={5} step={0.05} updateAxis={updateAxis} />
      </div>

      <button
        onClick={() => setTransform({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] })}
        style={{
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid #2a2a35',
          background: 'transparent',
          color: '#666',
          cursor: 'pointer',
          fontSize: 11,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span>↺</span> Resetear todo
      </button>
    </div>
  );
}

function FieldGroup({ label, field, min, max, step, updateAxis }: {
  label: string;
  field: keyof ModelTransform;
  min: number;
  max: number;
  step: number;
  updateAxis: (field: keyof ModelTransform, axis: 0 | 1 | 2, value: number) => void;
}) {
  const transform = useStore((s) => s.transform);

  return (
    <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 8 }}>
      <div style={{ fontSize: 10, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['X', 'Y', 'Z'].map((l, i) => (
          <AxisSlider
            key={l}
            label={l}
            value={transform[field][i]}
            min={field === 'scale' ? 0.01 : min}
            max={field === 'scale' ? 5 : max}
            step={step}
            onChange={(v) => updateAxis(field, i as 0 | 1 | 2, v)}
          />
        ))}
      </div>
    </div>
  );
}