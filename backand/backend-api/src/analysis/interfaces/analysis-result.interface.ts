export interface AnalysisResultOutput {
    trustScore: number;
    riskLevel: string;
    warnings: { type: string; message: string }[];
    analysisSummary: string;
    bestPrices: { store: string; price: number; difference: number; link: string }[];
    priceAnalysis: {
        percentage: number;
        comparison: 'ABOVE' | 'BELOW' | 'FAIR';
    };
    detailedAnalysis: string;
    publicEvaluation: string;
    decisions: { type: 'positive' | 'negative' | 'neutral', label: string, description: string }[];
}
