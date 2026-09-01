(function initSharedNavigation() {
  const tr = (key) => window.MySindbadI18n?.getTranslation?.(window.MySindbadI18n?.getLang?.() || 'ar', key) || key;
  const pages = [
    { id: 'home', href: './index.html', key: 'nav_home', label: '', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6"/></svg>' },
    { id: 'trip', href: './itinerary.html', key: 'nav_itinerary', label: '', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>' },
    { id: 'create', href: './create-trip.html', key: 'nav_create', label: '', center: true, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' },
    { id: 'explore', href: './explore.html', key: 'nav_explore', label: '', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-7.58 8-13a8 8 0 1 0-16 0c0 5.42 8 13 8 13z"/><circle cx="12" cy="9" r="3"/></svg>' },
    { id: 'profile', href: './profile.html', key: 'nav_profile', label: '', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>' }
  ];

  function mount() {
    document.querySelectorAll('[data-site-nav]:not([data-mounted])').forEach((nav) => {
    const active = nav.dataset.active;
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', tr('main_navigation'));
    nav.setAttribute('data-i18n-nav', 'true');
    nav.innerHTML = pages.map((page) => `
      <a href="${page.href}" class="${page.center ? 'nav-center ' : ''}${page.id === active ? 'active' : ''}" ${page.id === active ? 'aria-current="page"' : ''}>
        <span class="nav-icon" aria-hidden="true">${page.icon}</span>
        ${page.center ? '' : `<span data-i18n="${page.key}">${page.label}</span>`}
      </a>
    `).join('');
    nav.dataset.mounted = 'true';
    });
  }

  function start() {
    mount();
    if (document.body && window.MutationObserver) {
      const observer = new MutationObserver(() => {
        if (document.querySelector('[data-site-nav]:not([data-mounted])')) mount();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
  if (!window.MySindbadI18n) import('./i18n.js?m6=final1').catch(() => {});
})();