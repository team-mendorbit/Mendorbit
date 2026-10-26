// =========================================================================
// Mendorbit Enterprise Admin Authentication & RBAC Guard Engine (v2.0.0)
// Features: Real Firebase Auth, Firestore RBAC, Dynamic Nav, Route Guard,
// Immutable Audit Logging, Inactivity Session Timeout, and Anti-Tamper Shield
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
  // Page to required permission mapping
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
  // Role defaults
  roles: {
    super_admin: {
      name: 'Super Administrator',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      permissions: ['overview', 'batches', 'blogs', 'coupons', 'enrollments', 'queries', 'notifications', 'app_links', 'staff', 'audit_logs']
    },
    course_manager: {
      name: 'Faculty & Course Manager',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      permissions: ['overview', 'batches']
    },
    content_writer: {
      name: 'Content & SEO Manager',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      permissions: ['overview', 'blogs']
    },
    finance_manager: {
      name: 'Finance & Coupons Desk',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      permissions: ['overview', 'coupons', 'enrollments']
    },
    support_agent: {
      name: 'Student Support Executive',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      permissions: ['overview', 'queries', 'enrollments']
    }
  }
};

let currentAdminUser = null;
let inactivityTimer = null;

// Helper: Get base path to avoid broken assets on subdomain vs subdir
function getAdminBasePath() {
  const isSubdomain = window.location.hostname.startsWith('admin.');
  return isSubdomain ? '' : '../';
}

// -------------------------------------------------------------
// 1. Session & Inactivity Activity Watchdog
// -------------------------------------------------------------
function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (currentAdminUser) {
      console.warn("Mendorbit Security: Session timed out due to 30 minutes of inactivity.");
      handleAdminLogout(true);
    }
  }, MENDORBIT_RBAC_CONFIG.sessionTimeoutMs);
}

['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, resetInactivityTimer, { passive: true });
});

// -------------------------------------------------------------
// 2. Audit Trail Logger (Immutable Security Records)
// -------------------------------------------------------------
async function logAdminActivity(action, details = {}) {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    const logEntry = {
      action: action,
      adminEmail: user ? user.email : (currentAdminUser?.email || 'unauthenticated'),
      adminUid: user ? user.uid : (currentAdminUser?.uid || 'anonymous'),
      adminRole: currentAdminUser?.role || 'unknown',
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.pathname,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      clientTimestamp: new Date().toISOString()
    };

    await db.collection('admin_audit_logs').add(logEntry);
  } catch (err) {
    console.warn("Audit logging notice:", err.message);
  }
}

// -------------------------------------------------------------
// 3. User Role & Permission Fetcher
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
    // Check if this is the owner or first admin bootstrapping
    const countSnap = await db.collection('admin_users').limit(1).get();
    const isFirstAdmin = countSnap.empty;

    if (isOwner || isFirstAdmin) {
      // Auto-bootstrap Super Admin document
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
      // Unauthorized user trying to log in with arbitrary Firebase account
      throw new Error("Unauthorized: This Firebase account is not registered as an authorized Mendorbit staff member.");
    }
  }

  const data = docSnap.data();

  if (data.status === 'suspended') {
    throw new Error("Account Suspended: Your access has been deactivated by the Super Administrator.");
  }

  // Update last login timestamp in background
  userDocRef.update({
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(() => {});

  // If role has defined permissions, merge
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
// 4. Dynamic Navigation & Permission Renderer
// -------------------------------------------------------------
function applyRBACPermissions(profile) {
  if (!profile) return;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const requiredPermission = MENDORBIT_RBAC_CONFIG.pagePermissions[currentFile];

  // 1. Check if user has permission for CURRENT page
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

    // 3. Inject Super Admin items if Super Admin and missing
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

  // 4. Update Sidebar User Profile Card
  updateUserProfileDisplay(profile);

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  return true;
}

// -------------------------------------------------------------
// 5. User Profile UI Update
// -------------------------------------------------------------
function updateUserProfileDisplay(profile) {
  const roleMeta = MENDORBIT_RBAC_CONFIG.roles[profile.role] || {
    name: profile.role,
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  };

  // Find user avatar and info blocks
  const userInitials = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'A';
  
  // Sidebar avatar
  const avatarEls = document.querySelectorAll('aside .w-8.h-8, .admin-profile-avatar');
  avatarEls.forEach(el => {
    el.textContent = userInitials;
  });

  // Sidebar name & role
  const nameEls = document.querySelectorAll('aside .text-slate-900.dark\\:text-white, .admin-profile-name');
  nameEls.forEach(el => {
    el.textContent = profile.fullName || profile.email;
    el.title = profile.email;
  });

  const roleEls = document.querySelectorAll('aside .text-\\[10px\\].text-slate-400, .admin-profile-role');
  roleEls.forEach(el => {
    el.innerHTML = `<span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${roleMeta.badgeClass}">${roleMeta.name}</span>`;
  });
}

// -------------------------------------------------------------
// 6. Access Denied Screen (Route Interception)
// -------------------------------------------------------------
function renderAccessDeniedScreen(filename, requiredPermission) {
  document.title = "Access Denied — Mendorbit Security";
  const mainContent = document.querySelector('main') || document.body;

  mainContent.innerHTML = `
    <div class="min-h-[70vh] flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div class="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Security Alert: 403 Forbidden
        </span>
        <h2 class="text-xl font-black text-white mt-3">Access Denied</h2>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed">
          Your staff account (<strong>${currentAdminUser?.email || 'Logged In'}</strong>) with role <span class="text-amber-400 font-bold">${currentAdminUser?.role || 'Staff'}</span> does not possess the required <strong>'${requiredPermission}'</strong> permission to view <code>${filename}</code>.
        </p>
        <div class="mt-6 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400">
          This security incident has been logged to the central audit trail. Contact your Super Administrator for privilege elevation.
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <a href="index.html" class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition text-center">
            Return to Overview
          </a>
          <button onclick="handleAdminLogout()" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition">
            Log Out
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 7. Route Guard & Auth State Observer
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
        resetInactivityTimer();

        if (isLoginPage) {
          // If already authenticated on login page, redirect to index
          const target = sessionStorage.getItem('mendorbit_admin_redirect') || 'index.html';
          sessionStorage.removeItem('mendorbit_admin_redirect');
          window.location.replace(target);
          return;
        }

        // Apply RBAC on protected page
        applyRBACPermissions(currentAdminUser);

      } catch (err) {
        console.error("Mendorbit RBAC Profile Error:", err);
        showAdminToast(err.message, 'error');
        await firebase.auth().signOut();
        sessionStorage.removeItem('mendorbit_admin_redirect');
        if (!isLoginPage) {
          window.location.replace('login.html?error=' + encodeURIComponent(err.message));
        }
      }
    } else {
      currentAdminUser = null;
      if (!isLoginPage) {
        sessionStorage.setItem('mendorbit_admin_redirect', window.location.href);
        window.location.replace('login.html');
      }
    }
  });
}

// -------------------------------------------------------------
// 8. Authentication Actions (Login & Logout)
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

// Helper: Owner First-Time Account Registration Helper
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
    console.warn("Logout notice:", e);
  } finally {
    currentAdminUser = null;
    sessionStorage.clear();
    window.location.replace('login.html');
  }
}

// -------------------------------------------------------------
// 9. Toast Notification Utility
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
// 10. Theme Initialization
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

// Execute on script parse
initAdminTheme();

// Wait for DOM to wire observer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminAuthObserver);
} else {
  initAdminAuthObserver();
}
