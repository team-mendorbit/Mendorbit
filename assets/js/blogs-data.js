// Mendorbit - Official Blogs & Notes Data Engine (v3.0.0 Dual-Firebase Architecture)
// Powered by Firebase 2 (mendorbit-content) + Google Sheet Telemetry Engine

const BLOGS_DATA_VERSION = '3.0.0';

// -------------------------------------------------------------
// Firebase 2: Dedicated Content & Publishing Engine (mendorbit-content)
// -------------------------------------------------------------
const firebaseConfigContent = {
  apiKey: "AIzaSyDKABGW7zwD3H7m50gzm_4Tb7JlB-6lWKc",
  authDomain: "mendorbit-content.firebaseapp.com",
  projectId: "mendorbit-content",
  storageBucket: "mendorbit-content.firebasestorage.app",
  messagingSenderId: "1084987516374",
  appId: "1:1084987516374:web:898d92ddfec64fbeb47077",
  measurementId: "G-BDNYT2HTZ3"
};

let contentDb = null;
function getContentDb() {
  if (contentDb) return contentDb;
  try {
    if (typeof firebase !== 'undefined') {
      let contentApp = firebase.apps.find(a => a.name === 'mendorbitContent');
      if (!contentApp) {
        contentApp = firebase.initializeApp(firebaseConfigContent, 'mendorbitContent');
      }
      contentDb = contentApp.firestore();
      return contentDb;
    }
  } catch (e) {
    console.warn("Content Firebase initialization warning:", e);
  }
  return null;
}

const MENDORBIT_PROD_BLOGS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzwk4vCqhqfhnoi8FHqQ_DnQAtcLeztpJ5iofC-XjeWSA61WY63eH0AYDKCyZRVTGctwA/exec";

function getBlogsWebhookUrl() {
  const custom = localStorage.getItem('mendorbit_blogs_sheet_webhook_url');
  if (custom && custom.includes('AKfycbzYozOXHHNKiYyWi9DaQQMsi-iFn9zTuEWaiPVqMvv-R5uWLkSUqbh_zlMUDmqLk4MXKg')) {
    localStorage.removeItem('mendorbit_blogs_sheet_webhook_url');
    return MENDORBIT_PROD_BLOGS_WEBHOOK_URL;
  }
  return custom || MENDORBIT_PROD_BLOGS_WEBHOOK_URL;
}

const MENDORBIT_BLOG_CATEGORIES = [
  { slug: 'all', name: 'All Guides', icon: 'sparkles' },
  { slug: 'notes', name: 'Chapter Notes', icon: 'file-text' },
  { slug: 'strategy', name: 'Prep Strategy', icon: 'target' },
  { slug: 'law', name: 'Law & BNS', icon: 'scale' },
  { slug: 'editorial', name: 'Editorial', icon: 'feather' },
  { slug: 'news', name: 'Exam News', icon: 'bell' },
  { slug: 'colleges', name: 'Colleges', icon: 'graduation-cap' },
  { slug: 'case-study', name: 'Case Studies', icon: 'briefcase' },
  { slug: 'saved', name: 'Saved', icon: 'bookmark' }
];

// 100% Real Baseline (Zero Fake Views)
const DEFAULT_BLOGS_LIST = [
  {
    id: "blog_bns_103_law",
    title: "BNS Section 103 Explained: Murder Definition & Punishment vs IPC",
    category: "Law",
    categorySlug: "law",
    views: 1000,
    author: "Satyam Thakur",
    description: "Complete legal breakdown of Section 103 of Bharatiya Nyaya Sanhita 2023. Key differences from IPC 302, mob lynching provisions, and landmark constitutional principles.",
    posterImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/law/bns-section-103-murder-punishment-explained.html",
    isFeatured: true,
    active: true,
    order: 1,
    recommendedBlogIds: ["blog_clat_ailet_basics", "blog_editorial_neet_reforms"]
  },
  {
    id: "blog_class10_real_numbers",
    title: "Class 10 Real Numbers Revision Notes: Formulas & Solved Exemplar Questions",
    category: "Notes",
    categorySlug: "notes",
    views: 0,
    author: "Mendorbit",
    description: "Complete chapter notes for CBSE Class 10 Chapter 1. Fundamental Theorem of Arithmetic, irrationality proofs, HCF-LCM shortcuts, and printable PDF cheat sheet.",
    posterImageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    link: "blogs/notes/class-10-real-numbers-revision-notes.html",
    isFeatured: true,
    active: true,
    order: 2,
    recommendedBlogIds: ["blog_class10_strategy", "note_class10_maths_formulas"]
  },
  {
    id: "blog_class10_strategy",
    title: "Class 10 Board Exam: How Weak Students Can Score 90%+ in Maths & Science",
    category: "Strategy",
    categorySlug: "strategy",
    views: 0,
    author: "Mendorbit",
    description: "Step-by-step blueprint from NCERT ground zero to board topper marks. Learn the exact method Mendorbit mentors use to eliminate examination anxiety.",
    posterImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    link: "blogs/strategy/class-10-maths-science-strategy.html",
    isFeatured: false,
    active: true,
    order: 3,
    recommendedBlogIds: ["blog_class10_real_numbers", "note_class10_maths_formulas"]
  },
  {
    id: "blog_ssc_cgl_beginner",
    title: "SSC CGL 2026 for Absolute Beginners: Zero se Inspector Kaise Banein",
    category: "Strategy",
    categorySlug: "strategy",
    views: 0,
    author: "Mendorbit",
    description: "Complete syllabus breakdown, high-scoring subjects, non-math background strategy, and how to master Quantitative Aptitude & Reasoning from scratch.",
    posterImageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    link: "blogs/strategy/ssc-cgl-beginner-guide-zero-to-hero.html",
    isFeatured: false,
    active: true,
    order: 4,
    recommendedBlogIds: ["note_ssc_120_grammar", "note_speed_math_tricks", "blog_news_ssc_cgl_exam_dates"]
  },
  {
    id: "blog_clat_ailet_basics",
    title: "CLAT 2026: Legal Reasoning & Current Affairs Strategy from Scratch",
    category: "Strategy",
    categorySlug: "strategy",
    views: 0,
    author: "Mendorbit",
    description: "How to develop the critical passage reading speed required for modern CLAT questions without joining overpriced commercial coaching centers.",
    posterImageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    link: "blogs/strategy/clat-ailet-preparation-basics.html",
    isFeatured: false,
    active: true,
    order: 5,
    recommendedBlogIds: ["blog_bns_103_law", "blog_colleges_top_nlus_cutoff"]
  },
  {
    id: "note_class10_maths_formulas",
    title: "Class 10th Complete Mathematics Formula Sheet & Theorems Cheat Sheet",
    category: "Notes",
    categorySlug: "notes",
    views: 0,
    author: "Mendorbit",
    description: "Every formula, theorem proof, and algebraic identity from Real Numbers to Statistics on a high-density 4-page printable revision cheat sheet.",
    posterImageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 6,
    recommendedBlogIds: ["blog_class10_real_numbers", "blog_class10_strategy"]
  },
  {
    id: "note_ssc_120_grammar",
    title: "120 Golden Rules of English Grammar for SSC & Banking Aspirants",
    category: "Notes",
    categorySlug: "notes",
    views: 0,
    author: "Mendorbit",
    description: "Subject-verb agreement, inversion rules, and conditional clauses simplified with authentic past-year questions from Tier 1 & Tier 2.",
    posterImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 7,
    recommendedBlogIds: ["blog_ssc_cgl_beginner", "note_speed_math_tricks"]
  },
  {
    id: "note_speed_math_tricks",
    title: "Vedic Speed Math & Mental Calculation Shortcuts Kit",
    category: "Notes",
    categorySlug: "notes",
    views: 0,
    author: "Mendorbit",
    description: "Master rapid cube roots, square roots, fast percentage splits, and multiplication matrices for SSC CGL, Bank PO, and CSAT speed enhancement.",
    posterImageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    link: "notes.html",
    isFeatured: false,
    active: true,
    order: 8,
    recommendedBlogIds: ["blog_ssc_cgl_beginner", "note_ssc_120_grammar"]
  },
  {
    id: "blog_editorial_neet_reforms",
    title: "National Testing & Entrance Exam Normalization: Student Rights & Policy Reforms",
    category: "Editorial",
    categorySlug: "editorial",
    views: 0,
    author: "Mendorbit",
    description: "In-depth critical analysis of exam normalization, computer-based testing transparency, and structural reforms shaping competitive exams in India.",
    posterImageUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80",
    link: "blogs/editorial/exam-normalization-reforms-analysis.html",
    isFeatured: false,
    active: true,
    order: 9,
    recommendedBlogIds: ["blog_editorial_cbt_transparency", "blog_editorial_one_nation_exam", "blog_bns_103_law"]
  },
  {
    id: "blog_editorial_cbt_transparency",
    title: "Why CBT Raw Score & Multi-Shift Audit Trail Disclosure Is a Fundamental Student Right",
    category: "Editorial",
    categorySlug: "editorial",
    views: 1240,
    author: "Mendorbit Research & Editorial Wing",
    description: "An editorial analysis on why multi-shift raw score sheets, question normalization audit trails, and objection windows must be made public across all national entrance exams.",
    posterImageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    link: "blogs/editorial/exam-normalization-reforms-analysis.html#audit-transparency",
    isFeatured: false,
    active: true,
    order: 10,
    recommendedBlogIds: ["blog_editorial_neet_reforms", "blog_editorial_one_nation_exam"]
  },
  {
    id: "blog_editorial_one_nation_exam",
    title: "One Nation, One Entrance: Critical Review of Federalism & State Educational Quotas",
    category: "Editorial",
    categorySlug: "editorial",
    views: 890,
    author: "Mendorbit Editorial Desk",
    description: "Policy analysis evaluating the balance between national single-entrance testing frameworks and state-level curriculum diversity for rural aspirants.",
    posterImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/editorial/exam-normalization-reforms-analysis.html#federalism-quotas",
    isFeatured: false,
    active: true,
    order: 11,
    recommendedBlogIds: ["blog_editorial_neet_reforms", "blog_editorial_cbt_transparency"]
  },
  {
    id: "blog_news_ssc_cgl_exam_dates",
    title: "SSC CGL 2026 Official Calendar & Revised Exam Pattern Notification",
    category: "News",
    categorySlug: "news",
    views: 0,
    author: "Mendorbit",
    description: "Staff Selection Commission releases updated tentative exam schedule, post-wise vacancy matrix, and revised Tier-1 normalization rules.",
    posterImageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    link: "blogs/news/ssc-cgl-official-notification-calendar.html",
    isFeatured: false,
    active: true,
    order: 12,
    recommendedBlogIds: ["blog_ssc_cgl_beginner", "note_ssc_120_grammar"]
  },
  {
    id: "blog_colleges_top_nlus_cutoff",
    title: "Top 10 NLUs in India: Rank-wise Cutoffs, Placement Stats & Real Campus Reviews",
    category: "Colleges",
    categorySlug: "colleges",
    views: 0,
    author: "Mendorbit",
    description: "NLSIU Bengaluru, NALSAR Hyderabad, and WBNUJS Kolkata detailed comparison with Category-wise opening & closing ranks and corporate package stats.",
    posterImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/colleges/top-nlus-rankwise-cutoffs-placements.html",
    isFeatured: false,
    active: true,
    order: 13,
    recommendedBlogIds: ["blog_clat_ailet_basics", "blog_bns_103_law"]
  },
  {
    id: "blog_casestudy_edtech_evolution",
    title: "The Rise, Fall & Future of Online EdTech in India: Deep Dive Case Study",
    category: "Case Study",
    categorySlug: "case-study",
    views: 0,
    author: "Mendorbit",
    description: "How bloated marketing budgets collapsed early unicorns, and why sustainable, teacher-first models like Mendorbit are winning student trust.",
    posterImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    link: "blogs/case-study/future-of-indian-edtech-case-study.html",
    isFeatured: false,
    active: true,
    order: 14,
    recommendedBlogIds: ["blog_editorial_neet_reforms", "blog_class10_strategy"]
  }
];

