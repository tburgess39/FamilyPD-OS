/**
 * Creates and repairs a FamilyPD workspace using direct Drive file IDs.
 * No Drive-wide search is performed.
 */

const WorkspaceService = (function() {

  function buildOrRepair(role) {
    fpdAssertRole_(role);

    const props = PropertiesService.getUserProperties();
    const storedRole = props.getProperty(fpdPropertyKey_('ROLE'));

    if (storedRole && storedRole !== role) {
      throw new Error(
        'This account is already connected to the other FamilyPD role. ' +
        'Disconnect first if the role change is intentional.'
      );
    }

    const workspaceId =
      props.getProperty(fpdPropertyKey_('WORKSPACE_ID')) || fpdNewId_('WORKSPACE');

    const rootFolder = resolveRootFolder_(role, props);
    const folderMap = ensureFolders_(role, rootFolder.id, props);
    const dataFile = resolveDataFile_(role, workspaceId, rootFolder.id, props);
    const sourceFile = resolveSourceFile_(workspaceId, folderMap.LEARNING, props);
    const recoveryFile = resolveRecoveryFile_(
      role,
      workspaceId,
      rootFolder.id,
      dataFile.id,
      sourceFile.id,
      folderMap,
      props
    );

    props.setProperties({
      [fpdPropertyKey_('ROLE')]: role,
      [fpdPropertyKey_('WORKSPACE_ID')]: workspaceId,
      [fpdPropertyKey_('ROOT_FOLDER_ID')]: rootFolder.id,
      [fpdPropertyKey_('DATA_FILE_ID')]: dataFile.id,
      [fpdPropertyKey_('SOURCE_FILE_ID')]: sourceFile.id,
      [fpdPropertyKey_('RECOVERY_FILE_ID')]: recoveryFile.id,
      [fpdPropertyKey_('FOLDER_MAP_JSON')]: JSON.stringify(folderMap),
      [fpdPropertyKey_('SCHEMA_VERSION')]: FPD_CONFIG.SCHEMA_VERSION,
      [fpdPropertyKey_('UPDATED_AT')]: fpdNow_()
    });

    // Migrate an existing privacy-first workspace in place. No new root folder
    // or duplicate database is created when the saved IDs are still usable.
    DataStoreService.readData();
    DataStoreService.readSources();

    return {
      success: true,
      message: 'Your privacy-first FamilyPD workspace is ready.',
      workspace: getStoredSummary()
    };
  }


  function checkHealth() {
    const props = PropertiesService.getUserProperties();
    const summary = getStoredSummary();
    const issues = [];
    const checked = [];

    if (!summary.role) {
      return {
        configured: false,
        healthy: false,
        canRepair: false,
        issues: ['No FamilyPD workspace has been created for this Google account.'],
        checkedAt: fpdNow_()
      };
    }

    checkItem_(
      summary.rootFolderId,
      'application/vnd.google-apps.folder',
      'FamilyPD main folder',
      issues,
      checked
    );
    checkItem_(
      summary.dataFileId,
      'application/json',
      'FamilyPD workspace data file',
      issues,
      checked
    );
    checkItem_(
      summary.sourceFileId,
      'application/json',
      'FamilyPD sources file',
      issues,
      checked
    );

    const recoveryId = summary.recoveryFileId;
    if (recoveryId) {
      checkItem_(
        recoveryId,
        'application/json',
        'FamilyPD recovery file',
        issues,
        checked
      );
    } else {
      issues.push('The FamilyPD recovery file connection is missing.');
    }

    const storedMap = fpdParseJson_(
      props.getProperty(fpdPropertyKey_('FOLDER_MAP_JSON')),
      {}
    );
    const requiredFolders = FPD_CONFIG.FOLDER_TREE[summary.role] || [];
    requiredFolders.forEach(function(item) {
      checkItem_(
        storedMap[item.key],
        'application/vnd.google-apps.folder',
        item.name + ' folder',
        issues,
        checked
      );
    });

    const schemaVersion = props.getProperty(
      fpdPropertyKey_('SCHEMA_VERSION')
    ) || '';
    if (schemaVersion !== FPD_CONFIG.SCHEMA_VERSION) {
      issues.push('The saved FamilyPD workspace version needs an in-place repair.');
    }

    return {
      configured: true,
      healthy: issues.length === 0,
      canRepair: true,
      role: summary.role,
      issues: issues,
      checkedItems: checked.length,
      expectedSchemaVersion: FPD_CONFIG.SCHEMA_VERSION,
      savedSchemaVersion: schemaVersion,
      checkedAt: fpdNow_()
    };
  }


  function checkItem_(id, mimeType, label, issues, checked) {
    if (!id) {
      issues.push('The connection to the ' + label + ' is missing.');
      return;
    }

    if (!DriveApiService.isUsable(id, mimeType)) {
      issues.push(
        'The ' + label + ' is unavailable, in Trash, or no longer accessible.'
      );
      return;
    }

    checked.push(label);
  }


  function repairCurrent() {
    const props = PropertiesService.getUserProperties();
    const role = props.getProperty(fpdPropertyKey_('ROLE'));

    if (!role) {
      throw new Error('No FamilyPD workspace is currently connected.');
    }

    return buildOrRepair(role);
  }


  function getStoredSummary() {
    const props = PropertiesService.getUserProperties();
    const role = props.getProperty(fpdPropertyKey_('ROLE'));
    const rootFolderId = props.getProperty(fpdPropertyKey_('ROOT_FOLDER_ID'));

    return {
      role: role,
      roleLabel: role === FPD_CONFIG.ROLE.LEAD ? 'Household Lead' : 'Family Member',
      workspaceId: props.getProperty(fpdPropertyKey_('WORKSPACE_ID')) || '',
      rootFolderId: rootFolderId || '',
      rootFolderUrl: rootFolderId
        ? 'https://drive.google.com/drive/folders/' + encodeURIComponent(rootFolderId)
        : '',
      dataFileId: props.getProperty(fpdPropertyKey_('DATA_FILE_ID')) || '',
      sourceFileId: props.getProperty(fpdPropertyKey_('SOURCE_FILE_ID')) || '',
      recoveryFileId: props.getProperty(fpdPropertyKey_('RECOVERY_FILE_ID')) || '',
      schemaVersion: props.getProperty(fpdPropertyKey_('SCHEMA_VERSION')) || ''
    };
  }


  function getCurrentContext() {
    const summary = getStoredSummary();

    if (!summary.role || !summary.rootFolderId ||
        !summary.dataFileId || !summary.sourceFileId) {
      throw new Error('Build or reconnect a FamilyPD workspace first.');
    }

    if (!DriveApiService.isUsable(
      summary.rootFolderId,
      'application/vnd.google-apps.folder'
    )) {
      throw new Error('The connected FamilyPD folder is unavailable or in Trash.');
    }

    if (!DriveApiService.isUsable(summary.dataFileId, 'application/json')) {
      throw new Error('The connected FamilyPD data file is unavailable or in Trash.');
    }

    if (!DriveApiService.isUsable(summary.sourceFileId, 'application/json')) {
      throw new Error('The connected FamilyPD source file is unavailable or in Trash.');
    }

    return Object.assign(summary, {
      props: PropertiesService.getUserProperties()
    });
  }


  function disconnect() {
    const props = PropertiesService.getUserProperties();
    const all = props.getProperties();

    Object.keys(all).forEach(function(key) {
      if (key.indexOf(FPD_CONFIG.PROPERTY_PREFIX) === 0) {
        props.deleteProperty(key);
      }
    });
  }


  function createRecoveryKeyPayload() {
    const context = getCurrentContext();

    const payload = {
      fileType: 'FAMILYPD_RECOVERY_KEY',
      appVersion: FPD_CONFIG.APP_VERSION,
      schemaVersion: FPD_CONFIG.SCHEMA_VERSION,
      role: context.role,
      workspaceId: context.workspaceId,
      rootFolderId: context.rootFolderId,
      dataFileId: context.dataFileId,
      sourceFileId: context.sourceFileId,
      recoveryFileId: context.recoveryFileId,
      createdAt: fpdNow_(),
      privacyNotice:
        'This file contains only FamilyPD workspace identifiers. ' +
        'It does not contain passwords or household records.'
    };

    return {
      success: true,
      filename: 'FamilyPD_Recovery_Key.json',
      mimeType: 'application/json',
      content: JSON.stringify(payload, null, 2)
    };
  }


  function resolveRootFolder_(role, props) {
    const storedId = props.getProperty(fpdPropertyKey_('ROOT_FOLDER_ID'));

    if (DriveApiService.isUsable(
      storedId,
      'application/vnd.google-apps.folder'
    )) {
      return DriveApiService.getMetadata(storedId);
    }

    return DriveApiService.createFolder(
      FPD_CONFIG.ROOT_FOLDER_NAME[role],
      'root'
    );
  }


  function ensureFolders_(role, rootFolderId, props) {
    const storedMap = fpdParseJson_(
      props.getProperty(fpdPropertyKey_('FOLDER_MAP_JSON')),
      {}
    );
    const result = {};

    FPD_CONFIG.FOLDER_TREE[role].forEach(function(item) {
      const existingId = storedMap[item.key];

      if (DriveApiService.isUsable(
        existingId,
        'application/vnd.google-apps.folder'
      )) {
        result[item.key] = existingId;
      } else {
        result[item.key] = DriveApiService.createFolder(
          item.name,
          rootFolderId
        ).id;
      }
    });

    return result;
  }


  function resolveDataFile_(role, workspaceId, rootFolderId, props) {
    const storedId = props.getProperty(fpdPropertyKey_('DATA_FILE_ID'));

    if (DriveApiService.isUsable(storedId, 'application/json')) {
      return DriveApiService.getMetadata(storedId);
    }

    const data = DataStoreService.createInitialData(role, workspaceId);

    return DriveApiService.createTextFile(
      FPD_CONFIG.DATA_FILE_NAME,
      'application/json',
      rootFolderId,
      JSON.stringify(data, null, 2)
    );
  }


  function resolveSourceFile_(workspaceId, parentId, props) {
    const storedId = props.getProperty(fpdPropertyKey_('SOURCE_FILE_ID'));

    if (DriveApiService.isUsable(storedId, 'application/json')) {
      return DriveApiService.getMetadata(storedId);
    }

    const sources = DataStoreService.createInitialSources(workspaceId);

    return DriveApiService.createTextFile(
      FPD_CONFIG.SOURCE_FILE_NAME,
      'application/json',
      parentId,
      JSON.stringify(sources, null, 2)
    );
  }


  function resolveRecoveryFile_(
    role,
    workspaceId,
    rootFolderId,
    dataFileId,
    sourceFileId,
    folderMap,
    props
  ) {
    const storedId = props.getProperty(fpdPropertyKey_('RECOVERY_FILE_ID'));
    const recovery = {
      fileType: 'FAMILYPD_RECOVERY_KEY',
      appVersion: FPD_CONFIG.APP_VERSION,
      schemaVersion: FPD_CONFIG.SCHEMA_VERSION,
      role: role,
      workspaceId: workspaceId,
      rootFolderId: rootFolderId,
      dataFileId: dataFileId,
      sourceFileId: sourceFileId,
      folderMap: folderMap,
      updatedAt: fpdNow_(),
      privacyNotice:
        'This file stores only FamilyPD workspace identifiers. ' +
        'It does not store passwords or household records.'
    };

    if (DriveApiService.isUsable(storedId, 'application/json')) {
      DriveApiService.updateTextFile(
        storedId,
        'application/json',
        JSON.stringify(recovery, null, 2)
      );
      return DriveApiService.getMetadata(storedId);
    }

    return DriveApiService.createTextFile(
      FPD_CONFIG.RECOVERY_FILE_NAME,
      'application/json',
      rootFolderId,
      JSON.stringify(recovery, null, 2)
    );
  }


  return {
    buildOrRepair: buildOrRepair,
    checkHealth: checkHealth,
    repairCurrent: repairCurrent,
    getStoredSummary: getStoredSummary,
    getCurrentContext: getCurrentContext,
    disconnect: disconnect,
    createRecoveryKeyPayload: createRecoveryKeyPayload
  };
})();
