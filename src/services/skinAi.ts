// src/services/skinAi.ts
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import * as ImageManipulator from 'expo-image-manipulator';
import { Buffer } from 'buffer';

let model: TensorflowModel | null = null;

export const initSkinModel = async () => {
  if (model) return model;
  try {
model = await loadTensorflowModel(require('../../assets/models/skin_model.tflite'), []);
    return model;
  } catch (error) {
    console.error("Lỗi load model AI:", error);
    throw error;
  }
};

export const analyzeSkinOffline = async (imageUri: string) => {
  try {
    const tfModel = await initSkinModel();

    // 1. Resize ảnh đúng chuẩn đầu vào 224x224
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipulatedImage.base64) throw new Error("Không thể đọc ảnh");

    // 2. Đọc Base64 ra mảng Byte
    const buffer = Buffer.from(manipulatedImage.base64, 'base64');
    
    // ResNet50 của PyTorch nhận ảnh dạng NCHW (1, 3, 224, 224)
    // Tuỳ thuộc vào onnx2tf, nó có thể đã tự đổi sang NHWC (1, 224, 224, 3) hoặc giữ NCHW.
    // Đa số khi chuyển sang TFLite, nó sẽ tự chuyển thành (1, 224, 224, 3).
    const imageSize = 224;
    const numPixels = imageSize * imageSize;
    
    const float32Data = new Float32Array(numPixels * 3);

    // Chuẩn hóa ImageNet (Rất quan trọng!)
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    // Lặp qua từng pixel (giả sử dữ liệu base64 đã là RGB)
    for (let i = 0; i < numPixels; i++) {
      const r = buffer[i * 3];
      const g = buffer[i * 3 + 1];
      const b = buffer[i * 3 + 2];

      // Công thức chuẩn hóa: (pixel/255 - mean) / std
      float32Data[i * 3] = ((r / 255.0) - mean[0]) / std[0];       // R
      float32Data[i * 3 + 1] = ((g / 255.0) - mean[1]) / std[1];   // G
      float32Data[i * 3 + 2] = ((b / 255.0) - mean[2]) / std[2];   // B
    }

    // 3. Đưa vào AI
    const output = tfModel.runSync([float32Data.buffer]);
    
    // 4. Đọc kết quả
    const scores = new Float32Array(output[0]);
    const score0 = scores[0]; // Xác suất Da thường (Class 0)
    const score1 = scores[1]; // Xác suất Da mụn (Class 1)

    // Áp dụng hàm Softmax vì PyTorch trả về Logits thô
    const exp0 = Math.exp(score0);
    const exp1 = Math.exp(score1);
    const sum = exp0 + exp1;

    const normalProb = exp0 / sum;
    const acneProb = exp1 / sum;

    const isAcne = acneProb > normalProb;

    return {
      success: true,
      data: {
        skinCondition: isAcne ? 'Acne' : 'Normal',
        confidence: isAcne ? acneProb : normalProb,
      }
    };
  } catch (error) {
    console.error("Lỗi phân tích AI Offline:", error);
    throw error;
  }
};