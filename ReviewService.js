/**
 * FamilyPD Progress Review Center
 * Build 8.1
 *
 * This file is intentionally namespaced with a versioned global to avoid
 * collisions with earlier FamilyPD service files.
 */
const FPDReviewServiceV80 = (function () {
  'use strict';

  const DATA_KEY = 'FPD_PROGRESS_REVIEW_CENTER_V1';
  const CACHE_KEY = 'FPD_PROGRESS_REVIEW_BOOTSTRAP_V3';
  const CACHE_SECONDS = 300;
  const DATE_FORMAT = 'yyyy-MM-dd';

  const PILLARS = [
    { key: 'health', label: 'Health' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'education', label: 'Education' },
    { key: 'finances', label: 'Finances' },
    { key: 'goals', label: 'Goals' }
  ];

  const DEFAULT_FOLDERS = {
    profile: '01 Family Profile & Values',
    meetings: '02 Family Meetings',
    pillars: '03 Five Pillars',
    goals: '04 Goals & Action Plans',
    safety: '05 Safety & Preparedness',
    generated: '06 Generated PDFs',
    archive: '99 Archive'
  };

  function getBootstrap(forceRefresh) {
    const cache = CacheService.getUserCache();
    if (!forceRefresh) {
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        try {
          const cachedResult = JSON.parse(cached);
          const liveStatus = FPDDriveFileServiceV10.diagnoseRoot();
          const cachedConnected = Boolean(cachedResult.workspace && cachedResult.workspace.connected);
          const liveConnected = Boolean(liveStatus && liveStatus.connected);
          if (cachedConnected === liveConnected) {
            cachedResult.workspace = liveStatus;
            if (cachedResult.files) cachedResult.files.workspace = liveStatus;
            return cachedResult;
          }
          // The connection changed since caching; rebuild file lists immediately.
        } catch (error) {
          // Ignore a malformed cache or unavailable Drive status and rebuild it.
        }
      }
    }

    const store = readStore_();
    const today = today_();
    const files = discoverWorkspaceFiles_();
    const nextMeeting = discoverNextMeeting_(files.meetings || []);
    const goals = store.goals.map(function (goal) {
      return decorateGoal_(goal, today);
    });
    const reviews = store.reviews.slice().sort(sortNewestFirst_);

    const result = {
      generatedAt: new Date().toISOString(),
      today: today,
      pillars: buildPillarSummary_(goals, reviews),
      goals: goals.sort(sortGoals_),
      reviews: reviews,
      summary: buildSummary_(goals, reviews, nextMeeting),
      nextMeeting: nextMeeting,
      files: files,
      workspace: files.workspace,
      options: {
        pillars: PILLARS,
        cadences: [
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ],
        goalStatuses: [
          { value: 'active', label: 'Active' },
          { value: 'paused', label: 'Paused' },
          { value: 'completed', label: 'Completed' }
        ],
        reviewPeriods: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' }
        ]
      }
    };

    try {
      cache.put(CACHE_KEY, JSON.stringify(result), CACHE_SECONDS);
    } catch (error) {
      // A large file list can exceed cache size. The app still works without it.
    }
    return result;
  }

  function saveGoal(input) {
    const source = input || {};
    const store = readStore_();
    const now = new Date().toISOString();
    const id = clean_(source.id) || Utilities.getUuid();
    const existingIndex = store.goals.findIndex(function (goal) {
      return goal.id === id;
    });

    const goal = {
      id: id,
      title: requiredText_(source.title, 'Enter a goal title.'),
      pillar: allowed_(source.pillar, PILLARS.map(function (item) { return item.key; }), 'goals'),
      cadence: allowed_(source.cadence, ['weekly', 'monthly', 'yearly'], 'monthly'),
      targetDate: optionalDate_(source.targetDate),
      status: allowed_(source.status, ['active', 'paused', 'completed'], 'active'),
      progress: clampNumber_(source.progress, 0, 100),
      checkpoint: clean_(source.checkpoint),
      notes: clean_(source.notes),
      createdAt: existingIndex >= 0 ? store.goals[existingIndex].createdAt : now,
      updatedAt: now
    };

    if (goal.status === 'completed') goal.progress = 100;

    if (existingIndex >= 0) {
      store.goals[existingIndex] = goal;
    } else {
      store.goals.push(goal);
    }

    writeStore_(store);
    clearCache();
    return { ok: true, goal: decorateGoal_(goal, today_()), data: getBootstrap(true) };
  }

  function deleteGoal(id) {
    const cleanId = requiredText_(id, 'A goal ID is required.');
    const store = readStore_();
    const originalLength = store.goals.length;
    store.goals = store.goals.filter(function (goal) {
      return goal.id !== cleanId;
    });

    if (store.goals.length === originalLength) {
      throw new Error('The selected goal could not be found.');
    }

    writeStore_(store);
    clearCache();
    return { ok: true, data: getBootstrap(true) };
  }

  function saveReview(input) {
    const source = input || {};
    const store = readStore_();
    const now = new Date().toISOString();
    const id = clean_(source.id) || Utilities.getUuid();
    const existingIndex = store.reviews.findIndex(function (review) {
      return review.id === id;
    });
    const ratings = {};

    PILLARS.forEach(function (pillar) {
      ratings[pillar.key] = clampNumber_(source.ratings && source.ratings[pillar.key], 1, 5);
    });

    const review = {
      id: id,
      periodType: allowed_(source.periodType, ['monthly', 'quarterly'], 'monthly'),
      periodLabel: requiredText_(source.periodLabel, 'Enter the month or quarter being reviewed.'),
      reviewDate: optionalDate_(source.reviewDate) || today_(),
      ratings: ratings,
      wins: clean_(source.wins),
      needsAttention: clean_(source.needsAttention),
      decisions: clean_(source.decisions),
      nextSteps: clean_(source.nextSteps),
      nextMeetingDate: optionalDate_(source.nextMeetingDate),
      notes: clean_(source.notes),
      createdAt: existingIndex >= 0 ? store.reviews[existingIndex].createdAt : now,
      updatedAt: now
    };

    if (existingIndex >= 0) {
      store.reviews[existingIndex] = review;
    } else {
      store.reviews.push(review);
    }

    writeStore_(store);
    clearCache();
    return { ok: true, review: review, data: getBootstrap(true) };
  }

  function deleteReview(id) {
    const cleanId = requiredText_(id, 'A review ID is required.');
    const store = readStore_();
    const originalLength = store.reviews.length;
    store.reviews = store.reviews.filter(function (review) {
      return review.id !== cleanId;
    });

    if (store.reviews.length === originalLength) {
      throw new Error('The selected review could not be found.');
    }

    writeStore_(store);
    clearCache();
    return { ok: true, data: getBootstrap(true) };
  }

  function getReviewById(id) {
    const cleanId = requiredText_(id, 'A review ID is required.');
    const store = readStore_();
    const review = store.reviews.find(function (item) {
      return item.id === cleanId;
    });
    if (!review) throw new Error('The selected review could not be found.');
    return JSON.parse(JSON.stringify(review));
  }

  function getWorkspaceRoot() {
    try {
      return FPDDriveFileServiceV10.getRootMetadata();
    } catch (error) {
      return null;
    }
  }

  function getWorkspaceFolder(folderKeyOrName, createIfMissing) {
    const root = getWorkspaceRoot();
    if (!root || !root.id) return null;
    const names = configuredFolderNames_();
    const name = names[folderKeyOrName] || folderKeyOrName;
    try {
      return createIfMissing
        ? FPDDriveFileServiceV10.getOrCreateChildFolder(root.id, name)
        : FPDDriveFileServiceV10.findChildFolder(root.id, name);
    } catch (error) {
      return null;
    }
  }

  function clearCache() {
    CacheService.getUserCache().remove(CACHE_KEY);
    return { ok: true };
  }

  function buildSummary_(goals, reviews, nextMeeting) {
    const active = goals.filter(function (goal) { return goal.status === 'active'; });
    const completed = goals.filter(function (goal) { return goal.status === 'completed'; });
    const overdue = active.filter(function (goal) { return goal.isOverdue; });
    const dueSoon = active.filter(function (goal) { return goal.isDueSoon; });
    const averageProgress = active.length
      ? Math.round(active.reduce(function (sum, goal) { return sum + goal.progress; }, 0) / active.length)
      : 0;

    return {
      activeGoals: active.length,
      completedGoals: completed.length,
      overdueGoals: overdue.length,
      dueSoonGoals: dueSoon.length,
      averageProgress: averageProgress,
      totalReviews: reviews.length,
      latestReview: reviews.length ? reviews[0] : null,
      nextMeetingDate: nextMeeting ? nextMeeting.date : ''
    };
  }

  function buildPillarSummary_(goals, reviews) {
    const latestReview = reviews.length ? reviews[0] : null;
    return PILLARS.map(function (pillar) {
      const matchingGoals = goals.filter(function (goal) {
        return goal.pillar === pillar.key && goal.status === 'active';
      });
      const goalProgress = matchingGoals.length
        ? Math.round(matchingGoals.reduce(function (sum, goal) { return sum + goal.progress; }, 0) / matchingGoals.length)
        : null;
      const rating = latestReview && latestReview.ratings
        ? Number(latestReview.ratings[pillar.key] || 0)
        : 0;
      const ratingProgress = rating ? rating * 20 : null;
      let score = 0;
      let source = 'Not yet rated';

      if (goalProgress !== null && ratingProgress !== null) {
        score = Math.round((goalProgress + ratingProgress) / 2);
        source = 'Goals + latest review';
      } else if (goalProgress !== null) {
        score = goalProgress;
        source = 'Active goals';
      } else if (ratingProgress !== null) {
        score = ratingProgress;
        source = 'Latest review';
      }

      return {
        key: pillar.key,
        label: pillar.label,
        score: score,
        source: source,
        activeGoals: matchingGoals.length,
        rating: rating
      };
    });
  }

  function discoverWorkspaceFiles_() {
    const result = {
      workspace: {
        found: false,
        connected: false,
        rootName: configuredRootName_(),
        rootUrl: '',
        message: 'Workspace status has not been checked.'
      },
      profile: [],
      meetings: [],
      goals: [],
      generated: [],
      recent: []
    };

    let diagnosis;
    try {
      diagnosis = FPDDriveFileServiceV10.diagnoseRoot();
    } catch (error) {
      diagnosis = {
        connected: false,
        rootId: '',
        message: clean_(error && error.message) || 'The FamilyPD Workspace could not be checked.'
      };
    }

    result.workspace = {
      found: Boolean(diagnosis && diagnosis.connected),
      connected: Boolean(diagnosis && diagnosis.connected),
      rootId: clean_(diagnosis && diagnosis.rootId),
      rootName: clean_(diagnosis && diagnosis.rootName) || configuredRootName_(),
      rootUrl: clean_(diagnosis && diagnosis.rootUrl),
      message: clean_(diagnosis && diagnosis.message) || 'Open Workspace Setup to connect the FamilyPD Workspace.'
    };
    if (!result.workspace.connected) return result;

    const root = getWorkspaceRoot();
    if (!root || !root.id) {
      result.workspace.connected = false;
      result.workspace.found = false;
      result.workspace.message = 'The saved FamilyPD Workspace could not be opened. Open Workspace Setup and reconnect it.';
      return result;
    }

    try {
      const folderMap = configuredFolderNames_();
      result.profile = listFolderFiles_(findChildFolder_(root, folderMap.profile), 'profile', 20);
      result.meetings = listFolderFiles_(findChildFolder_(root, folderMap.meetings), 'meeting', 25);
      result.goals = listFolderFiles_(findChildFolder_(root, folderMap.goals), 'goal', 25);
      result.generated = listFolderFiles_(findChildFolder_(root, folderMap.generated), 'generated', 25);

      result.recent = result.profile
        .concat(result.meetings, result.goals, result.generated)
        .sort(function (a, b) {
          return String(b.modifiedAt).localeCompare(String(a.modifiedAt));
        })
        .slice(0, 20);
    } catch (error) {
      result.workspace.message = 'The Progress Center loaded, but prior Drive files could not be listed. ' +
        (clean_(error && error.message) || 'Open Workspace Setup to verify the connection.');
      result.workspace.filesAvailable = false;
    }
    return result;
  }

  function listFolderFiles_(folder, category, limit) {
    if (!folder || !folder.id) return [];
    let files = [];
    try {
      files = FPDDriveFileServiceV10.listFiles(folder.id, limit);
    } catch (error) {
      return [];
    }
    return files.map(function (file) {
      return {
        id: file.id,
        name: file.name || '',
        url: file.webViewLink || 'https://drive.google.com/open?id=' + encodeURIComponent(file.id),
        mimeType: file.mimeType || '',
        modifiedAt: file.modifiedTime || '',
        category: category,
        editable: isGoogleEditorType_(file.mimeType || '')
      };
    }).sort(function (a, b) {
      return String(b.modifiedAt).localeCompare(String(a.modifiedAt));
    });
  }

  function discoverNextMeeting_(meetingFiles) {
    const fromService = discoverNextMeetingFromService_();
    if (fromService) return fromService;

    const today = today_();
    const datedFiles = (meetingFiles || []).map(function (file) {
      const date = extractDateFromText_(file.name);
      return date ? {
        title: file.name,
        date: date,
        url: file.url,
        source: 'Workspace file'
      } : null;
    }).filter(Boolean).filter(function (item) {
      return item.date >= today;
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

    return datedFiles.length ? datedFiles[0] : null;
  }

  function discoverNextMeetingFromService_() {
    try {
      if (typeof FPDMeetingServiceV71 === 'undefined' || !FPDMeetingServiceV71) return null;
      const methodNames = [
        'getUpcomingMeetings',
        'listUpcomingMeetings',
        'getMeetings',
        'listMeetings',
        'getDashboardData',
        'getData'
      ];

      for (let i = 0; i < methodNames.length; i += 1) {
        const methodName = methodNames[i];
        if (typeof FPDMeetingServiceV71[methodName] !== 'function') continue;
        const raw = FPDMeetingServiceV71[methodName]();
        const items = extractMeetingArray_(raw);
        const normalized = items.map(normalizeMeeting_).filter(Boolean).filter(function (item) {
          return item.date >= today_();
        }).sort(function (a, b) {
          return a.date.localeCompare(b.date);
        });
        if (normalized.length) return normalized[0];
      }
    } catch (error) {
      // The review center remains usable even if an older meeting service differs.
    }
    return null;
  }

  function extractMeetingArray_(raw) {
    if (Array.isArray(raw)) return raw;
    if (!raw || typeof raw !== 'object') return [];
    const keys = ['meetings', 'upcomingMeetings', 'items', 'records', 'data'];
    for (let i = 0; i < keys.length; i += 1) {
      if (Array.isArray(raw[keys[i]])) return raw[keys[i]];
    }
    return [];
  }

  function normalizeMeeting_(source) {
    if (!source || typeof source !== 'object') return null;
    const date = normalizeDateValue_(
      source.date || source.meetingDate || source.startDate || source.scheduledDate || source.start
    );
    if (!date) return null;
    return {
      title: clean_(source.title || source.topic || source.name || 'Family meeting'),
      date: date,
      time: clean_(source.time || source.startTime),
      url: clean_(source.url || source.documentUrl || source.fileUrl),
      source: 'Meeting planner'
    };
  }

  function decorateGoal_(goal, today) {
    const copy = JSON.parse(JSON.stringify(goal));
    const target = copy.targetDate || '';
    const daysUntil = target ? daysBetween_(today, target) : null;
    copy.daysUntil = daysUntil;
    copy.isOverdue = copy.status === 'active' && daysUntil !== null && daysUntil < 0;
    copy.isDueSoon = copy.status === 'active' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 14;
    return copy;
  }

  function readStore_() {
    const raw = PropertiesService.getUserProperties().getProperty(DATA_KEY);
    if (!raw) return { version: 1, goals: [], reviews: [] };
    try {
      const parsed = JSON.parse(raw);
      return {
        version: 1,
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : []
      };
    } catch (error) {
      return { version: 1, goals: [], reviews: [] };
    }
  }

  function writeStore_(store) {
    PropertiesService.getUserProperties().setProperty(DATA_KEY, JSON.stringify(store));
  }

  function configuredRootId_() {
    const properties = PropertiesService.getUserProperties();
    const candidates = [
      properties.getProperty('FPD_WORKSPACE_ROOT_ID'),
      properties.getProperty('FPD_WORKSPACE_FOLDER_ID'),
      properties.getProperty('FAMILY_PD_WORKSPACE_ID')
    ];
    try {
      if (typeof FPD_CONFIG !== 'undefined' && FPD_CONFIG) {
        candidates.unshift(FPD_CONFIG.ROOT_FOLDER_ID, FPD_CONFIG.WORKSPACE_FOLDER_ID);
      }
    } catch (error) {
      // Config is optional for this module.
    }
    return candidates.map(clean_).find(Boolean) || '';
  }

  function configuredRootName_() {
    try {
      if (typeof FPD_CONFIG !== 'undefined' && FPD_CONFIG && clean_(FPD_CONFIG.ROOT_FOLDER_NAME)) {
        return clean_(FPD_CONFIG.ROOT_FOLDER_NAME);
      }
    } catch (error) {
      // Use the stable default.
    }
    return 'FamilyPD Workspace';
  }

  function configuredFolderNames_() {
    const names = Object.assign({}, DEFAULT_FOLDERS);
    try {
      if (typeof FPD_CONFIG !== 'undefined' && FPD_CONFIG && FPD_CONFIG.FOLDER_NAMES) {
        const configured = FPD_CONFIG.FOLDER_NAMES;
        if (Array.isArray(configured)) {
          configured.forEach(function (name) {
            const text = clean_(name).toLowerCase();
            if (text.indexOf('profile') >= 0 || text.indexOf('value') >= 0) names.profile = name;
            if (text.indexOf('meeting') >= 0) names.meetings = name;
            if (text.indexOf('goal') >= 0 || text.indexOf('action') >= 0) names.goals = name;
            if (text.indexOf('generated') >= 0 || text.indexOf('pdf') >= 0) names.generated = name;
          });
        } else if (typeof configured === 'object') {
          Object.keys(configured).forEach(function (key) {
            const normalizedKey = clean_(key).toLowerCase();
            const value = clean_(configured[key]);
            if (!value) return;
            if (normalizedKey.indexOf('profile') >= 0 || normalizedKey.indexOf('value') >= 0) names.profile = value;
            if (normalizedKey.indexOf('meeting') >= 0) names.meetings = value;
            if (normalizedKey.indexOf('goal') >= 0 || normalizedKey.indexOf('action') >= 0) names.goals = value;
            if (normalizedKey.indexOf('generated') >= 0 || normalizedKey.indexOf('pdf') >= 0) names.generated = value;
          });
        }
      }
    } catch (error) {
      // Use defaults.
    }
    return names;
  }

  function findChildFolder_(parent, name) {
    if (!parent || !parent.id || !name) return null;
    try {
      return FPDDriveFileServiceV10.findChildFolder(parent.id, name);
    } catch (error) {
      return null;
    }
  }

  function isGoogleEditorType_(mimeType) {
    return [
      MimeType.GOOGLE_DOCS,
      MimeType.GOOGLE_SHEETS,
      MimeType.GOOGLE_SLIDES,
      MimeType.GOOGLE_FORMS
    ].indexOf(mimeType) >= 0;
  }

  function extractDateFromText_(value) {
    const text = clean_(value);
    let match = text.match(/(20\d{2})[-_. ](0?[1-9]|1[0-2])[-_. ](0?[1-9]|[12]\d|3[01])/);
    if (match) return match[1] + '-' + pad2_(match[2]) + '-' + pad2_(match[3]);
    match = text.match(/(0?[1-9]|1[0-2])[\/-](0?[1-9]|[12]\d|3[01])[\/-](20\d{2})/);
    return match ? match[3] + '-' + pad2_(match[1]) + '-' + pad2_(match[2]) : '';
  }

  function normalizeDateValue_(value) {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
      return Utilities.formatDate(value, Session.getScriptTimeZone(), DATE_FORMAT);
    }
    const text = clean_(value);
    if (/^20\d{2}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    return extractDateFromText_(text);
  }

  function optionalDate_(value) {
    const text = clean_(value);
    if (!text) return '';
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(text)) throw new Error('Use a valid date.');
    return text;
  }

  function daysBetween_(start, end) {
    const a = new Date(start + 'T12:00:00');
    const b = new Date(end + 'T12:00:00');
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  function today_() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), DATE_FORMAT);
  }

  function sortNewestFirst_(a, b) {
    return String(b.reviewDate || b.updatedAt || '').localeCompare(String(a.reviewDate || a.updatedAt || ''));
  }

  function sortGoals_(a, b) {
    const statusOrder = { active: 0, paused: 1, completed: 2 };
    const aStatus = statusOrder[a.status] === undefined ? 9 : statusOrder[a.status];
    const bStatus = statusOrder[b.status] === undefined ? 9 : statusOrder[b.status];
    if (aStatus !== bStatus) return aStatus - bStatus;
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return String(a.targetDate || '9999-12-31').localeCompare(String(b.targetDate || '9999-12-31'));
  }

  function allowed_(value, allowedValues, fallback) {
    const text = clean_(value);
    return allowedValues.indexOf(text) >= 0 ? text : fallback;
  }

  function requiredText_(value, message) {
    const text = clean_(value);
    if (!text) throw new Error(message);
    return text;
  }

  function clampNumber_(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function clean_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function pad2_(value) {
    return String(value).padStart(2, '0');
  }

  return {
    getBootstrap: getBootstrap,
    saveGoal: saveGoal,
    deleteGoal: deleteGoal,
    saveReview: saveReview,
    deleteReview: deleteReview,
    getReviewById: getReviewById,
    getWorkspaceRoot: getWorkspaceRoot,
    getWorkspaceFolder: getWorkspaceFolder,
    clearCache: clearCache
  };
}());

/** Client-callable endpoints. */
function fpdGetReviewCenterData(forceRefresh) {
  return FPDReviewServiceV80.getBootstrap(Boolean(forceRefresh));
}

function fpdSaveReviewGoal(input) {
  return FPDReviewServiceV80.saveGoal(input);
}

function fpdDeleteReviewGoal(id) {
  return FPDReviewServiceV80.deleteGoal(id);
}

function fpdSaveProgressReview(input) {
  return FPDReviewServiceV80.saveReview(input);
}

function fpdDeleteProgressReview(id) {
  return FPDReviewServiceV80.deleteReview(id);
}

function fpdRefreshReviewCenter() {
  FPDReviewServiceV80.clearCache();
  return FPDReviewServiceV80.getBootstrap(true);
}
