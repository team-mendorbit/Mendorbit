/**
 * ==============================================================================
 * Mendorbit Dedicated Blogs Directory, Management & Analytics Engine
 * Google Apps Script Webhook Engine (100% Free - Zero Firebase Quota Used)
 * ==============================================================================
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet: "Mendorbit Blogs Analytics".
 * 2. In top menu, click Extensions -> Apps Script.
 * 3. Replace all code with this file and press Ctrl + S.
 * 4. Click Deploy -> Manage deployments -> Edit (pencil) -> Select "New version" -> Deploy!
 * ==============================================================================
 */

const SHEET_NAMES = {
  DIRECTORY: 'Blog_Directory',
  SUMMARY: 'Blog_Summary',
  STREAM: 'Live_Views_Stream'
};

// -------------------------------------------------------------
// Spreadsheet Triggers & Custom Menu
// -------------------------------------------------------------
function onOpen() {
  try {
    initializeAllTabs();
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('📊 Mendorbit')
      .addItem('⚡ Initialize / Sync All Tabs', 'initializeAllTabs')
      .addItem('🧹 Clean Dummy / Test Blogs', 'purgeGarbageBlogs')
      .addToUi();
  } catch (e) {}
}

function initializeAllTabs() {
  getDirectorySheet();
  getSummarySheet();
  getStreamSheet();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('All 3 Tabs (Blog_Directory, Blog_Summary, Live_Views_Stream) Initialized & Verified!', 'Mendorbit');
  } catch (e) {}
}

function purgeGarbageBlogs() {
  const dirSheet = getDirectorySheet();
  const summarySheet = getSummarySheet();
  let cleaned = 0;

  // 1. Clean Directory Sheet
  const lastDir = dirSheet.getLastRow();
  if (lastDir > 1) {
    const dData = dirSheet.getRange(2, 1, lastDir - 1, 6).getValues();
    const seenLinks = new Set();
    const seenIds = new Set();
    for (let r = dData.length - 1; r >= 0; r--) {
      const id = String(dData[r][0] || '').trim();
      const t = String(dData[r][1] || '').trim();
      const link = String(dData[r][5] || '').trim().toLowerCase();

      // Dummy or fake ID
      if (/^blog_\d{10,}$/i.test(id) || /^blog_\d{10,}$/i.test(t) || !t || t === id) {
        dirSheet.deleteRow(r + 2);
        cleaned++;
        continue;
      }

      // Duplicate link or ID
      if (seenIds.has(id) || (link && link !== 'blog.html' && link !== 'notes.html' && seenLinks.has(link))) {
        dirSheet.deleteRow(r + 2);
        cleaned++;
        continue;
      }
      seenIds.add(id);
      if (link && link !== 'blog.html' && link !== 'notes.html') seenLinks.add(link);
    }
  }

  // 2. Clean Summary Sheet
  const lastSum = summarySheet.getLastRow();
  if (lastSum > 1) {
    const sData = summarySheet.getRange(2, 1, lastSum - 1, 6).getValues();
    const seenLinks = new Set();
    const seenIds = new Set();
    for (let s = sData.length - 1; s >= 0; s--) {
      const id = String(sData[s][0] || '').trim();
      const t = String(sData[s][1] || '').trim();
      const link = String(sData[s][5] || '').trim().toLowerCase();

      if (/^blog_\d{10,}$/i.test(id) || /^blog_\d{10,}$/i.test(t) || !t || t === id) {
        summarySheet.deleteRow(s + 2);
        cleaned++;
        continue;
      }

      // Duplicate in Summary Sheet (e.g. slug duplicate vs canonical ID)
      if (seenIds.has(id) || (link && link !== 'blog.html' && link !== 'notes.html' && seenLinks.has(link))) {
        summarySheet.deleteRow(s + 2);
        cleaned++;
        continue;
      }
      seenIds.add(id);
      if (link && link !== 'blog.html' && link !== 'notes.html') seenLinks.add(link);
    }
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Purged ' + cleaned + ' dummy & duplicate rows from spreadsheet.', 'Mendorbit');
  } catch (e) {}
}

