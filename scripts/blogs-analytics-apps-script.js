/**
 * ==============================================================================
 * Mendorbit Dedicated Blogs Analytics & Real-Time View Engine
 * Google Apps Script Webhook Engine (Dedicated Spreadsheet)
 * ==============================================================================
 * 
 * 1-MINUTE SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) and create a brand new blank spreadsheet.
 * 2. Name it: "Mendorbit Blogs Analytics".
 * 3. In the top menu, click "Extensions" (एक्सटेंशन) -> "Apps Script".
 * 4. Delete all existing code in Code.gs, paste this ENTIRE file code, and press Ctrl + S.
 * 5. Click "Deploy" (top right blue button) -> "New deployment".
 * 6. Click the gear icon (Select type) -> Select "Web app".
 * 7. Configuration:
 *    - Description: "Mendorbit Dedicated Blogs Analytics Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (महत्वपूर्ण: taaki sabhi visitors ke views track ho sakein)
 * 8. Click "Deploy", approve permissions ("Advanced" -> "Go to ... (unsafe)" -> "Allow").
 * 9. Copy the "Web app URL" (it ends with /exec).
 * 10. Open Mendorbit Admin Panel -> Blogs tab -> Click "Connect Sheet" or paste the URL!
 * ==============================================================================
 */

const SHEET_NAMES = {
  SUMMARY: 'Blog_Summary',
  STREAM: 'Live_Views_Stream'
};

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
    
    // Header Style
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(headerBgColor || '#ea580c');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment('center');
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
    'Blog ID / Slug',
    'Device',
    'Browser',
    'City / Region',
    'Referrer',
    'Page URL',
    'Visitor ID'
  ], '#0f172a');
}

// -------------------------------------------------------------
// POST Request: Ingest Direct & Catalog Views
// -------------------------------------------------------------
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const blogId = String(payload.blogId || payload.slug || 'unknown').trim();
    const blogTitle = String(payload.blogTitle || payload.title || blogId).trim();
    const category = String(payload.category || 'General').trim();
    const pageUrl = String(payload.pageUrl || payload.url || '').trim();
    const visitorId = String(payload.visitorId || 'ANON').trim();
    const device = String(payload.device || 'Desktop').trim();
    const browser = String(payload.browser || 'Browser').trim();
    const city = String(payload.city || payload.location || 'India').trim();
    const referrer = String(payload.referrer || 'Direct Link').trim();

    const now = new Date();
    const nowIso = payload.timestamp || now.toISOString();
    const displayTime = Utilities.formatDate(now, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');

    // 1. Append detailed event to Live_Views_Stream
    const streamSheet = getStreamSheet();
    streamSheet.appendRow([
      nowIso,
      displayTime,
      blogTitle,
      category,
      blogId,
      device,
      browser,
      city,
      referrer,
      pageUrl,
      visitorId
    ]);

    // 2. Automatically register or update Blog_Summary
    const summarySheet = getSummarySheet();
    const lastRow = summarySheet.getLastRow();
    let updatedTotal = 1;
    let found = false;

    if (lastRow > 1) {
      const data = summarySheet.getRange(2, 1, lastRow - 1, 6).getValues();
      for (let i = 0; i < data.length; i++) {
        const rowId = String(data[i][0]).trim();
        const rowUrl = String(data[i][5]).trim();
        // Match by blogId or URL
        if (rowId === blogId || (pageUrl && rowUrl && rowUrl === pageUrl)) {
          const currentViews = parseInt(data[i][3] || 0, 10);
          updatedTotal = currentViews + 1;
          summarySheet.getRange(i + 2, 4).setValue(updatedTotal);
          summarySheet.getRange(i + 2, 5).setValue(displayTime);
          if (blogTitle && data[i][1] !== blogTitle) summarySheet.getRange(i + 2, 2).setValue(blogTitle);
          if (category && data[i][2] !== category) summarySheet.getRange(i + 2, 3).setValue(category);
          if (pageUrl && !data[i][5]) summarySheet.getRange(i + 2, 6).setValue(pageUrl);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      summarySheet.appendRow([
        blogId,
        blogTitle,
        category,
        1,
        displayTime,
        pageUrl
      ]);
    }

    return createJsonResponse({
      status: 'success',
      message: 'View registered in dedicated blogs sheet',
      blogId: blogId,
      totalViews: updatedTotal
    });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// -------------------------------------------------------------
// GET Request: Admin Panel Live Analytics & Directory Feed
// -------------------------------------------------------------
function doGet(e) {
  try {
    const summarySheet = getSummarySheet();
    const lastSummaryRow = summarySheet.getLastRow();

    const viewsMap = {};
    const blogList = [];
    let totalViews = 0;

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
          blogList.push({
            id: id,
            title: title,
            category: cat,
            views: views,
            lastViewed: lastViewed,
            link: link
          });
        }
      }
    }

    // Sort blogs by views descending
    blogList.sort(function(a, b) { return b.views - a.views; });

    // Stream Analytics (Recent 60 events for device, city & stream)
    const streamSheet = getStreamSheet();
    const lastStreamRow = streamSheet.getLastRow();
    const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const cityCounts = {};
    const recentEvents = [];

    if (lastStreamRow > 1) {
      const streamCount = Math.min(lastStreamRow - 1, 100);
      const streamStart = Math.max(2, lastStreamRow - streamCount + 1);
      const streamData = streamSheet.getRange(streamStart, 1, streamCount, 11).getValues();
      streamData.reverse(); // Newest first

      for (let j = 0; j < streamData.length; j++) {
        const row = streamData[j];
        const dev = String(row[5] || 'Desktop');
        if (dev.includes('Mobile')) deviceCounts.Mobile++;
        else if (dev.includes('Tablet')) deviceCounts.Tablet++;
        else deviceCounts.Desktop++;

        const city = String(row[7] || 'India').trim();
        if (city && city !== 'India' && city !== 'State') {
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        }

        if (recentEvents.length < 30) {
          recentEvents.push({
            time: row[1] || row[0],
            title: row[2],
            category: row[3],
            device: dev,
            city: city,
            referrer: row[8]
          });
        }
      }
    }

    // Top Cities
    const topCities = Object.keys(cityCounts).map(function(c) {
      return { city: c, count: cityCounts[c] };
    }).sort(function(a, b) { return b.count - a.count; }).slice(0, 6);

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

// -------------------------------------------------------------
// Helper: JSON Output
// -------------------------------------------------------------
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
