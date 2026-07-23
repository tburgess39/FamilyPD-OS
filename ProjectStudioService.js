/**
 * FamilyPD OS Project Studio — workspace-aware Drive repair 11.2
 *
 * Uses the installed WorkspaceService + DriveApiService contract instead of
 * guessing at methods on FPDDriveFileServiceV10. Project records remain in
 * User Properties. Drive is touched only after the user selects Connect
 * Google Drive or Repair Workspace.
 */
const FPDProjectStudioServiceV11 = (function () {
  'use strict';

  const KEY = 'FPD_PROJECT_STUDIO_V11';

  function list() { return read_(); }

  function save(project) {
    const rows = read_();
    const now = new Date().toISOString();
    const p = project && typeof project === 'object' ? project : {};
    if (!p.id) p.id = Utilities.getUuid();
    p.title = clean_(p.title) || 'Untitled Project';
    p.status = clean_(p.status) || 'Planning';
    p.updatedAt = now;
    if (!p.createdAt) p.createdAt = now;
    const index = rows.findIndex(function (item) { return item.id === p.id; });
    if (index >= 0) rows[index] = p; else rows.unshift(p);
    write_(rows);
    return { project: p, projects: rows };
  }

  function remove(id) {
    const rows = read_().filter(function (item) { return item.id !== id; });
    write_(rows);
    return rows;
  }

  function getDriveStatus() {
    if (typeof WorkspaceService === 'undefined' || !WorkspaceService) {
      return status_('service-missing', false, false,
        'The FamilyPD workspace service is not installed in this deployment.');
    }
    if (typeof DriveApiService === 'undefined' || !DriveApiService) {
      return status_('drive-service-missing', false, false,
        'The FamilyPD Drive service is not installed in this deployment.');
    }

    try {
      const health = WorkspaceService.checkHealth();
      if (!health || !health.configured) {
        return status_('not-configured', false, false,
          'Set up your FamilyPD workspace before connecting a project to Google Drive.', health);
      }
      if (!health.healthy) {
        return status_('repair-required', false, Boolean(health.canRepair),
          'Your FamilyPD Drive workspace needs repair before a project folder can be created.', health);
      }
      const context = WorkspaceService.getCurrentContext();
      return Object.assign(status_('ready', true, true,
        'Your FamilyPD Drive workspace is ready.'), {
          role: context.role || '',
          rootFolderId: context.rootFolderId || '',
          rootFolderUrl: context.rootFolderUrl || ''
        });
    } catch (error) {
      return status_('repair-required', false, true,
        clean_(error && error.message) || 'Your FamilyPD Drive workspace needs repair.');
    }
  }

  function repairDriveWorkspace() {
    if (typeof WorkspaceService === 'undefined' || !WorkspaceService ||
        typeof WorkspaceService.repairCurrent !== 'function') {
      throw new Error('The installed FamilyPD workspace service cannot run repairs.');
    }

    const repairResult = WorkspaceService.repairCurrent();
    const refreshed = getDriveStatus();
    if (!refreshed.ready) {
      return {
        success: false,
        repaired: false,
        message: refreshed.message,
        status: refreshed,
        repairResult: repairResult || null
      };
    }
    return {
      success: true,
      repaired: true,
      message: 'Workspace repaired and refreshed successfully. You can now connect this project to Google Drive.',
      status: refreshed,
      repairResult: repairResult || null
    };
  }

  function createDriveFolder(id) {
    const rows = read_();
    const project = rows.find(function (item) { return item.id === id; });
    if (!project) throw new Error('Project not found.');
    if (project.driveFolderUrl) {
      return { project: project, projects: rows, alreadyConnected: true, driveStatus: getDriveStatus() };
    }

    const driveStatus = getDriveStatus();
    if (!driveStatus.ready) {
      return {
        success: false,
        requiresRepair: driveStatus.code === 'repair-required',
        requiresSetup: driveStatus.code === 'not-configured',
        message: driveStatus.message,
        driveStatus: driveStatus,
        project: project,
        projects: rows
      };
    }

    const context = WorkspaceService.getCurrentContext();
    const parentId = chooseProjectParent_(context);
    const folderName = 'FamilyPD Project - ' + safeName_(project.title);
    let created;
    try {
      created = DriveApiService.createFolder(folderName, parentId);
    } catch (error) {
      const refreshed = getDriveStatus();
      return {
        success: false,
        requiresRepair: true,
        message: clean_(error && error.message) || refreshed.message ||
          'FamilyPD could not create the project folder. Repair the workspace and try again.',
        driveStatus: refreshed,
        project: project,
        projects: rows
      };
    }

    const normalized = normalizeFolderResult_(created);
    if (!normalized.id) {
      return {
        success: false,
        requiresRepair: true,
        message: 'FamilyPD reached Google Drive but did not receive a folder ID. Your project tracker was not changed.',
        driveStatus: getDriveStatus(),
        project: project,
        projects: rows
      };
    }

    project.driveFolderId = normalized.id;
    project.driveFolderUrl = normalized.url ||
      'https://drive.google.com/drive/folders/' + encodeURIComponent(normalized.id);
    project.updatedAt = new Date().toISOString();
    write_(rows);

    return {
      success: true,
      project: project,
      projects: rows,
      alreadyConnected: false,
      driveStatus: getDriveStatus()
    };
  }

  function chooseProjectParent_(context) {
    const props = context && context.props
      ? context.props
      : PropertiesService.getUserProperties();
    const rawMap = props.getProperty(fpdPropertyKey_('FOLDER_MAP_JSON')) || '{}';
    let map = {};
    try { map = JSON.parse(rawMap) || {}; } catch (error) { map = {}; }
    // Projects belong with learning/creation work. Fall back to the FamilyPD
    // root when an older workspace does not yet contain that folder key.
    return clean_(map.LEARNING || map.MY_LEARNING || map.GENERATED || context.rootFolderId);
  }

  function normalizeFolderResult_(result) {
    if (!result) return { id: '', url: '' };
    if (typeof result === 'string') {
      const value = clean_(result);
      return value.indexOf('http') === 0
        ? { id: extractFolderId_(value), url: value }
        : { id: value, url: '' };
    }
    const id = clean_(result.id || result.folderId || result.driveFolderId);
    return {
      id: id,
      url: clean_(result.url || result.folderUrl || result.driveFolderUrl) ||
        (id ? 'https://drive.google.com/drive/folders/' + encodeURIComponent(id) : '')
    };
  }

  function extractFolderId_(url) {
    const match = clean_(url).match(/\/folders\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : '';
  }

  function status_(code, ready, canRepair, message, health) {
    return {
      code: code,
      ready: Boolean(ready),
      canRepair: Boolean(canRepair),
      message: message,
      issues: health && Array.isArray(health.issues) ? health.issues : [],
      checkedAt: health && health.checkedAt ? health.checkedAt : new Date().toISOString()
    };
  }

  function read_() {
    try {
      const parsed = JSON.parse(PropertiesService.getUserProperties().getProperty(KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) { return []; }
  }

  function write_(rows) {
    PropertiesService.getUserProperties().setProperty(KEY, JSON.stringify(rows.slice(0, 25)));
  }

  function clean_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function safeName_(value) {
    return clean_(value).replace(/[\\/:*?"<>|#%{}~]/g, '-').slice(0, 90) || 'Project';
  }

  return {
    list: list,
    save: save,
    remove: remove,
    getDriveStatus: getDriveStatus,
    repairDriveWorkspace: repairDriveWorkspace,
    createDriveFolder: createDriveFolder
  };
}());

function fpdProjectList() { return FPDProjectStudioServiceV11.list(); }
function fpdProjectSave(project) { return FPDProjectStudioServiceV11.save(project); }
function fpdProjectDelete(id) { return FPDProjectStudioServiceV11.remove(id); }
function fpdProjectGetDriveStatus() { return FPDProjectStudioServiceV11.getDriveStatus(); }
function fpdProjectRepairDriveWorkspace() {
  return fpdWithUserLock_(function () {
    return FPDProjectStudioServiceV11.repairDriveWorkspace();
  });
}
function fpdProjectCreateDriveFolder(id) {
  return fpdWithUserLock_(function () {
    return FPDProjectStudioServiceV11.createDriveFolder(id);
  });
}
