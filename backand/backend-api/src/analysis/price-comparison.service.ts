import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PriceComparisonService {
    constructor(private configService: ConfigService) { }

    async searchProduct(productName: string) {
        const apiKey = this.configService.get<string>('SERP_API_KEY');

        if (!apiKey) {
            console.warn("SERP_API_KEY not found in ConfigService. Returning empty price list.");
            return [];
        }

        console.log(`Using SerpAPI Key (first 4 chars): ${apiKey.substring(0, 4)}...`);

        // 1. Refinar Query - Preservar atributos críticos (GB, TB, Modelo)
        const attributes = productName.match(/\d+\s?(gb|tb|ram|mah|plus|pro|max|ultra|edge)/gi) || [];
        const cleanName = productName
            .replace(/[^\w\s]/gi, ' ')
            .split(/\s+/)
            .slice(0, 6)
            .join(' ');

        const finalizedQuery = `${cleanName} ${attributes.join(' ')}`.trim();
        console.log(`[Price Analysis] Enhanced Query: "${finalizedQuery}"`);

        try {
            const response = await axios.get(
                "https://serpapi.com/search.json",
                {
                    params: {
                        engine: "google_shopping",
                        q: finalizedQuery,
                        hl: "pt",
                        gl: "br",
                        api_key: apiKey
                    }
                }
            );

            if (!response.data.shopping_results) {
                return [];
            }

            const rawResults = response.data.shopping_results;

            console.log("[RAW SHOPPING RESULTS]", JSON.stringify(rawResults.slice(0, 2), null, 2));

            const normalizedResults = rawResults
                .map(item => {
                    const price = item.extracted_price ?? this.parseBrazilianPrice(item.price);
                    return {
                        store: item.source,
                        price: price,
                        link: item.link
                    };
                });

            console.log("[NORMALIZED RESULTS (before filtering)]", normalizedResults.length);

            // 2. Filtragem Determinística Inteligente
            const originalTerms = productName.toLowerCase().split(/\s+/);
            const excludeKeywords = [
                'case', 'capinha', 'cover', 'película', 'pelicula', 'charger',
                'cabo', 'carregador', 'fone', 'headset', 'strap', 'pulseira',
                'kit', 'adesivo', 'suporte', 'protetor', 'vidro temperado',
                'replacement', 'repetidor', 'extensor', 'adapter', 'adaptador'
            ].filter(keyword => !originalTerms.some(term => term.includes(keyword) || keyword.includes(term)));

            const originalCapacities = productName.toLowerCase().match(/\d+\s?gb|\d+\s?tb/g) || [];

            // Re-implementing filter with raw titles but working on normalized structure
            const finalFiltered = rawResults
                .map(rawItem => {
                    const price = rawItem.extracted_price ?? this.parseBrazilianPrice(rawItem.price);
                    return {
                        ...rawItem,
                        normalizedPrice: price
                    };
                })
                .filter(item => {
                    const title = item.title.toLowerCase();
                    
                    // 1. Exclude strictly forbidden terms (case, charger, etc.)
                    const hasForbiddenAccessory = excludeKeywords.some(keyword => title.includes(keyword));
                    if (hasForbiddenAccessory) return false;

                    // 2. Looser match: At least 50% of major terms should match, OR the brand name
                    const majorTerms = originalTerms.filter(t => t.length > 3);
                    const matchedTerms = majorTerms.filter(term => title.includes(term));
                    
                    if (majorTerms.length > 0 && matchedTerms.length < majorTerms.length * 0.5) {
                        // If less than 50% match, check if at least the first significant term (often brand) matches
                        if (!title.includes(majorTerms[0])) return false;
                    }

                    if (originalCapacities.length > 0) {
                        const matchCapacity = originalCapacities.some(cap =>
                            title.replace(/\s/g, '').includes(cap.replace(/\s/g, ''))
                        );
                        if (!matchCapacity) return false;
                    }
                    const itemLink = item.product_link || item.link;
                    return item.normalizedPrice > 0 && itemLink;
                })
                .map(item => ({
                    store: item.source,
                    price: item.normalizedPrice,
                    link: item.product_link || item.link
                }));

            console.log("[FILTERED RESULTS COUNT]", finalFiltered.length);
            return finalFiltered;
        } catch (error) {
            console.error("Failed to fetch prices from SerpAPI:", error.message);
            return [];
        }
    }

    private parseBrazilianPrice(priceStr: string): number {
        if (!priceStr) return 0;

        console.log(`[Price Parser] Parsing: "${priceStr}"`);

        // STEP 1: split and take only first part if contains "ou" or "6x" etc
        let clean = priceStr.split(/\bou\b|\bx\s+de/i)[0].trim();

        // STEP 2: Handle installment-only formats
        const installmentRegex = /^(\d+\s*x\s*de|\d+\s*parcelas?)/i;
        if (installmentRegex.test(clean)) {
            return 0;
        }

        // STEP 3: Extract numeric parts. 
        // We look for patterns like 1.234,56 or 1234.56 or 1234,56
        // Remove currency symbols first
        clean = clean.replace(/R\$/g, '').trim();

        const match = clean.match(/[\d\.,]+/);
        if (!match) return 0;

        let valueStr = match[0];

        // Determine if comma or dot is the decimal separator
        // If there's a comma followed by 2 digits at the end, it's likely the decimal separator
        if (valueStr.includes(',') && valueStr.indexOf(',') === valueStr.length - 3) {
            valueStr = valueStr.replace(/\./g, '').replace(',', '.');
        } else if (valueStr.includes('.') && valueStr.indexOf('.') === valueStr.length - 3) {
            // Already in dot format probably, just remove other dots if any
            const parts = valueStr.split('.');
            if (parts.length > 2) {
                valueStr = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
            }
        } else {
            // No clear decimal or different format, try to just keep numbers and first dot/comma
            valueStr = valueStr.replace(/[^\d.,]/g, '');
        }

        const finalValue = parseFloat(valueStr) || 0;
        console.log(`[Price Parser] Result: ${finalValue}`);
        return finalValue;
    }
}
