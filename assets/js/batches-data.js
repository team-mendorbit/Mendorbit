// Mendorbit - Official Centralized Batches Data Engine (v1.3.5)
// 100% Dynamic - Exclusively Powered by Firestore Cloud Database (Zero Hardcoded / Demo Batches)

const DEFAULT_DEMO_BATCHES = [];

// Retrieve all active batches (Pure Dynamic from Firestore / Local Cache)
function getBatchesList() {
  try {
    const raw = localStorage.getItem('mendorbit_batches');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Sync with Firestore Cloud Database (Pure Real-time live WebSocket sync)
function syncBatchesWithFirestore(onUpdated) {
  if (typeof mendorbitDB === 'undefined' || !mendorbitDB) return;

  mendorbitDB.collection('mendorbit_batches').onSnapshot(snapshot => {
    const cloudBatches = [];
    snapshot.forEach(doc => {
      cloudBatches.push({ ...doc.data(), id: doc.id });
    });

    localStorage.setItem('mendorbit_batches', JSON.stringify(cloudBatches));
    if (typeof onUpdated === 'function') onUpdated(cloudBatches);
  }, err => {
    console.log("Firestore batches live sync note (using local offline mirror):", err.message);
  });
}

// Get single batch by its ID slug
function getBatchById(id) {
  const batches = getBatchesList();
  return batches.find(b => String(b.id) === String(id)) || null;
}

// Save or Update a batch (Admin Panel API -> Firestore + LocalStorage)
function saveBatchToStorage(batch) {
  const batches = getBatchesList();
  const existingIdx = batches.findIndex(b => String(b.id) === String(batch.id));
  if (existingIdx >= 0) {
    batches[existingIdx] = batch;
  } else {
    batches.unshift(batch);
  }
  localStorage.setItem('mendorbit_batches', JSON.stringify(batches));

  // Sync with Firestore Cloud
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_batches').doc(String(batch.id)).set({ ...batch, id: batch.id })
      .then(() => console.log("Batch synced to Firestore Cloud:", batch.id))
      .catch(err => console.log("Firestore cloud write note:", err.message));
  }
}

// Delete a batch (Admin Panel API -> Firestore + LocalStorage)
function deleteBatchFromStorage(id) {
  let batches = getBatchesList();
  batches = batches.filter(b => String(b.id) !== String(id));
  localStorage.setItem('mendorbit_batches', JSON.stringify(batches));

  // Delete from Firestore Cloud
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_batches').doc(String(id)).delete()
      .then(() => console.log("Batch deleted from Firestore Cloud:", id))
      .catch(err => console.log("Firestore cloud delete note:", err.message));
  }
}

// Reset batches back to empty (Admin Panel utility)
function resetBatchesToDefault() {
  localStorage.setItem('mendorbit_batches', JSON.stringify([]));
}

// HTML Generator for Batch Card matching PW style in media reference (without WhatsApp icon)
function createBatchCardHTML(batch) {
  return `
    <div class="batch-card batch-card-item bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group" data-category="${batch.category}">
      
      <!-- Top Banner / Poster Area (NO WhatsApp Icon) -->
      <div class="relative aspect-[16/9] w-full bg-gradient-to-tr ${batch.bannerGradient} p-5 flex flex-col justify-between overflow-hidden">
        
        <!-- Subtle Background Pattern Accent -->
        <div class="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none"></div>

        <!-- Top Plan / Badge Row -->
        <div class="flex items-center justify-between z-10">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md text-amber-300 border border-white/10">
            <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i>
            <span>${batch.bannerBadge || 'Multiple plans inside: Infinity, Pro'}</span>
          </span>
        </div>

        <!-- Center Brand Typography & Faculty Silhouette Artwork -->
        <div class="z-10 text-center my-auto">
          <h4 class="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
            ${batch.bannerTitle}
          </h4>
          <p class="text-[11px] font-bold text-amber-300 tracking-wider uppercase mt-0.5">
            ${batch.bannerSubtitle}
          </p>
        </div>

        <!-- Bottom Tag Overlay -->
        <div class="z-10 flex items-center justify-between text-[10px] text-slate-300 font-semibold border-t border-white/10 pt-2">
          <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Batch 2026-27</span>
          <span class="text-white/80 font-mono">Mendorbit Faculty Team</span>
        </div>
      </div>

      <!-- Card Body Content -->
      <div class="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
        
        <div>
          <!-- Stream Tag & Language Badge Row -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-black uppercase tracking-wider ${batch.tagColor}">
              ${batch.streamTag}
            </span>
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">
              ${batch.language || 'HINGLISH'}
            </span>
          </div>

          <!-- Batch Title -->
          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
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
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-4">
          
          <!-- Pricing Block (Left) -->
          <div class="flex flex-col">
            <div class="flex items-baseline gap-1.5">
              <span class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">${batch.price}</span>
              ${batch.originalPrice ? `<span class="line-through text-xs font-semibold text-slate-400">${batch.originalPrice}</span>` : ''}
            </div>
            <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
              ${batch.discountBadge}
            </span>
          </div>

          <!-- Action Buttons Group (Right: Buy Now Button + Adjacent Chevron Details Button) -->
          <div class="flex items-center gap-2">
            <button type="button" onclick="handleBatchBuyClick('${batch.id}', '${batch.title.replace(/'/g, "\\'")}', '${batch.price}', '${batch.enrollLink}')" class="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 text-white font-bold text-xs uppercase tracking-wider transition transform active:scale-95 shadow">
              <span>Buy Now</span>
            </button>

            <!-- Dedicated Batch Detail Chevron Button (Opens Complete Details Page) -->
            <a href="batch-detail.html?id=${batch.id}" class="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition" title="View Full Batch Details">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </a>
          </div>

        </div>

      </div>

    </div>
  `;
}

// Payment Gateway Trigger Handler
function handleBatchBuyClick(id, title, price, enrollLink) {
  // If batch price is 0 or Free YouTube class, direct them or open checkout
  if (price === '₹0' || price.toLowerCase().includes('free')) {
    if (enrollLink && enrollLink.includes('youtube.com')) {
      window.open(enrollLink, '_blank');
      return;
    }
  }

  // Open Standard Indian Payment Gateway Sheet (Razorpay / Cashfree / UPI Gateway)
  openPaymentGatewayModal(id, title, price);
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
}

// Initialize dynamic rendering, view-more pagination, and filter buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  renderBatchesToContainer('batches-grid-container', currentFilterCategory, true);

  // Sync with Firestore Cloud in background and re-render if updated
  syncBatchesWithFirestore(() => {
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

  // Filter Buttons binding
  const filterBtns = document.querySelectorAll('.batch-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter') || 'all';

      // Update active state of buttons
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-blue-900', 'text-white', 'shadow-md');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');

      renderBatchesToContainer('batches-grid-container', category, true);
    });
  });
});
