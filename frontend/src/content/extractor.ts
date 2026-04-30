export function isProductPage(): boolean {
    console.log('[Shop Safe AI] Checking if product page...');
    const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
    if (ogType === 'product') {
        console.log('[Shop Safe AI] Detected via og:type');
        return true;
    }

    if (document.querySelector('[itemprop="price"]') || document.querySelector('[itemprop="offers"]')) {
        console.log('[Shop Safe AI] Detected via itemprop price/offers');
        return true;
    }

    const ldJson = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(ldJson)) {
        if (script.textContent?.includes('"@type": "Product"') || script.textContent?.includes('"@type":"Product"')) {
            console.log('[Shop Safe AI] Detected via LD+JSON Product');
            return true;
        }
    }

    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname;
    const isShopee = hostname.includes('shopee.com.br');

    const productPatterns = ['/p/', '/produto/', '/product/', '/dp/', '/item/', '/produtos/'];
    if (productPatterns.some(p => url.includes(p))) {
        console.log('[Shop Safe AI] Detected via URL pattern');
        return true;
    }

    if (isShopee && url.includes('-i.')) {
        console.log('[Shop Safe AI] Detected via Shopee specific pattern');
        return true;
    }

    console.log('[Shop Safe AI] Not a product page.');
    return false;
}

function getProductPrice(): number {
    // 1. DADOS ESTRUTURADOS (PRIORIDADE MÁXIMA)
    const ldJson = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(ldJson)) {
        try {
            const data = JSON.parse(script.textContent || '');
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
                if (item['@type'] === 'Product' || item['@type'] === 'Offer') {
                    const price = item.offers?.price || item.price;
                    if (price) {
                        const val = typeof price === 'string' ? parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) : parseFloat(price);
                        if (val > 0) return val;
                    }
                }
            }
        } catch (e) { }
    }

    const metaSelectors = [
        'meta[itemprop="price"]',
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]'
    ];
    for (const selector of metaSelectors) {
        const content = document.querySelector(selector)?.getAttribute('content');
        if (content) {
            const val = parseFloat(content.replace(/[^\d.,]/g, '').replace(',', '.'));
            if (val > 0) return val;
        }
    }

    const semanticSelectors = [
        '.a-price .a-offscreen',
        '#corePrice_feature_div .a-price-whole',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '#corePriceDisplay_desktop_feature_div .a-price-whole',
        '[itemprop="price"]',
        '[class*="price"]',
        '[class*="valor"]',
        '[class*="preco"]',
        '.andes-money-amount__fraction',
        '.vZ976u', // Shopee
        '.flex.items-center.G2747v' // Shopee alternate
    ];
    for (const selector of semanticSelectors) {
        const el = document.querySelector(selector);
        if (el) {
            const text = (el as HTMLElement).innerText || el.textContent;
            if (text) {
                // Remove R$, currency symbols and whitespace
                const clean = text.replace(/[^\d.,]/g, '').replace(',', '.');
                // Handle multiple dots (e.g. 1.234.56 -> 1234.56)
                const normalized = clean.includes('.') && (clean.match(/\./g) || []).length > 1
                    ? clean.replace(/\.(?=[^.]*\.)/g, '')
                    : clean;
                const val = parseFloat(normalized);
                if (val > 0 && val < 500000) return val;
            }
        }
    }

    const bodyText = document.body.innerText;
    const priceRegex = /R\$\s?\d{1,3}(\.\d{3})*(,\d{2})/g;
    const matches = bodyText.match(priceRegex);
    if (matches) {
        for (const match of matches) {
            const val = parseFloat(match.replace(/[^\d.,]/g, '').replace(',', '.'));
            if (val > 10) return val;
        }
    }

    return 0;
}

export function getProductData() {
    // 1. Amazon Specific (High Precision)
    const amazonTitle = document.querySelector('#productTitle');
    if (amazonTitle) {
        return {
            productName: amazonTitle.textContent?.trim(),
            price: getProductPrice(),
            seller: 'Amazon',
            productUrl: window.location.href
        };
    }

    // 2. Generic Selectors (Priority Order)
    const title =
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        document.querySelector('h1')?.textContent?.trim() ||
        document.title;

    // Clean up typical suffixes
    const cleanTitle = title
        .split(' - ')[0]
        .split(' | ')[0]
        .split(' : ')[0]
        .trim();

    const price = getProductPrice();

    const seller =
        document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
        window.location.hostname.replace('www.', '');

    return {
        productName: cleanTitle,
        price,
        seller,
        productUrl: window.location.href
    };
}
