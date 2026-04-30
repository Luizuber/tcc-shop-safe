// Centralized color palette for light and dark themes
export interface ThemeColors {
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgCard: string;
    bgCardHover: string;
    bgHeader: string;
    bgFooter: string;

    // Borders
    borderPrimary: string;
    borderSubtle: string;
    borderAccent: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textLabel: string;

    // Accent
    accent: string;
    accentSubtle: string;
    accentGlow: string;

    // Score colors
    scoreGreen: string;
    scoreYellow: string;
    scoreRed: string;
    scoreGreenGlow: string;
    scoreYellowGlow: string;
    scoreRedGlow: string;

    // Progress bar
    progressTrack: string;
    progressGradientGreen: string;
    progressGradientYellow: string;
    progressGradientRed: string;

    // Buttons
    btnPrimaryBg: string;
    btnPrimaryBorder: string;
    btnPrimaryGlow: string;

    // Warning colors
    warningBg: string;
    warningBorder: string;
    warningText: string;

    // Price cards
    priceCardBg: string;
    priceCardBorder: string;
    priceGreen: string;

    // Panel container
    panelBorder: string;
    panelShadow: string;

    // Floating button
    floatingBg: string;
    floatingBorder: string;
    floatingGlow: string;
    floatingIcon: string;

    // Badge
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;

    // Toggle
    toggleOn: string;
    toggleOff: string;
    toggleGlow: string;

    // Scrollbar
    scrollThumb: string;
    scrollThumbHover: string;
}

export const darkColors: ThemeColors = {
    bgPrimary: 'linear-gradient(180deg, #0a1428 0%, #060e1f 100%)',
    bgSecondary: 'rgba(10, 20, 45, 0.7)',
    bgCard: 'rgba(10, 20, 45, 0.7)',
    bgCardHover: 'rgba(0, 180, 212, 0.05)',
    bgHeader: 'rgba(10, 20, 45, 0.95)',
    bgFooter: 'rgba(10, 20, 45, 0.95)',

    borderPrimary: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 80%)',
    borderSubtle: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 85%)',
    borderAccent: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 70%)',

    textPrimary: '#e0e6f0',
    textSecondary: '#8a9ab5',
    textMuted: '#5a6a82',
    textLabel: '#cdd9e5',

    accent: 'var(--host-accent, #00b8d4)',
    accentSubtle: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 85%)',
    accentGlow: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 90%)',

    scoreGreen: '#00e5a0',
    scoreYellow: '#f5a623',
    scoreRed: '#ff4d6a',
    scoreGreenGlow: 'rgba(0, 229, 160, 0.4)',
    scoreYellowGlow: 'rgba(245, 166, 35, 0.4)',
    scoreRedGlow: 'rgba(255, 77, 106, 0.4)',

    progressTrack: 'rgba(255,255,255,0.08)',
    progressGradientGreen: 'linear-gradient(90deg, #00b8d4, #00e5a0)',
    progressGradientYellow: 'linear-gradient(90deg, #f5a623, #f7c948)',
    progressGradientRed: 'linear-gradient(90deg, #ff4d6a, #ff6b81)',

    btnPrimaryBg: 'linear-gradient(135deg, #0a2a5c 0%, #0d1f44 100%)',
    btnPrimaryBorder: 'rgba(0, 180, 212, 0.3)',
    btnPrimaryGlow: '0 0 15px rgba(0, 180, 212, 0.1), inset 0 1px 0 rgba(0, 180, 212, 0.2)',

    warningBg: 'rgba(255, 77, 106, 0.1)',
    warningBorder: 'rgba(255, 77, 106, 0.3)',
    warningText: '#ff6b81',

    priceCardBg: 'rgba(0, 229, 160, 0.05)',
    priceCardBorder: 'rgba(0, 229, 160, 0.2)',
    priceGreen: '#00e5a0',

    panelBorder: '1px solid rgba(0, 180, 212, 0.25)',
    panelShadow: '0 0 40px rgba(0, 180, 212, 0.08), 0 20px 60px rgba(0,0,0,0.5)',

    floatingBg: 'linear-gradient(135deg, #0a2a5c, #0d1f44)',
    floatingBorder: '1px solid color-mix(in srgb, var(--host-accent, #00b8d4), transparent 60%)',
    floatingGlow: '0 0 20px color-mix(in srgb, var(--host-accent, #00b8d4), transparent 70%)',
    floatingIcon: 'var(--host-accent, #00b8d4)',

    badgeBg: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 85%)',
    badgeBorder: '1px solid color-mix(in srgb, var(--host-accent, #00b8d4), transparent 70%)',
    badgeText: 'var(--host-accent, #00b8d4)',

    toggleOn: 'var(--host-accent, #00b8d4)',
    toggleOff: 'rgba(255,255,255,0.1)',
    toggleGlow: '0 0 10px color-mix(in srgb, var(--host-accent, #00b8d4), transparent 70%)',

    scrollThumb: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 70%)',
    scrollThumbHover: 'color-mix(in srgb, var(--host-accent, #00b8d4), transparent 50%)',
};