// Default seed blogs to populate Directory if empty
const DEFAULT_DIRECTORY_SEED = [
  [
    'blog_bns_103_law',
    'BNS Section 103 Explained: Murder Definition & Punishment vs IPC 302',
    'Law',
    'law',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    'blogs/law/bns-section-103-murder-punishment-explained.html',
    'Complete legal breakdown of Section 103 of Bharatiya Nyaya Sanhita 2023. Key differences from IPC 302, mob lynching provisions, and landmark constitutional principles.',
    1,
    'TRUE',
    9,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '6 Min Read'
  ],
  [
    'blog_class10_real_numbers',
    'Class 10 Real Numbers Revision Notes: Formulas & Solved Exemplar Questions',
    'Notes',
    'notes',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    'blogs/notes/class-10-real-numbers-revision-notes.html',
    'Complete chapter notes for CBSE Class 10 Chapter 1. Fundamental Theorem of Arithmetic, irrationality proofs, HCF-LCM shortcuts, and printable formula sheet.',
    2,
    'TRUE',
    2,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '8 Min Read'
  ],
  [
    'blog_class10_strategy',
    'Class 10 Board Exam: How Weak Students Can Score 90%+ in Maths & Science',
    'Strategy',
    'strategy',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    'blogs/strategy/class-10-maths-science-strategy.html',
    'Step-by-step blueprint from NCERT ground zero to board topper marks. Learn the exact method Mendorbit mentors use to eliminate examination anxiety.',
    3,
    'TRUE',
    3,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '10 Min Read'
  ],
  [
    'blog_ssc_cgl_beginner',
    'SSC CGL 2026 for Absolute Beginners: Zero se Inspector Kaise Banein',
    'Strategy',
    'strategy',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    'blogs/strategy/ssc-cgl-beginner-guide-zero-to-hero.html',
    'Complete syllabus breakdown, high-scoring subjects, non-math background strategy, and how to master Quantitative Aptitude & Reasoning from scratch.',
    4,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '12 Min Read'
  ],
  [
    'blog_clat_ailet_basics',
    'CLAT 2026: Legal Reasoning & Current Affairs Strategy from Scratch',
    'Strategy',
    'strategy',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    'blogs/strategy/clat-ailet-preparation-basics.html',
    'How to develop the critical passage reading speed required for modern CLAT questions without joining overpriced commercial coaching centers.',
    5,
    'TRUE',
    13,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '8 Min Read'
  ],
  [
    'note_class10_maths_formulas',
    'Class 10th Complete Mathematics Formula Sheet & Theorems Cheat Sheet',
    'Notes',
    'notes',
    'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
    'notes.html',
    'Every formula, theorem proof, and algebraic identity from Real Numbers to Statistics on a high-density 4-page printable revision cheat sheet.',
    6,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '4 Pages PDF'
  ],
  [
    'note_ssc_120_grammar',
    '120 Golden Rules of English Grammar for SSC & Banking Aspirants',
    'Notes',
    'notes',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    'notes.html',
    'Subject-verb agreement, inversion rules, and conditional clauses simplified with authentic past-year questions from Tier 1 & Tier 2.',
    7,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '12 Pages'
  ],
  [
    'note_speed_math_tricks',
    'Vedic Speed Math & Mental Calculation Shortcuts Kit',
    'Notes',
    'notes',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    'notes.html',
    'Master rapid cube roots, square roots, fast percentage splits, and multiplication matrices for SSC CGL, Bank PO, and CSAT speed enhancement.',
    8,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '8 Pages'
  ],
  [
    'blog_editorial_neet_reforms',
    'National Testing & Entrance Exam Normalization: Student Rights & Policy Reforms',
    'Editorial',
    'editorial',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80',
    'blogs/editorial/exam-normalization-reforms-analysis.html',
    'In-depth critical analysis of exam normalization, computer-based testing transparency, and structural reforms shaping competitive exams in India.',
    9,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '7 Min Read'
  ],
  [
    'blog_news_ssc_cgl_exam_dates',
    'SSC CGL 2026 Official Calendar & Revised Exam Pattern Notification',
    'News',
    'news',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    'blogs/news/ssc-cgl-official-notification-calendar.html',
    'Staff Selection Commission releases updated tentative exam schedule, post-wise vacancy matrix, and revised Tier-1 normalization rules.',
    10,
    'TRUE',
    2,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '3 Min Read'
  ],
  [
    'blog_colleges_top_nlus_cutoff',
    'Top 10 NLUs in India: Rank-wise Cutoffs, Placement Stats & Real Campus Reviews',
    'Colleges',
    'colleges',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    'blogs/colleges/top-nlus-rankwise-cutoffs-placements.html',
    'NLSIU Bengaluru, NALSAR Hyderabad, and WBNUJS Kolkata detailed comparison with Category-wise opening & closing ranks and corporate package stats.',
    11,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '9 Min Read'
  ],
  [
    'blog_casestudy_edtech_evolution',
    'The Rise, Fall & Future of Online EdTech in India: Deep Dive Case Study',
    'Case Study',
    'case-study',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'blogs/case-study/future-of-indian-edtech-case-study.html',
    'How bloated marketing budgets collapsed early unicorns, and why sustainable, teacher-first models like Mendorbit are winning student trust.',
    12,
    'TRUE',
    0,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit',
    '11 Min Read'
  ]
];

