export type RiskLevel = 'safe' | 'caution' | 'risk';
export type Screen = 'popup' | 'details' | 'prices' | 'settings';

export interface Warning {
    id: string;
    type: 'high-risk' | 'suspicious-price' | 'low-reputation' | 'new-store' | 'poor-reviews';
    label: string;
    description: string;
}

export interface AnalysisDetails {
    reviewCount: number;
    averageRating: number;
    storeAge: string;
    securityFeatures: string[];
    returnPolicy: string;
    customerServiceRating: number;
    priceComparison: string;
    topPositives: string[];
    topNegatives: string[];
}

export interface AlternativeSeller {
    id: string;
    storeName: string;
    storeUrl: string;
    price: number;
    percentageDifference: number;
    trustScore: number;
    isTrusted: boolean;
    productUrl: string;
}

export interface StoreAnalysis {
    storeName: string;
    storeUrl: string;
    trustScore: number;
    riskLevel: RiskLevel;
    aiSummary: string;
    warnings: Warning[];
    analysisDetails: AnalysisDetails;
    currentPrice: number;
    productName: string;
    bestPrices?: {
        store: string;
        price: number;
        difference: number;
        link: string;
    }[];
    priceAnalysis?: {
        percentage: number;
        comparison: 'ABOVE' | 'BELOW' | 'FAIR';
    };
    decisions?: {
        type: 'positive' | 'negative' | 'neutral';
        label: string;
        description: string;
    }[];
}

// Keeping AnalysisResult for backward compatibility during migration
export interface AnalysisResult extends StoreAnalysis {
    // We can add any extension-specific fields here if needed
}

export interface AnalysisRequest {
    productUrl: string;
    productName?: string;
    price?: number;
    seller?: string;
}
