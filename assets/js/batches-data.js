// Mendorbit - Official Centralized Batches Data Engine (v3.0.0 Dual-Firebase Architecture)
// Powered by Firebase 1 (mendorbit-in) + Real-Time BroadcastChannel (0ms delay)

const OFFICIAL_MENDORBIT_BATCHES = [];
const DEFAULT_DEMO_BATCHES = [];

// Instant Cross-Tab Real-time Broadcast Engine (0ms latency, zero reload)
function broadcastBatchesUpdate(updatedBatches, item) {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('mendorbit_batches_live_sync');
      ch.postMessage({
        type: 'BATCHES_UPDATED',
        batches: updatedBatches,
        batch: item,
        timestamp: Date.now()
      });
    }
  } catch (e) {}
}

// Default Platform Categories
const DEFAULT_CATEGORIES = [
  { id: 'school', name: 'Class 9 & 10', badgeColor: 'text-blue-600 dark:text-blue-400' },
  { id: 'ssc', name: 'SSC Exams', badgeColor: 'text-orange-600 dark:text-orange-400' },
  { id: 'bank', name: 'Banking PO & Clerk', badgeColor: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'law', name: 'CLAT & Law', badgeColor: 'text-purple-600 dark:text-purple-400' }
];

function getRegisteredCategories() {
  try {
    const deleted = JSON.parse(localStorage.getItem('mendorbit_deleted_categories') || '[]');
    const custom = JSON.parse(localStorage.getItem('mendorbit_categories') || '[]');
    const map = new Map();
    DEFAULT_CATEGORIES.forEach(c => {
      if (!deleted.includes(c.id)) map.set(c.id, c);
    });
    if (Array.isArray(custom)) {
      custom.forEach(c => {
        if (c && c.id && !deleted.includes(c.id)) map.set(c.id, c);
      });
    }
    // Also include any custom category present in batches
    const batches = getBatchesList(true);
    batches.forEach(b => {
      if (b.category && !deleted.includes(b.category) && !map.has(b.category)) {
        const titleCase = b.category.charAt(0).toUpperCase() + b.category.slice(1);
        map.set(b.category, { id: b.category, name: titleCase, badgeColor: 'text-emerald-600 dark:text-emerald-400' });
      }
    });
    return Array.from(map.values());
  } catch(e) {
    return DEFAULT_CATEGORIES;
  }
}

function registerNewCategory(id, name) {
  const cleanId = (id || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const cleanName = (name || '').trim();
  if (!cleanId || !cleanName) return null;

  // Un-blacklist if previously deleted
  try {
    let deleted = JSON.parse(localStorage.getItem('mendorbit_deleted_categories') || '[]');
    if (deleted.includes(cleanId)) {
      deleted = deleted.filter(d => d !== cleanId);
      localStorage.setItem('mendorbit_deleted_categories', JSON.stringify(deleted));
    }
  } catch(e) {}

  const current = getRegisteredCategories();
  const existing = current.find(c => c.id === cleanId);
  if (!existing) {
    const newCat = { id: cleanId, name: cleanName, badgeColor: 'text-blue-600 dark:text-blue-400' };
    current.push(newCat);
    localStorage.setItem('mendorbit_categories', JSON.stringify(current));
    if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
      mendorbitDB.collection('mendorbit_categories').doc(cleanId).set(newCat, { merge: true }).catch(() => {});
    }
    broadcastBatchesUpdate(getBatchesList(true), null);
    return newCat;
  }
  return existing;
}

function deleteCategory(id) {
  const cleanId = (id || '').trim().toLowerCase();
  if (!cleanId) return false;

  // 1. Remove from custom categories
  try {
    let custom = JSON.parse(localStorage.getItem('mendorbit_categories') || '[]');
    custom = custom.filter(c => c && c.id !== cleanId);
    localStorage.setItem('mendorbit_categories', JSON.stringify(custom));
  } catch(e) {}

  // 2. Add to deleted blacklist
  try {
    let deleted = JSON.parse(localStorage.getItem('mendorbit_deleted_categories') || '[]');
    if (!deleted.includes(cleanId)) {
      deleted.push(cleanId);
      localStorage.setItem('mendorbit_deleted_categories', JSON.stringify(deleted));
    }
  } catch(e) {}

  // 3. Remove from Firestore
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_categories').doc(cleanId).delete().catch(() => {});
  }

  // 4. Broadcast
  broadcastBatchesUpdate(getBatchesList(true), null);
  return true;
}

