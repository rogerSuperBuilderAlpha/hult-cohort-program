/**
 * Energy Auditor CRM webhook — paste into Apps Script bound to:
 * https://docs.google.com/spreadsheets/d/17F4OcnHXhMEotTYUOlkWw_RiW4WAFewk/edit
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the /exec URL into Vercel CRM_WEBHOOK_URL
 */
function doPost(e) {
  const sheet = SpreadsheetApp.openById('17F4OcnHXhMEotTYUOlkWw_RiW4WAFewk').getSheets()[0];
  const lead = JSON.parse(e.postData.contents);
  const calc = lead.calculator || {};

  sheet.appendRow([
    lead.recordedAt || '',
    lead.contact?.companyName || '',
    lead.contact?.email || '',
    lead.contact?.phone || '',
    lead.contact?.address || '',
    calc.jurisdiction || '',
    calc.propertyType || '',
    calc.monthlyExpenditureLocal || '',
    calc.currencyCode || '',
    calc.monthlyExpenditureUsd || '',
    calc.monthlyKwh || '',
    calc.floorAreaSqm || '',
    calc.weeklyOperatingHours || '',
    (calc.majorLoads || []).join(', '),
    calc.auditReadinessScore || '',
    calc.annualKwh || '',
    calc.monthlySavingsLocal25Pct || '',
    calc.bookNowUrl || 'https://cealgreen.com/book-now/',
    lead.platformUserId || '',
    lead.id || '',
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run once in the Apps Script editor to write column headers on row 1 */
function ensureHeaders() {
  const sheet = SpreadsheetApp.openById('17F4OcnHXhMEotTYUOlkWw_RiW4WAFewk').getSheets()[0];
  const headers = [
    'recordedAt',
    'companyName',
    'email',
    'phone',
    'address',
    'jurisdiction',
    'propertyType',
    'monthlyBillLocal',
    'currency',
    'monthlyBillUsd',
    'monthlyKwh',
    'floorAreaSqm',
    'weeklyHours',
    'majorLoads',
    'auditScore',
    'annualKwh',
    'monthlySavings25PctLocal',
    'bookNowUrl',
    'platformUserId',
    'leadId',
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}
