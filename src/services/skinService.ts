import api from './api';

export type SkinAnalysisResult = {
  success: boolean;
  message: string;
  data: {
    skinCondition: 'Acne' | 'Normal';
    confidence: number;
    probabilities: Record<string, number>;
    profileId: string;
  };
};

export const skinService = {
  analyze: async (imageUri: string): Promise<SkinAnalysisResult> => {
    const formData = new FormData();

    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await api.post<SkinAnalysisResult>(
      '/api/skin/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );

    return response.data;
  },
};