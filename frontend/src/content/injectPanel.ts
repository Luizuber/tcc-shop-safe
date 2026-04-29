
function isProductPage(): boolean {
  const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
  if (ogType === 'product') return true;

  if (document.querySelector('[itemprop="price"]')) return true;

  const ldJson = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of Array.from(ldJson)) {
    if (script.textContent?.includes('"@type": "Product"') || script.textContent?.includes('"@type":"Product"')) {
      return true;
    }
  }

  const url = window.location.href.toLowerCase();
  const productPatterns = ['/p/', '/produto/', '/product/', '/dp/', '/item/'];
  if (productPatterns.some(p => url.includes(p))) return true;

  return false;
}

function parsePriceString(str: string | null | undefined): number {
  if (!str) return 0;
  // Remove R$, espaços e caracteres inúteis, mantendo apenas dígitos, pontos e vírgulas
  let clean = str.replace(/[^\d.,]/g, '').trim();
  if (!clean) return 0;

  // Lógica de Detecção de Padrão (Brasileiro vs Internacional)
  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');

  // Se houver ambos, o último é o decimal
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // Padrão BR: 1.234,56
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    } else {
      // Padrão US/Outros: 1,234.56
      return parseFloat(clean.replace(/,/g, ''));
    }
  }

  // Se houver apenas vírgula: sempre decimal (ex: 3499,00)
  if (lastComma !== -1) {
    return parseFloat(clean.replace(',', '.'));
  }

  // Se houver apenas ponto: pode ser 1.000 ou 10.99
  if (lastDot !== -1) {
    const parts = clean.split('.');
    // No e-commerce BR, se terminar em 3 dígitos após o ponto, é quase certeza ser milhar
    // Especialmente para valores altos como Notebooks/iPhones
    if (parts[parts.length - 1].length === 3) {
      return parseFloat(clean.replace(/\./g, ''));
    }
    // Caso contrário (ex: 10.99), trata como decimal
    return parseFloat(clean);
  }

  return parseFloat(clean);
}

function getAmazonPrice(): number {
  const productTitle = (document.querySelector('h1')?.textContent || '').toLowerCase();
  const isHighValueItem = /notebook|laptop|pc gamer|iphone|macbook|console|playstation|xbox|smartphone|geladeira|tv/i.test(productTitle);

  const validate = (val: number, isHighConfidence: boolean = false) => {
    // Se for um seletor de alta confiança como o accessibility-label da Amazon, 
    // diminuímos o piso pois é improvável ser parcela.
    const floor = isHighConfidence ? 20 : 500;
    if (isHighValueItem && val < floor && val > 0) return 0;
    return val > 10 ? val : 0;
  };

  // 1. Prioridade Máxima: Accessibility Label (Especialmente estável na Amazon BR)
  // Mudamos para o topo para não depender do #centerCol estar carregado ou ter o ID correto
  const accessibilityLabel = document.querySelector('#apex-pricetopay-accessibility-label');
  if (accessibilityLabel) {
    const attrPrice = accessibilityLabel.getAttribute('data-pricetopay-label');
    const val = validate(parsePriceString(attrPrice || accessibilityLabel.textContent), true);
    if (val > 0) return val;
  }

  const centerCol = document.querySelector('#centerCol') || document.querySelector('#buybox') || document.querySelector('#corePriceDisplay_desktop_feature_div');
  if (!centerCol) return 0;

  // 2. Composição: Whole + Fraction
  const priceContainer = centerCol.querySelector('.a-price');
  const whole = priceContainer?.querySelector('.a-price-whole');
  const fraction = priceContainer?.querySelector('.a-price-fraction');
  if (whole) {
    const wholeVal = whole.textContent?.replace(/[^\d]/g, '') || '';
    const fractionVal = fraction?.textContent?.replace(/[^\d]/g, '') || '00';
    const val = validate(parseFloat(`${wholeVal}.${fractionVal}`));
    if (val > 0) return val;
  }

  // 3. Fallback: Offscreen span
  const offscreen = centerCol.querySelector('.a-price > .a-offscreen');
  if (offscreen?.textContent) {
    const val = validate(parsePriceString(offscreen.textContent));
    if (val > 0) return val;
  }

  return 0;
}

