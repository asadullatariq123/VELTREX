import { PredictionModel } from './mlTypes';
import { demoPredictionModel } from './demoPredictionModel';

export class ModelRegistry {
  private models: Map<string, PredictionModel> = new Map();
  private defaultModelName = 'VELTREX-DEMO-V1';

  constructor() {
    this.registerModel('VELTREX-DEMO-V1', demoPredictionModel);
  }

  public registerModel(name: string, model: PredictionModel): void {
    this.models.set(name, model);
  }

  public getModel(name?: string): PredictionModel {
    if (name && this.models.has(name)) {
      return this.models.get(name)!;
    }
    return this.models.get(this.defaultModelName) || demoPredictionModel;
  }

  public listModels(): string[] {
    return Array.from(this.models.keys());
  }

  public setDefaultModel(name: string): void {
    if (this.models.has(name)) {
      this.defaultModelName = name;
    }
  }
}

export const modelRegistry = new ModelRegistry();
