/**
 * Generates privacy-first Learning Plan PDFs with a guidebook citation,
 * source-specific in-text citation suggestions, and References.
 */

const LearningDocumentService = (function() {

  function generateLearningPdf(scope, planId, languageOverride) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const normalizedScope = String(scope || 'PERSONAL').toUpperCase() === 'HOUSEHOLD'
      ? 'HOUSEHOLD' : 'PERSONAL';

    const list = normalizedScope === 'HOUSEHOLD'
      ? data.shared.learningPlans || []
      : data.personal.learningPlans || [];

    const plan = list.find(function(item) {
      return String(item.id || '') === String(planId || '');
    });
    if (!plan) throw new Error('FamilyPD could not find that learning plan.');

    const language = GuidanceService.normalizeLanguage(
      languageOverride ||
      data.personal && data.personal.profile && data.personal.profile.language ||
      'en'
    );
    const html = buildHtml_(plan, normalizedScope, language);
    const filename = 'FamilyPD_' +
      (normalizedScope === 'HOUSEHOLD' ? 'Household' : 'Personal') +
      '_Learning_Plan_' + sanitizeFilename_(plan.title) + '_' + language + '.pdf';

    const pdfBlob = Utilities
      .newBlob(html, 'text/html', 'FamilyPD_Learning_Plan.html')
      .getAs('application/pdf')
      .setName(filename);

    const folderMap = fpdFolderMap_();
    const parentId = folderMap.LEARNING || folderMap.MY_LEARNING ||
      folderMap.GENERATED || context.rootFolderId;
    const file = DriveApiService.createBinaryFile(
      filename,
      'application/pdf',
      parentId,
      pdfBlob.getBytes()
    );

    DataStoreService.appendActivity(
      data,
      'LEARNING_PDF_GENERATED',
      'A privacy-first learning-plan PDF was generated.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: language === 'es'
        ? 'Se generó el plan de aprendizaje con citas y Referencias.'
        : 'The learning plan was generated with citations and References.',
      filename: filename,
      driveFileId: file.id,
      driveFileUrl: file.webViewLink ||
        'https://drive.google.com/open?id=' + encodeURIComponent(file.id),
      base64Content: Utilities.base64Encode(pdfBlob.getBytes())
    };
  }


  function buildHtml_(plan, scope, language) {
    const es = language === 'es';
    const labels = es ? {
      heading: 'PLAN DE APRENDIZAJE FAMILYPD',
      scope: scope === 'HOUSEHOLD' ? 'Plan compartido del hogar' : 'Plan personal privado',
      area: 'Área',
      status: 'Estado',
      format: 'Formato',
      level: 'Nivel',
      time: 'Tiempo estimado',
      facilitator: 'Facilitador',
      audience: 'Participantes',
      objective: 'Objetivo de aprendizaje',
      why: 'Por qué importa',
      resources: 'Fuentes y recursos',
      useCitation: 'Cita sugerida en el texto',
      linkStatus: 'Estado del enlace',
      activities: 'Actividades',
      prompts: 'Preguntas para conversar',
      action: 'Próxima acción',
      reflection: 'Pregunta de reflexión',
      notes: 'Notas',
      references: 'Referencias',
      noItems: 'Todavía no se agregaron elementos.',
      privacy: 'Recordatorio de privacidad: use ejemplos y descripciones generales. No agregue nombres legales, diagnósticos, expedientes escolares confidenciales, números de cuenta, contraseñas, direcciones exactas ni identificadores.',
      sourceNotice: 'Una verificación del enlace confirma solamente que el enlace respondió. No significa que todas las afirmaciones sean correctas. Revise autor, fecha, propósito, evidencia y posibles sesgos.',
      guidebookCitation: 'La estructura de aprendizaje se adaptó de The Family Personal Development Guidebook (Hall, 2025, pp. 20–23).'
    } : {
      heading: 'FAMILYPD LEARNING PLAN',
      scope: scope === 'HOUSEHOLD' ? 'Shared household plan' : 'Private personal plan',
      area: 'Area',
      status: 'Status',
      format: 'Format',
      level: 'Level',
      time: 'Estimated time',
      facilitator: 'Facilitator',
      audience: 'Participants',
      objective: 'Learning objective',
      why: 'Why it matters',
      resources: 'Sources and resources',
      useCitation: 'Suggested in-text citation',
      linkStatus: 'Link status',
      activities: 'Activities',
      prompts: 'Discussion questions',
      action: 'Next action',
      reflection: 'Reflection prompt',
      notes: 'Notes',
      references: 'References',
      noItems: 'No items have been added yet.',
      privacy: 'Privacy reminder: use examples and general descriptions. Do not add legal names, diagnoses, confidential school records, account numbers, passwords, exact addresses, or identifiers.',
      sourceNotice: 'A link check confirms only that the link responded. It does not prove every claim is correct. Review the author, date, purpose, evidence, and possible bias.',
      guidebookCitation: 'Learning structure adapted from The Family Personal Development Guidebook (Hall, 2025, pp. 20–23).'
    };

    const resources = Array.isArray(plan.resources) ? plan.resources : [];
    const activities = Array.isArray(plan.activities) ? plan.activities : [];
    const prompts = Array.isArray(plan.discussionPrompts) ? plan.discussionPrompts : [];
    const audience = Array.isArray(plan.audienceRoles) ? plan.audienceRoles : [];

    const resourcesHtml = resources.length
      ? resources.map(function(resource, index) {
          const citation = formatInText_(resource);
          return '<article class="resource"><h3>' + (index + 1) + '. ' +
            escape_(resource.title || resource.domain || 'Resource') + '</h3>' +
            '<p><b>' + escape_(resource.authorOrPublisher || resource.domain || '') +
            '</b>' + (resource.year ? ' · ' + escape_(resource.year) : '') + '</p>' +
            (resource.url ? '<p><a href="' + escapeAttribute_(resource.url) + '">' +
              escape_(resource.url) + '</a></p>' : '') +
            '<p><b>' + escape_(labels.useCitation) + ':</b> ' + escape_(citation) + '</p>' +
            '<p><b>' + escape_(labels.linkStatus) + ':</b> ' +
            escape_(translateVerification_(resource.verificationStatus, language)) +
            (resource.httpStatus ? ' · HTTP ' + Number(resource.httpStatus) : '') + '</p>' +
            (resource.notes ? '<p>' + escape_(resource.notes) + '</p>' : '') +
            '</article>';
        }).join('')
      : '<p class="empty">' + escape_(labels.noItems) + '</p>';

    const activityHtml = listHtml_(activities, labels.noItems);
    const promptHtml = listHtml_(prompts, labels.noItems);
    const audienceHtml = listHtml_(audience.map(function(value) {
      return translateRole_(value, language);
    }), labels.noItems);

    const references = [
      '<p>' + escape_(FPD_CONFIG.GUIDEBOOK.APA_REFERENCE) + ' ' +
        escape_(FPD_CONFIG.GUIDEBOOK_URL) + '</p>'
    ];
    resources.forEach(function(resource) {
      references.push('<p>' + escape_(formatReference_(resource)) + '</p>');
    });

    return '<!DOCTYPE html><html lang="' + language + '"><head><meta charset="utf-8"><style>' +
      '@page{size:letter;margin:.52in}body{font-family:Arial,sans-serif;color:#272421;font-size:10.5pt;line-height:1.48}' +
      'h1,h2,h3{color:#541622}h1{font-size:24pt;margin:0 0 4px}h2{font-size:15pt;border-bottom:2px solid #d69a35;padding-bottom:5px;margin-top:22px}' +
      'h3{font-size:12pt;margin:0 0 4px}.eyebrow{color:#176f75;font-weight:bold;letter-spacing:1.4px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:15px 0}' +
      '.meta div,.box,.resource{border:1px solid #ded6cd;border-radius:9px;padding:9px}.resource{margin-bottom:9px;background:#f8fbfa}' +
      '.resource a{color:#176f75;overflow-wrap:anywhere}.empty{font-style:italic;color:#666}.privacy,.source-notice{margin-top:18px;padding:11px;font-size:9pt}' +
      '.privacy{background:#fff4d8;border-left:5px solid #d69a35}.source-notice{background:#eef7f6;border-left:5px solid #176f75}' +
      '.citation{font-size:9pt;color:#555}.references{page-break-before:always}</style></head><body>' +
      '<div class="eyebrow">' + escape_(labels.heading) + '</div><h1>' +
      escape_(plan.title) + '</h1><p>' + escape_(labels.scope) + '</p>' +
      '<div class="meta">' +
      meta_(labels.area, translatePillar_(plan.pillar, language)) +
      meta_(labels.status, translateStatus_(plan.status, language)) +
      meta_(labels.format, translateFormat_(plan.format, language)) +
      meta_(labels.level, translateDifficulty_(plan.difficulty, language)) +
      meta_(labels.time, Number(plan.estimatedMinutes || 30) +
        (es ? ' minutos' : ' minutes')) +
      meta_(labels.facilitator, translateRole_(plan.facilitatorRole || '', language)) +
      '</div>' +
      section_(labels.audience, audienceHtml) +
      section_(labels.objective, box_(plan.objective, labels.noItems)) +
      section_(labels.why, box_(plan.why, labels.noItems)) +
      section_(labels.resources, resourcesHtml) +
      '<div class="source-notice">' + escape_(labels.sourceNotice) + '</div>' +
      section_(labels.activities, activityHtml) +
      section_(labels.prompts, promptHtml) +
      section_(labels.action, box_(plan.actionStep, labels.noItems)) +
      section_(labels.reflection, box_(plan.reflectionPrompt, labels.noItems)) +
      section_(labels.notes, box_(plan.notes, labels.noItems)) +
      '<p class="citation">' + escape_(labels.guidebookCitation) + '</p>' +
      '<div class="privacy">' + escape_(labels.privacy) + '</div>' +
      '<section class="references"><h2>' + escape_(labels.references) + '</h2>' +
      references.join('') + '</section></body></html>';
  }


  function formatInText_(resource) {
    const author = resource.authorOrPublisher || resource.domain || 'Source';
    const year = resource.year || 'n.d.';
    return '(' + author + ', ' + year + ')';
  }


  function formatReference_(resource) {
    const author = resource.authorOrPublisher || resource.domain || 'Unknown author';
    const year = resource.year || 'n.d.';
    const title = resource.title || 'Untitled resource';
    const url = resource.url || '';
    return author + '. (' + year + '). ' + title + '.' +
      (url ? ' ' + url : '');
  }


  function meta_(label, value) {
    return '<div><b>' + escape_(label) + ':</b><br>' +
      escape_(value || '—') + '</div>';
  }


  function section_(title, content) {
    return '<h2>' + escape_(title) + '</h2>' + content;
  }


  function box_(value, emptyLabel) {
    return value
      ? '<div class="box">' + escape_(value) + '</div>'
      : '<p class="empty">' + escape_(emptyLabel) + '</p>';
  }


  function listHtml_(values, emptyLabel) {
    return values.length
      ? '<ul>' + values.map(function(value) {
          return '<li>' + escape_(value) + '</li>';
        }).join('') + '</ul>'
      : '<p class="empty">' + escape_(emptyLabel) + '</p>';
  }


  function translatePillar_(value, language) {
    if (language !== 'es') return value;
    return {
      Health: 'Salud',
      Relationships: 'Relaciones',
      Education: 'Educación',
      Finances: 'Finanzas',
      Goals: 'Metas',
      Organization: 'Organización del hogar'
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


  function translateVerification_(value, language) {
    if (language !== 'es') return value || 'Not checked';
    return {
      'Not checked': 'No revisado',
      'Link checked': 'Enlace revisado',
      'Check failed': 'No se pudo revisar'
    }[value] || value || 'No revisado';
  }


  function translateRole_(value, language) {
    if (language !== 'es') return value;
    return {
      'Household Lead': 'Líder del hogar',
      'Co-Lead': 'Colíder',
      'Family Member': 'Miembro de la familia',
      'Adult Member': 'Miembro adulto',
      'Young Adult Member': 'Miembro adulto joven',
      'Teen Member': 'Miembro adolescente',
      'Child Member': 'Miembro menor',
      'Older Adult Member': 'Miembro adulto mayor',
      'Meeting Facilitator': 'Facilitador de reuniones',
      'Goal & Progress Coordinator': 'Coordinador de metas y progreso',
      'Learning Coordinator': 'Coordinador de aprendizaje',
      'Household Operations Coordinator': 'Coordinador de operaciones del hogar',
      'Safety Coordinator': 'Coordinador de seguridad'
    }[value] || value;
  }


  function sanitizeFilename_(value) {
    return String(value || 'Learning_Plan')
      .replace(/[^A-Za-z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 60) || 'Learning_Plan';
  }


  function escape_(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  function escapeAttribute_(value) {
    return escape_(value);
  }


  return {
    generateLearningPdf: generateLearningPdf
  };
})();
