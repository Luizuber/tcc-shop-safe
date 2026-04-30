import { useTheme } from '../context/ThemeContext';
import { getColors } from '../themeColors';

interface PromotionPlateProps {
    messages?: string[];
    speed?: number; // duration in seconds
}

// Cyberpunk Shield Icon (Logo)
const CyberShield = ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7V12C3 17.25 6.75 22.08 12 23C17.25 22.08 21 17.25 21 12V7L12 2Z"
            stroke={color} strokeWidth="2" fill={`${color}33`} />
        <path d="M12 6L9 8V12.5C9 14.5 10.5 16.5 12 17.5C13.5 16.5 15 14.5 15 12.5V8L12 6Z"
            stroke={color} strokeWidth="1.5" />
    </svg>
);

const DEFAULT_MESSAGES = [
    "ECONOMIZE COM INTELIGÊNCIA USANDO SHOP SAFE AI",
    "CONFIRA AS MELHORES OPORTUNIDADES",
    "COMPARE PREÇOS E TOME DECISÕES SEGURAS",
    "ENCONTRE MELHORES OFERTAS COM SHOP SAFE AI",
    "PROTEÇÃO E ECONOMIA EM UM SÓ LUGAR"
];

export function PromotionPlate({ messages = DEFAULT_MESSAGES, speed = 15 }: PromotionPlateProps) {
    const { theme } = useTheme();
    const c = getColors(theme);
    const combinedMessage = messages.join(' • ');

    return (
        <div className="ssa-promo-plate group">
            {/* Logo Fixa */}
            <div className="ssa-promo-logo">
                <CyberShield color={theme === 'dark' ? '#ffffff' : c.accent} />
            </div>

            {/* Letreiro Deslizante */}
            <div className="ssa-promo-ticker">
                <div className="ssa-promo-text" style={{ animationDuration: `${speed}s`, color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : c.textPrimary }}>
                    <span>{combinedMessage}</span>
                    <span>{combinedMessage}</span>
                </div>
            </div>
        </div>
    );
}
