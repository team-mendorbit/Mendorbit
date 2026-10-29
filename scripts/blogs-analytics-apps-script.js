/**
 * ==============================================================================
 * Mendorbit Dedicated Blogs Directory, Management & Analytics Engine (v3.1.0)
 * Google Apps Script Webhook Engine (100% Free - Zero Firebase Quota Used)
 * ==============================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * 1. Blog_Directory    : Master Admin Registry (Admin edits/creates blogs here)
 * 2. Blog_Summary      : Production Read-Only Summary (Feeds frontend & API directly)
 * 3. Live_Views_Stream : Real-Time Reader Audit Telemetry (Visits, Devices, Cities)
 * 
 * NOTE: 'Read Time' column has been completely removed as requested.
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open your Google Spreadsheet: "Mendorbit Blogs Analytics".
 * 2. In top menu, click Extensions -> Apps Script.
 * 3. Delete everything and paste this entire file. Press Ctrl + S.
 * 4. Click Deploy -> Manage deployments -> Edit (pencil icon).
 * 5. Under "Version", select "New version" -> Click Deploy!
 * 6. Refresh spreadsheet and click 📊 Mendorbit -> ⚡ Reset & Rebuild Fresh Clean Sheet.
 * ==============================================================================
 */

const SHEET_NAMES = {
  DIRECTORY: 'Blog_Directory',
  SUMMARY: 'Blog_Summary',
  STREAM: 'Live_Views_Stream'
};

const DIRECTORY_HEADERS = [
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
  'Author'
];

const STREAM_HEADERS = [
  'Timestamp (ISO)',
  'Display Time (IST)',
  'Blog Title',
  'Category',
  'Device & Hardware',
  'City / Region',
  'Referrer',
  'Page URL',
  'Visitor ID'
];

// Pristine baseline matching EXACTLY the indexed homepage blogs
const DEFAULT_DIRECTORY_SEED = [
  [
    'blog_bns_103_law',
    'BNS Section 103 Explained: Murder Definition & Punishment vs IPC',
    'Law',
    'law',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    'blogs/law/bns-section-103-murder-punishment-explained.html',
    'Complete legal breakdown of Section 103 of Bharatiya Nyaya Sanhita 2023. Key differences from IPC 302, mob lynching provisions, and landmark constitutional principles.',
    1,
    'TRUE',
    1000,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Satyam Thakur'
  ],
  [
    'blog_class10_real_numbers',
    'Class 10 Real Numbers Revision Notes: Formulas & Solved Exemplar Questions',
    'Notes',
    'notes',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    'blogs/notes/class-10-real-numbers-revision-notes.html',
    'Complete chapter notes for CBSE Class 10 Chapter 1. Fundamental Theorem of Arithmetic, irrationality proofs, HCF-LCM shortcuts, and printable PDF cheat sheet.',
    2,
    'TRUE',
    2,
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
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
    'Mendorbit'
  ]
];

// -------------------------------------------------------------
// Spreadsheet Triggers & Custom Menu
// -------------------------------------------------------------
function onOpen() {
  try {
    initializeAllTabs();
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('📊 Mendorbit')
      .addItem('⚡ Sync Summary from Directory', 'recompileSummaryTab')
      .addItem('🧹 Clean Dummy & Duplicate Blogs', 'purgeGarbageBlogs')
      .addItem('✨ Reset & Rebuild Fresh Clean Sheet', 'resetToStandardBaseline')
      .addToUi();
  } catch (e) {}
}

function initializeAllTabs() {
  getDirectorySheet();
  getSummarySheet();
  getStreamSheet();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('All 3 Tabs (Blog_Directory, Blog_Summary, Live_Views_Stream) Active & Verified!', 'Mendorbit');
  } catch (e) {}
}

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
  const sheet = getOrCreateSheet(SHEET_NAMES.DIRECTORY, DIRECTORY_HEADERS, '#0f172a');
  if (sheet.getLastRow() <= 1) {
    for (let i = 0; i < DEFAULT_DIRECTORY_SEED.length; i++) {
      sheet.appendRow(DEFAULT_DIRECTORY_SEED[i]);
    }
  }
  return sheet;
}

function getSummarySheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.SUMMARY, DIRECTORY_HEADERS, '#ea580c');
  if (sheet.getLastRow() <= 1) {
    for (let i = 0; i < DEFAULT_DIRECTORY_SEED.length; i++) {
      sheet.appendRow(DEFAULT_DIRECTORY_SEED[i]);
    }
  }
  return sheet;
}

function getStreamSheet() {
  return getOrCreateSheet(SHEET_NAMES.STREAM, STREAM_HEADERS, '#0f172a');
}

// -------------------------------------------------------------
// Reset to Pure Clean Baseline (Erases all test/dummy data)
// -------------------------------------------------------------
function resetToStandardBaseline() {
  const dirSheet = getDirectorySheet();
  dirSheet.clear();
  dirSheet.appendRow(DIRECTORY_HEADERS);
  dirSheet.setFrozenRows(1);
  const dRange = dirSheet.getRange(1, 1, 1, DIRECTORY_HEADERS.length);
  dRange.setBackground('#0f172a');
  dRange.setFontColor('#ffffff');
  dRange.setFontWeight('bold');

  for (let i = 0; i < DEFAULT_DIRECTORY_SEED.length; i++) {
    dirSheet.appendRow(DEFAULT_DIRECTORY_SEED[i]);
  }

  const sumSheet = getSummarySheet();
  sumSheet.clear();
  sumSheet.appendRow(DIRECTORY_HEADERS);
  sumSheet.setFrozenRows(1);
  const sRange = sumSheet.getRange(1, 1, 1, DIRECTORY_HEADERS.length);
  sRange.setBackground('#ea580c');
  sRange.setFontColor('#ffffff');
  sRange.setFontWeight('bold');

  for (let j = 0; j < DEFAULT_DIRECTORY_SEED.length; j++) {
    sumSheet.appendRow(DEFAULT_DIRECTORY_SEED[j]);
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Cleaned & Rebuilt Directory & Summary with 12 Genuine Articles!', 'Mendorbit');
  } catch (e) {}
}

// -------------------------------------------------------------
// Recompile Blog_Summary from Blog_Directory (Single Source of Truth)
// -------------------------------------------------------------
function recompileSummaryTab() {
  const dirSheet = getDirectorySheet();
  const summarySheet = getSummarySheet();
  const lastDir = dirSheet.getLastRow();

  if (lastDir <= 1) {
    resetToStandardBaseline();
    return;
  }

  const dirData = dirSheet.getRange(2, 1, lastDir - 1, DIRECTORY_HEADERS.length).getValues();
  const cleanMap = new Map();

  for (let r = 0; r < dirData.length; r++) {
    const row = dirData[r];
    const id = String(row[0] || '').trim();
    const title = String(row[1] || '').trim();
    const link = String(row[5] || '').trim().toLowerCase().replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');

    // Skip garbage/test rows or duplicate headers
    if (!id || !title || title === id || id === 'Blog ID' || title === 'Title' || /^blog_\d{10,}$/i.test(title)) continue;

    // Deduplicate by canonical ID or unique link
    const key = (link && link !== 'blog.html' && link !== 'notes.html') ? link : id;

    if (cleanMap.has(key)) {
      const existing = cleanMap.get(key);
      const higherViews = Math.max(parseInt(existing[9] || 0, 10), parseInt(row[9] || 0, 10));
      row[9] = higherViews;
      if (!row[4] && existing[4]) row[4] = existing[4]; // preserve poster
      cleanMap.set(key, row);
    } else {
      cleanMap.set(key, row);
    }
  }

  // Clear Summary and write fresh clean compiled data
  summarySheet.clear();
  summarySheet.appendRow(DIRECTORY_HEADERS);
  summarySheet.setFrozenRows(1);
  const headerRange = summarySheet.getRange(1, 1, 1, DIRECTORY_HEADERS.length);
  headerRange.setBackground('#ea580c');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');

  const rowsToWrite = Array.from(cleanMap.values());
  for (let i = 0; i < rowsToWrite.length; i++) {
    summarySheet.appendRow(rowsToWrite[i]);
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Blog_Summary successfully synced (' + rowsToWrite.length + ' articles)!', 'Mendorbit');
  } catch (e) {}
}

