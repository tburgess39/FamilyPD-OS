/**
 * Privacy-first FamilyPD meeting planning.
 *
 * Household Lead workspaces create and manage shared meetings.
 * Family Member workspaces view imported shared meetings and save private
 * preparation notes. Any general household role may be selected to facilitate.
 */

const FPDMeetingServiceV71 = (function() {
  const TOPIC_LIBRARY = {
    en: {
      Health: [
        topic_('health_wellness', 'Household wellness check-in',
          'Give members a simple opportunity to share how they are doing and what support may help.',
          ['How is everyone feeling—really?', 'What has helped our wellbeing recently?', 'What is one small health-supporting action for the coming week?'],
          'Agree on one realistic wellness action.'),
        topic_('health_routines', 'Healthy routines',
          'Review sleep, movement, meals, rest, hygiene, or other general routines without recording medical details.',
          ['Which routine is working?', 'Which routine is difficult?', 'What small change would make the routine easier?'],
          'Choose one routine to strengthen.'),
        topic_('health_safety', 'Safety and preparedness',
          'Review a general safety topic and decide what needs practice or follow-up.',
          ['What situation should we prepare for?', 'What should each person generally know or do?', 'What practice or reminder is needed?'],
          'Choose one preparedness action.'),
        topic_('health_stress', 'Stress, rest, and support',
          'Talk about household stress in plain language and identify supportive, non-clinical actions.',
          ['What is creating the most pressure right now?', 'What can the household reduce, share, or simplify?', 'What kind of support would help?'],
          'Agree on one way to reduce pressure.')
      ],
      Relationships: [
        topic_('relationships_respect', 'Respect and communication',
          'Review how household members speak, listen, disagree, and repair.',
          ['What communication went well?', 'Did anyone feel unheard or disrespected?', 'What agreement should we practice this week?'],
          'Choose one communication agreement.'),
        topic_('relationships_appreciation', 'Appreciation and encouragement',
          'Recognize effort, growth, kindness, and support.',
          ['Who helped the household recently?', 'What progress should be celebrated?', 'How can we encourage one another this week?'],
          'Share appreciation and one encouragement.'),
        topic_('relationships_quality_time', 'Quality time and connection',
          'Plan realistic time together that fits the household’s schedule and resources.',
          ['What activity would help us connect?', 'When could it happen?', 'How can everyone participate?'],
          'Choose one connection activity.'),
        topic_('relationships_repair', 'Conflict repair',
          'Use a calm meeting to discuss a general conflict pattern and plan healthier repair.',
          ['What happened without blaming or insulting?', 'What impact did it have?', 'What should we try next time?'],
          'Agree on a repair step.')
      ],
      Education: [
        topic_('education_checkin', 'Learning and school check-in',
          'Review learning progress and general support needs without storing confidential school records.',
          ['What are we learning?', 'What is going well?', 'Where is help, practice, or more information needed?'],
          'Choose one learning support action.'),
        topic_('education_career', 'Career, training, or credential exploration',
          'Explore a career pathway, training program, credential, apprenticeship, or education option.',
          ['What opportunity are we exploring?', 'What skills or requirements does it involve?', 'What is one trustworthy next step?'],
          'Identify one next research or preparation step.'),
        topic_('education_skillshare', 'Household skill share',
          'Let one member teach or demonstrate a useful skill.',
          ['What skill can someone share?', 'Why is it useful?', 'How can members practice it?'],
          'Choose a skill and practice plan.'),
        topic_('education_digital', 'Digital literacy and AI tools',
          'Learn how to use technology safely to understand information, practice skills, or work more efficiently.',
          ['What tool could help?', 'What privacy rule should we follow?', 'How will we review the tool’s answer for mistakes?'],
          'Try one tool safely and review the result.')
      ],
      Finances: [
        topic_('finances_upcoming', 'Upcoming expenses and priorities',
          'Discuss general upcoming expenses and choices without entering account numbers or exact balances.',
          ['What general expenses are coming?', 'Which needs are most important?', 'What can be planned, reduced, delayed, or researched?'],
          'Agree on one financial planning action.'),
        topic_('finances_saving', 'Saving and spending habits',
          'Review a general habit and choose a realistic improvement.',
          ['What spending or saving habit are we noticing?', 'What is working?', 'What adjustment could help?'],
          'Choose one habit to practice.'),
        topic_('finances_learning', 'Financial learning topic',
          'Learn about budgeting, credit, saving, debt, taxes, benefits, fraud, or consumer protection from a trustworthy source.',
          ['What topic do we need to understand?', 'What source will we use?', 'What is one lesson we can apply?'],
          'Document one practical lesson.'),
        topic_('finances_costsaving', 'Household cost-saving ideas',
          'Identify practical ways to reduce waste or make household resources last longer.',
          ['Where may resources be wasted?', 'Which change would be realistic?', 'Who can help with the new routine?'],
          'Choose one cost-saving practice.')
      ],
      Goals: [
        topic_('goals_progress', 'Goal progress review',
          'Review one or two household goals, recognize progress, and choose next actions.',
          ['What progress was made?', 'What got in the way?', 'What support or adjustment is needed next?'],
          'Choose the next action for each reviewed goal.'),
        topic_('goals_priorities', 'Upcoming priorities',
          'Identify the most important household priorities for the next week or month.',
          ['What needs attention soon?', 'What can wait?', 'Who will help with each priority?'],
          'Choose up to three priorities.'),
        topic_('goals_barriers', 'Barriers and support',
          'Discuss what is making progress difficult without blaming members.',
          ['What barrier are we experiencing?', 'What is within our control?', 'What support, system, or resource could help?'],
          'Choose one barrier-reduction step.'),
        topic_('goals_celebration', 'Celebrate progress',
          'Recognize completed steps, consistency, courage, learning, or improvement.',
          ['What did we complete or improve?', 'What helped us succeed?', 'How should we recognize the progress?'],
          'Celebrate and name what should continue.')
      ],
      Organization: [
        topic_('organization_roles', 'Roles and shared responsibilities',
          'Review whether responsibilities are clear, realistic, and shared fairly.',
          ['What responsibilities are clear?', 'Where is one person carrying too much?', 'What should be reassigned, taught, or clarified?'],
          'Update one responsibility agreement.'),
        topic_('organization_systems', 'Household systems and routines',
          'Review how a repeated household task gets done and improve the process.',
          ['What system are we reviewing?', 'Where does it break down?', 'What step, reminder, or role would improve it?'],
          'Improve one household system.'),
        topic_('organization_policies', 'Household policies and agreements',
          'Review one shared agreement before problems happen.',
          ['What agreement needs review?', 'Does everyone understand it?', 'Is it fair, realistic, and connected to household values?'],
          'Clarify or update one agreement.'),
        topic_('organization_community', 'Community resources and support',
          'Identify a safe program, organization, mentor, event, or opportunity that may support the household.',
          ['What kind of support or opportunity is needed?', 'What trustworthy resource could help?', 'What is the next safe step?'],
          'Choose one resource to explore.')
      ]
    },

    es: {
      Health: [
        topic_('health_wellness', 'Revisión del bienestar del hogar',
          'Dé a los miembros una oportunidad sencilla para compartir cómo están y qué apoyo podría ayudar.',
          ['¿Cómo se siente cada persona de verdad?', '¿Qué ha ayudado a nuestro bienestar recientemente?', '¿Cuál es una acción pequeña para apoyar la salud esta semana?'],
          'Acordar una acción realista de bienestar.'),
        topic_('health_routines', 'Rutinas saludables',
          'Revise el sueño, movimiento, comidas, descanso, higiene u otras rutinas generales sin registrar detalles médicos.',
          ['¿Qué rutina está funcionando?', '¿Qué rutina es difícil?', '¿Qué cambio pequeño la haría más fácil?'],
          'Elegir una rutina para fortalecer.'),
        topic_('health_safety', 'Seguridad y preparación',
          'Revise un tema general de seguridad y decida qué necesita práctica o seguimiento.',
          ['¿Para qué situación debemos prepararnos?', '¿Qué debe saber o hacer cada persona de forma general?', '¿Qué práctica o recordatorio se necesita?'],
          'Elegir una acción de preparación.'),
        topic_('health_stress', 'Estrés, descanso y apoyo',
          'Converse sobre el estrés del hogar con palabras sencillas e identifique acciones de apoyo no clínicas.',
          ['¿Qué está creando más presión ahora?', '¿Qué puede reducir, compartir o simplificar el hogar?', '¿Qué tipo de apoyo ayudaría?'],
          'Acordar una manera de reducir la presión.')
      ],
      Relationships: [
        topic_('relationships_respect', 'Respeto y comunicación',
          'Revise cómo los miembros hablan, escuchan, no están de acuerdo y reparan.',
          ['¿Qué comunicación salió bien?', '¿Alguien se sintió ignorado o tratado sin respeto?', '¿Qué acuerdo debemos practicar esta semana?'],
          'Elegir un acuerdo de comunicación.'),
        topic_('relationships_appreciation', 'Aprecio y ánimo',
          'Reconozca el esfuerzo, crecimiento, amabilidad y apoyo.',
          ['¿Quién ayudó al hogar recientemente?', '¿Qué progreso debemos celebrar?', '¿Cómo podemos animarnos esta semana?'],
          'Compartir aprecio y un mensaje de ánimo.'),
        topic_('relationships_quality_time', 'Tiempo de calidad y conexión',
          'Planifique tiempo realista juntos que se adapte al horario y los recursos.',
          ['¿Qué actividad nos ayudaría a conectar?', '¿Cuándo podría ocurrir?', '¿Cómo puede participar cada persona?'],
          'Elegir una actividad de conexión.'),
        topic_('relationships_repair', 'Reparación después de un conflicto',
          'Use una reunión tranquila para conversar sobre un patrón general y planificar una reparación más saludable.',
          ['¿Qué ocurrió sin culpar ni insultar?', '¿Qué impacto tuvo?', '¿Qué debemos intentar la próxima vez?'],
          'Acordar un paso de reparación.')
      ],
      Education: [
        topic_('education_checkin', 'Revisión de aprendizaje y escuela',
          'Revise el progreso y las necesidades generales sin almacenar expedientes escolares confidenciales.',
          ['¿Qué estamos aprendiendo?', '¿Qué está saliendo bien?', '¿Dónde se necesita ayuda, práctica o más información?'],
          'Elegir una acción de apoyo al aprendizaje.'),
        topic_('education_career', 'Exploración de carrera, capacitación o credencial',
          'Explore una carrera, programa, certificación, aprendizaje laboral u opción educativa.',
          ['¿Qué oportunidad estamos explorando?', '¿Qué habilidades o requisitos incluye?', '¿Cuál es un próximo paso confiable?'],
          'Identificar un próximo paso de investigación o preparación.'),
        topic_('education_skillshare', 'Compartir una habilidad en el hogar',
          'Permita que un miembro enseñe o demuestre una habilidad útil.',
          ['¿Qué habilidad puede compartir alguien?', '¿Por qué es útil?', '¿Cómo pueden practicar los miembros?'],
          'Elegir una habilidad y un plan de práctica.'),
        topic_('education_digital', 'Alfabetización digital y herramientas de IA',
          'Aprenda a usar tecnología de forma segura para comprender información, practicar o trabajar con más eficiencia.',
          ['¿Qué herramienta podría ayudar?', '¿Qué regla de privacidad debemos seguir?', '¿Cómo revisaremos la respuesta para detectar errores?'],
          'Probar una herramienta de forma segura y revisar el resultado.')
      ],
      Finances: [
        topic_('finances_upcoming', 'Gastos próximos y prioridades',
          'Converse sobre gastos generales próximos sin ingresar números de cuenta ni saldos exactos.',
          ['¿Qué gastos generales se aproximan?', '¿Qué necesidades son más importantes?', '¿Qué se puede planificar, reducir, retrasar o investigar?'],
          'Acordar una acción de planificación financiera.'),
        topic_('finances_saving', 'Hábitos de ahorro y gastos',
          'Revise un hábito general y elija una mejora realista.',
          ['¿Qué hábito estamos observando?', '¿Qué está funcionando?', '¿Qué ajuste podría ayudar?'],
          'Elegir un hábito para practicar.'),
        topic_('finances_learning', 'Tema de aprendizaje financiero',
          'Aprenda sobre presupuesto, crédito, ahorro, deudas, impuestos, beneficios, fraude o protección del consumidor con una fuente confiable.',
          ['¿Qué tema necesitamos comprender?', '¿Qué fuente usaremos?', '¿Cuál es una lección que podemos aplicar?'],
          'Documentar una lección práctica.'),
        topic_('finances_costsaving', 'Ideas para reducir costos',
          'Identifique maneras prácticas de reducir desperdicios o hacer que los recursos duren más.',
          ['¿Dónde puede haber desperdicio?', '¿Qué cambio sería realista?', '¿Quién puede ayudar con la nueva rutina?'],
          'Elegir una práctica para reducir costos.')
      ],
      Goals: [
        topic_('goals_progress', 'Revisión del progreso de metas',
          'Revise una o dos metas, reconozca el progreso y elija próximas acciones.',
          ['¿Qué progreso se logró?', '¿Qué dificultó el progreso?', '¿Qué apoyo o ajuste se necesita?'],
          'Elegir la próxima acción para cada meta.'),
        topic_('goals_priorities', 'Prioridades próximas',
          'Identifique las prioridades más importantes para la próxima semana o mes.',
          ['¿Qué necesita atención pronto?', '¿Qué puede esperar?', '¿Quién ayudará con cada prioridad?'],
          'Elegir hasta tres prioridades.'),
        topic_('goals_barriers', 'Barreras y apoyo',
          'Converse sobre lo que dificulta el progreso sin culpar a los miembros.',
          ['¿Qué barrera estamos viviendo?', '¿Qué está bajo nuestro control?', '¿Qué apoyo, sistema o recurso podría ayudar?'],
          'Elegir un paso para reducir la barrera.'),
        topic_('goals_celebration', 'Celebrar el progreso',
          'Reconozca pasos completados, constancia, valentía, aprendizaje o mejora.',
          ['¿Qué completamos o mejoramos?', '¿Qué nos ayudó?', '¿Cómo debemos reconocer el progreso?'],
          'Celebrar y nombrar lo que debe continuar.')
      ],
      Organization: [
        topic_('organization_roles', 'Roles y responsabilidades compartidas',
          'Revise si las responsabilidades son claras, realistas y compartidas justamente.',
          ['¿Qué responsabilidades están claras?', '¿Dónde una persona lleva demasiado?', '¿Qué se debe reasignar, enseñar o aclarar?'],
          'Actualizar un acuerdo de responsabilidad.'),
        topic_('organization_systems', 'Sistemas y rutinas del hogar',
          'Revise cómo se completa una tarea repetida y mejore el proceso.',
          ['¿Qué sistema estamos revisando?', '¿Dónde falla?', '¿Qué paso, recordatorio o rol lo mejoraría?'],
          'Mejorar un sistema del hogar.'),
        topic_('organization_policies', 'Políticas y acuerdos del hogar',
          'Revise un acuerdo compartido antes de que ocurra un problema.',
          ['¿Qué acuerdo necesita revisión?', '¿Todos lo comprenden?', '¿Es justo, realista y conectado a los valores?'],
          'Aclarar o actualizar un acuerdo.'),
        topic_('organization_community', 'Recursos y apoyo comunitario',
          'Identifique un programa, organización, mentor, evento u oportunidad segura.',
          ['¿Qué apoyo u oportunidad se necesita?', '¿Qué recurso confiable podría ayudar?', '¿Cuál es el próximo paso seguro?'],
          'Elegir un recurso para explorar.')
      ]
    }
  };


  function getWorkspaceView(languageOverride) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const language = GuidanceService.normalizeLanguage(
      languageOverride ||
      data.personal && data.personal.profile && data.personal.profile.language ||
      'en'
    );

    return {
      role: context.role,
      roleLabel: context.roleLabel,
      language: language,
      meetings: normalizeMeetingList_(data.shared.meetings || []),
      memberPreparations: normalizePreparationList_(
        data.personal.meetingPreparation || []
      ),
      attendeeOptions: buildAttendeeOptions_(data),
      guidance: getGuidance_(language),
      citation: {
        contentId: 'MEETING_GUIDANCE',
        inTextCitation: '(Hall, 2025, pp. 17–20, 54, 57–63)',
        statement: language === 'es'
          ? 'Las reuniones deben ser planificadas, consistentes, inclusivas y enfocadas en decisiones y próximos pasos.'
          : 'Meetings should be planned, consistent, inclusive, and focused on decisions and next actions.'
      }
    };
  }


  function getGuidance_(language) {
    const lang = GuidanceService.normalizeLanguage(language);
    return {
      language: lang,
      topicGroups: [
        { value: 'Health', label: lang === 'es' ? 'Salud' : 'Health' },
        { value: 'Relationships', label: lang === 'es' ? 'Relaciones' : 'Relationships' },
        { value: 'Education', label: lang === 'es' ? 'Educación' : 'Education' },
        { value: 'Finances', label: lang === 'es' ? 'Finanzas' : 'Finances' },
        { value: 'Goals', label: lang === 'es' ? 'Metas' : 'Goals' },
        { value: 'Organization', label: lang === 'es' ? 'Organización del hogar' : 'Household Organization' }
      ],
      topics: fpdClone_(TOPIC_LIBRARY[lang]),
      statuses: FPD_CONFIG.MEETINGS.STATUSES.map(function(value) {
        return { value: value, label: translateStatus_(value, lang) };
      }),
      types: FPD_CONFIG.MEETINGS.TYPES.map(function(value) {
        return { value: value, label: translateType_(value, lang) };
      }),
      formats: FPD_CONFIG.MEETINGS.FORMATS.map(function(value) {
        return { value: value, label: translateFormat_(value, lang) };
      }),
      durations: FPD_CONFIG.MEETINGS.DURATIONS.map(function(value) {
        return {
          value: String(value),
          label: value + (lang === 'es' ? ' minutos' : ' minutes')
        };
      }),
      privacyMessage: lang === 'es'
        ? 'Use etiquetas generales para los asistentes y el facilitador. No ingrese direcciones exactas, teléfonos, correos, información médica, saldos de cuentas, expedientes escolares confidenciales ni identificadores.'
        : 'Use general labels for attendees and the facilitator. Do not enter exact addresses, phone numbers, emails, medical information, account balances, confidential school records, or identifiers.',
      newsMessage: lang === 'es'
        ? 'FamilyPD verifica que el resultado incluya título, fuente, fecha y enlace. Esto no significa que cada afirmación del artículo haya sido comprobada. Abra y revise el artículo antes de agregarlo.'
        : 'FamilyPD verifies that a result includes a title, source, date, and link. This does not mean every claim in the article has been fact-checked. Open and review the article before adding it.'
    };
  }


  function saveMeeting(payload) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only the Household Lead workspace can create or edit shared meetings.');
    }

    const data = DataStoreService.readData();
    data.shared.meetings = Array.isArray(data.shared.meetings)
      ? data.shared.meetings : [];

    const normalized = normalizeMeetingPayload_(payload);
    const privacyCopy = fpdClone_(normalized);
    privacyCopy.topics = (privacyCopy.topics || []).map(function(topic) {
      topic.article = null;
      return topic;
    });
    PrivacyGuardService.validatePayload(privacyCopy, 'meeting');

    const index = data.shared.meetings.findIndex(function(item) {
      return String(item.id || '') === normalized.id;
    });

    if (index < 0 && data.shared.meetings.length >= FPD_CONFIG.MEETINGS.MAX_MEETINGS) {
      throw new Error('This workspace has reached its current meeting limit.');
    }

    const now = fpdNow_();
    const existing = index >= 0 ? data.shared.meetings[index] : null;
    const record = Object.assign({}, existing || {}, normalized, {
      id: normalized.id || fpdNewId_('MEETING'),
      createdAt: existing && existing.createdAt || now,
      updatedAt: now,
      completedAt: normalized.status === 'Completed'
        ? existing && existing.completedAt || now
        : ''
    });

    if (index >= 0) data.shared.meetings[index] = record;
    else data.shared.meetings.unshift(record);

    DataStoreService.appendActivity(
      data,
      index >= 0 ? 'MEETING_UPDATED' : 'MEETING_CREATED',
      'A non-sensitive household meeting record was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Meeting saved.',
      meeting: normalizeMeeting_(record),
      workspace: getWorkspaceView(payload && payload.language)
    };
  }


  function duplicateMeeting(meetingId, language) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only the Household Lead workspace can duplicate meetings.');
    }

    const data = DataStoreService.readData();
    const original = (data.shared.meetings || []).find(function(item) {
      return String(item.id || '') === String(meetingId || '');
    });
    if (!original) throw new Error('FamilyPD could not find that meeting.');

    const duplicate = fpdClone_(original);
    duplicate.id = fpdNewId_('MEETING');
    duplicate.title = fpdSafeText_(
      String(original.title || 'Meeting') +
      (GuidanceService.normalizeLanguage(language) === 'es'
        ? ' — nueva copia'
        : ' — new copy'),
      180
    );
    duplicate.status = 'Draft';
    duplicate.scheduledDate = '';
    duplicate.scheduledTime = '';
    duplicate.completedAt = '';
    duplicate.decisions = [];
    duplicate.actionItems = (duplicate.actionItems || [])
      .filter(function(item) { return item.status !== 'Completed'; })
      .map(function(item) {
        item.id = fpdNewId_('ACTION');
        item.status = 'Open';
        return item;
      });
    duplicate.createdAt = fpdNow_();
    duplicate.updatedAt = duplicate.createdAt;

    data.shared.meetings.unshift(duplicate);
    data.shared.meetings = data.shared.meetings.slice(0, FPD_CONFIG.MEETINGS.MAX_MEETINGS);
    DataStoreService.appendActivity(data, 'MEETING_DUPLICATED', 'A meeting was duplicated as a new draft.');
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Meeting duplicated.',
      workspace: getWorkspaceView(language)
    };
  }


  function archiveMeeting(meetingId, language) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only the Household Lead workspace can archive meetings.');
    }

    const data = DataStoreService.readData();
    const meeting = (data.shared.meetings || []).find(function(item) {
      return String(item.id || '') === String(meetingId || '');
    });
    if (!meeting) throw new Error('FamilyPD could not find that meeting.');

    meeting.status = 'Archived';
    meeting.updatedAt = fpdNow_();
    DataStoreService.appendActivity(data, 'MEETING_ARCHIVED', 'A meeting was archived.');
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Meeting archived.',
      workspace: getWorkspaceView(language)
    };
  }


  function carryForward(meetingId, language) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only the Household Lead workspace can carry items forward.');
    }

    const data = DataStoreService.readData();
    const source = (data.shared.meetings || []).find(function(item) {
      return String(item.id || '') === String(meetingId || '');
    });
    if (!source) throw new Error('FamilyPD could not find that meeting.');

    const openItems = (source.actionItems || []).filter(function(item) {
      return item.status !== 'Completed';
    });
    const lang = GuidanceService.normalizeLanguage(language);

    return {
      recap: lang === 'es'
        ? 'Revisión de la reunión anterior: ' + (source.title || '')
        : 'Previous meeting review: ' + (source.title || ''),
      actionItems: openItems.map(function(item) {
        return {
          id: fpdNewId_('ACTION'),
          text: fpdSafeText_(item.text, 800),
          assignedRole: fpdSafeText_(item.assignedRole, 120),
          dueDate: '',
          status: 'Open'
        };
      })
    };
  }


  function saveMemberPreparation(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    data.personal.meetingPreparation = Array.isArray(data.personal.meetingPreparation)
      ? data.personal.meetingPreparation : [];

    payload = payload || {};
    const meetingId = fpdSafeText_(payload.meetingId, 120);
    const meetingExists = (data.shared.meetings || []).some(function(item) {
      return String(item.id || '') === meetingId;
    });
    if (!meetingExists) throw new Error('FamilyPD could not find that shared meeting.');

    const normalized = {
      id: fpdSafeText_(payload.id, 120),
      meetingId: meetingId,
      questions: fpdSafeText_(payload.questions, 1600),
      topicSuggestion: fpdSafeText_(payload.topicSuggestion, 1200),
      supportNeeded: fpdSafeText_(payload.supportNeeded, 1000)
    };
    PrivacyGuardService.validatePayload(normalized, 'meeting preparation');

    const index = data.personal.meetingPreparation.findIndex(function(item) {
      return String(item.meetingId || '') === meetingId;
    });
    const now = fpdNow_();
    const record = Object.assign({}, index >= 0 ? data.personal.meetingPreparation[index] : {}, normalized, {
      id: normalized.id || index >= 0 && data.personal.meetingPreparation[index].id || fpdNewId_('PREP'),
      createdAt: index >= 0 && data.personal.meetingPreparation[index].createdAt || now,
      updatedAt: now
    });

    if (index >= 0) data.personal.meetingPreparation[index] = record;
    else data.personal.meetingPreparation.unshift(record);

    data.personal.meetingPreparation =
      data.personal.meetingPreparation.slice(0, FPD_CONFIG.MEETINGS.MAX_MEMBER_PREPARATIONS);

    DataStoreService.appendActivity(
      data,
      'MEETING_PREPARATION_SAVED',
      'Private meeting preparation was saved in this workspace.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Private meeting preparation saved.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function buildAttendeeOptions_(data) {
    const values = [];
    const add = function(value) {
      const clean = fpdSafeText_(value, 120);
      if (clean && values.indexOf(clean) < 0) values.push(clean);
    };

    FPD_CONFIG.HOUSEHOLD_ROLE_LABELS.forEach(add);
    (data.shared.memberRoles || []).forEach(function(role) {
      add(role.memberLabel);
      add(role.roleTitle);
    });

    return values.slice(0, FPD_CONFIG.MEETINGS.MAX_ATTENDEE_LABELS);
  }


  function normalizeMeetingPayload_(payload) {
    payload = payload || {};
    const status = assertStatus_(payload.status || 'Draft');
    const title = fpdSafeText_(payload.title, 180);
    if (!title) throw new Error('Enter a short meeting title.');

    const scheduledDate = normalizeDate_(payload.scheduledDate);
    if (status !== 'Draft' && !scheduledDate) {
      throw new Error('Choose a date before marking the meeting Scheduled or Completed.');
    }

    const topics = (Array.isArray(payload.topics) ? payload.topics : [])
      .slice(0, FPD_CONFIG.MEETINGS.MAX_TOPICS)
      .map(normalizeTopic_)
      .filter(function(item) { return Boolean(item.title); });

    return {
      id: fpdSafeText_(payload.id, 120),
      title: title,
      meetingType: assertType_(payload.meetingType || 'Weekly Check-In'),
      status: status,
      scheduledDate: scheduledDate,
      scheduledTime: normalizeTime_(payload.scheduledTime),
      durationMinutes: assertDuration_(payload.durationMinutes || 60),
      meetingFormat: assertFormat_(payload.meetingFormat || 'In person'),
      locationNote: fpdSafeText_(payload.locationNote, 300),
      facilitatorRole: fpdSafeText_(payload.facilitatorRole, 120),
      attendeeRoles: sanitizeTextList_(
        payload.attendeeRoles,
        FPD_CONFIG.MEETINGS.MAX_ATTENDEE_LABELS,
        120
      ),
      openingMessage: fpdSafeText_(payload.openingMessage, 1000),
      previousRecap: fpdSafeText_(payload.previousRecap, 1600),
      mealPlan: fpdSafeText_(payload.mealPlan, 1000),
      materials: sanitizeTextList_(
        payload.materials,
        FPD_CONFIG.MEETINGS.MAX_MATERIALS,
        300
      ),
      topics: topics,
      notes: fpdSafeText_(payload.notes, 4000),
      decisions: normalizeDecisions_(payload.decisions),
      actionItems: normalizeActionItems_(payload.actionItems),
      closingMessage: fpdSafeText_(payload.closingMessage, 1000)
    };
  }


  function normalizeTopic_(topic) {
    topic = topic || {};
    const sourceType = ['Library', 'Custom', 'News', 'Link']
      .indexOf(topic.sourceType) >= 0
        ? topic.sourceType
        : 'Custom';

    let article = null;
    if (sourceType === 'News' && topic.article) {
      article = NewsService.sanitizeSelectedArticle(topic.article);
    } else if (sourceType === 'Link' && topic.article) {
      article = NewsService.sanitizeCheckedArticle(topic.article);
    }

    return {
      id: fpdSafeText_(topic.id, 120) || fpdNewId_('TOPIC'),
      sourceType: sourceType,
      libraryId: fpdSafeText_(topic.libraryId, 120),
      pillar: ['Health', 'Relationships', 'Education', 'Finances', 'Goals', 'Organization']
        .indexOf(topic.pillar) >= 0 ? topic.pillar : 'Organization',
      title: fpdSafeText_(topic.title, 220),
      purpose: fpdSafeText_(topic.purpose, 1400),
      prompts: sanitizeTextList_(
        topic.prompts,
        FPD_CONFIG.MEETINGS.MAX_PROMPTS_PER_TOPIC,
        600
      ),
      desiredOutcome: fpdSafeText_(topic.desiredOutcome, 1000),
      timeMinutes: Math.max(5, Math.min(60, Number(topic.timeMinutes || 15))),
      article: article
    };
  }


  function normalizeDecisions_(records) {
    return (Array.isArray(records) ? records : [])
      .slice(0, FPD_CONFIG.MEETINGS.MAX_DECISIONS)
      .map(function(item) {
        return {
          id: fpdSafeText_(item && item.id, 120) || fpdNewId_('DECISION'),
          text: fpdSafeText_(item && item.text, 1000)
        };
      })
      .filter(function(item) { return Boolean(item.text); });
  }


  function normalizeActionItems_(records) {
    return (Array.isArray(records) ? records : [])
      .slice(0, FPD_CONFIG.MEETINGS.MAX_ACTION_ITEMS)
      .map(function(item) {
        return {
          id: fpdSafeText_(item && item.id, 120) || fpdNewId_('ACTION'),
          text: fpdSafeText_(item && item.text, 800),
          assignedRole: fpdSafeText_(item && item.assignedRole, 120),
          dueDate: normalizeDate_(item && item.dueDate),
          status: item && item.status === 'Completed' ? 'Completed' : 'Open'
        };
      })
      .filter(function(item) { return Boolean(item.text); });
  }


  function normalizeMeetingList_(records) {
    return (Array.isArray(records) ? records : [])
      .map(normalizeMeeting_)
      .sort(function(a, b) {
        const aDate = String(a.scheduledDate || '9999-99-99') + ' ' +
          String(a.scheduledTime || '99:99');
        const bDate = String(b.scheduledDate || '9999-99-99') + ' ' +
          String(b.scheduledTime || '99:99');
        if (a.status === 'Completed' || a.status === 'Archived') {
          return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
        }
        return aDate.localeCompare(bDate);
      });
  }


  function normalizeMeeting_(item) {
    item = item || {};
    return {
      id: fpdSafeText_(item.id, 120),
      title: fpdSafeText_(item.title, 180),
      meetingType: FPD_CONFIG.MEETINGS.TYPES.indexOf(item.meetingType) >= 0
        ? item.meetingType : 'Weekly Check-In',
      status: FPD_CONFIG.MEETINGS.STATUSES.indexOf(item.status) >= 0
        ? item.status : 'Draft',
      scheduledDate: normalizeDate_(item.scheduledDate),
      scheduledTime: normalizeTime_(item.scheduledTime),
      durationMinutes: assertDuration_(item.durationMinutes || 60),
      meetingFormat: FPD_CONFIG.MEETINGS.FORMATS.indexOf(item.meetingFormat) >= 0
        ? item.meetingFormat : 'In person',
      locationNote: fpdSafeText_(item.locationNote, 300),
      facilitatorRole: fpdSafeText_(item.facilitatorRole, 120),
      attendeeRoles: sanitizeTextList_(item.attendeeRoles, 25, 120),
      openingMessage: fpdSafeText_(item.openingMessage, 1000),
      previousRecap: fpdSafeText_(item.previousRecap, 1600),
      mealPlan: fpdSafeText_(item.mealPlan, 1000),
      materials: sanitizeTextList_(item.materials, 15, 300),
      topics: (Array.isArray(item.topics) ? item.topics : []).map(normalizeTopic_),
      notes: fpdSafeText_(item.notes, 4000),
      decisions: normalizeDecisions_(item.decisions),
      actionItems: normalizeActionItems_(item.actionItems),
      closingMessage: fpdSafeText_(item.closingMessage, 1000),
      createdAt: fpdSafeText_(item.createdAt, 50),
      updatedAt: fpdSafeText_(item.updatedAt, 50),
      completedAt: fpdSafeText_(item.completedAt, 50)
    };
  }


  function normalizePreparationList_(records) {
    return (Array.isArray(records) ? records : [])
      .map(function(item) {
        return {
          id: fpdSafeText_(item.id, 120),
          meetingId: fpdSafeText_(item.meetingId, 120),
          questions: fpdSafeText_(item.questions, 1600),
          topicSuggestion: fpdSafeText_(item.topicSuggestion, 1200),
          supportNeeded: fpdSafeText_(item.supportNeeded, 1000),
          createdAt: fpdSafeText_(item.createdAt, 50),
          updatedAt: fpdSafeText_(item.updatedAt, 50)
        };
      });
  }


  function sanitizeTextList_(values, maxItems, maxLength) {
    return (Array.isArray(values) ? values : [])
      .slice(0, maxItems)
      .map(function(value) { return fpdSafeText_(value, maxLength); })
      .filter(Boolean);
  }


  function normalizeDate_(value) {
    const text = String(value || '').trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
  }


  function normalizeTime_(value) {
    const text = String(value || '').trim();
    return /^\d{2}:\d{2}$/.test(text) ? text : '';
  }


  function assertStatus_(value) {
    if (FPD_CONFIG.MEETINGS.STATUSES.indexOf(value) < 0) {
      throw new Error('Choose a valid meeting status.');
    }
    return value;
  }


  function assertType_(value) {
    if (FPD_CONFIG.MEETINGS.TYPES.indexOf(value) < 0) {
      throw new Error('Choose a valid meeting type.');
    }
    return value;
  }


  function assertFormat_(value) {
    if (FPD_CONFIG.MEETINGS.FORMATS.indexOf(value) < 0) {
      throw new Error('Choose a valid meeting format.');
    }
    return value;
  }


  function assertDuration_(value) {
    const number = Number(value);
    if (FPD_CONFIG.MEETINGS.DURATIONS.indexOf(number) < 0) return 60;
    return number;
  }


  function translateStatus_(value, language) {
    if (language !== 'es') return value;
    return {
      Draft: 'Borrador',
      Scheduled: 'Programada',
      Completed: 'Completada',
      Archived: 'Archivada'
    }[value] || value;
  }


  function translateType_(value, language) {
    if (language !== 'es') return value;
    return {
      'Weekly Check-In': 'Revisión semanal',
      'Monthly Planning': 'Planificación mensual',
      'Goal Review': 'Revisión de metas',
      'Learning Discussion': 'Conversación de aprendizaje',
      'Safety & Preparedness': 'Seguridad y preparación',
      'Celebration & Connection': 'Celebración y conexión',
      'Special Planning': 'Planificación especial',
      'Custom Meeting': 'Reunión personalizada'
    }[value] || value;
  }


  function translateFormat_(value, language) {
    if (language !== 'es') return value;
    return {
      'In person': 'En persona',
      'Video call': 'Videollamada',
      'Phone call': 'Llamada telefónica',
      Hybrid: 'Híbrida',
      Other: 'Otro'
    }[value] || value;
  }


  function topic_(id, title, purpose, prompts, desiredOutcome) {
    return {
      id: id,
      title: title,
      purpose: purpose,
      prompts: prompts,
      desiredOutcome: desiredOutcome
    };
  }


  return {
    getWorkspaceView: getWorkspaceView,
    getGuidance: getGuidance_,
    saveMeeting: saveMeeting,
    duplicateMeeting: duplicateMeeting,
    archiveMeeting: archiveMeeting,
    carryForward: carryForward,
    saveMemberPreparation: saveMemberPreparation
  };
})();