export const lightColors: ThemeColors = {
    bgPrimary: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)', // soft gray-slate gradient
    bgSecondary: 'rgba(241, 245, 249, 0.9)',
    bgCard: '#f8fafc', // very light slate
    bgCardHover: 'rgba(14, 165, 233, 0.08)',
    bgHeader: '#f1f5f9',
    bgFooter: '#f1f5f9',

    borderPrimary: 'rgba(15, 23, 42, 0.1)',
    borderSubtle: 'rgba(15, 23, 42, 0.05)',
    borderAccent: 'color-mix(in srgb, var(--host-accent, #0284c7), transparent 70%)',

    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    textLabel: '#1e293b',

    accent: 'var(--host-accent, #0284c7)',
    accentSubtle: 'color-mix(in srgb, var(--host-accent, #0284c7), transparent 90%)',
    accentGlow: 'color-mix(in srgb, var(--host-accent, #0284c7), transparent 92%)',

    scoreGreen: '#059669',
    scoreYellow: '#d97706',
    scoreRed: '#dc2626',
    scoreGreenGlow: 'rgba(5, 150, 105, 0.2)',
    scoreYellowGlow: 'rgba(217, 119, 6, 0.2)',
    scoreRedGlow: 'rgba(220, 38, 38, 0.2)',

    progressTrack: 'rgba(15, 23, 42, 0.08)',
    progressGradientGreen: 'linear-gradient(90deg, #059669, #10b981)',
    progressGradientYellow: 'linear-gradient(90deg, #d97706, #f59e0b)',
    progressGradientRed: 'linear-gradient(90deg, #dc2626, #ef4444)',

    btnPrimaryBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    btnPrimaryBorder: 'rgba(2, 132, 199, 0.5)',
    btnPrimaryGlow: '0 4px 14px rgba(2, 132, 199, 0.25)',

    warningBg: 'rgba(220, 38, 38, 0.08)',
    warningBorder: 'rgba(220, 38, 38, 0.25)',
    warningText: '#b91c1c',

    priceCardBg: 'rgba(5, 150, 105, 0.08)',
    priceCardBorder: 'rgba(5, 150, 105, 0.25)',
    priceGreen: '#047857',

    panelBorder: '1px solid rgba(15, 23, 42, 0.12)',
    panelShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.05)',

    floatingBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
    floatingBorder: '1px solid color-mix(in srgb, var(--host-accent, #0284c7), transparent 50%)',
    floatingGlow: '0 4px 20px color-mix(in srgb, var(--host-accent, #0284c7), transparent 70%)',
    floatingIcon: '#ffffff',

    badgeBg: 'color-mix(in srgb, var(--host-accent, #0284c7), transparent 90%)',
    badgeBorder: '1px solid color-mix(in srgb, var(--host-accent, #0284c7), transparent 80%)',
    badgeText: 'var(--host-accent, #0284c7)',

    toggleOn: 'var(--host-accent, #0284c7)',
    toggleOff: 'rgba(15, 23, 42, 0.15)',
    toggleGlow: '0 0 8px color-mix(in srgb, var(--host-accent, #0284c7), transparent 80%)',

    scrollThumb: 'color-mix(in srgb, var(--host-accent, #0284c7), transparent 80%)',
    scrollThumbHover: 'color-mix(in srgb, var(--host-accent, #0284c7), transparent 65%)',
};

export function getColors(theme: 'light' | 'dark'): ThemeColors {
    return theme === 'dark' ? darkColors : lightColors;
}
