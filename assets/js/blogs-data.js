// Mendorbit - Official Blogs & Notes Data Engine (v2.5.2)
// High-Performance Category Architecture: /blogs/{category}/{slug}.html
// 100% Real-time synchronization with Cloud Firestore (mendorbit_blogs)

const BLOGS_DATA_VERSION = '2.5.2';

const MENDORBIT_BLOG_CATEGORIES = [
  { slug: 'all', name: 'All Guides', icon: 'sparkles' },
  { slug: 'notes', name: 'Chapter Notes', icon: 'file-text' },
  { slug: 'strategy', name: 'Prep Strategy', icon: 'target' },
  { slug: 'law', name: 'Law & BNS', icon: 'scale' },
  { slug: 'editorial', name: 'Editorial', icon: 'feather' },
  { slug: 'news', name: 'Exam News', icon: 'bell' },
  { slug: 'colleges', name: 'Colleges', icon: 'graduation-cap' },
  { slug: 'case-study', name: 'Case Studies', icon: 'briefcase' }
];

const DEFAULT_BLOGS_LIST = [
  {
    id: "blog_bns_103_law",
    title: "BNS Section 103 Explained: Murder Definition & Punishment vs IPC 302",
    category: "Law",
    categorySlug: "law",
    readTime: "6 Min Read",
    views: 4820,
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
    readTime: "8 Min Read â€¢ Free PDF",
    views: 6430,
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
    views: 5910,
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
    views: 5120,
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
    views: 3420,
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
    readTime: "4 Pages â€¢ Free PDF",
    views: 8940,
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
    readTime: "12 Pages â€¢ Tier 1 + 2",
    views: 7650,
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
    readTime: "8 Pages â€¢ 25+ Shortcuts",
    views: 6180,
    author: "Quant Faculty",
    authorRole: "Calculation Kit",
    description: "Master rapid cube roots, square roots, fast percentage splits, and multiplication matrices for SSC CGL, Bank PO, and CSAT speed enhancement.",
    posterImageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 8
  },
  {
    id: "blog_editorial_neet_reforms",
    title: "National Testing & Entrance Exam Normalization: Student Rights & Policy Reforms",
    category: "Editorial",
    categorySlug: "editorial",
    readTime: "7 Min Read â€¢ Analysis",
    views: 2890,
    author: "Mendorbit Editorial Board",
    authorRole: "Policy Desk",
    description: "In-depth critical analysis of exam normalization, computer-based testing transparency, and structural reforms shaping competitive exams in India.",
    posterImageUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80",
    link: "blogs/editorial/exam-normalization-reforms-analysis.html",
    isFeatured: false,
    active: true,
    order: 9
  },
  {
    id: "blog_news_ssc_cgl_exam_dates",
    title: "SSC CGL 2026 Official Calendar & Revised Exam Pattern Notification",
    category: "News",
    categorySlug: "news",
    readTime: "3 Min Read â€¢ Official Alert",
    views: 4310,
    author: "Mendorbit News Desk",
    authorRole: "Notification Desk",
    description: "Staff Selection Commission releases updated tentative exam schedule, post-wise vacancy matrix, and revised Tier-1 normalization rules.",
    posterImageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    link: "blogs/news/ssc-cgl-official-notification-calendar.html",
    isFeatured: false,
    active: true,
    order: 10
  },
  {
    id: "blog_colleges_top_nlus_cutoff",
    title: "Top 10 NLUs in India: Rank-wise Cutoffs, Placement Stats & Real Campus Reviews",
    category: "Colleges",
    categorySlug: "colleges",
    readTime: "9 Min Read â€¢ Comparison",
    views: 3190,
    author: "Mendorbit Law Mentors",
    authorRole: "Campus Review Wing",
    description: "NLSIU Bengaluru, NALSAR Hyderabad, and WBNUJS Kolkata detailed comparison with Category-wise opening & closing ranks and corporate package stats.",
    posterImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/colleges/top-nlus-rankwise-cutoffs-placements.html",
    isFeatured: false,
    active: true,
    order: 11
  },
  {
    id: "blog_casestudy_edtech_evolution",
    title: "The Rise, Fall & Future of Online EdTech in India: Deep Dive Case Study",
    category: "Case Study",
    categorySlug: "case-study",
    readTime: "11 Min Read â€¢ Deep Dive",
    views: 2740,
    author: "Mendorbit Research Team",
    authorRole: "Industry Analysis",
    description: "How bloated marketing budgets collapsed early unicorns, and why sustainable, teacher-first models like Mendorbit are winning student trust.",
    posterImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/case-study/future-of-indian-edtech-case-study.html",
    isFeatured: false,
    active: true,
    order: 12
  }
];

