// =========================================================================
// Mendorbit Enterprise Admin Authentication & RBAC Guard Engine (v2.2.0)
// Features: Zero-Flash Pre-Render Guard, Real Firebase Auth, Firestore RBAC,
// 30-Min Inactivity Auto-Logout, Universal Mobile Drawer, and Audit Logging
// =========================================================================

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
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
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
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
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
            <img src="assets/images/logo/logo.png?v=2.3.0" onerror="this.src='../assets/images/logo/logo.png'" alt="Logo" class="w-7 h-7 object-contain">
            <div>
              <span class="font-bold text-base text-slate-800 dark:text-slate-100 block leading-none">Mendorbit</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Console</span>
            </div>
          </div>
          <button type="button" id="close-mobile-drawer-btn" class="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <nav id="mobile-drawer-nav" class="p-4 space-y-1 font-semibold text-xs text-slate-600 dark:text-slate-300 flex-1 overflow-y-auto gemini-scrollbar">
        </nav>

        <div class="p-4 border-t border-[#e3e8ee] dark:border-[#282a2c] space-y-3 flex-shrink-0 bg-transparent">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="admin-profile-avatar w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                M
              </div>
              <div class="text-left">
                <p class="admin-profile-name text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">Mendorbit</p>
                <p class="admin-profile-role text-[10px] text-slate-500 dark:text-slate-400">Super Admin</p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button type="button" onclick="toggleAdminTheme()" class="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer" title="Toggle Theme">
                <i data-lucide="sun" class="w-4 h-4 dark:hidden"></i>
                <i data-lucide="moon" class="w-4 h-4 hidden dark:block text-indigo-400"></i>
              </button>
              <button type="button" onclick="openChangePasswordModal()" class="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer" title="Change Password">
                <i data-lucide="key-round" class="w-4 h-4"></i>
              </button>
              <button type="button" onclick="handleAdminLogout()" class="p-2 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer" title="Log Out">
                <i data-lucide="log-out" class="w-4 h-4"></i>
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

  const navBox = document.getElementById('mobile-drawer-nav');
  if (navBox) {
    const allLinks = [
      { href: 'index.html', label: 'Overview', icon: 'layout-dashboard', perm: 'overview' },
      { href: 'analytics.html', label: 'Analytics Studio', icon: 'trending-up', perm: 'analytics' },
      { href: 'batches.html', label: 'Batches Manager', icon: 'layers', perm: 'batches' },
      { href: 'enrollments.html', label: 'Student Enrollments', icon: 'users', perm: 'enrollments' },
      { href: 'queries.html', label: 'Doubts & Queries', icon: 'help-circle', perm: 'queries' },
      { href: 'blogs.html', label: 'Blogs & Notes', icon: 'book-open', perm: 'blogs' },
      { href: 'coupons.html', label: 'Coupons & Offers', icon: 'ticket', perm: 'coupons' },
      { href: 'notifications.html', label: 'Push Notifications', icon: 'bell-ring', perm: 'notifications' },
      { href: 'staff.html', label: 'Staff & Access', icon: 'shield-check', perm: 'staff' },
      { href: 'audit-logs.html', label: 'Audit & Logs', icon: 'file-text', perm: 'audit_logs' }
    ];

    navBox.innerHTML = allLinks
      .filter(item => {
        return userPerms.includes('all') || 
               userRole === 'super_admin' || 
               userPerms.includes(item.perm);
      })
      .map(item => {
        const isActive = currentFile === item.href;
        const activeClass = isActive 
          ? 'bg-[#c2e7ff] text-[#001d35] font-semibold dark:bg-[#004a77]/60 dark:text-[#c2e7ff]' 
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1e1f20]';
        return `
          <a href="${item.href}" class="flex items-center gap-3.5 px-4 py-2.5 rounded-full transition duration-150 ${activeClass}">
            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            <span>${item.label}</span>
          </a>
        `;
      }).join('');
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
    if (e.key === 'Escape') window.mendorbitCloseMobileDrawer();
  });

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// -------------------------------------------------------------
// 7. User Profile UI Update
// -------------------------------------------------------------
function updateUserProfileDisplay(profile) {
  const roleMeta = MENDORBIT_RBAC_CONFIG.roles[profile.role] || {
    name: profile.role || 'Staff Member',
    badgeClass: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40'
  };

  const userInitials = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'M';
  
  // Specific avatar selectors only — NEVER generic aside .w-8.h-8 which would destroy the logo!
  const avatarEls = document.querySelectorAll('.admin-profile-avatar');
  avatarEls.forEach(el => {
    el.textContent = userInitials;
  });

  // Specific profile name only
  const nameEls = document.querySelectorAll('.admin-profile-name');
  nameEls.forEach(el => {
    el.textContent = profile.fullName || 'Mendorbit Admin';
    el.title = profile.email || '';
  });

  // Specific role label only
  const roleEls = document.querySelectorAll('.admin-profile-role');
  roleEls.forEach(el => {
    el.textContent = roleMeta.name;
  });

  const popoverEmail = document.getElementById('sidebar-popover-email');
  if (popoverEmail) {
    popoverEmail.textContent = profile.email || 'admin@mendorbit.in';
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

// -------------------------------------------------------------
// 10. Authentication Actions (Login & Logout)
// -------------------------------------------------------------
async function authenticateAdminWithFirebase(email, password) {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error("Firebase Authentication is not ready. Check internet connection.");
  }

  const userCredential = await firebase.auth().signInWithEmailAndPassword(email.trim(), password);
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

// Admin Logout
async function handleAdminLogout(forced = false) {
  if (!forced && !confirm("Are you sure you want to log out of Mendorbit Admin Console?")) {
    return;
  }

  try {
    if (currentAdminUser) {
      await logAdminActivity('LOGOUT', { email: currentAdminUser.email });
    }
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut();
    }
  } catch (e) {
    console.warn("Logout note:", e);
  } finally {
    currentAdminUser = null;
    sessionStorage.clear();
    window.location.replace('login.html');
  }
}

// -------------------------------------------------------------
// 11. Toast Notification Utility
// -------------------------------------------------------------
function showAdminToast(message, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'admin-toast px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all pointer-events-auto fixed bottom-5 right-5 z-50';
    document.body.appendChild(toast);
  }

  const bgClass = type === 'error' ? 'bg-rose-600' : (type === 'warning' ? 'bg-amber-600' : 'bg-emerald-600');
  toast.className = `admin-toast ${bgClass} px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white show pointer-events-auto fixed bottom-5 right-5 z-50`;
  
  const icon = type === 'error' ? 'alert-triangle' : (type === 'warning' ? 'info' : 'check-circle-2');
  toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0"></i><span>${message}</span>`;

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.classList.remove('show');
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

  // 4. Highlight Active Navigation Pill
  const currentPath = (window.location.pathname || '').split('/').pop().split('?')[0].split('#')[0] || 'index.html';
  const navLinks = sidebar.querySelectorAll('nav a.nav-pill-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href').split('/').pop().split('?')[0].split('#')[0];
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
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

window.hidePageLoader = function() {
  const loader = document.getElementById('page-data-loader');
  if (loader) {
    loader.classList.add('loaded');
  }
};

function registerAdminPWA() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js?v=2.4.0').catch(err => {
      console.log('PWA ServiceWorker note:', err.message);
    });
  }
}

function bootstrapAdminApp() {
  buildMobileNavDrawer();
  initGeminiSidebarEngine();
  renderQuickAccessDock();
  syncSystemVersionDisplay();
  injectChangePasswordModal();
  initAdminAuthObserver();
  registerAdminPWA();
  // Safety fallback maximum timeout (in case of total network timeout)
  setTimeout(window.hidePageLoader, 2500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAdminApp);
} else {
  bootstrapAdminApp();
}
