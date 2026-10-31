// Mendorbit - Firebase Cloud Engine (v1.3.2)
// Direct Native Browser Notification/Location Permissions, Audio Chime & Real-Time Sync

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
  console.warn("Firebase initialization note (offline mode ready):", error);
}

// -------------------------------------------------------------
// Audio Chime Generator (Completely silenced - Native device alerts only)
// -------------------------------------------------------------
function playNotificationChime() {
  // Completely disabled as per user instruction - only native device handles alerts
  return;
}

// -------------------------------------------------------------
// Direct Native Browser Notification Permission Request
// -------------------------------------------------------------
function triggerNativeNotificationPermission() {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    try {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Mendorbit Notifications Enabled! 🔔", {
            body: "You will receive instant alerts for live classes, batches, and notes.",
            icon: "assets/images/logo/logo.png"
          });
        }
      }).catch(() => {});
    } catch {
      // Old safari callback support
      Notification.requestPermission(() => {});
    }
  }
}

// -------------------------------------------------------------
// Direct Native Browser Location Permission Request
// -------------------------------------------------------------
function triggerNativeLocationPermission() {
  if (!("geolocation" in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      };
      saveExactLocationTelemetry(coords);
    },
    (err) => {
      // Gracefully ignore GPS denial - IP telemetry already ran in main.js
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
  );
}

// -------------------------------------------------------------
// Google Sheet Telemetry Ingestion Engine (100% Zero Firestore Quota)
// All high-frequency visitor telemetry is routed to Google Sheets
// -------------------------------------------------------------
const MENDORBIT_DEFAULT_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwAuFhPzuuVpknMUBe_NIWIO2iom5Gz8KBSohgvBxvjmq0T2n17AXye9A6qHkFD00ccyA/exec";

function getMendorbitSheetWebhookUrl() {
  return window.MENDORBIT_SHEET_WEBHOOK_URL || 
         localStorage.getItem('mendorbit_sheet_webhook_url') || 
         MENDORBIT_DEFAULT_SHEET_WEBHOOK_URL;
}

function setMendorbitSheetWebhookUrl(url) {
  const trimmed = (url || '').trim();
  window.MENDORBIT_SHEET_WEBHOOK_URL = trimmed;
  if (trimmed) {
    localStorage.setItem('mendorbit_sheet_webhook_url', trimmed);
  } else {
    localStorage.removeItem('mendorbit_sheet_webhook_url');
  }
}

async function sendDataToGoogleSheet(payload) {
  const webhookUrl = getMendorbitSheetWebhookUrl();
  if (!webhookUrl) return false;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    return false;
  }
}

