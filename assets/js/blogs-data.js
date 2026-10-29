// Mendorbit - Official Blogs & Notes Data Engine (v2.5.0)
// High-Performance Category Architecture: /blogs/{category}/{slug}.html
// 100% Real-time synchronization with Cloud Firestore (mendorbit_blogs)

const MENDORBIT_BLOG_CATEGORIES = [
  { slug: 'all', name: 'All Resources', icon: 'sparkles' },
  { slug: 'notes', name: 'Notes & PDFs', icon: 'file-text' },
  { slug: 'strategy', name: 'Exam Strategy', icon: 'target' },
  { slug: 'law', name: 'Law & BNS', icon: 'scale' },
  { slug: 'editorial', name: 'Editorials', icon: 'feather' },
  { slug: 'news', name: 'News & Alerts', icon: 'bell' },
  { slug: 'colleges', name: 'College Reviews', icon: 'graduation-cap' },
  { slug: 'case-study', name: 'Case Studies', icon: 'briefcase' }
];

const DEFAULT_BLOGS_LIST = [
  {
    id: "blog_bns_103_law",
    title: "BNS Section 103 Explained: Murder Definition & Punishment vs IPC 302",
    category: "Law",
    categorySlug: "law",
    readTime: "6 Min Read",
    author: "Mendorbit Legal Faculty",
    authorRole: "NLU Mentors",
    description: "Complete legal breakdown of Section 103 of Bharatiya Nyaya Sanhita 2023. Key differences from IPC 302, mob lynching provisions, and landmark constitutional principles.",
    posterImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/law/bns-section-103-murder-punishment-explained.html",
    isFeatured: true,
    active: true,
    order: 1
  },
  {
    id: "blog_class10_real_numbers",
    title: "Class 10 Real Numbers Revision Notes: Formulas & Solved Exemplar Questions",
    category: "Notes",
    categorySlug: "notes",
    readTime: "8 Min Read • Free PDF",
    author: "Mendorbit Maths Wing",
    authorRole: "Formula Sheet",
    description: "Complete chapter notes for CBSE Class 10 Chapter 1. Fundamental Theorem of Arithmetic, irrationality proofs, HCF-LCM shortcuts, and printable PDF cheat sheet.",
    posterImageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    link: "blogs/notes/class-10-real-numbers-revision-notes.html",
    isFeatured: true,
    active: true,
    order: 2
  },
  {
    id: "blog_class10_strategy",
    title: "Class 10 Board Exam: How Weak Students Can Score 90%+ in Maths & Science",
    category: "Strategy",
    categorySlug: "strategy",
    readTime: "10 Min Read",
    author: "Mendorbit Academic Wing",
    authorRole: "Senior Faculty",
    description: "Step-by-step blueprint from NCERT ground zero to board topper marks. Learn the exact method Mendorbit mentors use to eliminate examination anxiety.",
    posterImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    link: "blogs/strategy/class-10-maths-science-strategy.html",
    isFeatured: false,
    active: true,
    order: 3
  },
  {
    id: "blog_ssc_cgl_beginner",
    title: "SSC CGL 2026 for Absolute Beginners: Zero se Inspector Kaise Banein",
    category: "Strategy",
    categorySlug: "strategy",
    readTime: "12 Min Read",
    author: "Mendorbit Exam Desk",
    authorRole: "Exam Strategist",
    description: "Complete syllabus breakdown, high-scoring subjects, non-math background strategy, and how to master Quantitative Aptitude & Reasoning from scratch.",
    posterImageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    link: "blogs/strategy/ssc-cgl-beginner-guide-zero-to-hero.html",
    isFeatured: false,
    active: true,
    order: 4
  },
  {
    id: "blog_clat_ailet_basics",
    title: "CLAT 2026: Legal Reasoning & Current Affairs Strategy from Scratch",
    category: "Strategy",
    categorySlug: "strategy",
    readTime: "8 Min Read",
    author: "Law Mentors",
    authorRole: "NLU Alumni",
    description: "How to develop the critical passage reading speed required for modern CLAT questions without joining overpriced commercial coaching centers.",
    posterImageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    link: "blogs/strategy/clat-ailet-preparation-basics.html",
    isFeatured: false,
    active: true,
    order: 5
  },
  {
    id: "note_class10_maths_formulas",
    title: "Class 10th Complete Mathematics Formula Sheet & Theorems Cheat Sheet",
    category: "Notes",
    categorySlug: "notes",
    readTime: "4 Pages • Free PDF",
    author: "Mendorbit Maths Wing",
    authorRole: "Formula Sheet",
    description: "Every formula, theorem proof, and algebraic identity from Real Numbers to Statistics on a high-density 4-page printable revision cheat sheet.",
    posterImageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 6
  },
  {
    id: "note_ssc_120_grammar",
    title: "120 Golden Rules of English Grammar for SSC & Banking Aspirants",
    category: "Notes",
    categorySlug: "notes",
    readTime: "12 Pages • Tier 1 + 2",
    author: "Mendorbit English Wing",
    authorRole: "Handcrafted Rules",
    description: "Subject-verb agreement, inversion rules, and conditional clauses simplified with authentic past-year questions from Tier 1 & Tier 2.",
    posterImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 7
  },
  {
    id: "note_speed_math_tricks",
    title: "Vedic Speed Math & Mental Calculation Shortcuts Kit",
    category: "Notes",
    categorySlug: "notes",
    readTime: "8 Pages • 25+ Shortcuts",
    author: "Quant Faculty",
    authorRole: "Calculation Kit",
    description: "Master rapid cube roots, square roots, fast percentage splits, and multiplication matrices for SSC CGL, Bank PO, and CSAT speed enhancement.",
    posterImageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 8
  }
];

