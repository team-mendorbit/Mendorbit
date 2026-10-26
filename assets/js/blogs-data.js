// Mendorbit - Official Blogs & Notes Data Engine (v1.3.8)
// Real-time synchronization with Cloud Firestore (mendorbit_blogs)

const DEFAULT_BLOGS_LIST = [
  {
    id: "blog_class10_strategy",
    title: "Class 10 Board Exam: How Weak Students Can Score 90%+ in Maths & Science",
    category: "Class 10 CBSE",
    readTime: "10 Min Read",
    author: "Mendorbit Editorial",
    authorRole: "Senior Faculty",
    description: "Step-by-step blueprint from NCERT basics to exemplar questions. Learn the exact ground-zero method Mendorbit mentors use to eliminate math anxiety.",
    posterImageUrl: "",
    link: "blogs/class-10-maths-science-strategy.html",
    active: true,
    order: 1
  },
  {
    id: "note_class10_maths_formulas",
    title: "Class 10th Complete Mathematics Formula Sheet & Theorems",
    category: "Formula Sheet PDF",
    readTime: "4 Pages • Free PDF",
    author: "Mendorbit Maths Wing",
    authorRole: "Formula Sheet",
    description: "Every formula, theorem proof, and algebraic identity from Real Numbers to Statistics on a high-density 4-page printable revision cheat sheet.",
    posterImageUrl: "",
    link: "notes.html",
    active: true,
    order: 2
  },
  {
    id: "blog_ssc_cgl_beginner",
    title: "SSC CGL 2026 for Absolute Beginners: Zero se Inspector Kaise Banein",
    category: "SSC CGL 2026",
    readTime: "12 Min Read",
    author: "Mendorbit Faculty",
    authorRole: "Exam Strategist",
    description: "Complete syllabus breakdown, high-scoring subjects, non-math background strategy, and how to master Quantitative Aptitude from ground zero.",
    posterImageUrl: "",
    link: "blogs/ssc-cgl-beginner-guide-zero-to-hero.html",
    active: true,
    order: 3
  },
  {
    id: "note_class10_science_reactions",
    title: "Chemical Reactions & Physics Ray Diagrams Quick Kit",
    category: "Science Quick Kit",
    readTime: "6 Pages • Diagram Kit",
    author: "Mendorbit Science Wing",
    authorRole: "Revision Notes",
    description: "High-yield chemical equations balancing cheat sheet and mirror/lens ray diagram mnemonics designed for 100% accuracy in CBSE boards.",
    posterImageUrl: "",
    link: "notes.html",
    active: true,
    order: 4
  },
  {
    id: "blog_clat_ailet_basics",
    title: "CLAT 2026: Legal Reasoning & Current Affairs Strategy from Scratch",
    category: "CLAT & AILET",
    readTime: "8 Min Read",
    author: "Law Mentors",
    authorRole: "NLU Alumni",
    description: "How to develop the critical passage reading speed required for modern CLAT questions without joining overpriced commercial coaching institutes.",
    posterImageUrl: "",
    link: "blogs/clat-ailet-preparation-basics.html",
    active: true,
    order: 5
  },
  {
    id: "note_ssc_120_grammar",
    title: "120 Golden Rules of English Grammar for SSC & Banking",
    category: "Grammar Rules",
    readTime: "12 Pages • Tier 1 + 2",
    author: "Mendorbit English Wing",
    authorRole: "Handcrafted Rules",
    description: "Subject-verb agreement, inversion rules, and conditional clauses simplified with authentic past-year questions from Tier 1 & Tier 2.",
    posterImageUrl: "",
    link: "notes.html",
    active: true,
    order: 6
  },
  {
    id: "note_speed_math_tricks",
    title: "Vedic Speed Math & Mental Calculation Shortcuts Kit",
    category: "Speed Math",
    readTime: "8 Pages • 25+ Shortcuts",
    author: "Quant Faculty",
    authorRole: "Calculation Kit",
    description: "Master rapid cube roots, square roots, fast percentage splits, and multiplication matrices for SSC CGL, Bank PO, and CSAT speed enhancement.",
    posterImageUrl: "",
    link: "notes.html",
    active: true,
    order: 7
  },
  {
    id: "note_constitution_legal",
    title: "Constitution & Legal Aptitude High-Yield Quick Notes",
    category: "Legal Aptitude",
    readTime: "15 Pages • Landmark Laws",
    author: "Mendorbit Law Wing",
    authorRole: "Cheat Sheet",
    description: "Fundamental Rights, Directive Principles, landmark constitutional judgments, and tort law principles structured concisely for CLAT aspirants.",
    posterImageUrl: "",
    link: "notes.html",
    active: true,
    order: 8
  },
  {
    id: "note_class9_laws_motion",
    title: "Laws of Motion & Gravitation Numerical Problem Solver",
    category: "Class 9 Foundation",
    readTime: "10 Pages • Physics",
    author: "Physics Mentors",
    authorRole: "Concept Kit",
    description: "Step-by-step graphical derivations, unit conversions, and 30 core numericals solved using Mendorbit's signature 3-step diagrammatic method.",
    posterImageUrl: "",
    link: "notes.html",
    active: true,
    order: 9
  }
];

