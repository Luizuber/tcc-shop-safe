import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { DecisionEngineService } from './decision-engine/decision-engine.service';
import { PriceComparisonService } from './price-comparison.service';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, DecisionEngineService, PriceComparisonService],
})
export class AnalysisModule { }