// Active Category Filter State
let currentActiveBlogCategory = 'all';

// Retrieve cached blogs list
function getBlogsList() {
  try {
    const raw = localStorage.getItem('mendorbit_blogs');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return DEFAULT_BLOGS_LIST;
  } catch (e) {
    return DEFAULT_BLOGS_LIST;
  }
}

// Sync with Cloud Firestore
function syncBlogsWithFirestore(onUpdated) {
  if (typeof mendorbitDB === 'undefined' || !mendorbitDB) {
    if (typeof onUpdated === 'function') onUpdated(getBlogsList());
    return;
  }

  mendorbitDB.collection('mendorbit_blogs').onSnapshot(snapshot => {
    const cloudBlogs = [];
    snapshot.forEach(docSnap => {
      cloudBlogs.push({ ...docSnap.data(), id: docSnap.id });
    });

    if (!snapshot.empty) {
      cloudBlogs.sort((a, b) => (a.order || 99) - (b.order || 99));
      localStorage.setItem('mendorbit_blogs', JSON.stringify(cloudBlogs));
      localStorage.setItem('mendorbit_blogs_cloud_synced', 'true');
      if (typeof onUpdated === 'function') onUpdated(cloudBlogs);
    } else {
      if (localStorage.getItem('mendorbit_blogs_cloud_synced') === 'true') {
        localStorage.setItem('mendorbit_blogs', JSON.stringify([]));
        if (typeof onUpdated === 'function') onUpdated([]);
      } else {
        const initial = getBlogsList();
        if (typeof onUpdated === 'function') onUpdated(initial);
      }
    }
  }, err => {
    console.log("Firestore blogs live sync note (using local mirror):", err.message);
    if (typeof onUpdated === 'function') onUpdated(getBlogsList());
  });
}

