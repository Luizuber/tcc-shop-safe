import React, { useEffect, useState, useRef } from 'react';
import '../globals.css';
import './Panel.css';
import { ExtensionPopup } from './components/ExtensionPopup';
import { DetailedAnalysis } from './components/DetailedAnalysis';
import { PriceComparison } from './components/PriceComparison';
import { Settings } from './components/Settings';
import { analyzeProduct } from '../services/analysisApi';
import { Screen, StoreAnalysis } from '../types/AnalysisResult';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import { Loader2, Shield, AlertTriangle, Zap } from 'lucide-react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { getColors } from './themeColors';

const MOCK_FAILURE_DATA: StoreAnalysis = {
    storeName: 'Amazon Demo',
    storeUrl: 'amazon.com.br',
    trustScore: 85,
    riskLevel: 'safe',
    aiSummary: 'Esta é uma análise de demonstração. O sistema identificou que este vendedor possui excelente reputação histórica e políticas de devolução claras. O preço está 5% abaixo da média de mercado para este produto específico.',
    warnings: [
        {
            id: 'w1',
            type: 'new-store',
            label: 'Loja Recente',
            description: 'Este vendedor entrou na plataforma nos últimos 6 meses.'
        }
    ],
    analysisDetails: {
        reviewCount: 1250,
        averageRating: 4.8,
        storeAge: '6 meses',
        securityFeatures: ['SSL Ativo', 'Pagamento Seguro', 'Verificado por IA'],
        returnPolicy: '7 dias para arrependimento, 30 dias para defeitos.',
        customerServiceRating: 4.5,
        priceComparison: '5% abaixo da média',
        topPositives: ['Entrega rápida', 'Produto original', 'Bom atendimento'],
        topNegatives: ['Embalagem simples']
    },
    currentPrice: 399.90,
    productName: 'Produto de Exemplo'
};