// Active State
let currentActiveBlogCategory = 'all';
let visibleBlogHubCount = 9;

// Helper to format view count (e.g. 4820 -> 4.8k)
function formatViewsCount(count) {
  const n = parseInt(count, 10);
  if (isNaN(n) || n <= 0) return '1.2k';
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return n.toString();
}

// Record blog view (tracks in Firestore & LocalStorage)
window.recordBlogView = function(blogId) {
  if (!blogId) return;
  try {
    const list = getBlogsList();
    const item = list.find(b => String(b.id) === String(blogId));
    if (item) {
      item.views = (item.views || 0) + 1;
      localStorage.setItem('mendorbit_blogs', JSON.stringify(list));
    }
    if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
      mendorbitDB.collection('mendorbit_blogs').doc(String(blogId)).set({
        views: firebase.firestore.FieldValue.increment(1)
      }, { merge: true }).catch(() => {});
    }
  } catch(e) {}
};

// Retrieve cached blogs list with auto-invalidation
function getBlogsList() {
  try {
    const cachedVersion = localStorage.getItem('mendorbit_blogs_version');
    if (cachedVersion !== BLOGS_DATA_VERSION) {
      localStorage.setItem('mendorbit_blogs', JSON.stringify(DEFAULT_BLOGS_LIST));
      localStorage.setItem('mendorbit_blogs_version', BLOGS_DATA_VERSION);
      return DEFAULT_BLOGS_LIST;
    }

    const raw = localStorage.getItem('mendorbit_blogs');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(b => {
          if (!b.categorySlug) {
            const cat = (b.category || '').toLowerCase();
            if (cat.includes('note') || cat.includes('formula') || cat.includes('pdf')) b.categorySlug = 'notes';
            else if (cat.includes('law') || cat.includes('bns') || cat.includes('ipc') || cat.includes('constitution')) b.categorySlug = 'law';
            else if (cat.includes('news') || cat.includes('alert')) b.categorySlug = 'news';
            else if (cat.includes('editorial')) b.categorySlug = 'editorial';
            else if (cat.includes('college')) b.categorySlug = 'colleges';
            else if (cat.includes('case')) b.categorySlug = 'case-study';
            else b.categorySlug = 'strategy';
          }
          if (b.views === undefined) {
            const defaultItem = DEFAULT_BLOGS_LIST.find(d => d.id === b.id);
            b.views = defaultItem ? defaultItem.views : 1250;
          }
          return b;
        });
      }
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
      localStorage.setItem('mendorbit_blogs_version', BLOGS_DATA_VERSION);
      if (typeof onUpdated === 'function') onUpdated(cloudBlogs);
    } else {
      const initial = getBlogsList();
      if (typeof onUpdated === 'function') onUpdated(initial);
    }
  }, err => {
    console.log("Firestore blogs live sync note (using local mirror):", err.message);
    if (typeof onUpdated === 'function') onUpdated(getBlogsList());
  });
}