let currentActiveBlogCategory = 'all';
let currentActiveSortFilter = 'recent';
let visibleBlogHubCount = 9;

// 10-Second Multi-Category Auto-Rotating Featured Showcase State
let featuredSlideIndex = 0;
let featuredTimerInterval = null;
let featuredTimeRemaining = 10000;
let isFeaturedPaused = false;

// Real Views Tracker: reads actual accumulated counts from localStorage map
const BLOG_SLUG_ALIAS_MAP = {
  'blog_bns_103_law': 'bns-section-103-murder-punishment-explained',
  'blog_class10_real_numbers': 'class-10-real-numbers-revision-notes',
  'blog_class10_strategy': 'class-10-maths-science-strategy',
  'blog_ssc_cgl_beginner': 'ssc-cgl-beginner-guide-zero-to-hero',
  'blog_clat_ailet_basics': 'clat-ailet-preparation-basics',
  'blog_editorial_neet_reforms': 'exam-normalization-reforms-analysis',
  'blog_news_ssc_cgl_exam_dates': 'ssc-cgl-official-notification-calendar',
  'blog_colleges_top_nlus_cutoff': 'top-nlus-rankwise-cutoffs-placements',
  'blog_casestudy_edtech_evolution': 'future-of-indian-edtech-case-study'
};

// In-Memory Live State (Zero Browser Cache - Google Sheet Blog_Summary is 100% Single Source of Truth)
let CURRENT_LIVE_BLOGS = null;
let LIVE_VIEWS_MAP = {};

// Clean up any stale legacy localStorage on startup
try {
  localStorage.removeItem('mendorbit_blogs_directory');
  localStorage.removeItem('mendorbit_blogs');
  localStorage.removeItem('mendorbit_blog_views');
  localStorage.removeItem('mendorbit_last_admin_save_time');
} catch (e) {}

function getRealBlogViews(blogId) {
  if (!blogId) return 0;
  if (LIVE_VIEWS_MAP[blogId] !== undefined) return LIVE_VIEWS_MAP[blogId];
  const aliasSlug = BLOG_SLUG_ALIAS_MAP[blogId];
  if (aliasSlug && LIVE_VIEWS_MAP[aliasSlug] !== undefined) return LIVE_VIEWS_MAP[aliasSlug];
  for (const [k, v] of Object.entries(BLOG_SLUG_ALIAS_MAP)) {
    if (v === blogId && LIVE_VIEWS_MAP[k] !== undefined) return LIVE_VIEWS_MAP[k];
  }
  return 0;
}

// YouTube-Style Compact Number Formatter (e.g. 15, 950, 1k, 1.2k, 10k, 1.3M, 1B)
function formatCompactViews(num) {
  const n = parseInt(num || 0, 10);
  if (isNaN(n) || n <= 0) return '0';
  if (n < 1000) return String(n);
  if (n < 1000000) {
    const val = (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '');
    return `${val}k`;
  }
  if (n < 1000000000) {
    const val = (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '');
    return `${val}M`;
  }
  const val = (n / 1000000000).toFixed(1).replace(/\.0$/, '');
  return `${val}B`;
}

// Strict Image URL Validator (Rejects date timestamps, spreadsheet error strings, or malformed values)
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(trimmed)) return false;
  if (/GMT[+-]\d{4}/i.test(trimmed)) return false;
  if (/#NUM!|#REF!|#N\/A|#VALUE!|#NAME\?/i.test(trimmed)) return false;
  return /^(https?:\/\/|\/|assets\/|data:image\/)/i.test(trimmed);
}

function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (/#NUM!|#REF!|#N\/A|#VALUE!|#NAME\?/i.test(trimmed)) return false;
  return /^[a-z0-9_-]+$/i.test(trimmed);
}

// Filter out dummy/garbage blogs & deduplicate duplicate articles by ID/Link
function sanitizeBlogsList(list) {
  if (!Array.isArray(list)) return [];
  const clean = list.filter(b => {
    if (!b || typeof b !== 'object') return false;
    const title = (b.title || '').trim();
    const id = String(b.id || '').trim();
    if (!title || title === '' || title === 'undefined' || title === 'null') return false;
    if (id === 'Blog ID' || title === 'Title' || title === 'Blog ID') return false;
    if (id && title === id) return false;
    if (/^blog_\d{10,}$/i.test(title)) return false;
    return true;
  });

  // Strict deduplication by Canonical ID & Target Link (merges views and preserves real posters)
  const map = new Map();
  for (const b of clean) {
    const id = String(b.id || '').trim();
    const rawLink = String(b.link || '').trim().toLowerCase().replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');
    const isGenericLink = !rawLink || rawLink === 'blog.html' || rawLink === 'notes.html';

    let existingKey = null;
    if (map.has(id)) {
      existingKey = id;
    } else if (!isGenericLink) {
      for (const [k, v] of map.entries()) {
        const vLink = String(v.link || '').trim().toLowerCase().replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');
        if (vLink && vLink === rawLink) {
          existingKey = k;
          break;
        }
      }
    }

    if (existingKey) {
      const existing = map.get(existingKey);
      const preferCurrent = (!isValidImageUrl(existing.posterImageUrl) && isValidImageUrl(b.posterImageUrl)) || (b.isFeatured && !existing.isFeatured);
      const merged = preferCurrent ? { ...existing, ...b } : { ...b, ...existing };
      merged.views = (b.views !== undefined && b.views !== null && b.views !== '') ? parseInt(b.views || 0, 10) : parseInt(existing.views || 0, 10);
      if (isValidImageUrl(existing.posterImageUrl) && !isValidImageUrl(merged.posterImageUrl)) merged.posterImageUrl = existing.posterImageUrl;
      if (isValidImageUrl(b.posterImageUrl) && !isValidImageUrl(merged.posterImageUrl)) merged.posterImageUrl = b.posterImageUrl;
      map.set(existingKey, merged);
    } else {
      map.set(id, { ...b });
    }
  }

  return Array.from(map.values());
}
window.sanitizeBlogsList = sanitizeBlogsList;