// -------------------------------------------------------------
// Sheet Initializers with Auto-Styling
// -------------------------------------------------------------
function getOrCreateSheet(sheetName, headers, headerBgColor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(headerBgColor || '#ea580c');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment('center');
  }
  return sheet;
}

function getDirectorySheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.DIRECTORY, [
    'Blog ID',
    'Title',
    'Category',
    'Category Slug',
    'Poster URL',
    'Target Link',
    'Description',
    'Order',
    'Active',
    'Total Real Views',
    'Last Updated (IST)',
    'Author',
    'Read Time'
  ], '#0f172a');

  // Auto-seed standard blogs if sheet was just created
  if (sheet.getLastRow() <= 1) {
    for (let i = 0; i < DEFAULT_DIRECTORY_SEED.length; i++) {
      sheet.appendRow(DEFAULT_DIRECTORY_SEED[i]);
    }
  }

  return sheet;
}

function getSummarySheet() {
  return getOrCreateSheet(SHEET_NAMES.SUMMARY, [
    'Blog ID / Slug',
    'Blog Title',
    'Category',
    'Total Real Views',
    'Last Viewed (IST)',
    'Page Link'
  ], '#ea580c');
}

function getStreamSheet() {
  return getOrCreateSheet(SHEET_NAMES.STREAM, [
    'Timestamp (ISO)',
    'Display Time (IST)',
    'Blog Title',
    'Category',
    'Device & Hardware',
    'City / Region',
    'Referrer',
    'Page URL',
    'Visitor ID'
  ], '#0f172a');
}

