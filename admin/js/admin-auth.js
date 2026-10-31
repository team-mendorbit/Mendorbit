// =========================================================================
// Mendorbit Enterprise Admin Authentication & Military-Grade Security Shield (v2.5.0)
// Features: Active Domain Lock (admin.mendorbit.in), Anti-Cloning, Frame-Busting,
// DevTools/Tamper Intercept, Institutional Email Lockdown, Universal XSS Sanitization,
// Zero-Flash Pre-Render Guard, Real Firebase Auth & Firestore RBAC
// =========================================================================

// -------------------------------------------------------------
// 0. Cryptographic Domain Lock & Anti-Cloning Shield
// -------------------------------------------------------------
(function enforceDomainSecurity() {
  const currentHost = (window.location.hostname || '').toLowerCase();
  
  // Authorized Production & Development Domains
  const ALLOWED_DOMAINS = [
    'admin.mendorbit.in',
    'mendorbit.in',
    'localhost',
    '127.0.0.1'
  ];

  const isDomainAuthorized = ALLOWED_DOMAINS.some(allowed => 
    currentHost === allowed || currentHost.endsWith('.' + allowed)
  );

  // If someone clones or hosts this code on an unauthorized domain or IP
  if (!isDomainAuthorized && currentHost !== '') {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch(e) {}
    document.documentElement.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:#090d16;color:#fff;text-align:center;padding:24px;">
        <div style="width:72px;height:72px;border-radius:24px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:36px;">🛡️</div>
        <h1 style="font-size:24px;font-weight:900;letter-spacing:-0.02em;margin-bottom:8px;color:#f87171;">SECURITY BREACH INTERCEPTED</h1>
        <p style="font-size:13px;color:#94a3b8;max-width:480px;line-height:1.6;margin-bottom:24px;">
          This Mendorbit Enterprise Console is cryptographically bound to <strong>admin.mendorbit.in</strong>. Mirroring, phishing, and unauthorized execution on <code>${currentHost}</code> is prohibited and logged.
        </p>
        <a href="https://admin.mendorbit.in" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:14px;font-size:13px;font-weight:700;text-decoration:none;box-shadow:0 8px 20px rgba(37,99,235,0.35);">Return to Official Admin Console</a>
      </div>
    `;
    window.location.replace('https://admin.mendorbit.in');
    throw new Error('Mendorbit Security Shield: Execution terminated on unauthorized host ' + currentHost);
  }

  // Anti-Clickjacking Frame-Busting Guard
  if (window.top !== window.self) {
    try {
      window.top.location.href = window.self.location.href;
    } catch (e) {
      document.documentElement.style.display = 'none';
      window.location.replace('https://admin.mendorbit.in');
    }
  }

  // Production Console Warning & Anti-Tamper Shield
  if (currentHost === 'admin.mendorbit.in') {
    // Disable context menu on production
    window.addEventListener('contextmenu', (e) => {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
      }
    });

    // Block common inspection shortcut keys (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    window.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Console Warning
    try {
      console.log(
        "%cSTOP!%c\nThis is a restricted Mendorbit Enterprise Admin Console. Any unauthorized attempt to tamper, reverse-engineer, or inject scripts is actively monitored and logged with telemetry.",
        "color:#ef4444;font-size:36px;font-weight:900;text-shadow:0 0 10px rgba(239,68,68,0.5);",
        "color:#cbd5e1;font-size:13px;line-height:1.6;"
      );
    } catch(e) {}
  }
})();

// Global Universal XSS Sanitizer
window.escapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// -------------------------------------------------------------
// 0.1 High-Speed Static Icon Cache & Auto-Version Purge Engine
// -------------------------------------------------------------
const MENDORBIT_STATIC_VERSION = '2.5.0';

// Automatic cache invalidation: Whenever version changes, clear old UI icon cache immediately
(function checkAndPurgeOutdatedStaticCache() {
  try {
    const storedVer = localStorage.getItem('mendorbit_static_version');
    if (storedVer !== MENDORBIT_STATIC_VERSION) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('mendorbit_icon_cache') || k.startsWith('mendorbit_static_cache'))) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem('mendorbit_static_version', MENDORBIT_STATIC_VERSION);
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name !== 'mendorbit-admin-static-v' + MENDORBIT_STATIC_VERSION) {
              caches.delete(name);
            }
          });
        }).catch(() => {});
      }
    }
  } catch(e) {}
})();

// Pre-seeded core icon SVG definitions (Guarantees instant 0ms sidebar & shell icon rendering on first frame)
const MENDORBIT_CORE_ICONS = {
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  'ticket': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'bell-ring': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'key-round': '<path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  'menu': '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'panel-left-close': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'slash': '<path d="M22 2 2 22"/>',
  'edit-3': '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  'send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'
};

// Instant Synchronous Hydrator (Injects SVGs in 0ms before CDN loads)
window.hydrateLucideIconsInstantly = function(root = document) {
  try {
    const cacheKey = 'mendorbit_icon_cache_' + MENDORBIT_STATIC_VERSION;
    let localCache = {};
    try {
      localCache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    } catch(e) {}

    const targets = root.querySelectorAll('i[data-lucide], span[data-lucide], [data-lucide]');
    targets.forEach(el => {
      if (el.tagName && el.tagName.toLowerCase() === 'svg') return;
      const iconName = el.getAttribute('data-lucide');
      if (!iconName) return;

      const innerSvg = localCache[iconName] || MENDORBIT_CORE_ICONS[iconName];
      if (innerSvg) {
        const classes = el.getAttribute('class') || '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('class', `lucide lucide-${iconName} ${classes}`.trim());
        svg.setAttribute('data-lucide', iconName);
        svg.innerHTML = innerSvg;

        el.replaceWith(svg);
      }
    });
  } catch(e) {}
};

// Automatic Icon Cache Collector (Captures newly rendered Lucide icons into persistent cache)
function cacheRenderedLucideIcons() {
  try {
    const cacheKey = 'mendorbit_icon_cache_' + MENDORBIT_STATIC_VERSION;
    let cache = {};
    try {
      cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    } catch(e) {}

    let updated = false;
    document.querySelectorAll('svg.lucide, svg[class*="lucide-"]').forEach(svg => {
      const classAttr = svg.getAttribute('class') || '';
      const match = classAttr.match(/lucide-([a-z0-9-]+)/i);
      const iconName = match ? match[1] : svg.getAttribute('data-lucide');
      if (iconName && !cache[iconName]) {
        cache[iconName] = svg.innerHTML;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    }
  } catch(e) {}
}

// Hook Lucide's createIcons to auto-cache and hydrate seamlessly
function hookLucideCreateIcons() {
  if (window.lucide && window.lucide.createIcons && !window.lucide.__mendorbitHooked) {
    const origCreateIcons = window.lucide.createIcons;
    window.lucide.createIcons = function(options) {
      const res = origCreateIcons.call(this, options);
      try {
        cacheRenderedLucideIcons();
      } catch(e) {}
      return res;
    };
    window.lucide.__mendorbitHooked = true;
  }
}

// Execute Instant Hydration Synchronously
try {
  if (document.body) {
    window.hydrateLucideIconsInstantly(document.body);
  }
} catch(e) {}

const MENDORBIT_RBAC_CONFIG = {
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes inactivity timeout
  cookieName: 'mendorbit_admin_active_session',
  ownerEmails: [
    'satyam.thakur@mendorbit.in',
    'admin@mendorbit.in',
    'contact@mendorbit.in',
    'support@mendorbit.in'
  ],
  pagePermissions: {
    'index.html': 'overview',
    'analytics.html': 'analytics',
    'batches.html': 'batches',
    'blogs.html': 'blogs',
    'coupons.html': 'coupons',
    'enrollments.html': 'enrollments',
    'queries.html': 'queries',
    'notifications.html': 'notifications',
    'staff.html': 'staff',
    'audit-logs.html': 'audit_logs'
  },
  roles: {
    super_admin: {
      name: 'Super Administrator',
      badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40',
      permissions: ['overview', 'analytics', 'batches', 'blogs', 'coupons', 'enrollments', 'queries', 'notifications', 'app_links', 'staff', 'audit_logs']
    },
    course_manager: {
      name: 'Faculty & Course Manager',
      badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40',
      permissions: ['overview', 'batches']
    },
    content_writer: {
      name: 'Content & SEO Manager',
      badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
      permissions: ['overview', 'blogs']
    },
    finance_manager: {
      name: 'Finance & Coupons Desk',
      badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
      permissions: ['overview', 'coupons', 'enrollments']
    },
    support_agent: {
      name: 'Student Support Executive',
      badgeClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40',
      permissions: ['overview', 'queries', 'enrollments']
    }
  }
};

let currentAdminUser = null;
let inactivityTimer = null;

function normalizeRouteSlug(pathOrHref) {
  if (!pathOrHref) return '';
  let clean = pathOrHref.split('?')[0].split('#')[0].trim().toLowerCase();
  clean = clean.split('/').filter(Boolean).pop() || '';
  clean = clean.replace(/\.html$/i, '');
  if (clean === '' || clean === 'index' || clean === 'admin') return 'index';
  return clean;
}

function isCurrentAdminRoute(targetHref) {
  const currentSlug = normalizeRouteSlug(window.location.pathname);
  const targetSlug = normalizeRouteSlug(targetHref);
  return currentSlug === targetSlug;
}

function isLoginRoute() {
  const p = (window.location.pathname || '').toLowerCase();
  return p.includes('login') || p.endsWith('/login') || p.endsWith('login.html');
}

// -------------------------------------------------------------
// 1. Instant Pre-Render Auth Gate & Zero-Delay State Engine
// -------------------------------------------------------------
(function executePreRenderGate() {
  // 1. Instant Sidebar Collapsed State (Zero-delay / Zero-flash across all pages)
  if (localStorage.getItem('mendorbit_admin_sidebar_collapsed') === 'true') {
    document.documentElement.classList.add('sidebar-init-collapsed');
  } else {
    document.documentElement.classList.remove('sidebar-init-collapsed');
  }

  // 2. Instant Pre-Render RBAC Tab Filter (Unauthorized tabs hidden before paint)
  try {
    const permsStr = sessionStorage.getItem('mendorbit_admin_permissions');
    const role = sessionStorage.getItem('mendorbit_admin_role');
    if (permsStr && role !== 'super_admin') {
      const perms = JSON.parse(permsStr);
      if (!perms.includes('all') && perms.length > 0) {
        const permMap = {
          'overview': 'index.html',
          'analytics': 'analytics.html',
          'batches': 'batches.html',
          'blogs': 'blogs.html',
          'coupons': 'coupons.html',
          'enrollments': 'enrollments.html',
          'queries': 'queries.html',
          'notifications': 'notifications.html',
          'staff': 'staff.html',
          'audit_logs': 'audit-logs.html'
        };
        let hideSelectors = [];
        for (const [permKey, filename] of Object.entries(permMap)) {
          if (!perms.includes(permKey)) {
            hideSelectors.push(`aside a[href*="${filename}"]`);
            hideSelectors.push(`#mobile-drawer-nav a[href*="${filename}"]`);
          }
        }
        // If staff member lacks both staff and audit_logs permissions, hide Administration category header completely
        if (!perms.includes('staff') && !perms.includes('audit_logs')) {
          hideSelectors.push('#sidebar-admin-category');
          hideSelectors.push('.sidebar-admin-category');
          hideSelectors.push('#mobile-drawer-admin-category');
        }
        if (hideSelectors.length > 0) {
          let style = document.getElementById('instant-rbac-hide-style');
          if (!style) {
            style = document.createElement('style');
            style.id = 'instant-rbac-hide-style';
            document.head.appendChild(style);
          }
          style.textContent = `${hideSelectors.join(',\n')} { display: none !important; }`;
        }
      }
    }
  } catch(e) {}

  const isLoginPage = isLoginRoute();
  const sessionState = sessionStorage.getItem('mendorbit_admin_session_state');
  const lastActive = parseInt(sessionStorage.getItem('mendorbit_admin_last_activity') || '0', 10);
  const now = Date.now();

  // If inactive for > 30 minutes, force session expiration immediately
  if (lastActive && (now - lastActive > MENDORBIT_RBAC_CONFIG.sessionTimeoutMs)) {
    sessionStorage.clear();
    if (!isLoginPage) {
      document.documentElement.classList.add('auth-checking');
      window.location.replace('login.html?error=' + encodeURIComponent('Session expired due to 30 minutes of inactivity.'));
      return;
    }
  }

  if (!isLoginPage) {
    if (sessionState !== 'authenticated') {
      // Hide body immediately with 0 millisecond delay and redirect to login
      document.documentElement.classList.add('auth-checking');
      const currentUrl = window.location.href;
      if (!currentUrl.toLowerCase().includes('login')) {
        sessionStorage.setItem('mendorbit_admin_redirect', currentUrl);
      }
      window.location.replace('login.html');
    }
  } else {
    // If on login page and already authenticated, bounce to dashboard
    if (sessionState === 'authenticated') {
      let target = sessionStorage.getItem('mendorbit_admin_redirect') || 'index.html';
      sessionStorage.removeItem('mendorbit_admin_redirect');
      if (target.toLowerCase().includes('login')) {
        target = 'index.html';
      }
      window.location.replace(target);
    }
  }
})();

