/**
 * ============================================================================
 * MENDORBIT DEDICATED VISITOR TELEMETRY & AUDIT ENGINE (v3.0.0)
 * ============================================================================
 * Zero Firebase Quota - 100% Free Google Sheets Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets -> Create a new spreadsheet (e.g. "Mendorbit Visitor Telemetry")
 * 2. Rename 'Sheet1' to 'Visitor_Logs'
 * 3. Extensions -> Apps Script -> Delete existing code & paste this entire script.
 * 4. Run 'setupSheetHeaders()' once from the toolbar to create the exact columns.
 * 5. Click Deploy -> New deployment -> Select type: Web app
 *    - Description: "Mendorbit Telemetry Webhook v3"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click Deploy, copy the Web App URL, and paste it into Mendorbit.
 * ============================================================================
 */

function setupSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Visitor_Logs');
  if (!sheet) {
    sheet = ss.insertSheet('Visitor_Logs');
  }

  const headers = [
    'Timestamp',
    'Display Time (IST)',
    'Visitor ID',
    'City',
    'State',
    'Country',
    'GPS Coordinates',
    'Device Type',
    'Browser',
    'Target Page',
    'Referrer URL',
    'Raw Payload'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f1f5f9');
  sheet.setFrozenRows(1);

  // Auto create Daily_Summary sheet
  let summarySheet = ss.getSheetByName('Daily_Summary');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Daily_Summary');
    const sumHeaders = ['Date', 'Unique Visitors', 'Total Hits', 'Top Cities', 'Mobile %', 'Desktop %'];
    summarySheet.getRange(1, 1, 1, sumHeaders.length).setValues([sumHeaders]);
    summarySheet.getRange(1, 1, 1, sumHeaders.length).setFontWeight('bold').setBackground('#f1f5f9');
    summarySheet.setFrozenRows(1);
  }

  Logger.log('Mendorbit sheets setup complete.');
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Visitor_Logs');
    if (!sheet) {
      sheet = ss.insertSheet('Visitor_Logs');
      setupSheetHeaders();
    }

    const now = new Date();
    const istTime = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    const row = [
      data.timestamp || now.toISOString(),
      data.displayTime || istTime,
      data.visitorId || 'ANON',
      data.city || 'India',
      data.state || 'State',
      data.country || 'India',
      data.gps || '',
      data.device || 'Desktop',
      data.browser || 'Browser',
      data.page || 'index.html',
      data.referrer || 'Direct',
      JSON.stringify(data)
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Telemetry logged' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_visitors';
    const limit = (e && e.parameter && e.parameter.limit) ? parseInt(e.parameter.limit, 10) : 350;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Visitor_Logs');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', records: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', records: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const fetchRows = Math.min(limit, lastRow - 1);
    const startRow = Math.max(2, lastRow - fetchRows + 1);
    const data = sheet.getRange(startRow, 1, fetchRows, 11).getValues();

    const records = [];
    for (let i = data.length - 1; i >= 0; i--) {
      const r = data[i];
      if (r[0] || r[1]) {
        records.push({
          timestamp: r[0],
          displayTime: r[1],
          visitorId: r[2],
          city: r[3],
          state: r[4],
          country: r[5],
          gps: r[6],
          device: r[7],
          browser: r[8],
          page: r[9],
          referrer: r[10]
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      totalRecords: lastRow - 1,
      records: records
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
