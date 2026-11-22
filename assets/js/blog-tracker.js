/**
 * ==============================================================================
 * Mendorbit Universal Real-Time Blog View Tracker (v4.0.0)
 * ==============================================================================
 * 
 * Works automatically on ALL existing and new blog pages.
 * 100% Free & Exclusively Powered by Dedicated Google Sheet Webhook.
 * ZERO Firebase Read/Write Quotas Used!
 *
 * Capabilities:
 * - Instant view counting on page landing (Direct Link, Search, WhatsApp, Social, Button).
 * - Real-time cross-tab sync in 0ms (Home, Blog Directory, Admin Table).
 * - Anti-spam debounce (prevents reload bursts while reliably counting every real visit).
 * - Live in-page view counter display update.
 * - Works identically whether embedded in <head> or at the bottom of <body>.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Configurable Webhook URL (Supports Admin Panel Customization via localStorage)
  const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzw1A7dVUUV55bbikgU5AoWZXR6bPFOYcioMNlSWd3Xl_qKieTqbGQOXm2H3rchZRRSTw/exec";

  function getWebhookUrl() {
    try {
      return localStorage.getItem('mendorbit_blogs_sheet_webhook_url') || 
             localStorage.getItem('mendorbit_sheet_webhook_url') || 
             DEFAULT_WEBHOOK_URL;
    } catch (e) {
      return DEFAULT_WEBHOOK_URL;
    }
  }

  // Canonical Slug Extractor: detects from meta tag, canonical link, or window.location.pathname
  function extractCanonicalSlug() {
    // 1. Meta Tag Override
    const metaSlug = document.querySelector('meta[name="blog-slug"]');
    if (metaSlug && metaSlug.content) return cleanSlug(metaSlug.content);

    // 2. Canonical Link Tag
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && canonicalLink.href) {
      const match = canonicalLink.href.match(/\/([^\/\?#]+?)(?:\.html)?(?:$|[?#])/i);
      if (match && match[1] && !['blog', 'index', 'notes'].includes(match[1])) {
        return cleanSlug(match[1]);
      }
    }

    // 3. Current URL Pathname
    const path = window.location.pathname;
    const match = path.match(/\/([^\/\?#]+?)(?:\.html)?(?:$|[?#])/i);
    if (match && match[1]) {
      return cleanSlug(match[1]);
    }

    return 'article';
  }

  function cleanSlug(raw) {
    if (!raw) return '';
    let s = String(raw).trim().toLowerCase();
    s = s.replace(/\.html$/i, '');
    s = s.replace(/^blogs\//i, '');
    s = s.replace(/^(law|notes|strategy|editorial|news|colleges|case-study)\//i, '');
    s = s.replace(/^blog_/i, '');
    return s.trim();
  }

  function extractBlogTitle() {
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) {
      return h1.textContent.replace(/\s+/g, ' ').trim();
    }
    const docTitle = document.title || '';
    return docTitle.replace(/\s*[-|•]\s*Mendorbit.*$/i, '').trim() || extractCanonicalSlug();
  }

  function extractCategory() {
    const metaCat = document.querySelector('meta[name="blog-category"]');
    if (metaCat && metaCat.content) return metaCat.content.trim();

    const path = window.location.pathname.toLowerCase();
    if (path.includes('/law/')) return 'Law';
    if (path.includes('/notes/')) return 'Notes';
    if (path.includes('/strategy/')) return 'Strategy';
    if (path.includes('/editorial/')) return 'Editorial';
    if (path.includes('/news/')) return 'News';
    if (path.includes('/colleges/')) return 'Colleges';
    if (path.includes('/case-study/')) return 'Case Study';

    return 'General';
  }

  function formatCompactViews(n) {
    const num = parseInt(n || 0, 10);
    if (isNaN(num) || num <= 0) return '0';
    if (num < 1000) return String(num);
    if (num < 1000000) {
      const val = (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, '');
      return val + 'k';
    }
    const val = (num / 1000000).toFixed(1).replace(/\.0$/, '');
    return val + 'M';
  }

  // Update in-page view counters dynamically
  function updateDOMViews(count) {
    if (!count || isNaN(count)) return;
    const compactText = formatCompactViews(count) + ' views';
    const rawFormatted = Number(count).toLocaleString() + ' views';

    document.querySelectorAll('[data-blog-views], .article-live-views, #article-views-counter-text').forEach(el => {
      el.textContent = compactText;
      el.title = rawFormatted;
    });
  }

  // Record Real-Time View (0ms Instant Load & Sync)
  async function trackArticleVisit() {
    // Exclude admin pages
    if (window.location.pathname.includes('/admin/')) return;

    const slug = extractCanonicalSlug();
    if (!slug || ['index', 'blog', 'notes', 'about', 'contact', 'batches', 'checkout'].includes(slug)) return;

    const title = extractBlogTitle();
    const category = extractCategory();

    const CLAT_ALIASES = [
      'clat-2027-admit-card-out-download-link',
      'clat-2027-admit-card-download-guide',
      'clat-2026-admit-card-download-guide',
      'blog_clat_2027_admit_card',
      'blog_clat_2026_admit_card'
    ];
    const isClatArticle = CLAT_ALIASES.includes(slug) || slug.includes('clat-2027') || slug.includes('clat-2026');

    // Prevent reload burst counting within 8 seconds on same active tab
    const debounceKey = `mendorbit_visited_${slug}`;
    const lastVisit = parseInt(sessionStorage.getItem(debounceKey) || '0', 10);
    const isDebounced = (Date.now() - lastVisit < 8000);

    // 1. Read existing local view count with full alias harmonisation
    let currentViews = 0;
    try {
      const localMap = JSON.parse(localStorage.getItem('mendorbit_blog_views') || '{}');
      if (isClatArticle) {
        CLAT_ALIASES.forEach(k => {
          const v = parseInt(localMap[k] || 0, 10);
          if (v > currentViews) currentViews = v;
        });
      } else {
        currentViews = parseInt(localMap[slug] || 0, 10);
      }

      if (!isDebounced) {
        currentViews = Math.max(1, currentViews + 1);
        if (isClatArticle) {
          CLAT_ALIASES.forEach(k => {
            localMap[k] = currentViews;
          });
        } else {
          localMap[slug] = currentViews;
          localMap['blog_' + slug.replace(/-/g, '_')] = currentViews;
        }
        localStorage.setItem('mendorbit_blog_views', JSON.stringify(localMap));
        sessionStorage.setItem(debounceKey, Date.now().toString());
      }
    } catch (e) {}

    // Update in-page counters immediately in 0ms (Before user notices!)
    if (currentViews > 0) {
      updateDOMViews(currentViews);
    }

    if (isDebounced) return;

    // 2. Broadcast to open tabs (Home, Blog, Admin) with 0ms delay
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('mendorbit_blogs_live_sync');
        bc.postMessage({
          type: 'VIEWS_UPDATED',
          blogId: isClatArticle ? 'blog_clat_2027_admit_card' : slug,
          slug: slug,
          views: currentViews,
          timestamp: Date.now()
        });
        bc.close();
      }
    } catch (e) {}

    // 3. Dispatch to Google Sheet Webhook (Asynchronous, Non-blocking)
    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) return;

    const endpoint = webhookUrl + (webhookUrl.includes('?') ? '&' : '?') +
      'action=record_view' +
      '&slug=' + encodeURIComponent(slug) +
      '&title=' + encodeURIComponent(title) +
      '&category=' + encodeURIComponent(category) +
      '&t=' + Date.now();

    // Strategy A: Native fetch with keepalive & no-cors
    try {
      fetch(endpoint, {
        method: 'GET',
        mode: 'no-cors',
        keepalive: true,
        cache: 'no-store'
      }).then(() => {
        // Fetch latest accurate server count from Google Sheet
        fetchServerViewCount(webhookUrl, slug);
      }).catch(() => {
        // Strategy B: Image Beacon Fallback
        try {
          const img = new Image();
          img.src = endpoint;
        } catch (e) {}
      });
    } catch (e) {
      try {
        const img = new Image();
        img.src = endpoint;
      } catch (err) {}
    }
  }

  // Fetch updated count from Google Sheet to ensure 100% synchronization
  async function fetchServerViewCount(webhookUrl, slug) {
    try {
      const url = webhookUrl + (webhookUrl.includes('?') ? '&' : '?') + 'action=get_views&t=' + Date.now();
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.viewsMap && data.viewsMap[slug] !== undefined) {
          const serverViews = parseInt(data.viewsMap[slug], 10);
          if (!isNaN(serverViews) && serverViews > 0) {
            updateDOMViews(serverViews);
            try {
              const localMap = JSON.parse(localStorage.getItem('mendorbit_blog_views') || '{}');
              localMap[slug] = serverViews;
              localStorage.setItem('mendorbit_blog_views', JSON.stringify(localMap));

              if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('mendorbit_blogs_live_sync');
                bc.postMessage({
                  type: 'VIEWS_UPDATED',
                  blogId: slug,
                  slug: slug,
                  views: serverViews,
                  timestamp: Date.now()
                });
                bc.close();
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {}
  }

  // Cross-tab real-time listener for current article
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('mendorbit_blogs_live_sync');
      bc.onmessage = (event) => {
        if (!event || !event.data) return;
        const slug = extractCanonicalSlug();
        if (event.data.type === 'VIEWS_UPDATED' && (event.data.slug === slug || event.data.blogId === slug)) {
          if (event.data.views) updateDOMViews(event.data.views);
        }
      };
    }
  } catch (e) {}

  // Instant trigger: 0ms execution immediately + DOMContentLoaded backup
  try {
    trackArticleVisit();
  } catch(e) {}
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackArticleVisit);
  } else {
    trackArticleVisit();
  }

  // Export helper globally
  window.recordCurrentBlogView = trackArticleVisit;
})();
