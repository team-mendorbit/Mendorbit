// =========================================================================
// Mendorbit Cookie & Privacy Consent Banner (GDPR, ePrivacy & Google AdSense Compliant)
// =========================================================================
(function initCookieConsent() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const CONSENT_KEY = 'mendorbit_cookie_consent';
  if (localStorage.getItem(CONSENT_KEY) === 'accepted') return;

  // Determine relative path to privacy policy based on nesting depth
  const pathParts = window.location.pathname.replace(/^\/+/g, '').split('/');
  let prefix = '';
  if (pathParts.length > 2) {
    prefix = '../../';
  } else if (pathParts.length === 2 && pathParts[0] !== '') {
    prefix = '../';
  }

  const privacyUrl = prefix + 'privacy-policy.html';

  function createBanner() {
    if (document.getElementById('mendorbit-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'mendorbit-cookie-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl transition-all duration-300 transform translate-y-6 opacity-0';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie Consent Notice');

    banner.innerHTML = `
      <div class="flex items-start gap-3.5">
        <div class="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0 text-lg border border-orange-200/60 dark:border-orange-900/50">
          🍪
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <h4 class="text-xs font-black text-slate-900 dark:text-white tracking-tight">Your Privacy &amp; Cookies</h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            We use essential and analytics cookies to optimize study resources, measure traffic, and support ad personalization in full accordance with our 
            <a href="${privacyUrl}" class="text-orange-600 dark:text-orange-400 font-bold underline hover:text-orange-700">Privacy Policy</a>.
          </p>
          <div class="flex items-center gap-2 pt-2">
            <button type="button" id="cookie-accept-all-btn" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-[11px] shadow-sm transition active:scale-95 cursor-pointer">
              Accept All
            </button>
            <button type="button" id="cookie-dismiss-btn" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition active:scale-95 cursor-pointer">
              Necessary Only
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate In
    requestAnimationFrame(() => {
      banner.classList.remove('translate-y-6', 'opacity-0');
      banner.classList.add('translate-y-0', 'opacity-100');
    });

    function acceptConsent(value) {
      try {
        localStorage.setItem(CONSENT_KEY, value);
      } catch (e) {}

      banner.classList.remove('translate-y-0', 'opacity-100');
      banner.classList.add('translate-y-6', 'opacity-0');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }

    document.getElementById('cookie-accept-all-btn')?.addEventListener('click', () => acceptConsent('accepted'));
    document.getElementById('cookie-dismiss-btn')?.addEventListener('click', () => acceptConsent('essential'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(createBanner, 800));
  } else {
    setTimeout(createBanner, 800);
  }
})();