function purgeGarbageBlogs() {
  const dirSheet = getDirectorySheet();
  let cleaned = 0;

  const lastDir = dirSheet.getLastRow();
  if (lastDir > 1) {
    const dData = dirSheet.getRange(2, 1, lastDir - 1, 6).getValues();
    const seenLinks = new Set();
    const seenIds = new Set();
    for (let r = dData.length - 1; r >= 0; r--) {
      const id = String(dData[r][0] || '').trim();
      const t = String(dData[r][1] || '').trim();
      const link = String(dData[r][5] || '').trim().toLowerCase().replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');

      if (/^blog_\d{10,}$/i.test(id) || /^blog_\d{10,}$/i.test(t) || !t || t === id) {
        dirSheet.deleteRow(r + 2);
        cleaned++;
        continue;
      }

      if (seenIds.has(id) || (link && link !== 'blog.html' && link !== 'notes.html' && seenLinks.has(link))) {
        dirSheet.deleteRow(r + 2);
        cleaned++;
        continue;
      }
      seenIds.add(id);
      if (link && link !== 'blog.html' && link !== 'notes.html') seenLinks.add(link);
    }
  }

  recompileSummaryTab();

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Purged ' + cleaned + ' dummy/duplicate blogs & recompiled Blog_Summary.', 'Mendorbit');
  } catch (e) {}
}

// -------------------------------------------------------------
// Unified Blog Saver (Executes for both POST and GET)
// -------------------------------------------------------------
function handleSaveBlog(payload) {
  const dirSheet = getDirectorySheet();
  const summarySheet = getSummarySheet();

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
  const displayTime = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');

  // 1. Search & Update in Blog_Directory
  const lastDir = dirSheet.getLastRow();
  let foundDirIndex = -1;

  if (lastDir > 1) {
    const dirData = dirSheet.getRange(2, 1, lastDir - 1, 6).getValues();
    for (let r = 0; r < dirData.length; r++) {
      const rowId = String(dirData[r][0]).trim();
      const rowLink = String(dirData[r][5]).trim();
      if (rowId === blogId || (link && rowLink && rowLink === link)) {
        foundDirIndex = r + 2;
        break;
      }
    }
  }

  if (foundDirIndex > 0) {
    if (title) dirSheet.getRange(foundDirIndex, 2).setValue(title);
    if (category) dirSheet.getRange(foundDirIndex, 3).setValue(category);
    if (categorySlug) dirSheet.getRange(foundDirIndex, 4).setValue(categorySlug);
    if (posterImageUrl !== undefined) dirSheet.getRange(foundDirIndex, 5).setValue(posterImageUrl);
    if (link) dirSheet.getRange(foundDirIndex, 6).setValue(link);
    if (description !== undefined) dirSheet.getRange(foundDirIndex, 7).setValue(description);
    if (payload.order !== undefined) dirSheet.getRange(foundDirIndex, 8).setValue(order);
    if (payload.active !== undefined) dirSheet.getRange(foundDirIndex, 9).setValue(active);
    if (payload.views !== undefined) dirSheet.getRange(foundDirIndex, 10).setValue(views);
    dirSheet.getRange(foundDirIndex, 11).setValue(displayTime);
    if (author) dirSheet.getRange(foundDirIndex, 12).setValue(author);
  } else {
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
      author
    ]);
  }

  // 2. Automatically sync into Blog_Summary simultaneously
  const lastSum = summarySheet.getLastRow();
  let foundSumIndex = -1;

  if (lastSum > 1) {
    const sumData = summarySheet.getRange(2, 1, lastSum - 1, 6).getValues();
    for (let s = 0; s < sumData.length; s++) {
      const sId = String(sumData[s][0]).trim();
      const sLink = String(sumData[s][5]).trim();
      if (sId === blogId || (link && sLink && sLink === link)) {
        foundSumIndex = s + 2;
        break;
      }
    }
  }

  if (foundSumIndex > 0) {
    if (title) summarySheet.getRange(foundSumIndex, 2).setValue(title);
    if (category) summarySheet.getRange(foundSumIndex, 3).setValue(category);
    if (categorySlug) summarySheet.getRange(foundSumIndex, 4).setValue(categorySlug);
    if (posterImageUrl !== undefined) summarySheet.getRange(foundSumIndex, 5).setValue(posterImageUrl);
    if (link) summarySheet.getRange(foundSumIndex, 6).setValue(link);
    if (description !== undefined) summarySheet.getRange(foundSumIndex, 7).setValue(description);
    if (payload.order !== undefined) summarySheet.getRange(foundSumIndex, 8).setValue(order);
    if (payload.active !== undefined) summarySheet.getRange(foundSumIndex, 9).setValue(active);
    if (payload.views !== undefined) summarySheet.getRange(foundSumIndex, 10).setValue(views);
    summarySheet.getRange(foundSumIndex, 11).setValue(displayTime);
    if (author) summarySheet.getRange(foundSumIndex, 12).setValue(author);
  } else {
    summarySheet.appendRow([
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
      author
    ]);
  }

  return createJsonResponse({
    status: 'success',
    message: 'Blog saved successfully in Directory & Summary',
    blogId: blogId,
    author: author,
    title: title,
    views: views
  });
}

