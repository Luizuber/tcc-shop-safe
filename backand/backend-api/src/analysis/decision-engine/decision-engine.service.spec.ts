import { DecisionEngineService } from './decision-engine.service';
import { AnalyzeProductDto } from '../dto/analyze-product.dto';
import { PriceComparisonService } from '../price-comparison.service';

describe('DecisionEngineService', () => {
  let service: DecisionEngineService;
  let priceService: PriceComparisonService;

  beforeEach(() => {
    priceService = {
      searchProduct: jest.fn().mockResolvedValue([]),
    } as any;
    service = new DecisionEngineService(priceService);
  });

  it('should recommend LOW risk level for trusted products', async () => {
    const data: AnalyzeProductDto = {
      productName: 'Apple iPhone 15',
      price: 5000,
      productUrl: 'https://www.amazon.com.br/iphone15',
      seller: 'Amazon',
    };

    const result = await service.calculate(data);

    expect(result.trustScore).toBeGreaterThanOrEqual(80);
    expect(result.riskLevel).toBe('LOW');
  });

  it('should recommend MEDIUM risk level for products with some cautions', async () => {
    const data: AnalyzeProductDto = {
      productName: 'Generic Product',
      price: 250,
      productUrl: 'https://www.unknown-store.com/product',
      seller: 'Unknown Seller',
    };

    const result = await service.calculate(data);

    expect(result.trustScore).toBeGreaterThanOrEqual(50);
    expect(result.trustScore).toBeLessThan(80);
    expect(result.riskLevel).toBe('MEDIUM');
  });

  it('should recommend HIGH risk level for untrusted sites', async () => {
    const data: AnalyzeProductDto = {
      productName: 'Suspicious Offer',
      price: 10,
      productUrl: 'http://suspicious-site.com/offer',
      seller: 'Dubious Seller',
    };

    const result = await service.calculate(data);

    expect(result.trustScore).toBeLessThan(50);
    expect(result.riskLevel).toBe('HIGH');
  });
});
