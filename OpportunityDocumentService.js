
/**
 * Generates an opportunity research and action-plan PDF.
 */

const FPDOpportunityDocumentServiceV9 = (function() {
  function generatePdf(scope, recordId, languageOverride) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const normalizedScope = scope === 'HOUSEHOLD' ? 'HOUSEHOLD' : 'PERSONAL';
    const record = findRecord_(data, normalizedScope, recordId);
    if (!record) throw new Error('FamilyPD could not find that opportunity record.');

    const language = GuidanceService.normalizeLanguage(
      languageOverride ||
      data.personal && data.personal.profile && data.personal.profile.language ||
      'en'
    );
    const html = buildHtml_(record, normalizedScope, language);
    const filename = 'FamilyPD_Opportunity_' +
      sanitizeFilename_(record.title) + '_' + language + '.pdf';
    const pdfBlob = Utilities
      .newBlob(html, 'text/html', 'FamilyPD_Opportunity.html')
      .getAs('application/pdf')
      .setName(filename);

    const folderMap = fpdFolderMap_();
    const parentId = folderMap.OPPORTUNITIES ||
      folderMap.GENERATED || context.rootFolderId;
    const file = DriveApiService.createBinaryFile(
      filename,
      'application/pdf',
      parentId,
      pdfBlob.getBytes()
    );

    DataStoreService.appendActivity(
      data,
      'OPPORTUNITY_PDF_GENERATED',
      'An opportunity research and action-plan PDF was generated.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: language === 'es'
        ? 'Se generó el PDF de oportunidad con Referencias.'
        : 'The opportunity PDF was generated with References.',
      filename: filename,
      driveFileId: file.id,
      driveFileUrl: file.webViewLink ||
        'https://drive.google.com/open?id=' + encodeURIComponent(file.id),
      base64Content: Utilities.base64Encode(pdfBlob.getBytes())
    };
  }


  function findRecord_(data, scope, recordId) {
    const records = scope === 'HOUSEHOLD'
      ? data.shared.opportunities || []
      : data.personal.savedOpportunities || [];
    return records.find(function(item) {
      return String(item.id || '') === String(recordId || '');
    }) || null;
  }


  function buildHtml_(record, scope, language) {
    const es = language === 'es';
    const labels = es ? {
      eyebrow: 'OPORTUNIDAD Y MOVILIDAD FAMILYPD',
      privateScope: 'Plan personal privado',
      sharedScope: 'Oportunidad compartida del hogar',
      category: 'Categoría',
      provider: 'Proveedor',
      audience: 'Audiencia general',
      location: 'Ubicación general',
      status: 'Estado',
      priority: 'Prioridad',
      deadline: 'Fecha límite',
      source: 'Fuente y verificación',
      cost: 'Costo o ayuda financiera',
      eligibility: 'Elegibilidad conocida',
      benefits: 'Beneficios u oportunidad',
      requirements: 'Requisitos para confirmar',
      nextAction: 'Próxima acción',
      actionPlan: 'Plan de acción',
      questions: 'Preguntas pendientes',
      notes: 'Notas generales',
      references: 'Referencias',
      none: 'Todavía no se agregó información.',
      privacy: 'Recordatorio de privacidad: no agregue números de identificación, cuentas, contraseñas, documentos, información médica, direcciones exactas ni otra información confidencial.',
      verification: 'La fecha, elegibilidad, costo y disponibilidad pueden cambiar. Confirme todo en el sitio del proveedor antes de solicitar.',
      citation: 'La estructura de investigación y planificación se adaptó de The Family Personal Development Guidebook (Hall, 2025, pp. 34–41, 106–108).'
    } : {
      eyebrow: 'FAMILYPD OPPORTUNITY & MOBILITY',
      privateScope: 'Private personal plan',
      sharedScope: 'Shared household opportunity',
      category: 'Category',
      provider: 'Provider',
      audience: 'General audience',
      location: 'General location',
      status: 'Status',
      priority: 'Priority',
      deadline: 'Deadline',
      source: 'Source and verification',
      cost: 'Cost or financial support',
      eligibility: 'Known eligibility',
      benefits: 'Benefits or opportunity',
      requirements: 'Requirements to confirm',
      nextAction: 'Next action',
      actionPlan: 'Action plan',
      questions: 'Questions still to answer',
      notes: 'General notes',
      references: 'References',
      none: 'No information has been added yet.',
      privacy: 'Privacy reminder: do not add identification numbers, accounts, passwords, documents, medical information, exact addresses, or other confidential information.',
      verification: 'Deadlines, eligibility, cost, and availability can change. Confirm everything on the provider website before applying.',
      citation: 'Research and planning structure adapted from The Family Personal Development Guidebook (Hall, 2025, pp. 34–41, 106–108).'
    };

    const sourceText = [
      record.provider || '',
      record.domain || '',
      translateTier_(record.sourceTier || '', language),
      translateVerification_(record.verificationStatus || '', language),
      record.lastCheckedAt
        ? (es ? 'Revisado: ' : 'Checked: ') + record.lastCheckedAt.substring(0, 10)
        : ''
    ].filter(Boolean).join(' · ');

    return '<!DOCTYPE html><html lang="' + language + '"><head><meta charset="utf-8"><style>' +
      '@page{size:letter;margin:.55in}body{font-family:Arial,sans-serif;color:#292522;font-size:10.5pt;line-height:1.48}' +
      'h1,h2{color:#541622}h1{font-size:23pt;margin:0 0 5px}h2{font-size:14pt;border-bottom:2px solid #d69a35;padding-bottom:5px;margin-top:20px}' +
      '.eyebrow{color:#176f75;font-weight:bold;letter-spacing:1.3px}.scope{display:inline-block;padding:5px 9px;border-radius:999px;background:#eef7f6;color:#176f75;font-weight:bold}' +
      '.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0}.meta div,.box{border:1px solid #ded7cf;border-radius:9px;padding:9px}' +
      '.box{white-space:pre-wrap}.empty{color:#666;font-style:italic}.notice{margin-top:18px;padding:11px;border-radius:8px;font-size:9pt}' +
      '.privacy{background:#fff4d8;border-left:5px solid #d69a35}.verify{background:#eef7f6;border-left:5px solid #176f75}.citation{font-size:9pt;color:#555}' +
      '.references{page-break-before:always}a{color:#176f75;word-break:break-all}' +
      '</style></head><body>' +
      '<div class="eyebrow">' + escape_(labels.eyebrow) + '</div>' +
      '<h1>' + escape_(record.title) + '</h1>' +
      '<span class="scope">' + escape_(scope === 'HOUSEHOLD' ? labels.sharedScope : labels.privateScope) + '</span>' +
      '<div class="meta">' +
      meta_(labels.category, translateCategory_(record.category || '—', language)) +
      meta_(labels.provider, record.provider || '—') +
      meta_(labels.audience, translateAudience_(record.audience || '—', language)) +
      meta_(labels.location, record.locationLabel || '—') +
      meta_(labels.status, translateStatus_(record.status || '—', language)) +
      meta_(labels.priority, translatePriority_(record.priority || '—', language)) +
      meta_(labels.deadline, record.deadline || '—') +
      meta_(labels.source, sourceText || '—') +
      '</div>' +
      section_(labels.cost, box_(record.costSummary, labels.none)) +
      section_(labels.eligibility, box_(record.eligibility, labels.none)) +
      section_(labels.benefits, box_(record.benefits, labels.none)) +
      section_(labels.requirements, list_(record.requirements, labels.none)) +
      section_(labels.nextAction, box_(record.nextAction, labels.none)) +
      section_(labels.actionPlan, actionList_(record.actionSteps, labels.none, language)) +
      section_(labels.questions, list_(record.questions, labels.none)) +
      section_(labels.notes, box_(record.notes, labels.none)) +
      '<p class="citation">' + escape_(labels.citation) + '</p>' +
      '<div class="notice verify">' + escape_(labels.verification) + '</div>' +
      '<div class="notice privacy">' + escape_(labels.privacy) + '</div>' +
      '<section class="references"><h2>' + escape_(labels.references) + '</h2>' +
      '<p>' + escape_(FPD_CONFIG.GUIDEBOOK.APA_REFERENCE) + ' ' +
      escape_(FPD_CONFIG.GUIDEBOOK_URL) + '</p>' +
      (record.url
        ? '<p>' + escape_((record.provider || record.title) + '. (' +
            (record.lastCheckedAt ? record.lastCheckedAt.substring(0, 10) : 'n.d.') +
            '). ' + record.title + '. ') +
          '<a href="' + escape_(record.url) + '">' + escape_(record.url) + '</a></p>'
        : '') +
      '</section></body></html>';
  }


  function actionList_(items, emptyLabel, language) {
    const values = Array.isArray(items) ? items : [];
    if (!values.length) return '<p class="empty">' + escape_(emptyLabel) + '</p>';
    return '<ol>' + values.map(function(item) {
      const suffix = [
        item.dueDate || '',
        translateActionStatus_(item.status || '', language)
      ].filter(Boolean).join(' · ');
      return '<li>' + escape_(item.text || '') +
        (suffix ? ' <small>(' + escape_(suffix) + ')</small>' : '') +
        '</li>';
    }).join('') + '</ol>';
  }


  function list_(items, emptyLabel) {
    const values = Array.isArray(items) ? items : [];
    return values.length
      ? '<ul>' + values.map(function(value) {
          return '<li>' + escape_(value) + '</li>';
        }).join('') + '</ul>'
      : '<p class="empty">' + escape_(emptyLabel) + '</p>';
  }


  function meta_(label, value) {
    return '<div><b>' + escape_(label) + ':</b><br>' + escape_(value) + '</div>';
  }


  function section_(title, content) {
    return '<h2>' + escape_(title) + '</h2>' + content;
  }


  function box_(value, emptyLabel) {
    return value
      ? '<div class="box">' + escape_(value) + '</div>'
      : '<p class="empty">' + escape_(emptyLabel) + '</p>';
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


  function translateVerification_(value, language) {
    if (language !== 'es') return value;
    return {
      'Official domain checked': 'Dominio oficial revisado',
      'Government-sponsored domain checked':
        'Dominio patrocinado por el gobierno revisado',
      'Link checked': 'Enlace revisado',
      'Check failed': 'No se pudo revisar',
      'Not yet checked': 'Todavía no revisado'
    }[value] || value;
  }


  function translateActionStatus_(value, language) {
    if (language !== 'es') return value;
    return value === 'Completed' ? 'Completada' :
      value === 'Open' ? 'Pendiente' : value;
  }


  function sanitizeFilename_(value) {
    return String(value || 'Opportunity')
      .replace(/[^A-Za-z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 70) || 'Opportunity';
  }


  function escape_(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  return {
    generatePdf: generatePdf
  };
})();
