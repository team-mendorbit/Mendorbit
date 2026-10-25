// Mendorbit - Admin Authentication & Security Guard (v1.2.7)
// Features: SHA-256 Hashing, Session Expiry (2 hrs), Rate Limiting, Route Guard

const ADMIN_AUTH_CONFIG = {
  sessionDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  defaultUsername: "admin",
  // SHA-256 hash of "mendorbit@2026"
  defaultPasswordHash: "aa256b7bfd99b41cc57be4261f5cdc3445396224e662ec3f347a5390e604308f"
};

// Cryptographic SHA-256 Generator
async function hashString(plainText) {
  const enc = new TextEncoder();
  const data = enc.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get saved admin credentials or initialize default
function getStoredAdminCredentials() {
  const stored = localStorage.getItem('mendorbit_admin_creds');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  const defaultCreds = {
    username: ADMIN_AUTH_CONFIG.defaultUsername,
    passwordHash: ADMIN_AUTH_CONFIG.defaultPasswordHash
  };
  localStorage.setItem('mendorbit_admin_creds', JSON.stringify(defaultCreds));
  return defaultCreds;
}

// Rate Limiting Check
function checkLockout() {
  const lockDataRaw = localStorage.getItem('mendorbit_admin_lockout');
  if (!lockDataRaw) return { locked: false };

  try {
    const lockData = JSON.parse(lockDataRaw);
    const now = Date.now();
    if (lockData.lockedUntil && now < lockData.lockedUntil) {
      const minutesRemaining = Math.ceil((lockData.lockedUntil - now) / 60000);
      return { locked: true, minutes: minutesRemaining };
    } else {
      localStorage.removeItem('mendorbit_admin_lockout');
      localStorage.removeItem('mendorbit_admin_attempts');
      return { locked: false };
    }
  } catch {
    return { locked: false };
  }
}

function recordFailedAttempt() {
  let attempts = parseInt(localStorage.getItem('mendorbit_admin_attempts') || '0', 10) + 1;
  localStorage.setItem('mendorbit_admin_attempts', attempts.toString());

  if (attempts >= ADMIN_AUTH_CONFIG.maxLoginAttempts) {
    const lockoutUntil = Date.now() + ADMIN_AUTH_CONFIG.lockoutDurationMs;
    localStorage.setItem('mendorbit_admin_lockout', JSON.stringify({ lockedUntil: lockoutUntil }));
    return { locked: true, minutes: 15 };
  }
  return { locked: false, remaining: ADMIN_AUTH_CONFIG.maxLoginAttempts - attempts };
}

function clearLoginAttempts() {
  localStorage.removeItem('mendorbit_admin_attempts');
  localStorage.removeItem('mendorbit_admin_lockout');
}

// Session Management
function getAdminSession() {
  const sessionRaw = sessionStorage.getItem('mendorbit_admin_session');
  if (!sessionRaw) return null;

  try {
    const session = JSON.parse(sessionRaw);
    const now = Date.now();
    if (now - session.timestamp > ADMIN_AUTH_CONFIG.sessionDurationMs) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

function setAdminSession(username) {
  const token = 'mb_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const session = {
    user: username,
    timestamp: Date.now(),
    token: token
  };
  sessionStorage.setItem('mendorbit_admin_session', JSON.stringify(session));
}

function clearAdminSession() {
  sessionStorage.removeItem('mendorbit_admin_session');
}

// Authenticate Admin Credentials
async function authenticateAdmin(username, password) {
  const lockout = checkLockout();
  if (lockout.locked) {
    return { success: false, message: `Account locked due to multiple failed attempts. Please retry in ${lockout.minutes} minute(s).` };
  }

  const creds = getStoredAdminCredentials();
  const inputHash = await hashString(password);

  const isUsernameValid = (username.trim().toLowerCase() === creds.username.toLowerCase()) || 
                          (username.trim().toLowerCase() === "mendorbit");

  if (isUsernameValid && inputHash === creds.passwordHash) {
    clearLoginAttempts();
    setAdminSession(username.trim());
    return { success: true };
  } else {
    const attemptStatus = recordFailedAttempt();
    if (attemptStatus.locked) {
      return { success: false, message: "Too many incorrect attempts! Access locked for 15 minutes." };
    } else {
      return { success: false, message: `Invalid username or password. (${attemptStatus.remaining} attempts remaining)` };
    }
  }
}

// Route Guard for Protected Admin Pages
function guardAdminRoute() {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const session = getAdminSession();

  if (!isLoginPage) {
    if (!session) {
      sessionStorage.setItem('mendorbit_admin_redirect', window.location.href);
      window.location.replace('login.html');
    }
  } else {
    if (session) {
      window.location.replace('index.html');
    }
  }
}

// Admin Logout
function handleAdminLogout() {
  if (confirm("Are you sure you want to log out of Mendorbit Admin?")) {
    clearAdminSession();
    window.location.replace('login.html');
  }
}

// Toast Alert Utility
function showAdminToast(message, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'admin-toast px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all pointer-events-auto';
    document.body.appendChild(toast);
  }

  const bgClass = type === 'error' ? 'bg-rose-600' : (type === 'warning' ? 'bg-amber-600' : 'bg-emerald-600');
  toast.className = `admin-toast ${bgClass} px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white show pointer-events-auto`;
  
  const icon = type === 'error' ? 'alert-triangle' : (type === 'warning' ? 'info' : 'check-circle-2');
  toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0"></i><span>${message}</span>`;

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Theme helper for admin panel
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

// Immediate Execution of Guard
guardAdminRoute();
initAdminTheme();
