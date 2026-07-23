export interface MoldJobModel {
  id: string;
  userId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  moldType: 'two-part' | 'adaptive' | 'base' | 'planter';
  inputFile: string;
  outputFiles: string[];
  config: Record<string, any>;
  progress: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MoldJobStore {
  private jobs: Map<string, MoldJobModel> = new Map();

  create(job: Omit<MoldJobModel, 'createdAt' | 'updatedAt'>): MoldJobModel {
    const now = new Date();
    const entry: MoldJobModel = { ...job, createdAt: now, updatedAt: now };
    this.jobs.set(job.id, entry);
    return entry;
  }

  get(id: string): MoldJobModel | undefined {
    return this.jobs.get(id);
  }

  update(id: string, partial: Partial<MoldJobModel>): MoldJobModel | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const updated = { ...job, ...partial, updatedAt: new Date() };
    this.jobs.set(id, updated);
    return updated;
  }
}

export const moldJobStore = new MoldJobStore();