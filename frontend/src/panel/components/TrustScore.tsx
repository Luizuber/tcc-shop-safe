import { RiskLevel } from '../../types/AnalysisResult';
import { ThemeColors } from '../themeColors';

interface TrustScoreProps {
    score: number;
    riskLevel: RiskLevel;
    size?: 'small' | 'large';
    colors: ThemeColors;
}

export function TrustScore({ score, riskLevel, size = 'large', colors }: TrustScoreProps) {
    const getScoreColor = () => {
        if (score >= 70) return colors.scoreGreen;
        if (score >= 40) return colors.scoreYellow;
        return colors.scoreRed;
    };

    const getGlowColor = () => {
        if (score >= 70) return colors.scoreGreenGlow;
        if (score >= 40) return colors.scoreYellowGlow;
        return colors.scoreRedGlow;
    };

    const getProgressGradient = () => {
        if (score >= 70) return colors.progressGradientGreen;
        if (score >= 40) return colors.progressGradientYellow;
        return colors.progressGradientRed;
    };

    const getRiskLabel = () => {
        switch (riskLevel) {
            case 'safe': return 'COMPRA SEGURA';
            case 'caution': return 'TENHA CUIDADO';
            case 'risk': return 'ALTO RISCO';
        }
    };

    // Hexagonal AI icon SVG
    const HexIcon = () => (
        <svg width={size === 'large' ? 48 : 28} height={size === 'large' ? 52 : 30} viewBox="0 0 48 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 2L44 14V38L24 50L4 38V14L24 2Z" stroke={getScoreColor()} strokeWidth="2" fill="none" filter="url(#glow)" />
            <path d="M24 10L38 18V34L24 42L10 34V18L24 10Z" stroke={getScoreColor()} strokeWidth="1.5" fill="rgba(0,229,160,0.05)" />
            <text x="24" y="29" textAnchor="middle" fill={getScoreColor()} fontSize="12" fontWeight="bold" fontFamily="monospace">AI</text>
            <defs>
                <filter id="glow" x="-4" y="-4" width="56" height="60">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor={getScoreColor()} floodOpacity="0.5" />
                    <feComposite in2="blur" operator="in" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
        </svg>
    );

    if (size === 'small') {
        return (
            <div className="rounded-xl p-3 border transition-colors" style={{ background: colors.bgCard, borderColor: colors.borderPrimary }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HexIcon />
                        <span className="text-xs font-black uppercase tracking-widest block" style={{ color: getScoreColor() }}>{getRiskLabel()}</span>
                    </div>
                    <span className="text-2xl font-black" style={{ color: getScoreColor(), textShadow: `0 0 20px ${getGlowColor()}` }}>{score}</span>
                </div>
                <div className="w-full rounded-full h-1.5 overflow-hidden mt-2" style={{ background: colors.progressTrack }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: getProgressGradient(), boxShadow: `0 0 8px ${getGlowColor()}` }} />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl p-5 border transition-all" style={{ background: colors.bgCard, borderColor: colors.borderPrimary, boxShadow: `0 0 30px ${colors.accentGlow}` }}>
            <div className="flex flex-col items-center justify-center mb-4">
                <div className="mb-2"><HexIcon /></div>
                <div className="text-6xl font-black tracking-tighter" style={{ color: getScoreColor(), textShadow: `0 0 30px ${getGlowColor()}, 0 0 60px ${getGlowColor()}` }}>{score}</div>
                <div className="text-sm font-black mt-1 uppercase tracking-[0.2em]" style={{ color: getScoreColor() }}>{getRiskLabel()}</div>
            </div>
            <div className="w-full rounded-full h-3.5 overflow-hidden p-[3px]" style={{ background: colors.progressTrack, border: `1px solid ${colors.borderSubtle}`, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: getProgressGradient(), boxShadow: `0 0 12px ${getGlowColor()}` }} />
            </div>
        </div>
    );
}
