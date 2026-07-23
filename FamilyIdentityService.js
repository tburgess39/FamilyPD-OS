/**
 * FamilyPD Family Profile service
 * Build 9.2 - Guided Foundation Update
 *
 * This feature is intentionally isolated from the original IdentityService.
 * It requests no email scope and performs no whole-Drive search.
 */
const FPDFamilyProfileServiceV100 = (function () {
  'use strict';

  const DATA_KEY = 'FPD_FAMILY_PROFILE_V2';
  const LEGACY_DATA_KEY = 'FPD_FAMILY_IDENTITY_CENTER_V1';
  const CACHE_KEY = 'FPD_FAMILY_PROFILE_BOOTSTRAP_V2';
  const CACHE_SECONDS = 300;
  const DEFAULT_PROFILE_FOLDER = '01 Family Profile & Values';

  const VALUES = [
    value_('respect', 'Respect', 'We treat one another with dignity, patience, and consideration.', 'We listen without insulting, speak calmly, honor boundaries, and care for shared spaces.'),
    value_('honesty', 'Honesty', 'We tell the truth and communicate openly, even when it is difficult.', 'We give accurate information, admit mistakes, and discuss concerns without hiding them.'),
    value_('responsibility', 'Responsibility', 'We follow through, own our choices, and help care for our home.', 'We complete agreed tasks, communicate early when help is needed, and repair what we damage.'),
    value_('compassion', 'Compassion', 'We notice what others need and respond with empathy and care.', 'We check on one another, offer help, and consider feelings before reacting.'),
    value_('growth', 'Growth', 'We keep learning, accept feedback, and improve after mistakes.', 'We practice, ask questions, reflect, and try a better approach after setbacks.'),
    value_('education', 'Education', 'We value knowledge, curiosity, preparation, and lifelong learning.', 'We support school and career goals, read, practice skills, and share what we learn.'),
    value_('health', 'Health and Wellness', 'We support physical, mental, and emotional well-being.', 'We rest, move our bodies, seek help when needed, and talk about stress without shame.'),
    value_('faith', 'Faith / Spirituality', 'We make room for our shared spiritual beliefs and practices.', 'We practice our beliefs respectfully and allow thoughtful questions and growth.'),
    value_('financial', 'Financial Wisdom', 'We plan, save, spend thoughtfully, and discuss money responsibly.', 'We use a budget, avoid secret spending, prepare for needs, and teach age-appropriate money skills.'),
    value_('service', 'Service', 'We use our time and abilities to support our family and community.', 'We help without always being asked and contribute to causes that matter to us.'),
    value_('courage', 'Courage', 'We do what is right and face challenges even when we feel afraid.', 'We speak up respectfully, try difficult things, and ask for help when necessary.'),
    value_('teamwork', 'Teamwork', 'We communicate, share work, and solve problems together.', 'We divide tasks fairly, celebrate contributions, and focus on solutions instead of blame.'),
    value_('accountability', 'Accountability', 'We accept consequences, repair harm, and keep our commitments.', 'We apologize sincerely, make corrections, and follow through on agreed next steps.'),
    value_('stability', 'Stability', 'We build dependable routines and prepare for change.', 'We use calendars, maintain basic routines, communicate plans, and create backup plans.'),
    value_('joy', 'Joy', 'We make room for gratitude, fun, rest, and connection.', 'We celebrate progress, laugh together, and protect time for meaningful family activities.')
  ];

  const MISSIONS = [
    option_('balanced', 'Balanced foundation', 'Our family works together to build a respectful, healthy, organized, and supportive home. We communicate honestly, keep learning, manage our responsibilities wisely, and help each person grow.'),
    option_('connection', 'Connection and support', 'Our family creates a safe place where every person is heard, supported, and expected to contribute. We solve problems respectfully, celebrate progress, and stay connected through every season.'),
    option_('growth', 'Growth and opportunity', 'Our family prepares one another for life by practicing responsibility, education, healthy choices, financial wisdom, and the confidence to pursue meaningful goals.'),
    option_('peace', 'Peaceful and organized home', 'Our family protects peace by communicating clearly, sharing responsibilities, using routines, and addressing problems early with respect and accountability.'),
    option_('service', 'Purpose and service', 'Our family develops our gifts, supports one another, and uses what we have learned to strengthen our home and serve our community.'),
    option_('faith', 'Faith-centered foundation', 'Our family seeks to live according to our faith through love, integrity, responsibility, forgiveness, service, and continued growth.'),
    option_('custom', 'Write our own mission', '')
  ];

  const VISIONS = [
    option_('prepared', 'Prepared for life', 'We see a family whose members are emotionally healthy, financially informed, educated, dependable, and prepared to make thoughtful decisions independently.'),
    option_('connected', 'Connected across generations', 'We see a family that stays connected across generations, communicates honestly, preserves meaningful traditions, and supports one another through change.'),
    option_('stable', 'Stable and thriving', 'We see a stable family with healthy routines, strong relationships, growing opportunities, responsible finances, and a shared habit of setting and completing goals.'),
    option_('legacy', 'Positive family legacy', 'We see our family creating a positive legacy of character, knowledge, service, resilience, and opportunity that future generations can build upon.'),
    option_('personal', 'Each person thriving', 'We see every family member understanding their strengths, developing useful skills, building healthy relationships, and pursuing a meaningful path with family support.'),
    option_('custom', 'Write our own vision', '')
  ];

  const MOTTOS = [
    option_('together', 'Together, we grow.', 'Together, we grow.'),
    option_('progress', 'Progress over perfection.', 'Progress over perfection.'),
    option_('learn', 'Learn. Support. Grow.', 'Learn. Support. Grow.'),
    option_('stronger', 'Stronger together.', 'Stronger together.'),
    option_('home', 'Build the home we need.', 'Build the home we need.'),
    option_('actions', 'Our actions shape our legacy.', 'Our actions shape our legacy.'),
    option_('responsibility', 'Love, learning, and responsibility.', 'Love, learning, and responsibility.'),
    option_('custom', 'Write our own motto', '')
  ];

  const HOME_ENVIRONMENTS = [
    option_('safe', 'Safe and respected', 'We want our home to feel emotionally and physically safe. People can speak honestly, ask for help, and expect respectful treatment.'),
    option_('peaceful', 'Peaceful and organized', 'We want our home to feel calm, reasonably organized, predictable, and prepared for the week ahead.'),
    option_('warm', 'Warm and connected', 'We want our home to feel welcoming, caring, joyful, and connected even when life is busy.'),
    option_('growth', 'Focused on growth', 'We want our home to encourage learning, healthy habits, responsibility, reflection, and steady improvement.'),
    option_('balanced', 'Balanced foundation', 'We want our home to feel safe, respectful, organized, supportive, and focused on helping each person grow.'),
    option_('custom', 'Describe our own home environment', '')
  ];

  const COMMITMENTS = [
    option_('listen', 'Listen before responding', 'We listen to understand before we interrupt, assume, or respond.'),
    option_('respect', 'Address problems respectfully', 'We discuss the problem without insulting, threatening, or embarrassing one another.'),
    option_('early', 'Ask for help early', 'We communicate early when we are confused, overwhelmed, behind, or unable to keep a commitment.'),
    option_('repair', 'Repair harm', 'When we cause harm, we acknowledge it, apologize, and take a reasonable step to repair it.'),
    option_('meet', 'Hold regular family check-ins', 'We make time to review schedules, concerns, goals, responsibilities, and progress together.'),
    option_('privacy', 'Protect appropriate privacy', 'We respect reasonable privacy while communicating information that affects family safety, plans, or responsibilities.'),
    option_('follow', 'Follow through', 'We keep reasonable promises and give notice when a plan must change.'),
    option_('celebrate', 'Celebrate progress', 'We recognize effort, improvement, milestones, and positive contributions.'),
    option_('custom', 'Write our own commitment', '')
  ];

  const GOALS = [
    goal_('rel-meeting', 'Relationships', 'Hold one short family meeting each month', 'Create a regular space to communicate, plan, and solve concerns early.', 'Choose a date and use the Family Meeting Starter.', 'monthly'),
    goal_('rel-time', 'Relationships', 'Plan one meaningful family activity each month', 'Shared experiences strengthen connection and create positive memories.', 'Choose one low-cost activity everyone can help plan.', 'monthly'),
    goal_('rel-conflict', 'Relationships', 'Practice a respectful conflict routine', 'A shared routine helps family members address problems without escalation.', 'Agree to pause, explain the concern, listen, and choose a next step.', 'weekly'),
    goal_('health-routine', 'Health', 'Create a consistent weekday routine', 'Predictable routines reduce stress and improve readiness.', 'Choose standard times for sleep, preparation, meals, or medication reminders.', 'weekly'),
    goal_('health-checkin', 'Health', 'Use a weekly wellness check-in', 'Regular check-ins make it easier to notice stress and ask for support.', 'Rate physical, mental, and emotional wellness from 1–5 once a week.', 'weekly'),
    goal_('health-move', 'Health', 'Add regular movement as a family', 'Movement supports physical and emotional wellness.', 'Choose two realistic movement opportunities each week.', 'weekly'),
    goal_('edu-learning', 'Education', 'Set one learning goal for each family member', 'Clear learning goals connect daily effort to future opportunity.', 'Choose one skill, course, book, certification, or school goal.', 'monthly'),
    goal_('edu-study', 'Education', 'Create a shared study or focus routine', 'A consistent focus period supports school, career, and personal development.', 'Choose a quiet time and remove common distractions.', 'weekly'),
    goal_('edu-career', 'Education', 'Explore one career or opportunity each month', 'Regular exploration helps family members make informed plans.', 'Research one role, program, scholarship, or training opportunity.', 'monthly'),
    goal_('fin-budget', 'Finances', 'Review the family budget each month', 'A shared review improves planning and reduces surprises.', 'List expected income, bills, savings, and upcoming expenses.', 'monthly'),
    goal_('fin-save', 'Finances', 'Build or strengthen an emergency fund', 'Emergency savings improves stability when plans change.', 'Choose a realistic first savings target and automatic contribution.', 'monthly'),
    goal_('fin-teach', 'Finances', 'Teach one age-appropriate money skill each month', 'Money practice helps children and adults make stronger decisions.', 'Choose budgeting, saving, banking, credit, comparison shopping, or investing basics.', 'monthly'),
    goal_('goal-week', 'Goals', 'Choose one family priority each week', 'One clear priority helps the family focus and finish important work.', 'Write the priority, owner, and next action where everyone can see it.', 'weekly'),
    goal_('goal-quarter', 'Goals', 'Complete a quarterly family progress review', 'A regular review turns goals into an ongoing family system.', 'Schedule the next Progress Review Center check-in.', 'quarterly'),
    goal_('goal-space', 'Goals', 'Improve one shared space or household system', 'A better system reduces repeated stress and wasted time.', 'Choose one problem area and test one small improvement.', 'monthly')
  ];

  const FOUNDATION_PRESETS = [
    {
      id: 'strong-start',
      name: 'Strong Start Foundation',
      description: 'A balanced starting point for respect, communication, health, learning, finances, responsibilities, and goals.',
      missionId: 'balanced',
      visionId: 'stable',
      mottoId: 'learn',
      homeEnvironmentId: 'balanced',
      valueIds: ['respect', 'honesty', 'responsibility', 'growth', 'health', 'financial', 'teamwork'],
      commitmentIds: ['listen', 'respect', 'early', 'repair', 'meet', 'follow', 'celebrate'],
      goalIds: ['rel-meeting', 'health-routine', 'edu-learning', 'fin-budget', 'goal-week']
    },
    {
      id: 'connection',
      name: 'Connection & Communication',
      description: 'For families who want to strengthen trust, communication, belonging, and healthy problem-solving.',
      missionId: 'connection',
      visionId: 'connected',
      mottoId: 'stronger',
      homeEnvironmentId: 'warm',
      valueIds: ['respect', 'honesty', 'compassion', 'teamwork', 'accountability', 'joy'],
      commitmentIds: ['listen', 'respect', 'repair', 'meet', 'privacy', 'celebrate'],
      goalIds: ['rel-meeting', 'rel-time', 'rel-conflict', 'health-checkin', 'goal-quarter']
    },
    {
      id: 'stability',
      name: 'Stability & Organization',
      description: 'For families building routines, shared responsibilities, financial planning, and dependable household systems.',
      missionId: 'peace',
      visionId: 'stable',
      mottoId: 'home',
      homeEnvironmentId: 'peaceful',
      valueIds: ['respect', 'responsibility', 'financial', 'teamwork', 'accountability', 'stability'],
      commitmentIds: ['early', 'meet', 'follow', 'repair'],
      goalIds: ['health-routine', 'fin-budget', 'fin-save', 'goal-week', 'goal-space']
    },
    {
      id: 'growth-opportunity',
      name: 'Growth & Opportunity',
      description: 'For families emphasizing education, career preparation, confidence, financial knowledge, and long-term opportunity.',
      missionId: 'growth',
      visionId: 'prepared',
      mottoId: 'progress',
      homeEnvironmentId: 'growth',
      valueIds: ['growth', 'education', 'responsibility', 'courage', 'financial', 'service'],
      commitmentIds: ['early', 'follow', 'celebrate', 'meet'],
      goalIds: ['edu-learning', 'edu-study', 'edu-career', 'fin-teach', 'goal-quarter']
    },
    {
      id: 'faith-service',
      name: 'Faith & Service',
      description: 'An optional foundation for families who want faith, character, forgiveness, service, and growth named directly.',
      missionId: 'faith',
      visionId: 'legacy',
      mottoId: 'actions',
      homeEnvironmentId: 'warm',
      valueIds: ['faith', 'respect', 'compassion', 'responsibility', 'service', 'growth'],
      commitmentIds: ['listen', 'respect', 'repair', 'meet', 'celebrate'],
      goalIds: ['rel-meeting', 'rel-time', 'edu-learning', 'fin-budget', 'goal-quarter']
    }
  ];

  const ROLE_OPTIONS = [
    role_('coordinator', 'Family coordinator', 'Helps organize schedules, meetings, deadlines, and shared plans.'),
    role_('communication', 'Communication lead', 'Helps share reminders, gather updates, and make sure everyone has needed information.'),
    role_('home', 'Home care lead', 'Helps coordinate chores, supplies, cleaning routines, and shared spaces.'),
    role_('meals', 'Meal planning helper', 'Helps plan meals, grocery needs, preparation, or cleanup.'),
    role_('finance', 'Budget helper', 'Helps track agreed expenses, savings goals, price comparisons, or family budget meetings.'),
    role_('learning', 'Learning and opportunity helper', 'Helps locate educational resources, deadlines, practice opportunities, or career information.'),
    role_('wellness', 'Wellness helper', 'Helps encourage healthy routines, appointments, rest, movement, and emotional check-ins.'),
    role_('traditions', 'Traditions and connection helper', 'Helps plan celebrations, family time, service, and meaningful traditions.'),
    role_('support', 'Family support team member', 'Helps where needed and completes age-appropriate responsibilities.'),
    role_('custom', 'Create a custom role', '')
  ];

  function getBootstrap(forceRefresh) {
    const cache = CacheService.getUserCache();
    if (!forceRefresh) {
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        try {
          const cachedResult = JSON.parse(cached);
          cachedResult.workspace = buildWorkspaceStatus_();
          return cachedResult;
        } catch (error) {}
      }
    }

    const profile = readProfile_();
    const result = {
      generatedAt: new Date().toISOString(),
      profile: profile,
      summary: buildSummary_(profile),
      workspace: buildWorkspaceStatus_(),
      options: {
        journeyPaths: [
          { value: 'guided', label: 'Guided Foundation', description: 'Start with recommended mission, vision, values, commitments, and five-pillar goals. Everything remains editable.' },
          { value: 'custom', label: 'Personalized Journey', description: 'Start with a blank profile while still using the option banks whenever helpful.' }
        ],
        foundationPresets: FOUNDATION_PRESETS,
        missionOptions: MISSIONS,
        visionOptions: VISIONS,
        mottoOptions: MOTTOS,
        homeEnvironmentOptions: HOME_ENVIRONMENTS,
        commitmentOptions: COMMITMENTS,
        valueSuggestions: VALUES,
        goalSuggestions: GOALS,
        roleOptions: ROLE_OPTIONS,
        relationshipOptions: ['Parent / guardian', 'Child', 'Teen', 'Adult child', 'Grandparent', 'Partner / spouse', 'Sibling', 'Extended family', 'Chosen family', 'Other'],
        ageGroups: [
          { value: 'adult', label: 'Adult' },
          { value: 'young-adult', label: 'Young adult' },
          { value: 'teen', label: 'Teen' },
          { value: 'child', label: 'Child' },
          { value: 'other', label: 'Other / prefer not to say' }
        ],
        pillars: ['Relationships', 'Health', 'Education', 'Finances', 'Goals'],
        timeframes: [
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'yearly', label: 'Yearly' }
        ]
      }
    };

    try { cache.put(CACHE_KEY, JSON.stringify(result), CACHE_SECONDS); } catch (error) {}
    return result;
  }

  function getProfile() {
    return JSON.parse(JSON.stringify(readProfile_()));
  }

  function saveProfile(input) {
    const current = readProfile_();
    const source = input || {};
    const now = new Date().toISOString();
    const profile = {
      version: 2,
      journeyMode: allowed_(source.journeyMode, ['guided', 'custom'], ''),
      foundationPresetId: clean_(source.foundationPresetId).slice(0, 80),
      familyName: clean_(source.familyName).slice(0, 120),
      familyTagline: clean_(source.familyTagline).slice(0, 180),
      familyStory: clean_(source.familyStory).slice(0, 3000),
      homeFeeling: clean_(source.homeFeeling).slice(0, 2000),
      mission: clean_(source.mission).slice(0, 2400),
      vision: clean_(source.vision).slice(0, 2400),
      strengths: clean_(source.strengths).slice(0, 2200),
      traditions: clean_(source.traditions).slice(0, 2200),
      cultureNotes: clean_(source.cultureNotes).slice(0, 2200),
      commitments: clean_(source.commitments).slice(0, 3000),
      values: normalizeValues_(source.values),
      members: normalizeMembers_(source.members),
      goals: normalizeGoals_(source.goals),
      lastDocument: normalizeLastDocument_(current.lastDocument),
      createdAt: current.createdAt || now,
      updatedAt: now
    };

    PropertiesService.getUserProperties().setProperty(DATA_KEY, JSON.stringify(profile));
    clearCache();
    return { ok: true, data: getBootstrap(true) };
  }

  function resetProfile() {
    PropertiesService.getUserProperties().deleteProperty(DATA_KEY);
    clearCache();
    return { ok: true, data: getBootstrap(true) };
  }

  function updateLastDocument(documentInfo) {
    const profile = readProfile_();
    profile.lastDocument = normalizeLastDocument_(documentInfo);
    profile.updatedAt = new Date().toISOString();
    PropertiesService.getUserProperties().setProperty(DATA_KEY, JSON.stringify(profile));
    clearCache();
    return profile.lastDocument;
  }

  function getProfileFolder(createIfMissing) {
    if (typeof FPDDriveFileServiceV10 === 'undefined') {
      throw new Error('FPDDriveFileService.gs is required for Family Profile file creation.');
    }
    const root = FPDDriveFileServiceV10.getRootMetadata();
    if (!root) return null;
    const name = configuredProfileFolderName_();
    return createIfMissing
      ? FPDDriveFileServiceV10.getOrCreateChildFolder(root.id, name)
      : FPDDriveFileServiceV10.findChildFolder(root.id, name);
  }

  function buildWorkspaceStatus_() {
    try {
      if (typeof FPDDriveFileServiceV10 === 'undefined') {
        return { connected: false, message: 'Drive file service is not installed.' };
      }
      return FPDDriveFileServiceV10.diagnoseRoot();
    } catch (error) {
      return {
        connected: false,
        message: error && error.message ? error.message : 'The FamilyPD Workspace connection could not be checked.'
      };
    }
  }

  function configuredProfileFolderName_() {
    let name = DEFAULT_PROFILE_FOLDER;
    try {
      if (typeof FPD_CONFIG !== 'undefined' && FPD_CONFIG && FPD_CONFIG.FOLDER_NAMES) {
        const folders = FPD_CONFIG.FOLDER_NAMES;
        if (Array.isArray(folders)) {
          folders.forEach(function (candidate) {
            const lower = clean_(candidate).toLowerCase();
            if (lower.indexOf('profile') >= 0 || lower.indexOf('value') >= 0) name = clean_(candidate) || name;
          });
        } else if (typeof folders === 'object') {
          Object.keys(folders).forEach(function (key) {
            const lower = clean_(key).toLowerCase();
            if (lower.indexOf('profile') >= 0 || lower.indexOf('value') >= 0) name = clean_(folders[key]) || name;
          });
        }
      }
    } catch (error) {}
    return name;
  }

  function readProfile_() {
    const properties = PropertiesService.getUserProperties();
    let raw = properties.getProperty(DATA_KEY);
    let migrated = false;
    if (!raw) {
      raw = properties.getProperty(LEGACY_DATA_KEY);
      migrated = Boolean(raw);
    }
    if (!raw) return emptyProfile_();

    try {
      const parsed = JSON.parse(raw);
      const profile = {
        version: 2,
        journeyMode: allowed_(parsed.journeyMode, ['guided', 'custom'], inferLegacyJourney_(parsed)),
        foundationPresetId: clean_(parsed.foundationPresetId),
        familyName: clean_(parsed.familyName),
        familyTagline: clean_(parsed.familyTagline),
        familyStory: clean_(parsed.familyStory),
        homeFeeling: clean_(parsed.homeFeeling),
        mission: clean_(parsed.mission),
        vision: clean_(parsed.vision),
        strengths: clean_(parsed.strengths),
        traditions: clean_(parsed.traditions),
        cultureNotes: clean_(parsed.cultureNotes),
        commitments: clean_(parsed.commitments),
        values: normalizeValues_(parsed.values),
        members: normalizeMembers_(parsed.members),
        goals: normalizeGoals_(parsed.goals),
        lastDocument: normalizeLastDocument_(parsed.lastDocument),
        createdAt: clean_(parsed.createdAt),
        updatedAt: clean_(parsed.updatedAt)
      };
      if (migrated) properties.setProperty(DATA_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      return emptyProfile_();
    }
  }

  function inferLegacyJourney_(parsed) {
    const hasContent = Boolean(parsed && (
      parsed.familyName || parsed.familyStory || parsed.mission || parsed.vision ||
      (Array.isArray(parsed.values) && parsed.values.length) ||
      (Array.isArray(parsed.members) && parsed.members.length)
    ));
    return hasContent ? 'custom' : '';
  }

  function emptyProfile_() {
    return {
      version: 2,
      journeyMode: '',
      foundationPresetId: '',
      familyName: '',
      familyTagline: '',
      familyStory: '',
      homeFeeling: '',
      mission: '',
      vision: '',
      strengths: '',
      traditions: '',
      cultureNotes: '',
      commitments: '',
      values: [],
      members: [],
      goals: [],
      lastDocument: null,
      createdAt: '',
      updatedAt: ''
    };
  }

  function normalizeValues_(values) {
    if (!Array.isArray(values)) return [];
    const seen = {};
    return values.slice(0, 20).map(function (item) {
      const source = item || {};
      const name = clean_(source.name).slice(0, 80);
      const key = name.toLowerCase();
      if (!name || seen[key]) return null;
      seen[key] = true;
      return {
        id: clean_(source.id) || Utilities.getUuid(),
        sourceId: clean_(source.sourceId).slice(0, 80),
        name: name,
        meaning: clean_(source.meaning).slice(0, 1200),
        behaviors: clean_(source.behaviors).slice(0, 1600)
      };
    }).filter(Boolean);
  }

  function normalizeMembers_(members) {
    if (!Array.isArray(members)) return [];
    return members.slice(0, 30).map(function (item) {
      const source = item || {};
      const name = clean_(source.name).slice(0, 100);
      if (!name) return null;
      return {
        id: clean_(source.id) || Utilities.getUuid(),
        name: name,
        relationship: clean_(source.relationship).slice(0, 100),
        ageGroup: allowed_(source.ageGroup, ['adult', 'young-adult', 'teen', 'child', 'other'], 'other'),
        roleTitle: clean_(source.roleTitle).slice(0, 140),
        responsibilities: clean_(source.responsibilities).slice(0, 1800),
        strengths: clean_(source.strengths).slice(0, 1200),
        notes: clean_(source.notes).slice(0, 1200)
      };
    }).filter(Boolean);
  }

  function normalizeGoals_(goals) {
    if (!Array.isArray(goals)) return [];
    return goals.slice(0, 30).map(function (item) {
      const source = item || {};
      const title = clean_(source.title).slice(0, 180);
      if (!title) return null;
      return {
        id: clean_(source.id) || Utilities.getUuid(),
        sourceId: clean_(source.sourceId).slice(0, 80),
        pillar: allowed_(source.pillar, ['Relationships', 'Health', 'Education', 'Finances', 'Goals'], 'Goals'),
        title: title,
        why: clean_(source.why).slice(0, 1400),
        firstStep: clean_(source.firstStep).slice(0, 1400),
        timeframe: allowed_(source.timeframe, ['weekly', 'monthly', 'quarterly', 'yearly'], 'monthly'),
        status: allowed_(source.status, ['not-started', 'active', 'complete', 'paused'], 'not-started')
      };
    }).filter(Boolean);
  }

  function normalizeLastDocument_(value) {
    if (!value || typeof value !== 'object') return null;
    const documentUrl = clean_(value.documentUrl);
    const pdfUrl = clean_(value.pdfUrl);
    if (!documentUrl && !pdfUrl) return null;
    return {
      documentId: clean_(value.documentId),
      documentUrl: documentUrl,
      pdfId: clean_(value.pdfId),
      pdfUrl: pdfUrl,
      folderUrl: clean_(value.folderUrl),
      fileName: clean_(value.fileName),
      createdAt: clean_(value.createdAt) || new Date().toISOString()
    };
  }

  function buildSummary_(profile) {
    const foundationReady = Boolean(
      profile.journeyMode && profile.familyName && profile.mission && profile.vision && profile.values.length >= 3
    );
    const sections = [
      profile.journeyMode,
      profile.familyName,
      profile.homeFeeling,
      profile.mission,
      profile.vision,
      profile.values.length >= 3 ? 'values' : '',
      profile.members.length ? 'members' : '',
      profile.goals.length ? 'goals' : '',
      profile.commitments
    ];
    const completed = sections.filter(Boolean).length;
    return {
      completionPercent: Math.round((completed / sections.length) * 100),
      completedSections: completed,
      totalSections: sections.length,
      foundationReady: foundationReady,
      pathSelected: Boolean(profile.journeyMode),
      valueCount: profile.values.length,
      memberCount: profile.members.length,
      goalCount: profile.goals.length,
      hasDocument: Boolean(profile.lastDocument)
    };
  }

  function value_(id, name, meaning, behaviors) {
    return { id: id, name: name, meaning: meaning, behaviors: behaviors };
  }

  function option_(id, label, text) {
    return { id: id, label: label, text: text };
  }

  function goal_(id, pillar, title, why, firstStep, timeframe) {
    return { id: id, pillar: pillar, title: title, why: why, firstStep: firstStep, timeframe: timeframe };
  }

  function role_(id, label, responsibilities) {
    return { id: id, label: label, responsibilities: responsibilities };
  }

  function clearCache() {
    CacheService.getUserCache().remove(CACHE_KEY);
  }

  function allowed_(value, allowedValues, fallback) {
    const text = clean_(value);
    return allowedValues.indexOf(text) >= 0 ? text : fallback;
  }

  function clean_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  return {
    getBootstrap: getBootstrap,
    getProfile: getProfile,
    saveProfile: saveProfile,
    resetProfile: resetProfile,
    updateLastDocument: updateLastDocument,
    getProfileFolder: getProfileFolder,
    clearCache: clearCache
  };
}());

function fpdFamilyProfileGetData(forceRefresh) {
  return FPDFamilyProfileServiceV100.getBootstrap(Boolean(forceRefresh));
}

function fpdFamilyProfileSave(input) {
  return FPDFamilyProfileServiceV100.saveProfile(input);
}

function fpdFamilyProfileReset() {
  return FPDFamilyProfileServiceV100.resetProfile();
}
