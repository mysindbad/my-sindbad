/* My Sindbad — Shared Header (Mobile-first redesign)
   - Clean header: [logo + page context]  [settings/profile action]
   - NO random Home button (Home is in bottom navigation)
   - NO random Language switcher (Language is in Profile/Settings)
   - AI Assistant FAB with mobile touch fix (48px target, touch-action)
   - Preserves all Phase 15-19 AI assistant logic */
(function initSharedHeader() {
  const tr = (key) => window.MySindbadI18n?.getTranslation?.(window.MySindbadI18n?.getLang?.() || 'ar', key) || key;

  const LOGO_SVG = '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M16 2L2 9v14l14 7 14-7V9L16 2z" stroke="#D4AF37" stroke-width="2" fill="rgba(212,175,55,0.1)"/>'
    + '<path d="M10 16l4 4 8-8" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg>';

  const SETTINGS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
    + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
    + '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>';

  const PAGE_TITLES = {
    home: 'nav_home',
    trip: 'nav_itinerary',
    create: 'nav_create',
    explore: 'nav_explore',
    map: 'map_heading',
    community: 'nav_community',
    profile: 'nav_profile'
  };

  function getPageTitle() {
    const nav = document.querySelector('[data-site-nav]');
    const active = nav?.dataset?.active;
    const key = PAGE_TITLES[active] || 'header_tagline';
    return tr(key);
  }

  function headerMarkup() {
    const pageTitle = getPageTitle();
    return ''
      + '<div class="site-header__inner">'
      +   '<a class="site-header__brand" href="./index.html" aria-label="My Sindbad">'
      +     '<span class="site-header__mark">' + LOGO_SVG + '</span>'
      +     '<span class="site-header__wordmark">'
      +       '<strong>My Sindbad</strong>'
      +       '<small>' + pageTitle + '</small>'
      +     '</span>'
      +   '</a>'
      +   '<a class="site-header__action" href="./profile.html" aria-label="' + tr('nav_profile') + '">'
      +     '<span class="ms-icon" aria-hidden="true">' + SETTINGS_SVG + '</span>'
      +   '</a>'
      + '</div>';
  }

  /* ===== AI Assistant (preserved from original, FAB touch fix via CSS) =====
     NOTE: assistantMarkup is a FUNCTION (not const) so it's evaluated at
     mountAssistant() time — AFTER i18n.js loads. This prevents raw translation
     keys from appearing in the quick prompt buttons. */
  function assistantMarkup() {
    return ''
    + '<button id="m6-assistant-fab" class="m6-assistant-fab ms-ai-fab" type="button"'
    +   ' aria-label="' + tr('assistant_title') + '" title="' + tr('assistant_title') + '">'
    +   '<span>🤖</span>'
    + '</button>'
    + '<div id="m6-assistant-backdrop" class="m6-assistant-backdrop" hidden></div>'
    + '<section id="m6-assistant-sheet" class="m6-assistant-sheet" role="dialog" aria-modal="true" hidden>'
    +   '<div class="m6-assistant-grabber" aria-hidden="true"></div>'
    +   '<header class="m6-assistant-head">'
    +     '<div>'
    +       '<h2 data-i18n="assistant_title">' + tr('assistant_title') + '</h2>'
    +       '<p data-i18n="assistant_subtitle">' + tr('assistant_subtitle') + '</p>'
    +     '</div>'
    +     '<button id="m6-assistant-close" type="button" aria-label="' + tr('close') + '" data-i18n-aria-label="close">×</button>'
    +   '</header>'
    +   '<div id="m6-assistant-messages" class="m6-assistant-messages" aria-live="polite"></div>'
    +   '<div id="m6-assistant-error" class="m6-assistant-error"></div>'
    +   '<div class="m6-assistant-quick">'
    +     '<button type="button" data-assistant-prompt-key="assistant_salutation" data-i18n="assistant_salutation">' + tr('assistant_salutation') + '</button>'
    +     '<button type="button" data-assistant-prompt-key="assistant_wellbeing" data-i18n="assistant_wellbeing">' + tr('assistant_wellbeing') + '</button>'
    +     '<button type="button" data-assistant-prompt-key="assistant_today_prompt" data-i18n="assistant_today_prompt">' + tr('assistant_today_prompt') + '</button>'
    +   '</div>'
    +   '<form id="m6-assistant-form" class="m6-assistant-form">'
    +     '<input id="m6-assistant-input" type="text" autocomplete="off" data-i18n-ph="assistant_input" placeholder="' + tr('assistant_input') + '" required>'
    +     '<button type="submit" aria-label="' + tr('assistant_send') + '" data-i18n-aria-label="assistant_send">➤</button>'
    +   '</form>'
    + '</section>';
  }

  function setScrolledState() {
    const header = document.querySelector('.site-header');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 50);
  }

  function readTrip() { return window.AppState?.getTrip?.() || {}; }

  async function fetchWithTimeout(input, init = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(input, { ...init, signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }

  function mountAssistant() {
    if (document.getElementById('m6-assistant-fab') || /itinerary(?:\.html)?$/.test(location.pathname)) return;
    document.body.insertAdjacentHTML('beforeend', assistantMarkup());
    setTimeout(() => window.MySindbadI18n?.refresh?.(), 0);
    const fab = document.getElementById('m6-assistant-fab');
    const sheet = document.getElementById('m6-assistant-sheet');
    const backdrop = document.getElementById('m6-assistant-backdrop');
    const close = document.getElementById('m6-assistant-close');
    const form = document.getElementById('m6-assistant-form');
    const input = document.getElementById('m6-assistant-input');
    const messages = document.getElementById('m6-assistant-messages');
    const error = document.getElementById('m6-assistant-error');

    const history = [];
    const lang = () => localStorage.getItem('userLang') || 'ar';
    const text = (key, fallback) => window.MySindbadI18n?.getTranslation?.(lang(), key) || fallback;

    const add = (role, value) => {
      const node = document.createElement('div');
      node.className = 'm6-assistant-message ' + role;
      node.textContent = value;
      messages.appendChild(node);
      messages.scrollTop = messages.scrollHeight;
      return node;
    };

    const open = () => { sheet.hidden = false; backdrop.hidden = false; setTimeout(() => input.focus(), 50); };
    const shut = () => { sheet.hidden = true; backdrop.hidden = true; };

    function persistTrip(next) {
      window.AppState?.saveTrip?.(next);
      window.dispatchEvent(new CustomEvent('appstate:trip-updated', { detail: next }));
    }

    async function execute(result) {
      const current = readTrip();
      let next = current;
      const day = Number(result.day) || 1;
      const index = Math.max(0, Number(result.activityIndex) || 0);
      const days = Array.isArray(current.days) ? current.days.map((item) => ({ ...item, activities: [...(item.activities || [])] })) : [];
      const dayIndex = days.findIndex((item) => Number(item.day) === day);
      if (dayIndex < 0) throw new Error('day_not_found');
      if (result.type === 'REMOVE' || result.type === 'REMOVE_ACTIVITY') days[dayIndex].activities.splice(index, 1);
      else if (result.type === 'MOVE' || result.type === 'MOVE_ACTIVITY') {
        const targetDay = Number(result.toDay || result.targetDay) || day + 1;
        const target = days.find((item) => Number(item.day) === targetDay);
        const [activity] = days[dayIndex].activities.splice(index, 1);
        if (!target || !activity) throw new Error('move_target_not_found');
        target.activities.push(activity);
      }
      else if (result.type === 'REPLAN') days.forEach((item) => item.activities.sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))));
      else if (result.type === 'REPLACE_ACTIVITY') {
        const replacement = result.option;
        if (!replacement) throw new Error('replacement_missing');
        days[dayIndex].activities[index] = { ...days[dayIndex].activities[index], ...replacement, title: replacement.title || replacement.name };
      }
      else throw new Error('unsupported_action');
      next = { ...current, days };
      persistTrip(next);
      return next;
    }

    function addAction(result) {
      const box = document.createElement('div');
      box.className = 'm6-assistant-action';
      const preview = result.preview || result.message || text('preview', 'Preview');
      const copy = document.createElement('div');
      copy.textContent = preview;
      box.appendChild(copy);
      if (result.type === 'REPLACE_ACTIVITY' && Array.isArray(result.options) && result.options.length) {
        const options = document.createElement('div');
        options.className = 'm6-assistant-options';
        result.options.forEach((option) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = option.title + ' · ' + (option.cost || 0) + ' MAD';
          button.addEventListener('click', async () => {
            button.disabled = true;
            try { await execute({ ...result, option }); add('ai', text('added_success', 'Change applied successfully.')); }
            catch { add('ai', text('assistant_error', 'I could not apply that change.')); }
          });
          options.appendChild(button);
        });
        box.appendChild(options);
      } else if (['REMOVE', 'REMOVE_ACTIVITY', 'MOVE', 'MOVE_ACTIVITY', 'REPLAN'].includes(result.type)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text('confirm', 'Confirm');
        button.addEventListener('click', async () => {
          button.disabled = true;
          try { await execute(result); button.textContent = text('added_success', 'Applied'); add('ai', text('added_success', 'Change applied successfully.')); }
          catch { button.disabled = false; add('ai', text('assistant_error', 'I could not apply that change.')); }
        });
        box.appendChild(button);
      }
      messages.appendChild(box);
      messages.scrollTop = messages.scrollHeight;
    }

    async function send(raw) {
      const message = String(raw || '').trim();
      if (!message) { error.textContent = text('assistant_required', 'Write your message first.'); input.focus(); return; }
      error.textContent = '';
      add('user', message);
      input.value = '';
      const loading = add('ai', text('assistant_loading', 'Sindbad is planning...'));
      try {
        const response = await fetchWithTimeout('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, trip: readTrip(), history: history.slice(-5), language: lang() })
        });
        if (!response.ok) throw new Error('assistant');
        const result = await response.json();
        loading.remove();
        const reply = result.message || (result.type === 'REPLACE_ACTIVITY' ? text('assistant_preview', 'The change preview is ready for review.') : result.preview) || text('assistant_error', 'I could not understand that request.');
        add('ai', reply);
        if (['REMOVE', 'REMOVE_ACTIVITY', 'MOVE', 'MOVE_ACTIVITY', 'REPLAN', 'REPLACE_ACTIVITY'].includes(result.type)) addAction(result);
        history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
        if (history.length > 10) history.splice(0, history.length - 10);
      } catch {
        loading.remove();
        add('ai', text('assistant_error', 'I could not understand that request.'));
      }
    }

    fab.addEventListener('click', open);
    close.addEventListener('click', shut);
    backdrop.addEventListener('click', shut);
    form.addEventListener('submit', (event) => { event.preventDefault(); send(input.value); });
    document.querySelectorAll('[data-assistant-prompt-key]').forEach((button) => button.addEventListener('click', () => {
      open();
      const key = button.dataset.assistantPromptKey;
      input.value = key ? text(key, '') : '';
      input.focus();
    }));
  }

  function mount() {
    document.querySelectorAll('[data-site-header]').forEach((host) => {
      if (host.dataset.mounted === 'true') return;
      host.className = 'site-header-host';
      host.innerHTML = headerMarkup();
      host.dataset.mounted = 'true';
      setTimeout(() => window.MySindbadI18n?.refresh?.(), 0);
    });
    mountAssistant();
    setScrolledState();
  }

  function observeDynamicHosts() {
    if (!document.body || !window.MutationObserver) return;
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-site-header]:not([data-mounted])')) mount();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function start() {
    mount();
    observeDynamicHosts();
    window.addEventListener('scroll', setScrolledState, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();