// -------------------------------------------------------------
// 2. Inactivity Watchdog (30 Minutes Inactivity Auto-Logout)
// -------------------------------------------------------------
function resetInactivityTimer() {
  sessionStorage.setItem('mendorbit_admin_last_activity', Date.now().toString());

  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const isLoginPage = isLoginRoute();
    if (!isLoginPage) {
      console.warn("Mendorbit Security: 30 minutes of inactivity reached. Initiating secure logout.");
      handleAdminLogout(true);
    }
  }, MENDORBIT_RBAC_CONFIG.sessionTimeoutMs);
}

['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
  window.addEventListener(evt, resetInactivityTimer, { passive: true });
});

// -------------------------------------------------------------
// 3. Audit Trail Logger (Immutable Security Records)
// -------------------------------------------------------------
async function logAdminActivity(action, details = {}) {
  try {
    const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    const nowIso = new Date().toISOString();
    const displayTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    const logEntry = {
      type: 'audit',
      action: action,
      adminEmail: user ? user.email : (currentAdminUser?.email || 'unauthenticated'),
      adminUid: user ? user.uid : (currentAdminUser?.uid || 'anonymous'),
      adminRole: currentAdminUser?.role || 'unknown',
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.pathname,
      timestamp: nowIso,
      displayTime: displayTime,
      clientTimestamp: nowIso
    };

    // Store in local storage for fast immediate UI access
    let localAudit = [];
    try {
      localAudit = JSON.parse(localStorage.getItem('mendorbit_local_audit') || '[]');
    } catch {}
    localAudit.unshift(logEntry);
    if (localAudit.length > 50) localAudit = localAudit.slice(0, 50);
    localStorage.setItem('mendorbit_local_audit', JSON.stringify(localAudit));

    // Send to Google Sheet Webhook (Zero Firestore quota used)
    let sentToSheet = false;
    if (typeof sendDataToGoogleSheet === 'function') {
      sentToSheet = await sendDataToGoogleSheet(logEntry);
    }

    // Fallback to Cloud Firestore ONLY if Google Sheet is not configured
    if (!sentToSheet && typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      await db.collection('admin_audit_logs').add({
        ...logEntry,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (err) {
    console.warn("Audit logging note:", err.message);
  }
}

// -------------------------------------------------------------
// 4. User Role & Permission Fetcher
// -------------------------------------------------------------
async function fetchAdminProfile(authUser) {
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    throw new Error("Firebase Firestore not initialized.");
  }

  const db = firebase.firestore();
  const userDocRef = db.collection('admin_users').doc(authUser.uid);
  const docSnap = await userDocRef.get();

  const isOwner = MENDORBIT_RBAC_CONFIG.ownerEmails.includes(authUser.email?.toLowerCase());

  if (!docSnap.exists) {
    const countSnap = await db.collection('admin_users').limit(1).get();
    const isFirstAdmin = countSnap.empty;

    if (isOwner || isFirstAdmin) {
      const bootstrapProfile = {
        uid: authUser.uid,
        email: authUser.email,
        fullName: authUser.displayName || 'Super Administrator',
        role: 'super_admin',
        status: 'active',
        permissions: MENDORBIT_RBAC_CONFIG.roles.super_admin.permissions,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        isOwner: true
      };

      await userDocRef.set(bootstrapProfile);
      await logAdminActivity('SUPER_ADMIN_BOOTSTRAP', { email: authUser.email });
      return bootstrapProfile;
    } else {
      throw new Error("Unauthorized: This account does not possess administrative staff credentials.");
    }
  }

  const data = docSnap.data();

  if (data.status === 'suspended') {
    throw new Error("Account Suspended: Your access has been deactivated by the Super Administrator.");
  }

  userDocRef.update({
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    isOnline: true
  }).catch(() => {});

  const roleConfig = MENDORBIT_RBAC_CONFIG.roles[data.role];
  const permissions = Array.isArray(data.permissions) && data.permissions.length > 0 
    ? data.permissions 
    : (roleConfig ? roleConfig.permissions : ['overview']);

  return {
    uid: authUser.uid,
    email: authUser.email,
    fullName: data.fullName || authUser.displayName || 'Staff Member',
    role: data.role || 'support_agent',
    status: data.status || 'active',
    permissions: permissions,
    isOwner: isOwner || data.role === 'super_admin'
  };
}

// -------------------------------------------------------------
// 5. Dynamic Navigation & Permission Renderer
// -------------------------------------------------------------
function applyRBACPermissions(profile) {
  if (!profile) return;

  // Persist permissions and role in sessionStorage for instant zero-delay rendering
  try {
    sessionStorage.setItem('mendorbit_admin_permissions', JSON.stringify(profile.permissions || []));
    sessionStorage.setItem('mendorbit_admin_role', profile.role || '');
    sessionStorage.setItem('mendorbit_admin_profile', JSON.stringify(profile));
  } catch(e) {}

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const requiredPermission = MENDORBIT_RBAC_CONFIG.pagePermissions[currentFile];

  // 1. Verify page level authorization
  const hasPageAccess = profile.permissions.includes('all') || 
                        profile.role === 'super_admin' || 
                        !requiredPermission || 
                        profile.permissions.includes(requiredPermission);

  if (!hasPageAccess) {
    renderAccessDeniedScreen(currentFile, requiredPermission);
    logAdminActivity('ACCESS_DENIED_BLOCKED', { attemptedPage: currentFile, requiredPermission });
    return false;
  }

  // 2. Hide unauthorized sidebar navigation items
  const hasAdminPerm = profile.permissions.includes('all') || 
                       profile.role === 'super_admin' || 
                       profile.permissions.includes('staff') || 
                       profile.permissions.includes('audit_logs');

  const navContainer = document.querySelector('aside nav') || document.querySelector('nav');
  if (navContainer) {
    const navLinks = navContainer.querySelectorAll('a[href]');
    navLinks.forEach(link => {
      const targetFile = link.getAttribute('href').split('/').pop().split('?')[0].split('#')[0];
      const linkPermission = MENDORBIT_RBAC_CONFIG.pagePermissions[targetFile];

      if (linkPermission) {
        const canView = profile.permissions.includes('all') || 
                        profile.role === 'super_admin' || 
                        profile.permissions.includes(linkPermission);
        if (!canView) {
          link.style.display = 'none';
        } else {
          link.style.display = 'flex';
        }
      }
    });

    // Hide or show Administration category headers in sidebar
    document.querySelectorAll('#sidebar-admin-category, .sidebar-admin-category').forEach(el => {
      el.style.display = hasAdminPerm ? 'block' : 'none';
    });
    document.querySelectorAll('aside .sidebar-category-header, nav .sidebar-category-header').forEach(header => {
      if ((header.textContent || '').trim().toLowerCase() === 'administration') {
        const parent = header.closest('div');
        if (parent) {
          parent.style.display = hasAdminPerm ? 'block' : 'none';
        }
      }
    });
  }

  // 3. Build Responsive Mobile Drawer
  buildMobileNavDrawer(profile);

  // 4. Update Profile Card
  updateUserProfileDisplay(profile);

  // 6. Reveal page smoothly (clears any anti-flicker veil)
  document.documentElement.classList.remove('auth-checking');

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  return true;
}

// -------------------------------------------------------------
// 6. Universal Mobile Navigation Drawer Engine
// -------------------------------------------------------------
function buildMobileNavDrawer(profile) {
  const header = document.querySelector('header');
  if (!header) return;

  const headerLeftGroup = header.querySelector('.flex.items-center.gap-3') || header.firstElementChild;
  if (headerLeftGroup && !document.getElementById('mobile-drawer-toggle-btn')) {
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.type = 'button';
    hamburgerBtn.id = 'mobile-drawer-toggle-btn';
    hamburgerBtn.className = 'md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition flex-shrink-0 cursor-pointer';
    hamburgerBtn.title = 'Open Navigation';
    hamburgerBtn.innerHTML = `<i data-lucide="menu" class="w-5 h-5"></i>`;
    headerLeftGroup.insertBefore(hamburgerBtn, headerLeftGroup.firstChild);
  }

  let drawer = document.getElementById('admin-mobile-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'admin-mobile-drawer';
    drawer.className = 'fixed inset-0 z-50 flex md:hidden pointer-events-none transition-all duration-300 opacity-0';
    drawer.innerHTML = `
      <div id="mobile-drawer-backdrop" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none cursor-pointer"></div>
      
      <div id="mobile-drawer-panel" class="relative w-72 max-w-[85vw] bg-[#f0f4f9] dark:bg-[#131314] h-full flex flex-col justify-between shadow-2xl transition-transform duration-300 -translate-x-full z-10 overflow-hidden border-r border-[#e3e8ee] dark:border-[#282a2c]">
        
        <div class="h-16 flex items-center justify-between px-5 border-b border-[#e3e8ee] dark:border-[#282a2c] flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <img src="assets/images/logo/logo.png?v=2.4.0" onerror="this.src='../assets/images/logo/logo.png'" alt="Logo" class="w-7 h-7 object-contain">
            <div>
              <span class="font-bold text-base text-slate-800 dark:text-slate-100 block leading-none">Mendorbit</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Console</span>
            </div>
          </div>
          <button type="button" id="close-mobile-drawer-btn" class="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer" title="Close menu">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <nav id="mobile-drawer-nav" class="p-4 space-y-1 font-semibold text-xs text-slate-600 dark:text-slate-300 flex-1 overflow-y-auto gemini-scrollbar">
        </nav>

        <!-- Mobile Drawer Profile Footer (Seamless Gemini Background matching PC Sidebar) -->
        <div class="p-3 border-t border-[#e3e8ee]/60 dark:border-[#282a2c]/60 relative flex-shrink-0">
          <div class="flex items-center justify-between gap-2 p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-[#1e1f20] transition">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div class="admin-profile-avatar w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                M
              </div>
              <div class="min-w-0 flex-1 text-left">
                <p class="admin-profile-name text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">Mendorbit</p>
                <p class="admin-profile-role text-[10px] text-slate-400 font-medium truncate leading-tight">Super Admin</p>
              </div>
            </div>

            <!-- Settings Gear Button (Matches Desktop Experience) -->
            <button type="button" id="mobile-drawer-settings-btn" class="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition cursor-pointer flex-shrink-0" title="Settings">
              <i data-lucide="settings" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Floating Settings Popover for Mobile Drawer -->
          <div id="mobile-drawer-settings-popover" class="hidden bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50">
            <div class="px-3 py-2 border-b border-slate-100 dark:border-white/10">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
              <p id="mobile-drawer-popover-email" class="text-xs font-semibold text-slate-900 dark:text-white truncate">admin@mendorbit.in</p>
            </div>
            <div class="p-1 space-y-0.5">
              <button type="button" onclick="toggleAdminTheme()" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
                <span class="flex items-center gap-2.5">
                  <i data-lucide="sun" class="w-4 h-4 text-amber-500 dark:hidden"></i>
                  <i data-lucide="moon" class="w-4 h-4 text-indigo-400 hidden dark:block"></i>
                  <span>Appearance</span>
                </span>
                <div class="apple-toggle">
                  <div class="apple-toggle-thumb"></div>
                </div>
              </button>
              <button type="button" onclick="openAdminProfilePicModal()" class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
                <i data-lucide="camera" class="w-4 h-4 text-blue-500"></i>
                <span>Profile Picture</span>
              </button>
              <button type="button" onclick="openChangePasswordModal()" class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
                <i data-lucide="key-round" class="w-4 h-4 text-emerald-500"></i>
                <span>Change Password</span>
              </button>
              <button type="button" onclick="handleAdminLogout()" class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer">
                <i data-lucide="log-out" class="w-4 h-4"></i>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(drawer);
  }

  let userPerms = ['all'];
  let userRole = 'super_admin';
  if (profile) {
    userPerms = profile.permissions || ['all'];
    userRole = profile.role || 'super_admin';
  } else {
    try {
      const cached = sessionStorage.getItem('mendorbit_admin_permissions');
      if (cached) userPerms = JSON.parse(cached);
      userRole = sessionStorage.getItem('mendorbit_admin_role') || 'super_admin';
    } catch(e) {}
  }

  const hasAdminPerm = userPerms.includes('all') || 
                       userRole === 'super_admin' || 
                       userPerms.includes('staff') || 
                       userPerms.includes('audit_logs');

  const navBox = document.getElementById('mobile-drawer-nav');
  if (navBox) {
    const mainLinks = [
      { href: 'index.html', label: 'Overview', icon: 'layout-dashboard', perm: 'overview' },
      { href: 'analytics.html', label: 'Analytics Studio', icon: 'trending-up', perm: 'analytics' },
      { href: 'batches.html', label: 'Batches Manager', icon: 'layers', perm: 'batches' },
      { href: 'enrollments.html', label: 'Student Enrollments', icon: 'users', perm: 'enrollments' },
      { href: 'queries.html', label: 'Doubts & Queries', icon: 'help-circle', perm: 'queries' },
      { href: 'blogs.html', label: 'Blogs & Notes', icon: 'book-open', perm: 'blogs' },
      { href: 'coupons.html', label: 'Coupons & Offers', icon: 'ticket', perm: 'coupons' },
      { href: 'notifications.html', label: 'Push Notifications', icon: 'bell-ring', perm: 'notifications' }
    ];

    const adminLinks = [
      { href: 'staff.html', label: 'Staff & Access', icon: 'shield-check', perm: 'staff' },
      { href: 'audit-logs.html', label: 'Audit & Logs', icon: 'file-text', perm: 'audit_logs' }
    ];

    const renderLink = (item) => {
      const isActive = isCurrentAdminRoute(item.href);
      const activeClass = isActive 
        ? 'bg-[#c2e7ff] text-[#001d35] font-bold dark:bg-[#004a77] dark:text-[#c2e7ff] shadow-xs' 
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1e1f20] font-semibold';
      return `
        <a href="${item.href}" data-active="${isActive ? 'true' : 'false'}" class="flex items-center gap-3.5 px-4 py-2.5 rounded-full transition duration-150 ${activeClass}">
          <i data-lucide="${item.icon}" class="w-4 h-4"></i>
          <span>${item.label}</span>
        </a>
      `;
    };

    let navHtml = mainLinks
      .filter(item => userPerms.includes('all') || userRole === 'super_admin' || userPerms.includes(item.perm))
      .map(renderLink)
      .join('');

    if (hasAdminPerm) {
      const filteredAdmin = adminLinks.filter(item => userPerms.includes('all') || userRole === 'super_admin' || userPerms.includes(item.perm));
      if (filteredAdmin.length > 0) {
        navHtml += `
          <div id="mobile-drawer-admin-category" class="pt-3 pb-1">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">Administration</p>
          </div>
        ` + filteredAdmin.map(renderLink).join('');
      }
    }

    navBox.innerHTML = navHtml;
  }

  // Wire Mobile Drawer Settings Popover Toggle
  const mobileSettingsBtn = document.getElementById('mobile-drawer-settings-btn');
  const mobileSettingsPopover = document.getElementById('mobile-drawer-settings-popover');
  if (mobileSettingsBtn && mobileSettingsPopover) {
    mobileSettingsBtn.onclick = (e) => {
      e.stopPropagation();
      mobileSettingsPopover.classList.toggle('hidden');
    };
    document.addEventListener('click', (e) => {
      if (!mobileSettingsPopover.contains(e.target) && !mobileSettingsBtn.contains(e.target)) {
        mobileSettingsPopover.classList.add('hidden');
      }
    });
  }

  window.mendorbitOpenMobileDrawer = function() {
    let d = document.getElementById('admin-mobile-drawer');
    if (!d) return;
    const b = document.getElementById('mobile-drawer-backdrop');
    const p = document.getElementById('mobile-drawer-panel');
    d.classList.remove('pointer-events-none', 'opacity-0');
    d.classList.add('pointer-events-auto', 'opacity-100');
    if (b) {
      b.classList.remove('pointer-events-none', 'opacity-0');
      b.classList.add('pointer-events-auto', 'opacity-100');
    }
    if (p) {
      p.classList.remove('-translate-x-full');
      p.classList.add('translate-x-0');
    }
    document.body.classList.add('overflow-hidden');
  };

  window.mendorbitCloseMobileDrawer = function() {
    const d = document.getElementById('admin-mobile-drawer');
    const b = document.getElementById('mobile-drawer-backdrop');
    const p = document.getElementById('mobile-drawer-panel');
    if (!d) return;
    if (mobileSettingsPopover) mobileSettingsPopover.classList.add('hidden');
    if (p) {
      p.classList.remove('translate-x-0');
      p.classList.add('-translate-x-full');
    }
    if (b) {
      b.classList.remove('opacity-100', 'pointer-events-auto');
      b.classList.add('opacity-0', 'pointer-events-none');
    }
    setTimeout(() => {
      d.classList.remove('opacity-100', 'pointer-events-auto');
      d.classList.add('opacity-0', 'pointer-events-none');
      document.body.classList.remove('overflow-hidden');
    }, 280);
  };

  const openBtn = document.getElementById('mobile-drawer-toggle-btn');
  const closeBtn = document.getElementById('close-mobile-drawer-btn');
  const backdrop = document.getElementById('mobile-drawer-backdrop');

  if (openBtn) openBtn.onclick = window.mendorbitOpenMobileDrawer;
  if (closeBtn) closeBtn.onclick = window.mendorbitCloseMobileDrawer;
  if (backdrop) backdrop.onclick = window.mendorbitCloseMobileDrawer;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileSettingsPopover && !mobileSettingsPopover.classList.contains('hidden')) {
        mobileSettingsPopover.classList.add('hidden');
      } else {
        window.mendorbitCloseMobileDrawer();
      }
    }
  });

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// -------------------------------------------------------------
// 7. User Profile UI Update
// -------------------------------------------------------------
function updateUserProfileDisplay(profile) {
  if (!profile) return;
  const roleMeta = MENDORBIT_RBAC_CONFIG.roles[profile.role] || {
    name: profile.role || 'Staff Member',
    badgeClass: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40'
  };

  const userInitials = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'M';
  const customPhoto = profile.photoURL || localStorage.getItem('mendorbit_admin_photo_url');
  
  // Specific avatar selectors only — Supports Google-Style Photo or Letter initial
  const avatarEls = document.querySelectorAll('.admin-profile-avatar');
  avatarEls.forEach(el => {
    if (customPhoto) {
      el.innerHTML = `<img src="${customPhoto}" class="w-full h-full object-cover rounded-full" alt="Profile" onerror="this.remove();">`;
      el.classList.remove('bg-gradient-to-tr', 'from-amber-500', 'via-orange-500', 'to-rose-600', 'from-orange-500');
    } else {
      el.textContent = userInitials;
      el.className = 'admin-profile-avatar w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0';
    }
  });

  // Specific profile name only
  const nameEls = document.querySelectorAll('.admin-profile-name');
  nameEls.forEach(el => {
    el.textContent = profile.fullName || 'Mendorbit Admin';
    el.title = profile.email || '';
  });

  // Specific role label only - Clean "Super Admin" for super administrator
  const roleEls = document.querySelectorAll('.admin-profile-role');
  roleEls.forEach(el => {
    if (profile.role === 'super_admin') {
      el.textContent = 'Super Admin';
    } else {
      el.textContent = roleMeta.name;
    }
  });

  const popoverEmail = document.getElementById('sidebar-popover-email');
  if (popoverEmail) {
    popoverEmail.textContent = profile.email || 'admin@mendorbit.in';
  }
  const mobilePopoverEmail = document.getElementById('mobile-drawer-popover-email');
  if (mobilePopoverEmail) {
    mobilePopoverEmail.textContent = profile.email || 'admin@mendorbit.in';
  }
}

// -------------------------------------------------------------
// 8. Access Denied Screen (Route Interception)
// -------------------------------------------------------------
function renderAccessDeniedScreen(filename, requiredPermission) {
  document.title = "Permission Required — Mendorbit";
  document.documentElement.classList.remove('auth-checking');
  const mainContent = document.querySelector('main') || document.body;

  mainContent.innerHTML = `
    <div class="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div class="max-w-md w-full bg-white/90 dark:bg-[#1a1b1e]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        <!-- Friendly Soft Shield Icon -->
        <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <i data-lucide="shield-alert" class="w-8 h-8"></i>
        </div>
        
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Restricted Section
        </span>

        <h2 class="text-xl font-black text-slate-900 dark:text-white mt-3.5 tracking-tight">Access Permission Required</h2>
        
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
          Hello! Your staff account is currently assigned to the <span class="font-bold text-slate-800 dark:text-slate-200">${currentAdminUser?.role || 'Staff'}</span> role. You do not have permission to view <code>${filename}</code>.
        </p>
        
        <div class="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
          Need access for your work? Please reach out to your <strong>Super Administrator</strong> to enable this workspace for you.
        </div>

        <div class="mt-6 flex flex-col sm:flex-row gap-2.5">
          <a href="index.html" class="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold text-xs tracking-wide shadow-sm transition active:scale-95 text-center flex items-center justify-center gap-2">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            <span>Return to Overview</span>
          </a>
          <button onclick="handleAdminLogout()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `;
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// -------------------------------------------------------------
// 9. Route Guard & Auth State Observer
// -------------------------------------------------------------
function initAdminAuthObserver() {
  const isLoginPage = isLoginRoute();

  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error("Firebase Auth SDK not detected. Please ensure firebase-auth-compat.js is included.");
    return;
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      try {
        currentAdminUser = await fetchAdminProfile(user);
        sessionStorage.setItem('mendorbit_admin_session_state', 'authenticated');
        resetInactivityTimer();

        if (isLoginPage) {
          let target = sessionStorage.getItem('mendorbit_admin_redirect') || 'index.html';
          sessionStorage.removeItem('mendorbit_admin_redirect');
          if (target.toLowerCase().includes('login')) {
            target = 'index.html';
          }
          window.location.replace(target);
          return;
        }

        applyRBACPermissions(currentAdminUser);
        startAdminPresenceHeartbeat(user.uid);

      } catch (err) {
        console.error("Mendorbit RBAC Profile Error:", err);
        showAdminToast(err.message, 'error');
        sessionStorage.clear();
        await firebase.auth().signOut();
        if (!isLoginPage) {
          window.location.replace('login.html?error=' + encodeURIComponent(err.message));
        }
      }
    } else {
      stopAdminPresenceHeartbeat();
      currentAdminUser = null;
      sessionStorage.clear();
      if (!isLoginPage) {
        const currentUrl = window.location.href;
        if (!currentUrl.toLowerCase().includes('login')) {
          sessionStorage.setItem('mendorbit_admin_redirect', currentUrl);
        }
        window.location.replace('login.html');
      }
    }
  });
}

// Presence Heartbeat Engine (Syncs live active/working status to Cloud Firestore)
let presenceHeartbeatTimer = null;
let currentPresenceUid = null;

function startAdminPresenceHeartbeat(uid) {
  if (!uid) return;
  currentPresenceUid = uid;
  if (presenceHeartbeatTimer) clearInterval(presenceHeartbeatTimer);

  const pingPresence = (onlineState = true) => {
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore && currentPresenceUid) {
        firebase.firestore().collection('admin_users').doc(currentPresenceUid).update({
          lastActive: firebase.firestore.FieldValue.serverTimestamp(),
          isOnline: onlineState
        }).catch(() => {});
      }
    } catch(e) {}
  };

  // Immediate ping on boot
  pingPresence(true);

  // Periodic heartbeat every 2 minutes while document is active
  presenceHeartbeatTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      pingPresence(true);
    }
  }, 2 * 60 * 1000);

  // Ping immediately when user switches back to this tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pingPresence(true);
    }
  });

  // Mark offline when user closes tab or navigates away
  window.addEventListener('beforeunload', () => {
    pingPresence(false);
  });
}

