import { ArrowLeft, TrendingDown, ExternalLink, ShieldCheck, Tag, Minus, Shield } from 'lucide-react';
import { AlternativeSeller, StoreAnalysis } from '../../types/AnalysisResult';
import { useTheme } from '../context/ThemeContext';
import { getColors, ThemeColors } from '../themeColors';

interface PriceComparisonProps {
    analysis: StoreAnalysis;
    alternativeSellers: AlternativeSeller[];
    onBack: () => void;
    onMinimize: () => void;
}

export function PriceComparison({ analysis, alternativeSellers: _, onBack, onMinimize }: PriceComparisonProps) {
    const { theme } = useTheme();
    const c = getColors(theme);

    const displaySellers = (analysis.bestPrices || []).map(bp => ({
        id: bp.link,
        storeName: bp.store,
        storeUrl: new URL(bp.link).hostname,
        price: bp.price,
        percentageDifference: analysis.currentPrice ? ((bp.price - analysis.currentPrice) / analysis.currentPrice) * 100 : 0,
        trustScore: 90,
        isTrusted: true,
        productUrl: bp.link
    }));

    const sortedSellers = [...displaySellers].sort((a, b) => a.price - b.price);
    const bestPrice = sortedSellers[0];
    const hasBetterPrices = sortedSellers.some(seller => seller.price < (analysis.currentPrice || Infinity) * 0.98);

    const hoverBtn = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
        e.currentTarget.style.background = enter ? c.accentSubtle : 'transparent';
    };

    return (
        <div className="h-full flex flex-col" style={{ background: c.bgPrimary, color: c.textPrimary }}>
            <div className="flex items-center justify-between px-4 py-3 transition-colors ssa-drag-handle cursor-grab active:cursor-grabbing relative overflow-hidden" style={{ background: c.bgHeader, borderBottom: `1px solid ${c.borderPrimary}` }}>
                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-32 h-full opacity-30 blur-2xl pointer-events-none" style={{ background: `linear-gradient(90deg, var(--host-accent, ${c.accent}), transparent)` }}></div>
                <div className="absolute top-0 right-0 w-32 h-full opacity-20 blur-2xl pointer-events-none" style={{ background: `linear-gradient(-90deg, var(--host-accent, ${c.accent}), transparent)` }}></div>
                
                <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                    <button onClick={onBack} className="p-2 rounded-lg transition-all" style={{ color: theme === 'dark' ? '#ffffff' : c.textMuted }} onMouseEnter={e => hoverBtn(e, true)} onMouseLeave={e => hoverBtn(e, false)} aria-label="Back"><ArrowLeft className="w-4 h-4" /></button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold truncate uppercase tracking-tight" style={{ color: theme === 'dark' ? '#ffffff' : c.textLabel }}>Comparar Preços</h1>
                        <p className="text-[10px] mt-0.5 truncate uppercase tracking-wider font-bold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : c.textMuted }}>{analysis.productName}</p>
                    </div>
                </div>
                <button onClick={onMinimize} className="p-2 rounded-lg transition-all relative z-10" style={{ color: theme === 'dark' ? '#ffffff' : c.textMuted }} onMouseEnter={e => hoverBtn(e, true)} onMouseLeave={e => hoverBtn(e, false)} aria-label="Minimizar"><Minus className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
                {analysis.warnings.some(w => w.id === 'price-correction' || w.type === 'counterfeit-risk') && (
                    <div className="mb-3 p-2.5 rounded-xl flex items-center gap-3" style={{ background: c.accentSubtle, border: `1px solid ${c.borderAccent}` }}>
                        <div className="p-1.5 rounded-lg" style={{ background: c.accentSubtle }}><Shield className="w-3.5 h-3.5" style={{ color: 'var(--host-accent, #00b8d4)' }} /></div>
                        <div>
                            <p className="text-[10px] font-bold" style={{ color: 'var(--host-accent, #00b8d4)' }}>Validação Inteligente Ativa</p>
                            <p className="text-[9px]" style={{ color: c.textMuted }}>O sistema detectou inconsistências e validou o risco de mercado.</p>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: c.textMuted }}>LOJA ATUAL</h3>
                    <div className="rounded-xl p-3" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate text-sm" style={{ color: c.textPrimary }}>{analysis.storeName}</div>
                                <div className="text-[10px] mt-0.5 truncate" style={{ color: c.textMuted }}>{analysis.storeUrl}</div>
                            </div>
                            <div className="text-right ml-3">
                                <div className="text-xl font-black" style={{ color: c.textPrimary }}>R$ {analysis.currentPrice ? analysis.currentPrice.toFixed(2) : '---'}</div>
                                <div className="text-[9px] font-bold mt-0.5" style={{ color: c.accent }}>CONFIANÇA: {analysis.trustScore}/100</div>
                            </div>
                        </div>
                    </div>
                </div>

                {hasBetterPrices && bestPrice && analysis.currentPrice && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-3.5 h-3.5" style={{ color: c.priceGreen }} />
                            <h3 className="text-[9px] font-bold uppercase tracking-widest" style={{ color: c.priceGreen }}>ECONOMIA ENCONTRADA</h3>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: c.priceCardBg, border: `1px solid ${c.priceCardBorder}` }}>
                            <p className="text-[11px] leading-tight" style={{ color: c.textSecondary }}>
                                <strong style={{ color: c.priceGreen }}>{sortedSellers.filter(s => s.price < analysis.currentPrice).length}</strong> alternativas detectadas.
                                Economize até <strong className="text-sm" style={{ color: c.priceGreen }}>R$ {(analysis.currentPrice - bestPrice.price).toFixed(2)}</strong>.
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: c.textMuted }}>OUTRAS OFERTAS ({sortedSellers.length})</h3>
                    <div className="space-y-2.5">
                        {sortedSellers.map((seller, index) => (
                            <SellerCard key={seller.id} seller={seller} currentPrice={analysis.currentPrice || seller.price} index={index} theme={theme} colors={c} />
                        ))}
                    </div>
                </div>

                <div className="mt-6 mb-4 p-3 rounded-xl text-center" style={{ background: c.bgSecondary, border: `1px solid ${c.borderSubtle}` }}>
                    <p className="text-[10px]" style={{ color: c.textMuted }}>Preços e disponibilidade validados em tempo real via IA.</p>
                </div>
            </div>
        </div>
    );
}

