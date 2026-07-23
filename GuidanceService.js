/**
 * Guided identity, values, roles, tutorial, and bilingual support.
 *
 * The guidance uses selectable, editable starting points so a household does
 * not need advanced writing or technology skills to begin FamilyPD.
 */

const GuidanceService = (function() {

  const LANGUAGES = ['en', 'es'];

  const BUILDER = {
    en: {
      feelings: [
        option_('peaceful', 'Peaceful', 'peaceful'),
        option_('safe', 'Safe', 'safe'),
        option_('supportive', 'Supportive', 'supportive'),
        option_('respectful', 'Respectful', 'respectful'),
        option_('organized', 'Organized', 'organized'),
        option_('hopeful', 'Hopeful', 'hopeful'),
        option_('connected', 'Connected', 'connected')
      ],
      treatment: [
        option_('respect', 'Respect', 'respect'),
        option_('honesty', 'Honesty', 'honesty'),
        option_('kindness', 'Kindness', 'kindness'),
        option_('patience', 'Patience', 'patience'),
        option_('fairness', 'Fairness', 'fairness'),
        option_('support', 'Support', 'support'),
        option_('accountability', 'Accountability', 'accountability')
      ],
      focus: [
        option_('health', 'Health and wellness', 'health and wellness'),
        option_('relationships', 'Strong relationships', 'strong relationships'),
        option_('education', 'Education and skills', 'education and skills'),
        option_('finances', 'Financial stability', 'financial stability'),
        option_('goals', 'Goals and progress', 'goals and progress'),
        option_('safety', 'Safety and preparedness', 'safety and preparedness'),
        option_('growth', 'Growth in all five pillars', 'growth in all five FamilyPD pillars')
      ],
      future: [
        option_('stable', 'Stable', 'stable'),
        option_('growing', 'Growing', 'growing'),
        option_('confident', 'Confident', 'confident'),
        option_('prepared', 'Prepared', 'prepared'),
        option_('united', 'United', 'united'),
        option_('healthy', 'Healthy', 'healthy'),
        option_('successful', 'Successful on our own terms', 'successful on our own terms')
      ],
      practices: [
        option_('communicate', 'Communicate honestly', 'communicating honestly'),
        option_('share', 'Share responsibilities', 'sharing responsibilities'),
        option_('learn', 'Learn together', 'learning together'),
        option_('plan', 'Plan before problems happen', 'planning before problems happen'),
        option_('encourage', 'Encourage one another', 'encouraging one another'),
        option_('review', 'Review progress regularly', 'reviewing progress regularly'),
        option_('solve', 'Solve problems together', 'solving problems together')
      ]
    },
    es: {
      feelings: [
        option_('peaceful', 'Tranquilo', 'tranquilo'),
        option_('safe', 'Seguro', 'seguro'),
        option_('supportive', 'Solidario', 'solidario'),
        option_('respectful', 'Respetuoso', 'respetuoso'),
        option_('organized', 'Organizado', 'organizado'),
        option_('hopeful', 'Lleno de esperanza', 'lleno de esperanza'),
        option_('connected', 'Unido', 'unido')
      ],
      treatment: [
        option_('respect', 'Respeto', 'respeto'),
        option_('honesty', 'Honestidad', 'honestidad'),
        option_('kindness', 'Amabilidad', 'amabilidad'),
        option_('patience', 'Paciencia', 'paciencia'),
        option_('fairness', 'Justicia', 'justicia'),
        option_('support', 'Apoyo', 'apoyo'),
        option_('accountability', 'Responsabilidad', 'responsabilidad')
      ],
      focus: [
        option_('health', 'Salud y bienestar', 'la salud y el bienestar'),
        option_('relationships', 'Relaciones fuertes', 'las relaciones fuertes'),
        option_('education', 'Educación y habilidades', 'la educación y las habilidades'),
        option_('finances', 'Estabilidad financiera', 'la estabilidad financiera'),
        option_('goals', 'Metas y progreso', 'las metas y el progreso'),
        option_('safety', 'Seguridad y preparación', 'la seguridad y la preparación'),
        option_('growth', 'Crecimiento en los cinco pilares', 'el crecimiento en los cinco pilares de FamilyPD')
      ],
      future: [
        option_('stable', 'Estable', 'estable'),
        option_('growing', 'En crecimiento', 'en crecimiento'),
        option_('confident', 'Con confianza', 'con confianza'),
        option_('prepared', 'Preparado', 'preparado'),
        option_('united', 'Unido', 'unido'),
        option_('healthy', 'Saludable', 'saludable'),
        option_('successful', 'Exitoso según nuestros propios valores', 'exitoso según nuestros propios valores')
      ],
      practices: [
        option_('communicate', 'Comunicarnos con honestidad', 'comunicarnos con honestidad'),
        option_('share', 'Compartir responsabilidades', 'compartir responsabilidades'),
        option_('learn', 'Aprender juntos', 'aprender juntos'),
        option_('plan', 'Planificar antes de que surjan problemas', 'planificar antes de que surjan problemas'),
        option_('encourage', 'Animarnos unos a otros', 'animarnos unos a otros'),
        option_('review', 'Revisar el progreso con frecuencia', 'revisar el progreso con frecuencia'),
        option_('solve', 'Resolver problemas juntos', 'resolver problemas juntos')
      ]
    }
  };

  const VALUES = [
    value_('respect', 'Respect', 'We treat people like they matter.', 'We listen, avoid insults, and speak calmly.',
      'Respeto', 'Tratamos a cada persona como alguien importante.', 'Escuchamos, evitamos los insultos y hablamos con calma.'),
    value_('honesty', 'Honesty', 'We tell the truth and correct mistakes.', 'We are truthful even when a conversation is difficult.',
      'Honestidad', 'Decimos la verdad y corregimos nuestros errores.', 'Decimos la verdad aun cuando una conversación es difícil.'),
    value_('kindness', 'Kindness', 'We care about how our actions affect others.', 'We use thoughtful words and offer help.',
      'Amabilidad', 'Nos importa cómo nuestras acciones afectan a los demás.', 'Usamos palabras consideradas y ofrecemos ayuda.'),
    value_('support', 'Support', 'We help one another grow.', 'We encourage progress and offer help when someone struggles.',
      'Apoyo', 'Nos ayudamos a crecer.', 'Reconocemos el progreso y ofrecemos ayuda cuando alguien tiene dificultades.'),
    value_('responsibility', 'Responsibility', 'We do our part and communicate when we need help.', 'We complete agreed tasks or ask for support early.',
      'Responsabilidad', 'Cumplimos con nuestra parte y avisamos cuando necesitamos ayuda.', 'Completamos las tareas acordadas o pedimos apoyo a tiempo.'),
    value_('learning', 'Learning', 'We keep building knowledge and skills.', 'We ask questions, practice, read, and share what we learn.',
      'Aprendizaje', 'Seguimos desarrollando conocimientos y habilidades.', 'Hacemos preguntas, practicamos, leemos y compartimos lo que aprendemos.'),
    value_('cooperation', 'Cooperation', 'We work for the benefit of the whole household.', 'We share responsibilities and solve problems together.',
      'Cooperación', 'Trabajamos por el bienestar de todo el hogar.', 'Compartimos responsabilidades y resolvemos problemas juntos.'),
    value_('consistency', 'Consistency', 'We keep practicing what matters.', 'We return to the plan after setbacks.',
      'Constancia', 'Seguimos practicando lo que importa.', 'Retomamos el plan después de los contratiempos.'),
    value_('safety', 'Safety', 'We protect health, privacy, and well-being.', 'We prepare, stay aware, and speak up about concerns.',
      'Seguridad', 'Protegemos la salud, la privacidad y el bienestar.', 'Nos preparamos, prestamos atención y hablamos sobre nuestras preocupaciones.'),
    value_('growth', 'Growth', 'We believe people can learn and improve.', 'We notice progress and use mistakes as lessons.',
      'Crecimiento', 'Creemos que las personas pueden aprender y mejorar.', 'Reconocemos el progreso y usamos los errores como lecciones.'),
    value_('communication', 'Communication', 'We share important information clearly and respectfully.', 'We listen, ask questions, and explain what we need.',
      'Comunicación', 'Compartimos información importante con claridad y respeto.', 'Escuchamos, hacemos preguntas y explicamos lo que necesitamos.'),
    value_('fairness', 'Fairness', 'We make reasonable decisions and hear different viewpoints.', 'We explain expectations and consider each person’s needs.',
      'Justicia', 'Tomamos decisiones razonables y escuchamos distintos puntos de vista.', 'Explicamos las expectativas y consideramos las necesidades de cada persona.'),
    value_('patience', 'Patience', 'We give people time to learn, speak, and improve.', 'We pause before reacting and offer another chance when appropriate.',
      'Paciencia', 'Damos tiempo para aprender, hablar y mejorar.', 'Hacemos una pausa antes de reaccionar y damos otra oportunidad cuando corresponde.'),
    value_('gratitude', 'Gratitude', 'We notice and appreciate what is going well.', 'We say thank you and recognize effort.',
      'Gratitud', 'Reconocemos y apreciamos lo que está saliendo bien.', 'Damos las gracias y reconocemos el esfuerzo.')
  ];


  const PILLAR_IDENTITY = {
    en: {
      Health: {
        label: 'Health',
        mission: [
          'We protect health by building routines for rest, hygiene, movement, emotional check-ins, and safety.',
          'We care for our bodies and minds by noticing needs early, asking for help, and making healthy choices together.',
          'We make wellbeing a household priority through preparation, balanced routines, honest check-ins, and support.',
          'We teach and practice habits that help every member feel safe, rested, confident, and cared for.',
          'We reduce preventable stress by planning ahead, sharing health-supporting responsibilities, and respecting limits.',
          'We use trustworthy information and appropriate professional support to make informed health and safety decisions.'
        ],
        vision: [
          'We are building a safe and healthy household where every member has support, rest, and room to grow.',
          'Our vision is a home where physical, emotional, mental, and spiritual wellbeing are protected and discussed openly.',
          'We want a household that prepares before emergencies, responds calmly, and helps each person feel secure.',
          'We are becoming a family that chooses sustainable healthy habits instead of waiting for a crisis.',
          'Our home will be a place where people can name what they need, receive support, and make informed health choices.',
          'We envision generations who understand their wellbeing, protect one another, and know when to seek qualified help.'
        ],
        values: [
          { id: 'health_safety', label: 'Safety', description: 'We protect physical, emotional, digital, and household safety.', example: 'We prepare, stay aware, and speak up about concerns.' },
          { id: 'health_wellbeing', label: 'Wellbeing', description: 'We treat health as a foundation for every other area of growth.', example: 'We check in, rest, and make space for healthy support.' },
          { id: 'health_balance', label: 'Balance', description: 'We make room for work, rest, relationships, learning, and recovery.', example: 'We notice overload and adjust routines before burnout.' },
          { id: 'health_rest', label: 'Rest', description: 'We respect the need for sleep, quiet, recovery, and healthy limits.', example: 'We protect reasonable sleep and recovery routines.' },
          { id: 'health_preparedness', label: 'Preparedness', description: 'We think ahead and practice what to do before problems happen.', example: 'We review general safety plans and needed supplies.' },
          { id: 'health_awareness', label: 'Self-Awareness', description: 'We notice how our bodies, thoughts, feelings, and choices affect us.', example: 'We pause, name what we feel, and communicate what may help.' },
          { id: 'health_compassion', label: 'Compassion', description: 'We respond to struggle with care instead of shame.', example: 'We offer support and encourage appropriate help.' },
          { id: 'health_habits', label: 'Healthy Habits', description: 'We practice small routines that support long-term wellbeing.', example: 'We build consistent hygiene, movement, nutrition, and rest habits.' }
        ]
      },
      Relationships: {
        label: 'Relationships',
        mission: [
          'We strengthen relationships through respect, honest communication, listening, healthy boundaries, and repair.',
          'We create connection by spending meaningful time together, sharing responsibilities, and encouraging one another.',
          'We address conflict without insults or avoidance and work toward accountability, understanding, and changed behavior.',
          'We protect household harmony by communicating clearly, treating people fairly, and making room for different viewpoints.',
          'We teach every member how to listen, apologize, forgive wisely, and rebuild trust through consistent action.',
          'We support strong family and community relationships while respecting privacy, safety, and healthy limits.'
        ],
        vision: [
          'We are building a connected household where every member feels respected, heard, supported, and valued.',
          'Our vision is a family that can disagree without destroying trust and repair relationships after mistakes.',
          'We want a home known for kindness, honesty, loyalty, healthy boundaries, and shared responsibility.',
          'We are becoming a household where communication is clear, appreciation is common, and no one carries everything alone.',
          'Our home will be a place where people can speak honestly, listen carefully, and receive support without fear or shame.',
          'We envision generations who build healthy relationships, recognize harmful patterns, and choose better ways forward.'
        ],
        values: [
          { id: 'relationships_respect', label: 'Respect', description: 'We treat each person like they matter, even during disagreement.', example: 'We listen, avoid insults, and use a calm tone.' },
          { id: 'relationships_honesty', label: 'Honesty', description: 'We tell the truth and correct misinformation or mistakes.', example: 'We communicate truthfully even when the conversation is difficult.' },
          { id: 'relationships_kindness', label: 'Kindness', description: 'We care about how our words and actions affect others.', example: 'We use thoughtful words and offer help.' },
          { id: 'relationships_listening', label: 'Listening', description: 'We listen to understand instead of only preparing a response.', example: 'We ask questions and repeat back what we heard.' },
          { id: 'relationships_loyalty', label: 'Loyalty', description: 'We protect the wellbeing and dignity of the household while still doing what is right.', example: 'We support one another and do not use private struggles for entertainment.' },
          { id: 'relationships_boundaries', label: 'Healthy Boundaries', description: 'We communicate reasonable limits and respect the safety and autonomy of others.', example: 'We state what we can do and what we cannot accept.' },
          { id: 'relationships_repair', label: 'Repair', description: 'We take responsibility and work to rebuild trust after harm.', example: 'We acknowledge impact, apologize, and change behavior.' },
          { id: 'relationships_cooperation', label: 'Cooperation', description: 'We work together for the benefit of the household.', example: 'We share responsibilities and solve problems as a team.' }
        ]
      },
      Education: {
        label: 'Education',
        mission: [
          'We keep learning inside and outside school by asking questions, practicing skills, and sharing what we know.',
          'We help each member build knowledge, confidence, credentials, digital literacy, and practical life skills.',
          'We use trustworthy resources, thoughtful research, and safe technology to make informed decisions.',
          'We teach step by step, allow room for mistakes, and support different learning needs and starting points.',
          'We connect education to careers, opportunities, problem solving, leadership, and long-term household growth.',
          'We treat learning as a shared responsibility and create routines that make practice, reading, and reflection possible.'
        ],
        vision: [
          'We are building a learning household where curiosity, effort, teaching, and practical skill-building are part of daily life.',
          'Our vision is a family with the knowledge and confidence to understand systems, pursue opportunities, and make informed choices.',
          'We want every member to know that learning does not end with school and that skills can grow at every age.',
          'We are becoming a household that uses technology responsibly, checks information, and creates instead of only consuming.',
          'Our home will support education, credentials, career exploration, creativity, and the courage to ask for help.',
          'We envision generations who can teach themselves, teach others, adapt to change, and use knowledge to improve their lives.'
        ],
        values: [
          { id: 'education_curiosity', label: 'Curiosity', description: 'We ask questions and look for deeper understanding.', example: 'We explore how and why instead of stopping at the first answer.' },
          { id: 'education_learning', label: 'Learning', description: 'We continue building knowledge and skills at every age.', example: 'We read, practice, research, and share what we learn.' },
          { id: 'education_effort', label: 'Effort', description: 'We value thoughtful practice and preparation, not only natural ability.', example: 'We give important work time and attention.' },
          { id: 'education_integrity', label: 'Academic Integrity', description: 'We use our own thinking and give credit to sources and helpers.', example: 'We cite information and use AI as support, not a replacement.' },
          { id: 'education_persistence', label: 'Persistence', description: 'We keep learning through difficulty and adjust the strategy when needed.', example: 'We ask for help, try another method, and return to the task.' },
          { id: 'education_teaching', label: 'Teaching', description: 'We share useful knowledge patiently and clearly.', example: 'We demonstrate steps and allow safe practice.' },
          { id: 'education_digital', label: 'Digital Responsibility', description: 'We use technology safely, privately, and purposefully.', example: 'We protect private information and verify important claims.' },
          { id: 'education_resourcefulness', label: 'Resourcefulness', description: 'We use available tools, people, and opportunities strategically.', example: 'We research free resources and ask trustworthy people for guidance.' }
        ]
      },
      Finances: {
        label: 'Finances',
        mission: [
          'We plan, communicate, save, and make thoughtful financial choices that protect household needs and future goals.',
          'We build financial knowledge by learning about budgeting, credit, taxes, benefits, fraud, and consumer rights.',
          'We use household resources responsibly and reduce waste without shaming people for having needs.',
          'We discuss general financial priorities honestly while protecting private account and identity information.',
          'We prepare for expected expenses, emergencies, education, opportunities, and long-term stability through small consistent actions.',
          'We compare information, pause before financial decisions, and seek trustworthy help when a choice is unfamiliar or high risk.'
        ],
        vision: [
          'We are building a financially informed household that can meet needs, manage change, and prepare for future opportunities.',
          'Our vision is a family that understands money, avoids preventable harm, and makes decisions based on priorities instead of pressure.',
          'We want a home where financial conversations are clear, respectful, age-appropriate, and connected to shared goals.',
          'We are becoming a household that saves consistently, uses credit carefully, researches major choices, and protects against fraud.',
          'Our home will use resources with purpose, reduce waste, and create more options for the next generation.',
          'We envision generations with stronger financial knowledge, greater stability, and the confidence to seek trustworthy guidance.'
        ],
        values: [
          { id: 'finances_stewardship', label: 'Stewardship', description: 'We use money, time, property, and supplies with care.', example: 'We reduce waste and maintain what we already have.' },
          { id: 'finances_planning', label: 'Planning', description: 'We think ahead about needs, obligations, changes, and goals.', example: 'We review upcoming expenses before they become emergencies.' },
          { id: 'finances_saving', label: 'Saving', description: 'We set aside resources for emergencies, opportunities, and future goals.', example: 'We save a realistic amount consistently.' },
          { id: 'finances_responsibility', label: 'Financial Responsibility', description: 'We understand commitments and take ownership of financial choices.', example: 'We ask questions before agreeing to costs or debt.' },
          { id: 'finances_patience', label: 'Patience', description: 'We avoid rushed decisions and allow time to compare options.', example: 'We pause before purchases and verify urgent requests.' },
          { id: 'finances_transparency', label: 'Clear Communication', description: 'We share appropriate financial information with the people affected by a decision.', example: 'We explain general priorities and changes without exposing private account data.' },
          { id: 'finances_knowledge', label: 'Financial Knowledge', description: 'We keep learning how financial systems and consumer protections work.', example: 'We use trustworthy sources to learn about credit, taxes, benefits, and fraud.' },
          { id: 'finances_generosity', label: 'Generosity with Wisdom', description: 'We help others in ways that are caring, safe, and sustainable.', example: 'We consider household needs and healthy limits before giving.' }
        ]
      },
      Goals: {
        label: 'Goals',
        mission: [
          'We turn important hopes into clear goals, small steps, realistic timelines, and regular progress reviews.',
          'We support one another with encouragement, accountability, resources, and honest conversations about barriers.',
          'We connect goals to our values and the five FamilyPD pillars instead of chasing success that harms wellbeing.',
          'We recognize progress, learn from setbacks, and adjust the plan without giving up on growth.',
          'We help each member identify opportunities, prepare carefully, and take responsible action toward a better future.',
          'We balance personal goals and household priorities so progress is shared, fair, and sustainable.'
        ],
        vision: [
          'We are building a purposeful household where members know what they are working toward and how to take the next step.',
          'Our vision is a family that follows through, learns from setbacks, celebrates progress, and keeps moving forward together.',
          'We want every member to believe growth is possible and to have support turning ideas into practical plans.',
          'We are becoming a household that uses goals to improve health, relationships, education, finances, and future opportunities.',
          'Our home will develop confident problem solvers who can plan, adapt, ask for help, and complete meaningful work.',
          'We envision generations who define success thoughtfully, act with purpose, and create opportunities for themselves and others.'
        ],
        values: [
          { id: 'goals_purpose', label: 'Purpose', description: 'We connect our actions to what matters most.', example: 'We explain why a goal matters before deciding how to pursue it.' },
          { id: 'goals_consistency', label: 'Consistency', description: 'We repeat useful actions and return after setbacks.', example: 'We follow a realistic routine instead of waiting for perfect motivation.' },
          { id: 'goals_accountability', label: 'Accountability', description: 'We take ownership, communicate honestly, and follow through.', example: 'We report progress and ask for support early.' },
          { id: 'goals_courage', label: 'Courage', description: 'We take responsible action even when growth feels uncomfortable.', example: 'We try, apply, practice, or ask a difficult question.' },
          { id: 'goals_progress', label: 'Progress', description: 'We notice improvement and completed steps, not only the final result.', example: 'We celebrate milestones and document what worked.' },
          { id: 'goals_adaptability', label: 'Adaptability', description: 'We change the strategy when new information or barriers appear.', example: 'We revise the timeline or next step without abandoning the purpose.' },
          { id: 'goals_discipline', label: 'Discipline', description: 'We make choices that support long-term priorities.', example: 'We complete the planned step before optional distractions.' },
          { id: 'goals_encouragement', label: 'Encouragement', description: 'We support effort, learning, and responsible risk-taking.', example: 'We recognize progress and help one another continue.' }
        ]
      }
    },
    es: {
      Health: {
        label: 'Salud',
        mission: [
          'Protegemos la salud mediante rutinas de descanso, higiene, movimiento, revisiones emocionales y seguridad.',
          'Cuidamos nuestros cuerpos y mentes al reconocer necesidades, pedir ayuda y tomar decisiones saludables juntos.',
          'Hacemos del bienestar una prioridad mediante preparación, rutinas equilibradas, comunicación honesta y apoyo.',
          'Enseñamos y practicamos hábitos que ayudan a cada miembro a sentirse seguro, descansado, confiado y cuidado.',
          'Reducimos el estrés prevenible al planificar, compartir responsabilidades y respetar límites saludables.',
          'Usamos información confiable y apoyo profesional apropiado para tomar decisiones informadas sobre salud y seguridad.'
        ],
        vision: [
          'Estamos construyendo un hogar seguro y saludable donde cada miembro recibe apoyo, descanso y espacio para crecer.',
          'Nuestra visión es un hogar donde el bienestar físico, emocional, mental y espiritual se protege y se conversa abiertamente.',
          'Queremos un hogar que se prepare antes de las emergencias, responda con calma y ayude a cada persona a sentirse segura.',
          'Nos estamos convirtiendo en una familia que elige hábitos saludables sostenibles en vez de esperar una crisis.',
          'Nuestro hogar será un lugar donde las personas puedan expresar lo que necesitan, recibir apoyo y tomar decisiones informadas.',
          'Visualizamos generaciones que comprenden su bienestar, se protegen y saben cuándo buscar ayuda calificada.'
        ],
        values: [
          { id: 'health_safety', label: 'Seguridad', description: 'Protegemos la seguridad física, emocional, digital y del hogar.', example: 'Nos preparamos, prestamos atención y hablamos sobre preocupaciones.' },
          { id: 'health_wellbeing', label: 'Bienestar', description: 'Tratamos la salud como base de las demás áreas de crecimiento.', example: 'Nos revisamos, descansamos y hacemos espacio para apoyo saludable.' },
          { id: 'health_balance', label: 'Equilibrio', description: 'Hacemos espacio para trabajo, descanso, relaciones, aprendizaje y recuperación.', example: 'Reconocemos la sobrecarga y ajustamos rutinas antes del agotamiento.' },
          { id: 'health_rest', label: 'Descanso', description: 'Respetamos la necesidad de dormir, recuperarnos y establecer límites.', example: 'Protegemos rutinas razonables de sueño y recuperación.' },
          { id: 'health_preparedness', label: 'Preparación', description: 'Pensamos con anticipación y practicamos antes de que ocurran problemas.', example: 'Revisamos planes generales de seguridad y materiales necesarios.' },
          { id: 'health_awareness', label: 'Autoconocimiento', description: 'Observamos cómo el cuerpo, pensamientos, emociones y decisiones nos afectan.', example: 'Hacemos una pausa, nombramos lo que sentimos y comunicamos lo que puede ayudar.' },
          { id: 'health_compassion', label: 'Compasión', description: 'Respondemos a las dificultades con cuidado en vez de vergüenza.', example: 'Ofrecemos apoyo y animamos a buscar ayuda apropiada.' },
          { id: 'health_habits', label: 'Hábitos saludables', description: 'Practicamos pequeñas rutinas que apoyan el bienestar a largo plazo.', example: 'Creamos constancia en higiene, movimiento, alimentación y descanso.' }
        ]
      },
      Relationships: {
        label: 'Relaciones',
        mission: [
          'Fortalecemos las relaciones mediante respeto, comunicación honesta, escucha, límites saludables y reparación.',
          'Creamos conexión al compartir tiempo significativo, responsabilidades y ánimo.',
          'Enfrentamos el conflicto sin insultos ni evasión y trabajamos por responsabilidad, comprensión y cambio.',
          'Protegemos la armonía al comunicarnos con claridad, tratar a las personas justamente y escuchar diferentes puntos de vista.',
          'Enseñamos a escuchar, disculparse, perdonar con sabiduría y reconstruir la confianza mediante acciones constantes.',
          'Apoyamos relaciones familiares y comunitarias fuertes, respetando la privacidad, seguridad y límites saludables.'
        ],
        vision: [
          'Estamos construyendo un hogar unido donde cada miembro se siente respetado, escuchado, apoyado y valorado.',
          'Nuestra visión es una familia que puede estar en desacuerdo sin destruir la confianza y reparar después de los errores.',
          'Queremos un hogar conocido por amabilidad, honestidad, lealtad, límites saludables y responsabilidad compartida.',
          'Nos estamos convirtiendo en un hogar donde la comunicación es clara, el aprecio es común y nadie lleva todo solo.',
          'Nuestro hogar será un lugar donde se pueda hablar con honestidad, escuchar con cuidado y recibir apoyo sin miedo ni vergüenza.',
          'Visualizamos generaciones que construyen relaciones saludables, reconocen patrones dañinos y eligen mejores caminos.'
        ],
        values: [
          { id: 'relationships_respect', label: 'Respeto', description: 'Tratamos a cada persona como alguien importante, incluso al estar en desacuerdo.', example: 'Escuchamos, evitamos insultos y usamos un tono tranquilo.' },
          { id: 'relationships_honesty', label: 'Honestidad', description: 'Decimos la verdad y corregimos información o errores.', example: 'Nos comunicamos con sinceridad aun cuando sea difícil.' },
          { id: 'relationships_kindness', label: 'Amabilidad', description: 'Nos importa cómo nuestras palabras y acciones afectan a otros.', example: 'Usamos palabras consideradas y ofrecemos ayuda.' },
          { id: 'relationships_listening', label: 'Escucha', description: 'Escuchamos para comprender, no solo para responder.', example: 'Hacemos preguntas y repetimos lo que entendimos.' },
          { id: 'relationships_loyalty', label: 'Lealtad', description: 'Protegemos el bienestar y la dignidad del hogar mientras hacemos lo correcto.', example: 'Nos apoyamos y no usamos dificultades privadas como entretenimiento.' },
          { id: 'relationships_boundaries', label: 'Límites saludables', description: 'Comunicamos límites razonables y respetamos la seguridad y autonomía de otros.', example: 'Expresamos lo que podemos hacer y lo que no podemos aceptar.' },
          { id: 'relationships_repair', label: 'Reparación', description: 'Asumimos responsabilidad y trabajamos para reconstruir la confianza.', example: 'Reconocemos el impacto, nos disculpamos y cambiamos la conducta.' },
          { id: 'relationships_cooperation', label: 'Cooperación', description: 'Trabajamos juntos por el beneficio del hogar.', example: 'Compartimos responsabilidades y resolvemos problemas como equipo.' }
        ]
      },
      Education: {
        label: 'Educación',
        mission: [
          'Seguimos aprendiendo dentro y fuera de la escuela al hacer preguntas, practicar habilidades y compartir conocimientos.',
          'Ayudamos a cada miembro a desarrollar conocimiento, confianza, credenciales, alfabetización digital y habilidades prácticas.',
          'Usamos recursos confiables, investigación cuidadosa y tecnología segura para tomar decisiones informadas.',
          'Enseñamos paso a paso, permitimos errores y apoyamos diferentes necesidades y puntos de partida.',
          'Conectamos la educación con carreras, oportunidades, solución de problemas, liderazgo y crecimiento del hogar.',
          'Tratamos el aprendizaje como responsabilidad compartida y creamos rutinas para practicar, leer y reflexionar.'
        ],
        vision: [
          'Estamos construyendo un hogar de aprendizaje donde curiosidad, esfuerzo, enseñanza y práctica forman parte de la vida diaria.',
          'Nuestra visión es una familia con conocimiento y confianza para comprender sistemas, buscar oportunidades y decidir con información.',
          'Queremos que cada miembro sepa que el aprendizaje no termina con la escuela y que las habilidades crecen a cualquier edad.',
          'Nos estamos convirtiendo en un hogar que usa tecnología responsablemente, verifica información y crea en vez de solo consumir.',
          'Nuestro hogar apoyará educación, credenciales, exploración de carreras, creatividad y valentía para pedir ayuda.',
          'Visualizamos generaciones que pueden aprender por sí mismas, enseñar a otros, adaptarse y usar el conocimiento para mejorar.'
        ],
        values: [
          { id: 'education_curiosity', label: 'Curiosidad', description: 'Hacemos preguntas y buscamos comprensión más profunda.', example: 'Exploramos cómo y por qué en vez de aceptar la primera respuesta.' },
          { id: 'education_learning', label: 'Aprendizaje', description: 'Seguimos desarrollando conocimientos y habilidades a cualquier edad.', example: 'Leemos, practicamos, investigamos y compartimos lo aprendido.' },
          { id: 'education_effort', label: 'Esfuerzo', description: 'Valoramos la práctica y preparación, no solamente la habilidad natural.', example: 'Damos tiempo y atención al trabajo importante.' },
          { id: 'education_integrity', label: 'Integridad académica', description: 'Usamos nuestro pensamiento y damos crédito a fuentes y ayuda.', example: 'Citamos información y usamos IA como apoyo, no como reemplazo.' },
          { id: 'education_persistence', label: 'Persistencia', description: 'Seguimos aprendiendo durante las dificultades y ajustamos la estrategia.', example: 'Pedimos ayuda, probamos otro método y regresamos a la tarea.' },
          { id: 'education_teaching', label: 'Enseñanza', description: 'Compartimos conocimiento útil con paciencia y claridad.', example: 'Demostramos pasos y permitimos práctica segura.' },
          { id: 'education_digital', label: 'Responsabilidad digital', description: 'Usamos tecnología con seguridad, privacidad y propósito.', example: 'Protegemos información privada y verificamos afirmaciones importantes.' },
          { id: 'education_resourcefulness', label: 'Ingenio', description: 'Usamos herramientas, personas y oportunidades disponibles de forma estratégica.', example: 'Investigamos recursos gratuitos y pedimos orientación confiable.' }
        ]
      },
      Finances: {
        label: 'Finanzas',
        mission: [
          'Planificamos, comunicamos, ahorramos y tomamos decisiones financieras que protegen necesidades y metas futuras.',
          'Desarrollamos conocimiento sobre presupuestos, crédito, impuestos, beneficios, fraude y derechos del consumidor.',
          'Usamos los recursos del hogar con responsabilidad y reducimos desperdicios sin avergonzar a las personas por sus necesidades.',
          'Conversamos honestamente sobre prioridades generales mientras protegemos información privada de cuentas e identidad.',
          'Nos preparamos para gastos, emergencias, educación, oportunidades y estabilidad mediante acciones pequeñas y constantes.',
          'Comparamos información, hacemos una pausa antes de decidir y buscamos ayuda confiable cuando una opción es desconocida o riesgosa.'
        ],
        vision: [
          'Estamos construyendo un hogar informado financieramente que puede cubrir necesidades, manejar cambios y prepararse para oportunidades.',
          'Nuestra visión es una familia que comprende el dinero, evita daños prevenibles y decide según prioridades en vez de presión.',
          'Queremos un hogar donde las conversaciones financieras sean claras, respetuosas, apropiadas para la edad y conectadas con metas.',
          'Nos estamos convirtiendo en un hogar que ahorra, usa el crédito con cuidado, investiga decisiones y se protege contra fraude.',
          'Nuestro hogar usará recursos con propósito, reducirá desperdicios y creará más opciones para la próxima generación.',
          'Visualizamos generaciones con más conocimiento financiero, estabilidad y confianza para buscar orientación confiable.'
        ],
        values: [
          { id: 'finances_stewardship', label: 'Administración responsable', description: 'Usamos dinero, tiempo, propiedad y materiales con cuidado.', example: 'Reducimos desperdicios y mantenemos lo que ya tenemos.' },
          { id: 'finances_planning', label: 'Planificación', description: 'Pensamos con anticipación sobre necesidades, obligaciones, cambios y metas.', example: 'Revisamos gastos próximos antes de que se conviertan en emergencias.' },
          { id: 'finances_saving', label: 'Ahorro', description: 'Reservamos recursos para emergencias, oportunidades y metas futuras.', example: 'Ahorramos una cantidad realista con constancia.' },
          { id: 'finances_responsibility', label: 'Responsabilidad financiera', description: 'Comprendemos compromisos y asumimos nuestras decisiones.', example: 'Hacemos preguntas antes de aceptar costos o deudas.' },
          { id: 'finances_patience', label: 'Paciencia', description: 'Evitamos decisiones apresuradas y damos tiempo para comparar opciones.', example: 'Hacemos una pausa antes de comprar y verificamos solicitudes urgentes.' },
          { id: 'finances_transparency', label: 'Comunicación clara', description: 'Compartimos información apropiada con las personas afectadas por una decisión.', example: 'Explicamos prioridades sin exponer datos privados de cuentas.' },
          { id: 'finances_knowledge', label: 'Conocimiento financiero', description: 'Seguimos aprendiendo cómo funcionan los sistemas y protecciones del consumidor.', example: 'Usamos fuentes confiables para aprender sobre crédito, impuestos, beneficios y fraude.' },
          { id: 'finances_generosity', label: 'Generosidad con sabiduría', description: 'Ayudamos de maneras cuidadosas, seguras y sostenibles.', example: 'Consideramos necesidades y límites saludables antes de dar.' }
        ]
      },
      Goals: {
        label: 'Metas',
        mission: [
          'Convertimos esperanzas importantes en metas claras, pasos pequeños, plazos realistas y revisiones regulares.',
          'Nos apoyamos con ánimo, responsabilidad, recursos y conversaciones honestas sobre barreras.',
          'Conectamos las metas con nuestros valores y los cinco pilares en vez de perseguir éxito que dañe el bienestar.',
          'Reconocemos el progreso, aprendemos de los obstáculos y ajustamos el plan sin abandonar el crecimiento.',
          'Ayudamos a cada miembro a identificar oportunidades, prepararse y actuar responsablemente hacia un mejor futuro.',
          'Equilibramos metas personales y prioridades del hogar para que el progreso sea compartido, justo y sostenible.'
        ],
        vision: [
          'Estamos construyendo un hogar con propósito donde los miembros saben qué buscan y cómo tomar el próximo paso.',
          'Nuestra visión es una familia que cumple, aprende de los obstáculos, celebra el progreso y sigue adelante unida.',
          'Queremos que cada miembro crea que el crecimiento es posible y reciba apoyo para convertir ideas en planes.',
          'Nos estamos convirtiendo en un hogar que usa metas para mejorar salud, relaciones, educación, finanzas y oportunidades.',
          'Nuestro hogar desarrollará personas seguras que planifican, se adaptan, piden ayuda y completan trabajo significativo.',
          'Visualizamos generaciones que definen el éxito con cuidado, actúan con propósito y crean oportunidades.'
        ],
        values: [
          { id: 'goals_purpose', label: 'Propósito', description: 'Conectamos nuestras acciones con lo que más importa.', example: 'Explicamos por qué una meta importa antes de decidir cómo lograrla.' },
          { id: 'goals_consistency', label: 'Constancia', description: 'Repetimos acciones útiles y regresamos después de los obstáculos.', example: 'Seguimos una rutina realista en vez de esperar motivación perfecta.' },
          { id: 'goals_accountability', label: 'Responsabilidad', description: 'Asumimos nuestras acciones, comunicamos con honestidad y cumplimos.', example: 'Informamos el progreso y pedimos apoyo a tiempo.' },
          { id: 'goals_courage', label: 'Valentía', description: 'Actuamos responsablemente aunque el crecimiento sea incómodo.', example: 'Intentamos, solicitamos, practicamos o hacemos una pregunta difícil.' },
          { id: 'goals_progress', label: 'Progreso', description: 'Reconocemos la mejora y los pasos completados, no solo el resultado final.', example: 'Celebramos logros y documentamos lo que funcionó.' },
          { id: 'goals_adaptability', label: 'Adaptabilidad', description: 'Cambiamos la estrategia cuando aparece nueva información o barreras.', example: 'Revisamos el plazo o próximo paso sin abandonar el propósito.' },
          { id: 'goals_discipline', label: 'Disciplina', description: 'Tomamos decisiones que apoyan prioridades a largo plazo.', example: 'Completamos el paso planificado antes de distracciones opcionales.' },
          { id: 'goals_encouragement', label: 'Ánimo', description: 'Apoyamos el esfuerzo, aprendizaje y riesgos responsables.', example: 'Reconocemos el progreso y ayudamos a continuar.' }
        ]
      }
    }
  };

  const ROLES = [
    role_(
      'household_lead', 'Household Lead', 'Líder del hogar',
      'Helps guide the overall FamilyPD process. This person does not have to do everything.',
      'Ayuda a guiar el proceso general de FamilyPD. Esta persona no tiene que hacerlo todo.',
      [
        'Help the household stay focused on its mission and values',
        'Invite members to participate and share ideas',
        'Review and publish approved shared information',
        'Help share responsibilities instead of carrying everything alone',
        'Protect privacy and ask for help when needed'
      ],
      [
        'Ayudar al hogar a mantenerse enfocado en su misión y sus valores',
        'Invitar a los miembros a participar y compartir ideas',
        'Revisar y publicar la información compartida que fue aprobada',
        'Ayudar a compartir responsabilidades en vez de hacerlo todo solo',
        'Proteger la privacidad y pedir ayuda cuando sea necesario'
      ],
      'Lead'
    ),
    role_(
      'co_lead', 'Co-Lead', 'Colíder',
      'Supports the Household Lead and can step in when needed.',
      'Apoya al Líder del hogar y puede asumir el liderazgo cuando sea necesario.',
      [
        'Help review household plans and shared information',
        'Help facilitate meetings or selected projects',
        'Support decisions agreed on by the household',
        'Follow up on action items',
        'Encourage members to participate'
      ],
      [
        'Ayudar a revisar los planes y la información compartida del hogar',
        'Ayudar a facilitar reuniones o proyectos seleccionados',
        'Apoyar las decisiones acordadas por el hogar',
        'Dar seguimiento a las acciones pendientes',
        'Animar a los miembros a participar'
      ],
      'Co-Lead'
    ),
    role_(
      'meeting_facilitator', 'Meeting Facilitator', 'Facilitador de reuniones',
      'Helps the household have organized, welcoming, and productive meetings.',
      'Ayuda al hogar a tener reuniones organizadas, acogedoras y productivas.',
      [
        'Help prepare the meeting agenda',
        'Welcome everyone and explain the purpose',
        'Make sure each person has a chance to participate',
        'Help the meeting stay focused and on time',
        'Review decisions and next steps'
      ],
      [
        'Ayudar a preparar la agenda de la reunión',
        'Dar la bienvenida y explicar el propósito',
        'Asegurar que cada persona tenga la oportunidad de participar',
        'Ayudar a que la reunión se mantenga enfocada y a tiempo',
        'Revisar las decisiones y los próximos pasos'
      ],
      'Member'
    ),
    role_(
      'goal_coordinator', 'Goal & Progress Coordinator', 'Coordinador de metas y progreso',
      'Helps the household remember goals, complete check-ins, and celebrate progress.',
      'Ayuda al hogar a recordar las metas, completar revisiones y celebrar el progreso.',
      [
        'Review agreed household goals',
        'Remind members about upcoming check-ins',
        'Ask what support is needed',
        'Record general progress without private details',
        'Celebrate completed steps and milestones'
      ],
      [
        'Revisar las metas acordadas del hogar',
        'Recordar a los miembros las próximas revisiones',
        'Preguntar qué apoyo se necesita',
        'Registrar el progreso general sin detalles privados',
        'Celebrar los pasos y logros completados'
      ],
      'Member'
    ),
    role_(
      'learning_coordinator', 'Learning Coordinator', 'Coordinador de aprendizaje',
      'Helps the household choose, understand, and discuss useful learning resources.',
      'Ayuda al hogar a elegir, entender y conversar sobre recursos útiles de aprendizaje.',
      [
        'Help choose learning topics',
        'Share approved videos, articles, or activities',
        'Check that research includes citations and References',
        'Prepare simple discussion questions',
        'Ask members what they learned and what action they will take'
      ],
      [
        'Ayudar a elegir temas de aprendizaje',
        'Compartir videos, artículos o actividades aprobadas',
        'Verificar que la investigación incluya citas y Referencias',
        'Preparar preguntas sencillas para conversar',
        'Preguntar qué aprendieron los miembros y qué acción tomarán'
      ],
      'Member'
    ),
    role_(
      'operations_coordinator', 'Household Operations Coordinator', 'Coordinador de operaciones del hogar',
      'Helps organize general household systems and shared responsibilities.',
      'Ayuda a organizar los sistemas generales y las responsabilidades compartidas del hogar.',
      [
        'Help make household responsibilities visible',
        'Review whether routines are working',
        'Help organize materials for agreed household systems',
        'Report when support or changes are needed',
        'Encourage fair sharing of work'
      ],
      [
        'Ayudar a que las responsabilidades del hogar sean visibles',
        'Revisar si las rutinas están funcionando',
        'Ayudar a organizar materiales para los sistemas acordados del hogar',
        'Avisar cuando se necesite apoyo o algún cambio',
        'Promover una distribución justa del trabajo'
      ],
      'Member'
    ),
    role_(
      'safety_coordinator', 'Safety Coordinator', 'Coordinador de seguridad',
      'Helps the household review general preparedness without storing sensitive information.',
      'Ayuda al hogar a revisar la preparación general sin guardar información sensible.',
      [
        'Help schedule safety discussions or practice',
        'Review general emergency procedures',
        'Check whether preparedness tasks are complete',
        'Remind members to keep private emergency information somewhere secure outside FamilyPD',
        'Identify topics that need more discussion'
      ],
      [
        'Ayudar a programar conversaciones o prácticas de seguridad',
        'Revisar los procedimientos generales de emergencia',
        'Verificar si las tareas de preparación están completas',
        'Recordar que la información privada de emergencia debe guardarse de forma segura fuera de FamilyPD',
        'Identificar temas que necesitan más conversación'
      ],
      'Member'
    ),
    role_(
      'family_member', 'Family Member', 'Miembro de la familia',
      'Participates, contributes ideas, completes agreed responsibilities, and may lead selected activities.',
      'Participa, aporta ideas, cumple responsabilidades acordadas y puede dirigir actividades seleccionadas.',
      [
        'Participate in meetings and discussions',
        'Complete agreed responsibilities',
        'Share ideas and suggestions',
        'Ask for help when needed',
        'Lead a meeting, activity, or topic when selected'
      ],
      [
        'Participar en reuniones y conversaciones',
        'Cumplir las responsabilidades acordadas',
        'Compartir ideas y sugerencias',
        'Pedir ayuda cuando sea necesario',
        'Dirigir una reunión, actividad o tema cuando sea seleccionado'
      ],
      'Member'
    ),
    role_(
      'custom', 'Custom Role', 'Rol personalizado',
      'Create a role that fits a responsibility unique to the household.',
      'Cree un rol que se adapte a una responsabilidad particular del hogar.',
      [],
      [],
      'Member'
    )
  ];

  const TUTORIAL = {
    en: [
      tutorial_('welcome', 'Welcome: choose one useful starting point', 'FamilyPD is a complete household-development workspace, but you do not need to complete everything at once. Begin with Household Identity, one goal, a quick meeting, or another immediate need. Save your progress and return later.'),
      tutorial_('workspace', 'Workspace setup and repair', 'Every account must create its own FamilyPD workspace before using the tools. FamilyPD checks its main folder and core files when the app opens. When a problem is detected, use the Repair Workspace button before continuing.'),
      tutorial_('identity', 'Household Identity: decide who you are becoming', 'Use the guided steps one section at a time. Start with dropdowns or examples, create editable mission and vision wording, choose values, assign roles, and publish only after the household approves the shared version.'),
      tutorial_('roles', 'Roles: make responsibility visible', 'Choose a general household-member label and a role template. FamilyPD explains the role and suggests editable responsibilities. Roles describe who coordinates a task; they do not share Google accounts or give one member control of another member’s workspace.'),
      tutorial_('goals', 'Goals: turn a priority into small actions', 'Choose a household or personal goal, select a FamilyPD pillar and starter idea, then edit the wording. Add small steps and use checkpoints to record progress, barriers, support needs, and the next action.'),
      tutorial_('meetings', 'Meetings: prepare, discuss, decide, and follow through', 'Use Quick Meeting for a short check-in or the Full Planner for a detailed agenda. Select prewritten topics, questions, openings, and next-action prompts. Save decisions and responsibilities so the meeting leads to action.'),
      tutorial_('learning', 'Learning: understand and practice useful skills', 'Choose a topic, format, difficulty, and starter objective. Add trustworthy sources, discussion questions, practice steps, reflection, and one action the household or member can apply.'),
      tutorial_('opportunities', 'Opportunities: understand mobility and act on reliable information', 'Follow the page one step at a time: learn what socioeconomic mobility means, open official starting points, check the exact public link, create an editable action plan, and review saved opportunities and deadlines.'),
      tutorial_('systems', 'Systems and safety: reduce repeated confusion', 'Choose a policy, routine, checklist, or general safety-plan template. Edit the steps, assign a general role, and choose a review date. Keep private emergency contacts, addresses, medical details, and account information outside FamilyPD.'),
      tutorial_('sharing', 'Family Sharing: move approved information between accounts', 'A Household Lead creates a signed Family Sharing File containing approved shared information. A Family Member imports that file into their own workspace. Personal goals, reflections, notes, and private plans are not included.'),
      tutorial_('accessibility', 'Reading and writing support: use help beside any field', 'Choose the Choices button to hear what a question means, review definitions for dropdown choices, select editable examples, or hear the current answer. Read aloud can be stopped at any time. Voice typing and browser spellcheck can also reduce writing demands.'),
      tutorial_('privacy', 'Privacy: plan without collecting sensitive details', 'Use general labels and public links. Do not enter passwords, account numbers, exact addresses, identification numbers, medical records, school records, or confidential application documents.'),
      tutorial_('help', 'Help: open the exact feature you need', 'The Help page provides feature guides and an interactive tutorial. Use Open this feature to move directly to the related section, then use Choices beside a field for question-level support.')
    ],
    es: [
      tutorial_('welcome', 'Bienvenido: elija un punto de partida útil', 'FamilyPD es un espacio completo para el desarrollo del hogar, pero no necesita completar todo a la vez. Comience con Identidad del hogar, una meta, una reunión rápida u otra necesidad inmediata. Guarde el progreso y continúe después.'),
      tutorial_('workspace', 'Configuración y reparación del espacio', 'Cada cuenta debe crear su propio espacio FamilyPD antes de usar las herramientas. FamilyPD revisa la carpeta principal y los archivos esenciales al abrir la aplicación. Cuando detecte un problema, use Reparar espacio antes de continuar.'),
      tutorial_('identity', 'Identidad del hogar: decidan en qué se están convirtiendo', 'Siga los pasos guiados, una sección a la vez. Comience con menús o ejemplos, cree palabras editables para misión y visión, elija valores, asigne roles y publique solamente después de que el hogar apruebe la versión compartida.'),
      tutorial_('roles', 'Roles: hagan visibles las responsabilidades', 'Elija una etiqueta general para el miembro y una plantilla de rol. FamilyPD explica el rol y sugiere responsabilidades editables. Los roles describen quién coordina una tarea; no comparten cuentas de Google ni dan control sobre el espacio de otra persona.'),
      tutorial_('goals', 'Metas: convierta una prioridad en acciones pequeñas', 'Elija una meta del hogar o personal, un pilar de FamilyPD y una idea inicial. Edite las palabras, agregue pasos pequeños y use revisiones para registrar progreso, barreras, apoyo y la próxima acción.'),
      tutorial_('meetings', 'Reuniones: preparar, conversar, decidir y cumplir', 'Use Reunión rápida para una revisión corta o el Planificador completo para una agenda detallada. Seleccione temas, preguntas, aperturas y sugerencias de acciones. Guarde decisiones y responsabilidades para convertir la conversación en acción.'),
      tutorial_('learning', 'Aprendizaje: comprender y practicar habilidades útiles', 'Elija un tema, formato, dificultad y objetivo inicial. Agregue fuentes confiables, preguntas, práctica, reflexión y una acción que el hogar o miembro pueda aplicar.'),
      tutorial_('opportunities', 'Oportunidades: comprender la movilidad y actuar con información confiable', 'Siga la página paso a paso: aprenda qué significa movilidad socioeconómica, abra puntos de partida oficiales, revise el enlace público exacto, cree un plan editable y revise oportunidades y fechas guardadas.'),
      tutorial_('systems', 'Sistemas y seguridad: reduzcan la confusión repetida', 'Elija una plantilla de política, rutina, lista o plan general de seguridad. Edite los pasos, asigne un rol general y elija una fecha de revisión. Mantenga contactos privados, direcciones, datos médicos y cuentas fuera de FamilyPD.'),
      tutorial_('sharing', 'Compartir con la familia: transfiera información aprobada', 'El Líder del hogar crea un Archivo para compartir firmado con información aprobada. Un Miembro de la familia importa ese archivo en su propio espacio. No se incluyen metas personales, reflexiones, notas ni planes privados.'),
      tutorial_('accessibility', 'Apoyo para leer y escribir: use ayuda junto a cualquier campo', 'Elija Opciones para escuchar qué significa una pregunta, revisar definiciones de las opciones, seleccionar ejemplos editables o escuchar la respuesta actual. Puede detener la lectura en cualquier momento. El dictado y corrector del navegador también ayudan.'),
      tutorial_('privacy', 'Privacidad: planifique sin recopilar detalles sensibles', 'Use etiquetas generales y enlaces públicos. No ingrese contraseñas, números de cuenta, direcciones exactas, identificación, expedientes médicos, registros escolares ni documentos confidenciales.'),
      tutorial_('help', 'Ayuda: abra la función exacta que necesita', 'La página de Ayuda incluye guías e instrucciones interactivas. Use Abrir esta función para ir directamente a la sección y después use Opciones junto a un campo para recibir apoyo específico.')
    ]
  };

  const UI = {
    en: {
      languageName: 'English',
      help: 'Help & Tutorials',
      overview: 'Overview',
      identity: 'Household Identity',
      householdInformation: 'Household Information',
      rolesProfile: 'Roles & Profile',
      myProfile: 'My Profile',
      updatePacks: 'Family Sharing',
      workspace: 'Workspace',
      guidedBuilder: 'Guided Identity Builder',
      valuesLibrary: 'Values Library',
      roleBuilder: 'Guided Role Builder',
      readAloud: 'Read instructions aloud',
      stopReading: 'Stop reading',
      simpleLanguage: 'Simple language',
      largeText: 'Larger text',
      save: 'Save',
      useThis: 'Use this wording',
      addValue: 'Add this value',
      added: 'Added',
      copyPrompt: 'Copy prompt',
      promptCopied: 'Prompt copied.',
      restartTutorial: 'Restart tutorial'
    },
    es: {
      languageName: 'Español',
      help: 'Ayuda y tutoriales',
      overview: 'Resumen',
      identity: 'Identidad del hogar',
      householdInformation: 'Información del hogar',
      rolesProfile: 'Roles y perfil',
      myProfile: 'Mi perfil',
      updatePacks: 'Compartir con la familia',
      workspace: 'Espacio de trabajo',
      guidedBuilder: 'Creador guiado de identidad',
      valuesLibrary: 'Biblioteca de valores',
      roleBuilder: 'Creador guiado de roles',
      readAloud: 'Leer las instrucciones en voz alta',
      stopReading: 'Detener la lectura',
      simpleLanguage: 'Lenguaje sencillo',
      largeText: 'Texto más grande',
      save: 'Guardar',
      useThis: 'Usar estas palabras',
      addValue: 'Agregar este valor',
      added: 'Agregado',
      copyPrompt: 'Copiar sugerencia',
      promptCopied: 'Sugerencia copiada.',
      restartTutorial: 'Reiniciar tutorial'
    }
  };

  const AI_HELP = {
    en: {
      title: 'Need more ideas? Use an AI tool safely.',
      warning: 'Do not include names, addresses, account information, medical details, school records, passwords, or other private information.',
      steps: [
        'Open a new browser tab.',
        'Open an AI tool you trust.',
        'Copy the prompt below.',
        'Paste it into the message box and submit it.',
        'Review the response. Keep only ideas that fit the household and correct anything that is inaccurate.'
      ],
      prompt:
        'Help me write three short household mission statement ideas.\n\n' +
        'Our household wants to focus on:\n' +
        '- respect\n- communication\n- learning\n- supporting one another\n\n' +
        'Use simple language. Do not ask for names, addresses, or private information.'
    },
    es: {
      title: '¿Necesita más ideas? Use una herramienta de IA de forma segura.',
      warning: 'No incluya nombres, direcciones, información de cuentas, detalles médicos, expedientes escolares, contraseñas ni otra información privada.',
      steps: [
        'Abra una nueva pestaña del navegador.',
        'Abra una herramienta de IA en la que confíe.',
        'Copie la sugerencia de abajo.',
        'Péguela en el cuadro de mensaje y envíela.',
        'Revise la respuesta. Conserve solamente las ideas que representen al hogar y corrija cualquier información incorrecta.'
      ],
      prompt:
        'Ayúdame a escribir tres ideas cortas para una misión del hogar.\n\n' +
        'Nuestro hogar quiere enfocarse en:\n' +
        '- respeto\n- comunicación\n- aprendizaje\n- apoyarnos unos a otros\n\n' +
        'Usa lenguaje sencillo. No pidas nombres, direcciones ni información privada.'
    }
  };


  function getGuidanceData(language) {
    const lang = normalizeLanguage_(language);

    return {
      language: lang,
      supportedLanguages: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' }
      ],
      ui: fpdClone_(UI[lang]),
      builder: fpdClone_(BUILDER[lang]),
      values: VALUES.map(function(item) {
        return localizeValue_(item, lang);
      }),
      pillarIdentity: fpdClone_(PILLAR_IDENTITY[lang]),
      roles: ROLES.map(function(item) {
        return localizeRole_(item, lang);
      }),
      tutorial: fpdClone_(TUTORIAL[lang]),
      aiHelp: fpdClone_(AI_HELP[lang]),
      book: {
        title: FPD_CONFIG.GUIDEBOOK.TITLE,
        author: FPD_CONFIG.GUIDEBOOK.AUTHOR,
        formats: FPD_CONFIG.GUIDEBOOK.FORMATS,
        url: FPD_CONFIG.GUIDEBOOK_URL,
        inTextCitation: '(Hall, 2025, pp. 17–20, 97–98)'
      }
    };
  }


  function generateIdentitySuggestions(payload) {
    const lang = normalizeLanguage_(payload && payload.language);
    const data = BUILDER[lang];
    const feeling = findPhrase_(data.feelings, payload && payload.feeling);
    const treatment = findPhrase_(data.treatment, payload && payload.treatment);
    const focus = findPhrase_(data.focus, payload && payload.focus);
    const future = findPhrase_(data.future, payload && payload.future);
    const practice = findPhrase_(data.practices, payload && payload.practice);

    if (!feeling || !treatment || !focus || !future || !practice) {
      throw new Error(
        lang === 'es'
          ? 'Seleccione una opción en cada lista antes de crear sugerencias.'
          : 'Choose one option from each list before generating suggestions.'
      );
    }

    if (lang === 'es') {
      return {
        success: true,
        language: lang,
        visionOptions: [
          'Estamos construyendo un hogar ' + future + ' donde las personas se sienten en un ambiente ' + feeling + ', se tratan con ' + treatment + ' y crecen juntas por medio de ' + focus + '.',
          'Nuestra visión es tener un hogar ' + feeling + ' y ' + future + ' que apoye ' + focus + ' y ayude a cada miembro a seguir adelante.',
          'Queremos ser un hogar reconocido por ' + treatment + ', un ambiente ' + feeling + ' y un progreso constante en ' + focus + '.'
        ],
        missionOptions: [
          'Nos comprometemos a ' + practice + ', tratarnos con ' + treatment + ' y dar pasos pequeños hacia ' + focus + '.',
          'Nuestro hogar trabaja en equipo por medio de ' + practice + ', la responsabilidad compartida y el apoyo al crecimiento de cada miembro.',
          'Apoyamos nuestra visión mediante ' + practice + ', la comunicación honesta y la acción constante.'
        ],
        mottoOptions: [
          'Crecemos juntos, un paso a la vez.',
          'Nuestro hogar, nuestro equipo, nuestro progreso.',
          'Actuamos con propósito y nos apoyamos.'
        ]
      };
    }

    return {
      success: true,
      language: lang,
      visionOptions: [
        'We are building a ' + future + ' household where people feel ' + feeling + ', treat one another with ' + treatment + ', and grow together through ' + focus + '.',
        'Our vision is a ' + feeling + ' and ' + future + ' household that supports ' + focus + ' and helps every member move forward.',
        'We want a home known for ' + treatment + ', a ' + feeling + ' environment, and steady progress in ' + focus + '.'
      ],
      missionOptions: [
        'We practice ' + practice + ', treat one another with ' + treatment + ', and take small steps toward ' + focus + '.',
        'Our household works together by ' + practice + ', sharing responsibilities, and helping each member grow.',
        'We support our vision through ' + practice + ', honest communication, and consistent action.'
      ],
      mottoOptions: [
        'Growing together, one step at a time.',
        'Our household, our team, our progress.',
        'We act with purpose and support one another.'
      ]
    };
  }


  function normalizeLanguage_(language) {
    const clean = String(language || '').toLowerCase().substring(0, 2);
    return LANGUAGES.indexOf(clean) !== -1 ? clean : 'en';
  }


  function findPhrase_(options, id) {
    const match = (options || []).find(function(item) {
      return item.id === String(id || '');
    });
    return match ? match.phrase : '';
  }


  function option_(id, label, phrase) {
    return { id: id, label: label, phrase: phrase };
  }


  function value_(id, enLabel, enDescription, enExample, esLabel, esDescription, esExample) {
    return {
      id: id,
      en: { label: enLabel, description: enDescription, example: enExample },
      es: { label: esLabel, description: esDescription, example: esExample }
    };
  }


  function role_(id, enLabel, esLabel, enDescription, esDescription, enResponsibilities, esResponsibilities, permissionLabel) {
    return {
      id: id,
      storageLabel: enLabel,
      permissionLabel: permissionLabel,
      en: {
        label: enLabel,
        description: enDescription,
        responsibilities: enResponsibilities
      },
      es: {
        label: esLabel,
        description: esDescription,
        responsibilities: esResponsibilities
      }
    };
  }


  function tutorial_(id, title, body) {
    return { id: id, title: title, body: body };
  }


  function localizeValue_(item, language) {
    return {
      id: item.id,
      label: item[language].label,
      description: item[language].description,
      example: item[language].example
    };
  }


  function localizeRole_(item, language) {
    return {
      id: item.id,
      storageLabel: item.storageLabel,
      permissionLabel: item.permissionLabel,
      label: item[language].label,
      description: item[language].description,
      responsibilities: fpdClone_(item[language].responsibilities)
    };
  }


  return {
    getGuidanceData: getGuidanceData,
    generateIdentitySuggestions: generateIdentitySuggestions,
    normalizeLanguage: normalizeLanguage_
  };
})();