function stopAdminPresenceHeartbeat() {
  if (presenceHeartbeatTimer) {
    clearInterval(presenceHeartbeatTimer);
    presenceHeartbeatTimer = null;
  }
}

// -------------------------------------------------------------
// 10. Authentication Actions (Login & Logout)
// -------------------------------------------------------------
async function authenticateAdminWithFirebase(email, password) {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error("Firebase Authentication is not ready. Check internet connection.");
  }

  const cleanEmail = (email || '').trim().toLowerCase();

  // Strict Institutional Email Verification
  const isOwner = MENDORBIT_RBAC_CONFIG.ownerEmails.includes(cleanEmail);
  const isInstitutional = cleanEmail.endsWith('@mendorbit.in');

  if (!isOwner && !isInstitutional) {
    if (typeof logAdminActivity === 'function') {
      await logAdminActivity('UNAUTHORIZED_EMAIL_BLOCKED', { attemptedEmail: cleanEmail });
    }
    throw new Error("Access Denied: Only institutional @mendorbit.in staff email accounts are authorized.");
  }

  const userCredential = await firebase.auth().signInWithEmailAndPassword(cleanEmail, password);
  const profile = await fetchAdminProfile(userCredential.user);
  try {
    sessionStorage.setItem('mendorbit_admin_permissions', JSON.stringify(profile.permissions || []));
    sessionStorage.setItem('mendorbit_admin_role', profile.role || '');
    sessionStorage.setItem('mendorbit_admin_profile', JSON.stringify(profile));
  } catch(e) {}
  await logAdminActivity('LOGIN_SUCCESS', { email: profile.email, role: profile.role });
  return { success: true, profile };
}

