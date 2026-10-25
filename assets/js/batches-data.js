// Mendorbit - Official Centralized Batches Data Engine (v1.2.7)
// Connected to localStorage for Admin Panel Real-Time Sync & Dynamic Card Rendering

const DEFAULT_DEMO_BATCHES = [
  {
    id: "class-10-aarambh",
    category: "school",
    streamTag: "Class 10th Boards",
    tagColor: "text-blue-600 dark:text-blue-400",
    language: "HINGLISH",
    title: "Aarambh 10th Board Topper Batch",
    targetAudience: "For Class 10th CBSE & State Boards Aspirants",
    schedule: "Starts on 15 Apr, 2026 • Ends on 28 Feb, 2027",
    price: "₹0",
    originalPrice: "₹4,999",
    discountBadge: "100% FREE",
    bannerBadge: "Tracker 360 Included",
    bannerTitle: "CLASS 10 BOARDS",
    bannerSubtitle: "Complete Root-Level Foundation",
    bannerGradient: "from-blue-900 via-indigo-900 to-slate-900",
    enrollLink: "https://www.youtube.com/@mendorbit",
    enrollText: "Buy Now",
    description: "Complete CBSE & State Board Syllabus (Maths, Science, Social Science, English) with chapter-wise Zero-to-Pro question bank, live doubts, and NCERT derivations.",
    curriculum: [
      { subject: "Mathematics", topics: "Real Numbers, Polynomials, Quadratic Equations, Trigonometry, Coordinate Geometry, Circles, Surface Areas & Volumes, Statistics" },
      { subject: "Science (Physics, Chem, Bio)", topics: "Chemical Reactions, Acids & Bases, Light & Electricity, Magnetic Effects, Life Processes, Heredity" },
      { subject: "Social Science", topics: "History, Civics, Geography & Economics concept mapping with 10-year PYQ analysis" },
      { subject: "English Language", topics: "Grammar foundation, letter/analytical paragraph writing, and reading comprehension" }
    ],
    features: [
      "Daily Live YouTube Masterclasses + Free Chapter PDF Notes",
      "Last 10 Years PYQs & Board Model Sample Question Papers",
      "Zero-Assumption Concept Derivations for Math-Anxious Students",
      "Weekly Live Doubt Solving Sessions"
    ],
    faculty: [
      { name: "Senior Maths Mentor", role: "10+ Years Board Experience" },
      { name: "Science Specialist", role: "Physics & Chemistry Lead" }
    ]
  },
  {
    id: "class-9-neev",
    category: "school",
    streamTag: "Class 9th Foundation",
    tagColor: "text-sky-600 dark:text-sky-400",
    language: "HINGLISH",
    title: "Neev 9th Super-Foundation Batch",
    targetAudience: "For Class 9th Students Aiming for 95%+ in Class 10",
    schedule: "Starts on 20 Apr, 2026 • Ends on 15 Mar, 2027",
    price: "₹0",
    originalPrice: "₹3,999",
    discountBadge: "100% FREE",
    bannerBadge: "Foundation 360",
    bannerTitle: "CLASS 9 NEEV",
    bannerSubtitle: "Supercharge Core Intuition",
    bannerGradient: "from-sky-900 via-blue-950 to-slate-900",
    enrollLink: "https://www.youtube.com/@mendorbit",
    enrollText: "Buy Now",
    description: "Build rock-solid mathematical logic and scientific conceptual intuition so students effortlessly conquer Class 10 and Olympiads.",
    curriculum: [
      { subject: "Mathematics", topics: "Number Systems, Polynomials, Linear Equations, Lines & Angles, Triangles, Quadrilaterals, Surface Areas" },
      { subject: "Science", topics: "Matter in Our Surroundings, Atoms & Molecules, Fundamental Unit of Life, Motion, Force & Laws of Motion, Gravitation" }
    ],
    features: [
      "NCERT Line-by-Line Breakdown from Scratch",
      "Handwritten Revision Mindmaps for Every Chapter",
      "Weekly Fundamental Quizzes & Worksheets",
      "Concept Visualizations with Real-World Physical Examples"
    ],
    faculty: [
      { name: "Foundation Maths Faculty", role: "Olympiad & NTSE Mentor" },
      { name: "Science Concept Faculty", role: "Conceptual Intuition Specialist" }
    ]
  },
  {
    id: "ssc-cgl-vijeta",
    category: "ssc",
    streamTag: "SSC CGL / CHSL 2026",
    tagColor: "text-orange-600 dark:text-orange-400",
    language: "HINGLISH",
    title: "Vijeta SSC Zero-to-Hero Pinnacle",
    targetAudience: "For SSC CGL, CHSL, CPO & MTS 2026 Aspirants",
    schedule: "Starts on 10 May, 2026 • Ends on 30 Nov, 2026",
    price: "₹0",
    originalPrice: "₹5,999",
    discountBadge: "100% FREE",
    bannerBadge: "Speed & Accuracy 360",
    bannerTitle: "VIJETA SSC PINNACLE",
    bannerSubtitle: "Quant, Reasoning, English & GA",
    bannerGradient: "from-orange-950 via-slate-900 to-blue-950",
    enrollLink: "https://www.youtube.com/@mendorbit",
    enrollText: "Buy Now",
    description: "Complete Quantitative Aptitude (Arithmetic + Advance), Logical Reasoning, English Comprehension, and General Studies designed strictly for non-maths students.",
    curriculum: [
      { subject: "Quantitative Aptitude", topics: "Percentage, Profit & Loss, Ratio, Time & Work, Speed Distance, Algebra, Geometry, Trigonometry, Mensuration" },
      { subject: "General Intelligence & Reasoning", topics: "Syllogism, Coding-Decoding, Blood Relations, Puzzles, Non-Verbal, Series & Matrices" },
      { subject: "English Comprehension", topics: "Grammar Rules, Vocabulary (Root words, Idioms, OWS), Cloze Test, Reading Comprehension" },
      { subject: "General Awareness", topics: "History, Geography, Polity (Constitution), Economics, Science & Daily Current Affairs" }
    ],
    features: [
      "Zero-Formula Calculation Methods (Vedic & Base Arithmetic)",
      "Strictly 2018-2025 TCS Pattern PYQ Coverage",
      "Daily 30-Second Question Solving Speed Drills",
      "Comprehensive High-Yield Current Affairs Compilations"
    ],
    faculty: [
      { name: "Quant & Speed Math Head", role: "Ex-Inspector & CGL Topper" },
      { name: "Reasoning & English Master", role: "99.9%ile Aptitude Mentor" }
    ]
  },
  {
    id: "bank-po-chanakya",
    category: "bank",
    streamTag: "Bank PO & Clerk 2026",
    tagColor: "text-blue-600 dark:text-blue-400",
    language: "HINGLISH",
    title: "Chanakya Banking Specialist Batch",
    targetAudience: "For SBI PO, IBPS PO, RRB & Clerk Aspirants",
    schedule: "Starts on 1 Jun, 2026 • Ends on 31 Dec, 2026",
    price: "₹0",
    originalPrice: "₹5,999",
    discountBadge: "100% FREE",
    bannerBadge: "Mains + Interview Integrated",
    bannerTitle: "CHANAKYA BANKING",
    bannerSubtitle: "Puzzles & High-Level DI Mastery",
    bannerGradient: "from-indigo-950 via-slate-900 to-blue-900",
    enrollLink: "https://www.youtube.com/@mendorbit",
    enrollText: "Buy Now",
    description: "Master High-Level Puzzles, Seating Arrangements, Data Interpretation, and Banking Awareness from first principles without fear.",
    curriculum: [
      { subject: "Quantitative Aptitude", topics: "Speed Maths, Approximation, Quadratic Inequalities, Data Interpretation (Tabular, Radar, Caselet, Missing DI)" },
      { subject: "Reasoning Ability", topics: "Floor, Box, Month-Date Puzzles, Circular & Linear Seating, Machine Input-Output, Critical Reasoning" },
      { subject: "English & Banking GA", topics: "High-level Reading Comprehension, Error Detection, RBI Circulars, Financial Awareness & Current Affairs" }
    ],
    features: [
      "Prelims + Mains Integrated Step-by-Step Roadmap",
      "Systematic Framework to decode complex Mains Puzzles in 4 minutes",
      "Daily Speed Calculation & Number Series Drills",
      "Full Interview Guidance & Financial Awareness Capsules"
    ],
    faculty: [
      { name: "High-Level Puzzle Expert", role: "IBPS Specialist" },
      { name: "Banking & DI Specialist", role: "Quant Strategist" }
    ]
  },
  {
    id: "clat-nyaya",
    category: "law",
    streamTag: "CLAT & AILET 2026/27",
    tagColor: "text-purple-600 dark:text-purple-400",
    language: "HINGLISH",
    title: "Nyaya CLAT & AILET Absolute Mastery",
    targetAudience: "For Law Aspirants Targeting Top NLUs",
    schedule: "Starts on 15 May, 2026 • Ends on 10 Dec, 2026",
    price: "₹0",
    originalPrice: "₹6,999",
    discountBadge: "100% FREE",
    bannerBadge: "Consortium Pattern 360",
    bannerTitle: "NYAYA CLAT MASTERY",
    bannerSubtitle: "Passage-Based Legal Reasoning",
    bannerGradient: "from-purple-950 via-slate-900 to-indigo-950",
    enrollLink: "https://www.youtube.com/@mendorbit",
    enrollText: "Buy Now",
    description: "Strictly consortium pattern passage-based preparation. Master legal reasoning, critical reading, and analytical thinking with zero prior law knowledge.",
    curriculum: [
      { subject: "Legal Reasoning", topics: "Law of Torts, Contracts, Constitutional Law, Criminal Law, Contemporary Legal Issues & Judgments" },
      { subject: "Critical Reasoning & English", topics: "Argument Evaluation, Assumptions, Inferences, Flaws in Arguments, Editorial Speed Reading" },
      { subject: "Current Affairs & Quants", topics: "National & International Events, Legal GK, Case Law Analysis, Passage-Based Data Interpretation" }
    ],
    features: [
      "100% Passage-Based Analytical Dissection",
      "No Prior Law Background Needed — Taught from First Principles",
      "Daily Editorial & Current Legal Affairs Analysis",
      "Weekly Speed Reading & Comprehension Drills"
    ],
    faculty: [
      { name: "Constitutional Law Mentor", role: "NLU Alum & Legal Educator" },
      { name: "Critical Reading Specialist", role: "Passage Dissection Expert" }
    ]
  }
];

