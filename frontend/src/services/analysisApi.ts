import { AnalysisRequest, AnalysisResult } from '../types/AnalysisResult';

const API_URL = 'https://tcc-shop-safe.onrender.com/analysis';

export async function analyzeProduct(data: AnalysisRequest): Promise<AnalysisResult> {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // Lida com códigos de erro específicos se necessário
            const errorText = await response.text();
            console.error(`Análise falhou: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Análise falhou com status: ${response.status}. ${errorText}`);
        }

        const result: AnalysisResult = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao analisar produto:', error);
        // Em uma extensão real, podemos querer retornar um estado padrão ou de erro
        // Por enquanto, relançando para deixar a UI lidar com isso
        throw error;
    }
}
