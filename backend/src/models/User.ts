export interface UserModel {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'maker';
  credits: number;
  moldsUsed: number;
  moldsLimit: number;
  createdAt: Date;
}

export const defaultLimits: Record<string, number> = {
  free: 3,
  pro: 9999,
  maker: 99999,
};