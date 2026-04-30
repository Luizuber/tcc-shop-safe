import { AlertTriangle, DollarSign, TrendingDown, Clock, Star } from 'lucide-react';
import { Warning } from '../../types/AnalysisResult';
import { ThemeColors } from '../themeColors';

interface WarningBadgeProps {
    warning: Warning;
    colors: ThemeColors;
}

export function WarningBadge({ warning, colors }: WarningBadgeProps) {
    const getIcon = () => {
        switch (warning.type) {
            case 'high-risk': return <AlertTriangle className="w-4 h-4" />;
            case 'suspicious-price': return <DollarSign className="w-4 h-4" />;
            case 'low-reputation': return <Star className="w-4 h-4" />;
            case 'new-store': return <Clock className="w-4 h-4" />;
            case 'poor-reviews': return <TrendingDown className="w-4 h-4" />;
            case 'counterfeit-risk': return <AlertTriangle className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const getColor = () => {
        switch (warning.type) {
            case 'high-risk':
                return { bg: `${colors.scoreRed}14`, border: `${colors.scoreRed}40`, text: colors.scoreRed, icon: colors.scoreRed };
            case 'suspicious-price':
                return { bg: `${colors.scoreYellow}14`, border: `${colors.scoreYellow}40`, text: colors.scoreYellow, icon: colors.scoreYellow };
            case 'low-reputation':
                return { bg: `${colors.scoreYellow}14`, border: `${colors.scoreYellow}40`, text: colors.scoreYellow, icon: colors.scoreYellow };
            case 'new-store':
                return { bg: `${colors.accent}14`, border: `${colors.accent}40`, text: colors.accent, icon: colors.accent };
            case 'poor-reviews':
                return { bg: `${colors.scoreRed}14`, border: `${colors.scoreRed}40`, text: colors.scoreRed, icon: colors.scoreRed };
            case 'counterfeit-risk':
                return { bg: `${colors.scoreRed}26`, border: `${colors.scoreRed}80`, text: colors.scoreRed, icon: colors.scoreRed };
            default:
                return { bg: `${colors.accent}14`, border: `${colors.accent}40`, text: colors.textSecondary, icon: colors.textMuted };
        }
    };

    const c = getColor();

    return (
        <div className="rounded-xl p-3 transition-all" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0" style={{ color: c.icon }}>{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] mb-0.5 uppercase tracking-tight" style={{ color: c.text }}>{warning.label}</div>
                    <div className="text-[11px] leading-snug font-medium" style={{ color: colors.textMuted }}>{warning.description}</div>
                </div>
            </div>
        </div>
    );
}
