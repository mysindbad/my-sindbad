/* My Sindbad — Shared Bottom Navigation (Mobile-first)
   6 items: Home, Itinerary, Create(+center), Explore, Community, Profile.
   SVG icons + translated labels. 48px touch targets. Clear active state. */
(function initSharedNavigation() {
  const tr = (key) => window.MySindbadI18n?.getTranslation?.(window.MySindbadI18n?.getLang?.() || 'ar', key) || key;

  const SVG = (inner) =>
    '<span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
    + 'aria-hidden="true" focusable="false">' + inner + '</svg></span>';

  const ICONS = {
    home: SVG('<path d="M3 12l9-9 9 9M5 10v10h14V10"/>'),
    trip: SVG('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3v4M15 3v4M4 11h16"/><path d="M9 16l2 2 4-4"/>'),
    create: SVG('<path d="M12 5v14M5 12h14"/>'),
    explore: SVG('<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 0 2-6z"/>'),
    community: SVG('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5"/>'),
    profile: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>')
  };

  const pages = [
    { id: 'home', href: './index.html', key: 'nav_home', icon: ICONS.home },
    { id: 'trip', href: './itinerary.html', key: 'nav_itinerary', icon: ICONS.trip },
    { id: 'create', href: './create-trip.html', key: 'nav_create', icon: ICONS.create, center: true },
    { id: 'explore', href: './explore.html', key: 'nav_explore', icon: ICONS.explore },
    { id: 'community', href: './community.html', key: 'nav_community', icon: ICONS.community },
    { id: 'profile', href: './profile.html', key: 'nav_profile', icon: ICONS.profile }
  ];

  function mount() {
    document.querySelectorAll('[data-site-nav]:not([data-mounted])').forEach((nav) => {
      const active = nav.dataset.active;
      nav.className = 'site-nav';
      nav.setAttribute('aria-label', tr('main_navigation'));
      nav.setAttribute('data-i18n-nav', 'true');
      nav.innerHTML = pages.map((page) => {
        const isActive = page.id === active ? ' active' : '';
        const isCenter = page.center ? ' nav-center' : '';
        return '<a href="' + page.href + '" class="' + isActive + isCenter + '" data-nav-id="' + page.id + '">'
          + page.icon
          + (page.center ? '' : '<span class="nav-label">' + tr(page.key) + '</span>')
          + '</a>';
      }).join('');
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