// Clean Human-Readable Date Formatter for Blog Cards
function formatBlogDisplayDate(rawDate) {
  if (!rawDate) return '29 Oct 2026';
  try {
    const str = String(rawDate).trim();
    if (!str || str === 'undefined' || str === 'null') return '29 Oct 2026';
    if (str.includes(',')) {
      return str.split(',')[0].trim();
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return str;
  } catch (e) {
    return '29 Oct 2026';
  }
}

window.formatCompactViews = formatCompactViews;
window.formatBlogDisplayDate = formatBlogDisplayDate;
window.DEFAULT_BLOGS_LIST = DEFAULT_BLOGS_LIST;
window.getBlogsWebhookUrl = getBlogsWebhookUrl;

// Record Blog View in Real Time & Send Telemetry to Google Sheet Webhook
window.recordBlogView = function(blogId, blogTitle) {
  if (!blogId) return;
  try {
    const cur = LIVE_VIEWS_MAP[blogId] || 0;
    LIVE_VIEWS_MAP[blogId] = cur + 1;
    const alias = BLOG_SLUG_ALIAS_MAP[blogId];
    if (alias) LIVE_VIEWS_MAP[alias] = LIVE_VIEWS_MAP[blogId];

    if (CURRENT_LIVE_BLOGS) {
      const item = CURRENT_LIVE_BLOGS.find(b => String(b.id) === String(blogId) || (alias && b.link && b.link.includes(alias)));
      if (item) item.views = LIVE_VIEWS_MAP[blogId];
    }

    // Instant cross-tab broadcast in 0ms
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('mendorbit_blogs_live_sync');
        ch.postMessage({ type: 'VIEWS_UPDATED', blogId, views: LIVE_VIEWS_MAP[blogId] });
      }
    } catch(e) {}
  } catch(e) {}
};

// Sync Real-Time Blog Directory & Views from Content Firebase 2 (Primary) or Sheet (Backup)
window.syncBlogsDirectoryFromSheet = async function() {
  // 1. Primary: Instant 0ms Sync from Content Firebase 2
  try {
    const db = getContentDb();
    if (db) {
      const snap = await db.collection('mendorbit_blogs').get();
      if (!snap.empty) {
        const cloudBlogs = [];
        snap.forEach(docSnap => cloudBlogs.push({ id: docSnap.id, ...docSnap.data() }));
        const validServerBlogs = sanitizeBlogsList(cloudBlogs);
        if (validServerBlogs.length > 0) {
          CURRENT_LIVE_BLOGS = validServerBlogs.map(b => {
            const base = DEFAULT_BLOGS_LIST.find(d => d.id === b.id || (d.link && b.link && d.link === b.link)) || {};
            const poster = (b.posterImageUrl && isValidImageUrl(b.posterImageUrl)) ? b.posterImageUrl : (base.posterImageUrl || '');
            const desc = (b.description !== undefined && b.description !== '' && b.description !== 'undefined') ? b.description : (base.description || '');
            const cleanCatSlug = (b.categorySlug && isValidSlug(b.categorySlug)) ? b.categorySlug : (base.categorySlug || 'notes');
            const cleanCat = (b.category && !b.category.includes('#') && b.category !== 'undefined') ? b.category : (base.category || 'Notes');

            const recs = (Array.isArray(b.recommendedBlogIds) && b.recommendedBlogIds.length > 0) ? b.recommendedBlogIds : 
                         (Array.isArray(b.relatedBlogIds) && b.relatedBlogIds.length > 0) ? b.relatedBlogIds :
                         (base.recommendedBlogIds || []);

            return {
              ...base,
              ...b,
              author: b.author || base.author || 'Mendorbit',
              posterImageUrl: poster,
              category: cleanCat,
              categorySlug: cleanCatSlug,
              description: desc,
              recommendedBlogIds: recs,
              relatedBlogIds: recs,
              views: (b.views !== undefined && b.views !== null && !isNaN(parseInt(b.views, 10))) ? parseInt(b.views, 10) : (base.views || 0)
            };
          });

          // Re-render live UI without page reload
          const enriched = getBlogsList();
          renderBlogsSection(enriched);
          renderBlogHubCatalog(enriched);
          updateTrendingChips(enriched);
          return;
        }
      }
    }
  } catch(err) {
    console.warn("Content Firebase sync note:", err);
  }

  // 2. Backup: Google Sheet Webhook
  try {
    const webhookUrl = getBlogsWebhookUrl();
    if (!webhookUrl) return;

    const sep = webhookUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${webhookUrl}${sep}action=get_summary&_cb=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && Array.isArray(data.blogs) && data.blogs.length > 0) {
        data.blogs.forEach(b => {
          if (b.views !== undefined && b.views !== null && !isNaN(parseInt(b.views, 10))) {
            const v = parseInt(b.views, 10);
            LIVE_VIEWS_MAP[b.id] = v;
            const alias = BLOG_SLUG_ALIAS_MAP[b.id];
            if (alias) LIVE_VIEWS_MAP[alias] = v;
          }
        });

        const validServerBlogs = sanitizeBlogsList(data.blogs);
        CURRENT_LIVE_BLOGS = validServerBlogs.map(b => {
          const base = DEFAULT_BLOGS_LIST.find(d => d.id === b.id || (d.link && b.link && d.link === b.link)) || {};
          const poster = (b.posterImageUrl && isValidImageUrl(b.posterImageUrl)) ? b.posterImageUrl : (base.posterImageUrl || '');
          const desc = (b.description !== undefined && b.description !== '' && b.description !== 'undefined') ? b.description : (base.description || '');
          const cleanCatSlug = (b.categorySlug && isValidSlug(b.categorySlug)) ? b.categorySlug : (base.categorySlug || 'notes');
          const cleanCat = (b.category && !b.category.includes('#') && b.category !== 'undefined') ? b.category : (base.category || 'Notes');

          const recs = (Array.isArray(b.recommendedBlogIds) && b.recommendedBlogIds.length > 0) ? b.recommendedBlogIds : 
                       (Array.isArray(b.relatedBlogIds) && b.relatedBlogIds.length > 0) ? b.relatedBlogIds :
                       (base.recommendedBlogIds || []);

          return {
            ...base,
            ...b,
            author: b.author || base.author || 'Mendorbit',
            posterImageUrl: poster,
            category: cleanCat,
            categorySlug: cleanCatSlug,
            description: desc,
            recommendedBlogIds: recs,
            relatedBlogIds: recs,
            views: (b.views !== undefined && b.views !== null && !isNaN(parseInt(b.views, 10))) ? parseInt(b.views, 10) : (base.views || 0)
          };
        });

        const enriched = getBlogsList();
        renderBlogsSection(enriched);
        renderBlogHubCatalog(enriched);
        updateTrendingChips(enriched);
      }
    }
  } catch(e) {}
};

// Real-Time Listener on Content Firebase 2
try {
  const db = getContentDb();
  if (db) {
    db.collection('mendorbit_blogs').onSnapshot(snap => {
      if (!snap.empty) {
        const cloudBlogs = [];
        snap.forEach(docSnap => cloudBlogs.push({ id: docSnap.id, ...docSnap.data() }));
        const clean = sanitizeBlogsList(cloudBlogs);
        if (clean.length > 0) {
          CURRENT_LIVE_BLOGS = clean.map(b => {
            const base = DEFAULT_BLOGS_LIST.find(d => d.id === b.id || (d.link && b.link && d.link === b.link)) || {};
            return {
              ...base,
              ...b,
              author: b.author || base.author || 'Mendorbit',
              views: (b.views !== undefined && b.views !== null && !isNaN(parseInt(b.views, 10))) ? parseInt(b.views, 10) : (base.views || 0)
            };
          });
          const enriched = getBlogsList();
          renderBlogsSection(enriched);
          renderBlogHubCatalog(enriched);
          updateTrendingChips(enriched);
        }
      }
    }, () => {});
  }
} catch (e) {}