// Global Category Filter Handler
window.setBlogCategoryFilter = function(categorySlug) {
  currentActiveBlogCategory = categorySlug || 'all';
  
  // Update UI Pills in index.html and blog.html
  document.querySelectorAll('.blog-category-pill').forEach(btn => {
    const targetCat = btn.getAttribute('data-category-slug');
    if (targetCat === currentActiveBlogCategory) {
      btn.className = 'blog-category-pill active-cat px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md shadow-orange-600/30 transition transform scale-105';
    } else {
      btn.className = 'blog-category-pill px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 transition';
    }
  });

  const blogs = getBlogsList();
  renderBlogsSection(blogs);
  renderBlogHubCatalog(blogs);
};

// Global Share Function
window.shareBlogPost = function(blogId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const blogs = getBlogsList();
  const blog = blogs.find(b => String(b.id) === String(blogId)) || {
    title: "Mendorbit Blogs & Notes",
    link: "blog.html"
  };

  const targetUrl = new URL(blog.link || 'blog.html', window.location.origin).href;
  const shareData = {
    title: blog.title,
    text: `${blog.title} — Read on Mendorbit:\n`,
    url: targetUrl
  };

  if (navigator.share) {
    navigator.share(shareData).catch((err) => {
      if (err.name !== 'AbortError') {
        openCustomShareSheet(blog, targetUrl);
      }
    });
  } else {
    openCustomShareSheet(blog, targetUrl);
  }
};

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
            <h3 class="font-black text-sm text-slate-900 dark:text-white leading-tight">Share Article</h3>
            <p class="text-[10px] text-slate-400">Share with fellow aspirants & study groups</p>
          </div>
        </div>
        <button type="button" onclick="closeCustomShareSheet()" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <p class="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">${blog.title}</p>
        <p class="text-[10px] text-slate-400 mt-1 font-mono truncate">${targetUrl}</p>
      </div>

      <div class="grid grid-cols-4 gap-3 text-center">
        <a href="https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}" target="_blank" class="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex flex-col items-center gap-1.5 transition transform active:scale-95">
          <i data-lucide="message-circle" class="w-5 h-5"></i>
          <span class="text-[10px] font-bold">WhatsApp</span>
        </a>
        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" class="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 flex flex-col items-center gap-1.5 transition transform active:scale-95">
          <i data-lucide="send" class="w-5 h-5"></i>
          <span class="text-[10px] font-bold">Telegram</span>
        </a>
        <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" class="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex flex-col items-center gap-1.5 transition transform active:scale-95">
          <span class="font-black text-sm leading-none">𝕏</span>
          <span class="text-[10px] font-bold">Twitter</span>
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" class="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex flex-col items-center gap-1.5 transition transform active:scale-95">
          <i data-lucide="linkedin" class="w-5 h-5"></i>
          <span class="text-[10px] font-bold">LinkedIn</span>
        </a>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <input type="text" readonly value="${targetUrl}" class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono focus:outline-none">
        <button type="button" onclick="copyShareUrl('${targetUrl}')" class="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer">
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
    alert("Article link copied to clipboard!");
    closeCustomShareSheet();
  }).catch(() => {
    prompt("Copy this URL:", url);
  });
};