function SellerCard({ seller, currentPrice, index, theme, colors: c }: { seller: AlternativeSeller; currentPrice: number; index: number; theme: string; colors: ThemeColors }) {
    const isCheaper = seller.price < currentPrice;
    const isMoreExpensive = seller.price > currentPrice;

    // Rank Colors
    let rankBg = c.bgCard;
    let rankBorder = c.borderSubtle;
    let labelText = null;
    let rankColor = '';
    let rankGlow = 'transparent';

    if (index === 0) {
        rankBg = theme === 'dark' ? 'rgba(0, 255, 204, 0.05)' : 'rgba(0, 184, 212, 0.05)';
        rankBorder = theme === 'dark' ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 184, 212, 0.3)';
        labelText = 'BEST MATCH';
        rankColor = theme === 'dark' ? '#00ffcc' : '#00b8d4';
        rankGlow = `0 0 10px ${rankColor}4d`;
    } else if (index === 1) {
        rankBg = theme === 'dark' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(147, 51, 234, 0.05)';
        rankBorder = theme === 'dark' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(147, 51, 234, 0.3)';
        labelText = 'TOP ALT';
        rankColor = theme === 'dark' ? '#a855f7' : '#9333ea';
        rankGlow = `0 0 10px ${rankColor}4d`;
    } else if (index === 2) {
        rankBg = theme === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.05)';
        rankBorder = theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)';
        labelText = 'GOOD VAL';
        rankColor = theme === 'dark' ? '#3b82f6' : '#2563eb';
        rankGlow = `0 0 10px ${rankColor}4d`;
    }

    return (
        <div className="rounded-xl p-3 transition-all duration-300 group relative overflow-hidden backdrop-blur-sm hover:scale-[1.02]" style={{
            background: rankBg,
            border: `1px solid ${rankBorder}`,
            boxShadow: index === 0 ? `inset 0 1px 1px rgba(255,255,255,0.05), 0 0 20px ${rankColor}4d` : `inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 20px rgba(0,0,0,0.15)`,
        }}>
            {/* Cyberpunk Accent Line */}
            {index < 3 && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: rankColor, boxShadow: `0 0 8px ${rankColor}` }}></div>
            )}

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% -20%, ${rankColor || c.accent}26, transparent 60%)` }}></div>
            {labelText && (
                <div className="flex items-center gap-1.5 mb-2 relative z-10">
                    <div className="px-1.5 py-0.5 rounded text-[8px] tracking-widest font-black flex items-center gap-1" style={{ border: `1px solid ${rankColor}80`, color: rankColor, boxShadow: rankGlow, background: `${rankColor}1a` }}>
                        <Tag className="w-2.5 h-2.5" />
                        {labelText}
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold truncate uppercase tracking-tight text-xs" style={{ color: c.textPrimary, paddingRight: '20px' }}>{seller.storeName}</h4>
                        {seller.isTrusted && (<div className="p-0.5 rounded" style={{ background: c.accentSubtle }}><ShieldCheck className="w-3 h-3 flex-shrink-0" style={{ color: c.accent }} /></div>)}
                    </div>
                    <p className="text-[10px] mb-2 truncate" style={{ color: c.textMuted }}>{seller.storeUrl}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: c.progressTrack }}>
                            <div className="h-full rounded-full transition-all duration-1000" style={{
                                width: `${seller.trustScore}%`,
                                background: seller.trustScore >= 70 ? c.progressGradientGreen : seller.trustScore >= 40 ? c.progressGradientYellow : c.progressGradientRed,
                            }} />
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: c.textMuted }}>T: {seller.trustScore}</span>
                    </div>
                </div>

                <div className="text-right flex-shrink-0">
                    <div className="text-xl font-black" style={{ color: c.textPrimary }}>R$ {seller.price.toFixed(2)}</div>
                    <div className="text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded-lg inline-block" style={{
                        background: isCheaper ? `${c.priceGreen}33` : isMoreExpensive ? `${c.scoreRed}33` : c.progressTrack,
                        color: isCheaper ? c.priceGreen : isMoreExpensive ? c.scoreRed : c.textSecondary,
                    }}>
                        {seller.percentageDifference > 0 ? '+' : ''}{seller.percentageDifference.toFixed(1)}%
                    </div>
                </div>
            </div>

            <a href={seller.productUrl} target="_blank" rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-[10px] transition-all active:scale-95 relative z-10"
                style={{
                    background: index === 0 ? `${rankColor}26` : c.accentSubtle,
                    color: index === 0 ? rankColor : c.accent,
                    border: `1px solid ${index === 0 ? `${rankColor}4d` : c.borderAccent}`,
                }}>
                <span>VER NA LOJA</span><ExternalLink className="w-3 h-3" />
            </a>
        </div>
    );
}
