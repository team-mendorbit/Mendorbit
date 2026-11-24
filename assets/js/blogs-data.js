// Mendorbit - Official Blogs & Notes Data Engine (v3.1.0 Dual-Firebase Architecture)
// 100% Exclusively Powered by Firebase 2: Dedicated Content & Publishing Cloud (mendorbit-content)
// Zero Google Sheet Dependency - Instant 0ms Atomic Sync & Real-Time View Counter

const BLOGS_DATA_VERSION = '3.1.0';

// -------------------------------------------------------------
// Firebase 2: Dedicated Content & Publishing Engine (mendorbit-content)
// -------------------------------------------------------------
window.firebaseConfigContent = window.firebaseConfigContent || {
  apiKey: "AIzaSyDKABGW7zwD3H7m50gzm_4Tb7JlB-6lWKc",
  authDomain: "mendorbit-content.firebaseapp.com",
  projectId: "mendorbit-content",
  storageBucket: "mendorbit-content.firebasestorage.app",
  messagingSenderId: "1084987516374",
  appId: "1:1084987516374:web:898d92ddfec64fbeb47077",
  measurementId: "G-BDNYT2HTZ3"
};

window.contentDb = window.contentDb || null;
window.getContentDb = function() {
  if (window.contentDb) return window.contentDb;
  if (typeof window.mendorbitContentDB !== 'undefined' && window.mendorbitContentDB) {
    window.contentDb = window.mendorbitContentDB;
    return window.contentDb;
  }
  try {
    if (typeof firebase !== 'undefined') {
      let contentApp = firebase.apps.find(a => a.name === 'mendorbitContent');
      if (!contentApp) {
        contentApp = firebase.initializeApp(window.firebaseConfigContent, 'mendorbitContent');
      }
      window.contentDb = contentApp.firestore();
      return window.contentDb;
    }
  } catch (e) {
    console.warn("Content Firebase initialization warning:", e);
  }
  return null;
};

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

// Clean Baseline: Strictly Real Verified Blogs Only
const DEFAULT_BLOGS_LIST = [
  {
    id: "blog_fundamental_rights_articles_12_to_35",
    title: "Fundamental Rights (Articles 12 to 35): Easy Explanation, Notes \u0026 Cases",
    category: "Law \u0026 BNS",
    categorySlug: "law",
    views: 0,
    author: "Chandana Shree",
    date: "22 Nov 2026",
    readTime: "10 Min Read",
    description: "Learn Part III of the Indian Constitution (Articles 12 to 35) in simple language. Complete notes on Right to Equality, Freedom, Article 21, 5 Writs, and key Supreme Court cases by Chandana Shree.",
    posterImageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjrBD_4LmKokeMkXhcgbdivUqQdXaasmURPPcO6KgYddQE2nXcHa6HrwIh7r1CU1Rkz_BuwwhUB1Tyt2yWQFc0db6BFJOTwsKORkt_6S7SQYwptnNR2yanrj-tJtxF-wGboXOULvSXMRCnHTSF-ggAL60vGH3f5_tm1T1CPHgMzSICkwp_Wr9RMDz7X54AR/w597-h334/Gemini_Generated_Image_iy0u6oiy0u6oiy0u%20(1).png",
    link: "blogs/law/fundamental-rights-articles-12-to-35.html",
    isFeatured: true,
    active: true,
    order: 1
  },
  {
    id: "blog_clat_2027_admit_card_out_download_link",
    title: "CLAT 2027 Admit Card Out: Download Link \u0026 Guidelines",
    category: "Exam News",
    categorySlug: "news",
    views: 0,
    author: "Satyam Thakur",
    date: "21 Nov 2026",
    readTime: "4 Min Read",
    description: "Consortium of NLUs has officially released the CLAT 2027 Admit Card. Download your Admit Card with direct login links, step-by-step instructions, mandatory documents checklist, and exam guidelines.",
    posterImageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFTe9LcKK-1xZGotRrl0DwZDO_nlY-aFzJ8Zi7T12poQ00RsJFsWAxAuYCG7fbUlg9ycALik44EfTtNv_MMXWWYaYMncvJJqQI6P183RnIkBRDzyznuM1kOcfL2EUPb8Chugo93y3_yBpbVhZlDY1eh_X11F4ptx-XXtzHO1298Ma5l6RGUuD4e5RthNfW/s2752/Gemini_Generated_Image_jm8ra5jm8ra5jm8r%20(1).png",
    link: "blogs/news/clat-2027-admit-card-out-download-link.html",
    isFeatured: true,
    active: true,
    order: 2
  }
];

