/**
 * Privacy-first opportunity discovery and action planning.
 *
 * FamilyPD does not scrape private accounts or promise that a listing is
 * current. The source launcher routes families to official or
 * government-sponsored search tools. A specific opportunity should be opened,
 * reviewed, link-checked, and confirmed with its provider before action.
 */

const FPDOpportunityServiceV9 = (function() {
  const DIRECTORY = [
    source_(
      'ONET_SEARCH',
      'O*NET OnLine occupation search',
      'Búsqueda de ocupaciones O*NET OnLine',
      'National Center for O*NET Development',
      ['Career exploration'],
      ['Any household member', 'Teen member', 'Young adult member', 'Adult member', 'Career changer', 'Job seeker', 'Student'],
      'Government-sponsored source',
      'https://www.onetonline.org/',
      'Search occupations by job title, field, skill, or interest. Review duties, education, skills, and related occupations.',
      'Busque ocupaciones por título, área, habilidad o interés. Revise tareas, educación, habilidades y ocupaciones relacionadas.',
      'Enter a career or skill keyword.',
      'Escriba una carrera o habilidad.'
    ),
    source_(
      'ONET_INTEREST',
      'O*NET Interest Profiler',
      'Perfil de intereses O*NET',
      'U.S. Department of Labor O*NET program',
      ['Career exploration'],
      ['Any household member', 'Teen member', 'Young adult member', 'Adult member', 'Career changer', 'Student'],
      'Government-sponsored source',
      'https://onetinterestprofiler.org/',
      'Use an interest assessment as a conversation starter, then compare several career paths before deciding.',
      'Use una evaluación de intereses para iniciar la conversación y compare varias carreras antes de decidir.',
      'Complete the profiler, save general results, and research more than one occupation.',
      'Complete el perfil, guarde resultados generales e investigue más de una ocupación.'
    ),
    source_(
      'CAREERONESTOP_TRAINING',
      'CareerOneStop Find Training',
      'CareerOneStop: Buscar capacitación',
      'U.S. Department of Labor, Employment and Training Administration',
      ['Training & credentials', 'College & career school'],
      ['Any household member', 'Teen member', 'Young adult member', 'Adult member', 'Career changer', 'Job seeker', 'Student'],
      'Government-sponsored source',
      'https://www.careeronestop.org/FindTraining/find-training.aspx',
      'Explore short-term training, colleges, certifications, apprenticeships, internships, and ways to pay for training.',
      'Explore capacitación corta, universidades, certificaciones, aprendizajes, prácticas y formas de pagar la capacitación.',
      'Search the official tool using a program or occupation and a city, state, or ZIP code.',
      'Busque en la herramienta oficial usando un programa u ocupación y una ciudad, estado o código postal.'
    ),
    source_(
      'CAREERONESTOP_CERTIFICATIONS',
      'CareerOneStop Certification Finder',
      'CareerOneStop: Buscar certificaciones',
      'U.S. Department of Labor, Employment and Training Administration',
      ['Training & credentials'],
      ['Teen member', 'Young adult member', 'Adult member', 'Career changer', 'Job seeker', 'Student'],
      'Government-sponsored source',
      'https://www.careeronestop.org/Toolkit/Training/find-certifications.aspx',
      'Compare industry certifications connected to occupations and career goals.',
      'Compare certificaciones de la industria relacionadas con ocupaciones y metas profesionales.',
      'Search by occupation and confirm the certification owner, prerequisites, cost, and renewal rules.',
      'Busque por ocupación y confirme la organización, requisitos, costo y renovación.'
    ),
    source_(
      'APPRENTICESHIP',
      'Apprenticeship.gov Job Finder',
      'Buscador de aprendizajes de Apprenticeship.gov',
      'U.S. Department of Labor',
      ['Apprenticeships', 'Jobs', 'Training & credentials'],
      ['Teen member', 'Young adult member', 'Adult member', 'Career changer', 'Job seeker', 'Student'],
      'Official government source',
      'https://www.apprenticeship.gov/apprenticeship-job-finder',
      'Search paid apprenticeship opportunities by occupation, keyword, and location.',
      'Busque oportunidades pagadas de aprendizaje por ocupación, palabra y ubicación.',
      'Use both a career keyword and a location. Confirm whether the listing is tied to a registered occupation or partner.',
      'Use una palabra de carrera y una ubicación. Confirme si el anuncio está vinculado con una ocupación o socio registrado.'
    ),
    source_(
      'CAREERONESTOP_SCHOLARSHIPS',
      'CareerOneStop Scholarship Finder',
      'CareerOneStop: Buscar becas',
      'U.S. Department of Labor, Employment and Training Administration',
      ['Scholarships & financial aid'],
      ['Teen member', 'Young adult member', 'Adult member', 'Career changer', 'Student'],
      'Government-sponsored source',
      'https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx',
      'Search scholarships, fellowships, grants, and other education awards, then confirm current requirements on the sponsor website.',
      'Busque becas, subvenciones y otras ayudas, y confirme los requisitos actuales en el sitio del patrocinador.',
      'Try several keywords and filters. Always open the sponsor page to confirm the deadline and eligibility.',
      'Pruebe varias palabras y filtros. Abra la página del patrocinador para confirmar fecha y elegibilidad.'
    ),
    source_(
      'FEDERAL_STUDENT_AID',
      'Federal Student Aid and FAFSA',
      'Ayuda Federal para Estudiantes y FAFSA',
      'Federal Student Aid, U.S. Department of Education',
      ['Scholarships & financial aid', 'College & career school'],
      ['Teen member', 'Young adult member', 'Adult member', 'Parent or caregiver', 'Student'],
      'Official government source',
      'https://studentaid.gov/h/apply-for-aid/fafsa',
      'Use the official federal student aid site for FAFSA information and federal aid steps.',
      'Use el sitio oficial de ayuda federal para información sobre FAFSA y los pasos de ayuda.',
      'Review current school and state deadlines and complete forms only on the official StudentAid.gov site.',
      'Revise las fechas actuales y complete formularios solamente en StudentAid.gov.'
    ),
    source_(
      'COLLEGE_SCORECARD',
      'College Scorecard',
      'College Scorecard',
      'U.S. Department of Education',
      ['College & career school'],
      ['Teen member', 'Young adult member', 'Adult member', 'Parent or caregiver', 'Career changer', 'Student'],
      'Official government source',
      'https://collegescorecard.ed.gov/',
      'Compare colleges and fields of study using federal information about costs, completion, debt, and earnings.',
      'Compare instituciones y áreas de estudio usando información federal sobre costos, finalización, deuda e ingresos.',
      'Compare more than one school and review the program—not only the institution name.',
      'Compare más de una institución y revise el programa, no solamente el nombre de la escuela.'
    ),
    source_(
      'AMERICAN_JOB_CENTER',
      'American Job Center Finder',
      'Buscador de American Job Centers',
      'U.S. Department of Labor, Employment and Training Administration',
      ['Workforce help', 'Jobs', 'Training & credentials'],
      ['Any household member', 'Teen member', 'Young adult member', 'Adult member', 'Older adult member', 'Career changer', 'Job seeker'],
      'Government-sponsored source',
      'https://www.careeronestop.org/LocalHelp/AmericanJobCenters/american-job-centers.aspx',
      'Find local workforce centers that may provide job-search help, career counseling, training information, workshops, and referrals.',
      'Encuentre centros locales que pueden ofrecer ayuda de empleo, orientación, capacitación, talleres y referidos.',
      'Enter a city, state, or ZIP code and contact the center to confirm services and appointment requirements.',
      'Escriba ciudad, estado o código postal y contacte al centro para confirmar servicios y citas.'
    ),
    source_(
      'USAJOBS',
      'USAJOBS federal job search',
      'Búsqueda de empleos federales USAJOBS',
      'U.S. Office of Personnel Management',
      ['Jobs'],
      ['Young adult member', 'Adult member', 'Older adult member', 'Career changer', 'Job seeker', 'Student'],
      'Official government source',
      'https://www.usajobs.gov/Search/Results',
      'Search federal employment opportunities using keywords and location.',
      'Busque oportunidades de empleo federal usando palabras y ubicación.',
      'Read the entire announcement, especially who may apply, qualifications, required documents, and the closing date.',
      'Lea todo el anuncio, especialmente quién puede solicitar, requisitos, documentos y fecha de cierre.'
    ),
    source_(
      'JOB_CORPS',
      'Job Corps',
      'Job Corps',
      'U.S. Department of Labor',
      ['Training & credentials', 'Jobs', 'College & career school'],
      ['Teen member', 'Young adult member', 'Student'],
      'Official government source',
      'https://www.jobcorps.gov/',
      'Explore career training, education, campus options, and application information for eligible young people.',
      'Explore capacitación, educación, centros e información de solicitud para jóvenes elegibles.',
      'Review current eligibility and discuss the residential, training, and support expectations with an admissions representative.',
      'Revise la elegibilidad actual y converse sobre las expectativas con un representante de admisiones.'
    ),
    source_(
      'USA_BENEFITS',
      'USA.gov Benefit Finder',
      'Buscador de beneficios de USA.gov',
      'USA.gov',
      ['Benefits & community support'],
      ['Any household member', 'Young adult member', 'Adult member', 'Older adult member', 'Parent or caregiver', 'Job seeker'],
      'Official government source',
      'https://www.usa.gov/benefit-finder',
      'Explore government benefits and financial help by life event or category.',
      'Explore beneficios del gobierno y ayuda financiera por evento o categoría.',
      'Use the finder as a starting point and follow the official application instructions for each program.',
      'Use el buscador como punto de partida y siga instrucciones oficiales para cada programa.'
    ),
    source_(
      'SBA_LOCAL',
      'SBA local assistance',
      'Ayuda local de la SBA',
      'U.S. Small Business Administration',
      ['Small business & entrepreneurship'],
      ['Young adult member', 'Adult member', 'Older adult member', 'Career changer', 'Small business owner'],
      'Official government source',
      'https://www.sba.gov/local-assistance',
      'Find local small-business counseling, training, district offices, and resource partners.',
      'Encuentre orientación, capacitación, oficinas y socios locales para pequeñas empresas.',
      'Use a ZIP code on the official page and compare free or low-cost counseling options before paying a private provider.',
      'Use un código postal y compare orientación gratuita o de bajo costo antes de pagar a un proveedor privado.'
    ),
    source_(
      'AMERICORPS',
      'AmeriCorps service opportunities',
      'Oportunidades de servicio de AmeriCorps',
      'AmeriCorps',
      ['Service & experience', 'Jobs'],
      ['Young adult member', 'Adult member', 'Older adult member', 'Career changer', 'Job seeker', 'Student'],
      'Official government source',
      'https://www.americorps.gov/join',
      'Explore service pathways that may build skills, experience, community connections, and education benefits.',
      'Explore opciones de servicio que pueden desarrollar habilidades, experiencia, conexiones y beneficios educativos.',
      'Compare time commitment, location, living allowance, benefits, and eligibility for each service pathway.',
      'Compare tiempo, ubicación, asignación, beneficios y elegibilidad de cada opción.'
    )
  ];

  const MOBILITY_RESOURCES = [
    {
      id: 'OPPORTUNITY_ATLAS',
      titleEn: 'Opportunity Atlas',
      titleEs: 'Atlas de Oportunidades',
      organization: 'U.S. Census Bureau and Opportunity Insights',
      url: 'https://www.census.gov/programs-surveys/ces/data/analysis-visualization-tools/opportunity-atlas.html',
      sourceTier: 'Official government data tool',
      descriptionEn: 'Explore how adult outcomes differ across neighborhoods and counties for children who grew up in different circumstances. Use the tool to ask what local conditions may expand or limit opportunity—not to judge an individual family.',
      descriptionEs: 'Explore cómo cambian los resultados en la edad adulta según vecindarios y condados. Use la herramienta para preguntar qué condiciones locales pueden ampliar o limitar oportunidades, no para juzgar a una familia.',
      actionEn: 'Compare your county with another area, notice one pattern, and discuss which local resources or systems could improve opportunity.',
      actionEs: 'Compare su condado con otra área, note un patrón y converse sobre qué recursos o sistemas locales podrían mejorar las oportunidades.'
    },
    {
      id: 'OPPORTUNITY_INSIGHTS_RESOURCES',
      titleEn: 'Opportunity Insights community data tools',
      titleEs: 'Herramientas comunitarias de Opportunity Insights',
      organization: 'Opportunity Insights at Harvard University',
      url: 'https://opportunityinsights.org/resources/',
      sourceTier: 'Research organization',
      descriptionEn: 'Open the Opportunity Atlas, Social Capital Atlas, college mobility report cards, and other research tools that explain how place, networks, and institutions relate to economic opportunity.',
      descriptionEs: 'Abra el Atlas de Oportunidades, el Atlas de Capital Social, informes de movilidad universitaria y otras herramientas sobre lugar, conexiones e instituciones.',
      actionEn: 'Choose one tool and write one question about your community, school, college, or network that the data may help answer.',
      actionEs: 'Elija una herramienta y escriba una pregunta sobre su comunidad, escuela, universidad o red que los datos puedan ayudar a responder.'
    },
    {
      id: 'URBAN_UPWARD_MOBILITY',
      titleEn: 'Upward Mobility Framework and community dashboard',
      titleEs: 'Marco de movilidad ascendente y panel comunitario',
      organization: 'Urban Institute',
      url: 'https://upward-mobility.urban.org/',
      sourceTier: 'Research organization',
      descriptionEn: 'Explore local indicators connected to economic success, power and autonomy, and dignity and belonging. The framework shows that mobility is broader than income alone.',
      descriptionEs: 'Explore indicadores locales relacionados con éxito económico, poder y autonomía, dignidad y pertenencia. El marco muestra que la movilidad es más amplia que los ingresos.',
      actionEn: 'Identify one community strength and one barrier, then connect each to a FamilyPD goal, meeting topic, learning plan, or opportunity search.',
      actionEs: 'Identifique una fortaleza y una barrera de la comunidad y conéctelas con una meta, reunión, plan de aprendizaje o búsqueda de oportunidades.'
    },
    {
      id: 'CENSUS_MOVS',
      titleEn: 'Mobility, Opportunity, and Volatility Statistics',
      titleEs: 'Estadísticas de movilidad, oportunidad y variación de ingresos',
      organization: 'U.S. Census Bureau',
      url: 'https://www.census.gov/library/visualizations/interactive/movs.html',
      sourceTier: 'Official government data tool',
      descriptionEn: 'Explore how the incomes of working-age adults change over time across states and socioeconomic groups. Use it to understand broad patterns, not to predict one person’s future.',
      descriptionEs: 'Explore cómo cambian con el tiempo los ingresos de adultos en edad laboral según estados y grupos socioeconómicos. Úselo para comprender patrones generales.',
      actionEn: 'Use the visualization to learn one income-mobility term and discuss what education, employment, benefits, or financial systems may help a household build stability.',
      actionEs: 'Use la visualización para aprender un término de movilidad y conversar sobre qué sistemas de educación, empleo, beneficios o finanzas pueden apoyar la estabilidad.'
    }
  ];


  function getWorkspaceView(languageOverride) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const language = GuidanceService.normalizeLanguage(
      languageOverride ||
      data.personal && data.personal.profile && data.personal.profile.language ||
      'en'
    );

    const sharedRecords = normalizeRecords_(
      data.shared.opportunities,
      'HOUSEHOLD',
      context.role !== FPD_CONFIG.ROLE.LEAD
    );
    const personalRecords = normalizeRecords_(
      data.personal.savedOpportunities,
      'PERSONAL',
      false
    );

    return {
      role: context.role,
      roleLabel: context.roleLabel,
      language: language,
      sharedRecords: sharedRecords,
      personalRecords: personalRecords,
      options: getOptions_(language),
      directory: DIRECTORY.map(function(item) {
        return publicSource_(item, language, '', '');
      }),
      mobilityGuide: mobilityGuide_(language),
      mobilityResources: MOBILITY_RESOURCES.map(function(item) {
        return publicMobilityResource_(item, language);
      }),
      summary: buildSummary_(sharedRecords, personalRecords),
      guidance: {
        statement: language === 'es'
          ? 'La educación, las habilidades, las credenciales, las conexiones y los recursos comunitarios pueden ampliar las opciones. FamilyPD ayuda a investigar con fuentes confiables y convertir una oportunidad en próximos pasos.'
          : 'Education, skills, credentials, connections, and community resources can expand options. FamilyPD helps families research trustworthy sources and turn an opportunity into next steps.',
        inTextCitation: '(Hall, 2025, pp. 34–41, 106–108)',
        sourceReminder: language === 'es'
          ? 'La fecha, elegibilidad, costo y disponibilidad pueden cambiar. Confirme siempre la información en el sitio del proveedor antes de solicitar.'
          : 'Deadlines, eligibility, cost, and availability can change. Always confirm information on the provider website before applying.',
        privacyReminder: language === 'es'
          ? 'Guarde solamente información general. No escriba números de identificación, cuentas, contraseñas, documentos, información médica ni direcciones exactas.'
          : 'Save only general information. Do not enter identification numbers, accounts, passwords, documents, medical information, or exact addresses.'
      }
    };
  }


  function mobilityGuide_(language) {
    const es = language === 'es';
    return {
      title: es
        ? '¿Qué significa movilidad socioeconómica?'
        : 'What does socioeconomic mobility mean?',
      explanation: es
        ? 'Es la posibilidad de que una persona o familia aumente su estabilidad, opciones, poder para tomar decisiones y bienestar con el tiempo o entre generaciones. Los ingresos importan, pero también importan la educación, el trabajo estable, la vivienda, la salud, el transporte, la tecnología, las conexiones y el acceso a sistemas justos.'
        : 'Socioeconomic mobility is the ability of a person or family to increase stability, options, decision-making power, and wellbeing over time or across generations. Income matters, but so do education, stable work, housing, health, transportation, technology, connections, and access to fair systems.',
      caution: es
        ? 'Los datos comunitarios describen patrones de grupos y lugares. No determinan el potencial, carácter ni futuro de una persona.'
        : 'Community data describe patterns across groups and places. They do not determine one person’s potential, character, or future.',
      pathways: [
        pathway_('Skills & credentials', 'Habilidades y credenciales',
          'Build useful skills, education, certifications, and work experience.',
          'Desarrollar habilidades, educación, certificaciones y experiencia laboral.', es),
        pathway_('Stable work & income', 'Trabajo e ingresos estables',
          'Improve access to quality work, fair pay, benefits, and advancement.',
          'Mejorar el acceso a trabajo de calidad, pago justo, beneficios y crecimiento.', es),
        pathway_('Financial stability & assets', 'Estabilidad financiera y bienes',
          'Strengthen budgeting, credit knowledge, savings, ownership, and consumer protection.',
          'Fortalecer presupuesto, crédito, ahorro, propiedad y protección del consumidor.', es),
        pathway_('Health, housing & transportation', 'Salud, vivienda y transporte',
          'Reduce barriers that make it difficult to learn, work, participate, or recover.',
          'Reducir barreras que dificultan aprender, trabajar, participar o recuperarse.', es),
        pathway_('Networks & social capital', 'Conexiones y capital social',
          'Build trustworthy relationships that share information, support, referrals, and opportunity.',
          'Construir relaciones confiables que compartan información, apoyo, referencias y oportunidades.', es),
        pathway_('Voice, systems & community access', 'Voz, sistemas y acceso comunitario',
          'Understand institutions, rights, public resources, and ways to participate in decisions.',
          'Comprender instituciones, derechos, recursos públicos y formas de participar.', es)
      ],
      starterActions: es ? [
        'Elegir una barrera que la familia desea reducir.',
        'Identificar una fortaleza o recurso que ya existe.',
        'Abrir una herramienta de datos para aprender sobre la comunidad.',
        'Crear una meta o plan de aprendizaje relacionado.',
        'Guardar una oportunidad confiable y completar el próximo paso.'
      ] : [
        'Choose one barrier the household wants to reduce.',
        'Identify one strength or resource that already exists.',
        'Open one data tool to learn about the community.',
        'Create a related goal or learning plan.',
        'Save one trustworthy opportunity and complete the next step.'
      ]
    };
  }


  function pathway_(titleEn, titleEs, textEn, textEs, es) {
    return {
      title: es ? titleEs : titleEn,
      description: es ? textEs : textEn
    };
  }


  function publicMobilityResource_(item, language) {
    const es = language === 'es';
    return {
      id: item.id,
      title: es ? item.titleEs : item.titleEn,
      organization: item.organization,
      url: item.url,
      sourceTier: item.sourceTier,
      description: es ? item.descriptionEs : item.descriptionEn,
      action: es ? item.actionEs : item.actionEn,
      lastVerifiedDate: FPD_CONFIG.OPPORTUNITIES.SOURCE_REVIEW_DATE
    };
  }


  function searchSources(payload) {
    payload = payload || {};
    const language = GuidanceService.normalizeLanguage(payload.language);
    const category = fpdSafeText_(payload.category, 120);
    const audience = fpdSafeText_(payload.audience, 120);
    const keyword = fpdSafeText_(payload.keyword, 160);
    const location = sanitizeLocation_(payload.location);

    const results = DIRECTORY.filter(function(item) {
      const categoryMatch = !category || item.categories.indexOf(category) >= 0;
      const audienceMatch = !audience ||
        audience === 'Any household member' ||
        item.audiences.indexOf('Any household member') >= 0 ||
        item.audiences.indexOf(audience) >= 0;
      return categoryMatch && audienceMatch;
    }).map(function(item) {
      return publicSource_(item, language, keyword, location);
    });

    return {
      success: true,
      language: language,
      criteria: {
        category: category,
        audience: audience,
        keyword: keyword,
        location: location
      },
      results: results,
      message: language === 'es'
        ? 'Abra una herramienta oficial, revise resultados actuales y luego guarde el enlace específico que desea considerar.'
        : 'Open an official tool, review current results, and then save the specific opportunity link you want to consider.'
    };
  }


  function checkLink(url, languageOverride) {
    const language = GuidanceService.normalizeLanguage(languageOverride);
    const checked = ResourceVerificationService.checkResourceLink(url);
    const classification = classifySource_(checked.domain);

    return Object.assign({}, checked, {
      sourceTier: classification.tier,
      officialSource: classification.official,
      verificationStatus: classification.official
        ? (classification.tier === 'Official government source'
          ? 'Official domain checked'
          : 'Government-sponsored domain checked')
        : checked.verificationStatus,
      providerSuggestion: providerForDomain_(checked.domain),
      title: checked.title || checked.domain,
      message: checked.reachable
        ? (language === 'es'
          ? 'El enlace público respondió. Esto no confirma la elegibilidad, fecha, costo ni legitimidad de cada oferta. Revise el sitio y el proveedor.'
          : 'The public link responded. This does not confirm eligibility, deadline, cost, or the legitimacy of every offer. Review the site and provider.')
        : checked.message
    });
  }


  function saveRecord(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const record = normalizePayload_(payload);
    const shared = record.scope === 'HOUSEHOLD';

    if (shared && context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can save shared household opportunities.');
    }

    PrivacyGuardService.validatePayload(record, 'opportunity record');

    const sharedIndex = data.shared.opportunities.findIndex(function(item) {
      return String(item.id || '') === record.id;
    });
    const personalIndex = data.personal.savedOpportunities.findIndex(
      function(item) {
        return String(item.id || '') === record.id;
      }
    );
    const existing = sharedIndex >= 0
      ? data.shared.opportunities[sharedIndex]
      : personalIndex >= 0
        ? data.personal.savedOpportunities[personalIndex]
        : null;

    if (shared && personalIndex >= 0) {
      data.personal.savedOpportunities.splice(personalIndex, 1);
    }
    if (!shared && sharedIndex >= 0) {
      data.shared.opportunities.splice(sharedIndex, 1);
    }

    const target = shared
      ? data.shared.opportunities
      : data.personal.savedOpportunities;
    const maximum = shared
      ? FPD_CONFIG.OPPORTUNITIES.MAX_SHARED
      : FPD_CONFIG.OPPORTUNITIES.MAX_PERSONAL;
    const index = target.findIndex(function(item) {
      return String(item.id || '') === record.id;
    });

    if (index < 0 && target.length >= maximum) {
      throw new Error('This workspace has reached its current opportunity-record limit.');
    }

    const now = fpdNow_();
    const stored = Object.assign({}, record, {
      id: record.id || fpdNewId_('OPPORTUNITY'),
      createdAt: existing && existing.createdAt || now,
      updatedAt: now
    });
    delete stored.scope;

    if (index >= 0) target[index] = stored;
    else target.unshift(stored);

    DataStoreService.appendActivity(
      data,
      index >= 0 ? 'OPPORTUNITY_UPDATED' : 'OPPORTUNITY_SAVED',
      shared
        ? 'A shared household opportunity record was saved.'
        : 'A personal opportunity record was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Opportunity record saved.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function archiveRecord(payload) {
    payload = payload || {};
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const scope = payload.scope === 'HOUSEHOLD' ? 'HOUSEHOLD' : 'PERSONAL';

    if (scope === 'HOUSEHOLD' && context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can archive shared opportunities.');
    }

    const target = scope === 'HOUSEHOLD'
      ? data.shared.opportunities
      : data.personal.savedOpportunities;
    const record = target.find(function(item) {
      return String(item.id || '') === String(payload.recordId || '');
    });
    if (!record) throw new Error('FamilyPD could not find that opportunity record.');

    record.status = 'Archived';
    record.updatedAt = fpdNow_();
    DataStoreService.appendActivity(
      data,
      'OPPORTUNITY_ARCHIVED',
      scope === 'HOUSEHOLD'
        ? 'A shared household opportunity was archived.'
        : 'A personal opportunity was archived.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Opportunity archived.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function copySharedToPersonal(recordId, languageOverride) {
    const data = DataStoreService.readData();
    const source = data.shared.opportunities.find(function(item) {
      return String(item.id || '') === String(recordId || '');
    });
    if (!source) throw new Error('FamilyPD could not find that shared opportunity.');
    if (data.personal.savedOpportunities.length >=
        FPD_CONFIG.OPPORTUNITIES.MAX_PERSONAL) {
      throw new Error('This workspace has reached its personal opportunity limit.');
    }

    const now = fpdNow_();
    const copy = fpdClone_(source);
    copy.id = fpdNewId_('OPPORTUNITY');
    copy.status = 'Saved';
    copy.actionSteps = [];
    copy.questions = [];
    copy.nextAction = '';
    copy.notes = '';
    copy.createdAt = now;
    copy.updatedAt = now;
    data.personal.savedOpportunities.unshift(copy);

    DataStoreService.appendActivity(
      data,
      'SHARED_OPPORTUNITY_COPIED',
      'A shared opportunity was copied into the personal action workspace.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'A personal copy was created for your own action plan.',
      workspace: getWorkspaceView(languageOverride)
    };
  }


  function normalizePayload_(payload) {
    payload = payload || {};
    const scope = payload.scope === 'HOUSEHOLD' ? 'HOUSEHOLD' : 'PERSONAL';
    const title = fpdSafeText_(payload.title, 240);
    if (!title) throw new Error('Enter a short opportunity title.');

    const url = ResourceVerificationService.sanitizePublicUrl(
      payload.url,
      true
    );
    const domain = url
      ? ResourceVerificationService.extractDomain(url)
      : '';
    const classification = classifySource_(domain);
    const verificationStatus = normalizeVerification_(
      payload.verificationStatus,
      Boolean(url),
      classification
    );

    return {
      id: fpdSafeText_(payload.id, 120),
      scope: scope,
      title: title,
      category: assertOption_(
        payload.category,
        FPD_CONFIG.OPPORTUNITIES.CATEGORIES,
        'opportunity category'
      ),
      provider: fpdSafeText_(payload.provider, 220),
      url: url,
      domain: domain,
      sourceTier: classification.official
        ? classification.tier
        : fpdSafeText_(payload.sourceTier, 100) || classification.tier,
      verificationStatus: verificationStatus,
      lastCheckedAt: verificationStatus === 'Not yet checked'
        ? ''
        : fpdSafeText_(payload.lastCheckedAt, 50),
      audience: assertOption_(
        payload.audience,
        FPD_CONFIG.OPPORTUNITIES.AUDIENCES,
        'audience'
      ),
      locationLabel: sanitizeLocation_(payload.locationLabel),
      deadline: normalizeDate_(payload.deadline),
      costSummary: fpdSafeText_(payload.costSummary, 800),
      eligibility: fpdSafeText_(payload.eligibility, 1600),
      benefits: fpdSafeText_(payload.benefits, 1600),
      requirements: sanitizeTextList_(
        payload.requirements,
        FPD_CONFIG.OPPORTUNITIES.MAX_REQUIREMENTS,
        800
      ),
      status: assertOption_(
        payload.status,
        FPD_CONFIG.OPPORTUNITIES.STATUSES,
        'status'
      ),
      priority: assertOption_(
        payload.priority,
        FPD_CONFIG.OPPORTUNITIES.PRIORITIES,
        'priority'
      ),
      nextAction: fpdSafeText_(payload.nextAction, 1200),
      actionSteps: sanitizeActionSteps_(payload.actionSteps),
      questions: sanitizeTextList_(
        payload.questions,
        FPD_CONFIG.OPPORTUNITIES.MAX_QUESTIONS,
        800
      ),
      notes: fpdSafeText_(payload.notes, 3000)
    };
  }


  function normalizeRecords_(records, scope, readOnly) {
    return (Array.isArray(records) ? records : []).map(function(item) {
      item = item || {};
      return {
        id: fpdSafeText_(item.id, 120),
        scope: scope,
        readOnly: Boolean(readOnly),
        title: fpdSafeText_(item.title, 240),
        category: normalizeOption_(
          item.category,
          FPD_CONFIG.OPPORTUNITIES.CATEGORIES,
          'Career exploration'
        ),
        provider: fpdSafeText_(item.provider, 220),
        url: fpdSafeText_(item.url, 2000),
        domain: fpdSafeText_(item.domain, 200),
        sourceTier: fpdSafeText_(item.sourceTier, 100) || 'Not yet checked',
        verificationStatus: fpdSafeText_(item.verificationStatus, 100) ||
          'Not yet checked',
        lastCheckedAt: fpdSafeText_(item.lastCheckedAt, 50),
        audience: normalizeOption_(
          item.audience,
          FPD_CONFIG.OPPORTUNITIES.AUDIENCES,
          'Any household member'
        ),
        locationLabel: fpdSafeText_(item.locationLabel, 160),
        deadline: normalizeDate_(item.deadline),
        costSummary: fpdSafeText_(item.costSummary, 800),
        eligibility: fpdSafeText_(item.eligibility, 1600),
        benefits: fpdSafeText_(item.benefits, 1600),
        requirements: sanitizeTextList_(
          item.requirements,
          FPD_CONFIG.OPPORTUNITIES.MAX_REQUIREMENTS,
          800
        ),
        status: normalizeOption_(
          item.status,
          FPD_CONFIG.OPPORTUNITIES.STATUSES,
          'Saved'
        ),
        priority: normalizeOption_(
          item.priority,
          FPD_CONFIG.OPPORTUNITIES.PRIORITIES,
          'Interested'
        ),
        nextAction: fpdSafeText_(item.nextAction, 1200),
        actionSteps: sanitizeActionSteps_(item.actionSteps),
        questions: sanitizeTextList_(
          item.questions,
          FPD_CONFIG.OPPORTUNITIES.MAX_QUESTIONS,
          800
        ),
        notes: fpdSafeText_(item.notes, 3000),
        createdAt: fpdSafeText_(item.createdAt, 50),
        updatedAt: fpdSafeText_(item.updatedAt, 50)
      };
    }).sort(sortRecords_);
  }


  function getOptions_(language) {
    return {
      categories: FPD_CONFIG.OPPORTUNITIES.CATEGORIES.map(function(value) {
        return option_(value, translateCategory_(value, language));
      }),
      audiences: FPD_CONFIG.OPPORTUNITIES.AUDIENCES.map(function(value) {
        return option_(value, translateAudience_(value, language));
      }),
      statuses: FPD_CONFIG.OPPORTUNITIES.STATUSES.map(function(value) {
        return option_(value, translateStatus_(value, language));
      }),
      priorities: FPD_CONFIG.OPPORTUNITIES.PRIORITIES.map(function(value) {
        return option_(value, translatePriority_(value, language));
      }),
      scopes: [
        option_('PERSONAL', language === 'es' ? 'Mi oportunidad privada' : 'My private opportunity'),
        option_('HOUSEHOLD', language === 'es' ? 'Oportunidad compartida del hogar' : 'Shared household opportunity')
      ]
    };
  }


  function buildSummary_(sharedRecords, personalRecords) {
    const today = fpdNow_().substring(0, 10);
    const current = sharedRecords.concat(personalRecords).filter(function(item) {
      return item.status !== 'Archived' && item.status !== 'Closed';
    });
    const deadlines = current.filter(function(item) {
      return Boolean(item.deadline);
    }).sort(function(a, b) {
      return a.deadline.localeCompare(b.deadline);
    });
    const upcoming = deadlines.filter(function(item) {
      return item.deadline >= today;
    }).slice(0, 3);
    const overdue = deadlines.filter(function(item) {
      return item.deadline < today &&
        ['Applied', 'Accepted', 'Not selected', 'Closed', 'Archived']
          .indexOf(item.status) < 0;
    });
    const actionNeeded = current.filter(function(item) {
      return item.priority === 'High priority' ||
        item.status === 'Preparing' ||
        Boolean(item.nextAction);
    });

    return {
      shared: sharedRecords.filter(function(item) {
        return item.status !== 'Archived';
      }).length,
      personal: personalRecords.filter(function(item) {
        return item.status !== 'Archived';
      }).length,
      actionNeeded: actionNeeded.length,
      overdue: overdue.length,
      upcomingDeadlines: upcoming
    };
  }


  function publicSource_(item, language, keyword, location) {
    return {
      id: item.id,
      title: language === 'es' ? item.titleEs : item.titleEn,
      organization: item.organization,
      categories: item.categories.map(function(value) {
        return translateCategory_(value, language);
      }),
      categoryValues: item.categories,
      audiences: item.audiences.map(function(value) {
        return translateAudience_(value, language);
      }),
      sourceTier: translateTier_(item.sourceTier, language),
      sourceTierValue: item.sourceTier,
      url: buildSearchUrl_(item, keyword, location),
      baseUrl: item.baseUrl,
      description: language === 'es' ? item.descriptionEs : item.descriptionEn,
      searchTip: language === 'es' ? item.tipEs : item.tipEn,
      lastVerifiedDate: FPD_CONFIG.OPPORTUNITIES.SOURCE_REVIEW_DATE,
      officialSource: true
    };
  }


  function buildSearchUrl_(item, keyword, location) {
    const k = encodeURIComponent(keyword || '');
    const l = encodeURIComponent(location || '');

    if (item.id === 'ONET_SEARCH' && keyword) {
      return 'https://www.onetonline.org/find/result?s=' + k;
    }
    if (item.id === 'AMERICAN_JOB_CENTER' && location) {
      return 'https://www.careeronestop.org/LocalHelp/AmericanJobCenters/' +
        'find-american-job-centers.aspx?location=' + l;
    }
    if (item.id === 'USAJOBS' && (keyword || location)) {
      const parts = [];
      if (keyword) parts.push('k=' + k);
      if (location) parts.push('l=' + l);
      return 'https://www.usajobs.gov/Search/Results?' + parts.join('&');
    }
    return item.baseUrl;
  }


  function classifySource_(domain) {
    const host = String(domain || '').toLowerCase();
    if (!host) {
      return { tier: 'Not yet checked', official: false };
    }
    if (host.endsWith('.gov') || host === 'usa.gov' || host === 'usajobs.gov') {
      return { tier: 'Official government source', official: true };
    }
    if ([
      'careeronestop.org',
      'onetonline.org',
      'mynextmove.org',
      'onetinterestprofiler.org'
    ].indexOf(host) >= 0) {
      return { tier: 'Government-sponsored source', official: true };
    }
    return { tier: 'Public link checked', official: false };
  }


  function providerForDomain_(domain) {
    return {
      'careeronestop.org': 'CareerOneStop',
      'onetonline.org': 'O*NET OnLine',
      'mynextmove.org': 'My Next Move',
      'onetinterestprofiler.org': 'O*NET Interest Profiler',
      'apprenticeship.gov': 'Apprenticeship.gov',
      'studentaid.gov': 'Federal Student Aid',
      'collegescorecard.ed.gov': 'College Scorecard',
      'usa.gov': 'USA.gov',
      'usajobs.gov': 'USAJOBS',
      'sba.gov': 'U.S. Small Business Administration',
      'jobcorps.gov': 'Job Corps',
      'americorps.gov': 'AmeriCorps',
      'census.gov': 'U.S. Census Bureau',
      'opportunityinsights.org': 'Opportunity Insights',
      'upward-mobility.urban.org': 'Urban Institute Upward Mobility Initiative',
      'urban.org': 'Urban Institute',
      'nevadapartners.org': 'Nevada Partners',
      'familypd.org': 'FamilyPD'
    }[domain] || domain;
  }


  function normalizeVerification_(value, hasUrl, classification) {
    if (!hasUrl) return 'Not yet checked';
    if (classification.official) {
      return classification.tier === 'Official government source'
        ? 'Official domain checked'
        : 'Government-sponsored domain checked';
    }
    const text = fpdSafeText_(value, 100);
    return ['Link checked', 'Check failed', 'Not yet checked'].indexOf(text) >= 0
      ? text
      : 'Not yet checked';
  }


  function sanitizeActionSteps_(values) {
    return (Array.isArray(values) ? values : [])
      .slice(0, FPD_CONFIG.OPPORTUNITIES.MAX_ACTION_STEPS)
      .map(function(item) {
        if (typeof item === 'string') {
          return {
            id: fpdNewId_('STEP'),
            text: fpdSafeText_(item, 800),
            dueDate: '',
            status: 'Open'
          };
        }
        item = item || {};
        return {
          id: fpdSafeText_(item.id, 120) || fpdNewId_('STEP'),
          text: fpdSafeText_(item.text, 800),
          dueDate: normalizeDate_(item.dueDate),
          status: item.status === 'Completed' ? 'Completed' : 'Open'
        };
      })
      .filter(function(item) { return Boolean(item.text); });
  }


  function sanitizeTextList_(values, maximum, length) {
    return (Array.isArray(values) ? values : [])
      .slice(0, maximum)
      .map(function(value) { return fpdSafeText_(value, length); })
      .filter(Boolean);
  }


  function sanitizeLocation_(value) {
    return fpdSafeText_(value, 160)
      .replace(/\s+/g, ' ')
      .trim();
  }


  function normalizeDate_(value) {
    const text = String(value || '').trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
  }


  function assertOption_(value, allowed, label) {
    if (allowed.indexOf(value) < 0) {
      throw new Error('Choose a valid ' + label + '.');
    }
    return value;
  }


  function normalizeOption_(value, allowed, fallback) {
    return allowed.indexOf(value) >= 0 ? value : fallback;
  }


  function sortRecords_(a, b) {
    if (a.status === 'Archived' && b.status !== 'Archived') return 1;
    if (a.status !== 'Archived' && b.status === 'Archived') return -1;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  }


  function translateCategory_(value, language) {
    if (language !== 'es') return value;
    return {
      'Career exploration': 'Exploración profesional',
      Jobs: 'Empleos',
      'Training & credentials': 'Capacitación y credenciales',
      Apprenticeships: 'Aprendizajes',
      'Scholarships & financial aid': 'Becas y ayuda financiera',
      'College & career school': 'Universidad y escuela profesional',
      'Workforce help': 'Ayuda laboral',
      'Benefits & community support': 'Beneficios y apoyo comunitario',
      'Small business & entrepreneurship': 'Pequeñas empresas y emprendimiento',
      'Service & experience': 'Servicio y experiencia'
    }[value] || value;
  }


  function translateAudience_(value, language) {
    if (language !== 'es') return value;
    return {
      'Any household member': 'Cualquier miembro del hogar',
      'Teen member': 'Miembro adolescente',
      'Young adult member': 'Miembro adulto joven',
      'Adult member': 'Miembro adulto',
      'Older adult member': 'Miembro adulto mayor',
      'Parent or caregiver': 'Padre, madre o cuidador',
      Student: 'Estudiante',
      'Career changer': 'Persona que cambia de carrera',
      'Job seeker': 'Persona que busca empleo',
      'Small business owner': 'Propietario de pequeña empresa'
    }[value] || value;
  }


  function translateStatus_(value, language) {
    if (language !== 'es') return value;
    return {
      Saved: 'Guardada',
      Researching: 'Investigando',
      Preparing: 'Preparando',
      Applied: 'Solicitud enviada',
      Accepted: 'Aceptada',
      'Not selected': 'No seleccionada',
      Closed: 'Cerrada',
      Archived: 'Archivada'
    }[value] || value;
  }


  function translatePriority_(value, language) {
    if (language !== 'es') return value;
    return {
      'Explore later': 'Explorar después',
      Interested: 'Interesada',
      'High priority': 'Prioridad alta'
    }[value] || value;
  }


  function translateTier_(value, language) {
    if (language !== 'es') return value;
    return {
      'Official government source': 'Fuente oficial del gobierno',
      'Government-sponsored source': 'Fuente patrocinada por el gobierno',
      'Organization website': 'Sitio de la organización',
      'Public link checked': 'Enlace público revisado',
      'Not yet checked': 'Todavía no revisado'
    }[value] || value;
  }


  function option_(value, label) {
    return { value: value, label: label };
  }


  function source_(
    id,
    titleEn,
    titleEs,
    organization,
    categories,
    audiences,
    sourceTier,
    baseUrl,
    descriptionEn,
    descriptionEs,
    tipEn,
    tipEs
  ) {
    return {
      id: id,
      titleEn: titleEn,
      titleEs: titleEs,
      organization: organization,
      categories: categories,
      audiences: audiences,
      sourceTier: sourceTier,
      baseUrl: baseUrl,
      descriptionEn: descriptionEn,
      descriptionEs: descriptionEs,
      tipEn: tipEn,
      tipEs: tipEs
    };
  }


  return {
    getWorkspaceView: getWorkspaceView,
    searchSources: searchSources,
    checkLink: checkLink,
    saveRecord: saveRecord,
    archiveRecord: archiveRecord,
    copySharedToPersonal: copySharedToPersonal
  };
})();