// Retrieve in-memory blogs list safely enriched with real views & full fallbacks (Zero localStorage)
function getBlogsList() {
  try {
    const list = CURRENT_LIVE_BLOGS || DEFAULT_BLOGS_LIST;

    return list.map(b => {
      const base = DEFAULT_BLOGS_LIST.find(d => d.id === b.id || (d.link && b.link && d.link === b.link)) || {};
      const title = b.title || base.title || 'Mendorbit Guide';
      const category = (b.category && !b.category.includes('#') && b.category !== 'undefined') ? b.category : (base.category || 'Notes');
      let categorySlug = (b.categorySlug && isValidSlug(b.categorySlug)) ? b.categorySlug : base.categorySlug;
      if (!categorySlug) {
        const cat = category.toLowerCase();
        if (cat.includes('note') || cat.includes('formula') || cat.includes('pdf')) categorySlug = 'notes';
        else if (cat.includes('law') || cat.includes('bns') || cat.includes('ipc')) categorySlug = 'law';
        else if (cat.includes('news')) categorySlug = 'news';
        else if (cat.includes('editorial')) categorySlug = 'editorial';
        else if (cat.includes('college')) categorySlug = 'colleges';
        else if (cat.includes('case')) categorySlug = 'case-study';
        else categorySlug = 'strategy';
      }

      // Respect valid poster, fallback to known pristine default
      let posterImageUrl = '';
      if (b.posterImageUrl && isValidImageUrl(b.posterImageUrl)) {
        posterImageUrl = String(b.posterImageUrl).trim();
      } else if (base.posterImageUrl && isValidImageUrl(base.posterImageUrl)) {
        posterImageUrl = base.posterImageUrl;
      }

      // Respect user custom description
      let description = '';
      if (b.description !== undefined && b.description !== null && b.description !== 'undefined') {
        description = String(b.description).trim();
      } else if (base.description) {
        description = base.description;
      }
      if (!description && !posterImageUrl) {
        description = 'Comprehensive revision guide and exam preparation strategy designed by top mentors to help aspirants achieve top percentile scores.';
      }

      const link = b.link || base.link || 'blog.html';
      const author = b.author || base.author || 'Mendorbit';
      const isFeatured = b.isFeatured !== undefined ? b.isFeatured : (base.isFeatured || false);
      const active = b.active !== false;
      const order = b.order !== undefined ? b.order : (base.order || 99);
      const views = (b.views !== undefined) ? parseInt(b.views || 0, 10) : getRealBlogViews(b.id);
      const recommendedBlogIds = (Array.isArray(b.recommendedBlogIds) && b.recommendedBlogIds.length > 0) ? b.recommendedBlogIds : 
                                 (Array.isArray(b.relatedBlogIds) && b.relatedBlogIds.length > 0) ? b.relatedBlogIds :
                                 (base.recommendedBlogIds || []);

      return {
        ...base,
        ...b,
        title,
        category,
        categorySlug,
        posterImageUrl,
        description,
        link,
        author,
        isFeatured,
        active,
        order,
        recommendedBlogIds,
        relatedBlogIds: recommendedBlogIds,
        views
      };
    });
  } catch (e) {
    return DEFAULT_BLOGS_LIST;
  }
}
window.setBlogCategoryFilter = function(categorySlug) {
  currentActiveBlogCategory = categorySlug || 'all';
  visibleBlogHubCount = 9;
  
  document.querySelectorAll('.blog-category-pill').forEach(btn => {
    const targetCat = btn.getAttribute('data-category-slug');
    if (targetCat === currentActiveBlogCategory) {
      const activeColor = targetCat === 'saved' ? 'bg-purple-600 text-white' : 'bg-orange-600 text-white';
      btn.className = `blog-category-pill active-cat px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${activeColor} shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0`;
    } else {
      btn.className = 'blog-category-pill px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    }
  });

  const blogs = getBlogsList();
  renderBlogsSection(blogs);
  renderBlogHubCatalog(blogs);
};

// Unified Sort & Filter System (Synchronized with Sub-filter pills & saved badge)
window.setBlogSortFilter = function(sortKey) {
  currentActiveSortFilter = sortKey || 'recent';
  visibleBlogHubCount = 9;

  // Sync sub-filter pills in blog.html and index.html
  document.querySelectorAll('.blog-sub-filter-btn').forEach(btn => {
    const key = btn.getAttribute('data-sort-key');
    if (key === currentActiveSortFilter) {
      btn.className = 'blog-sub-filter-btn active-sub-filter px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm flex-shrink-0 whitespace-nowrap';
    } else {
      btn.className = 'blog-sub-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 flex-shrink-0 whitespace-nowrap';
    }
  });

  const blogs = getBlogsList();
  renderBlogsSection(blogs);
  renderBlogHubCatalog(blogs);
};

window.toggleSavedFilter = function() {
  if (currentActiveBlogCategory === 'saved') {
    setBlogCategoryFilter('all');
  } else {
    setBlogCategoryFilter('saved');
  }
};

// Filter & Sort Pipeline (Respects Admin Curated filterTag + Smart Automated Defaults)
function applyBlogFiltersAndSort(blogs) {
  let list = (blogs || []).filter(b => b.active !== false);

  // 1. Category Filter (Includes Saved Bookmarks)
  if (currentActiveBlogCategory === 'saved') {
    const bookmarkedIds = getBookmarkedBlogIds();
    list = list.filter(b => bookmarkedIds.includes(String(b.id)));
  } else if (currentActiveBlogCategory !== 'all') {
    list = list.filter(b => b.categorySlug === currentActiveBlogCategory || (b.category || '').toLowerCase() === currentActiveBlogCategory);
  }

  // 2. Sub-Filter / Sort Filter (With full admin filterTag priority + automated fallback)
  if (currentActiveSortFilter === 'popular') {
    list = [...list].sort((a, b) => getRealBlogViews(b.id) - getRealBlogViews(a.id));
  } else if (currentActiveSortFilter === 'editor') {
    list = list.filter(b => b.filterTag === 'editor' || b.isFeatured || getRealBlogViews(b.id) > 0 || b.categorySlug === 'strategy' || b.categorySlug === 'law');
  } else if (currentActiveSortFilter === 'quick') {
    list = list.filter(b => b.filterTag === 'quick' || b.categorySlug === 'notes' || (b.title || '').toLowerCase().includes('note') || (b.title || '').toLowerCase().includes('sheet') || (b.title || '').toLowerCase().includes('rule') || (b.title || '').toLowerCase().includes('trick'));
  } else if (currentActiveSortFilter === 'saved') {
    const bookmarkedIds = getBookmarkedBlogIds();
    list = list.filter(b => bookmarkedIds.includes(String(b.id)));
  } else {
    // 'recent' (default)
    list = [...list].sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  return list;
}

// Student Bookmarking Engine
window.getBookmarkedBlogIds = function() {
  try {
    const raw = localStorage.getItem('mendorbit_user_bookmarks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

window.isBlogBookmarked = function(blogId) {
  if (!blogId) return false;
  const ids = getBookmarkedBlogIds();
  return ids.includes(String(blogId));
};

window.toggleBookmarkBlog = function(blogId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!blogId) return;

  let bookmarks = getBookmarkedBlogIds();
  const idStr = String(blogId);
  const exists = bookmarks.includes(idStr);

  if (exists) {
    bookmarks = bookmarks.filter(id => id !== idStr);
    showBookmarkToast("Removed from your reading list", "info");
  } else {
    bookmarks.push(idStr);
    showBookmarkToast("Saved to your reading list! Accessible via 'Saved' filter.", "success");
  }

  try {
    localStorage.setItem('mendorbit_user_bookmarks', JSON.stringify(bookmarks));
  } catch (e) {}

  updateBookmarkBadgeCounters();
  
  const blogs = getBlogsList();
  renderBlogsSection(blogs);
  renderBlogHubCatalog(blogs);
};

window.updateBookmarkBadgeCounters = function() {
  const count = getBookmarkedBlogIds().length;
  document.querySelectorAll('#saved-bookmark-counter-badge').forEach(el => {
    el.textContent = count;
  });
};

window.showBookmarkToast = function(msg, type = 'success') {
  let toast = document.getElementById('mendorbit-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mendorbit-toast-notification';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-10 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/50 dark:border-slate-200 text-xs font-bold';
    document.body.appendChild(toast);
  }
  
  const icon = type === 'success' ? 'bookmark-check' : 'bookmark-x';
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 ${type === 'success' ? 'text-emerald-400 dark:text-emerald-600' : 'text-amber-400'}"></i>
    <span>${msg}</span>
  `;
  if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: toast });

  toast.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
  }, 2800);
};

// Multi-Category Auto-Rotating Featured Showcase Candidate Selector
// Includes all active indexed blogs randomized on each session so all articles get exposure
function getFeaturedShowcaseCandidates(blogs) {
  const activeBlogs = (blogs || []).filter(b => b.active !== false);
  if (activeBlogs.length === 0) return [];
  
  // Shuffle array using Fisher-Yates algorithm for genuine fair random order
  const shuffled = [...activeBlogs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Generate Top-Class Multi-Category Rotating Showcase HTML (Apple Aesthetic, Slim & Premium)
function createFeaturedShowcaseHTML(candidates, activeIdx) {
  if (!candidates || candidates.length === 0) return '';
  const idx = ((activeIdx % candidates.length) + candidates.length) % candidates.length;
  const activeBlog = candidates[idx];
  const realViews = getRealBlogViews(activeBlog.id);
  const compactViews = formatCompactViews(realViews);
  const formattedDate = formatBlogDisplayDate(activeBlog.updatedAt || activeBlog.date);
  const isBookmarked = isBlogBookmarked(activeBlog.id);

  const categoryBadgeStyles = {
    'law': 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800',
    'notes': 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
    'strategy': 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
    'editorial': 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800',
    'news': 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800',
    'colleges': 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
    'case-study': 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800'
  };

  const PAGE_SIZE = 6;
  const currentChunk = Math.floor(idx / PAGE_SIZE);
  const totalChunks = Math.ceil(candidates.length / PAGE_SIZE);
  const chunkStart = currentChunk * PAGE_SIZE;
  const visibleSubset = candidates.slice(chunkStart, chunkStart + PAGE_SIZE);

  return `
    <div id="mendorbit-featured-showcase" onmouseenter="pauseFeaturedRotation()" onmouseleave="resumeFeaturedRotation()" class="col-span-full mb-6 sm:mb-8 rounded-2xl sm:rounded-[28px] overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative transition-all duration-300">
      
      <!-- Top 20-Second Linear Progress Bar -->
      <div class="w-full bg-slate-100 dark:bg-slate-800/80 h-1 relative overflow-hidden">
        <div id="featured-progress-fill" class="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-75 ease-linear" style="width: 0%;"></div>
      </div>

      <!-- Main Showcase Grid (Split-Hero: Left 7-8 cols for Spotlight, Right 4-5 cols for Explore Categories) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        <!-- Left Column: Spotlight Active Article -->
        <div class="lg:col-span-7 xl:col-span-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800">
          
          <!-- Image Poster with Badges Overlay -->
          <div class="aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/8] min-h-[170px] sm:min-h-[240px] overflow-hidden relative group/hero">
            <img src="${activeBlog.posterImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}" alt="${activeBlog.title}" class="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none"></div>

            <!-- Top Header Badges Overlay -->
            <div class="absolute top-2.5 left-2.5 right-2.5 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between gap-1.5 sm:gap-2">
              <div class="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0">
                <span class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md flex items-center gap-1 flex-shrink-0">
                  <i data-lucide="sparkles" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
                  <span>Spotlight</span>
                </span>
                <span class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider border backdrop-blur-md bg-black/40 text-white border-white/20 truncate max-w-[80px] min-[360px]:max-w-[110px] sm:max-w-none">
                  ${activeBlog.category || 'Article'}
                </span>
              </div>

              <!-- Paused Indicator & Views Pill & Share -->
              <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span id="featured-paused-indicator" class="hidden px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-sm animate-pulse">
                  ⏸
                </span>
                <span class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/50 backdrop-blur-md text-orange-400 font-mono font-bold text-[10px] sm:text-xs border border-white/10 flex items-center gap-1">
                  <i data-lucide="eye" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400"></i>
                  <span>${compactViews}</span>
                </span>
                <button type="button" onclick="shareBlogPost('${activeBlog.id}', event)" class="p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/10 transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center" title="Share Article">
                  <i data-lucide="share-2" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Content Details Under Image -->
          <div class="p-3.5 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-3.5">
            <div class="space-y-1.5 sm:space-y-2">
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span class="inline-flex items-center gap-1 text-[11px] sm:text-xs">
                  <i data-lucide="calendar" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
                  <span>${formattedDate}</span>
                </span>
                <span>•</span>
                <span class="inline-flex items-center gap-1 text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-none">
                  <i data-lucide="user" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
                  <span class="truncate">${activeBlog.author || 'Mendorbit'}</span>
                </span>
              </div>

              <h2 class="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white leading-snug hover:text-orange-600 dark:hover:text-orange-400 transition">
                <a href="${activeBlog.link || 'blog.html'}">${activeBlog.title}</a>
              </h2>

              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                ${activeBlog.description || 'Comprehensive revision guide and exam preparation strategy designed by top mentors to help aspirants achieve top percentile scores.'}
              </p>
            </div>

            <!-- Action Controls Bar (App Ergonomic on Mobile, Clean Flex on Desktop) -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <!-- Top Row on Mobile: Primary Read + Takeaways -->
              <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <a href="${activeBlog.link || 'blog.html'}" class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 min-h-[42px] rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 transition transform active:scale-95 leading-none whitespace-nowrap">
                  <span>Read <span class="hidden min-[380px]:inline">Full </span>Article</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
                </a>
                <button type="button" onclick="openQuickBlogPreview('${activeBlog.id}', event)" class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 min-h-[42px] rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-xs transition cursor-pointer whitespace-nowrap">
                  <i data-lucide="zap" class="w-3.5 h-3.5 flex-shrink-0"></i>
                  <span><span class="hidden min-[380px]:inline">Quick </span>Takeaways</span>
                </button>
              </div>

              <!-- Secondary Row on Mobile: Bookmark + Prev/Next Navigation -->
              <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <button type="button" onclick="toggleBookmarkBlog('${activeBlog.id}', event)" class="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer" title="Save for Later">
                  <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isBookmarked ? 'text-purple-600 fill-purple-600' : 'text-slate-400'}"></i>
                  <span class="text-[11px]">${isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
                <div class="flex items-center gap-1">
                  <button type="button" onclick="prevFeaturedSlide()" class="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer" title="Previous Spotlight">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                  </button>
                  <button type="button" onclick="nextFeaturedSlide()" class="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer" title="Next Spotlight">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Column: Explore Queue & Quick Switcher -->
        <div class="lg:col-span-5 xl:col-span-4 p-4 sm:p-5 bg-gradient-to-b from-slate-50/80 to-slate-100/60 dark:from-slate-950/80 dark:to-slate-900/60 backdrop-blur-xl flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-slate-800">
          <div>
            <!-- Section Header: Explore -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black">
                  <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                </div>
                <span class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Explore</span>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                ${idx + 1} / ${candidates.length}
              </span>
            </div>

            <!-- Curated 6-Items Queue List (Page ${currentChunk + 1} of ${totalChunks}) -->
            <div class="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 mt-3 pb-2 lg:pb-0 blog-horizontal-scroll no-scrollbar -mx-1 px-1 lg:mx-0 lg:px-0">
              ${visibleSubset.map((c, subI) => {
                const globalIndex = chunkStart + subI;
                const isActive = globalIndex === idx;
                const cBadge = categoryBadgeStyles[c.categorySlug] || 'bg-slate-100 text-slate-700';

                return `
                  <div onclick="switchFeaturedSlide(${globalIndex})" class="group/item p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer flex items-center gap-2.5 sm:gap-3 flex-shrink-0 w-[240px] sm:w-[280px] lg:w-auto relative ${isActive ? 'bg-white dark:bg-slate-900 border-2 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'}">
                    
                    <!-- Track Number / Indicator -->
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-mono text-xs font-black transition-transform duration-200 group-hover/item:scale-105 ${isActive ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}">
                      ${isActive ? '<i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>' : `${globalIndex + 1}`}
                    </div>

                    <!-- Topic Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider border ${cBadge} truncate max-w-[85px]">
                          ${c.category}
                        </span>
                        ${isActive ? `
                          <span class="inline-flex items-center gap-1 text-[9px] font-extrabold text-orange-600 dark:text-orange-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                            Active
                          </span>
                        ` : ''}
                      </div>
                      <h4 class="text-xs ${isActive ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'} truncate group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors">
                        ${c.title}
                      </h4>
                    </div>

                    <!-- Arrow Chevron -->
                    <div class="w-5 h-5 flex items-center justify-center flex-shrink-0 text-slate-400 ${isActive ? 'text-orange-600 translate-x-0.5' : 'group-hover/item:text-orange-600 group-hover/item:translate-x-0.5'} transition-all">
                      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom Slide Dots Navigation & Group Tip -->
          <div class="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-medium">
              List ${currentChunk + 1} of ${totalChunks} (${candidates.length} Topics)
            </span>
            <div class="flex items-center gap-1.5">
              ${candidates.map((_, i) => `
                <button type="button" onclick="switchFeaturedSlide(${i})" class="h-1.5 rounded-full transition-all cursor-pointer ${i === idx ? 'w-5 bg-orange-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'}" title="Go to topic ${i + 1}"></button>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// 20-Second Auto-Rotation Timer Controls
const FEATURED_ROTATION_INTERVAL = 20000;
const FEATURED_STEP = 50;

function startFeaturedAutoRotation() {
  if (featuredTimerInterval) return;
  featuredTimeRemaining = FEATURED_ROTATION_INTERVAL;
  featuredTimerInterval = setInterval(() => {
    if (isFeaturedPaused) return;
    featuredTimeRemaining -= FEATURED_STEP;
    const progressPercent = Math.min(100, Math.max(0, (1 - (featuredTimeRemaining / FEATURED_ROTATION_INTERVAL)) * 100));
    document.querySelectorAll('#featured-progress-fill').forEach(bar => {
      bar.style.width = `${progressPercent}%`;
    });

    if (featuredTimeRemaining <= 0) {
      featuredTimeRemaining = FEATURED_ROTATION_INTERVAL;
      nextFeaturedSlide();
    }
  }, FEATURED_STEP);
}

function stopFeaturedAutoRotation() {
  if (featuredTimerInterval) {
    clearInterval(featuredTimerInterval);
    featuredTimerInterval = null;
  }
}

window.pauseFeaturedRotation = function() {
  isFeaturedPaused = true;
  document.querySelectorAll('#featured-paused-indicator').forEach(el => el.classList.remove('hidden'));
};

window.resumeFeaturedRotation = function() {
  isFeaturedPaused = false;
  document.querySelectorAll('#featured-paused-indicator').forEach(el => el.classList.add('hidden'));
};

window.switchFeaturedSlide = function(index) {
  const blogs = getBlogsList();
  const candidates = getFeaturedShowcaseCandidates(blogs);
  if (candidates.length === 0) return;
  featuredSlideIndex = ((index % candidates.length) + candidates.length) % candidates.length;
  featuredTimeRemaining = FEATURED_ROTATION_INTERVAL;

  const html = createFeaturedShowcaseHTML(candidates, featuredSlideIndex);
  const blogHubContainer = document.getElementById('blog-hub-featured-container');
  const indexContainer = document.getElementById('index-blog-featured-container');
  if (blogHubContainer) {
    blogHubContainer.innerHTML = html;
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: blogHubContainer });
  }
  if (indexContainer) {
    indexContainer.innerHTML = html;
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: indexContainer });
  }
};

window.nextFeaturedSlide = function() {
  const blogs = getBlogsList();
  const candidates = getFeaturedShowcaseCandidates(blogs);
  if (candidates.length <= 1) return;
  switchFeaturedSlide(featuredSlideIndex + 1);
};

window.prevFeaturedSlide = function() {
  const blogs = getBlogsList();
  const candidates = getFeaturedShowcaseCandidates(blogs);
  if (candidates.length <= 1) return;
  switchFeaturedSlide(featuredSlideIndex - 1);
};

function updateFeaturedShowcaseDOM(hasSearch = false) {
  const blogHubContainer = document.getElementById('blog-hub-featured-container');
  const indexContainer = document.getElementById('index-blog-featured-container');

  if (!blogHubContainer && !indexContainer) return;

  const shouldShow = !hasSearch && currentActiveBlogCategory !== 'saved';

  if (!shouldShow) {
    if (blogHubContainer) blogHubContainer.innerHTML = '';
    if (indexContainer) indexContainer.innerHTML = '';
    stopFeaturedAutoRotation();
    return;
  }

  // Prevent re-rendering when already rendered (eliminates layout shift & unwanted scroll on filter click)
  const alreadyRendered = (blogHubContainer && blogHubContainer.children.length > 0) || (indexContainer && indexContainer.children.length > 0);
  if (alreadyRendered) return;

  const blogs = getBlogsList();
  const candidates = getFeaturedShowcaseCandidates(blogs);
  if (candidates.length === 0) return;

  const html = createFeaturedShowcaseHTML(candidates, featuredSlideIndex);

  if (blogHubContainer) {
    blogHubContainer.innerHTML = html;
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: blogHubContainer });
  }

  if (indexContainer) {
    indexContainer.innerHTML = html;
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: indexContainer });
  }

  startFeaturedAutoRotation();
}

