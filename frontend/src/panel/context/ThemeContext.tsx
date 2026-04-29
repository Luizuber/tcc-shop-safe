import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        // Load theme from chrome.storage.local
        chrome.storage.local.get(['theme'], (result) => {
            if (result.theme === 'light' || result.theme === 'dark') {
                setTheme(result.theme);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            }
        });
    }, []);

    useEffect(() => {
        // Apply theme class to root element (html)
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.remove('dark-mode');
        }
    }, [theme]);

    const toggleTheme = React.useCallback(() => {
        setTheme(prev => {
            const nextTheme = prev === 'light' ? 'dark' : 'light';
            chrome.storage.local.set({ theme: nextTheme });
            return nextTheme;
        });
    }, []);

    const contextValue = React.useMemo(() => ({
        theme,
        toggleTheme
    }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
