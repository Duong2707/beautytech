export type SkinCondition = 'Acne' | 'Normal' | 'Uncertain';

export type SkinProfile = {
  id: string;
  userId: string;
  skinCondition: SkinCondition;
  confidence: number;
  probabilities: Record<string, number>;
  createdAt: string;
};