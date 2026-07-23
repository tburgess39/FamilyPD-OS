/**
 * FamilyPD Privacy-First Workspace
 * Build 9 adds a privacy-first Opportunities & Mobility workspace with official
 * source launchers, direct-link checking, shared and personal opportunity
 * records, action plans, deadline reminders, bilingual PDFs, and Update Pack
 * sharing.
 */

const FPD_CONFIG = Object.freeze({
  APP_NAME: 'FamilyPD OS',
  APP_VERSION: '9.4.0',
  SCHEMA_VERSION: '7.0.0',
  PROPERTY_PREFIX: 'FPD_',

  DEPLOYMENT_MODE: 'PRODUCTION',
  OFFICIAL_SITE: 'https://familypd.org',
  ADMIN_EMAIL: 'admin@familypd.org',
  DONATION_URL: 'https://www.zeffy.com/en-US/donation-form/fuel-a-familys-future',
  OFFICIAL_SECURITY_PAGE: 'https://familypd.org/security',
  GUIDEBOOK_URL: 'https://www.amazon.com/Family-Personal-Development-Guidebook-charity-ebook/dp/B0G33YKCNQ',
  GUIDEBOOK: Object.freeze({
    AUTHOR: 'Toni Hall',
    CITATION_AUTHOR: 'Hall',
    YEAR: '2025',
    TITLE: 'The Family Personal Development Guidebook: If charity starts at home, growth and success should too.',
    FORMATS: 'Kindle Edition & Paperback',
    APA_REFERENCE: 'Hall, T. (2025). The Family Personal Development Guidebook: If charity starts at home, growth and success should too.'
  }),

  APPROVED_PRODUCTION_HOSTS: Object.freeze([
    'familypd.org',
    'www.familypd.org',
    'app.familypd.org'
  ]),

  APPROVED_PROTOTYPE_HOSTS: Object.freeze([
    'script.google.com',
    'script.googleusercontent.com'
  ]),


  SUPPORTED_LANGUAGES: Object.freeze([
    { value: 'en', label: 'English' },
    { value: 'es', label: 'EspaĆ±ol' }
  ]),

  ROLE: Object.freeze({
    LEAD: 'HOUSEHOLD_LEAD',
    MEMBER: 'FAMILY_MEMBER'
  }),

  ROOT_FOLDER_NAME: Object.freeze({
    HOUSEHOLD_LEAD: 'My FamilyPD Household Workspace',
    FAMILY_MEMBER: 'My FamilyPD Member Workspace'
  }),

  DATA_FILE_NAME: 'FamilyPD_Data.json',
  SOURCE_FILE_NAME: 'FamilyPD_Sources.json',
  RECOVERY_FILE_NAME: 'FamilyPD_Recovery_Key.json',

  FOLDER_TREE: Object.freeze({
    HOUSEHOLD_LEAD: [
      { key: 'START', name: '00 - Start Here' },
      { key: 'IDENTITY', name: '01 - Household Identity' },
      { key: 'PLANNING', name: '02 - Household Planning' },
      { key: 'MEETINGS', name: '03 - Meetings' },
      { key: 'GOALS', name: '04 - Goals and Progress' },
      { key: 'LEARNING', name: '05 - Learning Research and Discussions' },
      { key: 'SYSTEMS', name: '06 - Systems Policies and Safety' },
      { key: 'OPPORTUNITIES', name: '07 - Opportunities and Mobility' },
      { key: 'UPDATE_PACKS', name: '08 - Household Update Packs' },
      { key: 'GENERATED', name: '09 - Generated Documents' },
      { key: 'ARCHIVE', name: '99 - Archive' }
    ],
    FAMILY_MEMBER: [
      { key: 'START', name: '00 - Start Here' },
      { key: 'HOUSEHOLD_INFO', name: '01 - Household Information' },
      { key: 'MY_GOALS', name: '02 - My Goals and Progress' },
      { key: 'MEETING_PREP', name: '03 - Meeting Preparation' },
      { key: 'MY_LEARNING', name: '04 - My Learning and Discussions' },
      { key: 'SYSTEMS', name: '05 - Household Systems and Safety' },
      { key: 'OPPORTUNITIES', name: '06 - Opportunities and Mobility' },
      { key: 'UPDATE_PACKS', name: '07 - Household Update Packs' },
      { key: 'GENERATED', name: '08 - Generated Documents' },
      { key: 'ARCHIVE', name: '99 - Archive' }
    ]
  }),

  DATA_CATEGORIES: Object.freeze([
    'identity',
    'values',
    'commitments',
    'memberRoles',
    'sharedGoals',
    'meetings',
    'learningPlans',
    'assignments',
    'policies',
    'safety',
    'opportunities',
    'resources'
  ]),





  OPPORTUNITIES: Object.freeze({
    MAX_SHARED: 60,
    MAX_PERSONAL: 75,
    MAX_ACTION_STEPS: 15,
    MAX_REQUIREMENTS: 15,
    MAX_QUESTIONS: 12,
    SOURCE_REVIEW_DATE: '2026-07-14',
    CATEGORIES: Object.freeze([
      'Career exploration',
      'Jobs',
      'Training & credentials',
      'Apprenticeships',
      'Scholarships & financial aid',
      'College & career school',
      'Workforce help',
      'Benefits & community support',
      'Small business & entrepreneurship',
      'Service & experience'
    ]),
    AUDIENCES: Object.freeze([
      'Any household member',
      'Teen member',
      'Young adult member',
      'Adult member',
      'Older adult member',
      'Parent or caregiver',
      'Student',
      'Career changer',
      'Job seeker',
      'Small business owner'
    ]),
    STATUSES: Object.freeze([
      'Saved',
      'Researching',
      'Preparing',
      'Applied',
      'Accepted',
      'Not selected',
      'Closed',
      'Archived'
    ]),
    PRIORITIES: Object.freeze([
      'Explore later',
      'Interested',
      'High priority'
    ]),
    SOURCE_TIERS: Object.freeze([
      'Official government source',
      'Government-sponsored source',
      'Organization website',
      'Public link checked',
      'Not yet checked'
    ])
  }),

  SYSTEMS: Object.freeze({
    MAX_POLICY_RECORDS: 80,
    MAX_SAFETY_RECORDS: 50,
    MAX_STEPS: 12,
    MAX_APPLIES_TO: 25,
    TYPES: Object.freeze([
      'Policy',
      'System',
      'Checklist',
      'Safety Plan'
    ]),
    STATUSES: Object.freeze([
      'Draft',
      'Active',
      'Review needed',
      'Archived'
    ]),
    REVIEW_FREQUENCIES: Object.freeze([
      'Weekly',
      'Monthly',
      'Quarterly',
      'Every 6 months',
      'Yearly',
      'As needed'
    ]),
    PRIORITIES: Object.freeze([
      'Routine',
      'Important',
      'High priority'
    ])
  }),

  LEARNING: Object.freeze({
    MAX_SHARED_PLANS: 40,
    MAX_PERSONAL_PLANS: 50,
    MAX_RESOURCES: 10,
    MAX_ACTIVITIES: 10,
    MAX_DISCUSSION_PROMPTS: 8,
    MAX_RESPONSES: 75,
    STATUSES: Object.freeze([
      'Draft',
      'Ready',
      'In progress',
      'Completed',
      'Archived'
    ]),
    FORMATS: Object.freeze([
      'Short reading',
      'Video',
      'Audio',
      'Hands-on activity',
      'Discussion',
      'Visual guide',
      'Course or lesson',
      'Mixed format'
    ]),
    DIFFICULTIES: Object.freeze([
      'Beginner',
      'Developing',
      'Intermediate',
      'Advanced',
      'Mixed levels'
    ]),
    RESOURCE_TYPES: Object.freeze([
      'Article or webpage',
      'Video',
      'Book',
      'Course or lesson',
      'Podcast or audio',
      'Worksheet or guide',
      'Community resource',
      'Other'
    ]),
    ESTIMATED_MINUTES: Object.freeze([
      10,
      15,
      20,
      30,
      45,
      60,
      90,
      120
    ])
  }),

  MEETINGS: Object.freeze({
    MAX_MEETINGS: 75,
    MAX_TOPICS: 12,
    MAX_PROMPTS_PER_TOPIC: 6,
    MAX_ATTENDEE_LABELS: 25,
    MAX_MATERIALS: 15,
    MAX_DECISIONS: 20,
    MAX_ACTION_ITEMS: 25,
    MAX_MEMBER_PREPARATIONS: 50,
    STATUSES: Object.freeze([
      'Draft',
      'Scheduled',
      'Completed',
      'Archived'
    ]),
    TYPES: Object.freeze([
      'Weekly Check-In',
      'Monthly Planning',
      'Goal Review',
      'Learning Discussion',
      'Safety & Preparedness',
      'Celebration & Connection',
      'Special Planning',
      'Custom Meeting'
    ]),
    FORMATS: Object.freeze([
      'In person',
      'Video call',
      'Phone call',
      'Hybrid',
      'Other'
    ]),
    DURATIONS: Object.freeze([
      15,
      30,
      45,
      60,
      75,
      90
    ])
  }),

  NEWS: Object.freeze({
    PROVIDER: 'GDELT DOC 2.0',
    ENDPOINT: 'https://api.gdeltproject.org/api/v2/doc/doc',
    MAX_RESULTS: 8,
    SEARCH_TIMESPAN: '1y',
    MAX_AGE_YEARS: 7,
    CACHE_SECONDS: 900
  }),

  GOALS: Object.freeze({
    MAX_HOUSEHOLD_GOALS: 20,
    MAX_PERSONAL_GOALS: 30,
    MAX_STEPS_PER_GOAL: 12,
    MAX_CHECKPOINTS_PER_GOAL: 50,
    TIMEFRAMES: Object.freeze([
      'This week',
      'This month',
      'Next 3 months',
      'Next 6 months',
      'This year',
      '1 to 3 years',
      '3 years or more',
      'Ongoing habit'
    ]),
    STATUSES: Object.freeze([
      'Planning',
      'In progress',
      'Paused',
      'Completed',
      'Archived'
    ]),
    MEASURES: Object.freeze([
      'Completion',
      'Percent complete',
      'Times per week',
      'Milestone checklist',
      'General progress review'
    ])
  }),

  IDENTITY: Object.freeze({
    MAX_VALUES: 8,
    RECOMMENDED_MIN_VALUES: 3,
    RECOMMENDED_MAX_VALUES: 5,
    MAX_COMMITMENTS: 10,
    MAX_ROSTER_RECORDS: 25,
    MAX_HISTORY: 30,
    MAX_SUGGESTIONS: 30,
    MAX_SYMBOL_BYTES: 1024 * 1024,
    ALLOWED_SYMBOL_MIME_TYPES: Object.freeze([
      'image/png',
      'image/jpeg',
      'image/webp'
    ])
  }),

  PILLARS: Object.freeze([
    'Health',
    'Relationships',
    'Education',
    'Finances',
    'Goals'
  ]),

  AGE_GROUPS: Object.freeze([
    'Not specified',
    'Child Member',
    'Teen Member',
    'Young Adult Member',
    'Adult Member',
    'Older Adult Member'
  ]),

  HOUSEHOLD_ROLE_LABELS: Object.freeze([
    'Household Lead',
    'Co-Lead',
    'Family Member',
    'Adult Member',
    'Young Adult Member',
    'Teen Member',
    'Child Member',
    'Older Adult Member'
  ]),

  FUNCTIONAL_ROLE_LABELS: Object.freeze([
    'Household Lead',
    'Co-Lead',
    'Meeting Facilitator',
    'Goal & Progress Coordinator',
    'Learning Coordinator',
    'Household Operations Coordinator',
    'Safety Coordinator',
    'Family Member',
    'Custom Role'
  ]),

  PERMISSION_LABELS: Object.freeze([
    'Lead',
    'Co-Lead',
    'Member'
  ]),

  LEARNING_FORMATS: Object.freeze([
    'No preference',
    'Short reading',
    'Video',
    'Audio',
    'Hands-on activity',
    'Discussion',
    'Visual guide'
  ]),

  CHECK_IN_RHYTHMS: Object.freeze([
    'No preference',
    'Weekly',
    'Every two weeks',
    'Monthly',
    'Quarterly'
  ]),

  SHARING_PREFERENCES: Object.freeze([
    'Ask me each time',
    'Share only completed items',
    'Share selected progress',
    'Keep personal work private'
  ]),

  PRIVACY_RULES: Object.freeze({
    forbiddenExamples: [
      'Social Security number',
      'government identification number',
      'bank or card number',
      'password or verification code',
      'exact home address',
      'exact birth date',
      'medical record',
      'school identification number',
      'tax document',
      'confidential legal record'
    ],
    allowedIdentityLabels: [
      'Household Lead',
      'Co-Lead',
      'Family Member',
      'Adult Member',
      'Young Adult Member',
      'Teen Member',
      'Child Member',
      'Older Adult Member'
    ]
  })
});


function fpdPropertyKey_(name) {
  return FPD_CONFIG.PROPERTY_PREFIX + name;
}


function fpdNow_() {
  return new Date().toISOString();
}


function fpdNewId_(prefix) {
  const clean = String(prefix || 'REC')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '');
  return clean + '-' + Utilities.getUuid();
}


function fpdAssertRole_(role) {
  if (!Object.values(FPD_CONFIG.ROLE).includes(role)) {
    throw new Error('Choose a valid FamilyPD workspace role.');
  }
}


function fpdSafeText_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/\u0000/g, '')
    .trim()
    .substring(0, Number(maxLength || 500));
}


function fpdParseJson_(text, fallback) {
  try {
    return JSON.parse(String(text || ''));
  } catch (error) {
    return fallback;
  }
}


function fpdClone_(value) {
  return JSON.parse(JSON.stringify(value == null ? null : value));
}


function fpdFolderMap_() {
  return fpdParseJson_(
    PropertiesService.getUserProperties().getProperty(
      fpdPropertyKey_('FOLDER_MAP_JSON')
    ),
    {}
  );
}
