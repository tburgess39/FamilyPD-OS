/**
 * FamilyPD least-privilege Drive adapter
 * Recovery build 10.0
 *
 * Uses the Advanced Drive service with drive.file. It never searches the
 * user's entire Drive. It locates the existing workspace from saved IDs and
 * structured project properties created by earlier FamilyPD builds.
 *
 * Required Apps Script service: Drive API v3
 */
const FPDDriveFileServiceV10 = (function () {
  'use strict';

  const FOLDER_MIME = 'application/vnd.google-apps.folder';
  const PRIMARY_ROOT_KEY = 'FPD_WORKSPACE_ROOT_ID';
  const DIRECT_KEYS = [
    PRIMARY_ROOT_KEY,
    'FPD_WORKSPACE_FOLDER_ID',
    'FAMILY_PD_WORKSPACE_ID',
    'FAMILY_PD_WORKSPACE_FOLDER_ID',
    'FAMILYPD_WORKSPACE_ID',
    'FAMILYPD_ROOT_FOLDER_ID',
    'FPD_ROOT_FOLDER_ID',
    'WORKSPACE_ROOT_ID',
    'WORKSPACE_FOLDER_ID',
    'ROOT_FOLDER_ID',
    'FPD_WORKSPACE',
    'FAMILY_PD_WORKSPACE',
    'FAMILYPD_WORKSPACE',
    'WORKSPACE_STATE',
    'FPD_WORKSPACE_STATE',
    'FAMILY_PD_WORKSPACE_STATE'
  ];

  function getRootId() {
    const candidate = findSavedRootCandidate_();
    if (candidate) rememberRootId(candidate);
    return candidate;
  }

  function rememberRootId(value) {
    const id = extractDriveId_(value);
    if (!id) return '';
    PropertiesService.getUserProperties().setProperty(PRIMARY_ROOT_KEY, id);
    return id;
  }

  function getMetadata(fileId) {
    const id = extractDriveId_(fileId);
    if (!id) return null;
    ensureDriveService_();
    try {
      return Drive.Files.get(id, {
        fields: 'id,name,mimeType,parents,webViewLink,modifiedTime,trashed,description',
        supportsAllDrives: true
      });
    } catch (error) {
      return null;
    }
  }

  function getRootMetadata() {
    const id = getRootId();
    const metadata = getMetadata(id);
    if (metadata && metadata.mimeType === FOLDER_MIME && !metadata.trashed) return metadata;
    return null;
  }

  function diagnoseRoot() {
    const rootId = getRootId();
    if (!rootId) {
      return {
        connected: false,
        rootId: '',
        message: 'No FamilyPD Workspace folder ID is saved. Open Workspace Setup and use Build or Reconnect Workspace.'
      };
    }

    const root = getMetadata(rootId);
    if (!root) {
      return {
        connected: false,
        rootId: rootId,
        message: 'A workspace ID is saved, but this deployment cannot open that folder. Reconnect the workspace from Workspace Setup using the same Google account.'
      };
    }
    if (root.trashed) {
      return {
        connected: false,
        rootId: rootId,
        message: 'The connected FamilyPD Workspace is in Google Trash. Restore it or build a new workspace.'
      };
    }
    if (root.mimeType !== FOLDER_MIME) {
      return {
        connected: false,
        rootId: rootId,
        message: 'The saved workspace ID does not point to a Google Drive folder. Reconnect the workspace from Workspace Setup.'
      };
    }

    return {
      connected: true,
      rootId: root.id,
      rootName: root.name || 'FamilyPD Workspace',
      rootUrl: root.webViewLink || folderUrl(root.id),
      message: 'FamilyPD Workspace connected.'
    };
  }

  function connectionMessage() {
    return diagnoseRoot().message;
  }

  function findChildFolder(parentId, folderName) {
    const parent = extractDriveId_(parentId);
    const name = clean_(folderName);
    if (!parent || !name) return null;
    ensureDriveService_();

    const response = Drive.Files.list({
      q: "'" + escapeQuery_(parent) + "' in parents and " +
        "name = '" + escapeQuery_(name) + "' and " +
        "mimeType = '" + FOLDER_MIME + "' and trashed = false",
      pageSize: 10,
      fields: 'files(id,name,mimeType,parents,webViewLink,modifiedTime,trashed)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    return response.files && response.files.length ? response.files[0] : null;
  }

  function getOrCreateChildFolder(parentId, folderName) {
    const parent = extractDriveId_(parentId);
    if (!parent) throw new Error(connectionMessage());
    const existing = findChildFolder(parent, folderName);
    if (existing) return existing;
    ensureDriveService_();

    return Drive.Files.create({
      name: clean_(folderName),
      mimeType: FOLDER_MIME,
      parents: [parent]
    }, null, {
      fields: 'id,name,mimeType,parents,webViewLink,modifiedTime,trashed',
      supportsAllDrives: true
    });
  }

  function listFiles(folderId, limit) {
    const id = extractDriveId_(folderId);
    if (!id) return [];
    ensureDriveService_();
    const max = Math.max(1, Math.min(Number(limit) || 20, 100));
    const response = Drive.Files.list({
      q: "'" + escapeQuery_(id) + "' in parents and trashed = false",
      pageSize: max,
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,parents,webViewLink,modifiedTime,trashed)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    return response.files || [];
  }

  function moveFile(fileId, destinationFolderId) {
    const file = getMetadata(fileId);
    if (!file) throw new Error('The generated file could not be opened by FamilyPD.');
    const existingParents = Array.isArray(file.parents) ? file.parents.join(',') : '';
    ensureDriveService_();

    return Drive.Files.update({}, extractDriveId_(fileId), null, {
      addParents: extractDriveId_(destinationFolderId),
      removeParents: existingParents,
      fields: 'id,name,mimeType,parents,webViewLink,modifiedTime,trashed',
      supportsAllDrives: true
    });
  }

  function exportPdf(fileId, fileName) {
    ensureDriveService_();
    const blob = Drive.Files.export(extractDriveId_(fileId), 'application/pdf');
    return blob.setName(clean_(fileName) || 'FamilyPD.pdf');
  }

  function createBlobFile(folderId, fileName, blob, description) {
    ensureDriveService_();
    return Drive.Files.create({
      name: clean_(fileName),
      mimeType: blob.getContentType() || 'application/octet-stream',
      parents: [extractDriveId_(folderId)],
      description: clean_(description)
    }, blob, {
      fields: 'id,name,mimeType,parents,webViewLink,modifiedTime,trashed',
      supportsAllDrives: true
    });
  }

  function view(metadata) {
    if (!metadata || !metadata.id) return null;
    return {
      id: metadata.id,
      name: metadata.name || '',
      url: metadata.webViewLink || driveUrl_(metadata.id),
      mimeType: metadata.mimeType || '',
      modifiedAt: metadata.modifiedTime || ''
    };
  }

  function findSavedRootCandidate_() {
    const propertyStores = [
      PropertiesService.getUserProperties(),
      PropertiesService.getScriptProperties()
    ];

    for (let s = 0; s < propertyStores.length; s += 1) {
      const store = propertyStores[s];
      for (let i = 0; i < DIRECT_KEYS.length; i += 1) {
        const id = extractDriveId_(store.getProperty(DIRECT_KEYS[i]));
        if (id) return id;
      }
    }

    const configCandidate = rootFromConfig_();
    if (configCandidate) return configCandidate;

    const serviceCandidate = rootFromExistingWorkspaceService_();
    if (serviceCandidate) return serviceCandidate;

    for (let s = 0; s < propertyStores.length; s += 1) {
      const properties = propertyStores[s].getProperties();
      const keys = Object.keys(properties);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const keyLower = key.toLowerCase();
        if (!/(workspace|root).*(folder|id)|(folder|id).*(workspace|root)/.test(keyLower)) continue;
        const id = extractDriveId_(properties[key]);
        if (id) return id;
      }

      for (let i = 0; i < keys.length; i += 1) {
        const parsed = parseJson_(properties[keys[i]]);
        const id = findRootInObject_(parsed, 0);
        if (id) return id;
      }
    }
    return '';
  }

  function rootFromConfig_() {
    try {
      if (typeof FPD_CONFIG === 'undefined' || !FPD_CONFIG) return '';
      const candidates = [
        FPD_CONFIG.ROOT_FOLDER_ID,
        FPD_CONFIG.WORKSPACE_FOLDER_ID,
        FPD_CONFIG.WORKSPACE_ROOT_ID,
        FPD_CONFIG.FAMILY_PD_WORKSPACE_ID
      ];
      for (let i = 0; i < candidates.length; i += 1) {
        const id = extractDriveId_(candidates[i]);
        if (id) return id;
      }
      return findRootInObject_(FPD_CONFIG, 0);
    } catch (error) {}
    return '';
  }

  function rootFromExistingWorkspaceService_() {
    const services = [];
    try { if (typeof WorkspaceService !== 'undefined' && WorkspaceService) services.push(WorkspaceService); } catch (error) {}
    try { if (typeof FPDWorkspaceService !== 'undefined' && FPDWorkspaceService) services.push(FPDWorkspaceService); } catch (error) {}
    try { if (typeof FamilyPDWorkspaceService !== 'undefined' && FamilyPDWorkspaceService) services.push(FamilyPDWorkspaceService); } catch (error) {}

    const methods = [
      'getWorkspaceView', 'getWorkspaceStatus', 'getWorkspace',
      'getStatus', 'getConnection', 'getBootstrap'
    ];
    for (let s = 0; s < services.length; s += 1) {
      for (let i = 0; i < methods.length; i += 1) {
        const service = services[s];
        const method = methods[i];
        if (!service || typeof service[method] !== 'function') continue;
        try {
          const value = service[method]();
          const id = findRootInObject_(value, 0) || extractDriveId_(value);
          if (id) return id;
        } catch (error) {}
      }
    }
    return '';
  }

  function findRootInObject_(value, depth) {
    if (!value || typeof value !== 'object' || depth > 5) return '';
    const keys = Object.keys(value);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const lower = key.toLowerCase();
      if (/^(rootfolderid|workspacefolderid|workspacerootid|rootid|workspaceid)$/.test(lower)) {
        const id = extractDriveId_(value[key]);
        if (id) return id;
      }
      if (/^(rootfolder|workspacefolder|workspace)$/.test(lower)) {
        const direct = extractDriveId_(value[key]);
        if (direct) return direct;
        if (value[key] && typeof value[key] === 'object') {
          const nestedDirect = extractDriveId_(value[key].id || value[key].folderId || value[key].url);
          if (nestedDirect) return nestedDirect;
        }
      }
    }

    for (let i = 0; i < keys.length; i += 1) {
      const nested = findRootInObject_(value[keys[i]], depth + 1);
      if (nested) return nested;
    }
    return '';
  }

  function parseJson_(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const text = raw.trim();
    if (!text || (text.charAt(0) !== '{' && text.charAt(0) !== '[')) return null;
    try { return JSON.parse(text); } catch (error) { return null; }
  }

  function extractDriveId_(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      return extractDriveId_(value.id || value.folderId || value.rootId || value.url || '');
    }
    const text = String(value).trim();
    if (!text) return '';
    const urlMatch = text.match(/(?:folders\/|\/d\/|id=)([-\w]{20,})/);
    if (urlMatch) return urlMatch[1];
    return /^[-\w]{20,}$/.test(text) ? text : '';
  }

  function driveUrl_(id) {
    return 'https://drive.google.com/open?id=' + encodeURIComponent(extractDriveId_(id));
  }

  function folderUrl(id) {
    return 'https://drive.google.com/drive/folders/' + encodeURIComponent(extractDriveId_(id));
  }

  function ensureDriveService_() {
    if (typeof Drive === 'undefined' || !Drive.Files) {
      throw new Error('Enable the Apps Script Drive API v3 service. FamilyPD will continue using the limited drive.file permission.');
    }
  }

  function escapeQuery_(value) {
    return clean_(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  function clean_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  return {
    getRootId: getRootId,
    rememberRootId: rememberRootId,
    getMetadata: getMetadata,
    getRootMetadata: getRootMetadata,
    diagnoseRoot: diagnoseRoot,
    connectionMessage: connectionMessage,
    findChildFolder: findChildFolder,
    getOrCreateChildFolder: getOrCreateChildFolder,
    listFiles: listFiles,
    moveFile: moveFile,
    exportPdf: exportPdf,
    createBlobFile: createBlobFile,
    view: view,
    folderUrl: folderUrl
  };
}());