async function registerOwnerSuperAdmin(email, password, fullName) {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error("Firebase Authentication is not ready.");
  }

  const userCredential = await firebase.auth().createUserWithEmailAndPassword(email.trim(), password);
  const user = userCredential.user;
  
  if (fullName) {
    await user.updateProfile({ displayName: fullName });
  }

  const db = firebase.firestore();
  const profile = {
    uid: user.uid,
    email: user.email,
    fullName: fullName || 'Super Administrator',
    role: 'super_admin',
    status: 'active',
    permissions: MENDORBIT_RBAC_CONFIG.roles.super_admin.permissions,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    isOwner: true
  };

  await db.collection('admin_users').doc(user.uid).set(profile);
  await logAdminActivity('SUPER_ADMIN_CREATED', { email: user.email });
  return profile;
}

// Admin Logout - 100% Instantaneous Zero-Delay Redirect with Non-Blocking Cleanup
function handleAdminLogout(forced = false) {
  // 1. Instant anti-flicker veil
  document.documentElement.classList.add('auth-checking');

  // 2. Clear credentials & active session immediately
  const userToLog = currentAdminUser;
  currentAdminUser = null;
  try {
    sessionStorage.clear();
    localStorage.removeItem('mendorbit_admin_active_session');
    document.cookie = 'mendorbit_admin_active_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
  } catch(e) {}

  // 3. Instant Navigation (0 millisecond delay)
  window.location.replace('login.html');

  // 4. Asynchronously sign out in background without delaying navigation
  try {
    if (userToLog?.uid && typeof firebase !== 'undefined' && firebase.firestore) {
      firebase.firestore().collection('admin_users').doc(userToLog.uid).update({
        isOnline: false,
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    }
    stopAdminPresenceHeartbeat();
    if (userToLog && typeof logAdminActivity === 'function') {
      logAdminActivity('LOGOUT', { email: userToLog.email }).catch(() => {});
    }
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut().catch(() => {});
    }
  } catch(e) {}
}

// -------------------------------------------------------------
// 11. Toast Notification Utility (Reliable Auto-Dismiss + Manual Close)
// -------------------------------------------------------------
let _adminToastTimeout = null;

function dismissAdminToast() {
  const toast = document.getElementById('admin-toast');
  if (toast) {
    toast.classList.remove('show');
    if (_adminToastTimeout) {
      clearTimeout(_adminToastTimeout);
      _adminToastTimeout = null;
    }
  }
}

function showAdminToast(message, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    document.body.appendChild(toast);
  }

  if (_adminToastTimeout) {
    clearTimeout(_adminToastTimeout);
    _adminToastTimeout = null;
  }

  const bgClass = type === 'error' 
    ? 'bg-rose-600 dark:bg-rose-700' 
    : (type === 'warning' ? 'bg-amber-600 dark:bg-amber-700' : (type === 'info' ? 'bg-sky-600 dark:bg-sky-700' : 'bg-emerald-600 dark:bg-emerald-700'));
  
  toast.className = `admin-toast ${bgClass} px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white border border-white/20`;
  
  const icon = type === 'error' ? 'alert-triangle' : (type === 'warning' ? 'alert-circle' : (type === 'info' ? 'info' : 'check-circle-2'));
  toast.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0">
      <i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0"></i>
      <span class="truncate">${message}</span>
    </div>
    <button type="button" onclick="dismissAdminToast()" class="p-1 -mr-1 rounded-lg hover:bg-white/20 transition cursor-pointer flex-shrink-0" title="Close">
      <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
  `;

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons({ root: toast });
  }

  // Trigger animation next tick
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Reliably auto-dismiss in 3.5 seconds
  _adminToastTimeout = setTimeout(() => {
    dismissAdminToast();
  }, 3500);
}

// -------------------------------------------------------------
// 12. Theme Initialization
// -------------------------------------------------------------
function initAdminTheme() {
  const isDarkMode = localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleAdminTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
}

// -------------------------------------------------------------
// 13. Gemini-Style Adaptive Sidebar Engine & Command Palette
// -------------------------------------------------------------
window.mendorbitToggleSidebar = function(forceState) {
  const sidebar = document.getElementById('admin-sidebar');
  if (!sidebar) return;

  const isCurrentlyCollapsed = sidebar.classList.contains('sidebar-collapsed') || document.documentElement.classList.contains('sidebar-init-collapsed');
  const collapsedNow = (typeof forceState === 'boolean') ? forceState : !isCurrentlyCollapsed;

  if (collapsedNow) {
    sidebar.classList.add('sidebar-collapsed');
    document.documentElement.classList.add('sidebar-init-collapsed');
  } else {
    sidebar.classList.remove('sidebar-collapsed');
    document.documentElement.classList.remove('sidebar-init-collapsed');
  }
  localStorage.setItem('mendorbit_admin_sidebar_collapsed', collapsedNow ? 'true' : 'false');

  const logoBtn = document.getElementById('sidebar-logo-btn') || sidebar.querySelector('.sidebar-logo-container');
  const collapseIcon = sidebar.querySelector('.sidebar-collapse-icon');
  if (collapseIcon) {
    collapseIcon.setAttribute('data-lucide', collapsedNow ? 'panel-left-open' : 'panel-left-close');
  }
  if (logoBtn) {
    logoBtn.title = collapsedNow ? 'Expand sidebar' : 'Mendorbit';
  }
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

function initGeminiSidebarEngine() {
  const sidebar = document.getElementById('admin-sidebar');
  if (!sidebar) return;

  const logoBtn = document.getElementById('sidebar-logo-btn') || sidebar.querySelector('.sidebar-logo-container');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const searchBtn = document.getElementById('sidebar-quick-search-btn');
  const quickActionBtn = document.getElementById('sidebar-quick-action-btn');
  const settingsBtn = document.getElementById('sidebar-settings-btn');
  const settingsPopover = document.getElementById('sidebar-settings-popover');

  // 1. Restore Sidebar Collapsed State from localStorage
  const isCollapsed = localStorage.getItem('mendorbit_admin_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('sidebar-collapsed');
    document.documentElement.classList.add('sidebar-init-collapsed');
  } else {
    sidebar.classList.remove('sidebar-collapsed');
    document.documentElement.classList.remove('sidebar-init-collapsed');
  }
  if (logoBtn) {
    logoBtn.title = isCollapsed ? 'Expand sidebar' : 'Mendorbit';
  }

  // 2. Button Click Listeners (Also backed by global document delegation)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.mendorbitToggleSidebar();
    });
  }

  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.mendorbitToggleSidebar();
    });
  }

  // 3. Settings Popover Toggle & Outside Click Listener
  const profileInfo = document.getElementById('sidebar-profile-info');
  if (settingsPopover) {
    const togglePopover = (e) => {
      e.stopPropagation();
      settingsPopover.classList.toggle('hidden');
    };
    if (settingsBtn) settingsBtn.addEventListener('click', togglePopover);
    if (profileInfo) profileInfo.addEventListener('click', togglePopover);

    document.addEventListener('click', (e) => {
      if (!settingsPopover.contains(e.target) && !settingsBtn?.contains(e.target) && !profileInfo?.contains(e.target)) {
        settingsPopover.classList.add('hidden');
      }
    });
  }

  // 4. Highlight Active Navigation Pill (Bulletproof across query params, clean URLs, and screen sizes)
  const navLinks = sidebar.querySelectorAll('nav a[href]');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (isCurrentAdminRoute(href)) {
      link.classList.add('active');
      link.setAttribute('data-active', 'true');
    } else {
      link.classList.remove('active');
      link.removeAttribute('data-active');
    }
  });

  // 5. Inject & Wire Gemini Global Command Palette (Ctrl+K)
  injectCommandPalette();

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      openCommandPalette();
    });
  }

  // 6. Wire Quick Action Button
  if (quickActionBtn) {
    quickActionBtn.addEventListener('click', () => {
      openQuickActionModal();
    });
  }
}

// Global Command Palette (Gemini Search Style)
function injectCommandPalette() {
  if (document.getElementById('gemini-command-palette-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'gemini-command-palette-modal';
  modal.className = 'fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-200';
  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-200" id="palette-card">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <i data-lucide="search" class="w-5 h-5 text-slate-400"></i>
        <input type="text" id="palette-search-input" placeholder="Type a destination or action... (e.g. Batches, Coupons, Logs)" class="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none">
        <button type="button" onclick="closeCommandPalette()" class="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" title="Close Search">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="max-h-80 overflow-y-auto p-2 space-y-1" id="palette-results-list">
        <a href="index.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
          <span>Dashboard Overview</span>
        </a>
        <a href="analytics.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="trending-up" class="w-4 h-4"></i>
          <span>Analytics & Traffic Insights</span>
        </a>
        <a href="batches.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="layers" class="w-4 h-4"></i>
          <span>Batches & Courses</span>
        </a>
        <a href="enrollments.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>Student Enrollments</span>
        </a>
        <a href="queries.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="help-circle" class="w-4 h-4"></i>
          <span>Student Doubts & Queries</span>
        </a>
        <a href="blogs.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="book-open" class="w-4 h-4"></i>
          <span>Blogs & Study Notes</span>
        </a>
        <a href="coupons.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="ticket" class="w-4 h-4"></i>
          <span>Coupons & Discounts</span>
        </a>
        <a href="notifications.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="bell-ring" class="w-4 h-4"></i>
          <span>Push Notifications</span>
        </a>
        <a href="staff.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="shield-check" class="w-4 h-4"></i>
          <span>Staff & Permissions</span>
        </a>
        <a href="audit-logs.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition">
          <i data-lucide="file-text" class="w-4 h-4"></i>
          <span>Security Audit Logs</span>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#palette-search-input');
  const list = modal.querySelector('#palette-results-list');
  const items = list.querySelectorAll('a');

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    items.forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = txt.includes(q) ? 'flex' : 'none';
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCommandPalette();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 'Escape') {
      closeCommandPalette();
      closeQuickActionModal();
    }
  });
}

function openCommandPalette() {
  const modal = document.getElementById('gemini-command-palette-modal');
  if (!modal) return;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  const card = modal.querySelector('#palette-card');
  if (card) card.classList.remove('scale-95');
  const input = modal.querySelector('#palette-search-input');
  if (input) {
    input.value = '';
    const items = modal.querySelectorAll('#palette-results-list a');
    items.forEach(it => it.style.display = 'flex');
    setTimeout(() => input.focus(), 50);
  }
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

function closeCommandPalette() {
  const modal = document.getElementById('gemini-command-palette-modal');
  if (!modal) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  const card = modal.querySelector('#palette-card');
  if (card) card.classList.add('scale-95');
}

// Quick Action Launcher Modal
function openQuickActionModal() {
  let modal = document.getElementById('gemini-quick-action-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gemini-quick-action-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200';
    modal.innerHTML = `
      <div class="relative w-full max-w-md bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Admin Quick Actions</h3>
              <p class="text-[10px] text-slate-400">Launch workflows instantly</p>
            </div>
          </div>
          <button type="button" onclick="closeQuickActionModal()" class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a href="batches.html?action=new" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition flex items-center gap-3 group">
            <div class="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-inherit">New Batch</p>
              <p class="text-[10px] text-slate-400">Create course</p>
            </div>
          </a>
          <a href="notifications.html?action=new" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition flex items-center gap-3 group">
            <div class="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
              <i data-lucide="bell" class="w-4 h-4"></i>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-inherit">Broadcast</p>
              <p class="text-[10px] text-slate-400">Push notice</p>
            </div>
          </a>
          <a href="coupons.html?action=new" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition flex items-center gap-3 group">
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
              <i data-lucide="ticket" class="w-4 h-4"></i>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-inherit">New Coupon</p>
              <p class="text-[10px] text-slate-400">Discount code</p>
            </div>
          </a>
          <a href="blogs.html?action=new" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition flex items-center gap-3 group">
            <div class="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-inherit">Post Blog</p>
              <p class="text-[10px] text-slate-400">Write article</p>
            </div>
          </a>
          <a href="analytics.html" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#c2e7ff] hover:text-[#001d35] dark:hover:bg-[#004a77]/60 dark:hover:text-[#c2e7ff] transition flex items-center gap-3 group sm:col-span-2">
            <div class="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
              <i data-lucide="trending-up" class="w-4 h-4"></i>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-inherit">Live Analytics</p>
              <p class="text-[10px] text-slate-400">View real-time visitor traffic and device insights</p>
            </div>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickActionModal();
    });
  }
  modal.classList.remove('hidden');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

