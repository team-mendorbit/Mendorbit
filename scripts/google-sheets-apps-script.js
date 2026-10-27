/**
 * ==============================================================================
 * Mendorbit Enterprise Telemetry & Security Audit Ledger
 * Google Apps Script Webhook Engine
 * ==============================================================================
 * 
 * Instructions for Setup:
 * 1. Open Google Sheets (create a new blank spreadsheet, e.g. "Mendorbit Analytics & Logs").
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any default code in Code.gs, paste this entire file contents, and click "Save" (Ctrl+S).
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Select type: "Web app".
 * 6. Configuration:
 *    - Description: "Mendorbit Telemetry & Audit API"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (Required for web visitors & admin console)
 * 7. Click "Deploy", authorize permissions when prompted, and COPY the "Web app URL".
 * 8. Paste the Web app URL in your Mendorbit Admin Console!
 * ==============================================================================
 */

const SHEET_NAMES = {
  VISITORS: 'Visitor_Analytics',
  AUDIT: 'Audit_Logs'
};

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    
    // Style Header Row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0f172a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment('center');
  }
  return sheet;
}

function getVisitorsSheet() {
  return getOrCreateSheet(SHEET_NAMES.VISITORS, [
    'Timestamp (ISO)',
    'Display Time (IST)',
    'City',
    'State',
    'Country',
    'Device',
    'Browser',
    'Page',
    'Referrer',
    'GPS Coords'
  ]);
}

function getAuditSheet() {
  return getOrCreateSheet(SHEET_NAMES.AUDIT, [
    'Timestamp (ISO)',
    'Display Time (IST)',
    'Staff Email',
    'Role',
    'Action',
    'Details (JSON)',
    'User Agent',
    'Page URL'
  ]);
}

// -------------------------------------------------------------
// Helper: India Date Filter Checker
// -------------------------------------------------------------
function isWithinDateFilter(dateObj, filter) {
  if (!filter || filter === 'all') return true;
  if (!dateObj || isNaN(dateObj.getTime())) return true;

  const now = new Date();
  // Format dates in YYYY-MM-DD in Asia/Kolkata
  const todayStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  const targetStr = Utilities.formatDate(dateObj, 'Asia/Kolkata', 'yyyy-MM-dd');

  if (filter === 'today') {
    return targetStr === todayStr;
  }

  if (filter === 'yesterday') {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = Utilities.formatDate(yesterday, 'Asia/Kolkata', 'yyyy-MM-dd');
    return targetStr === yesterdayStr;
  }

  if (filter === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return dateObj >= sevenDaysAgo;
  }

  if (filter === '30days' || filter === 'this_month') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return dateObj >= thirtyDaysAgo;
  }

  return true;
}