function getProductPrice(): number {
  const isAmazon = window.location.hostname.includes('amazon');

  // Especial para Amazon
  if (isAmazon) {
    const amzPrice = getAmazonPrice();
    if (amzPrice > 10) return amzPrice;
  }

  // 1. DADOS ESTRUTURADOS (PRIORIDADE MÁXIMA)
  const ldJson = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of Array.from(ldJson)) {
    try {
      const data = JSON.parse(script.textContent || '');
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const type = item['@type'];
        if (type === 'Product' || type === 'Offer' || type === 'ProductModel') {
          const price = item.offers?.price || item.price || (Array.isArray(item.offers) ? item.offers[0]?.price : item.offers?.price);
          if (price) {
            const val = parsePriceString(String(price));
            if (val > 10) return val;
          }
        }
      }
    } catch (e) { }
  }

  // 2. SELETORES ESPECIFICOS (MERCADO LIVRE, ETC)
  const specificSelectors = [
    '.ui-pdp-price__second-line .andes-money-amount__fraction', // Mercado Livre
    '[data-testid="price-value"]',
    '.price-tag-fraction'
  ];

  for (const selector of specificSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const val = parsePriceString(el.textContent);
      if (val > 10) return val;
    }
  }

  // 3. EXTRAÇÃO DOM SEMÂNTICA COM FILTRO DE PARCELA RIGOROSO
  const priceElements = Array.from(document.querySelectorAll('[class*="price"], [class*="valor"], [class*="preco"], [itemprop="price"]'));
  const candidates: number[] = [];

  for (const el of priceElements) {
    const htmlEl = el as HTMLElement;
    const text = htmlEl.textContent?.trim();
    if (!text || text.length > 30) continue;

    const parentText = htmlEl.parentElement?.textContent?.toLowerCase() || '';
    const fullContext = (text + ' ' + parentText).toLowerCase();

    // Verificação de parcelamento por proximidade (apenas se o valor for pequeno)
    const val = parsePriceString(text);
    const isSmallValue = val < 1000;

    // Filtros de parcelamento (extremamente agressivo APENAS se o valor for pequeno)
    const isInstallment = isSmallValue && /x\s?de|até|vezes|parcelado|parcelas|no\scartão|mensais|por\smês|preço\sparcela/i.test(fullContext);
    if (isInstallment) continue;

    // Verificação de Razoabilidade (Floor heurístico)
    // Se o nome do produto indica algo caro (Notebook, Console, iPhone) e o preço é muito baixo (< 200), 
    // provavelmente é uma parcela que escapou dos filtros.
    const productTitle = (document.querySelector('h1')?.textContent || '').toLowerCase();
    const isHighValueItem = /notebook|laptop|pc gamer|iphone|macbook|console|playstation|xbox|smartphone|geladeira|tv/i.test(productTitle);

    if (isHighValueItem && val < 500 && val > 0) {
      // Ignora este valor, é certamente uma parcela ou valor de frete/acessório
      continue;
    }

    if (val > 10 && val < 1000000) {
      candidates.push(val);
    }
  }

  if (candidates.length > 0) {
    // Ordena do maior para o menor para garantir que pegamos o preço total (normalmente o maior valor na tela)
    candidates.sort((a, b) => b - a);
    return candidates[0];
  }

  // 4. HEURISTICA FINAL (Com verificação de razoabilidade)
  const bodyText = document.body.innerText;
  const priceRegex = /R\$\s?(\d{1,3}(\.\d{3})*(,\d{2})|\d+(,\d{2})?)/g;
  const matches = bodyText.match(priceRegex);
  if (matches) {
    const productTitle = (document.querySelector('h1')?.textContent || '').toLowerCase();
    const isHighValueItem = /notebook|laptop|pc gamer|iphone|macbook|console|playstation|xbox|smartphone|geladeira|tv/i.test(productTitle);

    const validPrices = matches
      .map(m => parsePriceString(m))
      .filter(v => {
        if (isHighValueItem && v < 500 && v > 0) return false;
        return v > 10;
      })
      .sort((a, b) => b - a);
    if (validPrices.length > 0) return validPrices[0];
  }

  return 0;
}

function getProductData() {
  const title =
    document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.title;

  const price = getProductPrice();

  const seller =
    document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
    window.location.hostname.replace('www.', '');

  return {
    productName: title,
    price,
    seller,
    productUrl: window.location.href
  };
}

let lastSentData = '';
function sendDataToIframe(iframe: HTMLIFrameElement) {
  const data = getProductData();
  const dataStr = JSON.stringify(data);

  if (dataStr !== lastSentData) {
    lastSentData = dataStr;
    console.log("ShopSafeAI Dados Extraídos:", data);
    iframe.contentWindow?.postMessage({
      type: 'SSA_PRODUCT_DATA',
      payload: data
    }, '*');
  }
}

if (isProductPage() && !document.getElementById("shop-safe-panel")) {
  const panel = document.createElement("div");
  panel.id = "shop-safe-panel";

  panel.innerHTML = `
    <iframe 
      id="ssa-iframe"
      src="${chrome.runtime.getURL("index.html")}"
      style="
        width: 100%;
        height: 100%;
        border: none;
      "
    ></iframe>
  `;

  document.body.appendChild(panel);

  const iframe = panel.querySelector('iframe') as HTMLIFrameElement;
  if (iframe) {
    iframe.onload = () => {
      sendDataToIframe(iframe);

      // MutationObserver para capturar trocas de variantes (preço dinâmico)
      const observer = new MutationObserver((mutations) => {
        let shouldRefresh = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const target = mutation.target as HTMLElement;
            if (target.id?.includes('price') || target.className?.includes('price') || target.tagName === 'H1') {
              shouldRefresh = true;
              break;
            }
          }
        }

        if (shouldRefresh) {
          sendDataToIframe(iframe);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    };
  }

  const style = document.createElement("style");
  style.innerHTML = `
    #shop-safe-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      height: 100vh;
      z-index: 2147483647;
      box-shadow: -4px 0 12px rgba(0,0,0,0.15);
      background: transparent;
      transition: transform 0.3s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}
