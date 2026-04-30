import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
    autoAnalysis: boolean;
    showWarnings: boolean;
    notifications: boolean;
    minTrustScore: number;
    maxPriceDiscount: number;
}

interface SettingsContextType extends Settings {
    isReady: boolean;
    updateAutoAnalysis: (value: boolean) => void;
    updateShowWarnings: (value: boolean) => void;
    updateNotifications: (value: boolean) => void;
    updateMinTrustScore: (value: number) => void;
    updateMaxPriceDiscount: (value: number) => void;
}

const DEFAULT_SETTINGS: Settings = {
    autoAnalysis: true,
    showWarnings: true,
    notifications: true,
    minTrustScore: 50,
    maxPriceDiscount: 30,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load settings from chrome.storage.local
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
            }
            setIsReady(true);
        });
    }, []);

    const updateSettings = (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        chrome.storage.local.set({ settings: updated });
    };

    const value: SettingsContextType = {
        ...settings,
        isReady,
        updateAutoAnalysis: (autoAnalysis) => updateSettings({ autoAnalysis }),
        updateShowWarnings: (showWarnings) => updateSettings({ showWarnings }),
        updateNotifications: (notifications) => updateSettings({ notifications }),
        updateMinTrustScore: (minTrustScore) => updateSettings({ minTrustScore }),
        updateMaxPriceDiscount: (maxPriceDiscount) => updateSettings({ maxPriceDiscount }),
    };

    return (
        <SettingsContext.Provider value={value}>
            {isReady ? children : null}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