// Global Category Filter Handler
window.setBlogCategoryFilter = function(categorySlug) {
  currentActiveBlogCategory = categorySlug || 'all';
  visibleBlogHubCount = 9; // Reset pagination
  
  // Update UI Pills in index.html and blog.html
  document.querySelectorAll('.blog-category-pill').forEach(btn => {
    const targetCat = btn.getAttribute('data-category-slug');
    if (targetCat === currentActiveBlogCategory) {
      btn.className = 'blog-category-pill active-cat px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md shadow-orange-600/30 transition-all transform scale-105 whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    } else {
      btn.className = 'blog-category-pill px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    }
  });

  const blogs = getBlogsList();
  renderBlogsSection(blogs);
  renderBlogHubCatalog(blogs);
};

// Global Quick Tag Filter
window.quickFilterSearch = function(tag) {
  const searchInput = document.getElementById('blog-hub-search-input');
  if (searchInput) {
    searchInput.value = tag;
    const clearBtn = document.getElementById('blog-hub-search-clear');
    if (clearBtn) clearBtn.classList.remove('hidden');
    visibleBlogHubCount = 9;
    renderBlogHubCatalog(getBlogsList());
    
    // Scroll down smoothly to catalog
    const catalogSec = document.getElementById('blog-catalog-section');
    if (catalogSec) {
      catalogSec.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// Global Clear Search
window.clearBlogSearch = function() {
  const searchInput = document.getElementById('blog-hub-search-input');
  if (searchInput) {
    searchInput.value = '';
    const clearBtn = document.getElementById('blog-hub-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    visibleBlogHubCount = 9;
    renderBlogHubCatalog(getBlogsList());
  }
};

// Pagination: Load 9 More Blogs
window.loadMoreBlogs = function() {
  visibleBlogHubCount += 9;
  renderBlogHubCatalog(getBlogsList());
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
    text: `${blog.title} â€” Read on Mendorbit:\n`,
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
  const encodedText = encodeURIComponent(`${blog.title} â€” Read on Mendorbit:\n`);

  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
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
          <span class="font-black text-sm leading-none">ð•</span>
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

// Generate Single Card HTML (With SEO Microdata & View Counters)
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
  const viewsDisplay = formatViewsCount(blog.views);

  return `
    <article itemscope itemtype="https://schema.org/BlogPosting" class="${extraClass} group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-950/5 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 relative">
      
      <div>
        ${hasPoster ? `
          <!-- Poster Banner on Top -->
          <div class="w-full aspect-[16/9] min-h-[190px] sm:min-h-[210px] overflow-hidden bg-slate-100 dark:bg-slate-800 relative group/img border-b border-slate-100 dark:border-slate-800">
            <img itemprop="image" src="${blog.posterImageUrl}" alt="${blog.title}" loading="lazy" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"></div>
            
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
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400"></i> ${viewsDisplay}
              </span>
            </div>

            ${!hasPoster ? `
              <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="p-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 text-slate-500 hover:text-orange-600 transition cursor-pointer" title="Share Article">
                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>

          <!-- Title -->
          <h3 itemprop="headline" class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition line-clamp-2">
            <a href="${blog.link || 'blog.html'}" onclick="recordBlogView('${blog.id}')">${blog.title}</a>
          </h3>

          <!-- Description -->
          <p itemprop="description" class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            ${blog.description || ''}
          </p>
        </div>
      </div>

      <!-- Bottom Author & Read Link -->
      <div class="px-6 pb-6 pt-0">
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span itemprop="author" class="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[180px]">
            <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i> 
            <span class="truncate">${blog.author || 'Mendorbit Mentor'}</span>
          </span>
          <a href="${blog.link || 'blog.html'}" onclick="recordBlogView('${blog.id}')" class="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:gap-1.5 transition-all flex-shrink-0">
            <span>Read Guide</span>
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
  const viewsDisplay = formatViewsCount(blog.views);
  return `
    <div class="col-span-full mb-6 group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 shadow-md hover:shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
      <div class="lg:col-span-7 aspect-[16/9] lg:aspect-auto min-h-[260px] sm:min-h-[320px] overflow-hidden relative group/heroimg">
        <img src="${blog.posterImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}" alt="${blog.title}" class="w-full h-full object-cover group-hover/heroimg:scale-105 transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
        <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-xl flex items-center gap-1.5">
          <i data-lucide="flame" class="w-3.5 h-3.5"></i> Featured Master Guide
        </span>
      </div>
      <div class="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
              ${blog.category || 'Law & BNS'}
            </span>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3"></i> ${blog.readTime || '6 Min Read'}
            </span>
            <span class="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <i data-lucide="eye" class="w-3 h-3"></i> ${viewsDisplay} views
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 transition">
            <a href="${blog.link}" onclick="recordBlogView('${blog.id}')">${blog.title}</a>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            ${blog.description}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
            <span>${blog.author || 'Mendorbit Faculty'}</span>
          </span>
          <a href="${blog.link}" onclick="recordBlogView('${blog.id}')" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition transform active:scale-95">
            <span>Read Master Guide</span>
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
        <p class="text-xs text-slate-400 mt-1">Select "All Guides" to see all published study guides.</p>
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

// Render Catalog on blog.html (With 9-Card Pagination)
function renderBlogHubCatalog(blogs) {
  const catalogGrid = document.getElementById('blog-hub-cards-grid');
  if (!catalogGrid) return;

  const rawBlogs = blogs || [];
  let filtered = rawBlogs.filter(b => b.active !== false);

  if (currentActiveBlogCategory !== 'all') {
    filtered = filtered.filter(b => b.categorySlug === currentActiveBlogCategory || (b.category || '').toLowerCase() === currentActiveBlogCategory);
  }

  const searchInput = document.getElementById('blog-hub-search-input');
  const clearBtn = document.getElementById('blog-hub-search-clear');
  let hasSearch = false;

  if (searchInput && searchInput.value.trim() !== '') {
    hasSearch = true;
    if (clearBtn) clearBtn.classList.remove('hidden');
    const term = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(b => 
      (b.title || '').toLowerCase().includes(term) ||
      (b.description || '').toLowerCase().includes(term) ||
      (b.category || '').toLowerCase().includes(term) ||
      (b.categorySlug || '').toLowerCase().includes(term)
    );
  } else {
    if (clearBtn) clearBtn.classList.add('hidden');
  }

  // Empty State
  if (filtered.length === 0) {
    catalogGrid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div class="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <p class="font-bold text-base text-slate-800 dark:text-slate-200">No resources match your search or filter</p>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try another keyword or click reset below to browse all published resources.</p>
        <div class="mt-4 flex items-center justify-center gap-3">
          <button type="button" onclick="clearBlogSearch(); setBlogCategoryFilter('all')" class="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition transform active:scale-95 cursor-pointer">
            Reset Filters
          </button>
        </div>
      </div>
    `;
    const loadMoreWrap = document.getElementById('blog-hub-load-more-wrapper');
    if (loadMoreWrap) loadMoreWrap.classList.add('hidden');
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: catalogGrid });
    return;
  }

  // Featured Hero on 'all' view when no search
  let featuredHTML = '';
  let standardCards = filtered;

  if (currentActiveBlogCategory === 'all' && !hasSearch) {
    const featuredPost = filtered.find(b => b.isFeatured) || filtered[0];
    if (featuredPost) {
      featuredHTML = createFeaturedHeroHTML(featuredPost);
      standardCards = filtered.filter(b => b.id !== featuredPost.id);
    }
  }

  // Apply 9-Cards Pagination
  const visibleCards = standardCards.slice(0, visibleBlogHubCount);
  catalogGrid.innerHTML = featuredHTML + visibleCards.map(blog => createBlogCardHTML(blog, false)).join('');

  // Handle Load More Button
  const loadMoreWrap = document.getElementById('blog-hub-load-more-wrapper');
  if (loadMoreWrap) {
    const remaining = standardCards.length - visibleCards.length;
    if (remaining > 0) {
      loadMoreWrap.classList.remove('hidden');
      const countEl = document.getElementById('blog-hub-remaining-count');
      if (countEl) countEl.textContent = `(${remaining} more)`;
    } else {
      loadMoreWrap.classList.add('hidden');
    }
  }

  if (window.lucide && window.lucide.createIcons) {
    lucide.createIcons({ root: catalogGrid });
  }
}

// View More / Less Toggle for index.html
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
function initMendorbitBlogsEngine() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentActiveBlogCategory = catParam.toLowerCase().trim();
  }

  // Update UI Pills in index.html and blog.html
  document.querySelectorAll('.blog-category-pill').forEach(btn => {
    const targetCat = btn.getAttribute('data-category-slug');
    if (targetCat === currentActiveBlogCategory) {
      btn.className = 'blog-category-pill active-cat px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md shadow-orange-600/30 transition-all transform scale-105 whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    } else {
      btn.className = 'blog-category-pill px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    }
  });

  const initialList = getBlogsList();
  renderBlogsSection(initialList);
  renderBlogHubCatalog(initialList);

  syncBlogsWithFirestore(updatedList => {
    renderBlogsSection(updatedList);
    renderBlogHubCatalog(updatedList);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMendorbitBlogsEngine);
} else {
  initMendorbitBlogsEngine();
}