const PanelContent: React.FC = () => {
    const { theme } = useTheme();
    const { autoAnalysis } = useSettings();
    const c = getColors(theme);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<StoreAnalysis | null>(null);
    const [pendingProductData, setPendingProductData] = useState<any>(null);
    const [currentScreen, setCurrentScreen] = useState<Screen>('popup');

    // State for position and minimization
    // Position is stored as absolute left/top coordinates
    const PANEL_W = 360;
    const PANEL_H = 600;
    const BTN_SIZE = 56;
    const PADDING = 20;

    const [isMinimized, setIsMinimized] = useState(false);
    const [panelPos, setPanelPos] = useState({
        x: window.innerWidth - PANEL_W - PADDING,
        y: PADDING
    });

    // DRAG STATE
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    const handleAnalysis = async (productData: any) => {
        try {
            setLoading(true);
            setError(null);
            const result = await analyzeProduct(productData);

            let validatedPrice = productData.price;
            let priceCorrectedByApi = false;

            // PRICE VALIDATION: Check if API result has the price for the current store
            // and if our extracted price is suspiciously low (likely an installment)
            const cleanSeller = productData.seller.toLowerCase().replace('www.', '').split('.')[0];
            const currentStoreApiMatch = result.bestPrices?.find((bp: any) => {
                const cleanBpStore = bp.store.toLowerCase().split(' ')[0];
                return cleanBpStore.includes(cleanSeller) || cleanSeller.includes(cleanBpStore);
            });

            if (currentStoreApiMatch) {
                const apiPrice = currentStoreApiMatch.price;
                // If extracted price is < 50% of API price, it's probably an installment
                if (validatedPrice < apiPrice * 0.5) {
                    console.log(`[Shop Safe AI] Price validation: Correcting ${validatedPrice} to ${apiPrice} (from API)`);
                    validatedPrice = apiPrice;
                    priceCorrectedByApi = true;
                }
            }

            // Map backend result to StoreAnalysis and preserve original data if missing
            const mergedData: any = {
                ...result,
                storeName: result.storeName || productData.seller,
                storeUrl: result.storeUrl || new URL(productData.productUrl).hostname,
                productName: result.productName || productData.productName,
                currentPrice: validatedPrice,
                aiSummary: (result as any).analysisSummary || result.aiSummary, // Backend uses analysisSummary
                riskLevel: mapRiskLevel(result.riskLevel),
                warnings: [
                    ...(priceCorrectedByApi ? [{
                        id: 'price-correction',
                        type: 'suspicious-price',
                        label: 'Preço Validado via API',
                        description: 'O preço extraído da página parecia ser uma parcela. Validamos o valor real de mercado para esta loja.'
                    }] : []),
                    ...(result.warnings?.map((w: any, idx: number) => ({
                        id: String(idx),
                        type: w.type?.toLowerCase() || 'low-reputation',
                        label: w.message || 'Alerta de segurança',
                        description: ''
                    })) || [])
                ]
            };

            setData(mergedData);
            setPendingProductData(null);
        } catch (err) {
            console.error('[Shop Safe AI] Analysis error:', err);
            setError('Erro ao analisar produto. Verifique se o servidor está rodando.');
        } finally {
            setLoading(false);
        }
    };

    const mapRiskLevel = (backendLevel: string): any => {
        switch (backendLevel) {
            case 'HIGH': return 'risk';
            case 'MEDIUM': return 'caution';
            case 'LOW': return 'safe';
            default: return 'safe';
        }
    };

    // Initial State Loader
    useEffect(() => {
        chrome.storage.local.get(['isMinimized', 'panelPos'], (result) => {
            if (result.isMinimized !== undefined) {
                setIsMinimized(result.isMinimized);
                window.postMessage({ type: 'SSA_STATE_CHANGED', isMinimized: result.isMinimized }, '*');
            }
            if (result.panelPos) {
                const saved = result.panelPos;
                // Validate: discard old-format positions (negative x) or out-of-bounds
                if (saved.x >= 0 && saved.y >= 0 && saved.x < window.innerWidth && saved.y < window.innerHeight) {
                    setPanelPos(saved);
                } else {
                    // Clear invalid saved position
                    chrome.storage.local.remove('panelPos');
                }
            }
        });

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'TOGGLE_PANEL_INTERNAL') {
                setIsMinimized(prev => {
                    const next = !prev;
                    chrome.storage.local.set({ isMinimized: next });
                    window.postMessage({ type: 'SSA_STATE_CHANGED', isMinimized: next }, '*');
                    return next;
                });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Product Data Message Handler
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'SSA_PRODUCT_DATA') {
                const productData = event.data.payload;
                if (!productData) return;

                // Only re-analyze if data is different from current state (avoid loops)
                setData(prev => {
                    const priceChanged = prev && Math.abs(prev.currentPrice - productData.price) > 1;
                    const nameChanged = prev && prev.productName !== productData.productName;

                    if (!prev || priceChanged || nameChanged) {
                        if (autoAnalysis) {
                            handleAnalysis(productData);
                        } else {
                            setPendingProductData(productData);
                            return null;
                        }
                    }
                    return prev;
                });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [autoAnalysis]);

    // Clamp helper: ensures the element stays within viewport
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    // DRAG LOGIC
    const onMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const isHandle = target.closest('.ssa-drag-handle') ||
            target.closest('.ssa-floating-button') ||
            target.classList.contains('ssa-panel-v2');
        const isButton = target.closest('button') && !target.closest('.ssa-floating-button');
        if (!isHandle || (isButton && !isMinimized)) return;

        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: panelPos.x,
            initialY: panelPos.y
        };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - dragRef.current.startX;
            const dy = moveEvent.clientY - dragRef.current.startY;
            const w = isMinimized ? BTN_SIZE : PANEL_W;
            const h = isMinimized ? BTN_SIZE : PANEL_H;

            const newX = clamp(dragRef.current.initialX + dx, PADDING, window.innerWidth - w - PADDING);
            const newY = clamp(dragRef.current.initialY + dy, PADDING, window.innerHeight - h - PADDING);
            setPanelPos({ x: newX, y: newY });
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            const dx = upEvent.clientX - dragRef.current.startX;
            const dy = upEvent.clientY - dragRef.current.startY;
            const w = isMinimized ? BTN_SIZE : PANEL_W;
            const h = isMinimized ? BTN_SIZE : PANEL_H;

            const finalX = clamp(dragRef.current.initialX + dx, PADDING, window.innerWidth - w - PADDING);
            const finalY = clamp(dragRef.current.initialY + dy, PADDING, window.innerHeight - h - PADDING);

            setPanelPos({ x: finalX, y: finalY });
            chrome.storage.local.set({ panelPos: { x: finalX, y: finalY } });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMinimize = () => {
        setIsMinimized(prev => {
            const next = !prev;
            chrome.storage.local.set({ isMinimized: next });
            window.postMessage({ type: 'SSA_STATE_CHANGED', isMinimized: next }, '*');

            if (!next) {
                // Expanding: adjust position so the full panel is visible
                setPanelPos(pos => {
                    let x = pos.x;
                    let y = pos.y;
                    // If panel would overflow right, shift left
                    if (x + PANEL_W > window.innerWidth - PADDING) {
                        x = window.innerWidth - PANEL_W - PADDING;
                    }
                    // If panel would overflow bottom, shift up
                    if (y + PANEL_H > window.innerHeight - PADDING) {
                        y = window.innerHeight - PANEL_H - PADDING;
                    }
                    // If panel would go off left or top, clamp
                    x = Math.max(PADDING, x);
                    y = Math.max(PADDING, y);
                    chrome.storage.local.set({ panelPos: { x, y } });
                    return { x, y };
                });
            }
            return next;
        });
    };

    const startDemoMode = () => {
        setError(null);
        setData(MOCK_FAILURE_DATA);
        setPendingProductData(null);
    };

    if (isMinimized) {
        return (
            <div
                className={`ssa-panel-v2 ${theme === 'dark' ? 'dark' : ''} ${isDragging ? 'dragging' : ''}`}
                style={{
                    left: `${panelPos.x}px`,
                    top: `${panelPos.y}px`,
                    background: 'transparent',
                    width: `${BTN_SIZE}px`,
                    height: `${BTN_SIZE}px`
                }}
                onMouseDown={onMouseDown}
            >
                <div
                    className="ssa-floating-button shadow-lg hover:shadow-xl transition-all active:scale-95 m-0"
                    style={{ background: c.floatingBg, border: c.floatingBorder, boxShadow: c.floatingGlow }}
                    onClick={(e) => {
                        const dx = Math.abs(dragRef.current.startX - e.clientX);
                        const dy = Math.abs(dragRef.current.startY - e.clientY);
                        if (dx < 5 && dy < 5) handleMinimize();
                    }}
                >
                    <Shield size={24} color={c.floatingIcon} />
                </div>
            </div>
        );
    }

    const renderScreen = () => {
        if (loading) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8" style={{ background: c.bgPrimary }}>
                    <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: c.accent }} />
                    <p className="font-medium" style={{ color: c.textMuted }}>Analisando segurança...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: c.bgPrimary }}>
                    <AlertTriangle className="w-12 h-12 mb-4" style={{ color: c.scoreRed }} />
                    <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Erro na Análise</h3>
                    <p className="text-sm mb-6" style={{ color: c.textMuted }}>{error}</p>
                    <div className="flex flex-col gap-2 w-full">
                        <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl font-medium"
                            style={{ background: c.btnPrimaryBg, color: c.textPrimary, border: `1px solid ${c.btnPrimaryBorder}` }}>Tentar Novamente</button>
                        <button onClick={startDemoMode} className="text-sm font-medium hover:underline" style={{ color: c.accent }}>Entrar em Modo de Demonstração</button>
                    </div>
                </div>
            );
        }

        if (!data && pendingProductData) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: c.bgPrimary }}>
                    <Zap className="w-12 h-12 mb-4" style={{ color: c.accent }} />
                    <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Pronto para Analisar</h3>
                    <p className="text-sm mb-6" style={{ color: c.textMuted }}>A análise automática está desativada. Clique abaixo para verificar esta loja.</p>
                    <button onClick={() => handleAnalysis(pendingProductData)}
                        className="w-full px-6 py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
                        style={{ background: c.btnPrimaryBg, color: c.textPrimary, border: `1px solid ${c.btnPrimaryBorder}`, boxShadow: c.btnPrimaryGlow }}>Analisar Agora</button>
                </div>
            );
        }

        if (!data) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: c.bgPrimary }}>
                    <Shield className="w-12 h-12 mb-4" style={{ color: c.borderSubtle }} />
                    <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Aguardando Produto</h3>
                    <p className="text-sm" style={{ color: c.textMuted }}>Navegue até a página de um produto para iniciar a análise.</p>
                </div>
            );
        }

        // Trust score check for visual alert (logic only, to be used by child components if needed)
        const displayData = { ...data };

        switch (currentScreen) {
            case 'popup':
                return (
                    <ExtensionPopup
                        analysis={displayData}
                        alternativeSellers={[]}
                        onViewDetails={() => setCurrentScreen('details')}
                        onViewPrices={() => setCurrentScreen('prices')}
                        onOpenSettings={() => setCurrentScreen('settings')}
                        onMinimize={handleMinimize}
                    />
                );
            case 'details':
                return (
                    <DetailedAnalysis
                        analysis={displayData}
                        onBack={() => setCurrentScreen('popup')}
                        onMinimize={handleMinimize}
                    />
                );
            case 'prices':
                return (
                    <PriceComparison
                        analysis={displayData}
                        alternativeSellers={[]}
                        onBack={() => setCurrentScreen('popup')}
                        onMinimize={handleMinimize}
                    />
                );
            case 'settings':
                return (
                    <Settings
                        onBack={() => setCurrentScreen('popup')}
                        onMinimize={handleMinimize}
                    />
                );
            default:
                return null;
        }
    };

    // This second minimized block is a fallback — use the same positioning
    if (isMinimized) {
        return (
            <div
                className="ssa-floating-button"
                onClick={handleMinimize}
                style={{
                    position: 'absolute',
                    left: `${panelPos.x}px`,
                    top: `${panelPos.y}px`,
                }}
            >
                <Shield className="w-6 h-6" style={{ color: '#00b8d4' }} />
            </div>
        );
    }

    return (
        <div
            className={`ssa-panel-v2 ${theme === 'dark' ? 'dark' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                left: `${panelPos.x}px`,
                top: `${panelPos.y}px`,
                background: 'transparent',
            }}
            onMouseDown={onMouseDown}
        >
            <div
                className="flex flex-col h-full overflow-hidden shadow-2xl rounded-[24px] transition-colors"
                style={{
                    background: c.bgPrimary,
                    border: c.panelBorder,
                    boxShadow: c.panelShadow,
                }}
            >
                {renderScreen()}
            </div>
        </div>
    );
};

export const Panel: React.FC = () => {
    return (
        <SettingsProvider>
            <ThemeProvider>
                <PanelContent />
            </ThemeProvider>
        </SettingsProvider>
    );
};