// Generate Single Card HTML (With Category Folder Path & Modern Poster Artwork)
function createBlogCardHTML(blog, isExtra) {
  const hasPoster = Boolean(blog.posterImageUrl && blog.posterImageUrl.trim() !== '');
  const extraClass = isExtra ? 'extra-blog-note hidden' : '';

  // Category Badge Colors
  const categoryBadgeStyles = {
    'law': 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800',
    'notes': 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
    'strategy': 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
    'editorial': 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800',
    'news': 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800',
    'colleges': 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
    'case-study': 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800'
  };

  const badgeStyle = categoryBadgeStyles[blog.categorySlug] || 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800';

  return `
    <article class="${extraClass} group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-950/5 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 relative">
      
      <div>
        ${hasPoster ? `
          <!-- Poster Banner on Top -->
          <div class="w-full aspect-[16/9] min-h-[190px] sm:min-h-[210px] overflow-hidden bg-slate-100 dark:bg-slate-800 relative group/img border-b border-slate-100 dark:border-slate-800">
            <img src="${blog.posterImageUrl}" alt="${blog.title}" loading="lazy" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
            
            <!-- Category Badge on Poster -->
            <span class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
              ${blog.category || 'Article'}
            </span>

            <!-- Glass Share Button on Poster -->
            <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 transition-all shadow-md transform active:scale-95 cursor-pointer" title="Share Article">
              <i data-lucide="share-2" class="w-4 h-4"></i>
            </button>
          </div>
        ` : `
          <!-- Gradient Line if poster is missing -->
          <div class="w-full h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-blue-600"></div>
        `}

        <!-- Card Content Body -->
        <div class="p-6">
          <div class="flex items-center justify-between text-xs mb-3 gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              ${!hasPoster ? `
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}">
                  ${blog.category || 'Article'}
                </span>
              ` : ''}
              <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i> ${blog.readTime || '5 Min Read'}
              </span>
            </div>

            ${!hasPoster ? `
              <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="p-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 text-slate-500 hover:text-orange-600 transition cursor-pointer" title="Share Article">
                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>

          <!-- Title -->
          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition line-clamp-2">
            <a href="${blog.link || 'blog.html'}">${blog.title}</a>
          </h3>

          <!-- Description -->
          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            ${blog.description || ''}
          </p>
        </div>
      </div>

      <!-- Bottom Author & Read Link -->
      <div class="px-6 pb-6 pt-0">
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[180px]">
            <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i> 
            <span class="truncate">${blog.author || 'Mendorbit Mentor'}</span>
          </span>
          <a href="${blog.link || 'blog.html'}" class="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:gap-1.5 transition-all flex-shrink-0">
            <span>Read Article</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>

    </article>
  `;
}

// Render Featured Hero Banner Card for Home Page & Catalog Top
function createFeaturedHeroHTML(blog) {
  if (!blog) return '';
  return `
    <div class="col-span-full mb-4 group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-orange-400 transition-all duration-300 shadow-sm hover:shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
      <div class="lg:col-span-7 aspect-[16/9] lg:aspect-auto min-h-[240px] sm:min-h-[300px] overflow-hidden relative">
        <img src="${blog.posterImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}" alt="${blog.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>
        <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-lg flex items-center gap-1.5">
          <i data-lucide="flame" class="w-3.5 h-3.5"></i> Featured Master Guide
        </span>
      </div>
      <div class="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
              ${blog.category || 'Law & BNS'}
            </span>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3"></i> ${blog.readTime || '6 Min Read'}
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 transition">
            <a href="${blog.link}">${blog.title}</a>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            ${blog.description}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400">${blog.author || 'Mendorbit Faculty'}</span>
          <a href="${blog.link}" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 transition transform active:scale-95">
            <span>Read Full Guide</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