// Initialize Batches Repository in LocalStorage if not already set
function initBatchesStorage() {
  if (!localStorage.getItem('mendorbit_batches')) {
    localStorage.setItem('mendorbit_batches', JSON.stringify(DEFAULT_DEMO_BATCHES));
  }
}

// Retrieve all active batches
function getBatchesList() {
  initBatchesStorage();
  try {
    const raw = localStorage.getItem('mendorbit_batches');
    return JSON.parse(raw) || DEFAULT_DEMO_BATCHES;
  } catch (e) {
    console.error("Error reading batches from storage, using demo defaults:", e);
    return DEFAULT_DEMO_BATCHES;
  }
}

// Sync with Firestore Cloud Database (Real-time live WebSocket sync)
function syncBatchesWithFirestore(onUpdated) {
  if (typeof mendorbitDB === 'undefined' || !mendorbitDB) return;

  mendorbitDB.collection('mendorbit_batches').onSnapshot(snapshot => {
    if (!snapshot.empty) {
      const cloudBatches = [];
      snapshot.forEach(doc => {
        cloudBatches.push(doc.data());
      });
      localStorage.setItem('mendorbit_batches', JSON.stringify(cloudBatches));
      if (typeof onUpdated === 'function') onUpdated(cloudBatches);
    } else {
      // First time initialization: seed default batches to Firestore Cloud
      DEFAULT_DEMO_BATCHES.forEach(b => {
        mendorbitDB.collection('mendorbit_batches').doc(b.id).set(b).catch(() => {});
      });
      if (typeof onUpdated === 'function') onUpdated(DEFAULT_DEMO_BATCHES);
    }
  }, err => {
    console.log("Firestore batches live sync note (using local offline mirror):", err.message);
  });
}

