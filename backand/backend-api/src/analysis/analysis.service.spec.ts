import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { DecisionEngineService } from './decision-engine/decision-engine.service';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(async () => {
    const mockDecisionEngine = {
      calculate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: DecisionEngineService,
          useValue: mockDecisionEngine,
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
