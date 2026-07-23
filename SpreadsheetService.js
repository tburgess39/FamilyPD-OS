/**
 * Workbook creation, schema repair, and low-call table helpers.
 */

const SpreadsheetService = (function() {

  function ensureWorkbook(workbook, role, metadata) {
    fpdAssertRole_(role);
    const schema = FPD_CONFIG.SHEETS[role];
    const existingSheets = {};
    workbook.getSheets().forEach(function(sheet) {
      existingSheets[sheet.getName()] = sheet;
    });

    Object.keys(schema).forEach(function(sheetName) {
      let sheet = existingSheets[sheetName];
      if (!sheet) {
        sheet = workbook.insertSheet(sheetName);
      }
      ensureHeaders_(sheet, schema[sheetName]);
      formatSheet_(sheet, schema[sheetName].length);
    });

    removeDefaultBlankSheet_(workbook, schema);
    updateWorkspaceConfig_(workbook, role, metadata);
    seedProfile_(workbook, role, metadata);
  }


  function ensureHeaders_(sheet, headers) {
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }

    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    let needsWrite = false;

    for (let i = 0; i < headers.length; i += 1) {
      if (String(current[i] || '') !== headers[i]) {
        needsWrite = true;
        break;
      }
    }

    if (needsWrite) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }


  function formatSheet_(sheet, columnCount) {
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, columnCount)
      .setFontWeight('bold')
      .setBackground('#6f1d2a')
      .setFontColor('#ffffff')
      .setWrap(true);

    if (sheet.getMaxRows() > 1) {
      sheet.getRange(2, 1, sheet.getMaxRows() - 1, columnCount).setVerticalAlignment('top');
    }

    try {
      sheet.autoResizeColumns(1, Math.min(columnCount, 10));
    } catch (error) {
      // Auto-resize is helpful but not critical.
    }
  }


  function removeDefaultBlankSheet_(workbook, schema) {
    const sheets = workbook.getSheets();
    if (sheets.length <= Object.keys(schema).length) return;

    sheets.forEach(function(sheet) {
      if (
        !Object.prototype.hasOwnProperty.call(schema, sheet.getName()) &&
        sheet.getLastRow() === 0 &&
        workbook.getSheets().length > 1
      ) {
        workbook.deleteSheet(sheet);
      }
    });
  }


  function updateWorkspaceConfig_(workbook, role, metadata) {
    const sheet = workbook.getSheetByName('WorkspaceConfig');
    const now = fpdNow_();
    const rows = [
      ['APP_NAME', FPD_CONFIG.APP_NAME, now],
      ['APP_VERSION', FPD_CONFIG.APP_VERSION, now],
      ['SCHEMA_VERSION', FPD_CONFIG.SCHEMA_VERSION, now],
      ['ROLE', role, now],
      ['HOUSEHOLD_ID', metadata.householdId, now],
      ['HOUSEHOLD_NAME', metadata.householdName, now],
      ['DISPLAY_NAME', metadata.displayName, now],
      ['ROOT_FOLDER_ID', metadata.rootFolderId, now]
    ];

    replaceDataRows_(sheet, rows);
  }


  function seedProfile_(workbook, role, metadata) {
    const now = fpdNow_();

    if (role === FPD_CONFIG.ROLE.LEAD) {
      const sheet = workbook.getSheetByName('FamilyProfile');
      if (sheet.getLastRow() < 2) {
        appendObjects_(sheet, [{
          HouseholdID: metadata.householdId,
          HouseholdName: metadata.householdName,
          LeadDisplayName: metadata.displayName,
          CoLeadDisplayName: '',
          Motto: '',
          LogoFileID: '',
          CurrentFocusPillars: '',
          CreatedAt: now,
          UpdatedAt: now
        }]);
      }
    } else {
      const sheet = workbook.getSheetByName('MemberProfile');
      if (sheet.getLastRow() < 2) {
        appendObjects_(sheet, [{
          MemberID: fpdNewId_('MEMBER'),
          DisplayName: metadata.displayName,
          HouseholdName: metadata.householdName,
          HouseholdID: metadata.householdId,
          HouseholdRole: 'Family Member',
          AgeGroup: '',
          CreatedAt: now,
          UpdatedAt: now
        }]);
      }
    }
  }


  function appendActivity(workbook, role, eventType, recordType, recordId, summary) {
    const sheet = workbook.getSheetByName('ActivityLog');
    const headers = getHeaders_(sheet);
    const row = {};

    row.LogID = fpdNewId_('LOG');
    row.EventType = eventType;
    row.RecordType = recordType;
    row.RecordID = recordId;
    row.Summary = summary;
    if (headers.indexOf('Actor') !== -1) {
      row.Actor = PropertiesService.getUserProperties().getProperty(fpdPropKey_('DISPLAY_NAME')) || '';
    }
    row.EventAt = fpdNow_();

    appendObjects_(sheet, [row]);
  }


  function getHeaders_(sheet) {
    const lastColumn = Math.max(sheet.getLastColumn(), 1);
    return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
  }


  function getObjects_(sheet) {
    if (!sheet || sheet.getLastRow() < 2) return [];

    const headers = getHeaders_(sheet);
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();

    return values
      .filter(function(row) {
        return row.some(function(value) { return String(value) !== ''; });
      })
      .map(function(row) {
        const obj = {};
        headers.forEach(function(header, index) {
          obj[header] = row[index];
        });
        return obj;
      });
  }


  function appendObjects_(sheet, objects) {
    if (!objects || !objects.length) return;

    const headers = getHeaders_(sheet);
    const rows = objects.map(function(obj) {
      return headers.map(function(header) {
        return Object.prototype.hasOwnProperty.call(obj, header) ? obj[header] : '';
      });
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }


  function replaceObjects_(sheet, objects) {
    const headers = getHeaders_(sheet);
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }

    if (!objects || !objects.length) return;

    const rows = objects.map(function(obj) {
      return headers.map(function(header) {
        return Object.prototype.hasOwnProperty.call(obj, header) ? obj[header] : '';
      });
    });

    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }


  function replaceDataRows_(sheet, rows) {
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }

    if (rows.length) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
  }


  function filterSharedRows_(sheet, rules) {
    const rows = getObjects_(sheet);
    rules = rules || {};

    return rows.filter(function(row) {
      if (rules.shareColumn && Object.prototype.hasOwnProperty.call(row, rules.shareColumn)) {
        return normalizeBoolean_(row[rules.shareColumn]);
      }

      if (rules.visibilityColumn && Object.prototype.hasOwnProperty.call(row, rules.visibilityColumn)) {
        return String(row[rules.visibilityColumn] || '').toUpperCase() === FPD_CONFIG.VISIBILITY.HOUSEHOLD;
      }

      return true;
    });
  }


  function normalizeBoolean_(value) {
    if (value === true) return true;
    const normalized = String(value || '').trim().toLowerCase();
    return ['true', 'yes', 'y', '1', 'share', 'shared'].includes(normalized);
  }


  return {
    ensureWorkbook: ensureWorkbook,
    appendActivity: appendActivity,
    getHeaders: getHeaders_,
    getObjects: getObjects_,
    appendObjects: appendObjects_,
    replaceObjects: replaceObjects_,
    filterSharedRows: filterSharedRows_
  };
})();
