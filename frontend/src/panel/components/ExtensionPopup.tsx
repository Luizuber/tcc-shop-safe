import { Settings as SettingsIcon, ChevronRight, ChevronDown, ChevronUp, AlertTriangle, Minus } from 'lucide-react';
import { useState } from 'react';
import { TrustScore } from './TrustScore';
import { WarningBadge } from './WarningBadge';
import { StoreAnalysis, AlternativeSeller } from '../../types/AnalysisResult';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../themeColors';

interface ExtensionPopupProps {
    analysis: StoreAnalysis;
    alternativeSellers: AlternativeSeller[];
    onViewDetails: () => void;
    onViewPrices: () => void;
    onOpenSettings: () => void;
    onMinimize: () => void;
}

import { PromotionPlate } from './PromotionPlate';

export function ExtensionPopup({ analysis, alternativeSellers: _, onViewDetails, onViewPrices, onOpenSettings, onMinimize }: ExtensionPopupProps) {
    const [isAiSummaryExpanded, setIsAiSummaryExpanded] = useState(true);
    const { minTrustScore, showWarnings } = useSettings();
    const { theme } = useTheme();
    const c = getColors(theme);

    const displayPrices = analysis.bestPrices?.map(bp => ({
        id: bp.link,
        storeName: bp.store,
        price: bp.price,
        percentageDifference: analysis.currentPrice ? ((bp.price - analysis.currentPrice) / analysis.currentPrice) * 100 : 0,
        link: bp.link
    })) || [];

    const isLowTrust = analysis.trustScore < minTrustScore;

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: c.bgPrimary, color: c.textPrimary }}>
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-3.5 transition-colors relative overflow-hidden ssa-drag-handle cursor-grab active:cursor-grabbing" style={{ background: c.bgHeader }}>
                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-32 h-full opacity-20 blur-xl pointer-events-none" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}></div>

                {/* Left: Minimize */}
                <button onClick={onMinimize} className="p-1.5 rounded-md transition-all flex items-center justify-center group relative z-10 ml-1" 
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--host-accent, #00b8d4)' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }} aria-label="Minimizar">
                    <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Promotion Plate (Middle) */}
                <PromotionPlate speed={45} />

                {/* Right: Settings */}
                <button onClick={onOpenSettings} className="p-1.5 rounded-md transition-all flex items-center justify-center group relative z-10 mr-1" 
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--host-accent, #00b8d4)' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }} aria-label="Settings">
                    <SettingsIcon className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
                {isLowTrust && showWarnings && (
                    <div className="mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: c.warningBg, border: `1px solid ${c.warningBorder}` }}>
                        <div className="p-2 rounded-lg" style={{ background: `${c.scoreRed}33` }}>
                            <AlertTriangle className="w-5 h-5" style={{ color: c.scoreRed }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold" style={{ color: c.warningText }}>Risco Identificado</p>
                            <p className="text-[10px] font-medium" style={{ color: `${c.warningText}b3` }}>Pontuação abaixo do seu limite ({minTrustScore})</p>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <TrustScore score={analysis.trustScore} riskLevel={analysis.riskLevel} size="large" colors={c} />
                </div>

                {/* AI Analysis */}
                <div className="mb-4">
                    <div className="w-full rounded-xl p-4 transition-all text-left" style={{ background: c.bgCard, border: `1px solid ${c.borderPrimary}` }}>
                        <button onClick={() => setIsAiSummaryExpanded(!isAiSummaryExpanded)} className="w-full flex items-center justify-between mb-1">
                            <h3 className="font-semibold flex items-center gap-2" style={{ color: c.textLabel }}>
                                <span>Resumo da IA</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold" style={{ background: c.badgeBg, color: c.badgeText, border: c.badgeBorder }}>Smart</span>
                            </h3>
                            {isAiSummaryExpanded
                                ? <ChevronUp className="w-5 h-5" style={{ color: c.textMuted }} />
                                : <ChevronDown className="w-5 h-5" style={{ color: c.textMuted }} />}
                        </button>
                        {isAiSummaryExpanded && (
                            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${c.borderSubtle}` }}>
                                {analysis.aiSummary ? (
                                    <div className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                                        {analysis.aiSummary.includes('•') || analysis.aiSummary.includes('\n') ? (
                                            <ul className="space-y-1.5">
                                                {analysis.aiSummary.split(/[•\n]/).filter(s => s.trim()).map((line, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span style={{ color: c.accent }} className="mt-0.5">•</span>
                                                        <span>{line.trim()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{analysis.aiSummary}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm italic" style={{ color: c.textMuted }}>Análise indisponível no momento.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Better Prices */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold" style={{ color: c.textLabel }}>Comparação de Preços</h3>
                        {displayPrices.length > 0 && (
                            <button onClick={onViewPrices} className="text-[11px] font-bold uppercase tracking-tight" style={{ color: c.accent }}>Ver Tudo</button>
                        )}
                    </div>

                    {displayPrices.length > 0 ? (
                        <div className="space-y-2">
                            {displayPrices.slice(0, 5).map((seller, index) => {
                                const getStoreTrustInfo = (storeName: string) => {
                                    const name = storeName.toLowerCase();
                                    const highTrust = ['amazon', 'mercado livre', 'mercadolivre', 'magalu', 'magazine luiza', 'americanas', 'casas bahia', 'fast shop', 'kabum', 'pichau', 'terabyte', 'girafa', 'samsung', 'apple', 'motorola', 'dell'];
                                    const medTrust = ['shopee', 'aliexpress', 'olx', 'carrefour', 'extra', 'ponto frio', 'submarino', 'shoptime'];

                                    if (highTrust.some(t => name.includes(t))) return { score: 95, color: c.scoreGreen, label: 'Alta Confiança' };
                                    if (medTrust.some(t => name.includes(t))) return { score: 70, color: c.scoreYellow, label: 'Atenção' };
                                    return { score: 45, color: c.scoreRed, label: 'Baixa Confiança' };
                                };
                                const trust = getStoreTrustInfo(seller.storeName);

                                // Rank Colors
                                let rankBg = c.priceCardBg;
                                let rankBorder = c.priceCardBorder;
                                let rankText = null;
                                let rankColor = c.textMuted;
                                let rankGlow = 'transparent';

                                if (index === 0) {
                                    // Cyberpunk "Gold" (Neon Cyan/Teal)
                                    rankBg = theme === 'dark' ? 'rgba(0, 255, 204, 0.05)' : 'rgba(0, 184, 212, 0.05)';
                                    rankBorder = theme === 'dark' ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 184, 212, 0.3)';
                                    rankColor = theme === 'dark' ? '#00ffcc' : '#00b8d4';
                                    rankGlow = `0 0 10px ${rankColor}4d`;
                                    rankText = 'BEST MATCH';
                                } else if (index === 1) {
                                    // Cyberpunk "Silver" (Neon Purple)
                                    rankBg = theme === 'dark' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(147, 51, 234, 0.05)';
                                    rankBorder = theme === 'dark' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(147, 51, 234, 0.3)';
                                    rankColor = theme === 'dark' ? '#a855f7' : '#9333ea';
                                    rankGlow = `0 0 10px ${rankColor}4d`;
                                    rankText = 'TOP ALT';
                                } else if (index === 2) {
                                    // Cyberpunk "Bronze" (Neon Blue)
                                    rankBg = theme === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.05)';
                                    rankBorder = theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)';
                                    rankColor = theme === 'dark' ? '#3b82f6' : '#2563eb';
                                    rankGlow = `0 0 10px ${rankColor}4d`;
                                    rankText = 'GOOD VAL';
                                }

                                return (
                                    <a key={seller.id} href={seller.link || '#'} target="_blank" rel="noopener noreferrer"
                                        className="block w-full rounded-xl p-3.5 transition-all duration-300 text-left group relative overflow-hidden backdrop-blur-sm hover:scale-[1.02]"
                                        style={{ background: rankBg, border: `1px solid ${rankBorder}`, boxShadow: `inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 20px rgba(0,0,0,0.15)` }}>

                                        {/* Cyberpunk Accent Line */}
                                        {index < 3 && (
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: rankColor, boxShadow: `0 0 8px ${rankColor}` }}></div>
                                        )}

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% -20%, ${rankColor}26, transparent 60%)` }}></div>

                                        {/* Trust Bar */}
                                        <div className="w-full mb-3 flex flex-col gap-1.5 relative z-10">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    {rankText && (
                                                        <div className="px-1.5 py-0.5 rounded text-[8px] tracking-widest font-black" style={{ border: `1px solid ${rankColor}80`, color: rankColor, boxShadow: rankGlow, background: `${rankColor}1a` }}>
                                                            {rankText}
                                                        </div>
                                                    )}
                                                    <span style={{ color: c.textMuted }}>Confiabilidade</span>
                                                </div>
                                                <span style={{ color: trust.color }}>{trust.label}</span>
                                            </div>
                                            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: c.progressTrack }}>
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${trust.score}%`, backgroundColor: trust.color, boxShadow: `0 0 8px ${trust.color}66` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm mb-0.5 truncate uppercase" style={{ color: c.textPrimary, paddingRight: '20px' }}>{seller.storeName}</div>
                                                <div className="text-xs font-medium" style={{ color: c.priceGreen }}>
                                                    {seller.percentageDifference < 0
                                                        ? <span>-{Math.abs(seller.percentageDifference).toFixed(1)}% (Economize R$ {(analysis.currentPrice - seller.price).toFixed(2)})</span>
                                                        : <span>+{Math.abs(seller.percentageDifference).toFixed(1)}% (+ R$ {(seller.price - analysis.currentPrice).toFixed(2)})</span>}
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold" style={{ color: c.textPrimary }}>R$ {seller.price.toFixed(2)}</div>
                                        </div>
                                    </a>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl p-4 text-center" style={{ background: c.bgSecondary, border: `1px solid ${c.borderSubtle}` }}>
                            <p className="text-xs italic" style={{ color: c.textMuted }}>Nenhuma outra oferta encontrada.</p>
                        </div>
                    )}
                </div>

                {/* Warning Badges */}
                {analysis.warnings.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: c.textLabel }}>Alertas Detectados</h3>
                        <div className="flex flex-col gap-2">
                            {analysis.warnings.map((warning, idx) => (
                                <WarningBadge key={idx} colors={c} warning={{
                                    id: String(idx),
                                    type: (warning as any).type?.toLowerCase() || 'low-reputation',
                                    label: (warning as any).message || 'Analise cuidadosa necessária',
                                    description: ''
                                }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with CTA */}
            <div className="px-4 py-3" style={{ background: c.bgFooter, borderTop: `1px solid ${c.borderPrimary}` }}>
                <button onClick={onViewDetails}
                    className="w-full font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{ background: c.btnPrimaryBg, color: theme === 'dark' ? '#e0e6f0' : '#ffffff', border: `1px solid ${c.btnPrimaryBorder}`, boxShadow: c.btnPrimaryGlow }}>
                    <span className="text-sm">Abrir Análise Completa</span>
                    <ChevronRight className="w-4 h-4" /><ChevronRight className="w-4 h-4 -ml-3" />
                </button>
                <p className="text-[10px] text-center mt-2.5" style={{ color: c.textMuted }}>Shop Safe AI © 2026 • Inteligência aplicada à sua segurança</p>
            </div>
        </div>
    );
}