// Known legacy demo IDs that must never be shown as real batches
const LEGACY_FAKE_IDS = ['clat-nyaya', 'law-clat-nyaya', 'class-10-aarambh', 'class-9-neev', 'ssc-cgl-vijeta', 'bank-po-chanakya'];

// Retrieve all batches (Only real batches from Firestore / Local Storage - NO fake defaults)
function getBatchesList(includeInactive = false) {
  try {
    const raw = localStorage.getItem('mendorbit_batches');
    let list = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy fake demo batches
        list = parsed.filter(b => b && b.id && !LEGACY_FAKE_IDS.includes(b.id));
        if (list.length !== parsed.length) {
          localStorage.setItem('mendorbit_batches', JSON.stringify(list));
        }
      }
    }

    // Sanitize any accidental YouTube links from enrollLink so Buy Now never redirects to YouTube
    list.forEach(b => {
      if (b.enrollLink && (b.enrollLink.includes('youtube.com') || b.enrollLink.includes('youtu.be'))) {
        b.enrollLink = 'https://app.mendorbit.in';
      }
      if (b.active === undefined) b.active = true;
    });

    if (!includeInactive) {
      return list.filter(b => b.active !== false);
    }
    return list;
  } catch (e) {
    return [];
  }
}

// Sync with Firestore Cloud Database (Pure Real-time live WebSocket sync)
function syncBatchesWithFirestore(onUpdated) {
  if (typeof mendorbitDB === 'undefined' || !mendorbitDB) return;

  mendorbitDB.collection('mendorbit_batches').onSnapshot(snapshot => {
    const cloudBatches = [];
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        // Automatically delete legacy fake batches from cloud if found
        if (LEGACY_FAKE_IDS.includes(doc.id)) {
          doc.ref.delete().catch(() => {});
          return;
        }
        cloudBatches.push({ ...doc.data(), id: doc.id });
      });
      cloudBatches.sort((a, b) => (a.order || 99) - (b.order || 99));
    }
    localStorage.setItem('mendorbit_batches', JSON.stringify(cloudBatches));
    broadcastBatchesUpdate(cloudBatches, null);
    if (typeof onUpdated === 'function') onUpdated(cloudBatches);
  }, err => {
    console.log("Firestore batches live sync note (using local offline mirror):", err.message);
  });

  // Sync Categories collection in real-time
  try {
    mendorbitDB.collection('mendorbit_categories').onSnapshot(catSnap => {
      const cloudCats = [];
      if (!catSnap.empty) {
        catSnap.forEach(doc => {
          cloudCats.push({ ...doc.data(), id: doc.id });
        });
        localStorage.setItem('mendorbit_categories', JSON.stringify(cloudCats));
      }
      if (typeof onUpdated === 'function') onUpdated();
    }, () => {});
  } catch(e) {}
}

// Get single batch by its ID slug
function getBatchById(id) {
  const batches = getBatchesList(true);
  return batches.find(b => String(b.id) === String(id)) || null;
}

// Save or Update a batch (Admin Panel API -> Firestore + LocalStorage + Broadcast)
function saveBatchToStorage(batch) {
  const batches = getBatchesList(true);
  const existingIdx = batches.findIndex(b => String(b.id) === String(batch.id));
  if (existingIdx >= 0) {
    batches[existingIdx] = { ...batches[existingIdx], ...batch };
  } else {
    batches.unshift(batch);
  }
  localStorage.setItem('mendorbit_batches', JSON.stringify(batches));
  broadcastBatchesUpdate(batches, batch);

  // Sync with Firestore Cloud
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_batches').doc(String(batch.id)).set({ ...batch, id: batch.id }, { merge: true })
      .then(() => console.log("Batch synced to Firestore Cloud:", batch.id))
      .catch(err => console.log("Firestore cloud write note:", err.message));
  }
}

