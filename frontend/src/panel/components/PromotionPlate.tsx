

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
    const combinedMessage = messages.join('   •   ');

    return (
        <div className="ssa-promo-plate group overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '99px' }}>
            {/* Letreiro Deslizante */}
            <div className="ssa-promo-ticker flex items-center h-7 px-4">
                <div className="ssa-promo-text whitespace-nowrap flex gap-8" style={{ animation: `ssa-ticker ${speed}s linear infinite`, color: 'var(--host-accent, #00b8d4)' }}>
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase opacity-90">{combinedMessage}</span>
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase opacity-90">{combinedMessage}</span>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ssa-ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </div>
    );
}