// 30-Second Exam Key Takeaways Generator (Retention booster)
function generateBlogTakeaways(blog) {
  const title = (blog.title || '').toLowerCase();
  
  if (title.includes('bns') || title.includes('murder') || title.includes('103')) {
    return [
      "Replaces IPC Section 302 with structured gradations of intentional homicide.",
      "Introduces stringent penalties for mob lynching based on race, caste, or community.",
      "Clarifies burden of proof & mandatory forensic examination under modern criminal procedure."
    ];
  }
  if (title.includes('real number') || title.includes('maths') || title.includes('formula')) {
    return [
      "Fundamental Theorem of Arithmetic core applications & prime factorization trees.",
      "Standard contradiction proof method for irrationality of √2, √3, and 5 - √3.",
      "High-speed HCF & LCM relation formula (HCF × LCM = a × b) tricks for CBSE Class 10."
    ];
  }
  if (title.includes('ssc cgl') || title.includes('beginner')) {
    return [
      "Tier 1 qualifying syllabus breakdown & subject-wise time management strategy.",
      "Quantitative Aptitude priority: Arithmetic vs Advanced Mathematics weightage.",
      "Daily 4-hour self-study timetable designed specifically for non-math students."
    ];
  }
  if (title.includes('grammar') || title.includes('120')) {
    return [
      "Golden rules of Subject-Verb Inversion with negative adverbs (Hardly, Scarcely, Seldom).",
      "Correct prepositions for conditional clauses & subjunctive mood usage.",
      "High-frequency error spotting questions from Tier-1 and Tier-2 past papers."
    ];
  }
  if (title.includes('clat') || title.includes('nlu')) {
    return [
      "Passage-based reading comprehension speed: target 120+ words per minute.",
      "Top NLU rank cutoffs (NLSIU, NALSAR, WBNUJS) & corporate placement insights.",
      "Legal Reasoning core doctrine: Volenti non fit injuria, strict liability & constitutional law."
    ];
  }

  return [
    "Mentor-curated high-scoring exam concepts and step-by-step revision breakdown.",
    "Common examination pitfalls & syllabus blind spots identified by faculty.",
    "Actionable self-study blueprint directly aligned with official exam patterns."
  ];
}