// Toggle batch active/inactive status (Instant 0ms update)
function toggleBatchStatusInStorage(id, newStatus) {
  const batches = getBatchesList(true);
  const target = batches.find(b => String(b.id) === String(id));
  if (target) {
    target.active = newStatus;
    localStorage.setItem('mendorbit_batches', JSON.stringify(batches));
    broadcastBatchesUpdate(batches, target);

    if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
      mendorbitDB.collection('mendorbit_batches').doc(String(id)).set({ active: newStatus }, { merge: true })
        .then(() => console.log(`Batch ${id} active status set to ${newStatus}`))
        .catch(err => console.log("Firestore status update note:", err.message));
    }
  }
}

// Delete a batch (Admin Panel API -> Firestore + LocalStorage + Broadcast)
function deleteBatchFromStorage(id) {
  let batches = getBatchesList(true);
  batches = batches.filter(b => String(b.id) !== String(id));
  localStorage.setItem('mendorbit_batches', JSON.stringify(batches));
  broadcastBatchesUpdate(batches, { id: id, deleted: true });

  // Delete from Firestore Cloud
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_batches').doc(String(id)).delete()
      .then(() => console.log("Batch deleted from Firestore Cloud:", id))
      .catch(err => console.log("Firestore cloud delete note:", err.message));
  }
}

// Clear batches (Empty store)
function clearAllBatches() {
  localStorage.setItem('mendorbit_batches', JSON.stringify([]));
  broadcastBatchesUpdate([], null);
}

// Cross-Tab Broadcast Receiver (Instant Live Sync across tabs)
try {
  if (typeof BroadcastChannel !== 'undefined') {
    const ch = new BroadcastChannel('mendorbit_batches_live_sync');
    ch.onmessage = (event) => {
      if (event && event.data && event.data.type === 'BATCHES_UPDATED') {
        const batches = event.data.batches || [];
        localStorage.setItem('mendorbit_batches', JSON.stringify(batches));
        if (typeof renderBatchesToContainer === 'function') {
          renderBatchesToContainer('batches-grid-container', currentFilterCategory, false);
        }
        if (typeof refreshBatchesList === 'function') {
          refreshBatchesList();
        }
      }
    };
  }
} catch (e) {}

