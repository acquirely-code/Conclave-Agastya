/** @OnlyCurrentDoc */
// Google Apps Script that receives "Request A Call Back" submissions and adds them to the sheet.
// Setup steps are in the README under "Call-back form".
const COLUMNS = [
  ['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['school', 'School'], ['board', 'Board'],
  ['state', 'State'], ['role', 'Role'], ['call_time', 'Preferred call time'],
  ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'], ['utm_content', 'utm_content'],
  ['utm_term', 'utm_term'], ['utm_id', 'utm_id'], ['fbclid', 'fbclid'], ['lead_id', 'Lead ID'],
];

// The endpoint is public: limit length, and stop values being read as spreadsheet formulas.
function clean(value) {
  const text = String(value === undefined || value === null ? '' : value).slice(0, 500);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function respond(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return respond(false); }
  if (!data.name || !data.phone || !data.email) return respond(false);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(['Submitted at', ...COLUMNS.map(c => c[1])]);
  sheet.appendRow([new Date(), ...COLUMNS.map(c => clean(data[c[0]]))]);
  return respond(true);
}