// -------------------------------------------------------------
// POST Request: Append Log Entries (Visitors or Audit)
// -------------------------------------------------------------
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const type = payload.type || (payload.adminEmail ? 'audit' : 'visitor');
    const nowIso = payload.timestamp || new Date().toISOString();
    const displayTime = payload.displayTime || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');

    if (type === 'audit') {
      const auditSheet = getAuditSheet();
      const detailsStr = typeof payload.details === 'object' ? JSON.stringify(payload.details) : (payload.details || '{}');
      
      auditSheet.appendRow([
        nowIso,
        displayTime,
        payload.adminEmail || 'Unknown',
        payload.adminRole || 'anonymous',
        payload.action || 'EVENT',
        detailsStr,
        payload.userAgent || '',
        payload.url || ''
      ]);

      return createJsonResponse({ status: 'success', message: 'Audit log appended', type: 'audit' });
    } else {
      // Visitor Telemetry
      const visitorSheet = getVisitorsSheet();
      
      visitorSheet.appendRow([
        nowIso,
        displayTime,
        payload.city || 'India',
        payload.state || 'State',
        payload.country || 'India',
        payload.device || 'Desktop',
        payload.browser || 'Browser',
        payload.page || 'index.html',
        payload.referrer || 'Direct',
        payload.gps || ''
      ]);

      return createJsonResponse({ status: 'success', message: 'Visitor telemetry appended', type: 'visitor' });
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// -------------------------------------------------------------
// GET Request: Paginated Fetch with Date Filtering
// -------------------------------------------------------------
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const type = params.type || (params.action === 'get_audit' ? 'audit' : 'visitor');
    const filter = (params.filter || 'all').toLowerCase();
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const search = (params.search || '').toLowerCase().trim();

    if (type === 'audit') {
      return getAuditLogsResponse(filter, page, limit, search);
    } else {
      return getVisitorAnalyticsResponse(filter, page, limit, search);
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// -------------------------------------------------------------
// Visitor Fetch Handler
// -------------------------------------------------------------
function getVisitorAnalyticsResponse(filter, page, limit, search) {
  const sheet = getVisitorsSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return createJsonResponse({
      status: 'success',
      type: 'visitor',
      total: 0,
      page: page,
      limit: limit,
      hasMore: false,
      records: [],
      stats: { totalVisits: 0, topStates: [], topCities: [], mobileCount: 0, desktopCount: 0 }
    });
  }

  // Read all rows (excluding header)
  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  // Reverse so newest records appear first
  data.reverse();

  const stateCounts = {};
  const cityCounts = {};
  let mobileCount = 0;
  let desktopCount = 0;

  const matched = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const timestampStr = row[0];
    const displayTime = row[1];
    const city = String(row[2] || '');
    const state = String(row[3] || '');
    const country = String(row[4] || 'India');
    const device = String(row[5] || 'Desktop');
    const browser = String(row[6] || 'Browser');
    const pageVisited = String(row[7] || 'index.html');
    const referrer = String(row[8] || 'Direct');
    const gps = String(row[9] || '');

    const dateObj = new Date(timestampStr);

    if (!isWithinDateFilter(dateObj, filter)) {
      continue;
    }

    if (search) {
      const matchSearch = city.toLowerCase().includes(search) || 
                          state.toLowerCase().includes(search) || 
                          device.toLowerCase().includes(search) ||
                          pageVisited.toLowerCase().includes(search);
      if (!matchSearch) continue;
    }

    // Stats calculations
    if (state && state !== 'State') stateCounts[state] = (stateCounts[state] || 0) + 1;
    if (city && city !== 'India') cityCounts[city] = (cityCounts[city] || 0) + 1;
    if (device.toLowerCase() === 'mobile') {
      mobileCount++;
    } else {
      desktopCount++;
    }

    matched.push({
      timestamp: timestampStr,
      displayTime: displayTime || timestampStr,
      city: city || 'India',
      state: state || '',
      country: country || 'India',
      device: device || 'Desktop',
      browser: browser || 'Browser',
      page: pageVisited,
      referrer: referrer,
      gps: gps
    });
  }

  const sortedStates = Object.keys(stateCounts).sort((a, b) => stateCounts[b] - stateCounts[a]);
  const sortedCities = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a]);

  const totalMatches = matched.length;
  const startIndex = (page - 1) * limit;
  const pagedRecords = matched.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < totalMatches;

  return createJsonResponse({
    status: 'success',
    type: 'visitor',
    total: totalMatches,
    page: page,
    limit: limit,
    hasMore: hasMore,
    records: pagedRecords,
    stats: {
      totalVisits: totalMatches,
      topStates: sortedStates.slice(0, 3),
      topCities: sortedCities.slice(0, 3),
      mobileCount: mobileCount,
      desktopCount: desktopCount
    }
  });
}

// -------------------------------------------------------------
// Audit Log Fetch Handler
// -------------------------------------------------------------
function getAuditLogsResponse(filter, page, limit, search) {
  const sheet = getAuditSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return createJsonResponse({
      status: 'success',
      type: 'audit',
      total: 0,
      page: page,
      limit: limit,
      hasMore: false,
      records: [],
      stats: { totalEvents: 0, logins: 0, blocked: 0 }
    });
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  data.reverse();

  let loginCount = 0;
  let blockedCount = 0;
  const matched = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const timestampStr = row[0];
    const displayTime = row[1];
    const adminEmail = String(row[2] || '');
    const adminRole = String(row[3] || '');
    const action = String(row[4] || '');
    const detailsRaw = String(row[5] || '{}');
    const userAgent = String(row[6] || '');
    const url = String(row[7] || '');

    const dateObj = new Date(timestampStr);

    if (!isWithinDateFilter(dateObj, filter)) {
      continue;
    }

    if (search) {
      const matchSearch = adminEmail.toLowerCase().includes(search) || 
                          action.toLowerCase().includes(search) || 
                          detailsRaw.toLowerCase().includes(search);
      if (!matchSearch) continue;
    }

    if (action.includes('LOGIN')) loginCount++;
    if (action.includes('DENIED') || action.includes('BLOCK')) blockedCount++;

    let detailsParsed = {};
    try {
      detailsParsed = JSON.parse(detailsRaw);
    } catch (e) {
      detailsParsed = { note: detailsRaw };
    }

    matched.push({
      timestamp: timestampStr,
      displayTime: displayTime || timestampStr,
      adminEmail: adminEmail,
      adminRole: adminRole,
      action: action,
      details: detailsParsed,
      userAgent: userAgent,
      url: url
    });
  }

  const totalMatches = matched.length;
  const startIndex = (page - 1) * limit;
  const pagedRecords = matched.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < totalMatches;

  return createJsonResponse({
    status: 'success',
    type: 'audit',
    total: totalMatches,
    page: page,
    limit: limit,
    hasMore: hasMore,
    records: pagedRecords,
    stats: {
      totalEvents: totalMatches,
      logins: loginCount,
      blocked: blockedCount
    }
  });
}

// -------------------------------------------------------------
// JSON Output Helper with CORS
// -------------------------------------------------------------
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
