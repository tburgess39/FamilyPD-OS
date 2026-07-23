/**
 * Guided household policies, repeatable systems, checklists, and general
 * safety plans.
 *
 * This service intentionally excludes exact emergency contacts, addresses,
 * medical records, account information, passwords, and identification data.
 */

const FPDSystemsServiceV8 = (function() {

  const TEMPLATE_LIBRARY = {
    en: {
      Health: [
        template_(
          'health_wellness_checkin',
          'System',
          'Wellness Check-In System',
          'Create a short, repeatable way to notice general wellbeing needs and offer support.',
          'We use respectful check-ins to notice general health, stress, rest, and support needs without recording diagnoses or confidential details.',
          [
            'Choose a regular time for a brief check-in.',
            'Ask how each person is doing in general.',
            'Ask whether anyone needs rest, encouragement, supplies, an appointment reminder, or help contacting an appropriate professional.',
            'Agree on one realistic support action.',
            'Review whether the check-in feels respectful and useful.'
          ],
          'Household Lead',
          'Weekly'
        ),
        template_(
          'health_rest_policy',
          'Policy',
          'Rest and Sleep Support Policy',
          'Protect reasonable rest and reduce household habits that regularly interfere with sleep.',
          'We respect agreed quiet times, prepare for the next day, and avoid unnecessary disruptions during rest periods.',
          [
            'Agree on general quiet hours.',
            'Prepare important items before the rest period begins.',
            'Use headphones or lower volume when others are resting.',
            'Communicate respectfully when schedules require an exception.',
            'Review the policy when household schedules change.'
          ],
          'Household Operations Coordinator',
          'Monthly'
        ),
        template_(
          'health_hygiene_routine',
          'Checklist',
          'Household Hygiene and Clean-Space Checklist',
          'Make routine hygiene and shared-space care easier to remember and teach.',
          'We use a simple checklist to support personal hygiene, clean shared spaces, and respectful reminders.',
          [
            'Review personal hygiene routines appropriate to each member.',
            'Make needed supplies easy to find when possible.',
            'Clean up personal items after use.',
            'Complete agreed shared-space tasks.',
            'Use respectful reminders instead of humiliation.',
            'Review the checklist and teach any unclear steps.'
          ],
          'Household Operations Coordinator',
          'Weekly'
        ),
        template_(
          'health_emergency_supplies',
          'Safety Plan',
          'General Emergency Supply Review',
          'Review general preparedness supplies without storing exact locations, account information, or private medical details in FamilyPD.',
          'We periodically review whether the household has appropriate general emergency supplies and whether members understand where official private information is stored outside FamilyPD.',
          [
            'Review general water, food, lighting, charging, first-aid, and sanitation needs.',
            'Check expiration dates and replace unusable items.',
            'Confirm that private emergency contacts and medical details are stored securely outside FamilyPD.',
            'Identify any missing general supplies.',
            'Assign one general role to follow up.',
            'Schedule the next review.'
          ],
          'Safety Coordinator',
          'Every 6 months',
          'Important'
        ),
        template_(
          'health_fire_review',
          'Safety Plan',
          'Fire and Smoke-Alarm Readiness Review',
          'Practice general fire-safety awareness and confirm that household equipment is reviewed appropriately.',
          'We review general fire-safety practices, discuss exits without storing exact address details, and follow manufacturer or local safety guidance for alarms and equipment.',
          [
            'Review what to do when smoke or fire is noticed.',
            'Discuss more than one general way to leave common areas when possible.',
            'Review safe gathering and accountability practices without entering exact locations in FamilyPD.',
            'Check alarms or equipment according to manufacturer and local guidance.',
            'Practice a calm response appropriate to household members.',
            'Record only the general review date and next review date.'
          ],
          'Safety Coordinator',
          'Every 6 months',
          'High priority'
        )
      ],
      Relationships: [
        template_(
          'relationships_respect_policy',
          'Policy',
          'Respectful Communication Policy',
          'Create clear expectations for how members speak and listen during everyday conversations and conflict.',
          'We communicate without insults, threats, humiliation, or intentional cruelty. We listen, pause when needed, and return to important conversations respectfully.',
          [
            'Let each person finish speaking when it is safe to do so.',
            'Describe the behavior or concern without attacking the person.',
            'Use a pause when emotions are too high for a productive conversation.',
            'Return to the conversation at an agreed time.',
            'Acknowledge harm and identify what should change.'
          ],
          'Meeting Facilitator',
          'Monthly'
        ),
        template_(
          'relationships_repair_system',
          'System',
          'Conflict Repair System',
          'Give the household a repeatable process for repairing everyday conflict.',
          'We repair conflict by calming down, listening, acknowledging impact, apologizing when appropriate, and agreeing on changed behavior.',
          [
            'Pause and make sure everyone can participate safely.',
            'Let each person explain what happened from their perspective.',
            'Name the impact without debating every feeling.',
            'Identify responsibility and offer a specific apology when appropriate.',
            'Agree on one changed action or boundary.',
            'Check back later to see whether repair occurred.'
          ],
          'Co-Lead',
          'As needed'
        ),
        template_(
          'relationships_appreciation',
          'System',
          'Appreciation and Encouragement Check-In',
          'Make positive recognition a normal part of household communication.',
          'We regularly notice effort, growth, helpful actions, and qualities we appreciate in one another.',
          [
            'Choose a regular meeting or meal for the check-in.',
            'Invite each member to name one appreciation or encouragement.',
            'Keep statements specific and sincere.',
            'Include effort and improvement, not only major achievements.',
            'Notice whether any member is regularly overlooked.'
          ],
          'Family Member',
          'Weekly'
        ),
        template_(
          'relationships_boundaries',
          'Policy',
          'Boundaries and Personal-Space Agreement',
          'Clarify respectful expectations around privacy, belongings, time, and personal limits.',
          'We ask before using another person’s belongings, respect reasonable privacy and quiet needs, and communicate boundaries without controlling or humiliating others.',
          [
            'Discuss which shared and personal items require permission.',
            'Identify general privacy and quiet expectations.',
            'Practice a respectful boundary statement.',
            'Clarify what to do when a boundary is ignored.',
            'Review expectations when ages, rooms, schedules, or needs change.'
          ],
          'Household Lead',
          'Quarterly'
        ),
        template_(
          'relationships_help_seeking',
          'Safety Plan',
          'General Help-Seeking Plan',
          'Help members recognize when a concern needs support beyond the immediate household.',
          'We take serious safety, health, abuse, crisis, or wellbeing concerns seriously and seek appropriate trusted or professional support. Exact contacts remain stored securely outside FamilyPD.',
          [
            'Discuss general signs that a concern is urgent or beyond the household’s ability to handle alone.',
            'Identify types of trusted adults, professionals, services, or authorities that may be appropriate.',
            'Practice saying clearly that help is needed.',
            'Remind members not to promise secrecy when someone may be unsafe.',
            'Confirm that current private contact information is stored outside FamilyPD.',
            'Review the plan without recording confidential situations.'
          ],
          'Safety Coordinator',
          'Quarterly',
          'High priority'
        )
      ],
      Education: [
        template_(
          'education_weekly_checkin',
          'System',
          'Weekly Learning Check-In',
          'Create a short routine for reviewing learning, deadlines, needs, and progress.',
          'We check in regularly about learning, ask what support is needed, and focus on next actions instead of shame.',
          [
            'Review upcoming general deadlines or learning commitments.',
            'Ask what is going well.',
            'Ask what feels confusing or difficult.',
            'Choose one support action or next step.',
            'Update the shared calendar when appropriate.',
            'Celebrate effort and completed work.'
          ],
          'Learning Coordinator',
          'Weekly'
        ),
        template_(
          'education_study_system',
          'System',
          'Study and Practice System',
          'Make focused learning easier to begin and repeat.',
          'We use a consistent study process that includes preparation, focused work, short breaks, practice, and review.',
          [
            'Choose a reasonable time and place for focused work.',
            'Gather needed materials before beginning.',
            'Break the task into smaller parts.',
            'Use active practice such as explaining, recalling, solving, or demonstrating.',
            'Take an appropriate break.',
            'Review what was completed and identify the next step.'
          ],
          'Learning Coordinator',
          'Weekly'
        ),
        template_(
          'education_ai_policy',
          'Policy',
          'Responsible Technology and AI Use Policy',
          'Support useful technology use while protecting privacy, honesty, learning, and safety.',
          'We use technology and AI to explain, practice, organize, and create—not to replace our thinking, misrepresent our work, or expose private information.',
          [
            'Do not enter private household, school, medical, account, or identification information.',
            'Review AI-generated information for mistakes.',
            'Use trustworthy sources to verify important claims.',
            'Follow school, work, and platform rules.',
            'Identify when AI or another tool helped create work.',
            'Ask for help when a request or website feels unsafe.'
          ],
          'Learning Coordinator',
          'Quarterly'
        ),
        template_(
          'education_career_checklist',
          'Checklist',
          'Career, Training, or Credential Research Checklist',
          'Help members compare opportunities using reliable information.',
          'We research the actual work, requirements, cost, time, outcomes, and source before committing to a program or credential.',
          [
            'Identify the occupation, skill, credential, or program.',
            'Use an official source when available.',
            'Review entry requirements and total estimated cost.',
            'Review time commitment and completion expectations.',
            'Look for employment, licensing, or transfer information when relevant.',
            'Write one next step and one question that still needs an answer.'
          ],
          'Learning Coordinator',
          'As needed'
        ),
        template_(
          'education_online_safety',
          'Safety Plan',
          'Online Privacy and Scam-Response Plan',
          'Build a general response for suspicious messages, websites, requests, and account activity.',
          'We pause before clicking, sharing, downloading, paying, or entering information. We verify requests independently and report suspicious activity appropriately.',
          [
            'Pause when a message creates urgency, fear, secrecy, or pressure.',
            'Do not use the message’s link or contact information to verify the request.',
            'Check the sender, domain, spelling, and request.',
            'Use a known official website or trusted contact method.',
            'Do not share passwords, codes, account details, or identification information.',
            'Ask a trusted person for help and report the issue when appropriate.'
          ],
          'Safety Coordinator',
          'Quarterly',
          'High priority'
        )
      ],
      Finances: [
        template_(
          'finances_monthly_review',
          'System',
          'Monthly Household Money Review',
          'Create a calm, general routine for reviewing upcoming needs, priorities, and progress.',
          'We review general income changes, upcoming obligations, spending priorities, and goals without storing account numbers or exact login information in FamilyPD.',
          [
            'Review upcoming general obligations and changes.',
            'Identify any category that may need adjustment.',
            'Review progress toward one current financial goal.',
            'Discuss one decision that requires household input.',
            'Assign a general follow-up role.',
            'Keep private account details in a secure financial system outside FamilyPD.'
          ],
          'Household Lead',
          'Monthly'
        ),
        template_(
          'finances_purchase_policy',
          'Policy',
          'Shared Purchase Discussion Policy',
          'Clarify when a purchase or commitment should be discussed before action is taken.',
          'We discuss shared purchases, contracts, subscriptions, loans, or commitments above the household’s agreed threshold before completing them.',
          [
            'Clarify which decisions require discussion.',
            'Review the need, total cost, ongoing cost, and alternatives.',
            'Check cancellation, return, warranty, or contract terms.',
            'Allow reasonable time for questions.',
            'Record only the decision and general follow-up—not account or payment details.'
          ],
          'Household Lead',
          'Quarterly'
        ),
        template_(
          'finances_bill_checklist',
          'Checklist',
          'Bill and Due-Date Review Checklist',
          'Reduce missed obligations through a general review routine.',
          'We use a secure financial calendar or tool outside FamilyPD for exact account details and use this checklist to confirm that general review steps occurred.',
          [
            'Review upcoming due dates in the secure financial system.',
            'Confirm who is responsible for each follow-up.',
            'Identify any expected shortfall or change early.',
            'Contact the appropriate provider or support resource when needed.',
            'Confirm completion without storing account numbers in FamilyPD.'
          ],
          'Household Lead',
          'Monthly'
        ),
        template_(
          'finances_scam_plan',
          'Safety Plan',
          'Financial Scam Pause-and-Verify Plan',
          'Create a shared response to suspicious financial requests.',
          'We do not send money, gift cards, codes, account information, or identification information because of unexpected urgency or pressure. We pause and verify independently.',
          [
            'Stop and do not act immediately.',
            'Do not call the number or click the link in the suspicious message.',
            'Verify through an official website, known phone number, or trusted person.',
            'Review whether the request uses urgency, secrecy, threats, or unusual payment methods.',
            'Protect accounts using official security steps when needed.',
            'Report suspected fraud to the appropriate organization or authority.'
          ],
          'Safety Coordinator',
          'Quarterly',
          'High priority'
        ),
        template_(
          'finances_documents_system',
          'System',
          'Important Financial Document Review System',
          'Maintain a general review rhythm for important documents without uploading sensitive documents to FamilyPD.',
          'We periodically review whether important financial and protection documents are current and securely stored outside FamilyPD.',
          [
            'Review which document categories apply to the household.',
            'Confirm that current documents are stored securely.',
            'Identify expired, missing, or outdated items.',
            'Assign a general follow-up role.',
            'Set the next review date.',
            'Do not place document numbers or copies in FamilyPD.'
          ],
          'Household Lead',
          'Yearly'
        )
      ],
      Goals: [
        template_(
          'goals_weekly_checkpoint',
          'System',
          'Weekly Goal Checkpoint System',
          'Keep important goals visible through a short, supportive review.',
          'We review current goals, identify progress and barriers, and choose one realistic next action.',
          [
            'Choose one current goal to review.',
            'Name progress since the last check-in.',
            'Identify one barrier or support need.',
            'Choose the next small action.',
            'Assign a general role or person label when appropriate.',
            'Celebrate effort and completed steps.'
          ],
          'Goal & Progress Coordinator',
          'Weekly'
        ),
        template_(
          'goals_monthly_review',
          'System',
          'Monthly Household Priority Review',
          'Help the household focus on a few priorities instead of reacting to everything at once.',
          'We review current priorities, decide what still matters, and adjust plans to fit the household’s current season and capacity.',
          [
            'Review active household priorities.',
            'Identify what is working.',
            'Identify what is delayed, blocked, or no longer important.',
            'Choose which priorities continue.',
            'Adjust steps, support, or timing.',
            'Record the next review date.'
          ],
          'Goal & Progress Coordinator',
          'Monthly'
        ),
        template_(
          'goals_support_policy',
          'Policy',
          'Goal Support and Accountability Policy',
          'Set expectations for encouraging progress without controlling or shaming members.',
          'We ask what support is wanted, use respectful reminders, protect personal ownership of goals, and avoid ridicule when plans need adjustment.',
          [
            'Ask the goal owner what support would be useful.',
            'Agree on a reasonable check-in rhythm.',
            'Use reminders without harassment or humiliation.',
            'Discuss barriers and adjustments honestly.',
            'Respect the difference between a household goal and a private personal goal.'
          ],
          'Goal & Progress Coordinator',
          'Quarterly'
        ),
        template_(
          'goals_celebration',
          'System',
          'Milestone Recognition System',
          'Create a fair way to notice progress and completed milestones.',
          'We recognize meaningful effort, improvement, helpful choices, and completed milestones in ways that fit the household’s resources.',
          [
            'Define the milestone or progress being recognized.',
            'Choose an appropriate form of recognition.',
            'Include effort, learning, or consistency—not only final outcomes.',
            'Avoid comparisons that embarrass another member.',
            'Record the lesson or next step when useful.'
          ],
          'Family Member',
          'Monthly'
        ),
        template_(
          'goals_deadline_checklist',
          'Checklist',
          'Deadline Readiness Checklist',
          'Reduce last-minute stress for important household, school, work, or goal deadlines.',
          'We begin early enough to identify requirements, materials, support, and next actions.',
          [
            'Confirm the deadline and expected result.',
            'List the major requirements.',
            'Break the work into smaller actions.',
            'Identify materials, information, or support needed.',
            'Schedule an early review before the final deadline.',
            'Confirm submission, attendance, or completion as appropriate.'
          ],
          'Goal & Progress Coordinator',
          'As needed'
        )
      ],
      Organization: [
        template_(
          'organization_responsibility_rotation',
          'System',
          'Responsibility Rotation System',
          'Make household work visible, teach the steps, and share responsibilities more fairly.',
          'We assign general household responsibilities clearly, teach what completion looks like, and review whether the workload is fair and realistic.',
          [
            'List the recurring responsibility.',
            'Explain or demonstrate the expected steps.',
            'Assign a general member or role label.',
            'Clarify the schedule or trigger.',
            'Provide support while the responsibility is being learned.',
            'Review completion and adjust fairly.'
          ],
          'Household Operations Coordinator',
          'Weekly'
        ),
        template_(
          'organization_meeting_system',
          'System',
          'Regular Household Meeting System',
          'Create a predictable way to share information, discuss priorities, and make decisions.',
          'We hold brief, organized meetings at a rhythm that fits the household and use agendas, respectful participation, decisions, and next actions.',
          [
            'Choose a regular meeting rhythm.',
            'Collect a small number of useful topics.',
            'Choose a facilitator.',
            'Share important updates and allow questions.',
            'Record decisions and next actions.',
            'End with encouragement or appreciation.'
          ],
          'Meeting Facilitator',
          'Weekly'
        ),
        template_(
          'organization_calendar_system',
          'System',
          'Shared Calendar Review System',
          'Help the household prepare for upcoming events, deadlines, appointments, and responsibilities.',
          'We review a shared calendar regularly and use general labels instead of storing unnecessary private details.',
          [
            'Review the upcoming week or month.',
            'Identify events, deadlines, transportation needs, or conflicts.',
            'Assign general follow-up roles.',
            'Confirm preparation tasks.',
            'Update the calendar in the appropriate secure tool.',
            'Review changes at the next check-in.'
          ],
          'Household Operations Coordinator',
          'Weekly'
        ),
        template_(
          'organization_supply_system',
          'Checklist',
          'Household Supply and Meal-Planning Checklist',
          'Reduce repeated last-minute shortages through a simple planning routine.',
          'We review general household and meal needs, use available resources carefully, and assign follow-up without storing payment details.',
          [
            'Review general food, hygiene, cleaning, and household supply needs.',
            'Check what is already available.',
            'Prioritize needs within the current plan.',
            'Choose meals or alternatives appropriate to the household.',
            'Assign shopping, preparation, or follow-up roles.',
            'Review waste and adjust the next plan.'
          ],
          'Household Operations Coordinator',
          'Weekly'
        ),
        template_(
          'organization_preparedness_review',
          'Safety Plan',
          'Household Preparedness Review System',
          'Keep general emergency and disruption planning visible without storing private emergency details.',
          'We review general plans for common disruptions, confirm that private information is securely stored elsewhere, and practice age-appropriate responses.',
          [
            'Choose one general disruption or safety topic to review.',
            'Discuss the appropriate response using trustworthy official guidance.',
            'Clarify general roles and communication expectations.',
            'Confirm that private contacts, addresses, medical details, and document copies remain outside FamilyPD.',
            'Practice an age-appropriate step when safe.',
            'Record the review date and next review date.'
          ],
          'Safety Coordinator',
          'Quarterly',
          'Important'
        )
      ]
    },

    es: {
      Health: [
        template_('health_wellness_checkin', 'System', 'Sistema de revisión de bienestar',
          'Crear una manera breve y repetible de notar necesidades generales de bienestar y ofrecer apoyo.',
          'Usamos revisiones respetuosas para notar necesidades generales de salud, estrés, descanso y apoyo sin registrar diagnósticos ni detalles confidenciales.',
          [
            'Elegir un momento regular para una revisión breve.',
            'Preguntar cómo está cada persona en términos generales.',
            'Preguntar si alguien necesita descanso, ánimo, materiales, un recordatorio de cita o ayuda para contactar apoyo apropiado.',
            'Acordar una acción de apoyo realista.',
            'Revisar si la conversación se siente respetuosa y útil.'
          ], 'Household Lead', 'Weekly'),
        template_('health_rest_policy', 'Policy', 'Política de descanso y sueño',
          'Proteger el descanso razonable y reducir hábitos del hogar que interrumpen el sueño.',
          'Respetamos horarios acordados de silencio, nos preparamos para el día siguiente y evitamos interrupciones innecesarias durante el descanso.',
          [
            'Acordar horarios generales de silencio.',
            'Preparar artículos importantes antes del periodo de descanso.',
            'Usar audífonos o bajar el volumen cuando otros descansan.',
            'Comunicar con respeto cuando un horario requiere una excepción.',
            'Revisar la política cuando cambien los horarios.'
          ], 'Household Operations Coordinator', 'Monthly'),
        template_('health_hygiene_routine', 'Checklist', 'Lista de higiene y espacios limpios',
          'Facilitar el recuerdo y la enseñanza de higiene y cuidado de espacios compartidos.',
          'Usamos una lista sencilla para apoyar la higiene personal, espacios limpios y recordatorios respetuosos.',
          [
            'Revisar rutinas de higiene apropiadas para cada miembro.',
            'Mantener materiales necesarios accesibles cuando sea posible.',
            'Guardar artículos personales después de usarlos.',
            'Completar tareas acordadas en espacios compartidos.',
            'Usar recordatorios respetuosos en vez de humillación.',
            'Revisar la lista y enseñar pasos que no estén claros.'
          ], 'Household Operations Coordinator', 'Weekly'),
        template_('health_emergency_supplies', 'Safety Plan', 'Revisión general de suministros de emergencia',
          'Revisar suministros generales sin guardar ubicaciones exactas, información de cuentas ni detalles médicos privados.',
          'Revisamos periódicamente suministros generales y confirmamos que la información privada se guarda de forma segura fuera de FamilyPD.',
          [
            'Revisar necesidades generales de agua, alimentos, iluminación, carga, primeros auxilios y saneamiento.',
            'Revisar fechas de vencimiento y reemplazar artículos inutilizables.',
            'Confirmar que contactos y detalles médicos privados están fuera de FamilyPD.',
            'Identificar suministros generales que faltan.',
            'Asignar un rol general para el seguimiento.',
            'Programar la próxima revisión.'
          ], 'Safety Coordinator', 'Every 6 months', 'Important'),
        template_('health_fire_review', 'Safety Plan', 'Revisión de preparación contra incendios',
          'Practicar conciencia general y revisar equipo de seguridad apropiadamente.',
          'Revisamos prácticas generales, conversamos sobre salidas sin guardar direcciones exactas y seguimos orientación oficial.',
          [
            'Revisar qué hacer al notar humo o fuego.',
            'Conversar sobre más de una manera general de salir cuando sea posible.',
            'Revisar prácticas generales de reunión y conteo sin ingresar ubicaciones exactas.',
            'Revisar alarmas o equipo según orientación oficial.',
            'Practicar una respuesta tranquila y apropiada.',
            'Registrar solamente las fechas generales de revisión.'
          ], 'Safety Coordinator', 'Every 6 months', 'High priority')
      ],
      Relationships: [
        template_('relationships_respect_policy', 'Policy', 'Política de comunicación respetuosa',
          'Crear expectativas claras para hablar y escuchar durante conversaciones y conflictos.',
          'Nos comunicamos sin insultos, amenazas, humillación ni crueldad intencional. Escuchamos, hacemos una pausa y regresamos con respeto.',
          [
            'Permitir que cada persona termine cuando sea seguro.',
            'Describir la conducta sin atacar a la persona.',
            'Hacer una pausa cuando las emociones estén demasiado altas.',
            'Regresar a la conversación a una hora acordada.',
            'Reconocer el daño e identificar qué debe cambiar.'
          ], 'Meeting Facilitator', 'Monthly'),
        template_('relationships_repair_system', 'System', 'Sistema de reparación de conflictos',
          'Dar al hogar un proceso repetible para reparar conflictos cotidianos.',
          'Reparamos conflictos calmándonos, escuchando, reconociendo el impacto, disculpándonos cuando corresponde y acordando cambios.',
          [
            'Hacer una pausa y asegurar participación segura.',
            'Permitir que cada persona explique su perspectiva.',
            'Nombrar el impacto sin debatir cada sentimiento.',
            'Identificar responsabilidad y ofrecer una disculpa específica.',
            'Acordar una acción o límite diferente.',
            'Revisar después si ocurrió la reparación.'
          ], 'Co-Lead', 'As needed'),
        template_('relationships_appreciation', 'System', 'Revisión de aprecio y ánimo',
          'Hacer del reconocimiento positivo una parte normal de la comunicación.',
          'Notamos regularmente esfuerzo, crecimiento, acciones útiles y cualidades que apreciamos.',
          [
            'Elegir una reunión o comida regular.',
            'Invitar a cada miembro a compartir un aprecio o ánimo.',
            'Mantener las palabras específicas y sinceras.',
            'Incluir esfuerzo y mejora, no solamente logros grandes.',
            'Notar si algún miembro es ignorado con frecuencia.'
          ], 'Family Member', 'Weekly'),
        template_('relationships_boundaries', 'Policy', 'Acuerdo de límites y espacio personal',
          'Aclarar expectativas sobre privacidad, pertenencias, tiempo y límites personales.',
          'Pedimos permiso antes de usar pertenencias, respetamos privacidad razonable y comunicamos límites sin controlar ni humillar.',
          [
            'Conversar sobre artículos que requieren permiso.',
            'Identificar expectativas generales de privacidad y silencio.',
            'Practicar una declaración respetuosa de límites.',
            'Aclarar qué hacer cuando se ignora un límite.',
            'Revisar cuando cambien edades, habitaciones, horarios o necesidades.'
          ], 'Household Lead', 'Quarterly'),
        template_('relationships_help_seeking', 'Safety Plan', 'Plan general para pedir ayuda',
          'Ayudar a reconocer cuándo una preocupación necesita apoyo externo.',
          'Tomamos en serio preocupaciones de seguridad, salud, abuso, crisis o bienestar y buscamos apoyo apropiado. Los contactos exactos se guardan fuera de FamilyPD.',
          [
            'Conversar sobre señales generales de urgencia.',
            'Identificar tipos de adultos, profesionales, servicios o autoridades confiables.',
            'Practicar cómo decir claramente que se necesita ayuda.',
            'No prometer secreto cuando alguien puede estar en peligro.',
            'Confirmar que la información privada está guardada fuera de FamilyPD.',
            'Revisar sin registrar situaciones confidenciales.'
          ], 'Safety Coordinator', 'Quarterly', 'High priority')
      ],
      Education: [
        template_('education_weekly_checkin', 'System', 'Revisión semanal de aprendizaje',
          'Crear una rutina breve para revisar aprendizaje, fechas, necesidades y progreso.',
          'Revisamos el aprendizaje, preguntamos qué apoyo se necesita y nos enfocamos en próximas acciones en vez de vergüenza.',
          [
            'Revisar fechas o compromisos generales.',
            'Preguntar qué está funcionando.',
            'Preguntar qué se siente confuso o difícil.',
            'Elegir una acción de apoyo.',
            'Actualizar el calendario compartido cuando corresponda.',
            'Celebrar esfuerzo y trabajo completado.'
          ], 'Learning Coordinator', 'Weekly'),
        template_('education_study_system', 'System', 'Sistema de estudio y práctica',
          'Facilitar el comienzo y repetición del aprendizaje enfocado.',
          'Usamos preparación, trabajo enfocado, descansos breves, práctica y revisión.',
          [
            'Elegir un tiempo y lugar razonable.',
            'Reunir materiales antes de comenzar.',
            'Dividir la tarea en partes pequeñas.',
            'Usar práctica activa.',
            'Tomar un descanso apropiado.',
            'Revisar lo completado y el próximo paso.'
          ], 'Learning Coordinator', 'Weekly'),
        template_('education_ai_policy', 'Policy', 'Política de uso responsable de tecnología e IA',
          'Apoyar tecnología útil protegiendo privacidad, honestidad, aprendizaje y seguridad.',
          'Usamos tecnología e IA para explicar, practicar, organizar y crear, no para reemplazar nuestro pensamiento ni exponer información privada.',
          [
            'No ingresar información privada del hogar, escuela, salud, cuentas o identidad.',
            'Revisar errores en información generada por IA.',
            'Verificar afirmaciones importantes con fuentes confiables.',
            'Seguir reglas de escuela, trabajo y plataformas.',
            'Identificar cuándo una herramienta ayudó a crear trabajo.',
            'Pedir ayuda cuando un sitio o solicitud parece inseguro.'
          ], 'Learning Coordinator', 'Quarterly'),
        template_('education_career_checklist', 'Checklist', 'Lista de investigación de carreras y capacitación',
          'Comparar oportunidades usando información confiable.',
          'Investigamos trabajo, requisitos, costo, tiempo, resultados y fuentes antes de comprometernos.',
          [
            'Identificar la ocupación, habilidad, credencial o programa.',
            'Usar una fuente oficial cuando esté disponible.',
            'Revisar requisitos y costo total.',
            'Revisar tiempo y expectativas.',
            'Buscar información de empleo, licencia o transferencia.',
            'Escribir un próximo paso y una pregunta pendiente.'
          ], 'Learning Coordinator', 'As needed'),
        template_('education_online_safety', 'Safety Plan', 'Plan de privacidad y respuesta a estafas en línea',
          'Crear una respuesta general para mensajes, sitios y solicitudes sospechosas.',
          'Hacemos una pausa antes de hacer clic, compartir, descargar, pagar o ingresar información. Verificamos de manera independiente.',
          [
            'Hacer una pausa ante urgencia, miedo, secreto o presión.',
            'No usar el enlace o contacto del mensaje para verificar.',
            'Revisar remitente, dominio, ortografía y solicitud.',
            'Usar un sitio oficial o método conocido.',
            'No compartir contraseñas, códigos, cuentas ni identificación.',
            'Pedir ayuda y reportar cuando corresponda.'
          ], 'Safety Coordinator', 'Quarterly', 'High priority')
      ],
      Finances: [
        template_('finances_monthly_review', 'System', 'Revisión mensual de dinero del hogar',
          'Crear una rutina tranquila para revisar necesidades, prioridades y progreso.',
          'Revisamos cambios generales, obligaciones próximas, prioridades y metas sin guardar números de cuenta ni accesos.',
          [
            'Revisar obligaciones y cambios generales.',
            'Identificar una categoría que necesita ajuste.',
            'Revisar una meta financiera actual.',
            'Conversar sobre una decisión compartida.',
            'Asignar un rol general de seguimiento.',
            'Guardar datos privados fuera de FamilyPD.'
          ], 'Household Lead', 'Monthly'),
        template_('finances_purchase_policy', 'Policy', 'Política para conversar sobre compras compartidas',
          'Aclarar cuándo una compra o compromiso debe conversarse.',
          'Conversamos sobre compras compartidas, contratos, suscripciones, préstamos o compromisos antes de completarlos.',
          [
            'Aclarar qué decisiones requieren conversación.',
            'Revisar necesidad, costo total y alternativas.',
            'Revisar cancelación, devolución, garantía o contrato.',
            'Dar tiempo razonable para preguntas.',
            'Registrar solamente la decisión y seguimiento general.'
          ], 'Household Lead', 'Quarterly'),
        template_('finances_bill_checklist', 'Checklist', 'Lista de revisión de facturas y fechas',
          'Reducir obligaciones olvidadas mediante una rutina general.',
          'Usamos un calendario financiero seguro fuera de FamilyPD para datos exactos y esta lista para confirmar los pasos generales.',
          [
            'Revisar fechas próximas en el sistema seguro.',
            'Confirmar quién realizará cada seguimiento.',
            'Identificar temprano cualquier cambio o dificultad.',
            'Contactar al proveedor o recurso apropiado.',
            'Confirmar la finalización sin guardar números de cuenta.'
          ], 'Household Lead', 'Monthly'),
        template_('finances_scam_plan', 'Safety Plan', 'Plan para pausar y verificar estafas financieras',
          'Crear una respuesta compartida a solicitudes financieras sospechosas.',
          'No enviamos dinero, tarjetas, códigos, información de cuentas ni identificación por urgencia inesperada. Hacemos una pausa y verificamos.',
          [
            'Detenerse y no actuar inmediatamente.',
            'No llamar ni hacer clic usando el mensaje sospechoso.',
            'Verificar mediante un sitio oficial o contacto conocido.',
            'Revisar urgencia, secreto, amenazas o pagos inusuales.',
            'Proteger cuentas usando pasos oficiales.',
            'Reportar fraude sospechoso cuando corresponda.'
          ], 'Safety Coordinator', 'Quarterly', 'High priority'),
        template_('finances_documents_system', 'System', 'Sistema de revisión de documentos financieros importantes',
          'Mantener una frecuencia general de revisión sin cargar documentos sensibles.',
          'Revisamos periódicamente si documentos importantes están actuales y guardados de forma segura fuera de FamilyPD.',
          [
            'Revisar categorías de documentos aplicables.',
            'Confirmar almacenamiento seguro.',
            'Identificar artículos vencidos o faltantes.',
            'Asignar un rol general.',
            'Establecer la próxima revisión.',
            'No guardar números ni copias en FamilyPD.'
          ], 'Household Lead', 'Yearly')
      ],
      Goals: [
        template_('goals_weekly_checkpoint', 'System', 'Sistema semanal de revisión de metas',
          'Mantener metas importantes visibles mediante una revisión breve.',
          'Revisamos metas, identificamos progreso y obstáculos, y elegimos una próxima acción realista.',
          [
            'Elegir una meta actual.',
            'Nombrar el progreso.',
            'Identificar un obstáculo o necesidad.',
            'Elegir la próxima acción pequeña.',
            'Asignar un rol general cuando corresponda.',
            'Celebrar esfuerzo y pasos completados.'
          ], 'Goal & Progress Coordinator', 'Weekly'),
        template_('goals_monthly_review', 'System', 'Revisión mensual de prioridades del hogar',
          'Enfocar el hogar en pocas prioridades.',
          'Revisamos prioridades, decidimos qué todavía importa y ajustamos planes a la capacidad actual.',
          [
            'Revisar prioridades activas.',
            'Identificar lo que funciona.',
            'Identificar lo bloqueado o menos importante.',
            'Elegir qué continúa.',
            'Ajustar pasos, apoyo o tiempo.',
            'Registrar la próxima revisión.'
          ], 'Goal & Progress Coordinator', 'Monthly'),
        template_('goals_support_policy', 'Policy', 'Política de apoyo y responsabilidad para metas',
          'Animar el progreso sin controlar ni avergonzar.',
          'Preguntamos qué apoyo se desea, usamos recordatorios respetuosos y protegemos la propiedad personal de las metas.',
          [
            'Preguntar qué apoyo sería útil.',
            'Acordar una frecuencia razonable.',
            'Usar recordatorios sin hostigamiento.',
            'Conversar sobre obstáculos y ajustes.',
            'Respetar la diferencia entre metas compartidas y privadas.'
          ], 'Goal & Progress Coordinator', 'Quarterly'),
        template_('goals_celebration', 'System', 'Sistema de reconocimiento de logros',
          'Notar progreso y logros de manera justa.',
          'Reconocemos esfuerzo, mejora, decisiones útiles y logros de formas apropiadas.',
          [
            'Definir el progreso reconocido.',
            'Elegir una forma apropiada de reconocimiento.',
            'Incluir esfuerzo y aprendizaje.',
            'Evitar comparaciones que avergüencen.',
            'Registrar una lección o próximo paso.'
          ], 'Family Member', 'Monthly'),
        template_('goals_deadline_checklist', 'Checklist', 'Lista de preparación para fechas límite',
          'Reducir estrés de último momento.',
          'Comenzamos con suficiente tiempo para identificar requisitos, materiales, apoyo y acciones.',
          [
            'Confirmar la fecha y resultado esperado.',
            'Listar requisitos principales.',
            'Dividir el trabajo.',
            'Identificar materiales o apoyo.',
            'Programar una revisión temprana.',
            'Confirmar entrega, asistencia o finalización.'
          ], 'Goal & Progress Coordinator', 'As needed')
      ],
      Organization: [
        template_('organization_responsibility_rotation', 'System', 'Sistema de rotación de responsabilidades',
          'Hacer visible el trabajo, enseñar pasos y compartir responsabilidades.',
          'Asignamos responsabilidades claramente, enseñamos cómo se ve el trabajo completo y revisamos la justicia de la carga.',
          [
            'Listar la responsabilidad.',
            'Explicar o demostrar los pasos.',
            'Asignar una etiqueta general.',
            'Aclarar horario o condición.',
            'Dar apoyo mientras se aprende.',
            'Revisar y ajustar justamente.'
          ], 'Household Operations Coordinator', 'Weekly'),
        template_('organization_meeting_system', 'System', 'Sistema de reuniones regulares',
          'Crear una manera predecible de compartir información y tomar decisiones.',
          'Tenemos reuniones breves y organizadas con agenda, participación respetuosa, decisiones y próximas acciones.',
          [
            'Elegir una frecuencia.',
            'Recoger pocos temas útiles.',
            'Elegir un facilitador.',
            'Compartir información y permitir preguntas.',
            'Registrar decisiones y acciones.',
            'Terminar con ánimo o aprecio.'
          ], 'Meeting Facilitator', 'Weekly'),
        template_('organization_calendar_system', 'System', 'Sistema de revisión del calendario compartido',
          'Prepararse para eventos, fechas, citas y responsabilidades.',
          'Revisamos un calendario compartido y usamos etiquetas generales en vez de detalles privados innecesarios.',
          [
            'Revisar la próxima semana o mes.',
            'Identificar eventos, fechas, transporte o conflictos.',
            'Asignar roles generales.',
            'Confirmar tareas de preparación.',
            'Actualizar el calendario apropiado.',
            'Revisar cambios en la próxima reunión.'
          ], 'Household Operations Coordinator', 'Weekly'),
        template_('organization_supply_system', 'Checklist', 'Lista de suministros y comidas',
          'Reducir faltas de último momento mediante planificación.',
          'Revisamos necesidades generales, usamos recursos con cuidado y asignamos seguimiento sin guardar datos de pago.',
          [
            'Revisar necesidades de alimentos, higiene, limpieza y hogar.',
            'Revisar lo que ya existe.',
            'Priorizar necesidades.',
            'Elegir comidas o alternativas.',
            'Asignar compras o preparación.',
            'Revisar desperdicio y ajustar.'
          ], 'Household Operations Coordinator', 'Weekly'),
        template_('organization_preparedness_review', 'Safety Plan', 'Sistema de revisión de preparación del hogar',
          'Mantener visible la preparación general sin guardar detalles privados.',
          'Revisamos planes generales, confirmamos que la información privada está fuera de FamilyPD y practicamos respuestas apropiadas.',
          [
            'Elegir un tema general.',
            'Revisar orientación oficial confiable.',
            'Aclarar roles y comunicación general.',
            'Mantener contactos, direcciones, datos médicos y documentos fuera de FamilyPD.',
            'Practicar un paso apropiado y seguro.',
            'Registrar fechas de revisión.'
          ], 'Safety Coordinator', 'Quarterly', 'Important')
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

    const records = combineRecords_(data.shared.policies, data.shared.safety);

    return {
      role: context.role,
      roleLabel: context.roleLabel,
      language: language,
      records: records,
      roleOptions: buildRoleOptions_(data),
      guidance: getGuidance_(language),
      summary: buildSummary_(records),
      citation: {
        contentId: 'SYSTEMS_GUIDANCE',
        inTextCitation: '(Hall, 2025, pp. 15–20, 57–63)',
        statement: language === 'es'
          ? 'FamilyPD adapta prácticas organizacionales al hogar mediante misión, valores, roles, reuniones, sistemas, políticas, seguimiento y preparación.'
          : 'FamilyPD adapts organizational practices for home through mission, values, roles, meetings, systems, policies, tracking, and preparedness.'
      }
    };
  }


  function getGuidance_(language) {
    const lang = GuidanceService.normalizeLanguage(language);
    return {
      language: lang,
      pillars: [
        option_('Health', lang === 'es' ? 'Salud' : 'Health'),
        option_('Relationships', lang === 'es' ? 'Relaciones' : 'Relationships'),
        option_('Education', lang === 'es' ? 'Educación' : 'Education'),
        option_('Finances', lang === 'es' ? 'Finanzas' : 'Finances'),
        option_('Goals', lang === 'es' ? 'Metas' : 'Goals'),
        option_('Organization', lang === 'es' ? 'Organización del hogar' : 'Household Organization')
      ],
      types: FPD_CONFIG.SYSTEMS.TYPES.map(function(value) {
        return option_(value, translateType_(value, lang));
      }),
      statuses: FPD_CONFIG.SYSTEMS.STATUSES.map(function(value) {
        return option_(value, translateStatus_(value, lang));
      }),
      reviewFrequencies: FPD_CONFIG.SYSTEMS.REVIEW_FREQUENCIES.map(function(value) {
        return option_(value, translateFrequency_(value, lang));
      }),
      priorities: FPD_CONFIG.SYSTEMS.PRIORITIES.map(function(value) {
        return option_(value, translatePriority_(value, lang));
      }),
      templates: fpdClone_(TEMPLATE_LIBRARY[lang]),
      privacyMessage: lang === 'es'
        ? 'Use etiquetas generales. No ingrese direcciones exactas, contactos de emergencia, diagnósticos, información médica, números de cuenta, contraseñas, documentos de identidad ni detalles que revelen cuándo el hogar está vacío.'
        : 'Use general labels. Do not enter exact addresses, emergency contacts, diagnoses, medical information, account numbers, passwords, identification documents, or details that reveal when the household is empty.',
      safetyMessage: lang === 'es'
        ? 'Los planes de seguridad de FamilyPD son recordatorios generales. Use orientación oficial y profesionales calificados para necesidades específicas.'
        : 'FamilyPD safety plans are general reminders. Use official guidance and qualified professionals for specific needs.'
    };
  }


  function generateFromTemplate(payload) {
    payload = payload || {};
    const language = GuidanceService.normalizeLanguage(payload.language);
    const pillar = assertPillar_(payload.pillar);
    const templateId = fpdSafeText_(payload.templateId, 120);
    const template = (TEMPLATE_LIBRARY[language][pillar] || []).find(function(item) {
      return item.id === templateId;
    });
    if (!template) {
      throw new Error(language === 'es'
        ? 'Seleccione una plantilla.'
        : 'Choose a template.');
    }
    return fpdClone_(template);
  }


  function saveRecord(payload) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can edit shared systems and policies.');
    }

    const data = DataStoreService.readData();
    const record = normalizePayload_(payload);
    const privacyCopy = fpdClone_(record);
    PrivacyGuardService.validatePayload(privacyCopy, 'household system or policy');

    const isSafety = record.recordType === 'Safety Plan';
    const safetyIndex = data.shared.safety.findIndex(function(item) {
      return String(item.id || '') === record.id;
    });
    const policyIndex = data.shared.policies.findIndex(function(item) {
      return String(item.id || '') === record.id;
    });
    const existing = safetyIndex >= 0
      ? data.shared.safety[safetyIndex]
      : policyIndex >= 0
        ? data.shared.policies[policyIndex]
        : null;

    if (isSafety && policyIndex >= 0) {
      data.shared.policies.splice(policyIndex, 1);
    }
    if (!isSafety && safetyIndex >= 0) {
      data.shared.safety.splice(safetyIndex, 1);
    }

    const target = isSafety ? data.shared.safety : data.shared.policies;
    const maximum = isSafety
      ? FPD_CONFIG.SYSTEMS.MAX_SAFETY_RECORDS
      : FPD_CONFIG.SYSTEMS.MAX_POLICY_RECORDS;
    const index = target.findIndex(function(item) {
      return String(item.id || '') === record.id;
    });

    if (index < 0 && target.length >= maximum) {
      throw new Error('This workspace has reached its current systems-record limit.');
    }

    const now = fpdNow_();
    const stored = toStoredRecord_(record, existing, now);

    if (index >= 0) target[index] = stored;
    else target.unshift(stored);

    DataStoreService.appendActivity(
      data,
      index >= 0 ? 'SYSTEM_RECORD_UPDATED' : 'SYSTEM_RECORD_CREATED',
      'A shared household system, policy, checklist, or safety plan was saved.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Household system record saved.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function archiveRecord(payload) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can archive shared systems.');
    }

    payload = payload || {};
    const data = DataStoreService.readData();
    const record = findStoredRecord_(data, payload.recordType, payload.recordId);
    if (!record) throw new Error('FamilyPD could not find that system record.');

    record.status = 'Archived';
    record.updatedAt = fpdNow_();
    DataStoreService.appendActivity(
      data,
      'SYSTEM_RECORD_ARCHIVED',
      'A shared household system record was archived.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Household system record archived.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function markReviewed(payload) {
    const context = WorkspaceService.getCurrentContext();
    if (context.role !== FPD_CONFIG.ROLE.LEAD) {
      throw new Error('Only a Household Lead workspace can mark shared systems reviewed.');
    }

    payload = payload || {};
    const data = DataStoreService.readData();
    const record = findStoredRecord_(data, payload.recordType, payload.recordId);
    if (!record) throw new Error('FamilyPD could not find that system record.');

    const today = fpdNow_().substring(0, 10);
    record.status = record.status === 'Archived' ? 'Archived' : 'Active';
    record.lastReviewedDate = today;
    record.nextReviewDate = calculateNextReviewDate_(
      today,
      record.reviewFrequency || 'As needed'
    );
    record.updatedAt = fpdNow_();

    DataStoreService.appendActivity(
      data,
      'SYSTEM_RECORD_REVIEWED',
      'A shared household system record was marked reviewed.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: 'Review recorded and the next review date was updated.',
      workspace: getWorkspaceView(payload.language)
    };
  }


  function normalizePayload_(payload) {
    payload = payload || {};
    const recordType = assertType_(payload.recordType || 'System');
    const title = fpdSafeText_(payload.title, 220);
    if (!title) throw new Error('Enter a short title.');

    const effectiveDate = normalizeDate_(payload.effectiveDate);
    const reviewFrequency = assertFrequency_(
      payload.reviewFrequency || 'Monthly'
    );
    let nextReviewDate = normalizeDate_(payload.nextReviewDate);
    if (!nextReviewDate && effectiveDate && reviewFrequency !== 'As needed') {
      nextReviewDate = calculateNextReviewDate_(
        effectiveDate,
        reviewFrequency
      );
    }

    return {
      id: fpdSafeText_(payload.id, 120),
      recordType: recordType,
      templateId: fpdSafeText_(payload.templateId, 120),
      title: title,
      pillar: assertPillar_(payload.pillar),
      status: assertStatus_(payload.status || 'Draft'),
      purpose: fpdSafeText_(payload.purpose, 1600),
      statement: fpdSafeText_(payload.statement, 2500),
      appliesTo: sanitizeTextList_(
        payload.appliesTo,
        FPD_CONFIG.SYSTEMS.MAX_APPLIES_TO,
        120
      ),
      ownerRole: fpdSafeText_(payload.ownerRole, 120),
      steps: sanitizeTextList_(
        payload.steps,
        FPD_CONFIG.SYSTEMS.MAX_STEPS,
        1000
      ),
      reviewFrequency: reviewFrequency,
      priority: assertPriority_(payload.priority || 'Routine'),
      effectiveDate: effectiveDate,
      nextReviewDate: nextReviewDate,
      notes: fpdSafeText_(payload.notes, 3000)
    };
  }


  function toStoredRecord_(record, existing, now) {
    const base = {
      id: record.id || fpdNewId_('SYSTEM'),
      recordType: record.recordType,
      templateId: record.templateId,
      title: record.title,
      pillar: record.pillar,
      status: record.status,
      purpose: record.purpose,
      ownerRole: record.ownerRole,
      steps: record.steps,
      priority: record.priority,
      reviewFrequency: record.reviewFrequency,
      effectiveDate: record.effectiveDate,
      lastReviewedDate: existing && existing.lastReviewedDate || '',
      nextReviewDate: record.nextReviewDate,
      notes: record.notes,
      createdAt: existing && existing.createdAt || now,
      updatedAt: now
    };

    if (record.recordType === 'Safety Plan') {
      return Object.assign(base, {
        category: record.pillar,
        generalInstructions: record.statement,
        audience: record.appliesTo,
        lastReviewedDate: existing && existing.lastReviewedDate || ''
      });
    }

    return Object.assign(base, {
      statement: record.statement,
      appliesTo: record.appliesTo,
      effectiveDate: record.effectiveDate
    });
  }


  function combineRecords_(policies, safety) {
    const combined = [];

    (Array.isArray(policies) ? policies : []).forEach(function(item) {
      combined.push(normalizeStoredPolicy_(item));
    });
    (Array.isArray(safety) ? safety : []).forEach(function(item) {
      combined.push(normalizeStoredSafety_(item));
    });

    return combined.sort(function(a, b) {
      if (a.status === 'Archived' && b.status !== 'Archived') return 1;
      if (a.status !== 'Archived' && b.status === 'Archived') return -1;
      if (a.nextReviewDate && b.nextReviewDate) {
        return a.nextReviewDate.localeCompare(b.nextReviewDate);
      }
      if (a.nextReviewDate) return -1;
      if (b.nextReviewDate) return 1;
      return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });
  }


  function normalizeStoredPolicy_(item) {
    item = item || {};
    return {
      id: fpdSafeText_(item.id, 120),
      recordType: ['Policy', 'System', 'Checklist'].indexOf(item.recordType) >= 0
        ? item.recordType
        : 'Policy',
      templateId: fpdSafeText_(item.templateId, 120),
      title: fpdSafeText_(item.title, 220),
      pillar: normalizePillar_(item.pillar),
      status: normalizeStatus_(item.status),
      purpose: fpdSafeText_(item.purpose, 1600),
      statement: fpdSafeText_(item.statement, 2500),
      appliesTo: sanitizeTextList_(item.appliesTo, 25, 120),
      ownerRole: fpdSafeText_(item.ownerRole, 120),
      steps: sanitizeTextList_(item.steps, 12, 1000),
      reviewFrequency: normalizeFrequency_(item.reviewFrequency),
      priority: normalizePriority_(item.priority),
      effectiveDate: normalizeDate_(item.effectiveDate),
      lastReviewedDate: normalizeDate_(item.lastReviewedDate),
      nextReviewDate: normalizeDate_(item.nextReviewDate || item.reviewDate),
      notes: fpdSafeText_(item.notes, 3000),
      createdAt: fpdSafeText_(item.createdAt, 50),
      updatedAt: fpdSafeText_(item.updatedAt, 50)
    };
  }


  function normalizeStoredSafety_(item) {
    item = item || {};
    return {
      id: fpdSafeText_(item.id, 120),
      recordType: 'Safety Plan',
      templateId: fpdSafeText_(item.templateId, 120),
      title: fpdSafeText_(item.title, 220),
      pillar: normalizePillar_(item.pillar || item.category),
      status: normalizeStatus_(item.status || item.reviewStatus),
      purpose: fpdSafeText_(item.purpose, 1600),
      statement: fpdSafeText_(
        item.generalInstructions || item.statement,
        2500
      ),
      appliesTo: sanitizeTextList_(item.audience || item.appliesTo, 25, 120),
      ownerRole: fpdSafeText_(item.ownerRole, 120),
      steps: sanitizeTextList_(item.steps, 12, 1000),
      reviewFrequency: normalizeFrequency_(item.reviewFrequency),
      priority: normalizePriority_(item.priority),
      effectiveDate: normalizeDate_(item.effectiveDate),
      lastReviewedDate: normalizeDate_(item.lastReviewedDate),
      nextReviewDate: normalizeDate_(item.nextReviewDate),
      notes: fpdSafeText_(item.notes, 3000),
      createdAt: fpdSafeText_(item.createdAt, 50),
      updatedAt: fpdSafeText_(item.updatedAt, 50)
    };
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
      add(role.customLabel);
      add(role.rosterLabel);
      add(role.roleTitle);
      add(role.roleLabel);
    });

    return values.slice(0, 40);
  }


  function buildSummary_(records) {
    const today = fpdNow_().substring(0, 10);
    const active = records.filter(function(item) {
      return item.status === 'Active';
    });
    const reviewNeeded = records.filter(function(item) {
      return item.status === 'Review needed' ||
        Boolean(item.nextReviewDate && item.nextReviewDate < today);
    });
    const upcoming = records.filter(function(item) {
      return item.status !== 'Archived' &&
        item.nextReviewDate &&
        item.nextReviewDate >= today;
    }).slice(0, 3);

    return {
      total: records.filter(function(item) {
        return item.status !== 'Archived';
      }).length,
      active: active.length,
      reviewNeeded: reviewNeeded.length,
      upcomingReviews: upcoming
    };
  }


  function findStoredRecord_(data, recordType, recordId) {
    const id = String(recordId || '');
    const isSafety = String(recordType || '') === 'Safety Plan';
    const primary = isSafety ? data.shared.safety : data.shared.policies;
    const secondary = isSafety ? data.shared.policies : data.shared.safety;

    return primary.find(function(item) {
      return String(item.id || '') === id;
    }) || secondary.find(function(item) {
      return String(item.id || '') === id;
    }) || null;
  }


  function calculateNextReviewDate_(dateText, frequency) {
    if (!dateText || frequency === 'As needed') return '';

    const parts = String(dateText).split('-').map(Number);
    if (parts.length !== 3) return '';
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);

    if (frequency === 'Weekly') date.setDate(date.getDate() + 7);
    if (frequency === 'Monthly') date.setMonth(date.getMonth() + 1);
    if (frequency === 'Quarterly') date.setMonth(date.getMonth() + 3);
    if (frequency === 'Every 6 months') date.setMonth(date.getMonth() + 6);
    if (frequency === 'Yearly') date.setFullYear(date.getFullYear() + 1);

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }


  function assertPillar_(value) {
    if (['Health', 'Relationships', 'Education', 'Finances', 'Goals', 'Organization']
        .indexOf(value) < 0) {
      throw new Error('Choose a FamilyPD pillar or Household Organization.');
    }
    return value;
  }


  function assertType_(value) {
    if (FPD_CONFIG.SYSTEMS.TYPES.indexOf(value) < 0) {
      throw new Error('Choose a valid record type.');
    }
    return value;
  }


  function assertStatus_(value) {
    if (FPD_CONFIG.SYSTEMS.STATUSES.indexOf(value) < 0) {
      throw new Error('Choose a valid status.');
    }
    return value;
  }


  function assertFrequency_(value) {
    if (FPD_CONFIG.SYSTEMS.REVIEW_FREQUENCIES.indexOf(value) < 0) {
      throw new Error('Choose a valid review frequency.');
    }
    return value;
  }


  function assertPriority_(value) {
    if (FPD_CONFIG.SYSTEMS.PRIORITIES.indexOf(value) < 0) {
      throw new Error('Choose a valid priority.');
    }
    return value;
  }


  function normalizePillar_(value) {
    return ['Health', 'Relationships', 'Education', 'Finances', 'Goals', 'Organization']
      .indexOf(value) >= 0 ? value : 'Organization';
  }


  function normalizeStatus_(value) {
    return FPD_CONFIG.SYSTEMS.STATUSES.indexOf(value) >= 0
      ? value : 'Draft';
  }


  function normalizeFrequency_(value) {
    return FPD_CONFIG.SYSTEMS.REVIEW_FREQUENCIES.indexOf(value) >= 0
      ? value : 'As needed';
  }


  function normalizePriority_(value) {
    return FPD_CONFIG.SYSTEMS.PRIORITIES.indexOf(value) >= 0
      ? value : 'Routine';
  }


  function normalizeDate_(value) {
    const text = String(value || '').trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
  }


  function sanitizeTextList_(values, maxItems, maxLength) {
    return (Array.isArray(values) ? values : [])
      .slice(0, maxItems)
      .map(function(value) { return fpdSafeText_(value, maxLength); })
      .filter(Boolean);
  }


  function translateType_(value, language) {
    if (language !== 'es') return value;
    return {
      Policy: 'Política',
      System: 'Sistema',
      Checklist: 'Lista de verificación',
      'Safety Plan': 'Plan de seguridad'
    }[value] || value;
  }


  function translateStatus_(value, language) {
    if (language !== 'es') return value;
    return {
      Draft: 'Borrador',
      Active: 'Activo',
      'Review needed': 'Necesita revisión',
      Archived: 'Archivado'
    }[value] || value;
  }


  function translateFrequency_(value, language) {
    if (language !== 'es') return value;
    return {
      Weekly: 'Semanal',
      Monthly: 'Mensual',
      Quarterly: 'Trimestral',
      'Every 6 months': 'Cada 6 meses',
      Yearly: 'Anual',
      'As needed': 'Cuando sea necesario'
    }[value] || value;
  }


  function translatePriority_(value, language) {
    if (language !== 'es') return value;
    return {
      Routine: 'Rutina',
      Important: 'Importante',
      'High priority': 'Prioridad alta'
    }[value] || value;
  }


  function option_(value, label) {
    return { value: value, label: label };
  }


  function template_(
    id,
    recordType,
    title,
    purpose,
    statement,
    steps,
    ownerRole,
    reviewFrequency,
    priority
  ) {
    return {
      id: id,
      recordType: recordType,
      title: title,
      purpose: purpose,
      statement: statement,
      steps: steps,
      ownerRole: ownerRole,
      reviewFrequency: reviewFrequency,
      priority: priority || 'Routine'
    };
  }


  return {
    getWorkspaceView: getWorkspaceView,
    getGuidance: getGuidance_,
    generateFromTemplate: generateFromTemplate,
    saveRecord: saveRecord,
    archiveRecord: archiveRecord,
    markReviewed: markReviewed
  };
})();
