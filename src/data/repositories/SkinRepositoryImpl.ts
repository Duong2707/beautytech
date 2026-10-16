import { ISkinRepository, AnalyzeResult } from '../../domain/repositories/ISkinRepository';
import { SkinProfile } from '../../domain/entities/SkinProfile';
import { skinService } from '../datasources/remote/skinService';
import api from '../datasources/remote/api';

export class SkinRepositoryImpl implements ISkinRepository {
  async analyze(imageUri: string): Promise<AnalyzeResult> {
    const response = await skinService.analyze(imageUri);

    return {
      skinCondition: response.data.skinCondition,
      confidence: response.data.confidence,
      probabilities: response.data.probabilities,
      profileId: response.data.profileId,
    };
  }

  async getHistory(): Promise<SkinProfile[]> {
    try {
      const response = await api.get('/api/skin/history');
      return (response.data.data || []) as SkinProfile[];
    } catch {
      return [];
    }
  }
}