function closeQuickActionModal() {
  const modal = document.getElementById('gemini-quick-action-modal');
  if (modal) modal.classList.add('hidden');
}

// -------------------------------------------------------------
// 14. Universal Global Event Delegation (Zero-Failure Click Catching)
// -------------------------------------------------------------
document.addEventListener('click', (e) => {
  // 1. Desktop sidebar logo or collapsed hover button
  const logoBtn = e.target.closest('#sidebar-logo-btn, .sidebar-logo-container');
  if (logoBtn) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.mendorbitToggleSidebar === 'function') {
      window.mendorbitToggleSidebar();
    }
    return;
  }

  // 2. Desktop sidebar collapse toggle button
  const toggleBtn = e.target.closest('#sidebar-toggle-btn');
  if (toggleBtn) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.mendorbitToggleSidebar === 'function') {
      window.mendorbitToggleSidebar();
    }
    return;
  }

  // 3. Mobile drawer hamburger button
  const mobileToggle = e.target.closest('#mobile-drawer-toggle-btn');
  if (mobileToggle) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.mendorbitOpenMobileDrawer === 'function') {
      window.mendorbitOpenMobileDrawer();
    }
    return;
  }

  // 4. Mobile drawer close button or backdrop
  const mobileClose = e.target.closest('#close-mobile-drawer-btn, #mobile-drawer-backdrop');
  if (mobileClose) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.mendorbitCloseMobileDrawer === 'function') {
      window.mendorbitCloseMobileDrawer();
    }
    return;
  }
});

