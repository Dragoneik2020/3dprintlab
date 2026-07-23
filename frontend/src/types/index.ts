export type MoldType = 'two-part' | 'adaptive' | 'base' | 'planter';
export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface ModelTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface MoldConfig {
  moldType: MoldType;
  wallThickness: number;
  baseHeight: number;
  cutHeight: number;
  tabDiameter: number;
  tabCount: number;
  drainDiameter: number;
  lipHeight: number;
  resolution: 'low' | 'medium' | 'high';
}

export interface MoldResult {
  topPart?: ArrayBuffer;
  bottomPart?: ArrayBuffer;
  base?: ArrayBuffer;
  vents?: ArrayBuffer;
  drainHoles?: ArrayBuffer;
  moldGeometry?: ArrayBuffer;
  planterMold?: ArrayBuffer;
}

export interface UploadedFile {
  name: string;
  size: number;
  data: ArrayBuffer;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}