/**
 * ==============================================================================
 * Mendorbit Official Blog View Tracker (Universal Direct-Visit Engine)
 * Automatically tracks direct links, search visits, and shared article reads.
 * Routes directly to the Dedicated Google Sheet Webhook with zero quota usage.
 * ==============================================================================
 */

(function () {
  'use strict';

  const DEFAULT_BLOGS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzwk4vCqhqfhnoi8FHqQ_DnQAtcLeztpJ5iofC-XjeWSA61WY63eH0AYDKCyZRVTGctwA/exec";

  function getBlogsWebhookUrl() {
    const custom = localStorage.getItem('mendorbit_blogs_sheet_webhook_url');
    if (custom && custom.includes('AKfycbzYozOXHHNKiYyWi9DaQQMsi-iFn9zTuEWaiPVqMvv-R5uWLkSUqbh_zlMUDmqLk4MXKg')) {
      localStorage.removeItem('mendorbit_blogs_sheet_webhook_url');
      return DEFAULT_BLOGS_WEBHOOK_URL;
    }
    return custom || DEFAULT_BLOGS_WEBHOOK_URL;
  }

  function getVisitorId() {
    let vid = localStorage.getItem('mendorbit_visitor_id');
    if (!vid) {
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const time = Date.now().toString(36).substring(3, 7).toUpperCase();
      vid = `USR-${time}-${rand}`;
      localStorage.setItem('mendorbit_visitor_id', vid);
    }
    return vid;
  }

  function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const device = isMobile ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
    let browser = 'Browser';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';

    return { device, browser };
  }

  function getReferrerSource() {
    const ref = document.referrer || '';
    if (!ref) return 'Direct Link';
    if (ref.includes('google.')) return 'Google Search';
    if (ref.includes('whatsapp') || ref.includes('api.whatsapp')) return 'WhatsApp Share';
    if (ref.includes('telegram') || ref.includes('t.me')) return 'Telegram';
    if (ref.includes('instagram')) return 'Instagram';
    if (ref.includes('youtube')) return 'YouTube';
    if (ref.includes('linkedin')) return 'LinkedIn';
    try {
      const url = new URL(ref);
      return url.hostname || 'External Link';
    } catch (e) {
      return 'Web Link';
    }
  }

  function extractBlogMetadata() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const fileName = segments[segments.length - 1] || 'article.html';
    const slug = fileName.replace('.html', '');

    // Determine category from folder structure
    let category = 'General';
    if (path.includes('/law/')) category = 'Law';
    else if (path.includes('/notes/')) category = 'Notes';
    else if (path.includes('/strategy/')) category = 'Strategy';
    else if (path.includes('/editorial/')) category = 'Editorial';
    else if (path.includes('/news/')) category = 'News';
    else if (path.includes('/colleges/')) category = 'Colleges';
    else if (path.includes('/case-study/')) category = 'Case Study';

    // Blog title from H1 or document title
    const h1El = document.querySelector('h1');
    let title = h1El ? h1El.innerText.trim() : document.title;
    title = title.replace(/\s*[-|•]\s*Mendorbit.*$/i, '').trim();

    // Map slug to catalog blogId if known or from local directory
    let blogId = slug;
    try {
      const dir = window.DEFAULT_BLOGS_LIST;
      if (Array.isArray(dir)) {
        const match = dir.find(b => b.id === slug || (b.link && (b.link.includes(slug) || window.location.pathname.includes(b.link.replace(/^blogs\//, '')))));
        if (match && match.id) {
          blogId = match.id;
          if (match.title) title = match.title;
          if (match.category) category = match.category;
        }
      }
    } catch(e) {}

    if (blogId === slug) {
      if (slug.includes('bns-section-103')) blogId = 'blog_bns_103_law';
      else if (slug.includes('real-numbers')) blogId = 'blog_class10_real_numbers';
      else if (slug.includes('maths-science-strategy')) blogId = 'blog_class10_strategy';
      else if (slug.includes('clat-ailet')) blogId = 'blog_clat_ailet_basics';
      else if (slug.includes('normalization')) blogId = 'blog_editorial_neet_reforms';
      else if (slug.includes('ssc-cgl-official')) blogId = 'blog_news_ssc_cgl_exam_dates';
      else if (slug.includes('zero-to-hero')) blogId = 'blog_ssc_cgl_beginner';
      else if (slug.includes('top-nlus')) blogId = 'blog_colleges_top_nlus_cutoff';
      else if (slug.includes('future-of-indian-edtech')) blogId = 'blog_casestudy_edtech_evolution';
    }

    return { blogId, slug, title, category };
  }

  async function getCityLocation() {
    try {
      const cached = JSON.parse(localStorage.getItem('mendorbit_geo_cache') || 'null');
      if (cached && (Date.now() - (cached.timestamp || 0) < 24 * 60 * 60 * 1000) && cached.city) {
        return cached.city + (cached.region ? `, ${cached.region}` : '');
      }
    } catch (e) {}

    try {
      const res = await fetch('https://ipapi.co/json/', { timeout: 2500 });
      if (res.ok) {
        const d = await res.json();
        const city = d.city || 'India';
        const region = d.region || '';
        localStorage.setItem('mendorbit_geo_cache', JSON.stringify({ city, region, timestamp: Date.now() }));
        return city + (region ? `, ${region}` : '');
      }
    } catch (e) {}

    return 'India';
  }

  async function trackArticleVisit() {
    // Exclude admin pages
    if (window.location.pathname.includes('/admin/')) return;

    const meta = extractBlogMetadata();
    if (!meta.slug || meta.slug === 'index' || meta.slug === 'blog') return;

    // Prevent burst reload loop within 6 seconds on the same article
    const debounceKey = `mendorbit_read_${meta.slug}`;
    const lastRead = parseInt(sessionStorage.getItem(debounceKey) || '0', 10);
    if (Date.now() - lastRead < 6000) return;
    sessionStorage.setItem(debounceKey, Date.now().toString());

    // 1. Live Instant Broadcast to any open Home/Blog/Admin tab with Zero Page Reload
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('mendorbit_blogs_live_sync');
        ch.postMessage({ type: 'VIEWS_UPDATED', blogId: meta.blogId, slug: meta.slug });
      }
    } catch (e) {}

    // 2. Fetch Device & Geolocation
    const { device, browser } = getDeviceInfo();
    const referrer = getReferrerSource();
    const city = await getCityLocation();
    const visitorId = getVisitorId();

    // 3. Dispatch to Dedicated Google Sheet Webhook
    const webhookUrl = getBlogsWebhookUrl();
    if (!webhookUrl) return;

    const payload = {
      sheet: "BlogViews",
      type: "blog_view",
      action: "record_blog_view",
      blogId: meta.blogId,
      slug: meta.slug,
      blogTitle: meta.title,
      category: meta.category,
      visitorId: visitorId,
      device: device,
      browser: browser,
      city: city,
      referrer: referrer,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString()
    };

    try {
      fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(function() {});
    } catch (e) {}
  }

  // Trigger on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackArticleVisit);
  } else {
    trackArticleVisit();
  }
})();
