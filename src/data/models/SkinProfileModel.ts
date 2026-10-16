import { SkinProfile, SkinCondition } from '../../domain/entities/SkinProfile';

export type SkinProfileApiResponse = {
  _id: string;
  userId: string;
  skinCondition: string;
  confidence: number;
  analysisResult: Record<string, number>;
  createdAt: string;
};

export function toSkinProfileDomain(data: SkinProfileApiResponse): SkinProfile {
  return {
    id: data._id,
    userId: data.userId,
    skinCondition: (data.skinCondition as SkinCondition) || 'Uncertain',
    confidence: data.confidence,
    probabilities: data.analysisResult || {},
    createdAt: data.createdAt,
  };
}