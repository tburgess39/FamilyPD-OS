/**
 * FamilyPD web app entry points.
 * doGet intentionally performs no Drive calls.
 */

function doGet(e) {
  if (e && e.parameter && e.parameter.share === 'family-profile' && e.parameter.token) {
    return fpdRenderSharedFamilyProfile_(e.parameter.token);
  }
  var template = HtmlService.createTemplateFromFile('Index');
  template.initialLinkContext = JSON.stringify({
    joinToken: e && e.parameter ? String(e.parameter.join || '') : '',
    sharedToken: e && e.parameter ? String(e.parameter.shared || '') : ''
  });
  return template.evaluate().setTitle(FPD_CONFIG.APP_NAME);
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function getBootstrap() {
  const props = PropertiesService.getUserProperties();
  const configured =
    Boolean(props.getProperty(fpdPropertyKey_('ROOT_FOLDER_ID'))) &&
    Boolean(props.getProperty(fpdPropertyKey_('DATA_FILE_ID'))) &&
    Boolean(props.getProperty(fpdPropertyKey_('ROLE')));

  return {
    appName: FPD_CONFIG.APP_NAME,
    appVersion: FPD_CONFIG.APP_VERSION,
    schemaVersion: FPD_CONFIG.SCHEMA_VERSION,
    configured: configured,
    workspace: configured ? WorkspaceService.getStoredSummary() : null,
    security: SecurityService.getPublicSecurityInfo(),
    privacy: {
      message:
        'FamilyPD is designed for non-sensitive planning information. ' +
        'Do not enter or upload confidential personal, financial, medical, educational, identity, or security information.',
      forbiddenExamples: FPD_CONFIG.PRIVACY_RULES.forbiddenExamples
    },
    roleOptions: [
      {
        value: FPD_CONFIG.ROLE.LEAD,
        title: 'Set Up and Manage a Household',
        description:
          'Organize shared FamilyPD identity, meetings, goals, learning, policies, and non-sensitive update packs.'
      },
      {
        value: FPD_CONFIG.ROLE.MEMBER,
        title: 'Join as a Family Member',
        description:
          'Review shared household information and manage personal goals, learning, meeting preparation, and selected progress.'
      }
    ]
  };
}


function buildWorkspace(role) {
  fpdAssertRole_(role);

  return fpdWithUserLock_(function() {
    return WorkspaceService.buildOrRepair(role);
  });
}


function getWorkspaceHealth() {
  return WorkspaceService.checkHealth();
}


function repairWorkspace() {
  return fpdWithUserLock_(function() {
    return WorkspaceService.repairCurrent();
  });
}


function disconnectWorkspace() {
  WorkspaceService.disconnect();
  return {
    success: true,
    message:
      'FamilyPD has been disconnected from this browser account. ' +
      'No Drive folders or files were deleted.'
  };
}


function getIdentityWorkspace() {
  return IdentityService.getWorkspaceView();
}


function getGuidanceSupport(language) {
  return GuidanceService.getGuidanceData(language);
}


function generateGuidedIdentity(payload) {
  return GuidanceService.generateIdentitySuggestions(payload);
}


function saveInterfacePreferences(preferences) {
  return fpdWithUserLock_(function() {
    if (typeof IdentityService !== 'undefined' &&
        IdentityService &&
        typeof IdentityService.saveInterfacePreferences === 'function') {
      return IdentityService.saveInterfacePreferences(preferences);
    }

    // Compatibility path for deployments that still contain an older
    // IdentityService object. This prevents language switching from failing
    // while users replace the remaining files in a staged update.
    const data = DataStoreService.readData();
    const profile = data.personal && data.personal.profile
      ? data.personal.profile
      : {};
    const input = preferences || {};

    profile.language = GuidanceService.normalizeLanguage(
      input.language || profile.language || 'en'
    );
    profile.simpleLanguage = Boolean(input.simpleLanguage);
    profile.largeText = Boolean(input.largeText);
    if (Object.prototype.hasOwnProperty.call(input, 'tutorialCompleted')) {
      profile.tutorialCompleted = Boolean(input.tutorialCompleted);
    }
    profile.updatedAt = fpdNow_();

    data.personal = data.personal || {};
    data.personal.profile = profile;
    DataStoreService.appendActivity(
      data,
      'INTERFACE_PREFERENCES_SAVED',
      'Language and accessibility preferences saved through compatibility mode.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      compatibilityMode: true,
      message: profile.language === 'es'
        ? 'Se guardaron las preferencias de idioma y accesibilidad.'
        : 'Language and accessibility preferences saved.',
      profile: fpdClone_(profile),
      guidance: GuidanceService.getGuidanceData(profile.language)
    };
  });
}


function saveIdentityDraft(payload) {
  return fpdWithUserLock_(function() {
    return IdentityService.saveIdentityDraft(payload);
  });
}


function saveHouseholdValues(values) {
  return fpdWithUserLock_(function() {
    return IdentityService.saveValues(values);
  });
}


function saveHouseholdCommitments(commitments) {
  return fpdWithUserLock_(function() {
    return IdentityService.saveCommitments(commitments);
  });
}


function saveHouseholdRoster(records) {
  return fpdWithUserLock_(function() {
    return IdentityService.saveRoster(records);
  });
}


function publishHouseholdIdentity() {
  return fpdWithUserLock_(function() {
    const candidates = [
      'publishIdentity',
      'publishHouseholdIdentity',
      'publishCurrentIdentity',
      'publish'
    ];

    for (let i = 0; i < candidates.length; i += 1) {
      const methodName = candidates[i];
      if (typeof IdentityService !== 'undefined' &&
          IdentityService &&
          typeof IdentityService[methodName] === 'function') {
        return IdentityService[methodName]();
      }
    }

    throw new Error(
      'The installed IdentityService does not include a compatible publish method. ' +
      'Replace IdentityService.gs with the current FamilyPD source-of-truth file before publishing.'
    );
  });
}


function restoreHouseholdIdentityVersion(versionId) {
  return fpdWithUserLock_(function() {
    return IdentityService.restoreVersion(versionId);
  });
}


function uploadHouseholdSymbol(filePayload) {
  return fpdWithUserLock_(function() {
    return IdentityService.uploadSymbol(filePayload);
  });
}


function clearHouseholdSymbol() {
  return fpdWithUserLock_(function() {
    return IdentityService.clearSymbol();
  });
}


function getHouseholdSymbol() {
  return IdentityService.getSymbolData();
}


function saveMemberProfile(profile) {
  return fpdWithUserLock_(function() {
    const candidates = [
      'saveProfile',
      'saveMemberProfile',
      'savePersonalProfile',
      'savePreferences'
    ];

    for (let i = 0; i < candidates.length; i += 1) {
      const methodName = candidates[i];
      if (typeof IdentityService !== 'undefined' &&
          IdentityService &&
          typeof IdentityService[methodName] === 'function') {
        return IdentityService[methodName](profile);
      }
    }

    // Safe compatibility fallback: profile preferences live in the personal
    // section of the FamilyPD data file and are never published automatically.
    const data = DataStoreService.readData();
    const existing = data.personal && data.personal.profile
      ? data.personal.profile
      : {};
    const input = profile || {};

    const updated = Object.assign({}, existing, {
      roleLabel: fpdSafeText_(input.roleLabel || existing.roleLabel, 120),
      ageGroup: fpdSafeText_(input.ageGroup || existing.ageGroup, 120),
      learningFormat: fpdSafeText_(input.learningFormat || existing.learningFormat, 120),
      checkInRhythm: fpdSafeText_(input.checkInRhythm || existing.checkInRhythm, 120),
      sharingPreference: fpdSafeText_(input.sharingPreference || existing.sharingPreference, 160),
      accessibilityNotes: fpdSafeText_(input.accessibilityNotes || '', 1000),
      language: GuidanceService.normalizeLanguage(input.language || existing.language || 'en'),
      simpleLanguage: Boolean(input.simpleLanguage),
      largeText: Boolean(input.largeText),
      tutorialCompleted: Boolean(input.tutorialCompleted),
      updatedAt: fpdNow_()
    });

    data.personal = data.personal || {};
    data.personal.profile = updated;
    DataStoreService.appendActivity(
      data,
      'MEMBER_PROFILE_SAVED',
      'Member profile preferences saved through compatibility mode.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      compatibilityMode: true,
      message: updated.language === 'es'
        ? 'Se guardaron las preferencias del perfil.'
        : 'Profile preferences saved.',
      profile: fpdClone_(updated)
    };
  });
}


function saveIdentitySuggestion(suggestion) {
  return fpdWithUserLock_(function() {
    return IdentityService.saveSuggestion(suggestion);
  });
}


function deleteIdentitySuggestion(suggestionId) {
  return fpdWithUserLock_(function() {
    return IdentityService.deleteSuggestion(suggestionId);
  });
}


function generateIdentityPdf() {
  return fpdWithUserLock_(function() {
    if (typeof IdentityDocumentService !== 'undefined' &&
        IdentityDocumentService &&
        typeof IdentityDocumentService.generatePublishedIdentityPdf === 'function') {
      return IdentityDocumentService.generatePublishedIdentityPdf();
    }

    // Identity publishing is complete even when the optional PDF service is
    // not installed. Return a non-fatal response so the FamilyPD OS does not
    // crash after saving or publishing the Family Profile.
    const published = (typeof IdentityService !== 'undefined' &&
      IdentityService &&
      typeof IdentityService.getPublishedVersion === 'function')
      ? IdentityService.getPublishedVersion()
      : null;

    return {
      success: true,
      pdfCreated: false,
      optionalFeatureUnavailable: true,
      message: 'Family Profile saved and published. PDF export is not installed in this workspace yet.',
      publishedVersion: published
    };
  });
}


function getGoalsWorkspace(language) {
  return GoalsService.getWorkspaceView(language);
}


function generateGuidedGoal(payload) {
  return GoalsService.generateGoalDraft(payload);
}


function saveGoalRecord(payload) {
  return fpdWithUserLock_(function() {
    return GoalsService.saveGoal(payload);
  });
}


function saveGoalCheckpoint(payload) {
  return fpdWithUserLock_(function() {
    return GoalsService.saveCheckpoint(payload);
  });
}


function toggleGoalStep(payload) {
  return fpdWithUserLock_(function() {
    return GoalsService.toggleStep(payload);
  });
}


function archiveGoalRecord(payload) {
  return fpdWithUserLock_(function() {
    return GoalsService.archiveGoal(payload);
  });
}


function generateGoalPlanPdf(scope, goalId) {
  return fpdWithUserLock_(function() {
    return GoalDocumentService.generateGoalPdf(scope, goalId);
  });
}



function getMeetingsWorkspace(language) {
  return FPDMeetingServiceV71.getWorkspaceView(language);
}


function saveMeetingRecord(payload) {
  return fpdWithUserLock_(function() {
    return FPDMeetingServiceV71.saveMeeting(payload);
  });
}


function duplicateMeetingRecord(meetingId, language) {
  return fpdWithUserLock_(function() {
    return FPDMeetingServiceV71.duplicateMeeting(meetingId, language);
  });
}


function archiveMeetingRecord(meetingId, language) {
  return fpdWithUserLock_(function() {
    return FPDMeetingServiceV71.archiveMeeting(meetingId, language);
  });
}


function carryForwardMeetingItems(meetingId, language) {
  return FPDMeetingServiceV71.carryForward(meetingId, language);
}


function saveMeetingPreparation(payload) {
  return fpdWithUserLock_(function() {
    return FPDMeetingServiceV71.saveMemberPreparation(payload);
  });
}


function findRecentMeetingNews(pillar, language) {
  return NewsService.searchRecentNews(pillar, language);
}


function checkMeetingArticleLink(url, language) {
  return NewsService.checkArticleLink(url, language);
}


function generateMeetingDocument(meetingId, documentType, language) {
  return fpdWithUserLock_(function() {
    return MeetingDocumentService.generateMeetingPdf(
      meetingId,
      documentType,
      language
    );
  });
}



function getFamilyPDResourceHub(language) {
  return FPDResourceHubServiceV93.getHub(language);
}


function getLearningWorkspace(language) {
  return LearningService.getWorkspaceView(language);
}


function generateGuidedLearningPlan(payload) {
  return LearningService.generateFromLibrary(payload);
}


function saveLearningPlanRecord(payload) {
  return fpdWithUserLock_(function() {
    return LearningService.savePlan(payload);
  });
}


function archiveLearningPlanRecord(payload) {
  return fpdWithUserLock_(function() {
    return LearningService.archivePlan(payload);
  });
}


function saveLearningReflection(payload) {
  return fpdWithUserLock_(function() {
    return LearningService.saveResponse(payload);
  });
}


function checkLearningResourceLink(url) {
  return ResourceVerificationService.checkResourceLink(url);
}


function generateLearningPlanDocument(scope, planId, language) {
  return fpdWithUserLock_(function() {
    return LearningDocumentService.generateLearningPdf(
      scope,
      planId,
      language
    );
  });
}



function getSystemsWorkspace(language) {
  return FPDSystemsServiceV8.getWorkspaceView(language);
}


function generateGuidedSystemRecord(payload) {
  return FPDSystemsServiceV8.generateFromTemplate(payload);
}


function saveSystemRecord(payload) {
  return fpdWithUserLock_(function() {
    return FPDSystemsServiceV8.saveRecord(payload);
  });
}


function archiveSystemRecord(payload) {
  return fpdWithUserLock_(function() {
    return FPDSystemsServiceV8.archiveRecord(payload);
  });
}


function markSystemReviewed(payload) {
  return fpdWithUserLock_(function() {
    return FPDSystemsServiceV8.markReviewed(payload);
  });
}


function generateSystemDocument(recordType, recordId, language) {
  return fpdWithUserLock_(function() {
    return FPDSystemsDocumentServiceV8.generatePdf(
      recordType,
      recordId,
      language
    );
  });
}


function getOpportunityWorkspace(language) {
  return FPDOpportunityServiceV9.getWorkspaceView(language);
}


function searchOpportunitySources(payload) {
  return FPDOpportunityServiceV9.searchSources(payload);
}


function checkOpportunityLink(url, language) {
  return FPDOpportunityServiceV9.checkLink(url, language);
}


function saveOpportunityRecord(payload) {
  return fpdWithUserLock_(function() {
    return FPDOpportunityServiceV9.saveRecord(payload);
  });
}


function archiveOpportunityRecord(payload) {
  return fpdWithUserLock_(function() {
    return FPDOpportunityServiceV9.archiveRecord(payload);
  });
}


function copySharedOpportunityToPersonal(recordId, language) {
  return fpdWithUserLock_(function() {
    return FPDOpportunityServiceV9.copySharedToPersonal(recordId, language);
  });
}


function generateOpportunityDocument(scope, recordId, language) {
  return fpdWithUserLock_(function() {
    return FPDOpportunityDocumentServiceV9.generatePdf(
      scope,
      recordId,
      language
    );
  });
}


function createHouseholdUpdatePack() {
  return UpdatePackService.createPack();
}


function previewHouseholdUpdatePack(csvText) {
  return UpdatePackService.previewPack(csvText);
}


function applyHouseholdUpdatePack(csvText, allowHouseholdChange) {
  return fpdWithUserLock_(function() {
    return UpdatePackService.applyPack(
      csvText,
      Boolean(allowHouseholdChange)
    );
  });
}


function getCitationPreview(contentId) {
  return CitationService.getCitationPreview(contentId);
}


function createRecoveryKeyDownload() {
  return WorkspaceService.createRecoveryKeyPayload();
}


function fpdWithUserLock_(callback) {
  const lock = LockService.getUserLock();

  if (!lock.tryLock(30000)) {
    throw new Error(
      'A FamilyPD workspace operation is already running. ' +
      'Wait a moment and try again.'
    );
  }

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}


/** Returns a safe FamilyPD OS link that opens the family-member onboarding path. */
function fpdGetFamilyMemberInviteLink() {
  var base = '';
  try { base = ScriptApp.getService().getUrl() || ''; } catch (error) {}
  if (!base) throw new Error('Deploy FamilyPD OS as a web app before creating an invitation link.');
  return {
    url: base + (base.indexOf('?') >= 0 ? '&' : '?') + 'join=family-member',
    message: 'Open this FamilyPD OS invitation link and sign in with your own Google account. Choose Join as a Family Member. The Household Lead will send a separate Family Sharing File containing only approved shared information.'
  };
}

/** Returns a Google sign-out URL that reopens this deployment for account selection. */
function fpdGetGoogleAccountSwitchUrl() {
  var base = '';
  try { base = ScriptApp.getService().getUrl() || ''; } catch (error) {}
  if (!base) throw new Error('The FamilyPD OS web app URL is unavailable.');
  return 'https://accounts.google.com/Logout?continue=' + encodeURIComponent(base);
}


/** Removes imported shared household records for a Family Member while preserving private personal records. */
function fpdDisconnectImportedHousehold(){
  return fpdWithUserLock_(function(){
    var props=PropertiesService.getUserProperties();
    var keys=['FPD_IDENTITY_PUBLISHED','FPD_HOUSEHOLD_IDENTITY_PUBLISHED','FAMILY_PD_IDENTITY_PUBLISHED','FPD_IDENTITY_HISTORY','FPD_HOUSEHOLD_IDENTITY_HISTORY','FAMILY_PD_IDENTITY_HISTORY','FPD_IMPORTED_HOUSEHOLD_ID','FPD_IMPORTED_HOUSEHOLD_LABEL','FPD_LAST_UPDATE_PACK'];
    keys.forEach(function(k){props.deleteProperty(k);});
    return {message:'Disconnected from the shared household. Private personal information remains in this workspace.'};
  });
}


/** Creates a revocable, view-only link for the currently published Family Profile. */
function fpdCreateFamilyProfileShareLink() {
  return fpdWithUserLock_(function() {
    var published = IdentityService.getPublishedVersion();
    if (!published || !published.exists || !published.profile) {
      throw new Error('Publish the Family Profile before creating a share link.');
    }
    var token = Utilities.getUuid().replace(/-/g, '');
    var safe = fpdSafeSharedProfile_(published);
    PropertiesService.getScriptProperties().setProperty('FPD_PUBLIC_PROFILE_' + token, JSON.stringify(safe));
    var base = ScriptApp.getService().getUrl() || '';
    return {url: base + '?share=family-profile&token=' + encodeURIComponent(token), message: 'View-only Family Profile link created. Anyone with this link can view the approved profile information shown in the preview.'};
  });
}

function fpdSafeSharedProfile_(published) {
  var p = published.profile || {};
  return {
    label: String(p.label || p.householdLabel || 'Family Profile'),
    mission: String(p.mission || ''), vision: String(p.vision || ''), motto: String(p.motto || ''),
    values: Array.isArray(p.values) ? p.values.map(function(v){return String(v.name || v);}).slice(0,12) : [],
    commitments: Array.isArray(p.commitments) ? p.commitments.map(function(v){return String(v.text || v);}).slice(0,12) : [],
    versionNumber: published.versionNumber || published.version || 1,
    publishedAt: published.publishedAt || '', createdAt: new Date().toISOString()
  };
}

function fpdRenderSharedFamilyProfile_(token) {
  var raw = PropertiesService.getScriptProperties().getProperty('FPD_PUBLIC_PROFILE_' + String(token || ''));
  if (!raw) return HtmlService.createHtmlOutput('<h1>Family Profile link unavailable</h1><p>This link may be invalid or no longer available.</p>').setTitle('FamilyPD Shared Profile');
  var p = JSON.parse(raw);
  function esc(v){return String(v||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var vals=(p.values||[]).map(function(v){return '<li>'+esc(v)+'</li>';}).join('');
  var com=(p.commitments||[]).map(function(v){return '<li>'+esc(v)+'</li>';}).join('');
  var html='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(p.label)+'</title><style>body{font-family:Arial,sans-serif;background:#f6f3ec;color:#17233c;margin:0}.wrap{max-width:820px;margin:auto;padding:28px}.card{background:white;border-radius:18px;padding:28px;box-shadow:0 8px 28px rgba(0,0,0,.08)}h1{color:#17233c}.motto{font-size:1.2rem;font-weight:700;color:#b85c00}.section{margin-top:24px}li{margin:.45rem 0}.note{margin-top:24px;padding:14px;background:#fff4dc;border-radius:12px}</style></head><body><main class="wrap"><div class="card"><div>FamilyPD OS · Shared Family Profile</div><h1>'+esc(p.label)+'</h1><p class="motto">'+esc(p.motto)+'</p><div class="section"><h2>Mission</h2><p>'+esc(p.mission)+'</p></div><div class="section"><h2>Vision</h2><p>'+esc(p.vision)+'</p></div><div class="section"><h2>Values</h2><ul>'+vals+'</ul></div><div class="section"><h2>Commitments</h2><ul>'+com+'</ul></div><p class="note">This is a view-only profile intentionally shared by a FamilyPD household. It does not provide access to private records, journals, files, or Google Drive.</p></div></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(p.label + ' · FamilyPD');
}


function fpdCreateHouseholdInvite(){ return FPDSharingServiceV114.createHouseholdInvite(); }
function fpdPreviewHouseholdInvite(token){ return FPDSharingServiceV114.previewHouseholdInvite(token); }
function fpdJoinHouseholdByLink(token){ return FPDSharingServiceV114.joinHousehold(token); }
function fpdGetHouseholdConnection(){ return FPDSharingServiceV114.getConnectionStatus(); }
function fpdDisconnectHouseholdLink(){ return FPDSharingServiceV114.disconnectHousehold(); }
function fpdListShareableItems(){ return FPDSharingServiceV114.listShareableItems(); }
function fpdCreateItemShare(type,id){ return FPDSharingServiceV114.createItemShare(type,id); }
function fpdPreviewItemShare(token){ return FPDSharingServiceV114.previewItemShare(token); }
function fpdImportItemShare(token){ return FPDSharingServiceV114.importItemShare(token); }
function fpdListReceivedItems(){ return FPDSharingServiceV114.listReceivedItems(); }

/**
 * One-time FamilyPD property-storage cleanup.
 * Preserves the active draft, published Family Profile, member profile,
 * workspace connection, current projects, and imported dashboard items.
 * Removes duplicate legacy keys and compacts unbounded history/list records.
 */
function fpdRepairPropertyStorageQuota() {
  return fpdWithUserLock_(function () {
    var props = PropertiesService.getUserProperties();
    var before = fpdPropertyUsageSummary_(props.getProperties());

    // Remove duplicate legacy aliases only when the canonical value exists.
    var canonicalAliases = {
      'FPD_IDENTITY_DRAFT': ['FPD_HOUSEHOLD_IDENTITY_DRAFT', 'FAMILY_PD_IDENTITY_DRAFT'],
      'FPD_IDENTITY_PUBLISHED': ['FPD_HOUSEHOLD_IDENTITY_PUBLISHED', 'FAMILY_PD_IDENTITY_PUBLISHED'],
      'FPD_IDENTITY_HISTORY': ['FPD_HOUSEHOLD_IDENTITY_HISTORY', 'FAMILY_PD_IDENTITY_HISTORY']
    };
    Object.keys(canonicalAliases).forEach(function (canonical) {
      if (props.getProperty(canonical)) {
        canonicalAliases[canonical].forEach(function (alias) { props.deleteProperty(alias); });
      }
    });

    fpdCompactJsonArrayProperty_(props, 'FPD_IDENTITY_HISTORY', 5);
    fpdCompactJsonArrayProperty_(props, 'FPD_IDENTITY_SUGGESTIONS', 20);
    fpdCompactJsonArrayProperty_(props, 'FPD_PROJECT_STUDIO_V11', 25);
    fpdCompactJsonArrayProperty_(props, 'FPD_RECEIVED_ITEMS_V114', 25);

    // Old imported-pack metadata can be recreated and is not required for
    // the current connected-household record or current Family Profile.
    ['FPD_LAST_UPDATE_PACK'].forEach(function (key) { props.deleteProperty(key); });

    // Base64 images can consume most of User Properties. Remove only the
    // embedded data when it is unusually large; retain name/type metadata.
    var symbolRaw = props.getProperty('FPD_IDENTITY_SYMBOL');
    if (symbolRaw) {
      try {
        var symbol = JSON.parse(symbolRaw);
        if (symbol && String(symbol.data || '').length > 7000) {
          symbol.data = '';
          symbol.storageNotice = 'Large symbol removed during storage repair. Upload a smaller image or reconnect it through Drive.';
          props.setProperty('FPD_IDENTITY_SYMBOL', JSON.stringify(symbol));
        }
      } catch (error) {
        props.deleteProperty('FPD_IDENTITY_SYMBOL');
      }
    }

    fpdCleanupExpiredSharingTokens_();

    var after = fpdPropertyUsageSummary_(props.getProperties());
    return {
      success: true,
      message: 'FamilyPD storage was repaired. Your active Family Profile, personal profile, projects, and current household connection were preserved.',
      beforeBytes: before.bytes,
      afterBytes: after.bytes,
      freedBytes: Math.max(0, before.bytes - after.bytes),
      propertyCount: after.count,
      largestProperties: after.largest
    };
  });
}

function fpdCompactJsonArrayProperty_(props, key, limit) {
  var raw = props.getProperty(key);
  if (!raw) return;
  try {
    var rows = JSON.parse(raw);
    if (!Array.isArray(rows)) return;
    props.setProperty(key, JSON.stringify(rows.slice(0, limit)));
  } catch (error) {
    props.deleteProperty(key);
  }
}

function fpdPropertyUsageSummary_(all) {
  var rows = Object.keys(all || {}).map(function (key) {
    return { key: key, bytes: Utilities.newBlob(String(all[key] || '')).getBytes().length };
  }).sort(function (a, b) { return b.bytes - a.bytes; });
  return {
    count: rows.length,
    bytes: rows.reduce(function (sum, row) { return sum + row.bytes; }, 0),
    largest: rows.slice(0, 10)
  };
}

function fpdGetPropertyStorageStatus() {
  return fpdPropertyUsageSummary_(PropertiesService.getUserProperties().getProperties());
}

function fpdCleanupExpiredSharingTokens_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var now = Date.now();
  Object.keys(all).forEach(function (key) {
    if (key.indexOf('FPD_INVITE_') !== 0 && key.indexOf('FPD_SHARED_ITEM_') !== 0 && key.indexOf('FPD_PUBLIC_PROFILE_') !== 0) return;
    try {
      var item = JSON.parse(all[key]);
      var expiration = item.expiresAt ? new Date(item.expiresAt).getTime() : 0;
      if (expiration && expiration < now) props.deleteProperty(key);
    } catch (error) {
      props.deleteProperty(key);
    }
  });
}