// Render Blogs in index.html container
function renderBlogsSection(blogs) {
  const container = document.getElementById('blogs-notes-grid');
  if (!container) return;

  const rawBlogs = blogs || [];
  let filtered = rawBlogs.filter(b => b.active !== false);

  if (currentActiveBlogCategory !== 'all') {
    filtered = filtered.filter(b => b.categorySlug === currentActiveBlogCategory || (b.category || '').toLowerCase() === currentActiveBlogCategory);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <div class="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="book-open" class="w-8 h-8 opacity-60"></i>
        </div>
        <p class="font-extrabold text-sm text-slate-700 dark:text-slate-300">No articles found in this category</p>
        <p class="text-xs text-slate-400 mt-1">Select "All Resources" to see all published study guides.</p>
      </div>
    `;
    const toggleBtnWrapper = document.getElementById('blogs-notes-view-more-wrapper');
    if (toggleBtnWrapper) toggleBtnWrapper.classList.add('hidden');
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: container });
    return;
  }

  // Find Featured Post (if in 'all' view)
  let featuredHTML = '';
  let standardCards = filtered;

  if (currentActiveBlogCategory === 'all') {
    const featuredPost = filtered.find(b => b.isFeatured) || filtered[0];
    if (featuredPost) {
      featuredHTML = createFeaturedHeroHTML(featuredPost);
      standardCards = filtered.filter(b => b.id !== featuredPost.id);
    }
  }

  container.innerHTML = featuredHTML + standardCards.map((blog, idx) => {
    const isExtra = idx >= 6;
    return createBlogCardHTML(blog, isExtra);
  }).join('');

  // Handle visibility of View More button
  const toggleBtnWrapper = document.getElementById('blogs-notes-view-more-wrapper');
  if (toggleBtnWrapper) {
    if (standardCards.length <= 6) {
      toggleBtnWrapper.classList.add('hidden');
    } else {
      toggleBtnWrapper.classList.remove('hidden');
    }
  }

  if (window.lucide && window.lucide.createIcons) {
    lucide.createIcons({ root: container });
  }
}

// Render Catalog on blog.html
function renderBlogHubCatalog(blogs) {
  const catalogGrid = document.getElementById('blog-hub-cards-grid');
  if (!catalogGrid) return;

  const rawBlogs = blogs || [];
  let filtered = rawBlogs.filter(b => b.active !== false);

  if (currentActiveBlogCategory !== 'all') {
    filtered = filtered.filter(b => b.categorySlug === currentActiveBlogCategory || (b.category || '').toLowerCase() === currentActiveBlogCategory);
  }

  const searchInput = document.getElementById('blog-hub-search-input');
  if (searchInput && searchInput.value.trim() !== '') {
    const term = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(b => 
      (b.title || '').toLowerCase().includes(term) ||
      (b.description || '').toLowerCase().includes(term) ||
      (b.category || '').toLowerCase().includes(term)
    );
  }

  const countBadge = document.getElementById('blog-hub-total-count');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} Resources`;
  }

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <div class="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <p class="font-bold text-sm text-slate-800 dark:text-slate-200">No resources match your search or filter</p>
        <p class="text-xs text-slate-400 mt-1">Try another keyword or reset the category filter.</p>
      </div>
    `;
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: catalogGrid });
    return;
  }

  catalogGrid.innerHTML = filtered.map(blog => createBlogCardHTML(blog, false)).join('');

  if (window.lucide && window.lucide.createIcons) {
    lucide.createIcons({ root: catalogGrid });
  }
}

// View More / Less Toggle
window.toggleBlogsNotesView = function() {
  const extraCards = document.querySelectorAll('.extra-blog-note');
  const btnText = document.getElementById('btn-blogs-notes-text');
  const btnIcon = document.getElementById('btn-blogs-notes-icon');
  if (!extraCards || extraCards.length === 0) return;

  const isHidden = extraCards[0].classList.contains('hidden');
  extraCards.forEach(card => {
    if (isHidden) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  if (btnText) btnText.textContent = isHidden ? "View Less" : "View More";
  if (btnIcon) {
    btnIcon.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
  }
};

// Listen for cross-tab storage changes
window.addEventListener('storage', (e) => {
  if (e.key === 'mendorbit_blogs') {
    const updated = getBlogsList();
    renderBlogsSection(updated);
    renderBlogHubCatalog(updated);
  }
});

// Initialize Blogs Engine on page ready
document.addEventListener('DOMContentLoaded', () => {
  // Check URL query parameters for initial category filter: e.g. blog.html?category=law
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentActiveBlogCategory = catParam.toLowerCase().trim();
  }

  const initialList = getBlogsList();
  renderBlogsSection(initialList);
  renderBlogHubCatalog(initialList);

  syncBlogsWithFirestore(updatedList => {
    renderBlogsSection(updatedList);
    renderBlogHubCatalog(updatedList);
  });
});
