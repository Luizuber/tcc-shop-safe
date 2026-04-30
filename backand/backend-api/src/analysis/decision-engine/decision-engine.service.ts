import { Injectable } from '@nestjs/common';
import { AnalyzeProductDto } from '../dto/analyze-product.dto';
import { PriceComparisonService } from '../price-comparison.service';
import { AnalysisResultOutput } from '../interfaces/analysis-result.interface';

@Injectable()
export class DecisionEngineService {
  constructor(private readonly priceService: PriceComparisonService) { }

  async calculate(data: AnalyzeProductDto): Promise<AnalysisResultOutput> {
    const warnings: { type: string; message: string }[] = [];
    const bestPrices: { store: string; price: number; difference: number; link: string }[] = [];
    const decisions: { type: 'positive' | 'negative' | 'neutral', label: string, description: string }[] = [];
    let score = 100;
    const hasPrice = data.price > 0;

    // 1. Heurísticas Básicas
    const url = new URL(data.productUrl);
    if (!url.protocol.includes('https')) {
      score -= 20;
      warnings.push({ type: 'LOW_REPUTATION', message: 'Site não utiliza conexão segura (HTTPS).' });
      decisions.push({ type: 'negative', label: 'Conexão Insegura', description: 'O site não utiliza HTTPS. Alto risco de interceptação de dados.' });
    } else {
      decisions.push({ type: 'positive', label: 'Conexão Segura', description: 'O tráfego de dados é criptografado via HTTPS.' });
    }

    const trustedDomains = [
      'amazon.com', 'amazon.com.br', 'mercadolivre.com.br', 'magazineluiza.com.br', 
      'americanas.com.br', 'casasbahia.com.br', 'kabum.com.br', 'pichau.com.br', 
      'terabyteshop.com.br', 'fastshop.com.br', 'shopee.com.br', 'aliexpress.com',
      'pontofrio.com.br', 'extra.com.br', 'submarino.com.br', 'shoptime.com.br'
    ];
    const isTrustedDomain = trustedDomains.some(d => url.hostname.endsWith(d));

    if (!isTrustedDomain) {
      score -= 30;
      warnings.push({ type: 'LOW_REPUTATION', message: 'Domínio desconhecido ou não verificado.' });
      decisions.push({ type: 'negative', label: 'Domínio Desconhecido', description: 'O site não está em nossa base primária de grandes varejistas.' });
    } else {
      decisions.push({ type: 'positive', label: 'Domínio Verificado', description: 'Este é um e-commerce amplamente conhecido e seguro.' });
    }

    const knownSellers = [
      'amazon', 'mercado livre', 'magalu', 'magazine luiza', 'americanas', 
      'casas bahia', 'kabum', 'pichau', 'terabyte', 'fast shop', 'shopee', 
      'aliexpress', 'ponto frio', 'extra', 'submarino', 'shoptime'
    ];
    if (data.seller && !knownSellers.some(s => data.seller.toLowerCase().includes(s))) {
      score -= 10;
      decisions.push({ type: 'neutral', label: 'Vendedor Comum', description: 'O vendedor específico não possui um selo de alta reputação destacado em nossa base.' });
    } else if (data.seller) {
      decisions.push({ type: 'positive', label: 'Vendedor Confiável', description: 'O vendedor está listado entre os parceiros de alta reputação.' });
    }

    // Análise de Preço
    const marketPrices = await this.priceService.searchProduct(data.productName);
    let averagePrice = 0;
    let priceAnalysis: AnalysisResultOutput['priceAnalysis'] = {
      percentage: 0,
      comparison: 'FAIR'
    };

    if (marketPrices.length > 0) {
      const validPrices = marketPrices.filter(p => !isNaN(p.price) && p.price > 0);
      if (validPrices.length > 0) {
        const sum = validPrices.reduce((acc, curr) => acc + curr.price, 0);
        averagePrice = sum / validPrices.length;

        if (hasPrice) {
          const diffPercentage = ((data.price - averagePrice) / averagePrice) * 100;
          priceAnalysis.percentage = Math.round(Math.abs(diffPercentage));

          const maxDiscount = data.maxPriceDiscount || 30;

          if (diffPercentage <= -maxDiscount) {
            priceAnalysis.comparison = 'BELOW';
            score -= 50; // Penalidade mais alta para desconto extremo
            warnings.push({ type: 'COUNTERFEIT_RISK', message: `Preço excessivamente baixo (mais de ${maxDiscount}% de desconto). Cuidado: Risco elevado de produto falsificado.` });
            decisions.push({ type: 'negative', label: 'Possível Produto Falso', description: `O valor está ${Math.round(Math.abs(diffPercentage))}% abaixo do mercado, indicando risco de ser um item não original.` });
          } else if (diffPercentage <= -20) {
            priceAnalysis.comparison = 'BELOW';
            score -= 30;
            warnings.push({ type: 'SUSPICIOUS_PRICE', message: 'Preço significativamente abaixo da média de mercado.' });
            decisions.push({ type: 'negative', label: 'Preço Irreal', description: 'O valor está muito abaixo do mercado, indicando risco de fraude.' });
          } else if (diffPercentage < -15) {
            priceAnalysis.comparison = 'BELOW';
            score -= 20;
            warnings.push({ type: 'SUSPICIOUS_PRICE', message: 'O preço está significativamente abaixo da média do mercado.' });
            decisions.push({ type: 'negative', label: 'Preço Muito Baixo', description: 'O valor está 15% abaixo da média, exigindo muita cautela do comprador.' });
          } else if (diffPercentage > 15) {
            priceAnalysis.comparison = 'ABOVE';
            warnings.push({ type: 'SUSPICIOUS_PRICE', message: 'O preço está acima da média encontrada em outras lojas.' });
            decisions.push({ type: 'neutral', label: 'Preço Elevado', description: 'O valor cobrado está sensivelmente mais caro que a média de mercado.' });
          } else {
            decisions.push({ type: 'positive', label: 'Preço Justo', description: 'O valor cobrado está alinhado com a média do mercado.' });
          }
        } else {
          // Sem preço na página: não há penalidade ou bonificação por preço
          priceAnalysis.comparison = 'FAIR';
        }

        validPrices.forEach(p => {
          bestPrices.push({
            store: p.store,
            price: p.price,
            difference: hasPrice && data.price > p.price ? Math.round(data.price - p.price) : 0,
            link: p.link
          });
        });
      }
    } else {
      averagePrice = data.price;
    }

    score = Math.max(0, Math.min(100, score));

    let riskLevel = 'LOW';
    if (score < 50) riskLevel = 'HIGH';
    else if (score < 80) riskLevel = 'MEDIUM';

    bestPrices.sort((a, b) => a.price - b.price);

    return {
      trustScore: score,
      riskLevel,
      warnings,
      analysisSummary: this.generateAiSummary(data, score, warnings),
      bestPrices: bestPrices,
      priceAnalysis,
      detailedAnalysis: this.generateDetailedAnalysis(data, score, priceAnalysis, averagePrice),
      publicEvaluation: this.generatePublicEvaluation(score, isTrustedDomain, priceAnalysis, hasPrice),
      decisions
    };
  }

