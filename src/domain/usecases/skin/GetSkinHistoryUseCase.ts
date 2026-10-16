import { ISkinRepository } from '../../repositories/ISkinRepository';
import { SkinProfile } from '../../entities/SkinProfile';

export class GetSkinHistoryUseCase {
  constructor(private skinRepo: ISkinRepository) {}

  async execute(): Promise<SkinProfile[]> {
    return this.skinRepo.getHistory();
  }
}