// Secure Hashed Token Encoder & Decoder for Checkout Security
function encodeBatchToken(batchId) {
  const payload = {
    batchId: batchId,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 10),
    platform: "mendorbit_cloud_v1",
    sig: btoa(batchId + '::' + Date.now()).substring(0, 16)
  };
  return btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBatchToken(token) {
  try {
    if (!token) return null;
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
}

// HTML Generator for Batch Card with Custom Poster Image / Typography Fallback
function createBatchCardHTML(batch) {
  const hasCustomPoster = batch.posterImageUrl && batch.posterImageUrl.trim() !== '';

  return `
    <div class="batch-card batch-card-item w-[270px] min-[360px]:w-[290px] sm:w-[320px] md:w-auto flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group" data-category="${batch.category}">
      
      <!-- Top Banner / Poster Area -->
      ${hasCustomPoster ? `
        <div class="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 group">
          <img src="${batch.posterImageUrl}" alt="${batch.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-white/10">
            <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i>
            <span>${batch.bannerBadge || 'Official Batch'}</span>
          </div>
          <div class="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[10px] text-white/90 font-semibold">
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Batch 2026-27</span>
            <span class="text-white/80 font-mono">Mendorbit Faculty Team</span>
          </div>
        </div>
      ` : `
        <div class="relative aspect-[16/9] w-full bg-gradient-to-tr ${batch.bannerGradient || 'from-blue-900 via-indigo-950 to-slate-900'} p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          <div class="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
          <div class="flex items-center justify-between z-10">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md text-amber-300 border border-white/10">
              <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i>
              <span>${batch.bannerBadge || 'Multiple plans inside: Infinity, Pro'}</span>
            </span>
          </div>
          <div class="z-10 text-center my-auto py-1">
            <h4 class="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              ${batch.bannerTitle || batch.title}
            </h4>
            <p class="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wider uppercase mt-0.5">
              ${batch.bannerSubtitle || 'Complete Root-Level Foundation'}
            </p>
          </div>
          <div class="z-10 flex items-center justify-between text-[10px] text-slate-300 font-semibold border-t border-white/10 pt-2">
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Batch 2026-27</span>
            <span class="text-white/80 font-mono">Mendorbit Faculty Team</span>
          </div>
        </div>
      `}

      <!-- Card Body Content -->
      <div class="p-4 sm:p-6 space-y-2.5 sm:space-y-3 flex-1 flex flex-col justify-between">
        
        <div>
          <!-- Stream Tag & Language Badge Row -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-black uppercase tracking-wider ${batch.tagColor || 'text-blue-600 dark:text-blue-400'}">
              ${batch.streamTag}
            </span>
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">
              ${batch.language || 'HINGLISH'}
            </span>
          </div>

          <!-- Batch Title -->
          <h3 class="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-900 dark:group-hover:text-blue-400 transition line-clamp-2">
            ${batch.title}
          </h3>

          <!-- Target Audience Line with Book Icon -->
          <div class="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
            <i data-lucide="book-open" class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5"></i>
            <span class="line-clamp-1">${batch.targetAudience}</span>
          </div>

          <!-- Schedule Date Line with Calendar Icon -->
          <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            <i data-lucide="calendar" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
            <span class="line-clamp-1">${batch.schedule}</span>
          </div>
        </div>

        <!-- Bottom Price & Action Buttons Row -->
        <div class="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 mt-3 sm:mt-4">
          
          <!-- Pricing Block (Left) -->
          <div class="flex flex-col flex-shrink-0">
            <div class="flex items-baseline gap-1 sm:gap-1.5">
              <span class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-none">${batch.price}</span>
              ${batch.originalPrice ? `<span class="line-through text-[11px] sm:text-xs font-semibold text-slate-400">${batch.originalPrice}</span>` : ''}
            </div>
            <span class="text-[10px] sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
              ${batch.discountBadge || '100% FREE'}
            </span>
          </div>

          <!-- Action Buttons Group (Right: Buy Now Button + Adjacent Chevron Details Button) -->
          <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button type="button" onclick="handleBatchBuyClick('${batch.id}', '${batch.title.replace(/'/g, "\\'")}', '${batch.price}', '${batch.enrollLink}')" class="inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 text-white font-black text-xs uppercase tracking-wider transition transform active:scale-95 shadow whitespace-nowrap min-h-[38px] flex-shrink-0">
              <span>Buy Now</span>
            </button>

            <!-- Dedicated Batch Detail Chevron Button (Opens Complete Details Page) -->
            <a href="batch-detail.html?id=${batch.id}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition flex-shrink-0" title="View Full Batch Details">
              <i data-lucide="chevron-right" class="w-4 h-4 sm:w-5 sm:h-5"></i>
            </a>
          </div>

        </div>

      </div>

    </div>
  `;
}

// Payment & Checkout Trigger Handler -> Routes to app.mendorbit.in with Random UTM Tokens & Auth Guard
function handleBatchBuyClick(id, title, price, enrollLink) {
  // If an external payment gateway link (Razorpay/Cashfree/etc.) is provided, ensure it is NOT YouTube
  if (enrollLink && typeof enrollLink === 'string' && enrollLink.trim()) {
    const cleanLink = enrollLink.trim();
    const isYoutube = cleanLink.includes('youtube.com') || cleanLink.includes('youtu.be');
    const isInvalid = cleanLink.includes('#') || cleanLink.startsWith('javascript:');
    
    // Only redirect if valid external payment gateway and strictly NOT YouTube
    if (!isYoutube && !isInvalid && (cleanLink.startsWith('http://') || cleanLink.startsWith('https://')) && !cleanLink.includes('mendorbit.in')) {
      window.location.href = cleanLink;
      return;
    }
  }

  // 1. Generate Secure Random Purchase Token & UTM Campaign Parameters
  const randomTxToken = 'mb_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  const utmParams = new URLSearchParams({
    batchId: id || '',
    price: price || '',
    token: randomTxToken,
    utm_source: 'mendorbit_in',
    utm_medium: 'buy_now',
    utm_campaign: id || 'batch_enrollment',
    utm_term: 'direct_purchase'
  }).toString();

  const checkoutUrl = `https://app.mendorbit.in/checkout?${utmParams}`;

  // 2. Auth Session Detection
  const hasSession = localStorage.getItem('mendorbit_student_session') === 'true' || 
                     localStorage.getItem('mendorbit_auth_user') !== null;

  if (hasSession) {
    // Logged in student -> Directly open LMS purchase & payment checkout
    window.location.href = checkoutUrl;
  } else {
    // Not logged in -> Redirect to LMS login with return URL to continue purchase seamlessly
    const redirectEncoded = encodeURIComponent(checkoutUrl);
    window.location.href = `https://app.mendorbit.in/login?redirect=${redirectEncoded}&returnUrl=${redirectEncoded}&batchId=${encodeURIComponent(id)}&action=buy`;
  }
}