// -------------------------------------------------------------
// POST Request: Direct Admin Management + Real-Time Telemetry
// -------------------------------------------------------------
function doPost(e) {
  try {
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

    // 1. Save Blog
    if (action === 'save_blog') {
      return handleSaveBlog(payload);
    }

    // 2. Toggle Status
    if (action === 'toggle_blog_status') {
      const blogId = String(payload.blogId || payload.id || '').trim();
      const newActive = (payload.active === false || String(payload.active) === 'false') ? 'FALSE' : 'TRUE';
      
      const dirSheet = getDirectorySheet();
      const lastDir = dirSheet.getLastRow();
      if (lastDir > 1) {
        const dIds = dirSheet.getRange(2, 1, lastDir - 1, 1).getValues();
        for (let r = 0; r < dIds.length; r++) {
          if (String(dIds[r][0]).trim() === blogId) {
            dirSheet.getRange(r + 2, 9).setValue(newActive);
            dirSheet.getRange(r + 2, 11).setValue(displayTime);
            break;
          }
        }
      }

      const sumSheet = getSummarySheet();
      const lastSum = sumSheet.getLastRow();
      if (lastSum > 1) {
        const sIds = sumSheet.getRange(2, 1, lastSum - 1, 1).getValues();
        for (let s = 0; s < sIds.length; s++) {
          if (String(sIds[s][0]).trim() === blogId) {
            sumSheet.getRange(s + 2, 9).setValue(newActive);
            sumSheet.getRange(s + 2, 11).setValue(displayTime);
            break;
          }
        }
      }

      return createJsonResponse({ status: 'success', blogId: blogId, active: newActive });
    }

    // 3. Delete Blog (Purge across all 3 tabs)
    if (action === 'delete_blog') {
      const blogId = String(payload.blogId || payload.id || '').trim();
      const dirSheet = getDirectorySheet();
      const sumSheet = getSummarySheet();
      const streamSheet = getStreamSheet();
      let delTitle = '';
      let delLink = '';

      // Purge from Directory
      const lastDir = dirSheet.getLastRow();
      if (lastDir > 1) {
        const dirData = dirSheet.getRange(2, 1, lastDir - 1, 6).getValues();
        for (let r = dirData.length - 1; r >= 0; r--) {
          if (String(dirData[r][0]).trim() === blogId) {
            delTitle = String(dirData[r][1]).trim();
            delLink = String(dirData[r][5]).trim();
            dirSheet.deleteRow(r + 2);
          }
        }
      }

      // Purge from Summary
      const lastSum = sumSheet.getLastRow();
      if (lastSum > 1) {
        const sumData = sumSheet.getRange(2, 1, lastSum - 1, 6).getValues();
        for (let s = sumData.length - 1; s >= 0; s--) {
          const sId = String(sumData[s][0]).trim();
          const sLink = String(sumData[s][5]).trim();
          if (sId === blogId || (delLink && sLink && sLink === delLink)) {
            sumSheet.deleteRow(s + 2);
          }
        }
      }

      // Purge from Stream logs
      const lastStream = streamSheet.getLastRow();
      if (lastStream > 1) {
        const stData = streamSheet.getRange(2, 1, lastStream - 1, 8).getValues();
        for (let t = stData.length - 1; t >= 0; t--) {
          const stTitle = String(stData[t][2]).trim();
          const stUrl = String(stData[t][7]).trim();
          if ((delTitle && stTitle && stTitle === delTitle) || (delLink && stUrl && stUrl.includes(delLink)) || (blogId && stUrl && stUrl.includes(blogId))) {
            streamSheet.deleteRow(t + 2);
          }
        }
      }

      return createJsonResponse({ status: 'success', message: 'Purged across all sheets', blogId: blogId });
    }

    // 4. Record Real View Event
    if (action === 'record_blog_view' || payload.type === 'blog_view' || payload.sheet === 'BlogViews') {
      const blogId = String(payload.blogId || payload.id || 'general').trim();
      const blogTitle = String(payload.blogTitle || payload.title || blogId).trim();
      const category = String(payload.category || 'Article').trim();
      const device = String(payload.device || 'Desktop').trim();
      const city = String(payload.city || 'India').trim();
      const referrer = String(payload.referrer || payload.source || 'Direct Link').trim();
      const pageUrl = String(payload.pageUrl || payload.url || '').trim();
      const visitorId = String(payload.visitorId || 'v_' + Math.random().toString(36).substring(2, 8)).trim();

      // Append to Stream
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

      // Increment in Summary
      let updatedTotal = 1;
      const sumSheet = getSummarySheet();
      const lastSum = sumSheet.getLastRow();
      let sumRow = -1;

      if (lastSum > 1) {
        const sumData = sumSheet.getRange(2, 1, lastSum - 1, 6).getValues();
        for (let i = 0; i < sumData.length; i++) {
          const sId = String(sumData[i][0]).trim();
          const sLink = String(sumData[i][5]).trim();
          if (sId === blogId || (payload.slug && sId === payload.slug) || (pageUrl && sLink && pageUrl.includes(sLink)) || (payload.slug && sLink && sLink.includes(payload.slug))) {
            sumRow = i + 2;
            break;
          }
        }
      }

      if (sumRow > 0) {
        const curV = parseInt(sumSheet.getRange(sumRow, 10).getValue() || 0, 10);
        updatedTotal = curV + 1;
        if (!sumSheet.getRange(sumRow, 1).getValue()) {
          sumSheet.getRange(sumRow, 1).setValue(blogId);
        }
        sumSheet.getRange(sumRow, 10).setValue(updatedTotal);
        sumSheet.getRange(sumRow, 11).setValue(displayTime);
      } else {
        sumSheet.appendRow([
          blogId,
          blogTitle,
          category,
          category.toLowerCase(),
          '',
          pageUrl,
          '',
          99,
          'TRUE',
          1,
          displayTime,
          'Mendorbit'
        ]);
      }

      // Also increment in Directory
      const dirSheet = getDirectorySheet();
      const lastDir = dirSheet.getLastRow();
      if (lastDir > 1) {
        const dirData = dirSheet.getRange(2, 1, lastDir - 1, 10).getValues();
        for (let d = 0; d < dirData.length; d++) {
          const rId = String(dirData[d][0]).trim();
          const rLink = String(dirData[d][5]).trim();
          if (rId === blogId || (payload.slug && rId.includes(payload.slug)) || (pageUrl && rLink && pageUrl.includes(rLink)) || (payload.slug && rLink && rLink.includes(payload.slug))) {
            const dV = parseInt(dirData[d][9] || 0, 10);
            dirSheet.getRange(d + 2, 10).setValue(dV + 1);
            dirSheet.getRange(d + 2, 11).setValue(displayTime);
            break;
          }
        }
      }

      return createJsonResponse({
        status: 'success',
        message: 'View registered in stream, summary & directory',
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
// GET Request: Blog Summary Feed & Full Audience Analytics
// -------------------------------------------------------------
function doGet(e) {
  try {
    getDirectorySheet();
    const sumSheet = getSummarySheet();
    const streamSheet = getStreamSheet();

    const params = (e && e.parameter) ? e.parameter : {};
    const action = String(params.action || '').trim();

    // GET Save Blog Fallback
    if (action === 'save_blog') {
      return handleSaveBlog(params);
    }

    // Force Recompile Summary
    if (action === 'recompile_summary') {
      recompileSummaryTab();
      return createJsonResponse({ status: 'success', message: 'Summary recompiled' });
    }

    // Reset Clean Baseline
    if (action === 'reset_baseline') {
      resetToStandardBaseline();
      return createJsonResponse({ status: 'success', message: 'Reset to standard clean baseline' });
    }

    // 1. SERVE FULL PRODUCTION SUMMARY DIRECTLY TO FRONTEND & ADMIN
    if (action === 'get_blogs_directory' || action === 'get_directory' || action === 'get_summary') {
      const lastRow = sumSheet.getLastRow();
      const blogsList = [];

      if (lastRow > 1) {
        const data = sumSheet.getRange(2, 1, lastRow - 1, DIRECTORY_HEADERS.length).getValues();
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const id = String(row[0] || '').trim();
          const title = String(row[1] || '').trim();

          if (id && title && title !== id && id !== 'Blog ID' && title !== 'Title' && !/^blog_\d{10,}$/i.test(title)) {
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
              author: String(row[11] || 'Mendorbit')
            });
          }
        }
      }

      blogsList.sort(function(a, b) { return (a.order || 99) - (b.order || 99); });

      return createJsonResponse({
        status: 'success',
        source: 'Blog_Summary',
        count: blogsList.length,
        blogs: blogsList,
        fetchedAt: Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a')
      });
    }

    // 2. AUDIENCE ANALYTICS (for admin/analytics.html)
    const lastSummaryRow = sumSheet.getLastRow();
    const viewsMap = {};
    const blogList = [];

    if (lastSummaryRow > 1) {
      const sumRows = sumSheet.getRange(2, 1, lastSummaryRow - 1, DIRECTORY_HEADERS.length).getValues();
      for (let i = 0; i < sumRows.length; i++) {
        const row = sumRows[i];
        const id = String(row[0] || '').trim();
        const title = String(row[1] || '').trim();
        const views = parseInt(row[9] || 0, 10);
        if (id && title && title !== id && id !== 'Blog ID' && title !== 'Title' && !/^blog_\d{10,}$/i.test(title)) {
          viewsMap[id] = views;
          blogList.push({
            id: id,
            title: title,
            category: String(row[2] || 'General'),
            views: views,
            lastViewed: String(row[10] || ''),
            link: String(row[5] || '')
          });
        }
      }
    }

    // Audience breakdown from Stream
    const lastStreamRow = streamSheet.getLastRow();
    const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const cityCounts = {};
    const recentEvents = [];

    if (lastStreamRow > 1) {
      const streamRows = streamSheet.getRange(2, 1, lastStreamRow - 1, STREAM_HEADERS.length).getValues();
      for (let j = streamRows.length - 1; j >= 0; j--) {
        const row = streamRows[j];
        const dev = String(row[4] || 'Desktop').trim();
        const city = String(row[5] || 'India').trim();

        if (dev.includes('Mobile')) deviceCounts.Mobile++;
        else if (dev.includes('Tablet')) deviceCounts.Tablet++;
        else deviceCounts.Desktop++;

        if (city && city !== 'India') {
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        }

        if (recentEvents.length < 30) {
          recentEvents.push({
            time: row[0],
            title: row[2],
            category: row[3],
            device: dev,
            city: city,
            referrer: row[6]
          });
        }
      }
    }

    const topCities = Object.keys(cityCounts)
      .map(k => ({ city: k, count: cityCounts[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalViews = Object.values(viewsMap).reduce((a, b) => a + b, 0);

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

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