function getCrossCategoryRecommendations(currentBlog, allBlogs) {
  // 1. If admin explicitly assigned related blogs, prioritize them
  if (Array.isArray(currentBlog.relatedBlogIds) && currentBlog.relatedBlogIds.length > 0) {
    const customMatches = allBlogs.filter(b => currentBlog.relatedBlogIds.includes(String(b.id)) && b.id !== currentBlog.id && b.active !== false);
    if (customMatches.length > 0) return customMatches.slice(0, 2);
  }

  // 2. Automated Smart Cross-Category Fallback
  const currentCat = (currentBlog.categorySlug || '').toLowerCase();
  const others = allBlogs.filter(b => b.id !== currentBlog.id && (b.categorySlug || '').toLowerCase() !== currentCat && b.active !== false);
  others.sort((a, b) => getRealBlogViews(b.id) - getRealBlogViews(a.id));
  return others.slice(0, 2);
}

// Quick Takeaways & Glance Preview Modal (Apple Aesthetic, Retention Booster)
window.openQuickBlogPreview = function(blogId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const blogs = getBlogsList();
  const blog = blogs.find(b => String(b.id) === String(blogId)) || DEFAULT_BLOGS_LIST[0];
  if (!blog) return;

  let modal = document.getElementById('mendorbit-glance-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mendorbit-glance-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300';
    document.body.appendChild(modal);
  }

  const isBookmarked = isBlogBookmarked(blog.id);
  const realViews = getRealBlogViews(blog.id);
  const compactViews = formatCompactViews(realViews);
  const takeaways = generateBlogTakeaways(blog);
  const recommendations = getCrossCategoryRecommendations(blog, blogs);

  modal.innerHTML = `
    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-[32px] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Apple-Style Translucent Header -->
      <div class="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-5 sm:p-6 text-white flex-shrink-0">
        <button type="button" onclick="closeQuickBlogPreview()" class="absolute top-4 right-4 p-2 rounded-full bg-black/25 hover:bg-black/40 text-white transition cursor-pointer" title="Close">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md">
            ${blog.category || 'Article'}
          </span>
          <span class="text-xs font-mono opacity-90">${compactViews} views</span>
        </div>
        <h3 class="text-lg sm:text-xl font-black leading-snug text-white pr-8">${blog.title}</h3>
      </div>

      <!-- Modal Body -->
      <div class="p-5 sm:p-6 space-y-4 overflow-y-auto">
        <!-- Key Takeaways Box (Apple Cards) -->
        <div class="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/25 border border-orange-200/60 dark:border-orange-900/40 space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">
            <i data-lucide="zap" class="w-4 h-4 text-orange-500"></i>
            <span>30-Second Exam Key Takeaways</span>
          </div>
          <ul class="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            ${takeaways.map(pt => `
              <li class="flex items-start gap-2">
                <span class="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i data-lucide="check" class="w-3 h-3"></i>
                </span>
                <span class="leading-relaxed font-medium">${pt}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          ${blog.description || 'Comprehensive revision guide and exam preparation strategy designed by top mentors to help aspirants achieve top percentile scores.'}
        </p>

        <!-- Cross-Category Retention Recommendations -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <i data-lucide="compass" class="w-3.5 h-3.5 text-orange-500"></i>
            <span>Aspirants Also Explored</span>
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${recommendations.map(r => `
              <a href="${r.link || 'blog.html'}" class="p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition group flex flex-col justify-between">
                <div>
                  <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    ${r.category}
                  </span>
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 line-clamp-2 leading-snug">
                    ${r.title}
                  </p>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>${formatCompactViews(getRealBlogViews(r.id))} views</span>
                  <span class="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">Read →</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Modal Footer (Dual Compact Action Bar, Zero Line Wrapping) -->
      <div class="p-3 sm:p-5 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between flex-shrink-0">
        <button type="button" onclick="toggleBookmarkBlog('${blog.id}', event)" class="px-3 sm:px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap">
          <i data-lucide="bookmark" class="w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'text-purple-600 fill-purple-600' : 'text-slate-400'}"></i>
          <span>${isBookmarked ? 'Saved' : 'Save <span class="hidden min-[380px]:inline">Later</span>'}</span>
        </button>
        <a href="${blog.link || 'blog.html'}" class="px-3 sm:px-6 py-2.5 min-h-[42px] rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition transform active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap leading-none">
          <span>Read <span class="hidden min-[380px]:inline">Full </span>Article</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: modal });
};

window.closeQuickBlogPreview = function() {
  const modal = document.getElementById('mendorbit-glance-modal');
  if (modal) modal.classList.add('hidden');
};

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// High-Sensitivity Real-Time Streaming Voice Search Engine (Instant Speech to Input)
let voiceRecognitionInstance = null;
let isVoiceListening = false;

window.toggleVoiceSearch = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice search is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
    return;
  }

  const micBtn = document.getElementById('search-voice-mic-btn');
  const searchInput = document.getElementById('blog-hub-search-input');

  if (isVoiceListening && voiceRecognitionInstance) {
    try { voiceRecognitionInstance.stop(); } catch(e) {}
    stopVoiceSearchUI();
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
      isVoiceListening = true;
      if (micBtn) {
        micBtn.classList.add('text-red-500', 'animate-pulse', 'bg-red-50', 'dark:bg-red-950/60', 'ring-2', 'ring-red-500/40');
        micBtn.title = "Listening... Speak now";
      }
      if (searchInput) {
        searchInput.placeholder = "Listening... Speak now...";
      }
    };

    recognition.onspeechstart = function() {
      if (searchInput) {
        searchInput.placeholder = "Hearing you... speaking...";
      }
    };

    // Instant real-time live streaming result handler (Zero latency, live speech stream)
    recognition.onresult = function(event) {
      if (!event.results || event.results.length === 0) return;
      let text = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i] && event.results[i][0]) {
          text += event.results[i][0].transcript;
        }
      }
      text = text.trim();
      if (text && searchInput) {
        searchInput.value = text;
        handleBlogSearchInput(text);
      }
    };

    recognition.onerror = function() {
      stopVoiceSearchUI();
    };

    recognition.onend = function() {
      stopVoiceSearchUI();
    };

    voiceRecognitionInstance = recognition;
    recognition.start();
  } catch (err) {
    stopVoiceSearchUI();
  }
};

function stopVoiceSearchUI() {
  isVoiceListening = false;
  const micBtn = document.getElementById('search-voice-mic-btn');
  const searchInput = document.getElementById('blog-hub-search-input');
  if (micBtn) {
    micBtn.classList.remove('text-red-500', 'animate-pulse', 'bg-red-50', 'dark:bg-red-950/60', 'ring-2', 'ring-red-500/40');
    micBtn.title = "Search with your voice";
  }
  if (searchInput) {
    searchInput.placeholder = "Search notes, chapters, exams (e.g. Real Numbers, BNS, SSC CGL)...";
  }
}

// Ultra-Responsive Instant Search Input Handler (Smooth, 0ms input freeze)
let blogSearchDebounceTimer = null;
window.handleBlogSearchInput = function(rawVal) {
  const query = (rawVal || '').trim();
  const clearBtn = document.getElementById('blog-hub-search-clear');

  if (clearBtn) {
    if (query.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  clearTimeout(blogSearchDebounceTimer);
  blogSearchDebounceTimer = setTimeout(() => {
    visibleBlogHubCount = 9;
    renderBlogHubCatalog(getBlogsList());
  }, 25);
};

// Global Quick Tag Filter
window.quickFilterSearch = function(tag) {
  const searchInput = document.getElementById('blog-hub-search-input');
  if (searchInput) {
    searchInput.value = tag;
    handleBlogSearchInput(tag);
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

// Generate Single Card HTML (With Real Views Display)
function createBlogCardHTML(blog, isExtra) {
  const hasPoster = Boolean(blog.posterImageUrl && blog.posterImageUrl.trim() !== '');
  const extraClass = isExtra ? 'extra-blog-note hidden' : '';

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
  const realViews = getRealBlogViews(blog.id);
  const compactViews = formatCompactViews(realViews);
  const formattedDate = formatBlogDisplayDate(blog.updatedAt || blog.date);
  const isBookmarked = isBlogBookmarked(blog.id);

  return `
    <article itemscope itemtype="https://schema.org/BlogPosting" class="${extraClass} group rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-xl transition-all duration-300 relative">
      
      <div>
        ${hasPoster ? `
          <div class="w-full aspect-[16/9] min-h-[160px] sm:min-h-[200px] overflow-hidden bg-slate-100 dark:bg-slate-800 relative group/img border-b border-slate-100 dark:border-slate-800">
            <img itemprop="image" src="${blog.posterImageUrl}" alt="${blog.title}" loading="lazy" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"></div>
            
            <span class="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
              ${blog.category || 'Article'}
            </span>

            <div class="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 flex items-center gap-1 sm:gap-1.5">
              <button type="button" onclick="toggleBookmarkBlog('${blog.id}', event)" class="p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 transition-all shadow-md transform active:scale-95 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center" title="Bookmark Article">
                <i data-lucide="bookmark" class="w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'text-purple-400 fill-purple-400' : ''}"></i>
              </button>
              <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 transition-all shadow-md transform active:scale-95 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center" title="Share Article">
                <i data-lucide="share-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
            </div>
          </div>
        ` : `
          <div class="w-full h-1.5 sm:h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-blue-600"></div>
        `}

        <div class="p-4 sm:p-5">
          <div class="flex items-center justify-between text-xs mb-2.5 sm:mb-3">
            ${!hasPoster ? `
              <span class="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}">
                ${blog.category || 'Article'}
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <i data-lucide="calendar" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400/80"></i>
                <span>${formattedDate}</span>
              </span>
            `}

            <div class="flex items-center gap-1.5 ml-auto">
              ${!hasPoster ? `
                <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-0.5">
                  <i data-lucide="calendar" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400/80"></i>
                  <span>${formattedDate}</span>
                </span>
              ` : ''}

              <span class="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs font-black font-mono border border-orange-500/20" title="${realViews.toLocaleString()} views">
                <i data-lucide="eye" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500"></i>
                <span>${compactViews}</span>
              </span>

              ${!hasPoster ? `
                <button type="button" onclick="toggleBookmarkBlog('${blog.id}', event)" class="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 text-slate-500 hover:text-purple-600 transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center" title="Bookmark Article">
                  <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isBookmarked ? 'text-purple-600 fill-purple-600' : ''}"></i>
                </button>
                <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="p-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 text-slate-500 hover:text-orange-600 transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center" title="Share Article">
                  <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
            </div>
          </div>

          <h3 itemprop="headline" class="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mb-1.5 sm:mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition line-clamp-2">
            <a href="${blog.link || 'blog.html'}">${blog.title}</a>
          </h3>

          <p itemprop="description" class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            ${blog.description || 'Comprehensive revision guide and exam preparation strategy designed by top mentors to help aspirants achieve top percentile scores.'}
          </p>
        </div>
      </div>

      <div class="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div class="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span itemprop="author" class="text-[10px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1 sm:gap-1.5 truncate max-w-[100px] sm:max-w-[120px]">
            <i data-lucide="user" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0"></i> 
            <span class="truncate">${blog.author || 'Mendorbit'}</span>
          </span>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="openQuickBlogPreview('${blog.id}', event)" class="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-[10px] sm:text-xs transition cursor-pointer min-h-[36px]" title="Quick Takeaways Snapshot">
              <i data-lucide="zap" class="w-3.5 h-3.5 flex-shrink-0"></i>
              <span class="hidden min-[360px]:inline">Takeaways</span>
            </button>
            <a href="${blog.link || 'blog.html'}" class="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 transition transform active:scale-95 flex-shrink-0 whitespace-nowrap min-h-[36px]">
              <span>Read</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
            </a>
          </div>
        </div>
      </div>

    </article>
  `;
}

// Render Featured Hero Banner Card for Home Page & Catalog Top
function createFeaturedHeroHTML(blog) {
  if (!blog) return '';
  const realViews = getRealBlogViews(blog.id);
  const compactViews = formatCompactViews(realViews);
  const formattedDate = formatBlogDisplayDate(blog.updatedAt || blog.date);
  const desc = (blog.description && blog.description.trim() !== '' && blog.description !== 'undefined')
    ? blog.description
    : 'Comprehensive revision guide and exam preparation strategy designed by top mentors to help aspirants achieve top percentile scores.';

  return `
    <div class="col-span-full mb-6 group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
      <div class="lg:col-span-7 aspect-[16/9] lg:aspect-auto min-h-[260px] sm:min-h-[320px] overflow-hidden relative group/heroimg">
        <img src="${blog.posterImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}" alt="${blog.title}" class="w-full h-full object-cover group-hover/heroimg:scale-105 transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
        <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-xl flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Featured
        </span>
      </div>
      <div class="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2.5">
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                ${blog.category || 'Strategy'}
              </span>
              <span class="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400/80"></i>
                <span>${formattedDate}</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 text-orange-600 dark:text-orange-400 font-black font-mono text-xs border border-orange-500/30 shadow-sm shadow-orange-500/5 backdrop-blur-sm" title="${realViews.toLocaleString()} views">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-orange-500"></i>
                <span>${compactViews} views</span>
              </span>
              <button type="button" onclick="shareBlogPost('${blog.id}', event)" class="p-2 rounded-xl bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition cursor-pointer" title="Share Article">
                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 transition">
            <a href="${blog.link || 'blog.html'}">${blog.title}</a>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            ${desc}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
            <span>${blog.author || 'Mendorbit'}</span>
          </span>
          <a href="${blog.link || 'blog.html'}" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 transition transform active:scale-95 whitespace-nowrap leading-none">
            <span class="leading-none">Read More</span>
            <i data-lucide="arrow-right" class="w-4 h-4 flex-shrink-0"></i>
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
  let filtered = applyBlogFiltersAndSort(rawBlogs);

  const hasIndexFeaturedContainer = Boolean(document.getElementById('index-blog-featured-container'));
  updateFeaturedShowcaseDOM(false);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <div class="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="book-open" class="w-8 h-8 opacity-60"></i>
        </div>
        <p class="font-extrabold text-sm text-slate-700 dark:text-slate-300">No articles found in this category or filter</p>
        <p class="text-xs text-slate-400 mt-1">Select "All Guides" or "Latest Updates" to see all published study guides.</p>
      </div>
    `;
    const toggleBtnWrapper = document.getElementById('blogs-notes-view-more-wrapper');
    if (toggleBtnWrapper) toggleBtnWrapper.classList.add('hidden');
    if (window.lucide && window.lucide.createIcons) lucide.createIcons({ root: container });
    return;
  }

  let featuredHTML = '';
  let standardCards = filtered;

  if (!hasIndexFeaturedContainer && currentActiveBlogCategory === 'all' && currentActiveSortFilter === 'recent') {
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

// Render Trending Chips dynamically sorted by actual views (without view numbers in label)
function updateTrendingChips(blogs) {
  const container = document.getElementById('blog-hub-trending-chips');
  if (!container) return;

  const sorted = [...blogs].sort((a, b) => (getRealBlogViews(b.id)) - (getRealBlogViews(a.id)));
  const top4 = sorted.slice(0, 4);

  const cleanShortTitles = {
    "blog_bns_103_law": "BNS Section 103",
    "blog_class10_real_numbers": "Class 10 Real Numbers",
    "blog_ssc_cgl_beginner": "SSC CGL Roadmap",
    "note_ssc_120_grammar": "120 Grammar Rules",
    "blog_class10_strategy": "Class 10 Board Strategy",
    "note_class10_maths_formulas": "Maths Formula Sheet",
    "blog_clat_ailet_basics": "CLAT Preparation",
    "note_speed_math_tricks": "Speed Math Tricks"
  };

  container.innerHTML = `
    <span class="font-bold flex items-center gap-1 text-orange-600 dark:text-orange-400 mr-1 flex-shrink-0">
      <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Trending:
    </span>
    ${top4.map(b => {
      const label = cleanShortTitles[b.id] || b.title.split(':')[0].trim();
      return `
        <button type="button" onclick="quickFilterSearch('${label.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 transition shadow-sm cursor-pointer whitespace-nowrap">
          ${label}
        </button>
      `;
    }).join('')}
  `;

  if (window.lucide && window.lucide.createIcons) {
    lucide.createIcons({ root: container });
  }
}

// Render Catalog on blog.html (With 9-Card Pagination)
function renderBlogHubCatalog(blogs) {
  const catalogGrid = document.getElementById('blog-hub-cards-grid');
  if (!catalogGrid) return;

  const rawBlogs = blogs || [];
  let filtered = applyBlogFiltersAndSort(rawBlogs);

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

  // Update resource count in sub-filter bar
  const countLabel = document.getElementById('blog-catalog-count-label');
  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} resources`;
  }

  // Update dedicated featured container
  const hasFeaturedContainer = Boolean(document.getElementById('blog-hub-featured-container'));
  updateFeaturedShowcaseDOM(hasSearch);

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
          <button type="button" onclick="clearBlogSearch(); setBlogCategoryFilter('all'); setBlogSortFilter('recent');" class="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition transform active:scale-95 cursor-pointer">
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

  let featuredHTML = '';
  let standardCards = filtered;

  if (!hasFeaturedContainer && currentActiveBlogCategory === 'all' && currentActiveSortFilter === 'recent' && !hasSearch) {
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
    } else {
      loadMoreWrap.classList.add('hidden');
    }
  }

  if (window.lucide && window.lucide.createIcons) {
    lucide.createIcons({ root: catalogGrid });
  }

  updateTrendingChips(rawBlogs);
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

// Initialize Blogs Engine
function initMendorbitBlogsEngine() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentActiveBlogCategory = catParam.toLowerCase().trim();
  }

  // Update UI Pills in index.html and blog.html (No shadow)
  document.querySelectorAll('.blog-category-pill').forEach(btn => {
    const targetCat = btn.getAttribute('data-category-slug');
    if (targetCat === currentActiveBlogCategory) {
      btn.className = 'blog-category-pill active-cat px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-600 text-white transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    } else {
      btn.className = 'blog-category-pill px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0';
    }
  });

  const initialList = getBlogsList();
  updateBookmarkBadgeCounters();
  renderBlogsSection(initialList);
  renderBlogHubCatalog(initialList);
  updateTrendingChips(initialList);
  setupHorizontalWheelScroll();

  // Background sync full directory & real views directly from Google Sheet (Zero Firebase)
  if (typeof syncBlogsDirectoryFromSheet === 'function') {
    syncBlogsDirectoryFromSheet();
  }
}

// Enable smooth horizontal mouse-wheel scrolling ONLY for narrow single-line pill bars on desktop
window.setupHorizontalWheelScroll = function() {
  const targets = document.querySelectorAll(
    '#blog-category-pills-bar, #blog-sub-filters-bar, ' +
    '#index-blog-category-pills-bar, #index-blog-sub-filters-bar'
  );
  targets.forEach(container => {
    if (!container || container.dataset.wheelActive === 'true') return;
    container.dataset.wheelActive = 'true';
    container.addEventListener('wheel', (e) => {
      // Only hijack wheel if container actually has horizontal overflow content to scroll
      if (container.scrollWidth > container.clientWidth) {
        const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 2);
        const canScrollLeft = container.scrollLeft > 2;
        if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      }
    }, { passive: false });
  });
};



try {
  if (typeof BroadcastChannel !== 'undefined') {
    const mendorbitSyncChannel = new BroadcastChannel('mendorbit_blogs_live_sync');
    mendorbitSyncChannel.onmessage = (event) => {
      if (event && event.data) {
        if (event.data.type === 'BLOGS_UPDATED') {
          if (Array.isArray(event.data.blogs) && event.data.blogs.length > 0) {
            CURRENT_LIVE_BLOGS = sanitizeBlogsList(event.data.blogs);
          } else if (event.data.blog && CURRENT_LIVE_BLOGS) {
            const idx = CURRENT_LIVE_BLOGS.findIndex(b => String(b.id) === String(event.data.blog.id));
            if (idx >= 0) {
              if (event.data.blog.deleted) {
                CURRENT_LIVE_BLOGS.splice(idx, 1);
              } else {
                CURRENT_LIVE_BLOGS[idx] = { ...CURRENT_LIVE_BLOGS[idx], ...event.data.blog };
              }
            } else if (!event.data.blog.deleted) {
              CURRENT_LIVE_BLOGS.push(event.data.blog);
            }
          }
          const list = getBlogsList();
          renderBlogsSection(list);
          renderBlogHubCatalog(list);
          updateTrendingChips(list);
          return;
        }

        if (event.data.type === 'VIEWS_UPDATED') {
          if (event.data.blogId && event.data.views !== undefined) {
            const v = parseInt(event.data.views, 10);
            LIVE_VIEWS_MAP[event.data.blogId] = v;
            if (event.data.slug) LIVE_VIEWS_MAP[event.data.slug] = v;
            if (CURRENT_LIVE_BLOGS) {
              const target = CURRENT_LIVE_BLOGS.find(b => String(b.id) === String(event.data.blogId) || (event.data.slug && b.link && b.link.includes(event.data.slug)));
              if (target) target.views = v;
            }
          }
          const list = getBlogsList();
          renderBlogsSection(list);
          renderBlogHubCatalog(list);
          updateTrendingChips(list);
          return;
        }
      }
    };
    window.mendorbitBlogsSyncChannel = mendorbitSyncChannel;
  }
} catch(e) {}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMendorbitBlogsEngine);
} else {
  initMendorbitBlogsEngine();
}