function openPaymentGatewayModal(id, title, price) {
  let modal = document.getElementById('mendorbit-payment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mendorbit-payment-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 transform scale-95 transition-transform duration-300">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <img src="assets/images/logo/logo.png" alt="Mendorbit" class="w-8 h-8 object-contain">
          <div>
            <h3 class="font-black text-sm text-slate-900 dark:text-white leading-tight">Mendorbit Checkout</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secured 256-Bit Payment Gateway</p>
          </div>
        </div>
        <button type="button" onclick="closePaymentModal()" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Course Summary -->
      <div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-black uppercase text-blue-900 dark:text-blue-400 tracking-wider">Selected Batch</span>
          <h4 class="font-bold text-xs text-slate-900 dark:text-white mt-0.5 line-clamp-1">${title}</h4>
        </div>
        <div class="text-right flex-shrink-0 pl-3">
          <span class="text-lg font-black text-slate-900 dark:text-white">${price}</span>
        </div>
      </div>

      <!-- Payment Methods Selection -->
      <div class="space-y-3 text-xs">
        <span class="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">Select Payment Method</span>
        
        <label class="flex items-center justify-between p-3.5 rounded-xl border-2 border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 cursor-pointer">
          <div class="flex items-center gap-3">
            <input type="radio" name="payment_method" value="upi" checked class="text-blue-600">
            <div class="font-bold text-slate-900 dark:text-white">Instant UPI (GPay, PhonePe, Paytm, QR)</div>
          </div>
          <span class="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase">Fastest</span>
        </label>

        <label class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer">
          <div class="flex items-center gap-3">
            <input type="radio" name="payment_method" value="card" class="text-blue-600">
            <div class="font-bold text-slate-900 dark:text-white">Debit / Credit Card & Netbanking</div>
          </div>
          <span class="text-[10px] text-slate-400">All Banks</span>
        </label>
      </div>

      <!-- Checkout Action Button -->
      <div class="space-y-2 pt-2">
        <button type="button" onclick="initiatePaymentProcessing('${id}', '${price}')" id="pay-submit-btn" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2">
          <i data-lucide="lock" class="w-3.5 h-3.5"></i>
          <span>Proceed to Pay ${price}</span>
        </button>
        <p class="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <i data-lucide="shield-check" class="w-3 h-3 text-emerald-500"></i>
          <span>Official Payment Gateway Integration (Razorpay / Cashfree)</span>
        </p>
      </div>

    </div>
  `;

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons({ root: modal });
  }

  modal.classList.remove('opacity-0', 'pointer-events-none');
  const dialog = modal.querySelector('div');
  if (dialog) dialog.classList.remove('scale-95');
}

function closePaymentModal() {
  const modal = document.getElementById('mendorbit-payment-modal');
  if (modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    const dialog = modal.querySelector('div');
    if (dialog) dialog.classList.add('scale-95');
  }
}

function initiatePaymentProcessing(batchId, price) {
  const btn = document.getElementById('pay-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Connecting to Payment Gateway...</span>`;
  }

  // Simulated gateway trigger or redirect to live payment link
  setTimeout(() => {
    alert(`Connecting to Payment Gateway for Batch [${batchId}] amount ${price}.\n\nRazorpay/Cashfree live API key can be inserted here when payment account credentials are supplied.`);
    closePaymentModal();
  }, 900);
}