// Retrieve cached blogs list
function getBlogsList() {
  try {
    const raw = localStorage.getItem('mendorbit_blogs');
    if (!raw) return DEFAULT_BLOGS_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BLOGS_LIST;
  } catch (e) {
    return DEFAULT_BLOGS_LIST;
  }
}

// Sync with Cloud Firestore
function syncBlogsWithFirestore(onUpdated) {
  if (typeof mendorbitDB === 'undefined' || !mendorbitDB) {
    const local = getBlogsList();
    if (typeof onUpdated === 'function') onUpdated(local);
    return;
  }

  mendorbitDB.collection('mendorbit_blogs').onSnapshot(snapshot => {
    if (snapshot.empty) {
      // If Firestore collection has not been seeded yet, use defaults
      const local = getBlogsList();
      if (typeof onUpdated === 'function') onUpdated(local);
      return;
    }

    const cloudBlogs = [];
    snapshot.forEach(docSnap => {
      cloudBlogs.push({ ...docSnap.data(), id: docSnap.id });
    });

    // Sort by order or creation time
    cloudBlogs.sort((a, b) => (a.order || 99) - (b.order || 99));

    try {
      localStorage.setItem('mendorbit_blogs', JSON.stringify(cloudBlogs));
    } catch(e) {}

    if (typeof onUpdated === 'function') onUpdated(cloudBlogs);
  }, err => {
    console.log("Firestore blogs live sync note (using local mirror):", err.message);
    const local = getBlogsList();
    if (typeof onUpdated === 'function') onUpdated(local);
  });
}

// Save or Update single blog in Firestore + LocalStorage
function saveBlogToStorage(blog) {
  const blogs = getBlogsList();
  const existingIdx = blogs.findIndex(b => String(b.id) === String(blog.id));
  if (existingIdx >= 0) {
    blogs[existingIdx] = blog;
  } else {
    blogs.push(blog);
  }
  localStorage.setItem('mendorbit_blogs', JSON.stringify(blogs));

  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_blogs').doc(String(blog.id)).set({ ...blog, id: blog.id })
      .then(() => console.log("Blog saved to Firestore:", blog.id))
      .catch(err => console.log("Firestore blog write note:", err.message));
  }
}

// Delete Blog from Storage
function deleteBlogFromStorage(id) {
  const blogs = getBlogsList().filter(b => String(b.id) !== String(id));
  localStorage.setItem('mendorbit_blogs', JSON.stringify(blogs));

  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_blogs').doc(String(id)).delete()
      .then(() => console.log("Blog deleted from Firestore:", id))
      .catch(err => console.log("Firestore blog delete note:", err.message));
  }
}

// Global Share Blog & Notes function
window.shareBlogPost = function(blogId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const blogs = getBlogsList();
  const blog = blogs.find(b => String(b.id) === String(blogId)) || {
    title: "Mendorbit Blogs & Notes",
    link: "index.html#blogs-notes-grid"
  };

  const targetUrl = new URL(blog.link || 'index.html', window.location.origin).href;
  const shareData = {
    title: blog.title,
    text: `${blog.title} — Study notes & strategy on Mendorbit:`,
    url: targetUrl
  };

  // 1. Try Native Web Share API (Mobile & Supporting Desktops)
  if (navigator.share) {
    navigator.share(shareData).catch((err) => {
      if (err.name !== 'AbortError') {
        openCustomShareSheet(blog, targetUrl);
      }
    });
  } else {
    // 2. Open Custom High-End Share Sheet
    openCustomShareSheet(blog, targetUrl);
  }
};

