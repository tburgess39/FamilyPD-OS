/**
 * Generates a privacy-first PDF for a selected goal.
 * Includes a guidebook citation and References section.
 */

const GoalDocumentService = (function() {

  function generateGoalPdf(scope, goalId) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const normalizedScope = String(scope || 'PERSONAL').toUpperCase() === 'HOUSEHOLD'
      ? 'HOUSEHOLD' : 'PERSONAL';

    const list = normalizedScope === 'HOUSEHOLD'
      ? data.shared.sharedGoals || []
      : data.personal.goals || [];
    const goal = list.find(function(item) {
      return String(item.id || '') === String(goalId || '');
    });

    if (!goal) throw new Error('FamilyPD could not find that goal.');

    const language = GuidanceService.normalizeLanguage(
      data.personal && data.personal.profile && data.personal.profile.language || 'en'
    );
    const html = buildHtml_(goal, normalizedScope, language);
    const filename = 'FamilyPD_' +
      (normalizedScope === 'HOUSEHOLD' ? 'Household' : 'Personal') +
      '_Goal_Plan_' + sanitizeFilename_(goal.title) + '_' + language + '.pdf';

    const pdfBlob = Utilities
      .newBlob(html, 'text/html', 'FamilyPD_Goal_Plan.html')
      .getAs('application/pdf')
      .setName(filename);

    const folderMap = fpdFolderMap_();
    const parentId = folderMap.GENERATED || context.rootFolderId;
    const file = DriveApiService.createBinaryFile(
      filename,
      'application/pdf',
      parentId,
      pdfBlob.getBytes()
    );

    DataStoreService.appendActivity(
      data,
      'GOAL_PDF_GENERATED',
      'A privacy-first goal plan PDF was generated.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: language === 'es'
        ? 'Se generó el PDF de la meta con una página de Referencias.'
        : 'The goal plan PDF was generated with a References page.',
      filename: filename,
      driveFileId: file.id,
      driveFileUrl: file.webViewLink ||
        'https://drive.google.com/open?id=' + encodeURIComponent(file.id),
      base64Content: Utilities.base64Encode(pdfBlob.getBytes())
    };
  }


  function buildHtml_(goal, scope, language) {
    const es = language === 'es';
    const labels = es ? {
      title: 'PLAN DE META FAMILYPD',
      scope: scope === 'HOUSEHOLD' ? 'Meta compartida del hogar' : 'Meta personal privada',
      pillar: 'Pilar',
      timeframe: 'Período',
      status: 'Estado',
      progress: 'Progreso',
      purpose: 'Por qué importa',
      target: 'Resultado deseado',
      measure: 'Cómo revisaremos el progreso',
      steps: 'Pasos',
      checkpoints: 'Revisiones recientes',
      noSteps: 'Todavía no hay pasos.',
      noCheckpoints: 'Todavía no hay revisiones.',
      nextAction: 'Próxima acción',
      support: 'Apoyo necesario',
      barrier: 'Barrera',
      references: 'Referencias',
      privacy: 'Recordatorio de privacidad: use este documento solamente para planificación no sensible. No agregue números de cuenta, diagnósticos, direcciones exactas, identificadores, contraseñas ni expedientes confidenciales.',
      citation: 'Orientación sobre metas adaptada de The Family Personal Development Guidebook (Hall, 2025, pp. 50–55).'
    } : {
      title: 'FAMILYPD GOAL PLAN',
      scope: scope === 'HOUSEHOLD' ? 'Shared household goal' : 'Private personal goal',
      pillar: 'Pillar',
      timeframe: 'Timeframe',
      status: 'Status',
      progress: 'Progress',
      purpose: 'Why it matters',
      target: 'Desired result',
      measure: 'How progress will be reviewed',
      steps: 'Steps',
      checkpoints: 'Recent checkpoints',
      noSteps: 'No steps have been added yet.',
      noCheckpoints: 'No checkpoints have been added yet.',
      nextAction: 'Next action',
      support: 'Support needed',
      barrier: 'Barrier',
      references: 'References',
      privacy: 'Privacy reminder: use this document only for non-sensitive planning. Do not add account numbers, diagnoses, exact addresses, identifiers, passwords, or confidential records.',
      citation: 'Goal guidance adapted from The Family Personal Development Guidebook (Hall, 2025, pp. 50–55).'
    };

    const steps = Array.isArray(goal.steps) ? goal.steps : [];
    const checkpoints = Array.isArray(goal.checkpoints) ? goal.checkpoints.slice(0, 10) : [];
    const stepHtml = steps.length
      ? '<ol>' + steps.map(function(step) {
          return '<li><strong>' + escape_(step.status === 'Completed' ? '✓ ' : '○ ') +
            escape_(step.text) + '</strong></li>';
        }).join('') + '</ol>'
      : '<p class="empty">' + escape_(labels.noSteps) + '</p>';
    const checkpointHtml = checkpoints.length
      ? checkpoints.map(function(item) {
          return '<div class="checkpoint"><strong>' +
            escape_(formatDate_(item.createdAt)) + ' · ' +
            Number(item.percentComplete || 0) + '%</strong>' +
            (item.progressNote ? '<p>' + escape_(item.progressNote) + '</p>' : '') +
            (item.barrier ? '<p><b>' + escape_(labels.barrier) + ':</b> ' + escape_(item.barrier) + '</p>' : '') +
            (item.supportNeeded ? '<p><b>' + escape_(labels.support) + ':</b> ' + escape_(item.supportNeeded) + '</p>' : '') +
            (item.nextAction ? '<p><b>' + escape_(labels.nextAction) + ':</b> ' + escape_(item.nextAction) + '</p>' : '') +
            '</div>';
        }).join('')
      : '<p class="empty">' + escape_(labels.noCheckpoints) + '</p>';

    return '<!DOCTYPE html><html lang="' + language + '"><head><meta charset="utf-8"><style>' +
      '@page{size:letter;margin:.55in}body{font-family:Arial,sans-serif;color:#252525;font-size:11pt;line-height:1.48}' +
      'h1,h2{color:#541622}h1{font-size:25pt;margin:0 0 5px}h2{font-size:15pt;border-bottom:2px solid #d69a35;padding-bottom:5px;margin-top:22px}' +
      '.eyebrow{color:#176f75;font-weight:bold;letter-spacing:1.5px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}' +
      '.meta div,.box,.checkpoint{border:1px solid #ddd5cc;border-radius:10px;padding:10px}.progress{height:14px;background:#eee6dc;border-radius:20px;overflow:hidden}' +
      '.progress span{display:block;height:100%;background:#176f75;width:' + Number(goal.percentComplete || 0) + '%}' +
      '.privacy{margin-top:22px;padding:12px;background:#fff4d8;border-left:5px solid #d69a35;font-size:9pt}.references{page-break-before:always}' +
      '.empty{font-style:italic;color:#666}.checkpoint{margin-bottom:8px;background:#f7faf9}</style></head><body>' +
      '<div class="eyebrow">' + escape_(labels.title) + '</div><h1>' + escape_(goal.title) + '</h1>' +
      '<p>' + escape_(labels.scope) + '</p><div class="meta">' +
      '<div><b>' + escape_(labels.pillar) + ':</b><br>' + escape_(translatePillar_(goal.pillar, language)) + '</div>' +
      '<div><b>' + escape_(labels.timeframe) + ':</b><br>' + escape_(translateTimeframe_(goal.timeframe, language)) + '</div>' +
      '<div><b>' + escape_(labels.status) + ':</b><br>' + escape_(translateStatus_(goal.status, language)) + '</div>' +
      '<div><b>' + escape_(labels.progress) + ':</b><br>' + Number(goal.percentComplete || 0) + '%</div></div>' +
      '<div class="progress"><span></span></div>' +
      '<h2>' + escape_(labels.purpose) + '</h2><div class="box">' + escape_(goal.why || '') + '</div>' +
      '<h2>' + escape_(labels.target) + '</h2><div class="box">' + escape_(goal.targetDescription || '') + '</div>' +
      '<h2>' + escape_(labels.measure) + '</h2><div class="box">' + escape_(goal.successMeasure || '') + '</div>' +
      '<h2>' + escape_(labels.steps) + '</h2>' + stepHtml +
      '<h2>' + escape_(labels.checkpoints) + '</h2>' + checkpointHtml +
      '<p class="citation">' + escape_(labels.citation) + '</p>' +
      '<div class="privacy">' + escape_(labels.privacy) + '</div>' +
      '<section class="references"><h2>' + escape_(labels.references) + '</h2>' +
      '<p>' + escape_(FPD_CONFIG.GUIDEBOOK.APA_REFERENCE) + ' ' +
      escape_(FPD_CONFIG.GUIDEBOOK_URL) + '</p></section></body></html>';
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


  function translateStatus_(value, language) {
    if (language !== 'es') return value;
    return {
      Planning: 'Planificación',
      'In progress': 'En progreso',
      Paused: 'En pausa',
      Completed: 'Completada',
      Archived: 'Archivada'
    }[value] || value;
  }

  function formatDate_(iso) {
    if (!iso) return '';
    try {
      return Utilities.formatDate(new Date(iso), Session.getScriptTimeZone(), 'MMMM d, yyyy');
    } catch (error) {
      return iso;
    }
  }


  function sanitizeFilename_(value) {
    return String(value || 'Goal')
      .replace(/[^A-Za-z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 60) || 'Goal';
  }


  function escape_(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  return { generateGoalPdf: generateGoalPdf };
})();