// Get single batch by its ID slug
function getBatchById(id) {
  const batches = getBatchesList();
  return batches.find(b => b.id === id) || null;
}

// Save or Update a batch (Admin Panel API -> Firestore + LocalStorage)
function saveBatchToStorage(batch) {
  const batches = getBatchesList();
  const existingIdx = batches.findIndex(b => b.id === batch.id);
  if (existingIdx >= 0) {
    batches[existingIdx] = batch;
  } else {
    batches.unshift(batch);
  }
  localStorage.setItem('mendorbit_batches', JSON.stringify(batches));

  // Sync with Firestore Cloud
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_batches').doc(batch.id).set(batch)
      .then(() => console.log("Batch synced to Firestore Cloud:", batch.id))
      .catch(err => console.log("Firestore cloud write note:", err.message));
  }
}

// Delete a batch (Admin Panel API -> Firestore + LocalStorage)
function deleteBatchFromStorage(id) {
  let batches = getBatchesList();
  batches = batches.filter(b => b.id !== id);
  localStorage.setItem('mendorbit_batches', JSON.stringify(batches));

  // Delete from Firestore Cloud
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_batches').doc(id).delete()
      .then(() => console.log("Batch deleted from Firestore Cloud:", id))
      .catch(err => console.log("Firestore cloud delete note:", err.message));
  }
}

// Reset batches back to demo defaults (Admin Panel utility)
function resetBatchesToDefault() {
  localStorage.setItem('mendorbit_batches', JSON.stringify(DEFAULT_DEMO_BATCHES));

  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    DEFAULT_DEMO_BATCHES.forEach(b => {
      mendorbitDB.collection('mendorbit_batches').doc(b.id).set(b).catch(() => {});
    });
  }
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

// Render batches inside container with category filtering
function renderBatchesToContainer(containerId = 'batches-grid-container', filterCategory = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allBatches = getBatchesList();
  const filtered = filterCategory === 'all' 
    ? allBatches 
    : allBatches.filter(b => b.category === filterCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
        <p class="text-base font-bold">No batches found in this category.</p>
        <p class="text-xs mt-1">Check other categories or view all batches.</p>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(b => createBatchCardHTML(b)).join('');
  }

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

// Initialize dynamic rendering and filter buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  let activeCategory = 'all';
  renderBatchesToContainer('batches-grid-container', activeCategory);

  // Sync with Firestore Cloud in background and re-render if updated
  syncBatchesWithFirestore(() => {
    renderBatchesToContainer('batches-grid-container', activeCategory);
  });

  // Filter Buttons binding
  const filterBtns = document.querySelectorAll('.batch-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.getAttribute('data-filter') || 'all';

      // Update active state of buttons
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-blue-900', 'text-white', 'shadow-md');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');

      renderBatchesToContainer('batches-grid-container', activeCategory);
    });
  });
});
