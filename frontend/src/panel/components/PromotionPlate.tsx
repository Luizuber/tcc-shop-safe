import { useTheme } from '../context/ThemeContext';
import { getColors } from '../themeColors';

interface PromotionPlateProps {
    messages?: string[];
    speed?: number; // duration in seconds
}

const DEFAULT_MESSAGES = [
    "ECONOMIZE COM INTELIGÊNCIA USANDO SHOP SAFE AI",
    "CONFIRA AS MELHORES OPORTUNIDADES",
    "COMPARE PREÇOS E TOME DECISÕES SEGURAS",
    "ENCONTRE MELHORES OFERTAS COM SHOP SAFE AI",
    "PROTEÇÃO E ECONOMIA EM UM SÓ LUGAR"
];

export function PromotionPlate({ messages = DEFAULT_MESSAGES, speed = 15 }: PromotionPlateProps) {
    const { theme } = useTheme();
    const combinedMessage = messages.join(' • ');

    return (
        <div className="ssa-promo-plate group">
            {/* Letreiro Deslizante */}
            <div className="ssa-promo-ticker">
                <div className="ssa-promo-text" style={{ animationDuration: `${speed}s`, color: 'var(--host-accent, #00b8d4)' }}>
                    <span>{combinedMessage}</span>
                    <span>{combinedMessage}</span>
                </div>
            </div>
        </div>
    );
}
