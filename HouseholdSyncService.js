/**
 * Versioned, one-way household update packs.
 *
 * V1 uses a Google Sheet as the exchange package. A household lead can share
 * the generated Sheet or download it as .xlsx. A family member can import by
 * pasting the Google Sheet URL or ID. Personal member data is never replaced.
 */

const HouseholdSyncService = (function() {

  const EXPORT_RULES = {
    HouseholdIdentity: {
      source: 'MissionVisionHistory',
      rules: { shareColumn: 'ShareWithMembers' }
    },
    FamilyValues: {
      source: 'FamilyValues',
      rules: { shareColumn: 'ShareWithMembers' }
    },
    FamilyMembers: {
      source: 'FamilyMembers',
      rules: { shareColumn: 'ShareWithMembers' }
    },
    SharedGoals: {
      source: 'Goals',
      rules: { visibilityColumn: 'Visibility' }
    },
    UpcomingMeetings: {
      source: 'Meetings',
      rules: { visibilityColumn: 'Visibility' },
      filter: function(row) {
        return ['DRAFT', 'SCHEDULED', 'FOLLOW-UP NEEDED', 'FOLLOW_UP_NEEDED']
          .includes(String(row.Status || '').toUpperCase());
      }
    },
    Assignments: {
      source: 'Assignments',
      rules: { visibilityColumn: 'Visibility' }
    },
    SharedPolicies: {
      source: 'Policies',
      rules: { visibilityColumn: 'Visibility' }
    },
    SafetyInformation: {
      source: 'SafetyPlans',
      rules: { visibilityColumn: 'Visibility' }
    },
    SharedResources: {
      source: 'SavedContent',
      rules: { visibilityColumn: 'Visibility' }
    },
    Sources: {
      source: 'Sources',
      rules: {}
    },
    ContentCitations: {
      source: 'ContentCitations',
      rules: {}
    }
  };

  const MEMBER_IMPORT_MAP = {
    HouseholdIdentity: 'HouseholdIdentity',
    FamilyValues: 'FamilyValues',
    FamilyMembers: 'FamilyMembers',
    SharedGoals: 'SharedGoals',
    UpcomingMeetings: 'Meetings',
    Assignments: 'Assignments',
    SharedPolicies: 'SharedPolicies',
    SafetyInformation: 'SafetyInformation',
    SharedResources: 'SharedResources',
    Sources: 'Sources',
    ContentCitations: 'ContentCitations'
  };


  function createUpdatePack() {
    const context = WorkspaceService.getCurrentContext();

    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can create a Household Update Pack.');
    }

    const folderMap = parseJson_(
      context.props.getProperty(fpdPropKey_('FOLDER_MAP_JSON')),
      {}
    );
    const updateFolderId = folderMap.UPDATE_PACKS;
    const updateFolder = updateFolderId ? DriveApp.getFolderById(updateFolderId) : context.rootFolder;

    const version = nextPackageVersion_(context.props);
    const dateLabel = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const name = 'FamilyPD Household Update Pack - ' + context.householdName + ' - v' + version + ' - ' + dateLabel;
    const pack = SpreadsheetApp.create(name);

    DriveApp.getFileById(pack.getId()).moveTo(updateFolder);

    const defaultSheet = pack.getSheets()[0];
    defaultSheet.setName('PackageInfo');

    writeTable_(defaultSheet, ['Key', 'Value'], [
      ['PackageType', 'FAMILY_PD_HOUSEHOLD_UPDATE'],
      ['HouseholdID', context.householdId],
      ['HouseholdName', context.householdName],
      ['PackageVersion', version],
      ['SchemaVersion', FPD_CONFIG.SCHEMA_VERSION],
      ['GeneratedDate', fpdNow_()],
      ['GeneratedBy', context.displayName]
    ]);

    Object.keys(EXPORT_RULES).forEach(function(packTabName) {
      const config = EXPORT_RULES[packTabName];
      const sourceSheet = context.workbook.getSheetByName(config.source);
      const sourceHeaders = SpreadsheetService.getHeaders(sourceSheet);
      let rows = SpreadsheetService.filterSharedRows(sourceSheet, config.rules);

      if (config.filter) {
        rows = rows.filter(config.filter);
      }

      const packSheet = pack.insertSheet(packTabName);
      writeObjectTable_(packSheet, sourceHeaders, rows);
    });

    formatPack_(pack);

    context.props.setProperty(fpdPropKey_('LAST_UPDATE_PACK_VERSION'), String(version));

    SpreadsheetService.appendActivity(
      context.workbook,
      context.role,
      'UPDATE_PACK_CREATED',
      'Spreadsheet',
      pack.getId(),
      'Created household update pack version ' + version + '.'
    );

    return {
      success: true,
      message: 'Household Update Pack version ' + version + ' was created.',
      packageVersion: version,
      spreadsheetId: pack.getId(),
      spreadsheetUrl: pack.getUrl()
    };
  }


  function previewUpdatePack(sheetUrlOrId) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.MEMBER) {
      throw new Error('Only a Family Member workspace can import a Household Update Pack.');
    }

    const pack = openPack_(sheetUrlOrId);
    const metadata = readPackageInfo_(pack);
    validatePack_(metadata);

    const counts = {};
    Object.keys(MEMBER_IMPORT_MAP).forEach(function(packTab) {
      const sheet = pack.getSheetByName(packTab);
      counts[packTab] = sheet ? Math.max(sheet.getLastRow() - 1, 0) : 0;
    });

    const currentHouseholdId = context.props.getProperty(fpdPropKey_('IMPORTED_HOUSEHOLD_ID')) || '';
    const isDifferentHousehold = Boolean(
      currentHouseholdId &&
      metadata.HouseholdID &&
      currentHouseholdId !== metadata.HouseholdID
    );

    return {
      success: true,
      spreadsheetId: pack.getId(),
      spreadsheetUrl: pack.getUrl(),
      householdId: metadata.HouseholdID,
      householdName: metadata.HouseholdName,
      packageVersion: metadata.PackageVersion,
      schemaVersion: metadata.SchemaVersion,
      generatedDate: metadata.GeneratedDate,
      generatedBy: metadata.GeneratedBy,
      counts: counts,
      isDifferentHousehold: isDifferentHousehold,
      warning: isDifferentHousehold
        ? 'This package belongs to a different household than the last package you imported.'
        : ''
    };
  }


  function applyUpdatePack(sheetUrlOrId) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.MEMBER) {
      throw new Error('Only a Family Member workspace can import a Household Update Pack.');
    }

    const pack = openPack_(sheetUrlOrId);
    const metadata = readPackageInfo_(pack);
    validatePack_(metadata);

    Object.keys(MEMBER_IMPORT_MAP).forEach(function(packTab) {
      const destinationName = MEMBER_IMPORT_MAP[packTab];
      const sourceSheet = pack.getSheetByName(packTab);
      const destinationSheet = context.workbook.getSheetByName(destinationName);

      if (!sourceSheet || !destinationSheet) return;

      const sourceObjects = readObjects_(sourceSheet);
      const destinationHeaders = SpreadsheetService.getHeaders(destinationSheet);

      const mapped = sourceObjects.map(function(obj) {
        const clean = {};
        destinationHeaders.forEach(function(header) {
          clean[header] = Object.prototype.hasOwnProperty.call(obj, header) ? obj[header] : '';
        });
        return clean;
      });

      SpreadsheetService.replaceObjects(destinationSheet, mapped);
    });

    const now = fpdNow_();
    context.props.setProperties({
      [fpdPropKey_('IMPORTED_HOUSEHOLD_ID')]: metadata.HouseholdID,
      [fpdPropKey_('HOUSEHOLD_ID')]: metadata.HouseholdID,
      [fpdPropKey_('HOUSEHOLD_NAME')]: metadata.HouseholdName,
      [fpdPropKey_('LAST_IMPORTED_PACK_VERSION')]: String(metadata.PackageVersion),
      [fpdPropKey_('LAST_IMPORTED_AT')]: now
    });

    updateMemberProfile_(context.workbook, metadata, now);

    SpreadsheetService.appendActivity(
      context.workbook,
      context.role,
      'UPDATE_PACK_IMPORTED',
      'Spreadsheet',
      pack.getId(),
      'Imported household update pack version ' + metadata.PackageVersion + '.'
    );

    return {
      success: true,
      message: 'Household information was updated. Your personal goals, reflections, and files were preserved.',
      householdId: metadata.HouseholdID,
      householdName: metadata.HouseholdName,
      packageVersion: metadata.PackageVersion,
      importedAt: now
    };
  }


  function nextPackageVersion_(props) {
    const current = Number(props.getProperty(fpdPropKey_('LAST_UPDATE_PACK_VERSION')) || 0);
    return current + 1;
  }


  function openPack_(sheetUrlOrId) {
    const id = extractSpreadsheetId_(sheetUrlOrId);
    if (!id) {
      throw new Error('Paste a valid Google Sheet URL or spreadsheet ID.');
    }

    try {
      return SpreadsheetApp.openById(id);
    } catch (error) {
      throw new Error(
        'FamilyPD could not open that Google Sheet. Make sure it exists and has been shared with this Google account.'
      );
    }
  }


  function extractSpreadsheetId_(value) {
    const text = String(value || '').trim();
    if (/^[a-zA-Z0-9-_]{20,}$/.test(text)) {
      return text;
    }
    const match = text.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  }


  function readPackageInfo_(pack) {
    const sheet = pack.getSheetByName('PackageInfo');
    if (!sheet || sheet.getLastRow() < 2) {
      throw new Error('This spreadsheet is not a valid FamilyPD Household Update Pack.');
    }

    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    const metadata = {};
    values.forEach(function(row) {
      metadata[String(row[0] || '')] = row[1];
    });
    return metadata;
  }


  function validatePack_(metadata) {
    if (metadata.PackageType !== 'FAMILY_PD_HOUSEHOLD_UPDATE') {
      throw new Error('This spreadsheet is not a FamilyPD Household Update Pack.');
    }

    if (!metadata.HouseholdID || !metadata.HouseholdName) {
      throw new Error('The update pack is missing required household information.');
    }

    if (String(metadata.SchemaVersion) !== FPD_CONFIG.SCHEMA_VERSION) {
      throw new Error(
        'This update pack uses schema version ' + metadata.SchemaVersion +
        ', but this app expects ' + FPD_CONFIG.SCHEMA_VERSION + '.'
      );
    }
  }


  function writeTable_(sheet, headers, rows) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  }


  function writeObjectTable_(sheet, headers, objects) {
    const rows = objects.map(function(obj) {
      return headers.map(function(header) {
        return Object.prototype.hasOwnProperty.call(obj, header) ? obj[header] : '';
      });
    });
    writeTable_(sheet, headers, rows);
  }


  function readObjects_(sheet) {
    if (sheet.getLastRow() < 2) return [];
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();

    return rows
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


  function formatPack_(pack) {
    pack.getSheets().forEach(function(sheet) {
      const columns = Math.max(sheet.getLastColumn(), 1);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, columns)
        .setBackground('#6f1d2a')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setWrap(true);
      try {
        sheet.autoResizeColumns(1, Math.min(columns, 10));
      } catch (error) {
        // Not critical.
      }
    });
  }


  function updateMemberProfile_(workbook, metadata, now) {
    const sheet = workbook.getSheetByName('MemberProfile');
    if (!sheet || sheet.getLastRow() < 2) return;

    const headers = SpreadsheetService.getHeaders(sheet);
    const values = sheet.getRange(2, 1, 1, headers.length).getValues()[0];

    headers.forEach(function(header, index) {
      if (header === 'HouseholdName') values[index] = metadata.HouseholdName;
      if (header === 'HouseholdID') values[index] = metadata.HouseholdID;
      if (header === 'UpdatedAt') values[index] = now;
    });

    sheet.getRange(2, 1, 1, headers.length).setValues([values]);
  }


  function parseJson_(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }


  return {
    createUpdatePack: createUpdatePack,
    previewUpdatePack: previewUpdatePack,
    applyUpdatePack: applyUpdatePack
  };
})();