// Custom Share Modal for Desktop / Non-Native Browsers
function openCustomShareSheet(blog, targetUrl) {
  let modal = document.getElementById('mendorbit-share-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mendorbit-share-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300';
    document.body.appendChild(modal);
  }

  const encodedUrl = encodeURIComponent(targetUrl);
  const encodedText = encodeURIComponent(`${blog.title} — Read on Mendorbit:\n`);

  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scaleIn">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
            <i data-lucide="share-2" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-black text-sm text-slate-900 dark:text-white leading-tight">Share Blog & Notes</h3>
            <p class="text-[10px] text-slate-400">Share with fellow aspirants & study groups</p>
          </div>
        </div>
        <button type="button" onclick="closeCustomShareSheet()" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <p class="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">${blog.title}</p>
        <p class="text-[10px] text-slate-400 mt-1 font-mono truncate">${targetUrl}</p>
      </div>

      <!-- Social Share Grid -->
      <div class="grid grid-cols-4 gap-3 text-center">
        <!-- WhatsApp -->
        <a href="https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}" target="_blank" class="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-600 flex flex-col items-center gap-1.5 transition transform active:scale-95 group">
          <i data-lucide="message-circle" class="w-5 h-5"></i>
          <span class="text-[10px] font-bold">WhatsApp</span>
        </a>
        <!-- Telegram -->
        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" class="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 text-sky-600 flex flex-col items-center gap-1.5 transition transform active:scale-95 group">
          <i data-lucide="send" class="w-5 h-5"></i>
          <span class="text-[10px] font-bold">Telegram</span>
        </a>
        <!-- Twitter / X -->
        <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" class="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex flex-col items-center gap-1.5 transition transform active:scale-95 group">
          <span class="font-black text-sm">𝕏</span>
          <span class="text-[10px] font-bold">Twitter</span>
        </a>
        <!-- LinkedIn -->
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" class="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 text-blue-600 flex flex-col items-center gap-1.5 transition transform active:scale-95 group">
          <i data-lucide="linkedin" class="w-5 h-5"></i>
          <span class="text-[10px] font-bold">LinkedIn</span>
        </a>
      </div>

      <!-- Copy Link Row -->
      <div class="flex items-center gap-2 pt-1">
        <input type="text" readonly value="${targetUrl}" class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono focus:outline-none">
        <button type="button" onclick="copyShareUrl('${targetUrl}')" class="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition transform active:scale-95">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          <span>Copy</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: modal });
}

window.closeCustomShareSheet = function() {
  const modal = document.getElementById('mendorbit-share-modal');
  if (modal) modal.classList.add('hidden');
};

window.copyShareUrl = function(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied to clipboard! Share it with your friends.");
    closeCustomShareSheet();
  }).catch(() => {
    prompt("Copy this URL:", url);
  });
};

// Generate Single Card HTML
function createBlogCardHTML(blog, isExtra) {
  const hasPoster = blog.posterImageUrl && blog.posterImageUrl.trim() !== '';
  const extraClass = isExtra ? 'extra-blog-note hidden' : '';

  return `
    <article class="${extraClass} group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:border-orange-300 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-orange-900/5 dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-300 relative">
      
      <div>
        ${hasPoster ? `
          <div class="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 relative group/img">
            <img src="${blog.posterImageUrl}" alt="${blog.title}" loading="lazy" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500">
            <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
              ${blog.category || 'Educational'}
            </span>
          </div>
        ` : ''}

        <!-- Top Badges & Share Action Row -->
        <div class="flex items-center justify-between text-xs mb-3.5 gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            ${!hasPoster ? `
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/60">
                <i data-lucide="sparkles" class="w-3 h-3 text-orange-600"></i> ${blog.category || 'Guide'}
              </span>
            ` : ''}
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> ${blog.readTime || 'Read Guide'}
            </span>
          </div>

          <!-- Cute Share Button -->
          <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors shadow-sm" title="Share Blog & Notes">
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Title -->
        <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
          <a href="${blog.link || 'notes.html'}">${blog.title}</a>
        </h3>

        <!-- Description -->
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          ${blog.description || ''}
        </p>
      </div>

      <!-- Bottom Author & Read Link -->
      <div class="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span class="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[180px]">
          <i data-lucide="user" class="w-3 h-3 text-slate-400 flex-shrink-0"></i> 
          <span class="truncate">${blog.author || 'Mendorbit Mentor'}</span>
        </span>
        <a href="${blog.link || 'notes.html'}" class="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:gap-1.5 transition-all flex-shrink-0">
          <span>Read & View</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>

    </article>
  `;
}

// Render Blogs in index.html container
function renderBlogsSection(blogs) {
  const container = document.getElementById('blogs-notes-grid');
  if (!container) return;

  const activeBlogs = blogs.filter(b => b.active !== false);

  if (activeBlogs.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i data-lucide="book-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="font-bold text-sm">No blogs or notes published yet.</p>
      </div>
    `;
    if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    return;
  }

  container.innerHTML = activeBlogs.map((blog, idx) => {
    const isExtra = idx >= 6;
    return createBlogCardHTML(blog, isExtra);
  }).join('');

  // Handle visibility of View More button
  const toggleBtnContainer = document.getElementById('btn-toggle-blogs-notes');
  if (toggleBtnContainer) {
    if (activeBlogs.length <= 6) {
      toggleBtnContainer.parentElement.classList.add('hidden');
    } else {
      toggleBtnContainer.parentElement.classList.remove('hidden');
    }
  }

  if (window.lucide && window.lucide.createIcons) {
    lucide.createIcons({ root: container });
  }
}

// Initialize Blogs Engine on page ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('blogs-notes-grid');
  if (container) {
    // 1. Initial immediate render from cache
    const initialList = getBlogsList();
    renderBlogsSection(initialList);

    // 2. Realtime listener from Cloud Firestore
    syncBlogsWithFirestore(updatedList => {
      renderBlogsSection(updatedList);
    });
  }
});