// Retired Placeholder Blog IDs to ensure clean state & prevent legacy dummy blogs from displaying
const RETIRED_DUMMY_BLOG_IDS = [
  "blog_cbse_class10_preboard_rules",
  "blog_bns_103_law",
  "blog_class10_real_numbers",
  "blog_class10_strategy",
  "blog_ssc_cgl_beginner",
  "blog_clat_ailet_basics",
  "note_class10_maths_formulas",
  "note_ssc_120_grammar",
  "note_speed_math_tricks",
  "blog_editorial_neet_reforms",
  "blog_editorial_cbt_transparency",
  "blog_editorial_one_nation_exam",
  "blog_news_ssc_cgl_exam_dates",
  "blog_colleges_top_nlus_cutoff",
  "blog_casestudy_edtech_evolution"
];

let currentActiveBlogCategory = 'all';
let currentActiveSortFilter = 'recent';
let visibleBlogHubCount = 9;

// 10-Second Multi-Category Auto-Rotating Featured Showcase State
let featuredSlideIndex = 0;
let featuredTimerInterval = null;
let featuredTimeRemaining = 10000;
let isFeaturedPaused = false;

// Real Views Tracker: 100% Single Source of Truth mapped directly to Canonical Slugs in Google Sheet
const BLOG_SLUG_ALIAS_MAP = {
  'blog_fundamental_rights_part3': 'fundamental-rights-articles-12-to-35',
  'fundamental-rights-articles-12-to-35': 'blog_fundamental_rights_part3',
  'blog_clat_2027_admit_card': 'clat-2027-admit-card-out-download-link',
  'clat-2027-admit-card-out-download-link': 'blog_clat_2027_admit_card'
};

// In-Memory Live State (Zero Browser Cache - Google Sheet is 100% Single Source of Truth)
let CURRENT_LIVE_BLOGS = null;
let LIVE_VIEWS_MAP = {};

// Clean up any stale legacy fake/alias counts so view numbers NEVER jump or fluctuate
try {
  if (!localStorage.getItem('mendorbit_views_legacy_v2_reset')) {
    localStorage.removeItem('mendorbit_blog_views');
    localStorage.setItem('mendorbit_views_legacy_v2_reset', 'true');
  }
  const local = JSON.parse(localStorage.getItem('mendorbit_blog_views') || '{}');
  if (local && typeof local === 'object') {
    delete local['clat-2027-admit-card-download-guide'];
    delete local['clat-2026-admit-card-download-guide'];
    delete local['blog_clat_2026_admit_card'];
    Object.assign(LIVE_VIEWS_MAP, local);
  }
} catch (e) {}

