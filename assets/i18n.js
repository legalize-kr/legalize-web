(function () {
  "use strict";

  const STORAGE_KEY = "legalize-kr-locale";
  const locale = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ko" || saved === "en") return saved;
    } catch (_) {
      // Continue with the browser language when storage is unavailable.
    }
    return navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
  })();

  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;

  function pageName() {
    const path = window.location.pathname;
    if (path === "/") return "index.html";
    return path.endsWith("/")
      ? `${path.replace(/^\//, "")}index.html`
      : path.replace(/^\//, "");
  }

  function normalized(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function translatedText(value, translations) {
    const key = normalized(value);
    const replacement = translations[key];
    if (typeof replacement !== "string") return null;
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    return `${leading}${replacement}${trailing}`;
  }

  function translateTextNodes(translations) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!normalized(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (parent && parent.closest("script, style, pre, code, svg")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const replacement = translatedText(node.nodeValue, translations);
      if (replacement !== null) node.nodeValue = replacement;
    });
  }

  function translateAttributes(translations) {
    document.querySelectorAll("[aria-label], [alt], [title], [placeholder]").forEach((element) => {
      ["aria-label", "alt", "title", "placeholder"].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value && translations[value]) element.setAttribute(attribute, translations[value]);
      });
    });
  }

  function translateMetadata(metadata, attributes) {
    if (!metadata) return;
    if (metadata.title) document.title = metadata.title;
    const descriptions = document.querySelectorAll(
      'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',
    );
    descriptions.forEach((element) => {
      if (metadata.description) element.setAttribute("content", metadata.description);
    });
    ["og:title", "twitter:title"].forEach((name) => {
      const selector = name.startsWith("og:") ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      const element = document.querySelector(selector);
      if (element && metadata.title) element.setAttribute("content", metadata.title);
    });
    if (metadata.keywords) {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) keywords.setAttribute("content", metadata.keywords);
    }
    document
      .querySelectorAll('meta[property="og:image:alt"], meta[name="twitter:image:alt"]')
      .forEach((element) => {
        const value = element.getAttribute("content");
        if (value && attributes[value]) element.setAttribute("content", attributes[value]);
      });
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", "en_US");
  }

  function translateStructuredData(translations) {
    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((element) => {
        try {
          const translate = (value) => {
            if (Array.isArray(value)) return value.map(translate);
            if (value && typeof value === "object") {
              Object.entries(value).forEach(([key, child]) => {
                if (key === "inLanguage") value[key] = ["ko-KR", "en"];
                else value[key] = translate(child);
              });
              return value;
            }
            return typeof value === "string" && translations[value]
              ? translations[value]
              : value;
          };
          element.textContent = JSON.stringify(translate(JSON.parse(element.textContent)));
        } catch (_) {
          // A malformed optional structured-data block must not prevent page translation.
        }
      });
  }

  function translateAboutStats() {
    const laws = document.querySelector('[data-i18n-stat="laws"]');
    if (laws) {
      laws.innerHTML =
        "The dataset currently includes acts, presidential decrees, ministerial decrees, Supreme Court rules, Constitutional Court rules, and more: " +
        '<strong><span id="stat-total">—</span> current laws</strong>, with ' +
        '<strong><span id="stat-amendments">—</span> amendment-history entries</strong> managed as Git commits.';
    }
    const precedents = document.querySelector('[data-i18n-stat="precedents"]');
    if (precedents) {
      precedents.innerHTML =
        'It also includes <strong><span id="prec-total">—</span> precedents</strong> across eight case types, including civil, criminal, and general administrative.';
    }
    const rules = document.querySelector('[data-i18n-stat="rules"]');
    if (rules) {
      rules.innerHTML =
        'Local ordinances and administrative rules are managed in separate repositories, with Git history based on their promulgation and issuance dates. The site recalculates <strong><span id="ord-total">—</span> local ordinances</strong> and <strong><span id="adm-total">—</span> administrative rules</strong> from their repositories at build time.';
    }
  }

  function translateFooterInspiration() {
    document.querySelectorAll("[data-i18n-footer-inspiration]").forEach((element) => {
      const link = element.querySelector("a");
      if (!link) return;
      element.replaceChildren("Inspired by ", link, ".");
    });
  }

  function addLanguageButton() {
    const nav = document.querySelector(".site-nav-links, .nav");
    if (!nav) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "language-switch";
    button.textContent = locale === "ko" ? "EN" : "한국어";
    button.setAttribute(
      "aria-label",
      locale === "ko" ? "Switch to English" : "한국어로 전환",
    );
    button.addEventListener("click", () => {
      const next = locale === "ko" ? "en" : "ko";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {
        // The selected language still applies for this navigation when storage is blocked.
      }
      window.location.reload();
    });
    nav.appendChild(button);
  }

  function applyTranslations() {
    addLanguageButton();
    if (locale !== "en") return;
    const catalog = window.LEGALIZE_TRANSLATIONS || {};
    const common = catalog.common || {};
    const page = (catalog.pages || {})[pageName()] || {};
    const text = { ...(common.text || {}), ...(page.text || {}) };
    const attributes = { ...(common.attributes || {}), ...(page.attributes || {}) };
    translateTextNodes(text);
    translateAttributes(attributes);
    translateMetadata(page.metadata, attributes);
    translateStructuredData(text);
    if (pageName() === "about.html") translateAboutStats();
    translateFooterInspiration();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateTextNodes(text);
            translateAttributes(attributes);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTranslations, { once: true });
  } else {
    applyTranslations();
  }
})();
