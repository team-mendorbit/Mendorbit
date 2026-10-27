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
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      };
      saveExactLocationTelemetry(coords);
    },
    (err) => {
      console.log("Native location permission note:", err.message);
      // Fallback to IP Geolocation if GPS denied
      logStudentVisitorTelemetry(null);
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// -------------------------------------------------------------
// Google Sheet Telemetry Ingestion Engine
// Offloads high-frequency telemetry from Firestore to prevent quota exhaustion
// -------------------------------------------------------------
function getMendorbitSheetWebhookUrl() {
  return window.MENDORBIT_SHEET_WEBHOOK_URL || 
         localStorage.getItem('mendorbit_sheet_webhook_url') || 
         "";
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
    console.warn("Sheet telemetry webhook note:", err);
    return false;
  }
}

// Auto-sync Google Sheet Webhook URL from Firestore config
if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
  try {
    mendorbitDB.collection('mendorbit_config').doc('sheet_integration').get().then(doc => {
      if (doc.exists && doc.data().webhookUrl) {
        setMendorbitSheetWebhookUrl(doc.data().webhookUrl);
      }
    }).catch(() => {});
  } catch (e) {}
}

// -------------------------------------------------------------
// Save Exact Location to Google Sheet / Firebase Firestore
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

    const telemetryData = {
      type: 'visitor',
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

    // Store in local storage for instant admin access
    let localVisitors = [];
    try {
      localVisitors = JSON.parse(localStorage.getItem('mendorbit_local_visitors') || '[]');
    } catch {}
    localVisitors.unshift(telemetryData);
    if (localVisitors.length > 50) localVisitors = localVisitors.slice(0, 50);
    localStorage.setItem('mendorbit_local_visitors', JSON.stringify(localVisitors));

    // Send to Google Sheet Webhook (Zero Firestore quota used)
    const sentToSheet = await sendDataToGoogleSheet(telemetryData);

    // Fallback to Cloud Firestore ONLY if Google Sheet is not configured
    if (!sentToSheet && mendorbitDB) {
      mendorbitDB.collection('mendorbit_visitors').add({
        ...telemetryData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    }
  } catch (e) {
    console.log("Telemetry save note:", e);
  }
}

// Fallback IP Geolocation Telemetry
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

    // Send to Google Sheet Webhook (Zero Firestore quota used)
    const sentToSheet = await sendDataToGoogleSheet(telemetryData);

    // Fallback to Cloud Firestore ONLY if Google Sheet is not configured
    if (!sentToSheet && mendorbitDB) {
      mendorbitDB.collection('mendorbit_visitors').add({
        ...telemetryData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    }

    sessionStorage.setItem('mendorbit_visitor_logged', 'true');
  } catch {}
}

// -------------------------------------------------------------
// Trigger System Desktop/Mobile Notification Popup
// -------------------------------------------------------------
function triggerSystemNotification(title, body, link = "batches.html", bannerImage = "") {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const options = {
        body: body,
        icon: "assets/images/logo/logo.png",
        badge: "assets/images/logo/logo.png"
      };
      if (bannerImage) {
        options.image = bannerImage;
      }
      const notif = new Notification(title, options);
      notif.onclick = () => {
        window.focus();
        window.location.href = link || "index.html";
      };
    } catch (e) {
      console.log("System notification note:", e);
    }
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
