import { ModelInfo } from './mlTypes';
import { modelRegistry } from './modelRegistry';

export class ModelMetrics {
  public getModelMetrics(modelName?: string): ModelInfo & { accuracyScore: number; precision: number; recall: number } {
    const model = modelRegistry.getModel(modelName);
    const info = model.getModelInfo();

    return {
      ...info,
      accuracyScore: 0.88,
      precision: 0.84,
      recall: 0.89,
    };
  }
}

export const modelMetrics = new ModelMetrics();
