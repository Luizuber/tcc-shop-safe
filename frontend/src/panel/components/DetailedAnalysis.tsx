import { ArrowLeft, Star, Calendar, Shield, TrendingDown, TrendingUp, DollarSign, Minus, Cpu, CheckCircle2, AlertOctagon, Info } from 'lucide-react';
import { TrustScore } from './TrustScore';
import { StoreAnalysis } from '../../types/AnalysisResult';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../themeColors';

interface DetailedAnalysisProps {
    analysis: StoreAnalysis;
    onBack: () => void;
    onMinimize: () => void;
}

export function DetailedAnalysis({ analysis, onBack, onMinimize }: DetailedAnalysisProps) {
    const { theme } = useTheme();
    const c = getColors(theme);

    const hoverBtn = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
        e.currentTarget.style.background = enter ? c.accentSubtle : 'transparent';
    };

    return (
        <div className="h-full flex flex-col overflow-hidden transition-colors" style={{ background: c.bgPrimary, color: c.textPrimary }}>
            <div className="flex items-center justify-between px-4 py-3 ssa-drag-handle cursor-grab active:cursor-grabbing relative overflow-hidden" style={{ background: c.bgHeader, borderBottom: `1px solid ${c.borderPrimary}` }}>
                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-32 h-full opacity-20 blur-xl pointer-events-none" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}></div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <button onClick={onBack} className="p-2 rounded-lg transition-all" style={{ color: theme === 'dark' ? '#ffffff' : c.textMuted }} onMouseEnter={e => hoverBtn(e, true)} onMouseLeave={e => hoverBtn(e, false)} aria-label="Voltar"><ArrowLeft className="w-4 h-4" /></button>
                    <h1 className="font-bold uppercase tracking-tight" style={{ color: theme === 'dark' ? '#ffffff' : c.textLabel }}>Análise Detalhada</h1>
                </div>
                <button onClick={onMinimize} className="p-2 rounded-lg transition-all relative z-10" style={{ color: theme === 'dark' ? '#ffffff' : c.textMuted }} onMouseEnter={e => hoverBtn(e, true)} onMouseLeave={e => hoverBtn(e, false)} aria-label="Minimizar"><Minus className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
                <div className="mb-6"><TrustScore score={analysis.trustScore} riskLevel={analysis.riskLevel} size="small" colors={c} /></div>

                {analysis.analysisDetails && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>MÉTRICAS PRINCIPAIS</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard icon={<Star className="w-4 h-4" />} label="Avaliação Média" value={`${analysis.analysisDetails.averageRating}/5.0`} colors={c} />
                            <MetricCard icon={<Calendar className="w-4 h-4" />} label="Idade da Loja" value={analysis.analysisDetails.storeAge} colors={c} />
                            <MetricCard icon={<Star className="w-4 h-4" />} label="Total de Reviews" value={analysis.analysisDetails.reviewCount?.toLocaleString() || '0'} colors={c} />
                            <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Preço vs Mercado" value={analysis.analysisDetails.priceComparison} colors={c} />
                        </div>
                    </div>
                )}

                {/* Decision Factors */}
                {analysis.decisions && analysis.decisions.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: c.textMuted }}>
                            <Cpu className="w-3.5 h-3.5" /> Fatores de Decisão da IA
                        </h3>
                        <div className="space-y-2">
                            {analysis.decisions.map((d, idx) => {
                                const isPos = d.type === 'positive';
                                const isNeg = d.type === 'negative';
                                const dColor = isPos ? c.priceGreen : isNeg ? c.scoreRed : c.textMuted;
                                const bgGlow = isPos ? `${c.priceGreen}1A` : isNeg ? `${c.scoreRed}1A` : `${c.textMuted}1A`;
                                const Icon = isPos ? CheckCircle2 : isNeg ? AlertOctagon : Info;
                                
                                return (
                                    <div key={idx} className="flex gap-3 p-3 rounded-xl backdrop-blur-sm relative overflow-hidden" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                                        <div className="absolute top-0 left-0 bottom-0 w-1 opacity-70" style={{ background: dColor, boxShadow: `0 0 10px ${dColor}` }}></div>
                                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `linear-gradient(90deg, ${bgGlow}, transparent)` }}></div>
                                        
                                        <div className="mt-0.5 ml-1 relative z-10"><Icon className="w-4 h-4" style={{ color: dColor }} /></div>
                                        <div className="relative z-10">
                                            <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: dColor }}>{d.label}</p>
                                            <p className="text-[10px] leading-relaxed" style={{ color: c.textSecondary }}>{d.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {(analysis as any).detailedAnalysis && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>ANÁLISE TÉCNICA</h3>
                        <div className="rounded-2xl p-4" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                            <p className="text-xs leading-relaxed font-medium" style={{ color: c.textSecondary }}>{(analysis as any).detailedAnalysis}</p>
                        </div>
                    </div>
                )}

                {(analysis as any).publicEvaluation && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>AVALIAÇÃO PÚBLICA</h3>
                        <div className="rounded-2xl p-4" style={{ background: c.accentSubtle, border: `1px solid ${c.borderSubtle}` }}>
                            <p className="text-xs leading-relaxed font-medium" style={{ color: c.textSecondary }}>{(analysis as any).publicEvaluation}</p>
                        </div>
                    </div>
                )}

                {analysis.analysisDetails?.securityFeatures && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>SEGURANÇA</h3>
                        <div className="rounded-2xl p-4" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                            {analysis.analysisDetails.securityFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 mb-3 last:mb-0">
                                    <div className="p-1.5 rounded-lg" style={{ background: `${c.scoreGreen}1a` }}><Shield className="w-3.5 h-3.5" style={{ color: c.scoreGreen }} /></div>
                                    <span className="text-xs font-medium" style={{ color: c.textSecondary }}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {analysis.analysisDetails && (analysis.analysisDetails.topPositives || analysis.analysisDetails.topNegatives) && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>OPINIÃO DOS CLIENTES</h3>
                        {analysis.analysisDetails.topPositives && analysis.analysisDetails.topPositives.length > 0 && (
                            <div className="mb-3">
                                <div className="rounded-2xl p-4" style={{ background: `${c.scoreGreen}0d`, border: `1px solid ${c.scoreGreen}33` }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 rounded-lg" style={{ background: `${c.scoreGreen}33` }}><TrendingUp className="w-3.5 h-3.5" style={{ color: c.scoreGreen }} /></div>
                                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: c.scoreGreen }}>Pontos Fortes</span>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {analysis.analysisDetails.topPositives.map((positive, index) => (
                                            <li key={index} className="text-xs flex items-start gap-2.5 leading-relaxed" style={{ color: c.textSecondary }}>
                                                <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: c.scoreGreen }} /><span>{positive}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {analysis.analysisDetails.topNegatives && analysis.analysisDetails.topNegatives.length > 0 && (
                            <div>
                                <div className="rounded-2xl p-4" style={{ background: `${c.scoreRed}0d`, border: `1px solid ${c.scoreRed}33` }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 rounded-lg" style={{ background: `${c.scoreRed}33` }}><TrendingDown className="w-3.5 h-3.5" style={{ color: c.scoreRed }} /></div>
                                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: c.scoreRed }}>Pontos Negativos</span>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {analysis.analysisDetails.topNegatives.map((negative, index) => (
                                            <li key={index} className="text-xs flex items-start gap-2.5 leading-relaxed" style={{ color: c.textSecondary }}>
                                                <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: c.scoreRed }} /><span>{negative}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {analysis.analysisDetails?.returnPolicy && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>POLÍTICA DE RETORNO</h3>
                        <div className="rounded-2xl p-4" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                            <p className="text-xs leading-relaxed font-medium" style={{ color: c.textSecondary }}>{analysis.analysisDetails.returnPolicy}</p>
                        </div>
                    </div>
                )}

                {analysis.analysisDetails?.customerServiceRating !== undefined && (
                    <div className="mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>ATENDIMENTO</h3>
                        <div className="rounded-2xl p-4" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: c.progressTrack }}>
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(analysis.analysisDetails.customerServiceRating / 5) * 100}%`, background: c.progressGradientGreen, boxShadow: `0 0 8px ${c.scoreGreenGlow}` }} />
                                </div>
                                <span className="text-xs font-black" style={{ color: c.textPrimary }}>{analysis.analysisDetails.customerServiceRating}/5.0</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { ThemeColors } from '../themeColors';

function MetricCard({ icon, label, value, colors: c }: { icon: React.ReactNode; label: string; value: string; colors: ThemeColors }) {
    return (
        <div className="rounded-xl p-3" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
            <div className="flex items-center gap-2 mb-1.5" style={{ color: c.textMuted }}>{icon}<span className="text-xs">{label}</span></div>
            <p className="font-bold" style={{ color: c.textPrimary }}>{value}</p>
        </div>
    );
}
