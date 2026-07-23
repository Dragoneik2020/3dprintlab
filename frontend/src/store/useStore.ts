import { create } from 'zustand';
import type { MoldConfig, UploadedFile, MoldResult, MoldType, ModelTransform, TransformMode } from '../types';

const defaultConfig: MoldConfig = {
  moldType: 'two-part',
  wallThickness: 3,
  baseHeight: 5,
  cutHeight: 0.5,
  tabDiameter: 8,
  tabCount: 4,
  drainDiameter: 6,
  lipHeight: 10,
  resolution: 'medium',
};

const defaultTransform: ModelTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

interface AppState {
  uploadedFile: UploadedFile | null;
  config: MoldConfig;
  result: MoldResult | null;
  isProcessing: boolean;
  error: string | null;
  transform: ModelTransform;
  transformMode: TransformMode;
  uniformScale: boolean;
  setUniformScale: (v: boolean) => void;
  setTransform: (t: Partial<ModelTransform>) => void;
  setTransformMode: (m: TransformMode) => void;
  setUploadedFile: (file: UploadedFile | null) => void;
  setConfig: (config: Partial<MoldConfig>) => void;
  setMoldType: (type: MoldType) => void;
  setResult: (result: MoldResult | null) => void;
  setProcessing: (v: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  uploadedFile: null,
  config: defaultConfig,
  result: null,
  isProcessing: false,
  error: null,
  transform: defaultTransform,
  transformMode: 'translate',
  uniformScale: true,

  setUniformScale: (v) => set({ uniformScale: v }),

  setTransform: (partial) => set((s) => {
    const scale = partial.scale ?? s.transform.scale;
    if (partial.scale && s.uniformScale) {
      const v = partial.scale[0];
      return {
        transform: {
          position: partial.position ?? s.transform.position,
          rotation: partial.rotation ?? s.transform.rotation,
          scale: [v, v, v],
        },
      };
    }
    return {
      transform: {
        position: partial.position ?? s.transform.position,
        rotation: partial.rotation ?? s.transform.rotation,
        scale,
      },
    };
  }),
  setTransformMode: (mode) => set({ transformMode: mode }),

  setUploadedFile: (file) => set({ uploadedFile: file, result: null, error: null, transform: defaultTransform }),
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setMoldType: (type) => set((s) => ({ config: { ...s.config, moldType: type } })),
  setResult: (result) => set({ result, isProcessing: false }),
  setProcessing: (v) => set({ isProcessing: v }),
  setError: (err) => set({ error: err, isProcessing: false }),
  reset: () => set({
    uploadedFile: null, result: null, error: null, isProcessing: false,
    config: defaultConfig, transform: defaultTransform,
  }),
}));