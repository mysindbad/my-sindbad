/* My Sindbad — Unified Icon System (utils/icons.js)
   - Provides SVG icons via [data-icon="name"] elements (auto-rendered).
   - Replaces emoji used as UI icons inside buttons/links at runtime
     (static HTML + JS-generated content via MutationObserver).
   - Does NOT touch CSS ::before/::after emoji (handled by system.css masks).
   - Never changes icon meaning; maps each emoji to its semantic equivalent. */
(function () {
  'use strict';

  const SVG = (inner) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true" focusable="false">' + inner + '</svg>';

  const ICONS = {
    pin: SVG('<path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    walk: SVG('<circle cx="13" cy="4" r="1.6"/><path d="M13 7l-2 4 3 2 1 5M11 11l-3 1M14 13l3-1"/>'),
    car: SVG('<path d="M5 17h14M6 17l1-6h10l1 6M6 17v2M18 17v2M7 11l1-3h8l1 3"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/>'),
    navigation: SVG('<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 0 2-6z"/>'),
    map: SVG('<path d="M9 4l6 2 5-2v14l-5 2-6-2-5 2V6z"/><path d="M9 4v14M15 6v14"/>'),
    check: SVG('<path d="M5 13l4 4L19 7"/>'),
    plus: SVG('<path d="M12 5v14M5 12h14"/>'),
    edit: SVG('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>'),
    heart: SVG('<path d="M12 21s-7-5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5-7 10-7 10z"/>'),
    'heart-outline': SVG('<path d="M12 21s-7-5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5-7 10-7 10z"/>'),
    comment: SVG('<path d="M21 12a8 8 0 0 1-11 7l-5 1 1-4A8 8 0 1 1 21 12z"/>'),
    share: SVG('<path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
    bookmark: SVG('<path d="M6 4h12v17l-6-4-6 4z"/>'),
    hotel: SVG('<path d="M4 21V5h16v16M4 9h16M9 21v-4h6v4"/><path d="M8 13h.01M12 13h.01M16 13h.01"/>'),
    restaurant: SVG('<path d="M6 3v8a2 2 0 0 0 2 2v8M6 3v5M9 3v5M9 8a2 2 0 0 1-3 0M18 3c-2 0-3 2-3 5s1 4 3 4v9"/>'),
    users: SVG('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5"/>'),
    user: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>'),
    globe: SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
    bell: SVG('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 21a2 2 0 0 0 4 0"/>'),
    moon: SVG('<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'),
    settings: SVG('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
    eye: SVG('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
    menu: SVG('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    sun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>'),
    star: SVG('<path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5 1.5-6.5-5-4.5 6.5-.5z"/>'),
    route: SVG('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h6.5"/>'),
    send: SVG('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'),
    trash: SVG('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    target: SVG('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
    clock: SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  };

  // Emoji → icon name (UI icons only). Keys are the exact emoji chars used in the app.
  const EMOJI_MAP = {
    '\u{1F6B6}': 'walk',          // 🚶
    '\u{1F697}': 'car',           // 🚗
    '\u{1F9ED}': 'navigation',    // 🧭
    '\u{1F4CD}': 'pin',           // 📍
    '\u{1F5FA}': 'map',           // 🗺
    '\u2713': 'check',            // ✓
    '\u2714': 'check',
    '\u2795': 'plus',             // ➕
    '\u270F': 'edit',             // ✏
    '\u{1F58A}': 'edit',
    '\u2665': 'heart',            // ♥
    '\u2661': 'heart-outline',    // ♡
    '\u{1F5E8}': 'comment',       // 💬 (speech)
    '\u{1F4AC}': 'comment',
    '\u{1F4E4}': 'share',         // 📤
    '\u{1F516}': 'bookmark',      // 🔖
    '\u25AB': 'bookmark',         // ▫
    '\u{1F3E8}': 'hotel',         // 🏨
    '\u{1F37D}': 'restaurant',    // 🍽
    '\u{1F465}': 'users',         // 👥
    '\u{1F464}': 'user',          // 👤
    '\u{1F310}': 'globe',         // 🌐
    '\u{1F514}': 'bell',          // 🔔
    '\u{1F319}': 'moon',          // 🌙
    '\u{1F441}': 'eye',           // 👁
    '\u2630': 'menu',             // ☰
    '\u27A4': 'send',             // ➤
    '\u{1F5D1}': 'trash',          // 🗑
    '\u{1F9ED}': 'navigation',
  };

  const ICON_CLASS = 'ms-icon';

  function makeIcon(name) {
    const inner = ICONS[name];
    if (!inner) return null;
    const span = document.createElement('span');
    span.className = ICON_CLASS;
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = inner;
    return span;
  }

  // Replace emoji characters inside a text node with SVG icon spans.
  function replaceEmojiInText(node) {
    let changed = false;
    for (const [emoji, name] of Object.entries(EMOJI_MAP)) {
      const idx = node.nodeValue.indexOf(emoji);
      if (idx === -1) continue;
      const icon = makeIcon(name);
      if (!icon) continue;
      const before = document.createTextNode(node.nodeValue.slice(0, idx));
      const after = document.createTextNode(node.nodeValue.slice(idx + emoji.length));
      const parent = node.parentNode;
      parent.insertBefore(before, node);
      parent.insertBefore(icon, node);
      parent.insertBefore(after, node);
      parent.removeChild(node);
      changed = true;
      // continue with the "after" node for any remaining emoji
      replaceEmojiInText(after);
      return true;
    }
    return changed;
  }

  // Walk text nodes under an element and replace known emoji.
  function processElement(root) {
    if (!root || !root.querySelectorAll) return;
    // Targets: buttons, links, and elements explicitly marked, plus [data-icon] elements.
    const targets = new Set();
    root.querySelectorAll && root.querySelectorAll('button, a, .cat-btn, .setting, .chip, .badge, [data-emoji-icon]').forEach(function (el) {
      // skip the shared bottom-nav (already SVG) and site-header
      if (el.closest('.site-nav') || el.closest('.site-header')) return;
      targets.add(el);
    });
    // Also handle the root itself if it is a button/a
    if ((root.tagName === 'BUTTON' || root.tagName === 'A') && !root.closest('.site-nav')) targets.add(root);

    targets.forEach(function (el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);
      textNodes.forEach(replaceEmojiInText);
    });

    // Render [data-icon] placeholders
    if (root.querySelectorAll) {
      root.querySelectorAll('[data-icon]').forEach(function (el) {
        if (el.dataset.iconRendered) return;
        const name = el.getAttribute('data-icon');
        const icon = makeIcon(name);
        if (icon) {
          el.innerHTML = '';
          el.appendChild(icon);
          el.classList.add(ICON_CLASS);
          el.dataset.iconRendered = '1';
        }
      });
    }
  }

  function init() {
    if (window.__msIconsInit) return;
    window.__msIconsInit = true;
    processElement(document.body);
    // Observe dynamically added content (community posts, itinerary rows, etc.)
    const obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) processElement(node);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // Public API (for pages that render via JS and want manual processing)
  window.MSIcons = { render: makeIcon, process: processElement, icons: ICONS };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();