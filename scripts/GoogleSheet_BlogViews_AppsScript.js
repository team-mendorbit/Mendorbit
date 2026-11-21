/**
 * ==============================================================================
 * MENDORBIT REAL-TIME BLOG VIEWS GOOGLE APPS SCRIPT ENGINE (v4.0.0)
 * ==============================================================================
 * 
 * 100% Free & Unlimited Real-Time View Counter for Mendorbit Blogs.
 * ZERO Firebase Read/Write Quotas Used!
 *
 * HOW TO SET UP (Takes 2 Minutes):
 * 1. Open Google Sheets (https://sheets.new) and name the spreadsheet:
 *    "Mendorbit_Blog_Views_Live"
 * 2. Click "Extensions" -> "Apps Script" in top menu.
 * 3. Delete any default code inside the editor, and PASTE THIS ENTIRE SCRIPT.
 * 4. (Optional) Run the function 'setupInitialSheet' from the dropdown and click 'Run'.
 *    This will automatically create the sheet headers and initial blog entries!
 * 5. Click "Deploy" -> "New deployment".
 * 6. Under "Select type" click the gear icon (⚙) -> choose "Web app".
 * 7. Set:
 *    - Description: "Mendorbit Live Blog Views Engine"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (IMPORTANT! Allows your website visitors to log views)
 * 8. Click "Deploy", authorize permissions when prompted, and COPY the Web App URL:
 *    (Looks like: https://script.google.com/macros/s/AKfy.../exec)
 * 9. Paste this URL in your Admin Panel -> Blogs & Notes -> "Sheet Webhook Settings",
 *    or set it in assets/js/blogs-data.js & assets/js/blog-tracker.js.
 * ==============================================================================
 */

const SHEET_NAME = "BlogViews";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Slug / ID", "Blog Title", "Total Views", "Category", "Last Viewed At", "Created At"]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f1f5f9");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// One-Click Initializer
function setupInitialSheet() {
  const sheet = getOrCreateSheet();
  const initialBlogs = [
    ["bns-section-103-murder-punishment-explained", "BNS Section 103 Explained: Murder Definition & Punishment vs IPC", 1000, "Law", new Date(), new Date()],
    ["class-10-real-numbers-revision-notes", "Class 10 Real Numbers Revision Notes: Formulas & Solved Exemplar Questions", 240, "Notes", new Date(), new Date()],
    ["class-10-maths-science-strategy", "Class 10 Board Exam: How Weak Students Can Score 90%+ in Maths & Science", 380, "Strategy", new Date(), new Date()],
    ["ssc-cgl-beginner-guide-zero-to-hero", "SSC CGL 2026 Beginner Guide: Complete Syllabus & 6-Month Study Plan", 510, "Strategy", new Date(), new Date()],
    ["clat-ailet-preparation-basics", "CLAT & AILET 2026: Preparation Strategy, Law School Cutoffs & Reading Habits", 420, "Strategy", new Date(), new Date()],
    ["exam-normalization-reforms-analysis", "Exam Normalization Reforms: How Percentile Scores Work in National Exams", 195, "Editorial", new Date(), new Date()],
    ["ssc-cgl-official-notification-calendar", "SSC CGL 2026 Official Calendar & Revised Exam Pattern Breakdown", 310, "News", new Date(), new Date()],
    ["top-nlus-rankwise-cutoffs-placements", "Top 10 NLUs in India: Rank-wise Cutoffs, Placement Stats & Real Campus Reviews", 640, "Colleges", new Date(), new Date()],
    ["future-of-indian-edtech-case-study", "The Rise, Fall & Future of Online EdTech in India: Deep Dive Case Study", 280, "Case Study", new Date(), new Date()]
  ];

  const existingData = sheet.getDataRange().getValues();
  const existingSlugs = new Set();
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][0]) existingSlugs.add(String(existingData[i][0]).toLowerCase().trim());
  }

  initialBlogs.forEach(row => {
    if (!existingSlugs.has(row[0])) {
      sheet.appendRow(row);
    }
  });

  return "Sheet initialized successfully with " + sheet.getLastRow() + " rows!";
}

// ------------------------------------------------------------------------------
// HTTP GET Handler: supports getting all views and recording view via GET ping
// ------------------------------------------------------------------------------
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || "get_views";

    if (action === "record_view" || action === "view") {
      const slug = cleanSlug(params.slug || params.blogId || params.id);
      const title = params.title || params.blogTitle || slug;
      const category = params.category || "General";
      return handleRecordView(slug, title, category, params.callback);
    }

    // Default: Return all blog views map
    return handleGetViews(params.callback);
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() }, e && e.parameter ? e.parameter.callback : null);
  }
}