function handleSaveBlog(payload) {
  const dirSheet = getDirectorySheet();
  const blogId = String(payload.id || payload.blogId || ('blog_' + Date.now())).trim();
  const title = String(payload.title || '').trim();
  const category = String(payload.category || 'General').trim();
  const categorySlug = String(payload.categorySlug || category.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();
  const posterImageUrl = String(payload.posterImageUrl || '').trim();
  const link = String(payload.link || '').trim();
  const description = String(payload.description || '').trim();
  const order = parseInt(payload.order || 99, 10);
  const active = (payload.active === false || String(payload.active) === 'false') ? 'FALSE' : 'TRUE';
  const views = parseInt(payload.views || 0, 10);
  const author = String(payload.author || 'Mendorbit').trim();
  const readTime = String(payload.readTime || '5 Min Read').trim();
  const now = new Date();
  const displayTime = Utilities.formatDate(now, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');

  const lastRow = dirSheet.getLastRow();
  let foundIndex = -1;

  if (lastRow > 1) {
    const dirData = dirSheet.getRange(2, 1, lastRow - 1, 6).getValues();
    for (let r = 0; r < dirData.length; r++) {
      const rowId = String(dirData[r][0]).trim();
      const rowLink = String(dirData[r][5]).trim();
      if (rowId === blogId || (link && rowLink && rowLink === link)) {
        foundIndex = r + 2;
        break;
      }
    }
  }

  if (foundIndex > 0) {
    // Update existing row
    if (title) dirSheet.getRange(foundIndex, 2).setValue(title);
    if (category) dirSheet.getRange(foundIndex, 3).setValue(category);
    if (categorySlug) dirSheet.getRange(foundIndex, 4).setValue(categorySlug);
    if (posterImageUrl !== undefined) dirSheet.getRange(foundIndex, 5).setValue(posterImageUrl);
    if (link) dirSheet.getRange(foundIndex, 6).setValue(link);
    if (description !== undefined) dirSheet.getRange(foundIndex, 7).setValue(description);
    if (payload.order !== undefined) dirSheet.getRange(foundIndex, 8).setValue(order);
    if (payload.active !== undefined) dirSheet.getRange(foundIndex, 9).setValue(active);
    if (payload.views !== undefined) dirSheet.getRange(foundIndex, 10).setValue(views);
    dirSheet.getRange(foundIndex, 11).setValue(displayTime);
    if (author) dirSheet.getRange(foundIndex, 12).setValue(author);
    if (readTime) dirSheet.getRange(foundIndex, 13).setValue(readTime);
  } else {
    // Append new row
    dirSheet.appendRow([
      blogId,
      title,
      category,
      categorySlug,
      posterImageUrl,
      link,
      description,
      order,
      active,
      views,
      displayTime,
      author,
      readTime
    ]);
  }

  // Sync into Blog_Summary tab simultaneously so BOTH tabs update instantly
  const summarySheet = getSummarySheet();
  const lastSummaryRow = summarySheet.getLastRow();
  let sumIndex = -1;
  if (lastSummaryRow > 1) {
    const sumData = summarySheet.getRange(2, 1, lastSummaryRow - 1, 6).getValues();
    for (let s = 0; s < sumData.length; s++) {
      const sId = String(sumData[s][0]).trim();
      const sLink = String(sumData[s][5]).trim();
      if (sId === blogId || (link && sLink && sLink === link)) {
        sumIndex = s + 2;
        break;
      }
    }
  }
  if (sumIndex > 0) {
    if (title) summarySheet.getRange(sumIndex, 2).setValue(title);
    if (category) summarySheet.getRange(sumIndex, 3).setValue(category);
    if (payload.views !== undefined) summarySheet.getRange(sumIndex, 4).setValue(views);
    summarySheet.getRange(sumIndex, 5).setValue(displayTime);
    if (link) summarySheet.getRange(sumIndex, 6).setValue(link);
  } else {
    summarySheet.appendRow([
      blogId,
      title,
      category,
      views,
      displayTime,
      link || 'blog.html'
    ]);
  }

  return createJsonResponse({ status: 'success', message: 'Blog saved in sheet directory', blogId: blogId });
}

// -------------------------------------------------------------
// POST Request: Direct Admin Management + Real-Time Telemetry
// -------------------------------------------------------------
function doPost(e) {
  try {
    // Ensure all 3 sheets exist
    getDirectorySheet();
    getSummarySheet();
    getStreamSheet();

    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = String(payload.action || '').trim();
    const now = new Date();
    const nowIso = payload.timestamp || now.toISOString();
    const displayTime = Utilities.formatDate(now, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');

    // =========================================================
    // 1. ADMIN ACTIONS: Save, Toggle, Delete Blog
    // =========================================================
    if (action === 'save_blog') {
      return handleSaveBlog(payload);
    }

    if (action === 'toggle_blog_status') {
      const dirSheet = getDirectorySheet();
      const blogId = String(payload.blogId || payload.id || '').trim();
      const newActive = payload.active ? 'TRUE' : 'FALSE';
      const lastRow = dirSheet.getLastRow();

      if (lastRow > 1) {
        const idCol = dirSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let r = 0; r < idCol.length; r++) {
          if (String(idCol[r][0]).trim() === blogId) {
            dirSheet.getRange(r + 2, 9).setValue(newActive);
            dirSheet.getRange(r + 2, 11).setValue(displayTime);
            return createJsonResponse({ status: 'success', message: 'Status updated', blogId: blogId, active: newActive });
          }
        }
      }
      return createJsonResponse({ status: 'error', message: 'Blog not found' });
    }

    if (action === 'delete_blog') {
      const blogId = String(payload.blogId || payload.id || '').trim();
      const dirSheet = getDirectorySheet();
      const summarySheet = getSummarySheet();
      const streamSheet = getStreamSheet();
      let deletedTitle = '';
      let deletedLink = '';

      // 1. Delete from Blog_Directory
      const lastDirRow = dirSheet.getLastRow();
      if (lastDirRow > 1) {
        const dirData = dirSheet.getRange(2, 1, lastDirRow - 1, 6).getValues();
        for (let r = dirData.length - 1; r >= 0; r--) {
          const rowId = String(dirData[r][0]).trim();
          if (rowId === blogId) {
            deletedTitle = String(dirData[r][1]).trim();
            deletedLink = String(dirData[r][5]).trim();
            dirSheet.deleteRow(r + 2);
          }
        }
      }

      // 2. Delete from Blog_Summary (ALL matching rows)
      const lastSummaryRow = summarySheet.getLastRow();
      if (lastSummaryRow > 1) {
        const sumData = summarySheet.getRange(2, 1, lastSummaryRow - 1, 6).getValues();
        for (let s = sumData.length - 1; s >= 0; s--) {
          const sId = String(sumData[s][0]).trim();
          const sLink = String(sumData[s][5]).trim();
          if (sId === blogId || (deletedLink && sLink && sLink === deletedLink)) {
            summarySheet.deleteRow(s + 2);
          }
        }
      }

      // 3. Delete from Blog_Stream (ALL visitor logs for this blog)
      const lastStreamRow = streamSheet.getLastRow();
      if (lastStreamRow > 1) {
        const streamData = streamSheet.getRange(2, 1, lastStreamRow - 1, 8).getValues();
        for (let t = streamData.length - 1; t >= 0; t--) {
          const tTitle = String(streamData[t][2]).trim();
          const tUrl = String(streamData[t][7]).trim();
          if ((deletedTitle && tTitle && tTitle === deletedTitle) ||
              (deletedLink && tUrl && tUrl.includes(deletedLink)) ||
              (blogId && tUrl && tUrl.includes(blogId))) {
            streamSheet.deleteRow(t + 2);
          }
        }
      }

      return createJsonResponse({ status: 'success', message: 'Blog and all associated telemetry purged from all sheet tabs', blogId: blogId });
    }

    // Auto-clean dummy / garbage test blogs from all tabs
    if (action === 'clean_garbage_blogs') {
      const dirSheet = getDirectorySheet();
      const summarySheet = getSummarySheet();
      let cleaned = 0;

      const lastDir = dirSheet.getLastRow();
      if (lastDir > 1) {
        const dData = dirSheet.getRange(2, 1, lastDir - 1, 2).getValues();
        for (let r = dData.length - 1; r >= 0; r--) {
          const id = String(dData[r][0] || '').trim();
          const t = String(dData[r][1] || '').trim();
          if (/^blog_\d{10,}$/i.test(id) || /^blog_\d{10,}$/i.test(t) || !t || t === id) {
            dirSheet.deleteRow(r + 2);
            cleaned++;
          }
        }
      }

      const lastSum = summarySheet.getLastRow();
      if (lastSum > 1) {
        const sData = summarySheet.getRange(2, 1, lastSum - 1, 2).getValues();
        for (let s = sData.length - 1; s >= 0; s--) {
          const id = String(sData[s][0] || '').trim();
          const t = String(sData[s][1] || '').trim();
          if (/^blog_\d{10,}$/i.test(id) || /^blog_\d{10,}$/i.test(t) || !t || t === id) {
            summarySheet.deleteRow(s + 2);
            cleaned++;
          }
        }
      }

      return createJsonResponse({ status: 'success', message: 'Cleaned dummy blogs', count: cleaned });
    }

    // =========================================================
    // 2. RECORD BLOG VIEW EVENT (Real Readers Telemetry)
    // =========================================================
    if (action === 'record_blog_view' || payload.type === 'blog_view' || payload.sheet === 'BlogViews') {
      const blogId = String(payload.blogId || payload.id || 'general').trim();
      const blogTitle = String(payload.blogTitle || payload.title || blogId).trim();
      const category = String(payload.category || 'Article').trim();
      const device = String(payload.device || 'Desktop').trim();
      const city = String(payload.city || 'India').trim();
      const referrer = String(payload.referrer || payload.source || 'Direct Link').trim();
      const pageUrl = String(payload.pageUrl || payload.url || '').trim();
      const visitorId = String(payload.visitorId || 'v_' + Math.random().toString(36).substring(2, 8)).trim();

      // Log to Stream Sheet
      const streamSheet = getStreamSheet();
      streamSheet.appendRow([
        nowIso,
        displayTime,
        blogTitle,
        category,
        device,
        city,
        referrer,
        pageUrl,
        visitorId
      ]);

      // Update Summary Sheet (Deduplicate by ID, slug, or link)
      const summarySheet = getSummarySheet();
      const lastSummaryRow = summarySheet.getLastRow();
      let summaryRowIndex = -1;
      let currentViews = 0;

      if (lastSummaryRow > 1) {
        const sumValues = summarySheet.getRange(2, 1, lastSummaryRow - 1, 6).getValues();
        for (let i = 0; i < sumValues.length; i++) {
          const sId = String(sumValues[i][0]).trim();
          const sLink = String(sumValues[i][5]).trim();
          if (sId === blogId || (payload.slug && sId === payload.slug) || (pageUrl && sLink && pageUrl.includes(sLink)) || (payload.slug && sLink && sLink.includes(payload.slug))) {
            summaryRowIndex = i + 2;
            break;
          }
        }
      }

      let updatedTotal = 1;
      if (summaryRowIndex > 0) {
        currentViews = parseInt(summarySheet.getRange(summaryRowIndex, 4).getValue() || 0, 10);
        updatedTotal = currentViews + 1;
        summarySheet.getRange(summaryRowIndex, 1).setValue(blogId);
        summarySheet.getRange(summaryRowIndex, 2).setValue(blogTitle);
        summarySheet.getRange(summaryRowIndex, 3).setValue(category);
        summarySheet.getRange(summaryRowIndex, 4).setValue(updatedTotal);
        summarySheet.getRange(summaryRowIndex, 5).setValue(displayTime);
        if (pageUrl) summarySheet.getRange(summaryRowIndex, 6).setValue(pageUrl);
      } else {
        summarySheet.appendRow([
          blogId,
          blogTitle,
          category,
          1,
          displayTime,
          pageUrl
        ]);
      }

      // Also increment in Directory Sheet if exists (Deduplicate by ID or link)
      const dirSheet = getDirectorySheet();
      const lastDirRow = dirSheet.getLastRow();
      if (lastDirRow > 1) {
        const dirData = dirSheet.getRange(2, 1, lastDirRow - 1, 10).getValues();
        for (let d = 0; d < dirData.length; d++) {
          const rowId = String(dirData[d][0]).trim();
          const rowLink = String(dirData[d][5]).trim();
          if (rowId === blogId || (payload.slug && rowId.includes(payload.slug)) || (pageUrl && rowLink && pageUrl.includes(rowLink)) || (payload.slug && rowLink && rowLink.includes(payload.slug))) {
            const curViews = parseInt(dirData[d][9] || 0, 10);
            dirSheet.getRange(d + 2, 10).setValue(curViews + 1);
            dirSheet.getRange(d + 2, 11).setValue(displayTime);
            break;
          }
        }
      }

      return createJsonResponse({
        status: 'success',
        message: 'View registered in dedicated blogs sheet',
        blogId: blogId,
        totalViews: updatedTotal
      });
    }

    return createJsonResponse({ status: 'ignored', message: 'Action not recognized' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// -------------------------------------------------------------
// GET Request: Blog Directory Feed & Analytics
// -------------------------------------------------------------
function doGet(e) {
  try {
    // Ensure all 3 sheets exist & are styled on ANY call
    const dirSheet = getDirectorySheet();
    const summarySheet = getSummarySheet();
    const streamSheet = getStreamSheet();

    const params = (e && e.parameter) ? e.parameter : {};
    const action = String(params.action || '').trim();

    // Support save_blog via GET as robust fallback
    if (action === 'save_blog') {
      return handleSaveBlog(params);
    }

    // =========================================================
    // 1. SERVE FULL BLOG DIRECTORY (for index.html, blog.html & admin)
    // =========================================================
    if (action === 'get_blogs_directory' || action === 'get_directory') {
      const lastRow = dirSheet.getLastRow();
      const blogsList = [];

      if (lastRow > 1) {
        const data = dirSheet.getRange(2, 1, lastRow - 1, 13).getValues();
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const id = String(row[0] || '').trim();
          const title = String(row[1] || '').trim();
          // Filter out dummy/test blogs
          if (id && title && title !== id && !/^blog_\d{10,}$/i.test(title)) {
            blogsList.push({
              id: id,
              title: title,
              category: String(row[2] || 'Article'),
              categorySlug: String(row[3] || 'notes'),
              posterImageUrl: String(row[4] || ''),
              link: String(row[5] || 'blog.html'),
              description: String(row[6] || ''),
              order: parseInt(row[7] || (i + 1), 10),
              active: String(row[8]).toUpperCase() !== 'FALSE',
              views: parseInt(row[9] || 0, 10),
              updatedAt: String(row[10] || ''),
              author: String(row[11] || 'Mendorbit'),
              readTime: String(row[12] || '5 Min Read')
            });
          }
        }
      }

      // Sort by order
      blogsList.sort(function(a, b) { return (a.order || 99) - (b.order || 99); });

      return createJsonResponse({
        status: 'success',
        count: blogsList.length,
        blogs: blogsList,
        fetchedAt: Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a')
      });
    }

    // =========================================================
    // 2. SERVE FULL AUDIENCE ANALYTICS (for admin/analytics.html)
    // =========================================================
    const lastSummaryRow = summarySheet.getLastRow();
    const viewsMap = {};
    const blogList = [];
    let totalViews = 0;

    // Load Directory map for poster & description fallbacks
    const dirMap = {};
    const lastDirRow = dirSheet.getLastRow();
    if (lastDirRow > 1) {
      const dirData = dirSheet.getRange(2, 1, lastDirRow - 1, 7).getValues();
      for (let d = 0; d < dirData.length; d++) {
        const dId = String(dirData[d][0] || '').trim();
        if (dId) {
          dirMap[dId] = {
            poster: String(dirData[d][4] || ''),
            desc: String(dirData[d][6] || '')
          };
        }
      }
    }

    if (lastSummaryRow > 1) {
      const summaryData = summarySheet.getRange(2, 1, lastSummaryRow - 1, 6).getValues();
      for (let i = 0; i < summaryData.length; i++) {
        const id = String(summaryData[i][0] || '').trim();
        const title = String(summaryData[i][1] || id);
        const cat = String(summaryData[i][2] || 'General');
        const views = parseInt(summaryData[i][3] || 0, 10);
        const lastViewed = String(summaryData[i][4] || '');
        const link = String(summaryData[i][5] || '');

        if (id) {
          viewsMap[id] = views;
          totalViews += views;
          const fallback = dirMap[id] || {};
          blogList.push({
            id: id,
            title: title,
            category: cat,
            views: views,
            lastViewed: lastViewed,
            link: link,
            posterImageUrl: fallback.poster || '',
            description: fallback.desc || ''
          });
        }
      }
    }

    blogList.sort(function(a, b) { return b.views - a.views; });

    // Stream Analytics (Recent 100 events)
    const lastStreamRow = streamSheet.getLastRow();
    const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const cityCounts = {};
    const recentEvents = [];

    if (lastStreamRow > 1) {
      const startStreamRow = Math.max(2, lastStreamRow - 99);
      const streamData = streamSheet.getRange(startStreamRow, 1, lastStreamRow - startStreamRow + 1, 9).getValues();
      for (let s = streamData.length - 1; s >= 0; s--) {
        const row = streamData[s];
        const dev = String(row[4] || 'Desktop').toLowerCase();
        if (dev.includes('mobile') || dev.includes('android') || dev.includes('iphone')) {
          deviceCounts.Mobile++;
        } else if (dev.includes('tablet') || dev.includes('ipad')) {
          deviceCounts.Tablet++;
        } else {
          deviceCounts.Desktop++;
        }

        const city = String(row[5] || 'India').trim();
        if (city && city !== 'undefined') {
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        }

        if (recentEvents.length < 50) {
          recentEvents.push({
            time: row[1] || row[0],
            title: row[2],
            category: row[3],
            device: row[4],
            city: row[5],
            referrer: row[6],
            url: row[7]
          });
        }
      }
    }

    const topCities = Object.keys(cityCounts).map(function(c) {
      return { city: c, count: cityCounts[c] };
    }).sort(function(a, b) { return b.count - a.count; }).slice(0, 8);

    return createJsonResponse({
      status: 'success',
      totalArticles: blogList.length,
      totalViews: totalViews,
      views: viewsMap,
      blogs: blogList,
      deviceCounts: deviceCounts,
      topCities: topCities,
      recentEvents: recentEvents,
      generatedAt: Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a')
    });

  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// Helper: JSON Output
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}