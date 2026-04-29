import { Injectable } from '@nestjs/common';
import { AnalyzeProductDto } from './dto/analyze-product.dto';
import { DecisionEngineService } from './decision-engine/decision-engine.service';

@Injectable()
export class AnalysisService {
  constructor(private readonly decisionEngine: DecisionEngineService) {}

  analyzeProduct(data: AnalyzeProductDto) {
    return this.decisionEngine.calculate(data);
  }
}
