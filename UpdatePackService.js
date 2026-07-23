/**
 * Signed, privacy-filtered Family Sharing Files.
 *
 * Family Sharing Files are CSV files so they can be opened with Google Sheets or Excel.
 * Members import from a local file. FamilyPD does not request permission to
 * browse the member's Google Drive.
 */

const UpdatePackService = (function() {
  const PACKAGE_TYPE = 'FAMILYPD_HOUSEHOLD_UPDATE';
  const HEADERS = [
    'Section',
    'RecordID',
    'Field',
    'Value',
    'Version',
    'UpdatedAt'
  ];


  function createPack() {
    const context = WorkspaceService.getCurrentContext();

    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can create a Family Sharing File.');
    }

    const data = DataStoreService.readData();
    const sources = DataStoreService.readSources();

    if (!Number(data.shared.identity && data.shared.identity.version || 0)) {
      throw new Error(
        'Publish the household identity before creating a Family Sharing File.'
      );
    }

    PrivacyGuardService.validatePayload(
      createPrivacyFilteredSharedSnapshot_(data.shared),
      'Family Sharing File'
    );

    const version = nextPackVersion_(context.props);

    const snapshot = {
      packageType: PACKAGE_TYPE,
      schemaVersion: FPD_CONFIG.SCHEMA_VERSION,
      issuerId: SecurityService.getIssuerId(),
      householdId: data.shared.householdId,
      packageVersion: version,
      generatedAt: fpdNow_(),
      shared: createPrivacyFilteredSharedSnapshot_(data.shared),
      sourceBundle: createSharedSourceBundle_(data.shared, sources)
    };

    addPublishedSymbolToSnapshot_(snapshot.shared.identity, data.shared.identity);

    const canonical = canonicalStringify_(snapshot);
    const signature = SecurityService.signPayload(canonical);
    const csv = snapshotToCsv_(snapshot, signature);
    const filename =
      'FamilyPD_Family_Sharing_File_v' + version + '.csv';

    const folderMap = fpdParseJson_(
      context.props.getProperty(fpdPropertyKey_('FOLDER_MAP_JSON')),
      {}
    );
    const parentId = folderMap.UPDATE_PACKS || context.rootFolderId;

    const driveFile = DriveApiService.createTextFile(
      filename,
      'text/csv',
      parentId,
      csv
    );

    context.props.setProperty(
      fpdPropertyKey_('LAST_UPDATE_PACK_VERSION'),
      String(version)
    );

    DataStoreService.appendActivity(
      data,
      'UPDATE_PACK_CREATED',
      'A privacy-filtered Family Sharing File was created.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'A signed, privacy-filtered Family Sharing File was created.',
      filename: filename,
      mimeType: 'text/csv',
      content: csv,
      packageVersion: version,
      driveFileId: driveFile.id,
      driveFileUrl: driveFile.webViewLink ||
        'https://drive.google.com/open?id=' + encodeURIComponent(driveFile.id),
      privacySummary: [
        'No passwords',
        'No exact addresses',
        'No phone numbers',
        'No financial account details',
        'No medical records',
        'No private reflections'
      ]
    };
  }


  function previewPack(csvText) {
    const context = WorkspaceService.getCurrentContext();

    if (context.role !== FPD_CONFIG.ROLE.MEMBER) {
      throw new Error('Only a Family Member workspace can import a Family Sharing File.');
    }

    const parsed = csvToSnapshot_(csvText);
    validateSnapshot_(parsed.snapshot, parsed.signature);

    const existing = DataStoreService.readData();
    const currentHouseholdId = existing.shared.householdId || '';
    const differentHousehold = Boolean(
      currentHouseholdId &&
      parsed.snapshot.householdId &&
      currentHouseholdId !== parsed.snapshot.householdId
    );

    return {
      success: true,
      verified: true,
      packageType: parsed.snapshot.packageType,
      packageVersion: parsed.snapshot.packageVersion,
      generatedAt: parsed.snapshot.generatedAt,
      householdId: parsed.snapshot.householdId,
      differentHousehold: differentHousehold,
      warning: differentHousehold
        ? 'This verified Family Sharing File belongs to a different household than the one currently connected.'
        : '',
      counts: countSharedRecords_(parsed.snapshot.shared),
      privacyMessage:
        'The Family Sharing File contains only shared FamilyPD planning information. ' +
        'Personal goals, reflections, and files are not included.'
    };
  }


  function applyPack(csvText, allowHouseholdChange) {
    const context = WorkspaceService.getCurrentContext();

    if (context.role !== FPD_CONFIG.ROLE.MEMBER) {
      throw new Error('Only a Family Member workspace can import a Family Sharing File.');
    }

    const parsed = csvToSnapshot_(csvText);
    validateSnapshot_(parsed.snapshot, parsed.signature);

    const data = DataStoreService.readData();
    const currentHouseholdId = data.shared.householdId || '';
    const differentHousehold = Boolean(
      currentHouseholdId &&
      currentHouseholdId !== parsed.snapshot.householdId
    );

    if (differentHousehold && !allowHouseholdChange) {
      throw new Error(
        'This Family Sharing File belongs to a different household. ' +
        'Confirm the household change before applying it.'
      );
    }

    const importedShared = createPrivacyFilteredSharedSnapshot_(
      parsed.snapshot.shared
    );
    importSymbolFromSnapshot_(
      importedShared.identity,
      parsed.snapshot.shared.identity,
      context
    );
    data.shared = importedShared;

    DataStoreService.appendActivity(
      data,
      'UPDATE_PACK_IMPORTED',
      'A verified Family Sharing File was imported.'
    );
    DataStoreService.saveData(data);

    const sources = DataStoreService.readSources();
    sources.sources = parsed.snapshot.sourceBundle.sources || [];
    sources.contentCitations =
      parsed.snapshot.sourceBundle.contentCitations || [];
    DataStoreService.saveSources(sources);

    context.props.setProperties({
      [fpdPropertyKey_('HOUSEHOLD_ID')]: parsed.snapshot.householdId,
      [fpdPropertyKey_('LAST_IMPORTED_PACK_VERSION')]:
        String(parsed.snapshot.packageVersion),
      [fpdPropertyKey_('LAST_IMPORTED_AT')]: fpdNow_()
    });

    return {
      success: true,
      message:
        'Shared household information was updated. ' +
        'Personal goals, reflections, and files were preserved.',
      householdId: parsed.snapshot.householdId,
      packageVersion: parsed.snapshot.packageVersion
    };
  }


  function createPrivacyFilteredSharedSnapshot_(shared) {
    shared = shared || {};

    return {
      householdId: fpdSafeText_(shared.householdId, 120),
      identity: sanitizeIdentity_(shared.identity),
      values: sanitizeRecordList_(shared.values, [
        'id', 'libraryId', 'label', 'description', 'status', 'sortOrder', 'version', 'updatedAt'
      ]),
      commitments: sanitizeRecordList_(shared.commitments, [
        'id', 'statement', 'description', 'status', 'sortOrder', 'version', 'updatedAt'
      ]),
      memberRoles: sanitizeRecordList_(shared.memberRoles, [
        'id', 'rosterLabel', 'customLabel', 'roleLabel', 'roleTitle', 'ageGroup',
        'permissionLabel', 'status', 'responsibilities', 'version', 'updatedAt'
      ]),
      sharedGoals: sanitizeGoalList_(shared.sharedGoals),
      meetings: sanitizeMeetingList_(shared.meetings),
      learningPlans: sanitizeLearningPlanList_(shared.learningPlans),
      assignments: sanitizeRecordList_(shared.assignments, [
        'id', 'title', 'instructions', 'assignedRole', 'assignedDate',
        'dueDate', 'pillar', 'contentId', 'meetingId', 'status', 'updatedAt'
      ]),
      policies: sanitizeSystemPolicyList_(shared.policies),
      safety: sanitizeSafetyPlanList_(shared.safety),
      opportunities: sanitizeOpportunityList_(shared.opportunities),
      resources: sanitizeRecordList_(shared.resources, [
        'id', 'contentId', 'type', 'title', 'sourceName', 'sourceUrl',
        'pillar', 'status', 'updatedAt'
      ])
    };
  }


  function sanitizeIdentity_(identity) {
    identity = identity || {};

    return {
      label: fpdSafeText_(identity.label || 'My Household', 100),
      mission: fpdSafeText_(identity.mission, 2000),
      vision: fpdSafeText_(identity.vision, 2000),
      motto: fpdSafeText_(identity.motto, 300),
      symbolFileId: '',
      symbolMimeType: fpdSafeText_(identity.symbolMimeType, 80),
      symbolName: fpdSafeText_(identity.symbolName, 120),
      status: fpdSafeText_(identity.status || 'Published', 50),
      version: Number(identity.version || 0),
      updatedAt: fpdSafeText_(identity.updatedAt, 50)
    };
  }






  function sanitizeLearningPlanList_(records) {
    if (!Array.isArray(records)) return [];

    return records.slice(0, FPD_CONFIG.LEARNING.MAX_SHARED_PLANS).map(function(record) {
      return {
        id: fpdSafeText_(record && record.id, 120),
        scope: 'HOUSEHOLD',
        title: fpdSafeText_(record && record.title, 200),
        pillar: fpdSafeText_(record && record.pillar, 50),
        status: fpdSafeText_(record && record.status, 50),
        format: fpdSafeText_(record && record.format, 80),
        difficulty: fpdSafeText_(record && record.difficulty, 80),
        estimatedMinutes: Number(record && record.estimatedMinutes || 30),
        facilitatorRole: fpdSafeText_(record && record.facilitatorRole, 120),
        audienceRoles: (Array.isArray(record && record.audienceRoles)
          ? record.audienceRoles : [])
          .slice(0, 25)
          .map(function(value) { return fpdSafeText_(value, 120); }),
        objective: fpdSafeText_(record && record.objective, 1800),
        why: fpdSafeText_(record && record.why, 1200),
        resources: (Array.isArray(record && record.resources)
          ? record.resources : [])
          .slice(0, FPD_CONFIG.LEARNING.MAX_RESOURCES)
          .map(function(resource) {
            return {
              id: fpdSafeText_(resource && resource.id, 120),
              type: fpdSafeText_(resource && resource.type, 100),
              title: fpdSafeText_(resource && resource.title, 500),
              authorOrPublisher: fpdSafeText_(
                resource && resource.authorOrPublisher,
                240
              ),
              year: fpdSafeText_(resource && resource.year, 10),
              url: fpdSafeText_(resource && resource.url, 2000),
              notes: fpdSafeText_(resource && resource.notes, 1000),
              domain: fpdSafeText_(resource && resource.domain, 200),
              verificationStatus: fpdSafeText_(
                resource && resource.verificationStatus,
                50
              ),
              httpStatus: Number(resource && resource.httpStatus || 0),
              lastCheckedAt: fpdSafeText_(
                resource && resource.lastCheckedAt,
                50
              )
            };
          }),
        activities: (Array.isArray(record && record.activities)
          ? record.activities : [])
          .slice(0, FPD_CONFIG.LEARNING.MAX_ACTIVITIES)
          .map(function(value) { return fpdSafeText_(value, 1000); }),
        discussionPrompts: (Array.isArray(record && record.discussionPrompts)
          ? record.discussionPrompts : [])
          .slice(0, FPD_CONFIG.LEARNING.MAX_DISCUSSION_PROMPTS)
          .map(function(value) { return fpdSafeText_(value, 700); }),
        actionStep: fpdSafeText_(record && record.actionStep, 1200),
        reflectionPrompt: fpdSafeText_(record && record.reflectionPrompt, 1200),
        notes: fpdSafeText_(record && record.notes, 3000),
        createdAt: fpdSafeText_(record && record.createdAt, 50),
        updatedAt: fpdSafeText_(record && record.updatedAt, 50),
        completedAt: fpdSafeText_(record && record.completedAt, 50)
      };
    });
  }


  function sanitizeMeetingList_(records) {
    if (!Array.isArray(records)) return [];

    return records.slice(0, FPD_CONFIG.MEETINGS.MAX_MEETINGS).map(function(record) {
      return {
        id: fpdSafeText_(record && record.id, 120),
        title: fpdSafeText_(record && record.title, 180),
        meetingType: fpdSafeText_(record && record.meetingType, 100),
        status: fpdSafeText_(record && record.status, 50),
        scheduledDate: fpdSafeText_(record && record.scheduledDate, 20),
        scheduledTime: fpdSafeText_(record && record.scheduledTime, 20),
        durationMinutes: Number(record && record.durationMinutes || 60),
        meetingFormat: fpdSafeText_(record && record.meetingFormat, 80),
        locationNote: fpdSafeText_(record && record.locationNote, 300),
        facilitatorRole: fpdSafeText_(record && record.facilitatorRole, 120),
        attendeeRoles: (Array.isArray(record && record.attendeeRoles)
          ? record.attendeeRoles : [])
          .slice(0, FPD_CONFIG.MEETINGS.MAX_ATTENDEE_LABELS)
          .map(function(value) { return fpdSafeText_(value, 120); }),
        openingMessage: fpdSafeText_(record && record.openingMessage, 1000),
        previousRecap: fpdSafeText_(record && record.previousRecap, 1600),
        mealPlan: fpdSafeText_(record && record.mealPlan, 1000),
        materials: (Array.isArray(record && record.materials)
          ? record.materials : [])
          .slice(0, FPD_CONFIG.MEETINGS.MAX_MATERIALS)
          .map(function(value) { return fpdSafeText_(value, 300); }),
        topics: (Array.isArray(record && record.topics) ? record.topics : [])
          .slice(0, FPD_CONFIG.MEETINGS.MAX_TOPICS)
          .map(function(topic) {
            const article = topic && topic.article
              ? {
                  title: fpdSafeText_(topic.article.title, 500),
                  url: fpdSafeText_(topic.article.url, 2000),
                  publisher: fpdSafeText_(topic.article.publisher, 200),
                  publishedDate: fpdSafeText_(topic.article.publishedDate, 20),
                  sourceCountry: fpdSafeText_(topic.article.sourceCountry, 120),
                  language: fpdSafeText_(topic.article.language, 80),
                  provider: fpdSafeText_(topic.article.provider, 100),
                  verifiedAt: fpdSafeText_(topic.article.verifiedAt, 50)
                }
              : null;

            return {
              id: fpdSafeText_(topic && topic.id, 120),
              sourceType: fpdSafeText_(topic && topic.sourceType, 30),
              libraryId: fpdSafeText_(topic && topic.libraryId, 120),
              pillar: fpdSafeText_(topic && topic.pillar, 50),
              title: fpdSafeText_(topic && topic.title, 220),
              purpose: fpdSafeText_(topic && topic.purpose, 1400),
              prompts: (Array.isArray(topic && topic.prompts) ? topic.prompts : [])
                .slice(0, FPD_CONFIG.MEETINGS.MAX_PROMPTS_PER_TOPIC)
                .map(function(value) { return fpdSafeText_(value, 600); }),
              desiredOutcome: fpdSafeText_(topic && topic.desiredOutcome, 1000),
              timeMinutes: Math.max(5, Math.min(60, Number(topic && topic.timeMinutes || 15))),
              article: article
            };
          }),
        notes: fpdSafeText_(record && record.notes, 4000),
        decisions: (Array.isArray(record && record.decisions)
          ? record.decisions : [])
          .slice(0, FPD_CONFIG.MEETINGS.MAX_DECISIONS)
          .map(function(item) {
            return {
              id: fpdSafeText_(item && item.id, 120),
              text: fpdSafeText_(item && item.text, 1000)
            };
          }),
        actionItems: (Array.isArray(record && record.actionItems)
          ? record.actionItems : [])
          .slice(0, FPD_CONFIG.MEETINGS.MAX_ACTION_ITEMS)
          .map(function(item) {
            return {
              id: fpdSafeText_(item && item.id, 120),
              text: fpdSafeText_(item && item.text, 800),
              assignedRole: fpdSafeText_(item && item.assignedRole, 120),
              dueDate: fpdSafeText_(item && item.dueDate, 20),
              status: item && item.status === 'Completed' ? 'Completed' : 'Open'
            };
          }),
        closingMessage: fpdSafeText_(record && record.closingMessage, 1000),
        createdAt: fpdSafeText_(record && record.createdAt, 50),
        updatedAt: fpdSafeText_(record && record.updatedAt, 50),
        completedAt: fpdSafeText_(record && record.completedAt, 50)
      };
    });
  }


  function sanitizeGoalList_(records) {
    if (!Array.isArray(records)) return [];

    return records.slice(0, FPD_CONFIG.GOALS.MAX_HOUSEHOLD_GOALS).map(function(record) {
      return {
        id: fpdSafeText_(record && record.id, 120),
        scope: 'HOUSEHOLD',
        title: fpdSafeText_(record && record.title, 160),
        pillar: fpdSafeText_(record && record.pillar, 50),
        timeframe: fpdSafeText_(record && record.timeframe, 80),
        targetDescription: fpdSafeText_(record && record.targetDescription, 1600),
        successMeasure: fpdSafeText_(record && record.successMeasure, 100),
        why: fpdSafeText_(record && record.why, 1200),
        status: fpdSafeText_(record && record.status, 50),
        percentComplete: Math.max(0, Math.min(100, Number(record && record.percentComplete || 0))),
        steps: (Array.isArray(record && record.steps) ? record.steps : [])
          .slice(0, FPD_CONFIG.GOALS.MAX_STEPS_PER_GOAL)
          .map(function(step) {
            return {
              id: fpdSafeText_(step && step.id, 120),
              text: fpdSafeText_(step && step.text, 500),
              status: step && step.status === 'Completed' ? 'Completed' : 'Not started'
            };
          }),
        checkpoints: (Array.isArray(record && record.checkpoints) ? record.checkpoints : [])
          .slice(0, 10)
          .map(function(checkpoint) {
            return {
              id: fpdSafeText_(checkpoint && checkpoint.id, 120),
              percentComplete: Math.max(0, Math.min(100, Number(checkpoint && checkpoint.percentComplete || 0))),
              status: fpdSafeText_(checkpoint && checkpoint.status, 50),
              progressNote: fpdSafeText_(checkpoint && checkpoint.progressNote, 1200),
              barrier: fpdSafeText_(checkpoint && checkpoint.barrier, 800),
              supportNeeded: fpdSafeText_(checkpoint && checkpoint.supportNeeded, 800),
              nextAction: fpdSafeText_(checkpoint && checkpoint.nextAction, 800),
              createdAt: fpdSafeText_(checkpoint && checkpoint.createdAt, 50)
            };
          }),
        createdAt: fpdSafeText_(record && record.createdAt, 50),
        updatedAt: fpdSafeText_(record && record.updatedAt, 50)
      };
    });
  }


  function sanitizeSystemPolicyList_(records) {
    if (!Array.isArray(records)) return [];

    return records
      .slice(0, FPD_CONFIG.SYSTEMS.MAX_POLICY_RECORDS)
      .map(function(record) {
        record = record || {};
        return {
          id: fpdSafeText_(record.id, 120),
          recordType: fpdSafeText_(record.recordType, 80),
          templateId: fpdSafeText_(record.templateId, 120),
          title: fpdSafeText_(record.title, 220),
          pillar: fpdSafeText_(record.pillar, 80),
          status: fpdSafeText_(record.status, 80),
          purpose: fpdSafeText_(record.purpose, 1600),
          statement: fpdSafeText_(record.statement, 2500),
          appliesTo: sanitizeSystemTextList_(record.appliesTo, 25, 120),
          ownerRole: fpdSafeText_(record.ownerRole, 120),
          steps: sanitizeSystemTextList_(record.steps, 12, 1000),
          priority: fpdSafeText_(record.priority, 80),
          reviewFrequency: fpdSafeText_(record.reviewFrequency, 80),
          effectiveDate: fpdSafeText_(record.effectiveDate, 20),
          lastReviewedDate: fpdSafeText_(record.lastReviewedDate, 20),
          nextReviewDate: fpdSafeText_(
            record.nextReviewDate || record.reviewDate,
            20
          ),
          notes: fpdSafeText_(record.notes, 3000),
          createdAt: fpdSafeText_(record.createdAt, 50),
          updatedAt: fpdSafeText_(record.updatedAt, 50)
        };
      });
  }


  function sanitizeSafetyPlanList_(records) {
    if (!Array.isArray(records)) return [];

    return records
      .slice(0, FPD_CONFIG.SYSTEMS.MAX_SAFETY_RECORDS)
      .map(function(record) {
        record = record || {};
        return {
          id: fpdSafeText_(record.id, 120),
          recordType: 'Safety Plan',
          templateId: fpdSafeText_(record.templateId, 120),
          category: fpdSafeText_(record.category || record.pillar, 80),
          title: fpdSafeText_(record.title, 220),
          pillar: fpdSafeText_(record.pillar || record.category, 80),
          status: fpdSafeText_(
            record.status || record.reviewStatus,
            80
          ),
          purpose: fpdSafeText_(record.purpose, 1600),
          generalInstructions: fpdSafeText_(
            record.generalInstructions || record.statement,
            2500
          ),
          audience: sanitizeSystemTextList_(
            record.audience || record.appliesTo,
            25,
            120
          ),
          ownerRole: fpdSafeText_(record.ownerRole, 120),
          steps: sanitizeSystemTextList_(record.steps, 12, 1000),
          priority: fpdSafeText_(record.priority, 80),
          reviewFrequency: fpdSafeText_(record.reviewFrequency, 80),
          effectiveDate: fpdSafeText_(record.effectiveDate, 20),
          lastReviewedDate: fpdSafeText_(record.lastReviewedDate, 20),
          nextReviewDate: fpdSafeText_(record.nextReviewDate, 20),
          notes: fpdSafeText_(record.notes, 3000),
          createdAt: fpdSafeText_(record.createdAt, 50),
          updatedAt: fpdSafeText_(record.updatedAt, 50)
        };
      });
  }


  function sanitizeSystemTextList_(records, maximum, length) {
    return (Array.isArray(records) ? records : [])
      .slice(0, maximum)
      .map(function(value) {
        return fpdSafeText_(value, length);
      })
      .filter(Boolean);
  }


  function sanitizeOpportunityList_(records) {
    if (!Array.isArray(records)) return [];

    return records.slice(0, FPD_CONFIG.OPPORTUNITIES.MAX_SHARED).map(function(record) {
      record = record || {};
      return {
        id: fpdSafeText_(record.id, 120),
        title: fpdSafeText_(record.title, 240),
        category: fpdSafeText_(record.category, 100),
        provider: fpdSafeText_(record.provider, 220),
        url: fpdSafeText_(record.url, 2000),
        domain: fpdSafeText_(record.domain, 200),
        sourceTier: fpdSafeText_(record.sourceTier, 100),
        verificationStatus: fpdSafeText_(record.verificationStatus, 100),
        lastCheckedAt: fpdSafeText_(record.lastCheckedAt, 50),
        audience: fpdSafeText_(record.audience, 120),
        locationLabel: fpdSafeText_(record.locationLabel, 160),
        deadline: fpdSafeText_(record.deadline, 20),
        costSummary: fpdSafeText_(record.costSummary, 800),
        eligibility: fpdSafeText_(record.eligibility, 1600),
        benefits: fpdSafeText_(record.benefits, 1600),
        requirements: (Array.isArray(record.requirements) ? record.requirements : [])
          .slice(0, FPD_CONFIG.OPPORTUNITIES.MAX_REQUIREMENTS)
          .map(function(value) { return fpdSafeText_(value, 800); }),
        status: fpdSafeText_(record.status, 80),
        priority: fpdSafeText_(record.priority, 80),
        nextAction: fpdSafeText_(record.nextAction, 1200),
        actionSteps: (Array.isArray(record.actionSteps) ? record.actionSteps : [])
          .slice(0, FPD_CONFIG.OPPORTUNITIES.MAX_ACTION_STEPS)
          .map(function(item) {
            return {
              id: fpdSafeText_(item && item.id, 120),
              text: fpdSafeText_(item && item.text, 800),
              dueDate: fpdSafeText_(item && item.dueDate, 20),
              status: item && item.status === 'Completed' ? 'Completed' : 'Open'
            };
          }),
        questions: (Array.isArray(record.questions) ? record.questions : [])
          .slice(0, FPD_CONFIG.OPPORTUNITIES.MAX_QUESTIONS)
          .map(function(value) { return fpdSafeText_(value, 800); }),
        notes: fpdSafeText_(record.notes, 3000),
        createdAt: fpdSafeText_(record.createdAt, 50),
        updatedAt: fpdSafeText_(record.updatedAt, 50)
      };
    });
  }


  function sanitizeRecordList_(records, allowedFields) {
    if (!Array.isArray(records)) return [];

    return records.slice(0, 500).map(function(record) {
      const result = {};

      allowedFields.forEach(function(field) {
        if (!Object.prototype.hasOwnProperty.call(record || {}, field)) {
          result[field] = '';
          return;
        }

        const value = record[field];

        if (typeof value === 'number' || typeof value === 'boolean') {
          result[field] = value;
        } else if (Array.isArray(value)) {
          result[field] = value
            .slice(0, 50)
            .map(function(item) { return fpdSafeText_(item, 200); });
        } else {
          result[field] = fpdSafeText_(value, 3000);
        }
      });

      return result;
    });
  }


  function createSharedSourceBundle_(shared, sourceData) {
    const contentIds = {
      IDENTITY_GUIDANCE: true,
      GOALS_GUIDANCE: true,
      MEETING_GUIDANCE: true,
      LEARNING_GUIDANCE: true,
      SYSTEMS_GUIDANCE: true,
      OPPORTUNITY_GUIDANCE: true
    };
    ['assignments', 'resources'].forEach(function(category) {
      (shared[category] || []).forEach(function(record) {
        if (record.contentId) contentIds[String(record.contentId)] = true;
      });
    });

    const citations = (sourceData.contentCitations || []).filter(function(item) {
      return Boolean(contentIds[String(item.contentId || '')]);
    });

    const sourceIds = {};
    citations.forEach(function(item) {
      if (item.sourceId) sourceIds[String(item.sourceId)] = true;
    });

    const sources = (sourceData.sources || []).filter(function(item) {
      return Boolean(sourceIds[String(item.id || item.sourceId || '')]);
    });

    return {
      sources: sources,
      contentCitations: citations
    };
  }


  function addPublishedSymbolToSnapshot_(snapshotIdentity, storedIdentity) {
    const fileId = storedIdentity && storedIdentity.symbolFileId;
    const mimeType = storedIdentity && storedIdentity.symbolMimeType;

    if (!fileId || !mimeType ||
        FPD_CONFIG.IDENTITY.ALLOWED_SYMBOL_MIME_TYPES.indexOf(mimeType) === -1 ||
        !DriveApiService.isUsable(fileId, mimeType)) {
      snapshotIdentity.symbolBase64 = '';
      return;
    }

    try {
      const bytes = DriveApiService.getBinaryFile(fileId);
      if (bytes.length > FPD_CONFIG.IDENTITY.MAX_SYMBOL_BYTES) {
        snapshotIdentity.symbolBase64 = '';
        return;
      }
      snapshotIdentity.symbolBase64 = Utilities.base64Encode(bytes);
    } catch (error) {
      snapshotIdentity.symbolBase64 = '';
    }
  }


  function importSymbolFromSnapshot_(targetIdentity, sourceIdentity, context) {
    const base64 = String(sourceIdentity && sourceIdentity.symbolBase64 || '');
    const mimeType = fpdSafeText_(
      sourceIdentity && sourceIdentity.symbolMimeType,
      80
    );

    targetIdentity.symbolFileId = '';

    if (!base64 ||
        FPD_CONFIG.IDENTITY.ALLOWED_SYMBOL_MIME_TYPES.indexOf(mimeType) === -1) {
      return;
    }

    let bytes;
    try {
      bytes = Utilities.base64Decode(base64);
    } catch (error) {
      throw new Error('The Family Sharing File contains a damaged symbolic image.');
    }

    if (!bytes.length || bytes.length > FPD_CONFIG.IDENTITY.MAX_SYMBOL_BYTES) {
      throw new Error('The Family Sharing File symbolic image exceeds the privacy-first size limit.');
    }

    const folderMap = fpdParseJson_(
      context.props.getProperty(fpdPropertyKey_('FOLDER_MAP_JSON')),
      {}
    );
    const parentId = folderMap.HOUSEHOLD_INFO || context.rootFolderId;
    const extension = mimeType === 'image/png'
      ? '.png'
      : mimeType === 'image/webp'
        ? '.webp'
        : '.jpg';
    const file = DriveApiService.createBinaryFile(
      'Shared_Household_Symbol_v' +
        Number(sourceIdentity.version || 0) + extension,
      mimeType,
      parentId,
      bytes
    );

    targetIdentity.symbolFileId = file.id;
    targetIdentity.symbolMimeType = mimeType;
    targetIdentity.symbolName = fpdSafeText_(
      sourceIdentity.symbolName || 'Shared household symbol',
      120
    );
  }


  function nextPackVersion_(props) {
    return Number(
      props.getProperty(fpdPropertyKey_('LAST_UPDATE_PACK_VERSION')) || 0
    ) + 1;
  }


  function snapshotToCsv_(snapshot, signature) {
    const rows = [HEADERS];

    const metadata = {
      PackageType: snapshot.packageType,
      SchemaVersion: snapshot.schemaVersion,
      IssuerID: snapshot.issuerId,
      HouseholdID: snapshot.householdId,
      PackageVersion: snapshot.packageVersion,
      GeneratedAt: snapshot.generatedAt,
      SignatureAlgorithm: 'HMAC-SHA256',
      Signature: signature
    };

    Object.keys(metadata).forEach(function(field) {
      rows.push([
        'PackageInfo',
        'PACKAGE',
        field,
        metadata[field],
        snapshot.packageVersion,
        snapshot.generatedAt
      ]);
    });

    flattenObjectToRows_(
      'Shared',
      'SHARED',
      snapshot.shared,
      snapshot.packageVersion,
      snapshot.generatedAt,
      rows
    );

    flattenObjectToRows_(
      'SourceBundle',
      'SOURCES',
      snapshot.sourceBundle,
      snapshot.packageVersion,
      snapshot.generatedAt,
      rows
    );

    return rows.map(function(row) {
      return row.map(csvEscape_).join(',');
    }).join('\r\n');
  }


  function flattenObjectToRows_(
    section,
    recordId,
    object,
    version,
    updatedAt,
    rows
  ) {
    Object.keys(object || {}).sort().forEach(function(field) {
      rows.push([
        section,
        recordId,
        field,
        JSON.stringify(object[field]),
        version,
        updatedAt
      ]);
    });
  }


  function csvToSnapshot_(csvText) {
    const rows = parseCsv_(String(csvText || ''));

    if (!rows.length || rows[0].join('|') !== HEADERS.join('|')) {
      throw new Error('This file is not a recognized FamilyPD Family Sharing File.');
    }

    const metadata = {};
    const shared = {};
    const sourceBundle = {};

    rows.slice(1).forEach(function(row) {
      const section = row[0];
      const field = row[2];
      const value = row[3];

      if (section === 'PackageInfo') {
        metadata[field] = value;
      } else if (section === 'Shared') {
        shared[field] = parseJsonCell_(value);
      } else if (section === 'SourceBundle') {
        sourceBundle[field] = parseJsonCell_(value);
      }
    });

    return {
      signature: metadata.Signature || '',
      snapshot: {
        packageType: metadata.PackageType,
        schemaVersion: metadata.SchemaVersion,
        issuerId: metadata.IssuerID,
        householdId: metadata.HouseholdID,
        packageVersion: Number(metadata.PackageVersion || 0),
        generatedAt: metadata.GeneratedAt,
        shared: shared,
        sourceBundle: sourceBundle
      }
    };
  }


  function validateSnapshot_(snapshot, signature) {
    if (!snapshot || snapshot.packageType !== PACKAGE_TYPE) {
      throw new Error('This file is not a FamilyPD Family Sharing File.');
    }

    if (snapshot.schemaVersion !== FPD_CONFIG.SCHEMA_VERSION) {
      throw new Error(
        'This Family Sharing File uses an incompatible FamilyPD data version.'
      );
    }

    if (!snapshot.householdId || !snapshot.issuerId || !snapshot.packageVersion) {
      throw new Error('This Family Sharing File is missing required verification fields.');
    }

    const canonical = canonicalStringify_(snapshot);

    if (!SecurityService.verifyPayload(canonical, signature)) {
      throw new Error(
        'FamilyPD could not verify this Family Sharing File. ' +
        'Do not import or trust the file.'
      );
    }
  }


  function countSharedRecords_(shared) {
    const counts = {};

    FPD_CONFIG.DATA_CATEGORIES.forEach(function(category) {
      const value = shared[category];
      counts[category] = Array.isArray(value)
        ? value.length
        : value && typeof value === 'object'
          ? 1
          : 0;
    });

    return counts;
  }


  function canonicalStringify_(value) {
    if (Array.isArray(value)) {
      return '[' + value.map(canonicalStringify_).join(',') + ']';
    }

    if (value && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(function(key) {
        return JSON.stringify(key) + ':' + canonicalStringify_(value[key]);
      }).join(',') + '}';
    }

    return JSON.stringify(value);
  }


  function csvEscape_(value) {
    const text = String(value == null ? '' : value);

    if (/[",\r\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }

    return text;
  }


  function parseCsv_(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];

      if (quoted) {
        if (character === '"' && next === '"') {
          field += '"';
          index += 1;
        } else if (character === '"') {
          quoted = false;
        } else {
          field += character;
        }
      } else if (character === '"') {
        quoted = true;
      } else if (character === ',') {
        row.push(field);
        field = '';
      } else if (character === '\r' && next === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        index += 1;
      } else if (character === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += character;
      }
    }

    if (field || row.length) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }


  function parseJsonCell_(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error('The Family Sharing File contains damaged data.');
    }
  }


  return {
    createPack: createPack,
    previewPack: previewPack,
    applyPack: applyPack
  };
})();
