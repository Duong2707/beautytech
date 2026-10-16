import { ISkinRepository, AnalyzeResult } from '../../repositories/ISkinRepository';

export class AnalyzeSkinUseCase {
  constructor(private skinRepo: ISkinRepository) {}

  async execute(imageUri: string): Promise<AnalyzeResult> {
    if (!imageUri) {
      throw new Error('Vui lòng chọn ảnh');
    }

    return this.skinRepo.analyze(imageUri);
  }
}