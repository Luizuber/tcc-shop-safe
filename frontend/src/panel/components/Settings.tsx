import { ArrowLeft, Bell, Shield, Eye, Info, Minus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { getColors } from '../themeColors';

interface SettingsProps {
    onBack: () => void;
    onMinimize: () => void;
}

export function Settings({ onBack, onMinimize }: SettingsProps) {
    const { theme, toggleTheme } = useTheme();
    const c = getColors(theme);
    const {
        autoAnalysis, showWarnings, notifications, minTrustScore, maxPriceDiscount,
        updateAutoAnalysis, updateShowWarnings, updateNotifications, updateMinTrustScore, updateMaxPriceDiscount
    } = useSettings();

    const hoverBtn = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
        e.currentTarget.style.background = enter ? c.accentSubtle : 'transparent';
    };

    return (
        <div className="h-full flex flex-col transition-colors" style={{ background: c.bgPrimary, color: c.textPrimary }}>
            <div className="flex items-center justify-between px-4 py-3 ssa-drag-handle cursor-grab active:cursor-grabbing relative overflow-hidden" style={{ background: c.bgHeader, borderBottom: `1px solid ${c.borderPrimary}` }}>
                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-32 h-full opacity-20 blur-xl pointer-events-none" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}></div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <button onClick={onBack} className="p-2 rounded-lg transition-all" style={{ color: theme === 'dark' ? '#ffffff' : c.textMuted }} onMouseEnter={e => hoverBtn(e, true)} onMouseLeave={e => hoverBtn(e, false)} aria-label="Voltar"><ArrowLeft className="w-4 h-4" /></button>
                    <h1 className="font-bold uppercase tracking-tight" style={{ color: theme === 'dark' ? '#ffffff' : c.textLabel }}>Configurações</h1>
                </div>
                <button onClick={onMinimize} className="p-2 rounded-lg transition-all relative z-10" style={{ color: theme === 'dark' ? '#ffffff' : c.textMuted }} onMouseEnter={e => hoverBtn(e, true)} onMouseLeave={e => hoverBtn(e, false)} aria-label="Minimizar"><Minus className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>APARÊNCIA</h3>
                    <div className="rounded-2xl overflow-hidden" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                        <SettingToggle
                            icon={theme === 'dark' ? <Moon className="w-5 h-5" style={{ color: c.accent }} /> : <Sun className="w-5 h-5" style={{ color: '#f59e0b' }} />}
                            label="Modo Escuro" description="Alternar entre temas claro e escuro" checked={theme === 'dark'} onChange={toggleTheme} colors={c} />
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>ANÁLISE</h3>
                    <div className="rounded-2xl overflow-hidden" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                        <SettingToggle icon={<Shield className="w-5 h-5" style={{ color: c.accent }} />} label="Análise Automática" description="Analisar lojas automaticamente ao navegar" checked={autoAnalysis} onChange={updateAutoAnalysis} colors={c} />
                        <div style={{ borderTop: `1px solid ${c.borderSubtle}` }} />
                        <SettingToggle icon={<Eye className="w-5 h-5" style={{ color: c.accent }} />} label="Exibir Alertas" description="Mostrar selos de alerta para problemas detectados" checked={showWarnings} onChange={updateShowWarnings} colors={c} />
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>NOTIFICAÇÕES</h3>
                    <div className="rounded-2xl overflow-hidden" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                        <SettingToggle icon={<Bell className="w-5 h-5" style={{ color: c.accent }} />} label="Ativar Notificações" description="Receba avisos sobre lojas de risco" checked={notifications} onChange={updateNotifications} colors={c} />
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>LIMITE DE CONFIANÇA</h3>
                    <div className="rounded-2xl p-4" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium" style={{ color: c.textSecondary }}>Pontuação mínima para avisos</span>
                            <span className="text-xl font-black" style={{ color: c.accent }}>{minTrustScore}</span>
                        </div>
                        <input type="range" min="0" max="100" value={minTrustScore} onChange={(e) => updateMinTrustScore(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: c.progressTrack, accentColor: c.accent }} />
                        <p className="text-[10px] mt-4 leading-relaxed" style={{ color: c.textMuted }}>
                            Você será avisado se a pontuação de confiança da loja for inferior a <strong style={{ color: c.accent }}>{minTrustScore}</strong>.
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>RISCO DE FALSIFICAÇÃO</h3>
                    <div className="rounded-2xl p-4" style={{ background: c.bgCard, border: `1px solid ${c.borderSubtle}` }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium" style={{ color: c.textSecondary }}>Alerta de preço irreal</span>
                            <span className="text-xl font-black" style={{ color: c.scoreRed }}>{maxPriceDiscount}%</span>
                        </div>
                        <input type="range" min="10" max="80" step="5" value={maxPriceDiscount} onChange={(e) => updateMaxPriceDiscount(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: c.progressTrack, accentColor: c.scoreRed }} />
                        <p className="text-[10px] mt-4 leading-relaxed" style={{ color: c.textMuted }}>
                            Você será avisado se o preço estiver <strong style={{ color: c.scoreRed }}>{maxPriceDiscount}%</strong> ou mais abaixo da média de mercado (possível item não original).
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>SOBRE</h3>
                    <div className="rounded-2xl p-5" style={{ background: c.accentSubtle, border: `1px solid ${c.borderAccent}` }}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl" style={{ background: c.accentSubtle }}><Info className="w-4 h-4" style={{ color: c.accent }} /></div>
                            <div>
                                <p className="text-xs mb-2 leading-relaxed font-medium" style={{ color: c.textSecondary }}>
                                    O <strong style={{ color: c.accent }}>Shop Safe AI</strong> utiliza inteligência artificial para analisar lojas online e garantir sua segurança.
                                </p>
                                <p className="text-[10px] font-bold" style={{ color: c.textMuted }}>Versão 1.0.0 • Projeto Acadêmico (TCC)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl p-4 mb-4" style={{ background: c.bgSecondary, border: `1px solid ${c.borderSubtle}` }}>
                    <p className="text-[10px] leading-relaxed text-center font-medium" style={{ color: c.textMuted }}>
                        Esta extensão analisa informações públicas de lojas online. Nenhum dado pessoal é coletado ou armazenado.
                    </p>
                </div>
            </div>
        </div>
    );
}

import { ThemeColors } from '../themeColors';

function SettingToggle({ icon, label, description, checked, onChange, colors: c }: {
    icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: (checked: boolean) => void; colors: ThemeColors;
}) {
    return (
        <div className="flex items-start gap-4 p-4 transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = c.accentSubtle)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="mt-1 p-2 rounded-xl" style={{ background: c.accentSubtle }}>{icon}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold" style={{ color: c.textLabel }}>{label}</span>
                    <button onClick={() => onChange(!checked)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-all"
                        style={{ background: checked ? c.toggleOn : c.toggleOff, boxShadow: checked ? c.toggleGlow : 'none' }} role="switch" aria-checked={checked}>
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md" style={{ transform: checked ? 'translateX(22px)' : 'translateX(4px)' }} />
                    </button>
                </div>
                <p className="text-[10px] font-medium leading-tight" style={{ color: c.textMuted }}>{description}</p>
            </div>
        </div>
    );
}