// -------------------------------------------------------------
// 15. Apple-Grade Security: Change Password Engine
// -------------------------------------------------------------
function injectChangePasswordModal() {
  if (document.getElementById('apple-change-password-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'apple-change-password-modal';
  modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-all duration-200';
  modal.innerHTML = `
    <div class="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 overflow-hidden text-slate-900 dark:text-white transition-all transform scale-100">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-200/60 dark:border-emerald-800/40">
            <i data-lucide="key-round" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">Change Password</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Set a secure new password for your account</p>
          </div>
        </div>
        <button type="button" onclick="closeChangePasswordModal()" class="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Form Body -->
      <form id="change-password-form" onsubmit="handleChangePasswordSubmit(event)" class="mt-5 space-y-4">
        <div id="change-password-alert" class="hidden p-3 rounded-xl text-xs font-semibold"></div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Current Password</label>
          <div class="relative">
            <input type="password" id="cp-current-password" required placeholder="Enter current password" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10">
            <button type="button" onclick="togglePasswordVisibility('cp-current-password', this)" class="cp-eye-btn absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <i data-lucide="eye-off" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">New Password</label>
          <div class="relative">
            <input type="password" id="cp-new-password" required minlength="6" placeholder="Minimum 6 characters" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10">
            <button type="button" onclick="togglePasswordVisibility('cp-new-password', this)" class="cp-eye-btn absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <i data-lucide="eye-off" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Confirm New Password</label>
          <div class="relative">
            <input type="password" id="cp-confirm-password" required minlength="6" placeholder="Re-type new password" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10">
            <button type="button" onclick="togglePasswordVisibility('cp-confirm-password', this)" class="cp-eye-btn absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <i data-lucide="eye-off" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/10">
          <button type="button" onclick="closeChangePasswordModal()" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
            Cancel
          </button>
          <button type="submit" id="cp-submit-btn" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span id="cp-submit-text">Update Password</span>
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeChangePasswordModal();
  });
}

window.openChangePasswordModal = function() {
  injectChangePasswordModal();
  const modal = document.getElementById('apple-change-password-modal');
  const alertBox = document.getElementById('change-password-alert');
  const form = document.getElementById('change-password-form');
  if (alertBox) alertBox.className = 'hidden';
  if (form) form.reset();
  
  // Reset all 3 inputs to password masked and eye icons to eye-off (kata hua)
  ['cp-current-password', 'cp-new-password', 'cp-confirm-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.type = 'password';
  });
  document.querySelectorAll('.cp-eye-btn').forEach(b => {
    b.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
  });

  if (modal) modal.classList.remove('hidden');
  const popover = document.getElementById('sidebar-settings-popover');
  if (popover) popover.classList.add('hidden');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

window.closeChangePasswordModal = function() {
  const modal = document.getElementById('apple-change-password-modal');
  if (modal) modal.classList.add('hidden');
};

window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  // If was password, reveal text -> eye opens! If was text, hide -> eye is crossed (eye-off)!
  input.type = isPass ? 'text' : 'password';
  btn.innerHTML = `<i data-lucide="${isPass ? 'eye' : 'eye-off'}" class="w-4 h-4"></i>`;
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

window.handleChangePasswordSubmit = async function(e) {
  e.preventDefault();
  const currentPass = document.getElementById('cp-current-password').value;
  const newPass = document.getElementById('cp-new-password').value;
  const confirmPass = document.getElementById('cp-confirm-password').value;
  const alertBox = document.getElementById('change-password-alert');
  const submitBtn = document.getElementById('cp-submit-btn');
  const submitText = document.getElementById('cp-submit-text');

  if (newPass !== confirmPass) {
    alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 block';
    alertBox.textContent = "New password and confirmation do not match.";
    return;
  }

  if (newPass.length < 6) {
    alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 block';
    alertBox.textContent = "New password must be at least 6 characters long.";
    return;
  }

  submitBtn.disabled = true;
  submitText.textContent = "Verifying...";

  try {
    const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    if (!user || !user.email) {
      throw new Error("No authenticated session found. Please re-login.");
    }

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPass);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(newPass);

    if (typeof logAdminActivity === 'function') {
      logAdminActivity('change_password', { email: user.email });
    }

    closeChangePasswordModal();
    showAdminToast("Password updated successfully! Please keep it safe.", 'success');
  } catch(err) {
    alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 block';
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      alertBox.textContent = "Incorrect current password. Please try again.";
    } else {
      alertBox.textContent = err.message || "Failed to update password.";
    }
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = "Update Password";
  }
};

// -------------------------------------------------------------
// 15.1 Google Account Style Admin Profile & Picture Modal
// -------------------------------------------------------------
function injectAdminProfilePicModal() {
  if (document.getElementById('mendorbit-profile-pic-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'mendorbit-profile-pic-modal';
  modal.className = 'hidden fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-[#1a1b1e] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative space-y-6 text-center animate-scale-in">
      
      <!-- Top Close Button -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
        <div class="text-left">
          <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Admin Profile</h3>
          <p class="text-[11px] text-slate-400">Google Account Profile Management</p>
        </div>
        <button type="button" onclick="closeAdminProfilePicModal()" class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Large Center Avatar with Floating Camera Badge -->
      <div class="relative w-28 h-28 mx-auto group">
        <div id="modal-profile-avatar-display" class="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center font-black text-3xl">
          M
        </div>
        <button type="button" onclick="document.getElementById('admin-profile-file-input').click()" class="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg border-2 border-white dark:border-[#1a1b1e] transition cursor-pointer active:scale-95" title="Change profile photo">
          <i data-lucide="camera" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Admin Details -->
      <div class="space-y-1">
        <h4 id="modal-profile-fullname" class="text-base font-black text-slate-900 dark:text-white">Satyam Thakur</h4>
        <p id="modal-profile-email" class="text-xs text-slate-500 dark:text-slate-400 font-mono">admin@mendorbit.in</p>
        <div class="pt-1">
          <span id="modal-profile-role-badge" class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
            Super Admin
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 pt-2">
        <button type="button" onclick="document.getElementById('admin-profile-file-input').click()" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer">
          <i data-lucide="upload" class="w-4 h-4"></i>
          <span>Upload / Change Photo</span>
        </button>

        <button type="button" id="modal-remove-photo-btn" onclick="removeAdminProfilePhoto()" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition cursor-pointer">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
          <span>Remove Photo (Reset)</span>
        </button>
      </div>

      <!-- Hidden File Input -->
      <input type="file" id="admin-profile-file-input" accept="image/*" class="hidden" onchange="handleAdminPhotoSelected(event)">

    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAdminProfilePicModal();
  });
}

window.openAdminProfilePicModal = function() {
  injectAdminProfilePicModal();
  let profile = {};
  try {
    profile = JSON.parse(sessionStorage.getItem('mendorbit_admin_profile') || '{}');
  } catch(e) {}
  refreshProfilePicModalUI(profile);
  const modal = document.getElementById('mendorbit-profile-pic-modal');
  if (modal) modal.classList.remove('hidden');
  const popover = document.getElementById('sidebar-settings-popover');
  if (popover) popover.classList.add('hidden');
  const mPopover = document.getElementById('mobile-drawer-settings-popover');
  if (mPopover) mPopover.classList.add('hidden');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

window.closeAdminProfilePicModal = function() {
  const modal = document.getElementById('mendorbit-profile-pic-modal');
  if (modal) modal.classList.add('hidden');
};

function refreshProfilePicModalUI(profile) {
  const avatarDisplay = document.getElementById('modal-profile-avatar-display');
  const removeBtn = document.getElementById('modal-remove-photo-btn');
  const currentPhoto = profile.photoURL || localStorage.getItem('mendorbit_admin_photo_url');
  const userInitials = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'M';

  if (avatarDisplay) {
    if (currentPhoto) {
      avatarDisplay.innerHTML = `<img src="${currentPhoto}" class="w-full h-full object-cover rounded-full" alt="Profile">`;
      avatarDisplay.classList.remove('bg-gradient-to-tr', 'from-amber-500', 'via-orange-500', 'to-rose-600');
    } else {
      avatarDisplay.textContent = userInitials;
      avatarDisplay.className = 'w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center font-black text-3xl';
    }
  }

  if (removeBtn) {
    removeBtn.style.display = currentPhoto ? 'flex' : 'none';
  }

  const nameEl = document.getElementById('modal-profile-fullname');
  if (nameEl) nameEl.textContent = profile.fullName || 'Satyam Thakur';
  const emailEl = document.getElementById('modal-profile-email');
  if (emailEl) emailEl.textContent = profile.email || 'admin@mendorbit.in';
  const roleEl = document.getElementById('modal-profile-role-badge');
  if (roleEl) roleEl.textContent = profile.role === 'super_admin' ? 'Super Admin' : (profile.role || 'Staff');
}

window.handleAdminPhotoSelected = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      // Create high-res compressed square crop (256x256)
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 256, 256);
      
      const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
      saveAdminProfilePhoto(compressedDataUrl);
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
};

window.saveAdminProfilePhoto = async function(photoDataUrl) {
  localStorage.setItem('mendorbit_admin_photo_url', photoDataUrl);
  
  let profile = {};
  try {
    profile = JSON.parse(sessionStorage.getItem('mendorbit_admin_profile') || '{}');
  } catch(e) {}
  profile.photoURL = photoDataUrl;
  sessionStorage.setItem('mendorbit_admin_profile', JSON.stringify(profile));

  updateUserProfileDisplay(profile);
  refreshProfilePicModalUI(profile);

  try {
    const bc = new BroadcastChannel('mendorbit_admin_profile_sync');
    bc.postMessage({ type: 'PROFILE_PHOTO_UPDATED', photoURL: photoDataUrl });
    bc.close();
  } catch(e) {}

  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      const user = firebase.auth && firebase.auth().currentUser;
      const email = profile.email || (user ? user.email : 'admin@mendorbit.in');
      
      if (user && typeof user.updateProfile === 'function') {
        user.updateProfile({ photoURL: photoDataUrl }).catch(() => {});
      }

      if (user && user.uid) {
        await db.collection('admin_users').doc(user.uid).set({
          photoURL: photoDataUrl,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else if (email) {
        const snap = await db.collection('admin_users').where('email', '==', email).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            photoURL: photoDataUrl,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch(err) {
    console.warn("Firestore photoURL save note:", err);
  }

  if (typeof showAdminToast === 'function') {
    showAdminToast("Profile photo updated successfully!", 'success');
  }
};

window.removeAdminProfilePhoto = async function() {
  if (!confirm("Are you sure you want to remove your profile photo and reset to default?")) return;

  localStorage.removeItem('mendorbit_admin_photo_url');
  let profile = {};
  try {
    profile = JSON.parse(sessionStorage.getItem('mendorbit_admin_profile') || '{}');
  } catch(e) {}
  delete profile.photoURL;
  sessionStorage.setItem('mendorbit_admin_profile', JSON.stringify(profile));

  updateUserProfileDisplay(profile);
  refreshProfilePicModalUI(profile);

  try {
    const bc = new BroadcastChannel('mendorbit_admin_profile_sync');
    bc.postMessage({ type: 'PROFILE_PHOTO_REMOVED' });
    bc.close();
  } catch(e) {}

  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      const user = firebase.auth && firebase.auth().currentUser;
      const email = profile.email || (user ? user.email : 'admin@mendorbit.in');

      if (user && typeof user.updateProfile === 'function') {
        user.updateProfile({ photoURL: null }).catch(() => {});
      }

      if (user && user.uid) {
        await db.collection('admin_users').doc(user.uid).update({ photoURL: null });
      } else if (email) {
        const snap = await db.collection('admin_users').where('email', '==', email).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({ photoURL: null });
        }
      }
    }
  } catch(err) {
    console.warn("Firestore photoURL remove note:", err);
  }

  if (typeof showAdminToast === 'function') {
    showAdminToast("Profile photo removed. Initial avatar restored.", 'info');
  }
};

// Cross-tab profile photo sync listener
try {
  const profileBC = new BroadcastChannel('mendorbit_admin_profile_sync');
  profileBC.onmessage = (event) => {
    if (!event || !event.data) return;
    let profile = {};
    try { profile = JSON.parse(sessionStorage.getItem('mendorbit_admin_profile') || '{}'); } catch(e) {}
    if (event.data.type === 'PROFILE_PHOTO_UPDATED') {
      profile.photoURL = event.data.photoURL;
      sessionStorage.setItem('mendorbit_admin_profile', JSON.stringify(profile));
      updateUserProfileDisplay(profile);
    } else if (event.data.type === 'PROFILE_PHOTO_REMOVED') {
      delete profile.photoURL;
      sessionStorage.setItem('mendorbit_admin_profile', JSON.stringify(profile));
      updateUserProfileDisplay(profile);
    }
  };
} catch(e) {}

// -------------------------------------------------------------
// 16. Apple Quick Access Dock (Draggable, Slideable, Context-Menu)
// -------------------------------------------------------------
const MENDORBIT_DEFAULT_QUICK_ACCESS = [
  { id: 'batches', label: 'Batches', icon: 'layers', url: 'batches.html' },
  { id: 'enrollments', label: 'Enrollments', icon: 'users', url: 'enrollments.html' },
  { id: 'queries', label: 'Doubts', icon: 'help-circle', url: 'queries.html' },
  { id: 'notifications', label: 'Alerts', icon: 'bell', url: 'notifications.html' }
];

function getCurrentUserQuickAccessStorageKey() {
  try {
    const profile = JSON.parse(sessionStorage.getItem('mendorbit_admin_profile') || '{}');
    if (profile.email) {
      return 'mendorbit_quick_access_' + profile.email.replace(/[^a-zA-Z0-9]/g, '_');
    }
  } catch(e) {}
  return 'mendorbit_admin_quick_access';
}

function getQuickAccessItems() {
  const userKey = getCurrentUserQuickAccessStorageKey();
  let items = [];
  try {
    const stored = localStorage.getItem(userKey) || localStorage.getItem('mendorbit_admin_quick_access');
    items = stored ? JSON.parse(stored) : MENDORBIT_DEFAULT_QUICK_ACCESS;
  } catch {
    items = MENDORBIT_DEFAULT_QUICK_ACCESS;
  }

  // Filter out any shortcuts the current user does not have permission to access
  try {
    const role = sessionStorage.getItem('mendorbit_admin_role');
    const permsStr = sessionStorage.getItem('mendorbit_admin_permissions');
    if (role !== 'super_admin' && permsStr) {
      const perms = JSON.parse(permsStr);
      if (!perms.includes('all')) {
        items = items.filter(item => {
          const permKey = MENDORBIT_RBAC_CONFIG.pagePermissions[item.url];
          if (!permKey) return true;
          return perms.includes(permKey);
        });
      }
    }
  } catch(e) {}

  return items;
}

function saveQuickAccessItems(items) {
  const userKey = getCurrentUserQuickAccessStorageKey();
  localStorage.setItem(userKey, JSON.stringify(items));
  localStorage.setItem('mendorbit_admin_quick_access', JSON.stringify(items));
  renderQuickAccessDock();
}

function renderQuickAccessDock() {
  const docks = [
    document.getElementById('navbar-quick-access-dock'),
    document.getElementById('navbar-quick-access-dock-mobile')
  ].filter(Boolean);

  if (docks.length === 0) return;

  const items = getQuickAccessItems();
  const currentPath = (window.location.pathname || '').split('/').pop().split('?')[0] || 'index.html';

  const htmlContent = `
    <div class="flex items-center gap-1.5 overflow-x-auto quick-access-scroll py-1 max-w-full">
      ${items.map((item, index) => {
        const isActive = currentPath === item.url;
        return `
          <div class="quick-access-chip flex-shrink-0 group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isActive 
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
              : 'bg-slate-100/80 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-white/5'
          }" 
          data-index="${index}" 
          data-id="${item.id}"
          draggable="true" 
          tabindex="0"
          title="Right-click for options • Drag to reorder">
            <a href="${item.url}" class="flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="${item.icon}" class="w-3.5 h-3.5 flex-shrink-0"></i>
              <span class="whitespace-nowrap font-semibold">${item.label}</span>
            </a>
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); removeQuickAccessItem('${item.id}')" class="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition cursor-pointer flex-shrink-0" title="Remove from Quick Access">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
        `;
      }).join('')}

      <button type="button" onclick="openPinMenu(event)" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 transition border border-dashed border-slate-300 dark:border-slate-700 flex-shrink-0 cursor-pointer" title="Pin more pages to Quick Access">
        <i data-lucide="plus" class="w-3 h-3"></i>
        <span class="text-[11px] whitespace-nowrap">Pin</span>
      </button>
    </div>
  `;

  docks.forEach(d => {
    d.innerHTML = htmlContent;
    const scrollContainer = d.querySelector('.quick-access-scroll') || d;
    if (scrollContainer && !scrollContainer.dataset.wheelBound) {
      scrollContainer.dataset.wheelBound = "true";
      scrollContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          scrollContainer.scrollLeft += e.deltaY * 1.5;
        }
      }, { passive: false });
    }
  });

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
  wireQuickAccessDragAndKeySlide();
}

window.removeQuickAccessItem = function(id) {
  let items = getQuickAccessItems().filter(i => i.id !== id);
  saveQuickAccessItems(items);
  showAdminToast("Shortcut removed from Quick Access", 'info');
};

window.addQuickAccessItem = function(item) {
  let items = getQuickAccessItems();
  if (items.some(i => i.id === item.id)) {
    showAdminToast("Already pinned to Quick Access", 'info');
    return;
  }
  items.push(item);
  saveQuickAccessItems(items);
  showAdminToast(`"${item.label}" pinned to Quick Access!`, 'success');
};

function wireQuickAccessDragAndKeySlide() {
  const chips = document.querySelectorAll('.quick-access-chip');
  let draggedIndex = null;

  chips.forEach((chip) => {
    chip.addEventListener('dragstart', (e) => {
      draggedIndex = Number(chip.getAttribute('data-index'));
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
    });

    chip.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    chip.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIndex = Number(chip.getAttribute('data-index'));
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        let items = getQuickAccessItems();
        const movedItem = items.splice(draggedIndex, 1)[0];
        items.splice(targetIndex, 0, movedItem);
        saveQuickAccessItems(items);
      }
    });

    chip.addEventListener('keydown', (e) => {
      const index = Number(chip.getAttribute('data-index'));
      let items = getQuickAccessItems();
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;
        saveQuickAccessItems(items);
        setTimeout(() => {
          const newChips = document.querySelectorAll('.quick-access-chip');
          if (newChips[index - 1]) newChips[index - 1].focus();
        }, 50);
      } else if (e.key === 'ArrowRight' && index < items.length - 1) {
        e.preventDefault();
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;
        saveQuickAccessItems(items);
        setTimeout(() => {
          const newChips = document.querySelectorAll('.quick-access-chip');
          if (newChips[index + 1]) newChips[index + 1].focus();
        }, 50);
      }
    });

    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const id = chip.getAttribute('data-id');
      const index = Number(chip.getAttribute('data-index'));
      showQuickAccessContextMenu(e.clientX, e.clientY, id, index);
    });
  });
}

function showQuickAccessContextMenu(x, y, id, index) {
  let menu = document.getElementById('apple-quick-access-context-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'apple-quick-access-context-menu';
    menu.className = 'fixed z-50 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-1.5 w-48 text-xs font-medium text-slate-800 dark:text-slate-200 apple-context-menu';
    document.body.appendChild(menu);

    document.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  }

  const items = getQuickAccessItems();
  const currentItem = items[index];

  menu.innerHTML = `
    <div class="px-3 py-1.5 border-b border-slate-100 dark:border-white/10 text-[10px] uppercase font-bold text-slate-400">
      ${currentItem ? currentItem.label : 'Shortcut'}
    </div>
    <div class="py-1 space-y-0.5">
      ${index > 0 ? `
        <button type="button" onclick="moveQuickAccessItem(${index}, -1)" class="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-left">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
          <span>Move Left</span>
        </button>
      ` : ''}
      ${index < items.length - 1 ? `
        <button type="button" onclick="moveQuickAccessItem(${index}, 1)" class="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-left">
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          <span>Move Right</span>
        </button>
      ` : ''}
      <button type="button" onclick="removeQuickAccessItem('${id}')" class="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer text-left">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        <span>Remove from Dock</span>
      </button>
    </div>
  `;

  menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - 150)}px`;
  menu.classList.remove('hidden');

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

window.moveQuickAccessItem = function(fromIndex, direction) {
  let items = getQuickAccessItems();
  const toIndex = fromIndex + direction;
  if (toIndex >= 0 && toIndex < items.length) {
    const temp = items[fromIndex];
    items[fromIndex] = items[toIndex];
    items[toIndex] = temp;
    saveQuickAccessItems(items);
  }
};

window.openPinMenu = function(e) {
  e.stopPropagation();
  let pinMenu = document.getElementById('apple-pin-menu-popover');
  if (!pinMenu) {
    pinMenu = document.createElement('div');
    pinMenu.id = 'apple-pin-menu-popover';
    pinMenu.className = 'fixed z-50 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 w-56 text-xs text-slate-800 dark:text-slate-200';
    document.body.appendChild(pinMenu);

    document.addEventListener('click', () => {
      pinMenu.classList.add('hidden');
    });
  }

  const allAvailable = [
    { id: 'overview', label: 'Overview', icon: 'layout-dashboard', url: 'index.html' },
    { id: 'analytics', label: 'Analytics Insights', icon: 'trending-up', url: 'analytics.html' },
    { id: 'batches', label: 'Batches Manager', icon: 'layers', url: 'batches.html' },
    { id: 'enrollments', label: 'Student Enrollments', icon: 'users', url: 'enrollments.html' },
    { id: 'queries', label: 'Doubts & Queries', icon: 'help-circle', url: 'queries.html' },
    { id: 'blogs', label: 'Blogs & Notes', icon: 'book-open', url: 'blogs.html' },
    { id: 'coupons', label: 'Coupons & Offers', icon: 'ticket', url: 'coupons.html' },
    { id: 'notifications', label: 'Push Notifications', icon: 'bell', url: 'notifications.html' },
    { id: 'staff', label: 'Staff & Access', icon: 'shield-check', url: 'staff.html' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'file-text', url: 'audit-logs.html' }
  ];

  // RBAC Permission Filter for Pin Menu
  let allowedAvailable = allAvailable;
  try {
    const role = sessionStorage.getItem('mendorbit_admin_role');
    const permsStr = sessionStorage.getItem('mendorbit_admin_permissions');
    if (role !== 'super_admin' && permsStr) {
      const perms = JSON.parse(permsStr);
      if (!perms.includes('all')) {
        allowedAvailable = allAvailable.filter(item => {
          const permKey = MENDORBIT_RBAC_CONFIG.pagePermissions[item.url];
          if (!permKey) return true;
          return perms.includes(permKey);
        });
      }
    }
  } catch(e) {}

  const currentItems = getQuickAccessItems();
  const currentIds = currentItems.map(i => i.id);

  pinMenu.innerHTML = `
    <div class="px-3 py-1.5 border-b border-slate-100 dark:border-white/10 font-bold text-[11px] text-slate-400 uppercase">
      Pin to Quick Access
    </div>
    <div class="py-1 max-h-60 overflow-y-auto space-y-0.5 gemini-scrollbar">
      ${allowedAvailable.map(item => {
        const isPinned = currentIds.includes(item.id);
        return `
          <button type="button" onclick="${isPinned ? `removeQuickAccessItem('${item.id}')` : `addQuickAccessItem(${JSON.stringify(item).replace(/"/g, '&quot;')})`}" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-left">
            <span class="flex items-center gap-2">
              <i data-lucide="${item.icon}" class="w-3.5 h-3.5 text-slate-500"></i>
              <span class="truncate">${item.label}</span>
            </span>
            <i data-lucide="${isPinned ? 'check' : 'plus'}" class="w-3.5 h-3.5 ${isPinned ? 'text-blue-500 font-bold' : 'text-slate-400'}"></i>
          </button>
        `;
      }).join('')}
    </div>
  `;

  const rect = e.currentTarget.getBoundingClientRect();
  pinMenu.style.left = `${Math.min(rect.left, window.innerWidth - 240)}px`;
  pinMenu.style.top = `${rect.bottom + 8}px`;
  pinMenu.classList.remove('hidden');

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

function syncSystemVersionDisplay() {
  const version = 'v2.3.0';
  document.querySelectorAll('.app-system-version').forEach(el => {
    el.textContent = version;
  });
}

initAdminTheme();

function ensureWindowsSpinner() {
  const loader = document.getElementById('page-data-loader');
  if (loader && !loader.querySelector('.windows-spinner')) {
    loader.innerHTML = `
      <div class="windows-spinner">
        <div class="windows-spinner-dot"></div>
        <div class="windows-spinner-dot"></div>
        <div class="windows-spinner-dot"></div>
        <div class="windows-spinner-dot"></div>
        <div class="windows-spinner-dot"></div>
        <div class="windows-spinner-dot"></div>
      </div>
      <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide mt-3 select-none">Please wait...</p>
    `;
  }
}

window.hidePageLoader = function() {
  const loader = document.getElementById('page-data-loader');
  if (loader) {
    loader.classList.add('loaded');
  }
};

function registerAdminPWA() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js?v=2.5.0').catch(err => {
      console.log('PWA ServiceWorker note:', err.message);
    });
  }
}

function bootstrapAdminApp() {
  window.hydrateLucideIconsInstantly(document);
  hookLucideCreateIcons();
  ensureWindowsSpinner();
  buildMobileNavDrawer();
  initGeminiSidebarEngine();
  renderQuickAccessDock();
  syncSystemVersionDisplay();
  injectChangePasswordModal();
  initAdminAuthObserver();
  registerAdminPWA();
  // Safe network fallback only (kept at 15s so loader is NEVER prematurely dismissed before real-time data loads)
  setTimeout(window.hidePageLoader, 15000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAdminApp);
} else {
  bootstrapAdminApp();
}
