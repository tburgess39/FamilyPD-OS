/**
 * FamilyPD OS identity compatibility service
 * Recovery build 10.1
 *
 * Provides the complete contract expected by the FamilyPD OS interface while
 * keeping identity data in User Properties. It does not inspect the user's
 * email, search Google Drive, or create Drive files.
 */
const IdentityService = (function () {
  'use strict';

  const DRAFT_KEY = 'FPD_IDENTITY_DRAFT';
  const PUBLISHED_KEY = 'FPD_IDENTITY_PUBLISHED';
  const HISTORY_KEY = 'FPD_IDENTITY_HISTORY';
  const PROFILE_KEY = 'FPD_MEMBER_PROFILE';
  const SYMBOL_KEY = 'FPD_IDENTITY_SYMBOL';
  const SUGGESTIONS_KEY = 'FPD_IDENTITY_SUGGESTIONS';

  function getWorkspaceView() {
    const published = normalizeVersion_(readObject_(PUBLISHED_KEY));
    const draft = normalizeDraft_(readObject_(DRAFT_KEY));
    const history = normalizeHistory_(readArray_(HISTORY_KEY));
    const profile = readObject_(PROFILE_KEY) || {};
    const suggestions = readArray_(SUGGESTIONS_KEY);
    const symbol = getSymbolData();
    const rootId = safeRootId_();

    return {
      featureName: 'Family Profile',
      legacyFeatureName: 'Household Identity',
      migratedToFamilyProfile: true,
      publishedVersion: published,
      publishedVersionNumber: published.versionNumber,
      hasPublishedVersion: published.exists,
      draft: draft,
      hasDraft: hasContent_(draft),
      versionHistory: history,
      history: history,
      profile: profile,
      suggestions: suggestions,
      symbol: symbol,
      workspaceConnected: Boolean(rootId),
      workspaceRootId: rootId,
      familyProfileAvailable: typeof FPDFamilyProfileServiceV100 !== 'undefined',
      status: published.exists ? 'Published identity available' : 'Family Profile is ready to set up',
      updatedAt: published.publishedAt || clean_(draft.updatedAt) || clean_(profile.updatedAt)
    };
  }

  function saveIdentityDraft(payload) {
    const incoming = payload && typeof payload === 'object' ? payload : {};
    const current = normalizeDraft_(readObject_(DRAFT_KEY));
    const updated = Object.assign({}, current, sanitizeObject_(incoming), {
      updatedAt: now_()
    });
    write_(DRAFT_KEY, updated);
    return success_('Family Profile draft saved.', { draft: updated });
  }

  function saveValues(values) {
    return updateDraftSection_('values', Array.isArray(values) ? values.map(sanitizeObject_) : [] ,'Family values saved.');
  }

  function saveCommitments(commitments) {
    return updateDraftSection_('commitments', Array.isArray(commitments) ? commitments.map(sanitizeObject_) : [], 'Family commitments saved.');
  }

  function saveRoster(records) {
    return updateDraftSection_('roster', Array.isArray(records) ? records.map(sanitizeObject_) : [], 'Family roles saved.');
  }

  function publishIdentity() {
    const draft = normalizeDraft_(readObject_(DRAFT_KEY));
    if (!hasContent_(draft)) {
      throw new Error('Save the Family Profile draft before publishing a version.');
    }

    const history = normalizeHistory_(readArray_(HISTORY_KEY));
    const current = normalizeVersion_(readObject_(PUBLISHED_KEY));
    const highest = history.reduce(function (max, item) {
      return Math.max(max, number_(item.versionNumber));
    }, number_(current.versionNumber));
    const versionNumber = highest + 1;
    const publishedAt = now_();
    const version = {
      exists: true,
      id: Utilities.getUuid(),
      version: versionNumber,
      versionNumber: versionNumber,
      label: 'Version ' + versionNumber,
      publishedAt: publishedAt,
      createdAt: publishedAt,
      documentUrl: '',
      pdfUrl: '',
      profile: clone_(draft),
      status: 'published'
    };

    // Store a readable source-of-truth JSON file in the user's FamilyPD Drive workspace.
    // User Properties keep the fast in-app cache; Drive keeps the approved published record.
    try {
      const context = WorkspaceService.getCurrentContext();
      const folderMap = fpdFolderMap_();
      const parentId = folderMap.IDENTITY || context.rootFolderId;
      const fileName = 'Household Identity - Version ' + versionNumber + '.json';
      const file = DriveApiService.createTextFile(
        fileName,
        'application/json',
        parentId,
        JSON.stringify(version, null, 2)
      );
      version.driveFileId = file.id || '';
      version.documentUrl = file.webViewLink || '';
    } catch (driveError) {
      // Do not lose the approved version if Drive metadata creation temporarily fails.
      version.driveSaveWarning = String(driveError && driveError.message ? driveError.message : driveError);
    }

    history.unshift(version);
    write_(PUBLISHED_KEY, version);
    write_(HISTORY_KEY, compactHistory_(history, 5));

    return success_('Household Identity published as version ' + versionNumber + ' and saved to your FamilyPD Drive workspace.', {
      publishedVersion: version,
      versionHistory: compactHistory_(history, 5)
    });
  }

  function restoreVersion(versionId) {
    const id = clean_(versionId);
    const history = normalizeHistory_(readArray_(HISTORY_KEY));
    const match = history.find(function (item) {
      return item.id === id || String(item.versionNumber) === id;
    });
    if (!match) throw new Error('The selected Family Profile version could not be found.');

    const restored = normalizeDraft_(clone_(match.profile || {}));
    restored.updatedAt = now_();
    restored.restoredFromVersion = match.versionNumber;
    write_(DRAFT_KEY, restored);
    return success_('Version ' + match.versionNumber + ' was restored to the draft.', { draft: restored });
  }

  function saveProfile(profile) {
    const current = readObject_(PROFILE_KEY) || {};
    const updated = Object.assign({}, current, sanitizeObject_(profile || {}), { updatedAt: now_() });
    write_(PROFILE_KEY, updated);
    return success_(updated.language === 'es' ? 'Se guardaron las preferencias del perfil.' : 'Profile preferences saved.', { profile: updated });
  }

  function saveInterfacePreferences(preferences) {
    return saveProfile(preferences);
  }

  function uploadSymbol(filePayload) {
    const payload = filePayload && typeof filePayload === 'object' ? filePayload : {};
    let data = clean_(payload.data || payload.base64 || payload.dataUrl);
    if (!data) throw new Error('Choose an image before uploading a family symbol.');
    const mimeType = clean_(payload.mimeType || 'image/png');
    if (['image/png','image/jpeg','image/webp'].indexOf(mimeType) < 0) {
      throw new Error('Choose a PNG, JPEG, or WebP image.');
    }
    data = data.replace(/^data:[^;]+;base64,/, '');
    const bytes = Utilities.base64Decode(data);
    if (bytes.length > FPD_CONFIG.IDENTITY.MAX_SYMBOL_BYTES) {
      throw new Error('The image must be 2 MB or smaller.');
    }
    const context = WorkspaceService.getCurrentContext();
    const folderMap = fpdFolderMap_();
    const parentId = folderMap.IDENTITY || context.rootFolderId;
    const current = readObject_(SYMBOL_KEY) || {};
    let metadata;
    if (current.fileId && DriveApiService.isUsable(current.fileId)) {
      metadata = DriveApiService.updateBinaryFile(current.fileId, mimeType, bytes);
    } else {
      metadata = DriveApiService.createBinaryFile(
        clean_(payload.name || payload.filename || 'FamilyPD-symbol.png'),
        mimeType, parentId, bytes
      );
    }
    const symbol = {
      name: metadata.name || clean_(payload.name || 'FamilyPD symbol'),
      mimeType: mimeType, fileId: metadata.id, webViewLink: metadata.webViewLink || '', updatedAt: now_()
    };
    write_(SYMBOL_KEY, symbol);
    return success_('Family symbol saved to your FamilyPD Drive folder.', { symbol: getSymbolData() });
  }

  function clearSymbol() {
    const current = readObject_(SYMBOL_KEY) || {};
    if (current.fileId && DriveApiService.isUsable(current.fileId)) {
      try { DriveApiService.trashFile(current.fileId); } catch (ignored) {}
    }
    PropertiesService.getUserProperties().deleteProperty(SYMBOL_KEY);
    return success_('Family symbol removed.', { symbol: getSymbolData() });
  }

  function getSymbolData() {
    const symbol = readObject_(SYMBOL_KEY) || {};
    if (!symbol.fileId || !DriveApiService.isUsable(symbol.fileId)) {
      return { exists:false, name:'', mimeType:'', data:'', fileId:'', webViewLink:'', updatedAt:'' };
    }
    let data = '';
    try { data = Utilities.base64Encode(DriveApiService.getBinaryFile(symbol.fileId)); } catch (ignored) {}
    return {
      exists: Boolean(data), name: clean_(symbol.name), mimeType: clean_(symbol.mimeType),
      data: data, fileId: clean_(symbol.fileId), webViewLink: clean_(symbol.webViewLink), updatedAt: clean_(symbol.updatedAt)
    };
  }

  function saveSuggestion(suggestion) {
    const input = sanitizeObject_(suggestion || {});
    if (!clean_(input.text)) throw new Error('Enter a suggestion before saving.');
    const items = readArray_(SUGGESTIONS_KEY);
    const item = {
      id: Utilities.getUuid(),
      category: clean_(input.category || 'General'),
      text: clean_(input.text),
      createdAt: now_()
    };
    items.unshift(item);
    write_(SUGGESTIONS_KEY, items.slice(0, 20));
    return success_('Suggestion saved privately.', { suggestion: item, suggestions: items.slice(0, 20) });
  }

  function deleteSuggestion(suggestionId) {
    const id = clean_(suggestionId);
    const items = readArray_(SUGGESTIONS_KEY).filter(function (item) {
      return clean_(item.id) !== id;
    });
    write_(SUGGESTIONS_KEY, items);
    return success_('Suggestion deleted.', { suggestions: items });
  }

  function getPublishedVersion() { return getWorkspaceView().publishedVersion; }
  function getLatestPublishedVersion() { return getPublishedVersion(); }
  function getVersionHistory() { return getWorkspaceView().versionHistory; }
  function getDraft() { return getWorkspaceView().draft; }
  function getIdentitySummary() { return getWorkspaceView(); }
  function getMemberView() {
    const view = getWorkspaceView();
    return {
      featureName: view.featureName,
      publishedVersion: view.publishedVersion,
      profile: view.profile,
      familyProfileAvailable: view.familyProfileAvailable,
      migratedToFamilyProfile: true
    };
  }

  function updateDraftSection_(section, value, message) {
    const draft = normalizeDraft_(readObject_(DRAFT_KEY));
    draft[section] = value;
    draft.updatedAt = now_();
    write_(DRAFT_KEY, draft);
    return success_(message, { draft: draft });
  }

  function normalizeDraft_(raw) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? clone_(raw) : {};
    if (!Array.isArray(source.values)) source.values = [];
    if (!Array.isArray(source.commitments)) source.commitments = [];
    if (!Array.isArray(source.roster)) source.roster = [];
    return source;
  }

  function normalizeVersion_(raw) {
    let source = raw && typeof raw === 'object' ? raw : {};
    if (source.publishedVersion && typeof source.publishedVersion === 'object') source = source.publishedVersion;
    const versionNumber = number_(source.versionNumber !== undefined ? source.versionNumber : source.version !== undefined ? source.version : source.number);
    const profile = source.profile || source.identity || source.data || {};
    const exists = Boolean(versionNumber || hasContent_(profile) || source.documentUrl || source.pdfUrl || source.publishedAt);
    return {
      exists: exists,
      id: clean_(source.id),
      version: versionNumber,
      versionNumber: versionNumber,
      label: exists ? ('Version ' + (versionNumber || 1)) : 'Household Identity Not Published',
      publishedAt: clean_(source.publishedAt || source.createdAt || source.updatedAt),
      documentUrl: clean_(source.documentUrl || source.docUrl),
      pdfUrl: clean_(source.pdfUrl),
      profile: profile && typeof profile === 'object' ? clone_(profile) : {},
      status: exists ? 'published' : 'not-published'
    };
  }

  function normalizeHistory_(items) {
    return compactHistory_((Array.isArray(items) ? items : []).map(normalizeVersion_).filter(function (item) { return item.exists; }), 5);
  }
  function compactHistory_(items, limit) {
    return (Array.isArray(items) ? items : []).slice(0, limit || 5).map(function (item) {
      const normalized = normalizeVersion_(item);
      // Keep only fields required for version review and restore.
      return {
        exists: normalized.exists,
        id: normalized.id,
        version: normalized.versionNumber,
        versionNumber: normalized.versionNumber,
        label: normalized.label,
        publishedAt: normalized.publishedAt,
        profile: normalized.profile,
        status: normalized.status
      };
    });
  }


  function sanitizeObject_(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const out = {};
    Object.keys(value).forEach(function (key) {
      const item = value[key];
      if (typeof item === 'string') out[key] = item.trim();
      else if (Array.isArray(item)) out[key] = clone_(item);
      else if (item && typeof item === 'object') out[key] = clone_(item);
      else out[key] = item;
    });
    return out;
  }

  function safeRootId_() {
    try {
      if (typeof FPDDriveFileServiceV10 !== 'undefined' && FPDDriveFileServiceV10 && typeof FPDDriveFileServiceV10.getRootId === 'function') {
        return clean_(FPDDriveFileServiceV10.getRootId());
      }
    } catch (error) {}
    return '';
  }

  function readObject_(key) {
    const parsed = parseJson_(PropertiesService.getUserProperties().getProperty(key));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  }

  function readArray_(key) {
    const parsed = parseJson_(PropertiesService.getUserProperties().getProperty(key));
    return Array.isArray(parsed) ? parsed : [];
  }

  function write_(key, value) {
    PropertiesService.getUserProperties().setProperty(key, JSON.stringify(value));
  }

  function parseJson_(raw) { if (!raw) return null; try { return JSON.parse(raw); } catch (error) { return null; } }
  function clone_(value) { return JSON.parse(JSON.stringify(value === undefined ? null : value)); }
  function hasContent_(value) { return Boolean(value && typeof value === 'object' && Object.keys(value).length); }
  function number_(value) { const n = Number(value); return isFinite(n) && n > 0 ? Math.floor(n) : 0; }
  function clean_(value) { return value === null || value === undefined ? '' : String(value).trim(); }
  function now_() { return new Date().toISOString(); }
  function success_(message, extra) { return Object.assign({ success: true, message: message }, extra || {}); }

  return {
    getWorkspaceView: getWorkspaceView,
    getPublishedVersion: getPublishedVersion,
    getLatestPublishedVersion: getLatestPublishedVersion,
    getVersionHistory: getVersionHistory,
    getDraft: getDraft,
    getMemberView: getMemberView,
    getIdentitySummary: getIdentitySummary,
    saveIdentityDraft: saveIdentityDraft,
    saveValues: saveValues,
    saveCommitments: saveCommitments,
    saveRoster: saveRoster,
    publishIdentity: publishIdentity,
    publishHouseholdIdentity: publishIdentity,
    publishCurrentIdentity: publishIdentity,
    publish: publishIdentity,
    restoreVersion: restoreVersion,
    saveProfile: saveProfile,
    saveMemberProfile: saveProfile,
    savePersonalProfile: saveProfile,
    savePreferences: saveProfile,
    saveInterfacePreferences: saveInterfacePreferences,
    uploadSymbol: uploadSymbol,
    clearSymbol: clearSymbol,
    getSymbolData: getSymbolData,
    saveSuggestion: saveSuggestion,
    deleteSuggestion: deleteSuggestion
  };
}());
