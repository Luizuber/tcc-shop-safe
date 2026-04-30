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
    // 1. Check meta theme-color (Standard way for mobile/browsers)
    const themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
    if (themeColor) return themeColor;

    // 2. Try to find main header or logo color (Common for e-commerces)
    const header = document.querySelector('header');
    if (header) {
        const bg = window.getComputedStyle(header).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'rgb(255, 255, 255)' && bg !== 'rgb(0, 0, 0)') {
            return bg;
        }
    }

    // 3. Try to find primary button color
    const primaryBtn = document.querySelector('button[class*="primary"], a[class*="primary"], .btn-primary, .button-primary');
    if (primaryBtn) {
        return window.getComputedStyle(primaryBtn).backgroundColor;
    }

    // Fallback: Default Cyberpunk Cyan/Blue
    return '#00b8d4';
}
