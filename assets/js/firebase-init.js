// Mendorbit - Firebase Cloud Engine (v1.3.1)
// Connects Firestore Cloud Database, Visitor Analytics & System Web Notifications

const firebaseConfig = {
  apiKey: "AIzaSyAbvLQ1jjvdcJ2D6K8k-dNJ-dKLRuAlFac",
  authDomain: "mendorbit-in.firebaseapp.com",
  projectId: "mendorbit-in",
  storageBucket: "mendorbit-in.firebasestorage.app",
  messagingSenderId: "868790235880",
  appId: "1:868790235880:web:cf1442f238c599792c4f5d",
  measurementId: "G-QCVC5Y6P2P"
};

let mendorbitApp = null;
let mendorbitDB = null;
let mendorbitAnalytics = null;

// Initialize Firebase
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      mendorbitApp = firebase.initializeApp(firebaseConfig);
    } else {
      mendorbitApp = firebase.app();
    }
    mendorbitDB = firebase.firestore();
    if (firebase.analytics) {
      mendorbitAnalytics = firebase.analytics();
    }
    console.log("Mendorbit Firebase Cloud connected successfully.");
  }
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback engine):", error);
}

// -------------------------------------------------------------
// Audio Chime Generator using Web Audio API (100% Reliable Chime)
// -------------------------------------------------------------
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Two-tone pleasant notification chime (E5 -> G#5)
    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(659.25, 0, 0.25);   // Note E5
    playTone(830.61, 0.12, 0.4); // Note G#5
  } catch (e) {
    console.log("Audio chime error:", e);
  }
}

// -------------------------------------------------------------
// System Web Notification Engine with Sound
// -------------------------------------------------------------
function requestNotificationPermissionWithUI() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notifications.");
    return;
  }

  if (Notification.permission === "granted") {
    return;
  }

  if (Notification.permission !== "denied") {
    // Show polite Apple-style banner prompt if not shown before in this session
    if (sessionStorage.getItem('mendorbit_notif_prompt_shown')) return;
    sessionStorage.setItem('mendorbit_notif_prompt_shown', 'true');

    setTimeout(() => {
      showPermissionModal();
    }, 2000);
  }
}

function showPermissionModal() {
  if (document.getElementById('mendorbit-perm-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'mendorbit-perm-modal';
  modal.className = 'fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] p-5 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 transform translate-y-6 opacity-0';
  modal.innerHTML = `
    <div class="flex items-start gap-3.5">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
        <i data-lucide="bell-ring" class="w-5 h-5 text-white"></i>
      </div>
      <div class="flex-grow min-w-0">
        <h4 class="text-sm font-black text-slate-900 dark:text-white leading-tight">Live Class & Batch Alerts</h4>
        <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          Allow notification sounds for YouTube live classes, free study notes, and batch announcements.
        </p>
        <div class="flex items-center gap-2.5 mt-3.5">
          <button id="enable-notif-btn" class="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm">
            Enable Alerts 🔔
          </button>
          <button id="dismiss-notif-btn" class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition">
            Later
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons({ root: modal });
  }

  setTimeout(() => {
    modal.classList.remove('translate-y-6', 'opacity-0');
  }, 100);

  const enableBtn = modal.querySelector('#enable-notif-btn');
  const dismissBtn = modal.querySelector('#dismiss-notif-btn');

  const closePrompt = () => {
    modal.classList.add('translate-y-6', 'opacity-0');
    setTimeout(() => modal.remove(), 300);
  };

  enableBtn.addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        playNotificationChime();
        new Notification("Mendorbit Alerts Enabled!", {
          body: "You will now receive instant sounds for live classes and free notes updates.",
          icon: "assets/images/logo/logo.png"
        });
      }
      closePrompt();
    });
  });

  dismissBtn.addEventListener('click', closePrompt);
}

// Trigger system notification with audio chime
function triggerSystemNotification(title, body, link = "batches.html") {
  playNotificationChime();
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const notif = new Notification(title, {
        body: body,
        icon: "assets/images/logo/logo.png",
        badge: "assets/images/logo/logo.png"
      });
      notif.onclick = () => {
        window.focus();
        window.location.href = link;
      };
    } catch (e) {
      console.log("System notification error:", e);
    }
  }
}

// -------------------------------------------------------------
// Student Location & Visitor Telemetry Tracker
// -------------------------------------------------------------
async function logStudentVisitorTelemetry() {
  // Only log once per session to prevent database quota exhaustion
  if (sessionStorage.getItem('mendorbit_visitor_logged')) return;

  try {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   (navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   (navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'));

    // Fast IP Geolocation (Zero-prompt, gives City, State, Country, IP)
    let geo = { city: "Detecting...", region: "India", country: "India" };
    try {
      const res = await fetch('https://ipapi.co/json/', { timeout: 3000 });
      if (res.ok) {
        const data = await res.json();
        geo = {
          city: data.city || "Unknown City",
          region: data.region || "State",
          country: data.country_name || "India",
          ip: data.ip || "Hidden"
        };
      }
    } catch {
      // Fallback Geo
      try {
        const res2 = await fetch('https://freeipapi.net/api/json');
        if (res2.ok) {
          const d2 = await res2.json();
          geo = {
            city: d2.cityName || "India",
            region: d2.regionName || "State",
            country: d2.countryName || "India",
            ip: d2.ipAddress || "Hidden"
          };
        }
      } catch {}
    }

    const telemetryData = {
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      city: geo.city,
      state: geo.region,
      country: geo.country,
      device: deviceType,
      browser: browser,
      page: window.location.pathname.split('/').pop() || 'index.html',
      referrer: document.referrer || 'Direct'
    };

    // 1. Save locally for admin preview
    let localVisitors = [];
    try {
      localVisitors = JSON.parse(localStorage.getItem('mendorbit_local_visitors') || '[]');
    } catch {}
    localVisitors.unshift(telemetryData);
    if (localVisitors.length > 50) localVisitors = localVisitors.slice(0, 50);
    localStorage.setItem('mendorbit_local_visitors', JSON.stringify(localVisitors));

    // 2. Save to Firestore Cloud if initialized
    if (mendorbitDB) {
      mendorbitDB.collection('mendorbit_visitors').add({
        ...telemetryData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => {
        console.log("Firestore visitor log notice (using local mirror):", err.message);
      });
    }

    sessionStorage.setItem('mendorbit_visitor_logged', 'true');
  } catch (err) {
    console.log("Telemetry exception:", err);
  }
}

// -------------------------------------------------------------
// Auto-Run on Student Pages
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // If not on admin page, initialize polite notification permission and visitor logging
  if (!window.location.pathname.includes('/admin/')) {
    requestNotificationPermissionWithUI();
    logStudentVisitorTelemetry();
  }
});
