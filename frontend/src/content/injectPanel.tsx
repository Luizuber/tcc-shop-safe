/// <reference types="chrome" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Panel } from '../panel/Panel';
// @ts-ignore
import tailwindStyles from '../globals.css?inline';
// @ts-ignore
import panelStyles from '../panel/Panel.css?inline';
import { isProductPage, getProductData } from './extractor';

const APP_ID = 'shop-safe-ai-root';

function inject() {
    console.log('[Shop Safe AI] Injecting panel...');
    if (!isProductPage()) return;
    if (document.getElementById(APP_ID)) return;

    const host = document.createElement('div');
    host.id = APP_ID;
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100vw';
    host.style.height = '100vh';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';

    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.backgroundColor = 'transparent';

    shadow.appendChild(container);

    const styleTag = document.createElement('style');
    // Combine Tailwind styles and our layout styles
    styleTag.textContent = (tailwindStyles as string) + '\n' + (panelStyles as string);
    shadow.appendChild(styleTag);

    // Get the host website's font-family to blend in naturally
    const hostFontFamily = window.getComputedStyle(document.body).fontFamily;
    container.style.setProperty('--host-font', hostFontFamily);

    // Extract primary color from the host site
    const hostAccent = extractPrimaryColor();
    container.style.setProperty('--host-accent', hostAccent);

    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <Panel />
        </React.StrictMode>
    );

    // Initial data send - wait for react mount
    setTimeout(() => {
        const data = getProductData();
        window.postMessage({
            type: 'SSA_PRODUCT_DATA',
            payload: data
        }, '*');
    }, 1000);

    // Listen for state changes from React to resize host
    window.addEventListener('message', (event) => {
        if (event.data.type === 'SSA_STATE_CHANGED') {
            // Keep host full viewport always - panel positions itself internally
        }
    });

    // Toggle logic for Keyboard Shortcut - forward to React
    chrome.runtime.onMessage.addListener((message: any) => {
        if (message.type === 'TOGGLE_PANEL') {
            window.postMessage({ type: 'TOGGLE_PANEL_INTERNAL' }, '*');
        }
    });

    host.style.display = 'block';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
} else {
    inject();
}

function extractPrimaryColor(): string {
    // Helper to check if a color is "vibrant" (not too close to white, black, or gray)
    const isVibrant = (color: string) => {
        if (!color || color === 'transparent' || color.includes('rgba(0, 0, 0, 0)')) return false;
        
        // Simple RGB to grayscale check
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            
            // Avoid pure white/black
            if ((r > 240 && g > 240 && b > 240) || (r < 20 && g < 20 && b < 20)) return false;
            
            // Avoid grays (where R, G, and B are very close)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            if (max - min < 30) return false; // Low saturation
        }
        return true;
    };

    // 1. Check meta theme-color
    const themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
    if (themeColor && themeColor !== '#ffffff' && themeColor !== '#000000') {
        console.log('[Shop Safe AI] Color from meta:', themeColor);
        return themeColor;
    }

    // 2. Scan "App Bar" and Header elements
    const appBarSelectors = [
        'header', '.header', '#header', 
        '.nav-bar', '.navbar', '.top-bar', 
        '.app-bar', '[class*="header"]', '[class*="nav"]'
    ];
    
    for (const selector of appBarSelectors) {
        const el = document.querySelector(selector);
        if (el) {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundColor;
            if (isVibrant(bg)) {
                console.log('[Shop Safe AI] Color from App Bar:', bg);
                return bg;
            }
            // If header is neutral, try its borders or prominent icons/text
            const border = style.borderBottomColor || style.borderTopColor;
            if (isVibrant(border)) return border;
        }
    }

    // 3. Scan Action Buttons (Add to cart / Buy)
    const actionSelectors = [
        'button[class*="buy"]', 'button[class*="comprar"]', 
        'button[class*="cart"]', 'button[class*="carrinho"]',
        '.btn-primary', '.button-primary', '.btn-main'
    ];
    
    for (const selector of actionSelectors) {
        const el = document.querySelector(selector);
        if (el) {
            const bg = window.getComputedStyle(el).backgroundColor;
            if (isVibrant(bg)) {
                console.log('[Shop Safe AI] Color from Action Button:', bg);
                return bg;
            }
        }
    }

    // Fallback: Default Cyberpunk Blue
    return '#00b8d4';
}
