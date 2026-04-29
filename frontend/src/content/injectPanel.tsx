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
