/**
 * Guided household and personal learning, research, and discussions.
 *
 * Household Lead workspaces may create shared household learning plans and
 * private personal plans. Family Member workspaces may view imported shared
 * plans, create private personal plans, and save private reflections.
 */

const LearningService = (function() {
  const TOPIC_LIBRARY = {
    en: {
      Health: [
        lesson_('health_basics', 'Build one healthier daily routine',
          'Understand how small repeated choices can support physical, emotional, mental, or spiritual wellbeing.',
          'Choose one routine, learn why it matters, and practice one realistic change.',
          ['What did we already know?', 'What new idea was useful?', 'What would make this realistic in our household?'],
          'Try the chosen routine for one week and discuss what helped.'),
        lesson_('health_stress', 'Recognize stress and healthy support',
          'Learn common signs of stress and identify safe, general ways to rest, communicate, and seek appropriate support.',
          'Create a simple household support list without storing diagnoses or medical records.',
          ['How can stress affect choices and communication?', 'What support feels helpful?', 'When should a trusted professional or service be contacted?'],
          'Choose one healthy support practice.'),
        lesson_('health_preparedness', 'Learn a safety or preparedness skill',
          'Build practical awareness before an emergency or unsafe situation occurs.',
          'Review one general safety topic and practice the correct response.',
          ['What could happen?', 'What should each person generally know?', 'What needs practice or a reminder?'],
          'Schedule one safe practice or review.'),
        lesson_('health_information', 'Understand a health-information source',
          'Practice finding understandable, trustworthy general health information without diagnosing anyone.',
          'Compare the source, date, purpose, and claims before using the information.',
          ['Who created the information?', 'How current is it?', 'Does it encourage professional help when appropriate?'],
          'Write one lesson and one question for a qualified professional.')
      ],
      Relationships: [
        lesson_('relationship_listening', 'Practice active listening',
          'Learn simple ways to listen for understanding instead of preparing a response.',
          'Practice a short listening activity and reflect on what helped.',
          ['What does respectful listening look like?', 'What interrupts understanding?', 'How can we show that we heard someone?'],
          'Use one listening practice during the week.'),
        lesson_('relationship_boundaries', 'Learn about healthy boundaries',
          'Understand how clear, respectful limits can protect relationships and wellbeing.',
          'Identify the difference between a boundary, a request, and controlling another person.',
          ['What is within my control?', 'How can a boundary be stated respectfully?', 'What should happen when a limit is ignored?'],
          'Practice one clear, respectful boundary statement.'),
        lesson_('relationship_repair', 'Repair after conflict',
          'Learn how accountability, listening, apology, and changed behavior support repair.',
          'Create a simple conflict-repair process that fits the household.',
          ['What makes an apology meaningful?', 'How can impact be acknowledged?', 'What action shows that learning occurred?'],
          'Agree on one repair phrase and one follow-through action.'),
        lesson_('relationship_community', 'Strengthen community connections',
          'Learn how safe relationships, mentors, programs, and community groups can support growth.',
          'Identify one type of support and research one trustworthy resource.',
          ['What support is needed?', 'What makes a resource feel safe and respectful?', 'What is one low-risk next step?'],
          'Contact or review one appropriate community resource.')
      ],
      Education: [
        lesson_('education_study', 'Learn a better study or practice strategy',
          'Understand one evidence-informed strategy for remembering, practicing, organizing, or explaining learning.',
          'Try the strategy with a real learning task.',
          ['How does the strategy work?', 'When would it be useful?', 'How will we know whether it helped?'],
          'Use the strategy at least twice and reflect.'),
        lesson_('education_digital', 'Build digital and AI literacy',
          'Learn how to use digital tools for ideas, explanation, practice, and productivity while protecting privacy and checking for mistakes.',
          'Practice one tool with a non-sensitive example and compare the result with a trustworthy source.',
          ['What information should never be entered?', 'How can we check the answer?', 'How should AI support—not replace—our thinking?'],
          'Use one safe prompt, review the response, and improve it.'),
        lesson_('education_career', 'Explore a career or training pathway',
          'Learn about work tasks, skills, education, credentials, costs, and realistic next steps.',
          'Research one pathway using official or trustworthy sources.',
          ['What does the work involve?', 'What skills or credentials are needed?', 'What is one next preparation step?'],
          'Save one trustworthy source and choose one next action.'),
        lesson_('education_skill', 'Teach and practice a useful life skill',
          'Use step-by-step teaching, demonstration, practice, feedback, and reflection.',
          'Choose a useful skill that a household member can teach or learn.',
          ['What are the steps?', 'What mistakes are common?', 'How can practice feel supportive instead of embarrassing?'],
          'Practice the skill and document one improvement.')
      ],
      Finances: [
        lesson_('finance_budget', 'Understand a basic budget',
          'Learn how income, needs, obligations, choices, and goals fit into a simple spending plan.',
          'Use sample or general categories instead of entering private account details.',
          ['What is a need, obligation, choice, or goal?', 'Why should a plan be reviewed?', 'What category may need adjustment?'],
          'Create a general practice budget or review one category.'),
        lesson_('finance_credit', 'Learn how credit works',
          'Build general understanding of credit reports, scores, borrowing costs, and consumer rights.',
          'Use a trustworthy source and avoid entering account numbers or personal identifiers.',
          ['What affects borrowing cost?', 'What information should be checked?', 'Where can consumers get trustworthy help?'],
          'Write one credit lesson and one safe next step.'),
        lesson_('finance_fraud', 'Recognize scams and financial fraud',
          'Learn common warning signs and safer ways to verify requests for money or information.',
          'Review a general scenario and practice pausing before acting.',
          ['What creates urgency or fear?', 'What information is being requested?', 'How can the request be verified independently?'],
          'Create a household pause-and-verify rule.'),
        lesson_('finance_consumer', 'Practice smart consumer research',
          'Compare price, quality, terms, reviews, warranties, and total cost before a purchase.',
          'Use a sample purchase or general category.',
          ['What matters besides price?', 'Which source may be biased?', 'What is the total long-term cost?'],
          'Create a short comparison checklist.')
      ],
      Goals: [
        lesson_('goals_small_steps', 'Break a goal into small steps',
          'Learn how clear next actions and regular reviews make large goals easier to begin.',
          'Choose one goal and divide it into manageable actions.',
          ['What is the desired result?', 'What is the smallest useful next step?', 'What barrier should we plan for?'],
          'Complete the first small action.'),
        lesson_('goals_consistency', 'Build consistency without perfection',
          'Understand how repeated effort, review, and adjustment support progress.',
          'Design a simple routine and a way to notice completion.',
          ['What rhythm is realistic?', 'What could interrupt the routine?', 'How will we restart after missing a day?'],
          'Practice the routine and record one win.'),
        lesson_('goals_decisions', 'Make a better decision',
          'Use values, reliable information, possible consequences, and available support to compare choices.',
          'Apply a simple decision process to a non-sensitive situation.',
          ['What matters most?', 'What information is missing?', 'What are the likely short- and long-term effects?'],
          'Choose one responsible next step.'),
        lesson_('goals_reflection', 'Learn from progress and setbacks',
          'Use reflection to identify what worked, what did not, and what should change next.',
          'Review one recent effort without shaming or blaming.',
          ['What progress occurred?', 'What got in the way?', 'What will we keep, stop, or change?'],
          'Write one lesson and one adjustment.')
      ],
      Organization: [
        lesson_('organization_roles', 'Learn and teach a household responsibility',
          'Make invisible work visible and teach the steps instead of expecting someone to already know them.',
          'Choose one responsibility, demonstrate it, and create a simple checklist.',
          ['What does completed work look like?', 'What steps are easy to forget?', 'What support is needed while learning?'],
          'Create and practice one responsibility checklist.'),
        lesson_('organization_system', 'Improve a household system',
          'Understand how steps, roles, reminders, supplies, and review points make repeated work easier.',
          'Map one repeated task from beginning to completion.',
          ['Where does the system break down?', 'What step is unclear?', 'What reminder, tool, or role would help?'],
          'Test one system improvement.'),
        lesson_('organization_research', 'Research information before deciding',
          'Practice asking a clear question, finding trustworthy sources, comparing information, and citing what was used.',
          'Use at least two sources when the decision is important.',
          ['Who created each source?', 'When was it published or updated?', 'Do the sources agree, and why might they differ?'],
          'Write a brief evidence-based conclusion with sources.'),
        lesson_('organization_leadership', 'Develop a shared leadership skill',
          'Learn how planning, communication, delegation, teaching, and follow-through support the household.',
          'Let one member practice leading a small activity with support.',
          ['What does the leader need to prepare?', 'How can others support without taking over?', 'What feedback would be useful?'],
          'Lead one short activity and reflect.')
      ]
    },
    es: {
      Health: [
        lesson_('health_basics', 'Crear una rutina diaria más saludable',
          'Comprender cómo decisiones pequeñas y repetidas pueden apoyar el bienestar físico, emocional, mental o espiritual.',
          'Elegir una rutina, aprender por qué importa y practicar un cambio realista.',
          ['¿Qué sabíamos ya?', '¿Qué idea nueva fue útil?', '¿Qué haría esto realista en nuestro hogar?'],
          'Practicar la rutina durante una semana y conversar sobre lo que ayudó.'),
        lesson_('health_stress', 'Reconocer el estrés y el apoyo saludable',
          'Aprender señales comunes de estrés e identificar maneras generales y seguras de descansar, comunicarse y buscar apoyo apropiado.',
          'Crear una lista sencilla de apoyo sin guardar diagnósticos ni expedientes médicos.',
          ['¿Cómo puede el estrés afectar las decisiones?', '¿Qué apoyo se siente útil?', '¿Cuándo se debe contactar a un profesional o servicio confiable?'],
          'Elegir una práctica saludable de apoyo.'),
        lesson_('health_preparedness', 'Aprender una habilidad de seguridad o preparación',
          'Desarrollar conciencia práctica antes de que ocurra una emergencia o situación insegura.',
          'Revisar un tema general de seguridad y practicar la respuesta correcta.',
          ['¿Qué podría ocurrir?', '¿Qué debe saber cada persona de forma general?', '¿Qué necesita práctica o recordatorio?'],
          'Programar una práctica o revisión segura.'),
        lesson_('health_information', 'Comprender una fuente de información de salud',
          'Practicar cómo encontrar información general y confiable sin diagnosticar a nadie.',
          'Comparar la fuente, fecha, propósito y afirmaciones antes de usar la información.',
          ['¿Quién creó la información?', '¿Qué tan reciente es?', '¿Recomienda ayuda profesional cuando corresponde?'],
          'Escribir una lección y una pregunta para un profesional calificado.')
      ],
      Relationships: [
        lesson_('relationship_listening', 'Practicar la escucha activa',
          'Aprender maneras sencillas de escuchar para comprender en vez de preparar una respuesta.',
          'Practicar una actividad corta de escucha y reflexionar.',
          ['¿Cómo se ve la escucha respetuosa?', '¿Qué interrumpe la comprensión?', '¿Cómo mostramos que escuchamos?'],
          'Usar una práctica de escucha durante la semana.'),
        lesson_('relationship_boundaries', 'Aprender sobre límites saludables',
          'Comprender cómo límites claros y respetuosos pueden proteger relaciones y bienestar.',
          'Identificar la diferencia entre un límite, una petición y controlar a otra persona.',
          ['¿Qué está bajo mi control?', '¿Cómo se expresa un límite con respeto?', '¿Qué debe ocurrir cuando se ignora un límite?'],
          'Practicar una declaración clara de límites.'),
        lesson_('relationship_repair', 'Reparar después de un conflicto',
          'Aprender cómo la responsabilidad, escucha, disculpa y cambio de conducta apoyan la reparación.',
          'Crear un proceso sencillo que se adapte al hogar.',
          ['¿Qué hace que una disculpa sea significativa?', '¿Cómo se reconoce el impacto?', '¿Qué acción demuestra aprendizaje?'],
          'Acordar una frase de reparación y una acción de seguimiento.'),
        lesson_('relationship_community', 'Fortalecer conexiones comunitarias',
          'Aprender cómo relaciones seguras, mentores, programas y grupos pueden apoyar el crecimiento.',
          'Identificar un tipo de apoyo e investigar un recurso confiable.',
          ['¿Qué apoyo se necesita?', '¿Qué hace que un recurso se sienta seguro y respetuoso?', '¿Cuál es un próximo paso de bajo riesgo?'],
          'Contactar o revisar un recurso apropiado.')
      ],
      Education: [
        lesson_('education_study', 'Aprender una mejor estrategia de estudio o práctica',
          'Comprender una estrategia para recordar, practicar, organizar o explicar el aprendizaje.',
          'Probar la estrategia con una tarea real.',
          ['¿Cómo funciona?', '¿Cuándo sería útil?', '¿Cómo sabremos si ayudó?'],
          'Usar la estrategia al menos dos veces y reflexionar.'),
        lesson_('education_digital', 'Desarrollar alfabetización digital y de IA',
          'Aprender a usar herramientas digitales para ideas, explicaciones, práctica y productividad, protegiendo la privacidad y revisando errores.',
          'Practicar con un ejemplo no sensible y comparar el resultado con una fuente confiable.',
          ['¿Qué información nunca debe ingresarse?', '¿Cómo podemos verificar la respuesta?', '¿Cómo debe la IA apoyar, no reemplazar, nuestro pensamiento?'],
          'Usar una sugerencia segura, revisar la respuesta y mejorarla.'),
        lesson_('education_career', 'Explorar una carrera o capacitación',
          'Aprender sobre tareas, habilidades, educación, credenciales, costos y próximos pasos realistas.',
          'Investigar una opción con fuentes oficiales o confiables.',
          ['¿Qué incluye el trabajo?', '¿Qué habilidades o credenciales se necesitan?', '¿Cuál es un próximo paso?'],
          'Guardar una fuente confiable y elegir una acción.'),
        lesson_('education_skill', 'Enseñar y practicar una habilidad útil',
          'Usar enseñanza paso a paso, demostración, práctica, comentarios y reflexión.',
          'Elegir una habilidad útil que un miembro pueda enseñar o aprender.',
          ['¿Cuáles son los pasos?', '¿Qué errores son comunes?', '¿Cómo puede la práctica sentirse apoyada?'],
          'Practicar y documentar una mejora.')
      ],
      Finances: [
        lesson_('finance_budget', 'Comprender un presupuesto básico',
          'Aprender cómo ingresos, necesidades, obligaciones, decisiones y metas forman un plan sencillo.',
          'Usar categorías generales o de ejemplo sin ingresar detalles de cuentas.',
          ['¿Qué es una necesidad, obligación, decisión o meta?', '¿Por qué debe revisarse el plan?', '¿Qué categoría necesita ajuste?'],
          'Crear un presupuesto de práctica o revisar una categoría.'),
        lesson_('finance_credit', 'Aprender cómo funciona el crédito',
          'Comprender informes, puntajes, costos de préstamos y derechos del consumidor.',
          'Usar una fuente confiable sin ingresar números de cuenta ni identificadores.',
          ['¿Qué afecta el costo de pedir prestado?', '¿Qué información se debe revisar?', '¿Dónde se obtiene ayuda confiable?'],
          'Escribir una lección y un próximo paso seguro.'),
        lesson_('finance_fraud', 'Reconocer estafas y fraude financiero',
          'Aprender señales de advertencia y maneras seguras de verificar solicitudes de dinero o información.',
          'Revisar un escenario general y practicar hacer una pausa.',
          ['¿Qué crea urgencia o miedo?', '¿Qué información se solicita?', '¿Cómo se verifica de manera independiente?'],
          'Crear una regla para hacer una pausa y verificar.'),
        lesson_('finance_consumer', 'Practicar investigación de compras',
          'Comparar precio, calidad, términos, reseñas, garantías y costo total.',
          'Usar una compra de ejemplo o categoría general.',
          ['¿Qué importa además del precio?', '¿Qué fuente puede tener sesgo?', '¿Cuál es el costo total a largo plazo?'],
          'Crear una lista corta de comparación.')
      ],
      Goals: [
        lesson_('goals_small_steps', 'Dividir una meta en pasos pequeños',
          'Aprender cómo próximas acciones claras y revisiones regulares facilitan comenzar.',
          'Elegir una meta y dividirla en acciones manejables.',
          ['¿Cuál es el resultado deseado?', '¿Cuál es el próximo paso más pequeño?', '¿Qué barrera debemos anticipar?'],
          'Completar la primera acción pequeña.'),
        lesson_('goals_consistency', 'Crear constancia sin perfección',
          'Comprender cómo esfuerzo repetido, revisión y ajuste apoyan el progreso.',
          'Diseñar una rutina sencilla y una manera de notar la finalización.',
          ['¿Qué ritmo es realista?', '¿Qué podría interrumpirlo?', '¿Cómo comenzaremos de nuevo después de fallar un día?'],
          'Practicar la rutina y registrar un logro.'),
        lesson_('goals_decisions', 'Tomar una mejor decisión',
          'Usar valores, información confiable, consecuencias posibles y apoyo disponible para comparar opciones.',
          'Aplicar un proceso sencillo a una situación no sensible.',
          ['¿Qué importa más?', '¿Qué información falta?', '¿Cuáles son los efectos probables?'],
          'Elegir un próximo paso responsable.'),
        lesson_('goals_reflection', 'Aprender del progreso y los obstáculos',
          'Usar reflexión para identificar qué funcionó, qué no y qué debe cambiar.',
          'Revisar un esfuerzo reciente sin vergüenza ni culpa.',
          ['¿Qué progreso ocurrió?', '¿Qué dificultó el avance?', '¿Qué mantendremos, dejaremos o cambiaremos?'],
          'Escribir una lección y un ajuste.')
      ],
      Organization: [
        lesson_('organization_roles', 'Aprender y enseñar una responsabilidad',
          'Hacer visible el trabajo y enseñar los pasos en vez de esperar que alguien ya sepa.',
          'Elegir una responsabilidad, demostrarla y crear una lista sencilla.',
          ['¿Cómo se ve el trabajo completo?', '¿Qué pasos se olvidan?', '¿Qué apoyo se necesita mientras se aprende?'],
          'Crear y practicar una lista de responsabilidad.'),
        lesson_('organization_system', 'Mejorar un sistema del hogar',
          'Comprender cómo pasos, roles, recordatorios, materiales y revisiones facilitan el trabajo repetido.',
          'Representar una tarea desde el principio hasta el final.',
          ['¿Dónde falla el sistema?', '¿Qué paso no está claro?', '¿Qué recordatorio, herramienta o rol ayudaría?'],
          'Probar una mejora del sistema.'),
        lesson_('organization_research', 'Investigar antes de decidir',
          'Practicar una pregunta clara, buscar fuentes confiables, comparar información y citar lo usado.',
          'Usar por lo menos dos fuentes cuando la decisión sea importante.',
          ['¿Quién creó cada fuente?', '¿Cuándo se publicó o actualizó?', '¿Las fuentes están de acuerdo y por qué pueden diferir?'],
          'Escribir una conclusión breve con fuentes.'),
        lesson_('organization_leadership', 'Desarrollar una habilidad de liderazgo compartido',
          'Aprender cómo planificación, comunicación, delegación, enseñanza y seguimiento apoyan al hogar.',
          'Permitir que un miembro dirija una actividad pequeña con apoyo.',
          ['¿Qué necesita preparar el líder?', '¿Cómo apoyan los demás sin tomar control?', '¿Qué comentario sería útil?'],
          'Dirigir una actividad corta y reflexionar.')
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
      sharedPlans: normalizePlanList_(data.shared.learningPlans || [], 'HOUSEHOLD'),
      personalPlans: normalizePlanList_(data.personal.learningPlans || [], 'PERSONAL'),
      responses: normalizeResponseList_(data.personal.learningProgress || []),
      roleOptions: buildRoleOptions_(data),
      guidance: getGuidance_(language),
      citation: {
        contentId: 'LEARNING_GUIDANCE',
        inTextCitation: '(Hall, 2025, pp. 20–23)',
        statement: language === 'es'
          ? 'FamilyPD promueve aprendizaje continuo dentro y fuera del hogar, usando estrategias de enseñanza, liderazgo, práctica y recursos confiables.'
          : 'FamilyPD promotes continued learning inside and outside the home through teaching strategies, leadership, practice, and trustworthy resources.'
      }
    };
  }


  function getGuidance_(language) {
    const lang = GuidanceService.normalizeLanguage(language);
    return {
      language: lang,
      groups: [
        { value: 'Health', label: lang === 'es' ? 'Salud' : 'Health' },
        { value: 'Relationships', label: lang === 'es' ? 'Relaciones' : 'Relationships' },
        { value: 'Education', label: lang === 'es' ? 'Educación' : 'Education' },
        { value: 'Finances', label: lang === 'es' ? 'Finanzas' : 'Finances' },
        { value: 'Goals', label: lang === 'es' ? 'Metas' : 'Goals' },
        { value: 'Organization', label: lang === 'es' ? 'Organización del hogar' : 'Household Organization' }
      ],
      topics: fpdClone_(TOPIC_LIBRARY[lang]),
      formats: FPD_CONFIG.LEARNING.FORMATS.map(function(value) {
        return { value: value, label: translateFormat_(value, lang) };
      }),
      difficulties: FPD_CONFIG.LEARNING.DIFFICULTIES.map(function(value) {
        return { value: value, label: translateDifficulty_(value, lang) };
      }),
      statuses: FPD_CONFIG.LEARNING.STATUSES.map(function(value) {
        return { value: value, label: translateStatus_(value, lang) };
      }),
      resourceTypes: FPD_CONFIG.LEARNING.RESOURCE_TYPES.map(function(value) {
        return { value: value, label: translateResourceType_(value, lang) };
      }),
      durations: FPD_CONFIG.LEARNING.ESTIMATED_MINUTES.map(function(value) {
        return {
          value: String(value),
          label: value + (lang === 'es' ? ' minutos' : ' minutes')
        };
      }),
      privacyMessage: lang === 'es'
        ? 'No ingrese nombres legales, expedientes escolares, diagnósticos, contraseñas, información de cuentas, direcciones exactas ni otros datos sensibles. Use ejemplos y descripciones generales.'
        : 'Do not enter legal names, school records, diagnoses, passwords, account information, exact addresses, or other sensitive data. Use examples and general descriptions.',
      sourceMessage: lang === 'es'
        ? 'Revisar un enlace confirma que responde y muestra el dominio. No comprueba que todas las afirmaciones sean correctas. Revise el autor, fecha, propósito, evidencia y posibles sesgos.'
        : 'Checking a link confirms that it responds and identifies the domain. It does not prove every claim is correct. Review the author, date, purpose, evidence, and possible bias.'
    };
  }


  function generateFromLibrary(payload) {
    payload = payload || {};
    const language = GuidanceService.normalizeLanguage(payload.language);
    const pillar = assertPillar_(payload.pillar);
    const lessonId = fpdSafeText_(payload.lessonId, 120);
    const options = TOPIC_LIBRARY[language][pillar] || [];
    const lesson = options.find(function(item) { return item.id === lessonId; });

    if (!lesson) {
      throw new Error(language === 'es'
        ? 'Seleccione un tema de aprendizaje.'
        : 'Choose a learning topic.');
    }

    return {
      title: lesson.title,
      objective: lesson.objective,
      activity: lesson.activity,
      discussionPrompts: fpdClone_(lesson.prompts),
      actionStep: lesson.actionStep,
      reflectionPrompt: language === 'es'
        ? '¿Qué aprendimos, qué pregunta queda y qué haremos con esta información?'
        : 'What did we learn, what question remains, and what will we do with this information?'
    };
  }


  function savePlan(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const normalized = normalizePlanPayload_(payload, context.role);
    const target = getTargetList_(data, normalized.scope, context.role);
    const max = normalized.scope === 'HOUSEHOLD'
      ? FPD_CONFIG.LEARNING.MAX_SHARED_PLANS
      : FPD_CONFIG.LEARNING.MAX_PERSONAL_PLANS;

    const privacyCopy = fpdClone_(normalized);
    privacyCopy.resources = (privacyCopy.resources || []).map(function(resource) {
      resource.url = '';
      return resource;
    });
    PrivacyGuardService.validatePayload(privacyCopy, 'learning plan');

    const index = target.findIndex(function(item) {
      return String(item.id || '') === normalized.id;
    });
    if (index < 0 && target.length >= max) {
      throw new Error('This workspace has reached its current learning-plan limit.');
    }

    const now = fpdNow_();
    const existing = index >= 0 ? target[index] : null;
    const record = Object.assign({}, existing || {}, normalized, {
      id: normalized.id || fpdNewId_('LEARNING'),
      createdAt: existing && existing.createdAt || now,
      updatedAt: now,
      completedAt: normalized.status === 'Completed'
        ? existing && existing.completedAt || now
        : ''
    });

    if (index >= 0) target[index] = record;
    else target.unshift(record);

    DataStoreService.appendActivity(
      data,
      index >= 0 ? 'LEARNING_PLAN_UPDATED' : 'LEARNING_PLAN_CREATED',
      normalized.scope === 'HOUSEHOLD'
        ? 'A shared household learning plan was saved.'
        : 'A private personal learning plan was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: normalized.scope === 'HOUSEHOLD'
        ? 'Household learning plan saved.'
        : 'Personal learning plan saved.',
      workspace: getWorkspaceView(payload && payload.language)
    };
  }


  function archivePlan(payload) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    payload = payload || {};
    const scope = normalizeScope_(payload.scope, context.role);
    const target = getTargetList_(data, scope, context.role);
    const plan = target.find(function(item) {
      return String(item.id || '') === String(payload.planId || '');
    });
    if (!plan) throw new Error('FamilyPD could not find that learning plan.');

    plan.status = 'Archived';
    plan.updatedAt = fpdNow_();
    DataStoreService.appendActivity(data, 'LEARNING_PLAN_ARCHIVED', 'A learning plan was archived.');
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Learning plan archived.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function saveResponse(payload) {
    const data = DataStoreService.readData();
    payload = payload || {};
    const planId = fpdSafeText_(payload.planId, 120);
    const exists =
      (data.shared.learningPlans || []).some(function(item) { return item.id === planId; }) ||
      (data.personal.learningPlans || []).some(function(item) { return item.id === planId; });
    if (!exists) throw new Error('FamilyPD could not find that learning plan.');

    const record = {
      id: fpdSafeText_(payload.id, 120),
      planId: planId,
      keyLearning: fpdSafeText_(payload.keyLearning, 1800),
      questions: fpdSafeText_(payload.questions, 1400),
      action: fpdSafeText_(payload.action, 1200),
      completed: Boolean(payload.completed)
    };
    PrivacyGuardService.validatePayload(record, 'learning reflection');

    data.personal.learningProgress = Array.isArray(data.personal.learningProgress)
      ? data.personal.learningProgress : [];
    const index = data.personal.learningProgress.findIndex(function(item) {
      return String(item.planId || '') === planId;
    });
    const now = fpdNow_();
    record.id = record.id || index >= 0 && data.personal.learningProgress[index].id ||
      fpdNewId_('LEARNING_RESPONSE');
    record.createdAt = index >= 0 && data.personal.learningProgress[index].createdAt || now;
    record.updatedAt = now;

    if (index >= 0) data.personal.learningProgress[index] = record;
    else data.personal.learningProgress.unshift(record);

    data.personal.learningProgress =
      data.personal.learningProgress.slice(0, FPD_CONFIG.LEARNING.MAX_RESPONSES);

    DataStoreService.appendActivity(
      data,
      'LEARNING_RESPONSE_SAVED',
      'A private learning reflection was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Private learning reflection saved.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function normalizePlanPayload_(payload, role) {
    payload = payload || {};
    const scope = normalizeScope_(payload.scope, role);
    const title = fpdSafeText_(payload.title, 200);
    if (!title) throw new Error('Enter a short learning-plan title.');

    return {
      id: fpdSafeText_(payload.id, 120),
      scope: scope,
      title: title,
      pillar: assertPillar_(payload.pillar),
      status: assertStatus_(payload.status || 'Draft'),
      format: assertFormat_(payload.format || 'Mixed format'),
      difficulty: assertDifficulty_(payload.difficulty || 'Mixed levels'),
      estimatedMinutes: assertDuration_(payload.estimatedMinutes || 30),
      facilitatorRole: fpdSafeText_(payload.facilitatorRole, 120),
      audienceRoles: sanitizeTextList_(payload.audienceRoles, 25, 120),
      objective: fpdSafeText_(payload.objective, 1800),
      why: fpdSafeText_(payload.why, 1200),
      resources: normalizeResources_(payload.resources),
      activities: sanitizeTextList_(
        payload.activities,
        FPD_CONFIG.LEARNING.MAX_ACTIVITIES,
        1000
      ),
      discussionPrompts: sanitizeTextList_(
        payload.discussionPrompts,
        FPD_CONFIG.LEARNING.MAX_DISCUSSION_PROMPTS,
        700
      ),
      actionStep: fpdSafeText_(payload.actionStep, 1200),
      reflectionPrompt: fpdSafeText_(payload.reflectionPrompt, 1200),
      notes: fpdSafeText_(payload.notes, 3000)
    };
  }


  function normalizeResources_(records) {
    return (Array.isArray(records) ? records : [])
      .slice(0, FPD_CONFIG.LEARNING.MAX_RESOURCES)
      .map(function(item) {
        item = item || {};
        const url = ResourceVerificationService.sanitizePublicUrl(item.url, true);
        return {
          id: fpdSafeText_(item.id, 120) || fpdNewId_('RESOURCE'),
          type: FPD_CONFIG.LEARNING.RESOURCE_TYPES.indexOf(item.type) >= 0
            ? item.type : 'Other',
          title: fpdSafeText_(item.title, 500),
          authorOrPublisher: fpdSafeText_(item.authorOrPublisher, 240),
          year: normalizeYear_(item.year),
          url: url,
          notes: fpdSafeText_(item.notes, 1000),
          domain: fpdSafeText_(item.domain, 200) ||
            ResourceVerificationService.extractDomain(url),
          verificationStatus: [
            'Not checked',
            'Link checked',
            'Check failed',
            'Secure HTTPS link and redirect checked',
            'Secure HTTPS link and page response checked',
            'Secure HTTPS address; automated page check limited',
            'Secure HTTPS address checked',
            'Secure HTTPS format checked; page response not confirmed'
          ].indexOf(item.verificationStatus) >= 0
            ? item.verificationStatus : 'Not checked',
          httpStatus: Math.max(0, Math.min(599, Number(item.httpStatus || 0))),
          lastCheckedAt: fpdSafeText_(item.lastCheckedAt, 50)
        };
      })
      .filter(function(item) {
        return Boolean(item.title || item.url);
      });
  }


  function normalizePlanList_(records, scope) {
    return (Array.isArray(records) ? records : [])
      .map(function(item) { return normalizePlan_(item, scope); })
      .sort(function(a, b) {
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
  }


  function normalizePlan_(item, scope) {
    item = item || {};
    return {
      id: fpdSafeText_(item.id, 120),
      scope: scope,
      title: fpdSafeText_(item.title, 200),
      pillar: ['Health', 'Relationships', 'Education', 'Finances', 'Goals', 'Organization']
        .indexOf(item.pillar) >= 0 ? item.pillar : 'Education',
      status: FPD_CONFIG.LEARNING.STATUSES.indexOf(item.status) >= 0
        ? item.status : 'Draft',
      format: FPD_CONFIG.LEARNING.FORMATS.indexOf(item.format) >= 0
        ? item.format : 'Mixed format',
      difficulty: FPD_CONFIG.LEARNING.DIFFICULTIES.indexOf(item.difficulty) >= 0
        ? item.difficulty : 'Mixed levels',
      estimatedMinutes: assertDuration_(item.estimatedMinutes || 30),
      facilitatorRole: fpdSafeText_(item.facilitatorRole, 120),
      audienceRoles: sanitizeTextList_(item.audienceRoles, 25, 120),
      objective: fpdSafeText_(item.objective, 1800),
      why: fpdSafeText_(item.why, 1200),
      resources: normalizeResources_(item.resources),
      activities: sanitizeTextList_(item.activities, 10, 1000),
      discussionPrompts: sanitizeTextList_(item.discussionPrompts, 8, 700),
      actionStep: fpdSafeText_(item.actionStep, 1200),
      reflectionPrompt: fpdSafeText_(item.reflectionPrompt, 1200),
      notes: fpdSafeText_(item.notes, 3000),
      createdAt: fpdSafeText_(item.createdAt, 50),
      updatedAt: fpdSafeText_(item.updatedAt, 50),
      completedAt: fpdSafeText_(item.completedAt, 50)
    };
  }


  function normalizeResponseList_(records) {
    return (Array.isArray(records) ? records : []).map(function(item) {
      return {
        id: fpdSafeText_(item.id, 120),
        planId: fpdSafeText_(item.planId, 120),
        keyLearning: fpdSafeText_(item.keyLearning, 1800),
        questions: fpdSafeText_(item.questions, 1400),
        action: fpdSafeText_(item.action, 1200),
        completed: Boolean(item.completed),
        createdAt: fpdSafeText_(item.createdAt, 50),
        updatedAt: fpdSafeText_(item.updatedAt, 50)
      };
    });
  }


  function buildRoleOptions_(data) {
    const values = [];
    const add = function(value) {
      const clean = fpdSafeText_(value, 120);
      if (clean && values.indexOf(clean) < 0) values.push(clean);
    };
    FPD_CONFIG.HOUSEHOLD_ROLE_LABELS.forEach(add);
    FPD_CONFIG.FUNCTIONAL_ROLE_LABELS.forEach(add);
    (data.shared.memberRoles || []).forEach(function(role) {
      add(role.memberLabel);
      add(role.roleTitle);
    });
    return values.slice(0, 30);
  }


  function getTargetList_(data, scope, role) {
    if (scope === 'HOUSEHOLD') {
      if (role !== FPD_CONFIG.ROLE.LEAD) {
        throw new Error('Family Member workspaces can view shared learning plans but cannot edit them.');
      }
      data.shared.learningPlans = Array.isArray(data.shared.learningPlans)
        ? data.shared.learningPlans : [];
      return data.shared.learningPlans;
    }

    data.personal.learningPlans = Array.isArray(data.personal.learningPlans)
      ? data.personal.learningPlans : [];
    return data.personal.learningPlans;
  }


  function normalizeScope_(scope, role) {
    const value = String(scope || 'PERSONAL').toUpperCase();
    if (value === 'HOUSEHOLD' && role === FPD_CONFIG.ROLE.LEAD) return 'HOUSEHOLD';
    return 'PERSONAL';
  }


  function assertPillar_(value) {
    if (['Health', 'Relationships', 'Education', 'Finances', 'Goals', 'Organization']
        .indexOf(value) < 0) {
      throw new Error('Choose a FamilyPD learning area.');
    }
    return value;
  }


  function assertStatus_(value) {
    if (FPD_CONFIG.LEARNING.STATUSES.indexOf(value) < 0) {
      throw new Error('Choose a valid learning-plan status.');
    }
    return value;
  }


  function assertFormat_(value) {
    if (FPD_CONFIG.LEARNING.FORMATS.indexOf(value) < 0) {
      throw new Error('Choose a valid learning format.');
    }
    return value;
  }


  function assertDifficulty_(value) {
    if (FPD_CONFIG.LEARNING.DIFFICULTIES.indexOf(value) < 0) {
      throw new Error('Choose a valid learning level.');
    }
    return value;
  }


  function assertDuration_(value) {
    const number = Number(value);
    return FPD_CONFIG.LEARNING.ESTIMATED_MINUTES.indexOf(number) >= 0
      ? number : 30;
  }


  function normalizeYear_(value) {
    const text = String(value || '').trim();
    return /^\d{4}$/.test(text) ? text : '';
  }


  function sanitizeTextList_(values, maxItems, maxLength) {
    return (Array.isArray(values) ? values : [])
      .slice(0, maxItems)
      .map(function(value) { return fpdSafeText_(value, maxLength); })
      .filter(Boolean);
  }


  function translateFormat_(value, language) {
    if (language !== 'es') return value;
    return {
      'Short reading': 'Lectura corta',
      Video: 'Video',
      Audio: 'Audio',
      'Hands-on activity': 'Actividad práctica',
      Discussion: 'Conversación',
      'Visual guide': 'Guía visual',
      'Course or lesson': 'Curso o lección',
      'Mixed format': 'Formato combinado'
    }[value] || value;
  }


  function translateDifficulty_(value, language) {
    if (language !== 'es') return value;
    return {
      Beginner: 'Principiante',
      Developing: 'En desarrollo',
      Intermediate: 'Intermedio',
      Advanced: 'Avanzado',
      'Mixed levels': 'Niveles combinados'
    }[value] || value;
  }


  function translateStatus_(value, language) {
    if (language !== 'es') return value;
    return {
      Draft: 'Borrador',
      Ready: 'Lista',
      'In progress': 'En progreso',
      Completed: 'Completada',
      Archived: 'Archivada'
    }[value] || value;
  }


  function translateResourceType_(value, language) {
    if (language !== 'es') return value;
    return {
      'Article or webpage': 'Artículo o página web',
      Video: 'Video',
      Book: 'Libro',
      'Course or lesson': 'Curso o lección',
      'Podcast or audio': 'Podcast o audio',
      'Worksheet or guide': 'Hoja o guía',
      'Community resource': 'Recurso comunitario',
      Other: 'Otro'
    }[value] || value;
  }


  function lesson_(id, title, objective, activity, prompts, actionStep) {
    return {
      id: id,
      title: title,
      objective: objective,
      activity: activity,
      prompts: prompts,
      actionStep: actionStep
    };
  }


  return {
    getWorkspaceView: getWorkspaceView,
    getGuidance: getGuidance_,
    generateFromLibrary: generateFromLibrary,
    savePlan: savePlan,
    archivePlan: archivePlan,
    saveResponse: saveResponse
  };
})();