// ------------------------------------------------------------------------------
// HTTP POST Handler: handles JSON or form payload
// ------------------------------------------------------------------------------
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || "record_blog_view";
    if (action === "get_views") {
      return handleGetViews();
    }

    const slug = cleanSlug(payload.slug || payload.blogId || payload.id);
    const title = payload.blogTitle || payload.title || slug;
    const category = payload.category || "General";

    return handleRecordView(slug, title, category);
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// ------------------------------------------------------------------------------
// Atomic View Increment (Thread-Safe with LockService)
// ------------------------------------------------------------------------------
function handleRecordView(slug, title, category, callback) {
  if (!slug) {
    return createJsonResponse({ status: "error", message: "Missing slug parameter" }, callback);
  }

  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for concurrent writes to finish
    lock.waitLock(10000);
  } catch (lockErr) {
    return createJsonResponse({ status: "error", message: "Server busy, please retry" }, callback);
  }

  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    let currentViews = 0;

    // Search for existing blog by slug (Case-insensitive)
    for (let i = 1; i < data.length; i++) {
      const cellSlug = String(data[i][0] || "").toLowerCase().trim();
      if (cellSlug === slug) {
        rowIndex = i + 1; // 1-based index in Google Sheets
        currentViews = parseInt(data[i][2] || 0, 10);
        if (isNaN(currentViews)) currentViews = 0;
        break;
      }
    }

    const now = new Date();
    let updatedViews = currentViews + 1;

    if (rowIndex > 0) {
      // Row exists: increment Col C (Views) and update Col E (Last Viewed)
      sheet.getRange(rowIndex, 3).setValue(updatedViews);
      sheet.getRange(rowIndex, 5).setValue(now);
      if (title && title !== slug) {
        sheet.getRange(rowIndex, 2).setValue(title);
      }
    } else {
      // New Article: automatically append row to sheet!
      sheet.appendRow([slug, title || slug, updatedViews, category || "General", now, now]);
    }

    return createJsonResponse({
      status: "success",
      slug: slug,
      views: updatedViews,
      timestamp: now.toISOString()
    }, callback);

  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------------------------
// Return Full Views Map
// ------------------------------------------------------------------------------
function handleGetViews(callback) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const viewsMap = {};
  const blogs = [];
  let totalViews = 0;

  for (let i = 1; i < data.length; i++) {
    const rawSlug = String(data[i][0] || "").trim();
    if (!rawSlug) continue;

    const slug = rawSlug.toLowerCase();
    const title = String(data[i][1] || rawSlug).trim();
    let views = parseInt(data[i][2] || 0, 10);
    if (isNaN(views)) views = 0;

    const category = String(data[i][3] || "General").trim();
    const lastViewed = data[i][4] ? new Date(data[i][4]).toISOString() : null;

    viewsMap[slug] = views;
    viewsMap[rawSlug] = views; // Map both cases for 100% lookup reliability
    totalViews += views;

    blogs.push({
      id: slug,
      slug: slug,
      title: title,
      views: views,
      category: category,
      lastViewed: lastViewed
    });
  }

  return createJsonResponse({
    status: "success",
    totalViews: totalViews,
    totalArticles: blogs.length,
    viewsMap: viewsMap,
    blogs: blogs,
    timestamp: new Date().toISOString()
  }, callback);
}

// ------------------------------------------------------------------------------
// Helper: Clean & Normalize Slug
// ------------------------------------------------------------------------------
function cleanSlug(raw) {
  if (!raw) return "";
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/\.html$/i, "");
  s = s.replace(/^blogs\//i, "");
  s = s.replace(/^(law|notes|strategy|editorial|news|colleges|case-study)\//i, "");
  s = s.replace(/^blog_/i, "");
  return s.trim();
}

// ------------------------------------------------------------------------------
// Helper: Create JSON/JSONP Response with CORS Headers
// ------------------------------------------------------------------------------
function createJsonResponse(data, callback) {
  let outputText = JSON.stringify(data);
  if (callback) {
    outputText = callback + "(" + outputText + ");";
    return ContentService.createTextOutput(outputText).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(outputText).setMimeType(ContentService.MimeType.JSON);
}