function getSlugFromLink(link) {
  if (!link) return '';
  const match = String(link).match(/\/([^\/\?#]+?)(?:\.html)?(?:$|[?#])/i);
  return (match && match[1]) ? match[1].toLowerCase().trim() : '';
}

function getRealBlogViews(blogId) {
  if (!blogId) return 0;
  let maxViews = 0;

  // 1. Direct hit in memory
  if (LIVE_VIEWS_MAP[blogId] !== undefined) {
    maxViews = Math.max(maxViews, parseInt(LIVE_VIEWS_MAP[blogId] || 0, 10));
  }

  // 2. Check registered alias
  const aliasSlug = BLOG_SLUG_ALIAS_MAP[blogId];
  if (aliasSlug && LIVE_VIEWS_MAP[aliasSlug] !== undefined) {
    maxViews = Math.max(maxViews, parseInt(LIVE_VIEWS_MAP[aliasSlug] || 0, 10));
  }

  // 3. Reverse alias scan
  for (const [k, v] of Object.entries(BLOG_SLUG_ALIAS_MAP)) {
    if ((v === blogId || k === blogId) && LIVE_VIEWS_MAP[k] !== undefined) {
      maxViews = Math.max(maxViews, parseInt(LIVE_VIEWS_MAP[k] || 0, 10));
    }
  }

  // 4. Link slug check
  const list = (CURRENT_LIVE_BLOGS && CURRENT_LIVE_BLOGS.length > 0) ? CURRENT_LIVE_BLOGS : DEFAULT_BLOGS_LIST;
  const found = list.find(b => b.id === blogId);
  if (found && found.link) {
    const s = getSlugFromLink(found.link);
    if (s && LIVE_VIEWS_MAP[s] !== undefined) {
      maxViews = Math.max(maxViews, parseInt(LIVE_VIEWS_MAP[s] || 0, 10));
    }
  }

  // 5. Fail-safe instant read from localStorage directly (0ms delay)
  try {
    const local = JSON.parse(localStorage.getItem('mendorbit_blog_views') || '{}');
    if (local[blogId] !== undefined) maxViews = Math.max(maxViews, parseInt(local[blogId] || 0, 10));
    if (aliasSlug && local[aliasSlug] !== undefined) maxViews = Math.max(maxViews, parseInt(local[aliasSlug] || 0, 10));
    if (found && found.link) {
      const s = getSlugFromLink(found.link);
      if (s && local[s] !== undefined) maxViews = Math.max(maxViews, parseInt(local[s] || 0, 10));
    }
  } catch (e) {}

  return maxViews;
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
    if (id && RETIRED_DUMMY_BLOG_IDS.includes(id)) return false;
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
    if (typeof rawDate === 'object' && rawDate !== null && typeof rawDate.toDate === 'function') {
      return rawDate.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (typeof rawDate === 'object' && rawDate !== null && rawDate.seconds) {
      return new Date(rawDate.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const str = String(rawDate).trim();
    if (!str || str === 'undefined' || str === 'null' || str === '[object Object]') return '29 Oct 2026';
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

// Webhook URL for Google Sheet Views Engine (Zero Firebase writes!)
const MENDORBIT_BLOGS_VIEWS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzw1A7dVUUV55bbikgU5AoWZXR6bPFOYcioMNlSWd3Xl_qKieTqbGQOXm2H3rchZRRSTw/exec";

function getBlogsViewsWebhookUrl() {
  return localStorage.getItem('mendorbit_blogs_sheet_webhook_url') || 
         localStorage.getItem('mendorbit_sheet_webhook_url') || 
         MENDORBIT_BLOGS_VIEWS_WEBHOOK_URL;
}

// Record Blog View in Real Time & Sync Exclusively to Google Sheet (Zero Firebase Read/Write Quota!)
window.recordBlogView = function(blogId, blogTitle) {
  if (!blogId) return;
  try {
    const cur = LIVE_VIEWS_MAP[blogId] || 0;
    LIVE_VIEWS_MAP[blogId] = cur + 1;
    const alias = BLOG_SLUG_ALIAS_MAP[blogId];
    if (alias) LIVE_VIEWS_MAP[alias] = LIVE_VIEWS_MAP[blogId];

    // Local persistence so immediate UI reflects views
    try {
      const localViews = JSON.parse(localStorage.getItem('mendorbit_blog_views') || '{}');
      localViews[blogId] = LIVE_VIEWS_MAP[blogId];
      if (alias) localViews[alias] = LIVE_VIEWS_MAP[blogId];
      localStorage.setItem('mendorbit_blog_views', JSON.stringify(localViews));
    } catch (e) {}

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

    // Dispatch directly to Google Sheet Webhook (100% Free - ZERO Firebase Quota!)
    const webhookUrl = getBlogsViewsWebhookUrl();
    if (webhookUrl) {
      const payload = {
        sheet: "BlogViews",
        type: "blog_view",
        action: "record_blog_view",
        blogId: blogId,
        slug: alias || blogId,
        blogTitle: blogTitle || blogId,
        timestamp: new Date().toISOString()
      };
      fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
  } catch(e) {}
};

// Sync latest Real-Time Views from Google Sheet (Zero Firebase Quota)
window.syncBlogViewsFromSheet = async function() {
  const webhookUrl = getBlogsViewsWebhookUrl();
  if (!webhookUrl) return;
  try {
    const url = webhookUrl + (webhookUrl.includes('?') ? '&' : '?') + 'action=get_views&t=' + Date.now();
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.viewsMap || data.records || data.blogs)) {
        const rawMap = data.viewsMap || {};
        if (Array.isArray(data.blogs)) {
          data.blogs.forEach(b => {
            const count = parseInt(b.views, 10);
            if (!isNaN(count)) {
              if (b.slug) rawMap[b.slug] = count;
              if (b.id) rawMap[b.id] = count;
            }
          });
        }

        // Bi-directional mapping: set both slug, alias, and blogId
        const allBlogs = (CURRENT_LIVE_BLOGS && CURRENT_LIVE_BLOGS.length > 0) ? CURRENT_LIVE_BLOGS : DEFAULT_BLOGS_LIST;
        for (const [key, count] of Object.entries(rawMap)) {
          const v = parseInt(count || 0, 10);
          if (isNaN(v)) continue;
          LIVE_VIEWS_MAP[key] = v;

          // Check if key is a slug in BLOG_SLUG_ALIAS_MAP
          for (const [bId, slug] of Object.entries(BLOG_SLUG_ALIAS_MAP)) {
            if (slug === key || bId === key) {
              LIVE_VIEWS_MAP[bId] = v;
              LIVE_VIEWS_MAP[slug] = v;
            }
          }

          // Check if key matches blog.link
          allBlogs.forEach(b => {
            const linkSlug = getSlugFromLink(b.link);
            if (linkSlug === key || b.id === key) {
              LIVE_VIEWS_MAP[b.id] = v;
              if (linkSlug) LIVE_VIEWS_MAP[linkSlug] = v;
            }
          });
        }

        try {
          localStorage.setItem('mendorbit_blog_views', JSON.stringify(LIVE_VIEWS_MAP));
        } catch (e) {}

        if (CURRENT_LIVE_BLOGS) {
          CURRENT_LIVE_BLOGS.forEach(b => {
            b.views = getRealBlogViews(b.id);
          });
        }
        const list = getBlogsList();
        renderBlogsSection(list);
        renderBlogHubCatalog(list);
        updateTrendingChips(list);
        updateFeaturedShowcaseDOM(false, true);
      }
    }
  } catch(e) {}
};

// Eager early trigger on parse
try {
  if (typeof syncBlogViewsFromSheet === 'function') {
    syncBlogViewsFromSheet();
  }
} catch (e) {}

// Helper: Map raw blog records into enriched runtime blog objects
function mapRawBlogsToLive(rawList) {
  return (rawList || []).map(b => {
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
      active: b.active !== false,
      author: b.author || base.author || 'Mendorbit',
      posterImageUrl: poster,
      category: cleanCat,
      categorySlug: cleanCatSlug,
      description: desc,
      recommendedBlogIds: recs,
      relatedBlogIds: recs,
      views: getRealBlogViews(b.id)
    };
  });
}

// Sync Real-Time Blog Directory exclusively from Content Firebase 2 (Zero Sheet for content)
window.syncBlogsDirectoryFromContentFirebase = async function() {
  try {
    const db = getContentDb();
    if (db) {
      const snap = await db.collection('mendorbit_blogs').get();
      const cloudBlogs = [];
      if (!snap.empty) {
        snap.forEach(docSnap => cloudBlogs.push({ id: docSnap.id, ...docSnap.data() }));
      }

      // Auto-cleanup any old dummy placeholder docs from Firestore cloud
      try {
        RETIRED_DUMMY_BLOG_IDS.forEach(dummyId => {
          db.collection('mendorbit_blogs').doc(dummyId).delete().catch(() => {});
        });
      } catch (e) {}

      const cleanServerBlogs = sanitizeBlogsList(cloudBlogs);

      // Auto-merge with DEFAULT_BLOGS_LIST and auto-index missing articles to Firestore
      const merged = [...cleanServerBlogs];
      (DEFAULT_BLOGS_LIST || []).forEach(defBlog => {
        if (!defBlog || !defBlog.id) return;
        const exists = merged.some(b => b.id === defBlog.id || (b.link && defBlog.link && b.link === defBlog.link));
        if (!exists) {
          merged.push({ ...defBlog });
          try {
            db.collection('mendorbit_blogs').doc(defBlog.id).set(defBlog, { merge: true }).catch(() => {});
          } catch (e) {}
        }
      });

      if (merged.length > 0) {
        CURRENT_LIVE_BLOGS = mapRawBlogsToLive(merged);
      } else {
        CURRENT_LIVE_BLOGS = mapRawBlogsToLive(DEFAULT_BLOGS_LIST);
      }

      // Re-render live UI without page reload
      const enriched = getBlogsList();
      renderBlogsSection(enriched);
      renderBlogHubCatalog(enriched);
      updateTrendingChips(enriched);
      updateFeaturedShowcaseDOM(false, true);
      return;
    }
  } catch(err) {
    console.warn("Content Firebase sync note:", err);
  }
};

// Aliases for seamless backward compatibility
window.syncBlogsDirectory = window.syncBlogsDirectoryFromContentFirebase;
window.syncBlogsDirectoryFromSheet = window.syncBlogsDirectoryFromContentFirebase;

// Real-Time Listener on Content Firebase 2
try {
  const db = getContentDb();
  if (db) {
    db.collection('mendorbit_blogs').onSnapshot(snap => {
      const cloudBlogs = [];
      if (!snap.empty) {
        snap.forEach(docSnap => cloudBlogs.push({ id: docSnap.id, ...docSnap.data() }));
      }
      const clean = sanitizeBlogsList(cloudBlogs);
      const merged = [...clean];

      (DEFAULT_BLOGS_LIST || []).forEach(defBlog => {
        if (!defBlog || !defBlog.id) return;
        const exists = merged.some(b => b.id === defBlog.id || (b.link && defBlog.link && b.link === defBlog.link));
        if (!exists) {
          merged.push({ ...defBlog });
          try {
            db.collection('mendorbit_blogs').doc(defBlog.id).set(defBlog, { merge: true }).catch(() => {});
          } catch (e) {}
        }
      });

      if (merged.length > 0) {
        CURRENT_LIVE_BLOGS = mapRawBlogsToLive(merged);
      } else {
        CURRENT_LIVE_BLOGS = mapRawBlogsToLive(DEFAULT_BLOGS_LIST);
      }

      const enriched = getBlogsList();
      renderBlogsSection(enriched);
      renderBlogHubCatalog(enriched);
      updateTrendingChips(enriched);
      updateFeaturedShowcaseDOM(false, true);
    }, (err) => {
      console.warn("Real-time snapshot error:", err);
    });
  }
} catch (e) {}

// Retrieve in-memory blogs list safely enriched with real views & full fallbacks (Zero localStorage)
function getBlogsList() {
  try {
    let list = (Array.isArray(CURRENT_LIVE_BLOGS) && CURRENT_LIVE_BLOGS.length > 0)
      ? CURRENT_LIVE_BLOGS
      : (DEFAULT_BLOGS_LIST || []);
    if (!list || list.length === 0) {
      list = DEFAULT_BLOGS_LIST || [];
    }

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
      const views = getRealBlogViews(b.id);
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

  const idStr = String(blogId);
  let bookmarks = getBookmarkedBlogIds();
  const exists = bookmarks.includes(idStr);
  const nowBookmarked = !exists;

  // 1. Instant 0ms Optimistic UI Update on ALL matched elements on the screen
  const targetElements = document.querySelectorAll(`[data-spotlight-bookmark-btn="${idStr}"], [data-blog-bookmark-btn="${idStr}"]`);
  const elementsToUpdate = new Set(targetElements);
  if (event && event.currentTarget) elementsToUpdate.add(event.currentTarget);

  elementsToUpdate.forEach(btn => {
    const icon = btn.querySelector('svg, i');
    const label = btn.querySelector('.bookmark-btn-label, span');
    if (nowBookmarked) {
      if (icon) {
        icon.classList.remove('text-slate-400', 'text-purple-600', 'fill-purple-600');
        icon.classList.add('text-blue-600', 'fill-blue-600', 'dark:text-blue-400', 'dark:fill-blue-400');
        icon.setAttribute('fill', '#2563eb');
        icon.setAttribute('stroke', '#2563eb');
      }
      if (label && (label.textContent.trim().startsWith('Save') || label.textContent.trim() === 'Saved')) {
        label.textContent = 'Saved';
      }
      btn.classList.add('border-blue-500/80');
    } else {
      if (icon) {
        icon.classList.remove('text-blue-600', 'fill-blue-600', 'dark:text-blue-400', 'dark:fill-blue-400', 'text-purple-600', 'fill-purple-600');
        icon.classList.add('text-slate-400');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
      }
      if (label && (label.textContent.trim().startsWith('Save') || label.textContent.trim() === 'Saved')) {
        label.textContent = 'Save';
      }
      btn.classList.remove('border-blue-500/80');
    }
  });

  // 2. Persist to storage
  if (nowBookmarked) {
    bookmarks.push(idStr);
    showBookmarkToast("Saved to your reading list! Accessible via 'Saved' filter.", "success");
  } else {
    bookmarks = bookmarks.filter(id => id !== idStr);
    showBookmarkToast("Removed from your reading list", "info");
  }

  try {
    localStorage.setItem('mendorbit_user_bookmarks', JSON.stringify(bookmarks));
  } catch (e) {}

  updateBookmarkBadgeCounters();
  
  // 3. Update active slide cached data
  if (typeof activeFeaturedIndex !== 'undefined' && Array.isArray(featuredBlogsCache) && featuredBlogsCache[activeFeaturedIndex]) {
    featuredBlogsCache[activeFeaturedIndex]._bookmarked = nowBookmarked;
  }

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
              <!-- Top Row on Mobile: Primary Read + Quick Preview -->
              <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <a href="${activeBlog.link || 'blog.html'}" class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 min-h-[42px] rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 transition transform active:scale-95 leading-none whitespace-nowrap">
                  <span class="leading-none select-none flex items-center">Read <span class="hidden min-[380px]:inline">Full </span>Article</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0 inline-block align-middle my-auto"></i>
                </a>
                <button type="button" onclick="openQuickBlogPreview('${activeBlog.id}', event)" class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 min-h-[42px] rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-xs transition cursor-pointer whitespace-nowrap">
                  <i data-lucide="eye" class="w-3.5 h-3.5 flex-shrink-0"></i>
                  <span>Quick Preview</span>
                </button>
              </div>

              <!-- Secondary Row on Mobile: Bookmark + Prev/Next Navigation -->
              <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <button type="button" data-spotlight-bookmark-btn="${activeBlog.id}" data-blog-bookmark-btn="${activeBlog.id}" onclick="toggleBookmarkBlog('${activeBlog.id}', event)" class="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer ${isBookmarked ? 'border-blue-500/80' : ''}" title="Save for Later">
                  <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isBookmarked ? 'text-blue-600 fill-blue-600 dark:text-blue-400 dark:fill-blue-400' : 'text-slate-400'}"></i>
                  <span class="text-[11px] bookmark-btn-label">${isBookmarked ? 'Saved' : 'Save'}</span>
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
  if (candidates.length === 0) {
    if (blogHubContainer) blogHubContainer.innerHTML = '';
    if (indexContainer) indexContainer.innerHTML = '';
    stopFeaturedAutoRotation();
    return;
  }
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

function updateFeaturedShowcaseDOM(hasSearch = false, forceRefresh = false) {
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

  // Prevent re-rendering when already rendered unless forceRefresh is explicitly requested
  const alreadyRendered = (blogHubContainer && blogHubContainer.children.length > 0) || (indexContainer && indexContainer.children.length > 0);
  if (alreadyRendered && !forceRefresh) return;

  const blogs = getBlogsList();
  const candidates = getFeaturedShowcaseCandidates(blogs);
  if (candidates.length === 0) {
    if (blogHubContainer) blogHubContainer.innerHTML = '';
    if (indexContainer) indexContainer.innerHTML = '';
    stopFeaturedAutoRotation();
    return;
  }

  if (featuredSlideIndex >= candidates.length) {
    featuredSlideIndex = 0;
  }

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

// Quick Glance Preview Modal (Apple Aesthetic)
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
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            ${blog.description || 'Comprehensive revision guide and exam preparation strategy designed by top mentors to help aspirants achieve top percentile scores.'}
          </p>
        </div>

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
        <button type="button" data-blog-bookmark-btn="${blog.id}" onclick="toggleBookmarkBlog('${blog.id}', event)" class="px-3 sm:px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${isBookmarked ? 'border-blue-500/80' : ''}">
          <i data-lucide="bookmark" class="w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'text-blue-600 fill-blue-600 dark:text-blue-400 dark:fill-blue-400' : 'text-slate-400'}"></i>
          <span class="bookmark-btn-label">${isBookmarked ? 'Saved' : 'Save'}</span>
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
  if (typeof window.pushAppBackAction === 'function') {
    window.pushAppBackAction(() => window.closeQuickBlogPreview());
  }
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
  if (typeof window.pushAppBackAction === 'function') {
    window.pushAppBackAction(() => window.closeCustomShareSheet());
  }
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
              <button type="button" data-blog-bookmark-btn="${blog.id}" onclick="toggleBookmarkBlog('${blog.id}', event)" class="p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 transition-all shadow-md transform active:scale-95 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center" title="Bookmark Article">
                <i data-lucide="bookmark" class="w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'text-blue-400 fill-blue-400' : ''}"></i>
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
                <button type="button" data-blog-bookmark-btn="${blog.id}" onclick="toggleBookmarkBlog('${blog.id}', event)" class="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center" title="Bookmark Article">
                  <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isBookmarked ? 'text-blue-600 fill-blue-600' : ''}"></i>
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
            <button type="button" onclick="openQuickBlogPreview('${blog.id}', event)" class="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-[10px] sm:text-xs transition cursor-pointer min-h-[36px]" title="Quick Article Preview">
              <i data-lucide="eye" class="w-3.5 h-3.5 flex-shrink-0"></i>
              <span class="hidden min-[360px]:inline">Preview</span>
            </button>
            <a href="${blog.link || 'blog.html'}" class="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 transition transform active:scale-95 flex-shrink-0 whitespace-nowrap min-h-[36px] leading-none">
              <span class="leading-none select-none flex items-center">Read</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0 inline-block align-middle my-auto"></i>
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

  if (!blogs || blogs.length === 0) {
    container.innerHTML = '';
    return;
  }

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

  // Background sync full directory from Firebase 2 (Content Cloud - Indexing only)
  if (typeof syncBlogsDirectoryFromContentFirebase === 'function') {
    syncBlogsDirectoryFromContentFirebase();
  }
  // Background sync real-time views exclusively from Google Sheet (Zero Firebase quota used!)
  if (typeof syncBlogViewsFromSheet === 'function') {
    syncBlogViewsFromSheet();
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
          updateFeaturedShowcaseDOM(false, true);
          return;
        }

        if (event.data.type === 'VIEWS_UPDATED') {
          const v = parseInt(event.data.views, 10);
          if (!isNaN(v)) {
            if (event.data.blogId) LIVE_VIEWS_MAP[event.data.blogId] = v;
            if (event.data.slug) LIVE_VIEWS_MAP[event.data.slug] = v;

            const bKey = event.data.blogId || event.data.slug;
            for (const [bId, slug] of Object.entries(BLOG_SLUG_ALIAS_MAP)) {
              if (slug === bKey || bId === bKey) {
                LIVE_VIEWS_MAP[bId] = v;
                LIVE_VIEWS_MAP[slug] = v;
              }
            }

            const allBlogs = (CURRENT_LIVE_BLOGS && CURRENT_LIVE_BLOGS.length > 0) ? CURRENT_LIVE_BLOGS : DEFAULT_BLOGS_LIST;
            allBlogs.forEach(b => {
              const linkSlug = getSlugFromLink(b.link);
              if (linkSlug === event.data.slug || b.id === event.data.blogId) {
                LIVE_VIEWS_MAP[b.id] = v;
                if (linkSlug) LIVE_VIEWS_MAP[linkSlug] = v;
                b.views = v;
              }
            });
          }
          const list = getBlogsList();
          renderBlogsSection(list);
          renderBlogHubCatalog(list);
          updateTrendingChips(list);
          updateFeaturedShowcaseDOM(false, true);
          return;
        }
      }
    };
    window.mendorbitBlogsSyncChannel = mendorbitSyncChannel;
  }
} catch(e) {}

// Auto-sync real views every 15 seconds in background so remote views reflect without refresh
try {
  if (!window._mendorbitViewsLivePoller) {
    window._mendorbitViewsLivePoller = setInterval(() => {
      if (document.visibilityState === 'visible' && typeof syncBlogViewsFromSheet === 'function') {
        syncBlogViewsFromSheet();
      }
    }, 15000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && typeof syncBlogViewsFromSheet === 'function') {
        syncBlogViewsFromSheet();
      }
    });
    window.addEventListener('focus', () => {
      if (typeof syncBlogViewsFromSheet === 'function') {
        syncBlogViewsFromSheet();
      }
    });
  }
} catch (e) {}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMendorbitBlogsEngine);
} else {
  initMendorbitBlogsEngine();
}