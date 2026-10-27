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
      permissions: ['overview', 'batches', 'blogs', 'coupons', 'enrollments', 'queries', 'notifications', 'app_links', 'staff', 'audit_logs']
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

// -------------------------------------------------------------
// 1. Instant Pre-Render Auth Gate (Zero Flash of Protected Dashboard)
// -------------------------------------------------------------
(function executePreRenderGate() {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith('login.html') || path.endsWith('/login');
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
      sessionStorage.setItem('mendorbit_admin_redirect', window.location.href);
      window.location.replace('login.html');
    }
  } else {
    // If on login page and already authenticated, bounce to dashboard
    if (sessionState === 'authenticated') {
      const target = sessionStorage.getItem('mendorbit_admin_redirect') || 'index.html';
      sessionStorage.removeItem('mendorbit_admin_redirect');
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
    const isLoginPage = window.location.pathname.endsWith('login.html');
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

    // 3. Inject Super Admin items if missing
    if (profile.role === 'super_admin' || profile.permissions.includes('staff')) {
      if (!navContainer.querySelector('a[href*="staff.html"]')) {
        const staffLink = document.createElement('a');
        staffLink.href = 'staff.html';
        staffLink.className = `flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-blue-900 dark:hover:text-blue-400 transition font-semibold text-xs ${currentFile === 'staff.html' ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300'}`;
        staffLink.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 text-purple-500"></i><span>Staff & Permissions</span>`;
        navContainer.appendChild(staffLink);
      }
    }

    if (profile.role === 'super_admin' || profile.permissions.includes('audit_logs')) {
      if (!navContainer.querySelector('a[href*="audit-logs.html"]')) {
        const auditLink = document.createElement('a');
        auditLink.href = 'audit-logs.html';
        auditLink.className = `flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-blue-900 dark:hover:text-blue-400 transition font-semibold text-xs ${currentFile === 'audit-logs.html' ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300'}`;
        auditLink.innerHTML = `<i data-lucide="file-text" class="w-4 h-4 text-emerald-500"></i><span>Security Audit Logs</span>`;
        navContainer.appendChild(auditLink);
      }
    }
  }

  // 4. Build Responsive Mobile Drawer
  buildMobileNavDrawer(profile);

  // 5. Update Profile Card
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
      
      <div id="mobile-drawer-panel" class="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between shadow-2xl transition-transform duration-300 -translate-x-full z-10 overflow-hidden">
        
        <div class="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <img src="../assets/images/logo/logo.png?v=1.5.1" onerror="this.src='assets/images/logo/logo.png'" alt="Logo" class="w-8 h-8 object-contain">
            <div>
              <span class="font-black text-base gradient-orange block leading-none">Mendorbit</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Console</span>
            </div>
          </div>
          <button type="button" id="close-mobile-drawer-btn" class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <nav id="mobile-drawer-nav" class="p-4 space-y-1.5 font-semibold text-xs text-slate-600 dark:text-slate-300 flex-1 overflow-y-auto">
        </nav>

        <div class="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="admin-profile-avatar w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow">
                A
              </div>
              <div class="text-left">
                <p class="admin-profile-name text-xs font-bold text-slate-900 dark:text-white leading-tight">Admin</p>
                <p class="admin-profile-role text-[10px] text-slate-400">Authenticated</p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button type="button" onclick="toggleAdminTheme()" class="p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer" title="Toggle Theme">
                <i data-lucide="sun" class="w-4 h-4 dark:hidden"></i>
                <i data-lucide="moon" class="w-4 h-4 hidden dark:block text-indigo-400"></i>
              </button>
              <button type="button" onclick="handleAdminLogout()" class="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer" title="Log Out">
                <i data-lucide="log-out" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(drawer);
  }

  const navBox = document.getElementById('mobile-drawer-nav');
  if (navBox) {
    const allLinks = [
      { href: 'index.html', label: 'Overview', icon: 'layout-dashboard', perm: 'overview' },
      { href: 'batches.html', label: 'Batches Manager', icon: 'layers', perm: 'batches' },
      { href: 'blogs.html', label: 'Blogs & Notes', icon: 'book-open', perm: 'blogs' },
      { href: 'coupons.html', label: 'Coupons & Discounts', icon: 'ticket', perm: 'coupons' },
      { href: 'enrollments.html', label: 'Student Enrollments', icon: 'users', perm: 'enrollments' },
      { href: 'queries.html', label: 'Student Doubts & Queries', icon: 'help-circle', perm: 'queries' },
      { href: 'notifications.html', label: 'Push Notifications', icon: 'bell-ring', perm: 'notifications' },
      { href: 'staff.html', label: 'Staff & Permissions', icon: 'shield-check', perm: 'staff' },
      { href: 'audit-logs.html', label: 'Security Audit Logs', icon: 'file-text', perm: 'audit_logs' }
    ];

    navBox.innerHTML = allLinks
      .filter(item => {
        return profile.permissions.includes('all') || 
               profile.role === 'super_admin' || 
               profile.permissions.includes(item.perm);
      })
      .map(item => {
        const isActive = currentFile === item.href;
        const activeClass = isActive 
          ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-400 font-bold shadow-sm' 
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-blue-900 dark:hover:text-blue-400';
        return `
          <a href="${item.href}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeClass}">
            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            <span>${item.label}</span>
          </a>
        `;
      }).join('');
  }

  const openBtn = document.getElementById('mobile-drawer-toggle-btn');
  const closeBtn = document.getElementById('close-mobile-drawer-btn');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const panel = document.getElementById('mobile-drawer-panel');

  function openDrawer() {
    drawer.classList.remove('pointer-events-none', 'opacity-0');
    drawer.classList.add('pointer-events-auto', 'opacity-100');
    backdrop.classList.remove('pointer-events-none', 'opacity-0');
    backdrop.classList.add('pointer-events-auto', 'opacity-100');
    panel.classList.remove('-translate-x-full');
    panel.classList.add('translate-x-0');
    document.body.classList.add('overflow-hidden');
  }

  function closeDrawer() {
    panel.classList.remove('translate-x-0');
    panel.classList.add('-translate-x-full');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      drawer.classList.remove('opacity-100', 'pointer-events-auto');
      drawer.classList.add('opacity-0', 'pointer-events-none');
      document.body.classList.remove('overflow-hidden');
    }, 280);
  }

  if (openBtn) openBtn.onclick = openDrawer;
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (backdrop) backdrop.onclick = closeDrawer;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