  private generateAiSummary(data: AnalyzeProductDto, score: number, warnings: any[]): string {
    if (data.price === 0) {
      return `Análise realizada sem preço base. O produto "${data.productName}" foi avaliado com base na reputação do domínio e média de mercado.`;
    }

    if (score >= 80) {
      return `Compra Segura. O produto "${data.productName}" está com ótimos indicadores de confiança e preço justo.`;
    } else if (score >= 50) {
      return `Atenção Necessária. Encontramos alguns pontos de cautela para "${data.productName}".`;
    } else {
      return `Alto Risco. Não recomendamos a compra de "${data.productName}" nesta loja no momento.`;
    }
  }

  private generateDetailedAnalysis(data: AnalyzeProductDto, score: number, priceAnalysis: any, avgPrice: number): string {
    let text = `Nossa análise técnica atribuiu uma nota de confiança de ${score}/100 para esta oferta. `;

    if (data.price === 0) {
      text += `O preço do produto não pôde ser identificado de forma confiável na página. Por isso, a análise prioriza as médias de mercado (aprox. R$ ${avgPrice.toFixed(2)}) e a reputação do vendedor. `;
    } else {
      const priceStatus = priceAnalysis.comparison === 'BELOW' ? 'atrativo (abaixo da média)' :
        priceAnalysis.comparison === 'ABOVE' ? 'elevado (acima da média)' : 'dentro do esperado';
      text += `O valor de R$ ${data.price.toFixed(2)} é considerado ${priceStatus} em relação ao valor médio de mercado de R$ ${avgPrice.toFixed(2)}. `;
    }

    if (score < 60) {
      text += `O principal fator de risco é a procedência do domínio e possíveis inconsistências detectadas. Recomendamos priorizar lojas com selos de verificação reconhecidos.`;
    } else {
      text += `A loja apresenta bons indicadores de segurança. No entanto, sempre verifique as políticas de devolução e o prazo de entrega antes de finalizar o pagamento.`;
    }

    return text;
  }

  private generatePublicEvaluation(score: number, isTrusted: boolean, priceAnalysis: any, hasPrice: boolean): string {
    if (!hasPrice) {
      return 'Sem dados de preço para comparação direta. A percepção do público é baseada majoritariamente no histórico de confiança do domínio pesquisado.';
    }

    if (isTrusted && score > 80) {
      return 'A maioria dos consumidores relata experiências positivas com esta loja. A consistência de preços e a segurança do domínio são pontos fortes destacados pela comunidade.';
    } else if (priceAnalysis.comparison === 'BELOW' && score < 70) {
      return 'Consumidores alertam para ofertas com preços excessivamente baixos nesta categoria. Há relatos de atrasos em lojas com score de confiança similar.';
    } else {
      return 'Percepção mista. Recomendamos verificar a reputação específica do vendedor em sites de avaliação antes de prosseguir com a transação.';
    }
  }
}
