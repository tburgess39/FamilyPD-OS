/**
 * JSON data store kept inside files created by FamilyPD.
 *
 * No Google Sheet is used as a hidden database. This avoids requesting
 * permission to view or edit the user's unrelated spreadsheets.
 */

const DataStoreService = (function() {

  function createInitialData(role, workspaceId) {
    fpdAssertRole_(role);
    const now = fpdNow_();
    const shared = createEmptyShared_(role, now);

    return {
      meta: {
        appName: FPD_CONFIG.APP_NAME,
        appVersion: FPD_CONFIG.APP_VERSION,
        schemaVersion: FPD_CONFIG.SCHEMA_VERSION,
        workspaceId: workspaceId,
        role: role,
        createdAt: now,
        updatedAt: now,
        privacyMode: 'DATA_MINIMIZATION',
        containsSensitiveData: false
      },

      shared: shared,

      draft: role === FPD_CONFIG.ROLE.LEAD
        ? createDraftFromShared_(shared)
        : null,

      identityHistory: [],

      personal: {
        profile: createEmptyProfile_(role),
        goals: [],
        checkpoints: [],
        meetingPreparation: [],
        learningPlans: [],
        learningProgress: [],
        reflections: [],
        discussionResponses: [],
        savedResources: [],
        savedOpportunities: [],
        identitySuggestions: []
      },

      activity: [
        {
          id: fpdNewId_('LOG'),
          type: 'WORKSPACE_CREATED',
          summary: 'Privacy-first FamilyPD workspace created.',
          createdAt: now
        }
      ]
    };
  }


  function createInitialSources(workspaceId) {
    const now = fpdNow_();
    const guidebookSourceId = 'FPD-GUIDEBOOK-2025';

    return {
      meta: {
        schemaVersion: FPD_CONFIG.SCHEMA_VERSION,
        workspaceId: workspaceId,
        createdAt: now,
        updatedAt: now
      },
      sources: [
        {
          id: guidebookSourceId,
          sourceType: 'Guidebook',
          authorOrOrganization: FPD_CONFIG.GUIDEBOOK.AUTHOR,
          year: FPD_CONFIG.GUIDEBOOK.YEAR,
          title: FPD_CONFIG.GUIDEBOOK.TITLE,
          format: FPD_CONFIG.GUIDEBOOK.FORMATS,
          publisher: '',
          url: FPD_CONFIG.GUIDEBOOK_URL,
          lastVerifiedDate: now.substring(0, 10),
          status: 'Published',
          apaReferenceOverride: FPD_CONFIG.GUIDEBOOK.APA_REFERENCE
        },
        opportunitySource_(
          'FPD-CAREERONESTOP-2026',
          'U.S. Department of Labor, Employment and Training Administration',
          'CareerOneStop: Career exploration, training, scholarships, and local help',
          'https://www.careeronestop.org/',
          'Government-sponsored source'
        ),
        opportunitySource_(
          'FPD-ONET-2026',
          'National Center for O*NET Development',
          'O*NET OnLine career exploration and occupation information',
          'https://www.onetonline.org/',
          'Government-sponsored source'
        ),
        opportunitySource_(
          'FPD-APPRENTICESHIP-2026',
          'U.S. Department of Labor',
          'Apprenticeship.gov Apprenticeship Job Finder',
          'https://www.apprenticeship.gov/apprenticeship-job-finder',
          'Official government source'
        ),
        opportunitySource_(
          'FPD-STUDENTAID-2026',
          'Federal Student Aid, U.S. Department of Education',
          'Federal Student Aid and the FAFSA form',
          'https://studentaid.gov/h/apply-for-aid/fafsa',
          'Official government source'
        ),
        opportunitySource_(
          'FPD-USA-BENEFITS-2026',
          'USA.gov',
          'Government benefits and financial help finder',
          'https://www.usa.gov/benefit-finder',
          'Official government source'
        ),
        opportunitySource_(
          'FPD-SBA-2026',
          'U.S. Small Business Administration',
          'SBA local assistance and resource partners',
          'https://www.sba.gov/local-assistance',
          'Official government source'
        ),
        opportunitySource_(
          'FPD-JOBCORPS-2026',
          'U.S. Department of Labor',
          'Job Corps career training and education',
          'https://www.jobcorps.gov/',
          'Official government source'
        ),
        opportunitySource_(
          'FPD-AMERICORPS-2026',
          'AmeriCorps',
          'AmeriCorps service opportunities',
          'https://www.americorps.gov/join',
          'Official government source'
        )
      ],
      contentCitations: [
        {
          id: 'FPD-CITATION-IDENTITY-GUIDANCE',
          contentId: 'IDENTITY_GUIDANCE',
          sourceId: guidebookSourceId,
          displayOrder: 1,
          locator: 'pp. 17–20, 97–98',
          inTextOverride: '(Hall, 2025, pp. 17–20, 97–98)'
        },
        {
          id: 'FPD-CITATION-GOALS-GUIDANCE',
          contentId: 'GOALS_GUIDANCE',
          sourceId: guidebookSourceId,
          displayOrder: 1,
          locator: 'pp. 50–55',
          inTextOverride: '(Hall, 2025, pp. 50–55)'
        },
        {
          id: 'FPD-CITATION-MEETING-GUIDANCE',
          contentId: 'MEETING_GUIDANCE',
          sourceId: guidebookSourceId,
          displayOrder: 1,
          locator: 'pp. 17–20, 54, 57–63',
          inTextOverride: '(Hall, 2025, pp. 17–20, 54, 57–63)'
        },
        {
          id: 'FPD-CITATION-LEARNING-GUIDANCE',
          contentId: 'LEARNING_GUIDANCE',
          sourceId: guidebookSourceId,
          displayOrder: 1,
          locator: 'pp. 20–23',
          inTextOverride: '(Hall, 2025, pp. 20–23)'
        },
        {
          id: 'FPD-CITATION-SYSTEMS-GUIDANCE',
          contentId: 'SYSTEMS_GUIDANCE',
          sourceId: guidebookSourceId,
          displayOrder: 1,
          locator: 'pp. 15–20, 57–63',
          inTextOverride: '(Hall, 2025, pp. 15–20, 57–63)'
        },
        {
          id: 'FPD-CITATION-OPPORTUNITY-GUIDANCE',
          contentId: 'OPPORTUNITY_GUIDANCE',
          sourceId: guidebookSourceId,
          displayOrder: 1,
          locator: 'pp. 34–41, 106–108',
          inTextOverride: '(Hall, 2025, pp. 34–41, 106–108)'
        }
      ],
      citationPolicy: {
        inTextCitationsRequired: true,
        referencesSectionRequired: true,
        lastVerifiedDateRequiredForWebContent: true,
        dataYearRequiredForStatistics: true
      }
    };
  }


  function readData() {
    const context = WorkspaceService.getCurrentContext();
    const text = DriveApiService.getTextFile(context.dataFileId);
    const data = fpdParseJson_(text, null);

    if (!data || !data.meta) {
      throw new Error('The FamilyPD data file is damaged or unreadable.');
    }

    const result = migrateData_(data, context.role);

    if (result.changed) {
      saveData(result.data);
    }

    return result.data;
  }


  function saveData(data) {
    const context = WorkspaceService.getCurrentContext();
    data.meta.updatedAt = fpdNow_();
    data.meta.appVersion = FPD_CONFIG.APP_VERSION;
    data.meta.schemaVersion = FPD_CONFIG.SCHEMA_VERSION;
    data.meta.containsSensitiveData = false;

    DriveApiService.updateTextFile(
      context.dataFileId,
      'application/json',
      JSON.stringify(data, null, 2)
    );

    context.props.setProperties({
      [fpdPropertyKey_('SCHEMA_VERSION')]: FPD_CONFIG.SCHEMA_VERSION,
      [fpdPropertyKey_('UPDATED_AT')]: fpdNow_()
    });

    return data;
  }


  function readSources() {
    const context = WorkspaceService.getCurrentContext();
    const text = DriveApiService.getTextFile(context.sourceFileId);
    const data = fpdParseJson_(text, null);

    if (!data || !data.meta) {
      throw new Error('The FamilyPD source file is damaged or unreadable.');
    }

    const migrated = migrateSources_(data);

    if (migrated.changed) {
      saveSources(migrated.data);
    }

    return migrated.data;
  }


  function saveSources(data) {
    const context = WorkspaceService.getCurrentContext();
    data.meta.updatedAt = fpdNow_();
    data.meta.schemaVersion = FPD_CONFIG.SCHEMA_VERSION;

    DriveApiService.updateTextFile(
      context.sourceFileId,
      'application/json',
      JSON.stringify(data, null, 2)
    );

    return data;
  }


  function appendActivity(data, type, summary) {
    data.activity = Array.isArray(data.activity) ? data.activity : [];
    data.activity.unshift({
      id: fpdNewId_('LOG'),
      type: fpdSafeText_(type, 80),
      summary: fpdSafeText_(summary, 300),
      createdAt: fpdNow_()
    });

    data.activity = data.activity.slice(0, 100);
    return data;
  }


  function createEmptyShared_(role, now) {
    return {
      householdId: role === FPD_CONFIG.ROLE.LEAD
        ? fpdNewId_('HOUSEHOLD')
        : '',
      identity: {
        label: 'My Household',
        mission: '',
        vision: '',
        motto: '',
        symbolFileId: '',
        symbolMimeType: '',
        symbolName: '',
        status: 'Not published',
        version: 0,
        updatedAt: ''
      },
      values: [],
      commitments: [],
      memberRoles: [],
      sharedGoals: [],
      meetings: [],
      learningPlans: [],
      assignments: [],
      policies: [],
      safety: [],
      opportunities: [],
      resources: []
    };
  }


  function createDraftFromShared_(shared) {
    return {
      identity: fpdClone_(shared.identity),
      values: fpdClone_(shared.values || []),
      commitments: fpdClone_(shared.commitments || []),
      memberRoles: fpdClone_(shared.memberRoles || []),
      savedAt: '',
      updatedAt: ''
    };
  }


  function createEmptyProfile_(role) {
    return {
      roleLabel: role === FPD_CONFIG.ROLE.LEAD
        ? 'Household Lead'
        : 'Family Member',
      ageGroup: 'Not specified',
      learningFormat: 'No preference',
      checkInRhythm: 'No preference',
      sharingPreference: 'Ask me each time',
      accessibilityNotes: '',
      language: 'en',
      simpleLanguage: false,
      largeText: false,
      tutorialCompleted: false,
      updatedAt: ''
    };
  }


  function migrateData_(data, role) {
    let changed = false;
    const now = fpdNow_();

    data.meta = data.meta || {};
    data.meta.role = data.meta.role || role;
    data.meta.privacyMode = 'DATA_MINIMIZATION';
    data.meta.containsSensitiveData = false;

    if (!data.shared) {
      data.shared = createEmptyShared_(role, now);
      changed = true;
    }

    const emptyShared = createEmptyShared_(role, now);
    Object.keys(emptyShared).forEach(function(key) {
      if (!Object.prototype.hasOwnProperty.call(data.shared, key)) {
        data.shared[key] = fpdClone_(emptyShared[key]);
        changed = true;
      }
    });

    data.shared.identity = Object.assign(
      {},
      emptyShared.identity,
      data.shared.identity || {}
    );

    if (role === FPD_CONFIG.ROLE.LEAD && !data.draft) {
      data.draft = createDraftFromShared_(data.shared);
      changed = true;
    }

    if (role !== FPD_CONFIG.ROLE.LEAD && data.draft) {
      data.draft = null;
      changed = true;
    }

    if (!Array.isArray(data.identityHistory)) {
      data.identityHistory = [];
      changed = true;
    }

    if (!data.personal) {
      data.personal = {};
      changed = true;
    }

    if (!data.personal.profile) {
      data.personal.profile = createEmptyProfile_(role);
      changed = true;
    } else {
      data.personal.profile = Object.assign(
        {},
        createEmptyProfile_(role),
        data.personal.profile
      );
    }

    [
      'goals',
      'checkpoints',
      'meetingPreparation',
      'learningPlans',
      'learningProgress',
      'reflections',
      'discussionResponses',
      'savedResources',
      'savedOpportunities',
      'identitySuggestions'
    ].forEach(function(key) {
      if (!Array.isArray(data.personal[key])) {
        data.personal[key] = [];
        changed = true;
      }
    });

    if (!Array.isArray(data.activity)) {
      data.activity = [];
      changed = true;
    }

    if (data.meta.schemaVersion !== FPD_CONFIG.SCHEMA_VERSION ||
        data.meta.appVersion !== FPD_CONFIG.APP_VERSION) {
      data.meta.schemaVersion = FPD_CONFIG.SCHEMA_VERSION;
      data.meta.appVersion = FPD_CONFIG.APP_VERSION;
      changed = true;
    }

    return { data: data, changed: changed };
  }


  function migrateSources_(data) {
    let changed = false;
    data.sources = Array.isArray(data.sources) ? data.sources : [];
    data.contentCitations = Array.isArray(data.contentCitations)
      ? data.contentCitations
      : [];

    const guidebook = data.sources.find(function(source) {
      return String(source.id || '') === 'FPD-GUIDEBOOK-2025';
    });

    if (!guidebook) {
      const seeded = createInitialSources(data.meta.workspaceId || '');
      data.sources.unshift(seeded.sources[0]);
      data.contentCitations.unshift(seeded.contentCitations[0]);
      changed = true;
    } else {
      const correctedGuidebook = {
        authorOrOrganization: FPD_CONFIG.GUIDEBOOK.AUTHOR,
        year: FPD_CONFIG.GUIDEBOOK.YEAR,
        title: FPD_CONFIG.GUIDEBOOK.TITLE,
        format: FPD_CONFIG.GUIDEBOOK.FORMATS,
        publisher: '',
        url: FPD_CONFIG.GUIDEBOOK_URL,
        status: 'Published',
        apaReferenceOverride: FPD_CONFIG.GUIDEBOOK.APA_REFERENCE
      };
      Object.keys(correctedGuidebook).forEach(function(key) {
        if (guidebook[key] !== correctedGuidebook[key]) {
          guidebook[key] = correctedGuidebook[key];
          changed = true;
        }
      });
      guidebook.lastVerifiedDate = fpdNow_().substring(0, 10);
    }

    const identityCitation = data.contentCitations.find(function(item) {
      return String(item.id || '') === 'FPD-CITATION-IDENTITY-GUIDANCE';
    });
    if (identityCitation &&
        (identityCitation.locator !== 'pp. 17–20, 97–98' ||
         identityCitation.inTextOverride !== '(Hall, 2025, pp. 17–20, 97–98)')) {
      identityCitation.locator = 'pp. 17–20, 97–98';
      identityCitation.inTextOverride = '(Hall, 2025, pp. 17–20, 97–98)';
      changed = true;
    }

    const goalsCitation = data.contentCitations.find(function(item) {
      return String(item.id || '') === 'FPD-CITATION-GOALS-GUIDANCE';
    });
    if (!goalsCitation) {
      data.contentCitations.push({
        id: 'FPD-CITATION-GOALS-GUIDANCE',
        contentId: 'GOALS_GUIDANCE',
        sourceId: 'FPD-GUIDEBOOK-2025',
        displayOrder: 1,
        locator: 'pp. 50–55',
        inTextOverride: '(Hall, 2025, pp. 50–55)'
      });
      changed = true;
    } else if (goalsCitation.locator !== 'pp. 50–55' ||
               goalsCitation.inTextOverride !== '(Hall, 2025, pp. 50–55)') {
      goalsCitation.locator = 'pp. 50–55';
      goalsCitation.inTextOverride = '(Hall, 2025, pp. 50–55)';
      changed = true;
    }

    const meetingCitation = data.contentCitations.find(function(item) {
      return String(item.id || '') === 'FPD-CITATION-MEETING-GUIDANCE';
    });
    if (!meetingCitation) {
      data.contentCitations.push({
        id: 'FPD-CITATION-MEETING-GUIDANCE',
        contentId: 'MEETING_GUIDANCE',
        sourceId: 'FPD-GUIDEBOOK-2025',
        displayOrder: 1,
        locator: 'pp. 17–20, 54, 57–63',
        inTextOverride: '(Hall, 2025, pp. 17–20, 54, 57–63)'
      });
      changed = true;
    } else if (meetingCitation.locator !== 'pp. 17–20, 54, 57–63' ||
               meetingCitation.inTextOverride !==
                 '(Hall, 2025, pp. 17–20, 54, 57–63)') {
      meetingCitation.locator = 'pp. 17–20, 54, 57–63';
      meetingCitation.inTextOverride =
        '(Hall, 2025, pp. 17–20, 54, 57–63)';
      changed = true;
    }

    const learningCitation = data.contentCitations.find(function(item) {
      return String(item.id || '') === 'FPD-CITATION-LEARNING-GUIDANCE';
    });
    if (!learningCitation) {
      data.contentCitations.push({
        id: 'FPD-CITATION-LEARNING-GUIDANCE',
        contentId: 'LEARNING_GUIDANCE',
        sourceId: 'FPD-GUIDEBOOK-2025',
        displayOrder: 1,
        locator: 'pp. 20–23',
        inTextOverride: '(Hall, 2025, pp. 20–23)'
      });
      changed = true;
    } else if (learningCitation.locator !== 'pp. 20–23' ||
               learningCitation.inTextOverride !== '(Hall, 2025, pp. 20–23)') {
      learningCitation.locator = 'pp. 20–23';
      learningCitation.inTextOverride = '(Hall, 2025, pp. 20–23)';
      changed = true;
    }

    const systemsCitation = data.contentCitations.find(function(item) {
      return String(item.id || '') === 'FPD-CITATION-SYSTEMS-GUIDANCE';
    });
    if (!systemsCitation) {
      data.contentCitations.push({
        id: 'FPD-CITATION-SYSTEMS-GUIDANCE',
        contentId: 'SYSTEMS_GUIDANCE',
        sourceId: 'FPD-GUIDEBOOK-2025',
        displayOrder: 1,
        locator: 'pp. 15–20, 57–63',
        inTextOverride: '(Hall, 2025, pp. 15–20, 57–63)'
      });
      changed = true;
    } else if (systemsCitation.locator !== 'pp. 15–20, 57–63' ||
               systemsCitation.inTextOverride !==
                 '(Hall, 2025, pp. 15–20, 57–63)') {
      systemsCitation.locator = 'pp. 15–20, 57–63';
      systemsCitation.inTextOverride =
        '(Hall, 2025, pp. 15–20, 57–63)';
      changed = true;
    }

    if (ensureOpportunitySources_(data)) changed = true;

    const opportunityCitation = data.contentCitations.find(function(item) {
      return String(item.id || '') === 'FPD-CITATION-OPPORTUNITY-GUIDANCE';
    });
    if (!opportunityCitation) {
      data.contentCitations.push({
        id: 'FPD-CITATION-OPPORTUNITY-GUIDANCE',
        contentId: 'OPPORTUNITY_GUIDANCE',
        sourceId: 'FPD-GUIDEBOOK-2025',
        displayOrder: 1,
        locator: 'pp. 34–41, 106–108',
        inTextOverride: '(Hall, 2025, pp. 34–41, 106–108)'
      });
      changed = true;
    } else if (opportunityCitation.locator !== 'pp. 34–41, 106–108' ||
               opportunityCitation.inTextOverride !==
                 '(Hall, 2025, pp. 34–41, 106–108)') {
      opportunityCitation.locator = 'pp. 34–41, 106–108';
      opportunityCitation.inTextOverride =
        '(Hall, 2025, pp. 34–41, 106–108)';
      changed = true;
    }

    if (!data.citationPolicy) {
      data.citationPolicy = createInitialSources(
        data.meta.workspaceId || ''
      ).citationPolicy;
      changed = true;
    }

    if (data.meta.schemaVersion !== FPD_CONFIG.SCHEMA_VERSION) {
      data.meta.schemaVersion = FPD_CONFIG.SCHEMA_VERSION;
      changed = true;
    }

    return { data: data, changed: changed };
  }


  function opportunitySource_(id, organization, title, url, status) {
    return {
      id: id,
      sourceType: 'Official web resource',
      authorOrOrganization: organization,
      year: '2026',
      title: title,
      format: 'Website',
      publisher: '',
      url: url,
      lastVerifiedDate: FPD_CONFIG.OPPORTUNITIES.SOURCE_REVIEW_DATE,
      status: status,
      apaReferenceOverride: ''
    };
  }


  function ensureOpportunitySources_(data) {
    const seeded = createInitialSources(data.meta.workspaceId || '');
    const requiredIds = {
      'FPD-CAREERONESTOP-2026': true,
      'FPD-ONET-2026': true,
      'FPD-APPRENTICESHIP-2026': true,
      'FPD-STUDENTAID-2026': true,
      'FPD-USA-BENEFITS-2026': true,
      'FPD-SBA-2026': true,
      'FPD-JOBCORPS-2026': true,
      'FPD-AMERICORPS-2026': true
    };
    let changed = false;

    seeded.sources.forEach(function(source) {
      if (!requiredIds[source.id]) return;
      const existing = data.sources.find(function(item) {
        return String(item.id || '') === source.id;
      });

      if (!existing) {
        data.sources.push(source);
        changed = true;
        return;
      }

      const before = JSON.stringify(existing);
      Object.assign(existing, source);
      if (JSON.stringify(existing) !== before) changed = true;
    });

    return changed;
  }


  return {
    createInitialData: createInitialData,
    createInitialSources: createInitialSources,
    readData: readData,
    saveData: saveData,
    readSources: readSources,
    saveSources: saveSources,
    appendActivity: appendActivity
  };
})();