// -------------------------------------------------------------
// 7. User Profile UI Update
// -------------------------------------------------------------
function updateUserProfileDisplay(profile) {
  const roleMeta = MENDORBIT_RBAC_CONFIG.roles[profile.role] || {
    name: profile.role,
    badgeClass: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40'
  };

  const userInitials = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'A';
  
  const avatarEls = document.querySelectorAll('.admin-profile-avatar, aside .w-8.h-8');
  avatarEls.forEach(el => {
    el.textContent = userInitials;
  });

  const nameEls = document.querySelectorAll('.admin-profile-name, aside .text-slate-900.dark\\:text-white');
  nameEls.forEach(el => {
    el.textContent = profile.fullName || profile.email;
    el.title = profile.email;
  });

  const roleEls = document.querySelectorAll('.admin-profile-role, aside .text-\\[10px\\].text-slate-400');
  roleEls.forEach(el => {
    el.innerHTML = `<span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${roleMeta.badgeClass}">${roleMeta.name}</span>`;
  });
}

// -------------------------------------------------------------
// 8. Access Denied Screen (Route Interception)
// -------------------------------------------------------------
function renderAccessDeniedScreen(filename, requiredPermission) {
  document.title = "Access Denied — Mendorbit Security";
  document.documentElement.classList.remove('auth-checking');
  const mainContent = document.querySelector('main') || document.body;

  mainContent.innerHTML = `
    <div class="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div class="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        <div class="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
          Security Alert: 403 Forbidden
        </span>
        <h2 class="text-xl font-black text-slate-900 dark:text-white mt-3">Access Denied</h2>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          Your staff account (<strong>${currentAdminUser?.email || 'Logged In'}</strong>) with role <span class="text-amber-500 font-bold">${currentAdminUser?.role || 'Staff'}</span> does not possess the required <strong>'${requiredPermission}'</strong> permission to view <code>${filename}</code>.
        </p>
        <div class="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
          This security incident has been logged to the central audit trail. Contact your Super Administrator for privilege elevation.
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <a href="index.html" class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition text-center">
            Return to Overview
          </a>
          <button onclick="handleAdminLogout()" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer">
            Log Out
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 9. Route Guard & Auth State Observer
// -------------------------------------------------------------
function initAdminAuthObserver() {
  const isLoginPage = window.location.pathname.endsWith('login.html');

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
          const target = sessionStorage.getItem('mendorbit_admin_redirect') || 'index.html';
          sessionStorage.removeItem('mendorbit_admin_redirect');
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
        sessionStorage.setItem('mendorbit_admin_redirect', window.location.href);
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

initAdminTheme();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminAuthObserver);
} else {
  initAdminAuthObserver();
}