// -------------------------------------------------------------
// Save Exact Location to Google Sheet (Zero Firestore Quota Used)
// -------------------------------------------------------------
async function saveExactLocationTelemetry(coords) {
  try {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   (navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   (navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'));

    // Reverse geocode via free open reverse API
    let city = "India";
    let state = "State";
    try {
      const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`);
      if (revRes.ok) {
        const revData = await revRes.json();
        city = revData.city || revData.locality || "India";
        state = revData.principalSubdivision || "State";
      }
    } catch {}

    const visitorId = localStorage.getItem('mendorbit_visitor_id') || 'ANON';
    const telemetryData = {
      type: 'visitor',
      visitorId: visitorId,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      city: city,
      state: state,
      country: "India",
      gps: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
      device: deviceType,
      browser: browser,
      page: window.location.pathname.split('/').pop() || 'index.html',
      referrer: document.referrer || 'Direct'
    };

    // Store in local storage for instant browser access
    let localVisitors = [];
    try {
      localVisitors = JSON.parse(localStorage.getItem('mendorbit_local_visitors') || '[]');
    } catch {}
    localVisitors.unshift(telemetryData);
    if (localVisitors.length > 50) localVisitors = localVisitors.slice(0, 50);
    localStorage.setItem('mendorbit_local_visitors', JSON.stringify(localVisitors));

    // Send strictly to Google Sheet Webhook (Never burns Firestore quota)
    await sendDataToGoogleSheet(telemetryData);
  } catch (e) {
    // Graceful silent error
  }
}

// Fallback IP Geolocation Telemetry (Zero Firestore Quota Used)
async function logStudentVisitorTelemetry(coords) {
  if (sessionStorage.getItem('mendorbit_visitor_logged')) return;
  if (coords) return; // Already logged by exact GPS

  try {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   (navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   (navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'));

    let geo = { city: "Detecting...", region: "India", country: "India" };
    try {
      const res = await fetch('https://ipapi.co/json/', { timeout: 3000 });
      if (res.ok) {
        const data = await res.json();
        geo = {
          city: data.city || "India",
          region: data.region || "State",
          country: data.country_name || "India"
        };
      }
    } catch {
      try {
        const res2 = await fetch('https://freeipapi.net/api/json');
        if (res2.ok) {
          const d2 = await res2.json();
          geo = { city: d2.cityName || "India", region: d2.regionName || "State", country: d2.countryName || "India" };
        }
      } catch {}
    }

    const telemetryData = {
      type: 'visitor',
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      city: geo.city,
      state: geo.region,
      country: geo.country,
      device: deviceType,
      browser: browser,
      page: window.location.pathname.split('/').pop() || 'index.html',
      referrer: document.referrer || 'Direct'
    };

    let localVisitors = [];
    try {
      localVisitors = JSON.parse(localStorage.getItem('mendorbit_local_visitors') || '[]');
    } catch {}
    localVisitors.unshift(telemetryData);
    if (localVisitors.length > 50) localVisitors = localVisitors.slice(0, 50);
    localStorage.setItem('mendorbit_local_visitors', JSON.stringify(localVisitors));

    // Send strictly to Google Sheet Webhook (Never burns Firestore quota)
    await sendDataToGoogleSheet(telemetryData);

    sessionStorage.setItem('mendorbit_visitor_logged', 'true');
  } catch {}
}

// -------------------------------------------------------------
// PWA Service Worker Registration & App-Branded Notifications
// -------------------------------------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=2.5.0').then((reg) => {
      // SW registered successfully
    }).catch((err) => {
      // Relative fallback if root sw.js path is served from subpath
      navigator.serviceWorker.register('sw.js?v=2.5.0').catch(() => {});
    });
  });
}

// Trigger App-Branded Native Desktop/Mobile Notification Popup
function triggerSystemNotification(title, body, link = "batches.html", bannerImage = "") {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const notificationOptions = {
    body: body,
    icon: "assets/images/icons/icon-192.png",
    badge: "assets/images/icons/icon-192.png",
    vibrate: [150, 60, 150],
    data: { url: link || "index.html" },
    tag: "mendorbit-alert-" + Date.now(),
    renotify: true
  };
  if (bannerImage) {
    notificationOptions.image = bannerImage;
  }

  // Use ServiceWorkerRegistration for App-Branded notifications (Shows "Mendorbit" instead of "Chrome")
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title || "Mendorbit", notificationOptions);
    }).catch(() => {
      fallbackDesktopNotification(title, notificationOptions, link);
    });
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title || "Mendorbit", notificationOptions);
    }).catch(() => {
      fallbackDesktopNotification(title, notificationOptions, link);
    });
  } else {
    fallbackDesktopNotification(title, notificationOptions, link);
  }
}

function fallbackDesktopNotification(title, options, link) {
  try {
    const notif = new Notification(title || "Mendorbit", options);
    notif.onclick = () => {
      window.focus();
      window.location.href = link || "index.html";
    };
  } catch (e) {
    console.log("Desktop notification note:", e);
  }
}

// -------------------------------------------------------------
// Auto-Run on Student Pages: Prompt Permissions Gracefully Without Auto-Block
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('/admin/')) {
    // 1. Location permission can run smoothly in background
    setTimeout(() => {
      triggerNativeLocationPermission();
    }, 500);

    // 2. Notification permission MUST strictly be tied to a user gesture
    // to prevent Chrome / Chromium from auto-blocking "without site interaction"
    const firstInteractionHandler = () => {
      triggerNativeNotificationPermission();
      window.removeEventListener('click', firstInteractionHandler);
      window.removeEventListener('touchstart', firstInteractionHandler);
    };
    window.addEventListener('click', firstInteractionHandler, { once: true });
    window.addEventListener('touchstart', firstInteractionHandler, { once: true });
  }
});
