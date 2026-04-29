import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalyzeProductDto } from './dto/analyze-product.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) { }

  @Post()
  analyzeProduct(@Body() data: AnalyzeProductDto) {
    return this.analysisService.analyzeProduct(data);
  }
}