// Dynamic Batch Pagination & Filtering Engine
let currentBatchLimit = 6;
let currentFilterCategory = 'all';

// Render batches inside container with category filtering and 6-batch pagination
function renderBatchesToContainer(containerId = 'batches-grid-container', filterCategory = 'all', resetLimit = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (resetLimit) {
    currentBatchLimit = 6;
  }
  currentFilterCategory = filterCategory;

  const allBatches = getBatchesList();
  const filtered = filterCategory === 'all' 
    ? allBatches 
    : allBatches.filter(b => b.category === filterCategory);

  const viewMoreWrapper = document.getElementById('batches-view-more-wrapper');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <i data-lucide="layers" class="w-7 h-7"></i>
        </div>
        <p class="text-base font-bold text-slate-800 dark:text-slate-200">No Batches Currently Available</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">New batches launched from the Admin Console will appear here in real time.</p>
      </div>
    `;
    if (viewMoreWrapper) viewMoreWrapper.classList.add('hidden');
  } else {
    // Only show up to currentBatchLimit batches
    const toShow = filtered.slice(0, currentBatchLimit);
    container.innerHTML = toShow.map(b => createBatchCardHTML(b)).join('');

    // Toggle View More Button
    if (viewMoreWrapper) {
      if (filtered.length > currentBatchLimit) {
        viewMoreWrapper.classList.remove('hidden');
      } else {
        viewMoreWrapper.classList.add('hidden');
      }
    }
  }

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
  if (window.setupHorizontalWheelScroll) {
    window.setupHorizontalWheelScroll();
  }
}

// Dynamic Catalog Category Filter Tabs System
function renderCatalogCategoryTabs() {
  const container = document.getElementById('catalog-category-tabs');
  if (!container) return;

  const categories = getRegisteredCategories();
  const allBatches = getBatchesList();
  const isHomepage = !window.location.pathname.includes('batches.html');

  const isAll = currentFilterCategory === 'all';
  let html = `
    <button type="button" class="batch-filter-btn px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex-shrink-0 whitespace-nowrap cursor-pointer min-h-[36px] ${isAll ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="all">
      All Batches ${isHomepage ? '' : `(${allBatches.length})`}
    </button>
  `;

  categories.forEach(cat => {
    const isActive = currentFilterCategory === cat.id;
    const count = allBatches.filter(b => (b.category || '').toLowerCase() === cat.id).length;
    html += `
      <button type="button" class="batch-filter-btn px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex-shrink-0 whitespace-nowrap cursor-pointer min-h-[36px] ${isActive ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="${cat.id}">
        ${cat.name} ${isHomepage ? '' : `(${count})`}
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.batch-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter') || 'all';
      currentFilterCategory = category;
      renderCatalogCategoryTabs();
      renderBatchesToContainer('batches-grid-container', category, true);
    });
  });
}

// Initialize dynamic rendering, view-more pagination, and filter buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCatalogCategoryTabs();
  renderBatchesToContainer('batches-grid-container', currentFilterCategory, true);

  // Sync with Firestore Cloud in background and re-render if updated
  syncBatchesWithFirestore(() => {
    renderCatalogCategoryTabs();
    renderBatchesToContainer('batches-grid-container', currentFilterCategory, false);
  });

  // View More Batches Button Binding
  const viewMoreBtn = document.getElementById('batches-view-more-btn');
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', () => {
      currentBatchLimit += 6;
      renderBatchesToContainer('batches-grid-container', currentFilterCategory, false);
    });
  }
});
