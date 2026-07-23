/**
 * Guided household and personal goals with non-sensitive checkpoints.
 *
 * Household Lead workspaces can manage household goals and personal goals.
 * Family Member workspaces can view imported household goals and manage only
 * their own personal goals. Personal goals never enter Household Update Packs.
 */

const GoalsService = (function() {
  const IDEA_LIBRARY = {
    en: {
      Health: [
        idea_('health_sleep', 'Build a more consistent sleep routine',
          'Create a simple routine that supports better rest.',
          ['Choose a realistic bedtime routine', 'Reduce one distraction before rest', 'Review progress during a check-in']),
        idea_('health_movement', 'Move more often in a safe way',
          'Choose movement that fits the household’s current ability and schedule.',
          ['Choose an activity that feels realistic', 'Decide how often to practice', 'Notice how the routine affects energy']),
        idea_('health_checkin', 'Have regular wellness check-ins',
          'Create a simple time to ask how everyone is doing physically and emotionally.',
          ['Choose a check-in day', 'Use one or two simple questions', 'Decide what support is needed']),
        idea_('health_harm', 'Reduce one habit that is getting in the way',
          'Focus on one non-sensitive habit the household wants to reduce or replace.',
          ['Name the general habit', 'Choose a healthier replacement', 'Review what helped or got in the way'])
      ],
      Relationships: [
        idea_('relationship_communication', 'Improve household communication',
          'Practice listening, respectful language, and clearer conversations.',
          ['Choose one communication agreement', 'Practice it during the week', 'Discuss what improved']),
        idea_('relationship_time', 'Create more quality time',
          'Plan simple time together that does not require a large budget.',
          ['Choose an activity', 'Choose a general time', 'Ask what everyone enjoyed']),
        idea_('relationship_repair', 'Practice healthy repair after conflict',
          'Build a simple process for apologizing, listening, and trying again.',
          ['Agree on a pause when emotions are high', 'Use respectful repair words', 'Review whether the repair helped']),
        idea_('relationship_network', 'Strengthen the household support network',
          'Identify safe people, programs, or community resources that support growth.',
          ['Name one type of support needed', 'Identify a general resource', 'Take one safe next step'])
      ],
      Education: [
        idea_('education_routine', 'Build a consistent learning routine',
          'Create a realistic routine for reading, studying, practicing, or completing learning activities.',
          ['Choose what to learn', 'Choose a repeatable time', 'Track completion without confidential records']),
        idea_('education_skill', 'Learn one useful skill',
          'Choose a skill that supports life, education, work, or household growth.',
          ['Choose the skill', 'Find a safe learning resource', 'Practice and reflect']),
        idea_('education_pathway', 'Explore a career or credential pathway',
          'Learn about a career, training program, certification, or education option.',
          ['Choose one pathway', 'Review trustworthy information', 'Identify one next step']),
        idea_('education_support', 'Improve learning support at home',
          'Create a clearer system for asking for help and following through.',
          ['Choose a check-in question', 'Identify available support', 'Review what is working'])
      ],
      Finances: [
        idea_('finance_awareness', 'Improve awareness of spending categories',
          'Use general categories and patterns without entering account numbers or exact private details.',
          ['Choose categories to review', 'Notice one pattern', 'Choose one adjustment']),
        idea_('finance_saving', 'Build a consistent saving habit',
          'Practice setting aside an affordable amount or percentage without storing account information.',
          ['Choose a general saving purpose', 'Choose a realistic rhythm', 'Review consistency']),
        idea_('finance_expense', 'Reduce one unnecessary expense',
          'Identify one general expense or habit the household can reduce.',
          ['Choose the category', 'Choose a replacement or limit', 'Review the result']),
        idea_('finance_learning', 'Learn one financial topic',
          'Build understanding of budgeting, credit, saving, debt, taxes, or consumer protection.',
          ['Choose the topic', 'Use a trustworthy source', 'Share one lesson learned'])
      ],
      Goals: [
        idea_('goals_project', 'Complete one household project',
          'Choose one useful project and break it into manageable steps.',
          ['Define the finished result', 'Choose the first small step', 'Review progress regularly']),
        idea_('goals_planning', 'Build a weekly planning habit',
          'Use a short weekly check-in to decide what matters next.',
          ['Choose a planning day', 'Select up to three priorities', 'Review and adjust']),
        idea_('goals_followthrough', 'Improve follow-through on one priority',
          'Focus on one important commitment instead of starting too many things.',
          ['Choose the priority', 'Remove one barrier', 'Complete the next action']),
        idea_('goals_progress', 'Celebrate and review progress more often',
          'Create a routine for noticing wins, barriers, and next steps.',
          ['Choose a review rhythm', 'Name progress', 'Choose the next action'])
      ]
    },
    es: {
      Health: [
        idea_('health_sleep', 'Crear una rutina de sueño más constante',
          'Cree una rutina sencilla que apoye un mejor descanso.',
          ['Elija una rutina realista para la hora de dormir', 'Reduzca una distracción antes de descansar', 'Revise el progreso durante una revisión']),
        idea_('health_movement', 'Moverse con más frecuencia de una forma segura',
          'Elija movimiento que se adapte a la capacidad y al horario actual del hogar.',
          ['Elija una actividad realista', 'Decida con qué frecuencia practicar', 'Observe cómo la rutina afecta la energía']),
        idea_('health_checkin', 'Tener revisiones regulares de bienestar',
          'Cree un momento sencillo para preguntar cómo están todos física y emocionalmente.',
          ['Elija un día para la revisión', 'Use una o dos preguntas sencillas', 'Decida qué apoyo se necesita']),
        idea_('health_harm', 'Reducir un hábito que está causando dificultad',
          'Enfóquese en un hábito no sensible que el hogar quiera reducir o reemplazar.',
          ['Nombre el hábito de forma general', 'Elija un reemplazo más saludable', 'Revise qué ayudó o qué fue difícil'])
      ],
      Relationships: [
        idea_('relationship_communication', 'Mejorar la comunicación del hogar',
          'Practique escuchar, usar palabras respetuosas y tener conversaciones más claras.',
          ['Elija un acuerdo de comunicación', 'Practíquelo durante la semana', 'Converse sobre lo que mejoró']),
        idea_('relationship_time', 'Crear más tiempo de calidad',
          'Planifique tiempo sencillo juntos que no requiera un presupuesto grande.',
          ['Elija una actividad', 'Elija un momento general', 'Pregunte qué disfrutó cada persona']),
        idea_('relationship_repair', 'Practicar una reparación saludable después de un conflicto',
          'Cree un proceso sencillo para disculparse, escuchar e intentarlo de nuevo.',
          ['Acuerden hacer una pausa cuando las emociones estén altas', 'Usen palabras respetuosas para reparar', 'Revisen si la reparación ayudó']),
        idea_('relationship_network', 'Fortalecer la red de apoyo del hogar',
          'Identifique personas, programas o recursos comunitarios seguros que apoyen el crecimiento.',
          ['Nombre un tipo de apoyo necesario', 'Identifique un recurso general', 'Tome un próximo paso seguro'])
      ],
      Education: [
        idea_('education_routine', 'Crear una rutina constante de aprendizaje',
          'Cree una rutina realista para leer, estudiar, practicar o completar actividades.',
          ['Elija qué aprender', 'Elija un momento que pueda repetirse', 'Registre la finalización sin expedientes confidenciales']),
        idea_('education_skill', 'Aprender una habilidad útil',
          'Elija una habilidad que apoye la vida, la educación, el trabajo o el crecimiento del hogar.',
          ['Elija la habilidad', 'Busque un recurso seguro', 'Practique y reflexione']),
        idea_('education_pathway', 'Explorar una carrera o credencial',
          'Aprenda sobre una carrera, capacitación, certificación u opción educativa.',
          ['Elija una opción', 'Revise información confiable', 'Identifique un próximo paso']),
        idea_('education_support', 'Mejorar el apoyo para aprender en casa',
          'Cree un sistema más claro para pedir ayuda y dar seguimiento.',
          ['Elija una pregunta de revisión', 'Identifique el apoyo disponible', 'Revise lo que está funcionando'])
      ],
      Finances: [
        idea_('finance_awareness', 'Mejorar la conciencia de las categorías de gastos',
          'Use categorías y patrones generales sin ingresar números de cuenta ni detalles privados exactos.',
          ['Elija las categorías que revisará', 'Observe un patrón', 'Elija un ajuste']),
        idea_('finance_saving', 'Crear un hábito constante de ahorro',
          'Practique guardar una cantidad o porcentaje posible sin almacenar información de cuentas.',
          ['Elija un propósito general', 'Elija un ritmo realista', 'Revise la constancia']),
        idea_('finance_expense', 'Reducir un gasto innecesario',
          'Identifique un gasto o hábito general que el hogar pueda reducir.',
          ['Elija la categoría', 'Elija un reemplazo o límite', 'Revise el resultado']),
        idea_('finance_learning', 'Aprender un tema financiero',
          'Aprenda sobre presupuesto, crédito, ahorro, deudas, impuestos o protección del consumidor.',
          ['Elija el tema', 'Use una fuente confiable', 'Comparta una lección aprendida'])
      ],
      Goals: [
        idea_('goals_project', 'Completar un proyecto del hogar',
          'Elija un proyecto útil y divídalo en pasos manejables.',
          ['Defina el resultado final', 'Elija el primer paso pequeño', 'Revise el progreso con frecuencia']),
        idea_('goals_planning', 'Crear un hábito semanal de planificación',
          'Use una revisión corta semanal para decidir qué importa después.',
          ['Elija un día para planificar', 'Seleccione hasta tres prioridades', 'Revise y ajuste']),
        idea_('goals_followthrough', 'Mejorar el seguimiento de una prioridad',
          'Enfóquese en un compromiso importante en vez de comenzar demasiadas cosas.',
          ['Elija la prioridad', 'Quite una barrera', 'Complete la próxima acción']),
        idea_('goals_progress', 'Celebrar y revisar el progreso con más frecuencia',
          'Cree una rutina para reconocer logros, barreras y próximos pasos.',
          ['Elija un ritmo de revisión', 'Nombre el progreso', 'Elija la próxima acción'])
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
      householdGoals: normalizeGoalList_(data.shared.sharedGoals || [], 'HOUSEHOLD'),
      personalGoals: normalizeGoalList_(data.personal.goals || [], 'PERSONAL'),
      guidance: getGuidance_(language),
      citation: {
        contentId: 'GOALS_GUIDANCE',
        inTextCitation: '(Hall, 2025, pp. 50–55)',
        statement: language === 'es'
          ? 'Elija pocas metas claras, divídalas en pasos pequeños y use revisiones regulares para reconocer progreso, barreras y próximos pasos.'
          : 'Choose a few clear goals, break them into small steps, and use regular check-ins to recognize progress, barriers, and next actions.'
      }
    };
  }


  function getGuidance_(language) {
    const lang = GuidanceService.normalizeLanguage(language);
    return {
      language: lang,
      pillars: FPD_CONFIG.PILLARS.map(function(pillar) {
        return {
          value: pillar,
          label: translatePillar_(pillar, lang)
        };
      }),
      timeframes: FPD_CONFIG.GOALS.TIMEFRAMES.map(function(value) {
        return { value: value, label: translateTimeframe_(value, lang) };
      }),
      measures: FPD_CONFIG.GOALS.MEASURES.map(function(value) {
        return { value: value, label: translateMeasure_(value, lang) };
      }),
      statuses: FPD_CONFIG.GOALS.STATUSES.map(function(value) {
        return { value: value, label: translateStatus_(value, lang) };
      }),
      ideas: fpdClone_(IDEA_LIBRARY[lang]),
      privacyMessage: lang === 'es'
        ? 'Use descripciones generales. No ingrese saldos de cuentas, diagnósticos, expedientes escolares confidenciales, direcciones exactas, identificadores ni otra información sensible.'
        : 'Use general descriptions. Do not enter account balances, diagnoses, confidential school records, exact addresses, identifiers, or other sensitive information.'
    };
  }


  function generateGoalDraft(payload) {
    payload = payload || {};
    const language = GuidanceService.normalizeLanguage(payload.language);
    const pillar = assertPillar_(payload.pillar);
    const ideaId = fpdSafeText_(payload.ideaId, 100);
    const ideas = IDEA_LIBRARY[language][pillar] || [];
    const idea = ideas.find(function(item) { return item.id === ideaId; });

    if (!idea) {
      throw new Error(language === 'es'
        ? 'Elija una idea de meta para continuar.'
        : 'Choose a goal idea to continue.');
    }

    return {
      title: idea.title,
      targetDescription: idea.description,
      why: language === 'es'
        ? 'Esta meta apoya el crecimiento del hogar en el área de ' + translatePillar_(pillar, language).toLowerCase() + '.'
        : 'This goal supports household growth in the ' + pillar.toLowerCase() + ' pillar.',
      steps: idea.steps.map(function(text) {
        return {
          id: fpdNewId_('STEP'),
          text: text,
          status: 'Not started'
        };
      })
    };
  }


  function saveGoal(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const normalized = normalizeGoalPayload_(payload, context.role);
    const target = getTargetList_(data, normalized.scope, context.role);
    const max = normalized.scope === 'HOUSEHOLD'
      ? FPD_CONFIG.GOALS.MAX_HOUSEHOLD_GOALS
      : FPD_CONFIG.GOALS.MAX_PERSONAL_GOALS;

    PrivacyGuardService.validatePayload(normalized, 'goal');

    const existingIndex = target.findIndex(function(item) {
      return String(item.id || '') === normalized.id;
    });

    if (existingIndex < 0 && target.length >= max) {
      throw new Error('This workspace has reached its current goal limit.');
    }

    const now = fpdNow_();
    const existing = existingIndex >= 0 ? target[existingIndex] : null;
    const record = Object.assign({}, existing || {}, normalized, {
      id: normalized.id || fpdNewId_('GOAL'),
      createdAt: existing && existing.createdAt || now,
      updatedAt: now,
      checkpoints: existing && Array.isArray(existing.checkpoints)
        ? existing.checkpoints
        : []
    });

    if (existingIndex >= 0) {
      target[existingIndex] = record;
    } else {
      target.unshift(record);
    }

    DataStoreService.appendActivity(
      data,
      existingIndex >= 0 ? 'GOAL_UPDATED' : 'GOAL_CREATED',
      normalized.scope === 'HOUSEHOLD'
        ? 'A non-sensitive household goal was saved.'
        : 'A private personal goal was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: normalized.scope === 'HOUSEHOLD'
        ? 'Household goal saved.'
        : 'Personal goal saved.',
      goal: normalizeGoal_(record, normalized.scope),
      workspace: getWorkspaceView()
    };
  }


  function saveCheckpoint(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    payload = payload || {};
    const scope = normalizeScope_(payload.scope, context.role);
    const target = getTargetList_(data, scope, context.role);
    const goal = target.find(function(item) {
      return String(item.id || '') === String(payload.goalId || '');
    });

    if (!goal) throw new Error('FamilyPD could not find that goal.');

    const percentComplete = Math.max(0, Math.min(100, Number(payload.percentComplete || 0)));
    const status = assertStatus_(payload.status || goal.status || 'In progress');
    const checkpoint = {
      id: fpdNewId_('CHECKPOINT'),
      percentComplete: percentComplete,
      status: status,
      progressNote: fpdSafeText_(payload.progressNote, 1200),
      barrier: fpdSafeText_(payload.barrier, 800),
      supportNeeded: fpdSafeText_(payload.supportNeeded, 800),
      nextAction: fpdSafeText_(payload.nextAction, 800),
      createdAt: fpdNow_()
    };

    PrivacyGuardService.validatePayload(checkpoint, 'goal checkpoint');

    goal.percentComplete = percentComplete;
    goal.status = status;
    goal.updatedAt = checkpoint.createdAt;
    goal.checkpoints = Array.isArray(goal.checkpoints) ? goal.checkpoints : [];
    goal.checkpoints.unshift(checkpoint);
    goal.checkpoints = goal.checkpoints.slice(0, FPD_CONFIG.GOALS.MAX_CHECKPOINTS_PER_GOAL);

    DataStoreService.appendActivity(
      data,
      'GOAL_CHECKPOINT_SAVED',
      scope === 'HOUSEHOLD'
        ? 'A household goal checkpoint was saved.'
        : 'A personal goal checkpoint was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Goal checkpoint saved.',
      workspace: getWorkspaceView()
    };
  }


  function toggleStep(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    payload = payload || {};
    const scope = normalizeScope_(payload.scope, context.role);
    const target = getTargetList_(data, scope, context.role);
    const goal = target.find(function(item) {
      return String(item.id || '') === String(payload.goalId || '');
    });
    if (!goal) throw new Error('FamilyPD could not find that goal.');

    goal.steps = Array.isArray(goal.steps) ? goal.steps : [];
    const step = goal.steps.find(function(item) {
      return String(item.id || '') === String(payload.stepId || '');
    });
    if (!step) throw new Error('FamilyPD could not find that goal step.');

    step.status = payload.completed ? 'Completed' : 'Not started';
    step.updatedAt = fpdNow_();
    goal.updatedAt = step.updatedAt;

    const completed = goal.steps.filter(function(item) {
      return item.status === 'Completed';
    }).length;
    if (goal.steps.length) {
      goal.percentComplete = Math.round((completed / goal.steps.length) * 100);
      if (completed === goal.steps.length) goal.status = 'Completed';
      else if (goal.status === 'Planning') goal.status = 'In progress';
    }

    DataStoreService.saveData(data);
    return { success: true, workspace: getWorkspaceView() };
  }


  function archiveGoal(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    payload = payload || {};
    const scope = normalizeScope_(payload.scope, context.role);
    const target = getTargetList_(data, scope, context.role);
    const goal = target.find(function(item) {
      return String(item.id || '') === String(payload.goalId || '');
    });
    if (!goal) throw new Error('FamilyPD could not find that goal.');

    goal.status = 'Archived';
    goal.updatedAt = fpdNow_();
    DataStoreService.appendActivity(data, 'GOAL_ARCHIVED', 'A goal was archived.');
    DataStoreService.saveData(data);
    return { success: true, message: 'Goal archived.', workspace: getWorkspaceView() };
  }


  function normalizeGoalPayload_(payload, role) {
    payload = payload || {};
    const scope = normalizeScope_(payload.scope, role);
    const title = fpdSafeText_(payload.title, 160);
    if (!title) throw new Error('Enter a short goal title.');

    const steps = (Array.isArray(payload.steps) ? payload.steps : [])
      .slice(0, FPD_CONFIG.GOALS.MAX_STEPS_PER_GOAL)
      .map(function(step) {
        const text = fpdSafeText_(step && step.text, 500);
        return {
          id: fpdSafeText_(step && step.id, 120) || fpdNewId_('STEP'),
          text: text,
          status: step && step.status === 'Completed' ? 'Completed' : 'Not started'
        };
      })
      .filter(function(step) { return Boolean(step.text); });

    return {
      id: fpdSafeText_(payload.id, 120),
      scope: scope,
      title: title,
      pillar: assertPillar_(payload.pillar),
      timeframe: assertTimeframe_(payload.timeframe),
      targetDescription: fpdSafeText_(payload.targetDescription, 1600),
      successMeasure: assertMeasure_(payload.successMeasure),
      why: fpdSafeText_(payload.why, 1200),
      status: assertStatus_(payload.status || 'Planning'),
      percentComplete: Math.max(0, Math.min(100, Number(payload.percentComplete || 0))),
      steps: steps,
      checkpoints: []
    };
  }


  function normalizeGoalList_(records, scope) {
    return (Array.isArray(records) ? records : [])
      .map(function(item) { return normalizeGoal_(item, scope); })
      .sort(function(a, b) {
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
  }


  function normalizeGoal_(item, scope) {
    item = item || {};
    return {
      id: fpdSafeText_(item.id, 120),
      scope: scope,
      title: fpdSafeText_(item.title, 160),
      pillar: FPD_CONFIG.PILLARS.indexOf(item.pillar) >= 0 ? item.pillar : 'Goals',
      timeframe: FPD_CONFIG.GOALS.TIMEFRAMES.indexOf(item.timeframe) >= 0 ? item.timeframe : 'This year',
      targetDescription: fpdSafeText_(item.targetDescription, 1600),
      successMeasure: FPD_CONFIG.GOALS.MEASURES.indexOf(item.successMeasure) >= 0
        ? item.successMeasure : 'General progress review',
      why: fpdSafeText_(item.why, 1200),
      status: FPD_CONFIG.GOALS.STATUSES.indexOf(item.status) >= 0 ? item.status : 'Planning',
      percentComplete: Math.max(0, Math.min(100, Number(item.percentComplete || 0))),
      steps: (Array.isArray(item.steps) ? item.steps : []).slice(0, FPD_CONFIG.GOALS.MAX_STEPS_PER_GOAL).map(function(step) {
        return {
          id: fpdSafeText_(step.id, 120),
          text: fpdSafeText_(step.text, 500),
          status: step.status === 'Completed' ? 'Completed' : 'Not started'
        };
      }),
      checkpoints: (Array.isArray(item.checkpoints) ? item.checkpoints : [])
        .slice(0, FPD_CONFIG.GOALS.MAX_CHECKPOINTS_PER_GOAL)
        .map(function(checkpoint) {
          return {
            id: fpdSafeText_(checkpoint.id, 120),
            percentComplete: Math.max(0, Math.min(100, Number(checkpoint.percentComplete || 0))),
            status: fpdSafeText_(checkpoint.status, 50),
            progressNote: fpdSafeText_(checkpoint.progressNote, 1200),
            barrier: fpdSafeText_(checkpoint.barrier, 800),
            supportNeeded: fpdSafeText_(checkpoint.supportNeeded, 800),
            nextAction: fpdSafeText_(checkpoint.nextAction, 800),
            createdAt: fpdSafeText_(checkpoint.createdAt, 50)
          };
        }),
      createdAt: fpdSafeText_(item.createdAt, 50),
      updatedAt: fpdSafeText_(item.updatedAt, 50)
    };
  }


  function getTargetList_(data, scope, role) {
    if (scope === 'HOUSEHOLD') {
      if (role !== FPD_CONFIG.ROLE.LEAD) {
        throw new Error('Family Member workspaces can view household goals but cannot edit them.');
      }
      data.shared.sharedGoals = Array.isArray(data.shared.sharedGoals)
        ? data.shared.sharedGoals : [];
      return data.shared.sharedGoals;
    }

    data.personal.goals = Array.isArray(data.personal.goals)
      ? data.personal.goals : [];
    return data.personal.goals;
  }


  function normalizeScope_(scope, role) {
    const value = String(scope || 'PERSONAL').toUpperCase();
    if (value === 'HOUSEHOLD' && role === FPD_CONFIG.ROLE.LEAD) return 'HOUSEHOLD';
    return 'PERSONAL';
  }


  function assertPillar_(value) {
    if (FPD_CONFIG.PILLARS.indexOf(value) < 0) throw new Error('Choose a FamilyPD pillar.');
    return value;
  }


  function assertTimeframe_(value) {
    if (FPD_CONFIG.GOALS.TIMEFRAMES.indexOf(value) < 0) throw new Error('Choose a goal timeframe.');
    return value;
  }


  function assertMeasure_(value) {
    if (FPD_CONFIG.GOALS.MEASURES.indexOf(value) < 0) throw new Error('Choose how progress will be reviewed.');
    return value;
  }


  function assertStatus_(value) {
    if (FPD_CONFIG.GOALS.STATUSES.indexOf(value) < 0) throw new Error('Choose a valid goal status.');
    return value;
  }


  function translatePillar_(value, language) {
    if (language !== 'es') return value;
    return {
      Health: 'Salud',
      Relationships: 'Relaciones',
      Education: 'Educación',
      Finances: 'Finanzas',
      Goals: 'Metas'
    }[value] || value;
  }


  function translateTimeframe_(value, language) {
    if (language !== 'es') return value;
    return {
      'This week': 'Esta semana',
      'This month': 'Este mes',
      'Next 3 months': 'Próximos 3 meses',
      'Next 6 months': 'Próximos 6 meses',
      'This year': 'Este año',
      '1 to 3 years': 'De 1 a 3 años',
      '3 years or more': '3 años o más',
      'Ongoing habit': 'Hábito continuo'
    }[value] || value;
  }


  function translateMeasure_(value, language) {
    if (language !== 'es') return value;
    return {
      'Completion': 'Finalización',
      'Percent complete': 'Porcentaje completado',
      'Times per week': 'Veces por semana',
      'Milestone checklist': 'Lista de etapas',
      'General progress review': 'Revisión general del progreso'
    }[value] || value;
  }


  function translateStatus_(value, language) {
    if (language !== 'es') return value;
    return {
      'Planning': 'Planificación',
      'In progress': 'En progreso',
      'Paused': 'En pausa',
      'Completed': 'Completada',
      'Archived': 'Archivada'
    }[value] || value;
  }


  function idea_(id, title, description, steps) {
    return { id: id, title: title, description: description, steps: steps };
  }


  return {
    getWorkspaceView: getWorkspaceView,
    getGuidance: getGuidance_,
    generateGoalDraft: generateGoalDraft,
    saveGoal: saveGoal,
    saveCheckpoint: saveCheckpoint,
    toggleStep: toggleStep,
    archiveGoal: archiveGoal
  };
})();
