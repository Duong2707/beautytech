import { SkinProfile, SkinCondition } from '../entities/SkinProfile';

export type AnalyzeResult = {
  skinCondition: SkinCondition;
  confidence: number;
  probabilities: Record<string, number>;
  profileId: string;
};

export interface ISkinRepository {
  analyze(imageUri: string): Promise<AnalyzeResult>;
  getHistory(): Promise<SkinProfile[]>;
}