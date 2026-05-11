// Lightweight i18n — keeps Korean inline, swaps to English when toggled.
// Usage: add `data-en="English text"` to any element. Korean is read from innerHTML.
// For attributes, use `data-en-aria="..."` for aria-label, `data-en-title="..."` for title.
// Add a `.lang-toggle` button anywhere to toggle.
(function () {
  const KEY = 'lang';
  const DEFAULT = 'ko';
  const koCache = new WeakMap();

  // URL override: ?lang=en or ?lang=ko forces that language and persists it.
  try {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'en' || param === 'ko') {
      localStorage.setItem(KEY, param);
    }
  } catch (e) { /* no-op */ }
  const ariaCache = new WeakMap();
  const titleCache = new WeakMap();

  function getLang() {
    return localStorage.getItem(KEY) || DEFAULT;
  }

  function setLang(lang) {
    localStorage.setItem(KEY, lang);
    apply();
  }

  function apply() {
    const lang = getLang();
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    // innerHTML translations
    document.querySelectorAll('[data-en]').forEach(el => {
      if (!koCache.has(el)) koCache.set(el, el.innerHTML);
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : koCache.get(el);
    });

    // aria-label translations
    document.querySelectorAll('[data-en-aria]').forEach(el => {
      if (!ariaCache.has(el)) ariaCache.set(el, el.getAttribute('aria-label') || '');
      el.setAttribute('aria-label',
        lang === 'en' ? el.getAttribute('data-en-aria') : ariaCache.get(el));
    });

    // title translations
    document.querySelectorAll('[data-en-title]').forEach(el => {
      if (!titleCache.has(el)) titleCache.set(el, el.getAttribute('title') || '');
      el.setAttribute('title',
        lang === 'en' ? el.getAttribute('data-en-title') : titleCache.get(el));
    });

    // <title> tag translation
    const titleEl = document.querySelector('title[data-en]');
    if (titleEl) {
      if (!koCache.has(titleEl)) koCache.set(titleEl, titleEl.textContent);
      titleEl.textContent = lang === 'en'
        ? titleEl.getAttribute('data-en')
        : koCache.get(titleEl);
    }

    // Update toggle buttons to show the *other* language as the action label
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.textContent = lang === 'en' ? 'KO' : 'EN';
      btn.setAttribute('aria-label',
        lang === 'en' ? 'Switch to Korean' : 'Switch to English');
    });
  }

  function toggle() {
    setLang(getLang() === 'en' ? 'ko' : 'en');
  }

  window.i18n = { apply, toggle, get: getLang, set: setLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-toggle');
    if (btn) {
      e.preventDefault();
      toggle();
    }
  });
})();
