/**
 * Generates privacy-first PDFs for shared policies, systems, checklists,
 * and general safety plans.
 */

const FPDSystemsDocumentServiceV8 = (function() {

  function generatePdf(recordType, recordId, languageOverride) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const record = findRecord_(data, recordType, recordId);

    if (!record) {
      throw new Error('FamilyPD could not find that system record.');
    }

    const language = GuidanceService.normalizeLanguage(
      languageOverride ||
      data.personal && data.personal.profile && data.personal.profile.language ||
      'en'
    );
    const normalized = normalizeRecord_(record, recordType);
    const html = buildHtml_(normalized, language);
    const filename = 'FamilyPD_' +
      sanitizeFilename_(normalized.recordType) + '_' +
      sanitizeFilename_(normalized.title) + '_' +
      language + '.pdf';

    const pdfBlob = Utilities
      .newBlob(html, 'text/html', 'FamilyPD_System_Record.html')
      .getAs('application/pdf')
      .setName(filename);

    const folderMap = fpdFolderMap_();
    const parentId = folderMap.SYSTEMS || folderMap.PLANNING ||
      folderMap.GENERATED || context.rootFolderId;
    const file = DriveApiService.createBinaryFile(
      filename,
      'application/pdf',
      parentId,
      pdfBlob.getBytes()
    );

    DataStoreService.appendActivity(
      data,
      'SYSTEM_PDF_GENERATED',
      'A privacy-first system, policy, checklist, or safety-plan PDF was generated.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: language === 'es'
        ? 'Se generó el PDF con una página de Referencias.'
        : 'The PDF was generated with a References page.',
      filename: filename,
      driveFileId: file.id,
      driveFileUrl: file.webViewLink ||
        'https://drive.google.com/open?id=' + encodeURIComponent(file.id),
      base64Content: Utilities.base64Encode(pdfBlob.getBytes())
    };
  }


  function findRecord_(data, recordType, recordId) {
    const id = String(recordId || '');
    const isSafety = String(recordType || '') === 'Safety Plan';
    const first = isSafety ? data.shared.safety || [] : data.shared.policies || [];
    const second = isSafety ? data.shared.policies || [] : data.shared.safety || [];

    return first.find(function(item) {
      return String(item.id || '') === id;
    }) || second.find(function(item) {
      return String(item.id || '') === id;
    }) || null;
  }


  function normalizeRecord_(item, recordType) {
    item = item || {};
    const isSafety = String(recordType || item.recordType || '') === 'Safety Plan';

    return {
      recordType: isSafety
        ? 'Safety Plan'
        : ['Policy', 'System', 'Checklist'].indexOf(item.recordType) >= 0
          ? item.recordType
          : 'Policy',
      title: fpdSafeText_(item.title, 220),
      pillar: fpdSafeText_(item.pillar || item.category, 80),
      status: fpdSafeText_(item.status || item.reviewStatus, 80),
      purpose: fpdSafeText_(item.purpose, 1600),
      statement: fpdSafeText_(
        isSafety
          ? item.generalInstructions || item.statement
          : item.statement,
        2500
      ),
      appliesTo: sanitizeList_(isSafety ? item.audience : item.appliesTo, 25, 120),
      ownerRole: fpdSafeText_(item.ownerRole, 120),
      steps: sanitizeList_(item.steps, 12, 1000),
      priority: fpdSafeText_(item.priority, 80),
      reviewFrequency: fpdSafeText_(item.reviewFrequency, 80),
      effectiveDate: fpdSafeText_(item.effectiveDate, 20),
      lastReviewedDate: fpdSafeText_(item.lastReviewedDate, 20),
      nextReviewDate: fpdSafeText_(item.nextReviewDate || item.reviewDate, 20),
      notes: fpdSafeText_(item.notes, 3000)
    };
  }


  function buildHtml_(record, language) {
    const es = language === 'es';
    const labels = es ? {
      heading: 'SISTEMA, POLÍTICA Y SEGURIDAD FAMILYPD',
      type: 'Tipo',
      pillar: 'Área',
      status: 'Estado',
      purpose: 'Propósito',
      statement: record.recordType === 'Safety Plan'
        ? 'Orientación general'
        : record.recordType === 'Policy'
          ? 'Acuerdo o política'
          : 'Descripción del sistema',
      appliesTo: 'Se aplica a',
      owner: 'Rol responsable',
      steps: 'Pasos o lista',
      priority: 'Prioridad',
      review: 'Frecuencia de revisión',
      effective: 'Fecha de inicio',
      lastReviewed: 'Última revisión',
      nextReview: 'Próxima revisión',
      notes: 'Notas generales',
      references: 'Referencias',
      noItems: 'Todavía no se agregaron elementos.',
      privacy:
        'Recordatorio de privacidad: este documento es para planificación general. No agregue direcciones exactas, contactos de emergencia, diagnósticos, datos médicos, números de cuenta, contraseñas, documentos de identidad ni información que revele cuándo el hogar está vacío.',
      safety:
        'Los recordatorios de seguridad de FamilyPD no sustituyen orientación oficial, servicios de emergencia ni profesionales calificados.',
      citation:
        'La estructura de sistemas y políticas se adaptó de The Family Personal Development Guidebook (Hall, 2025, pp. 15–20, 57–63).'
    } : {
      heading: 'FAMILYPD SYSTEMS, POLICIES & SAFETY',
      type: 'Type',
      pillar: 'Area',
      status: 'Status',
      purpose: 'Purpose',
      statement: record.recordType === 'Safety Plan'
        ? 'General guidance'
        : record.recordType === 'Policy'
          ? 'Agreement or policy'
          : 'System description',
      appliesTo: 'Applies to',
      owner: 'Responsible role',
      steps: 'Steps or checklist',
      priority: 'Priority',
      review: 'Review frequency',
      effective: 'Effective date',
      lastReviewed: 'Last reviewed',
      nextReview: 'Next review',
      notes: 'General notes',
      references: 'References',
      noItems: 'No items have been added yet.',
      privacy:
        'Privacy reminder: this document is for general planning. Do not add exact addresses, emergency contacts, diagnoses, medical details, account numbers, passwords, identification documents, or information revealing when the household is empty.',
      safety:
        'FamilyPD safety reminders do not replace official guidance, emergency services, or qualified professionals.',
      citation:
        'Systems and policies structure adapted from The Family Personal Development Guidebook (Hall, 2025, pp. 15–20, 57–63).'
    };

    const stepHtml = record.steps.length
      ? '<ol>' + record.steps.map(function(step) {
          return '<li>' + escape_(step) + '</li>';
        }).join('') + '</ol>'
      : '<p class="empty">' + escape_(labels.noItems) + '</p>';

    const appliesHtml = record.appliesTo.length
      ? '<ul>' + record.appliesTo.map(function(value) {
          return '<li>' + escape_(translateRole_(value, language)) + '</li>';
        }).join('') + '</ul>'
      : '<p class="empty">' + escape_(labels.noItems) + '</p>';

    return '<!DOCTYPE html><html lang="' + language + '"><head><meta charset="utf-8"><style>' +
      '@page{size:letter;margin:.55in}body{font-family:Arial,sans-serif;color:#292522;font-size:10.5pt;line-height:1.48}' +
      'h1,h2{color:#541622}h1{font-size:23pt;margin:0 0 4px}h2{font-size:14pt;border-bottom:2px solid #d69a35;padding-bottom:5px;margin-top:21px}' +
      '.eyebrow{color:#176f75;font-weight:bold;letter-spacing:1.3px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0}' +
      '.meta div,.box{border:1px solid #ded7cf;border-radius:9px;padding:9px}.box{white-space:pre-wrap}.empty{color:#666;font-style:italic}' +
      '.notice{margin-top:18px;padding:11px;border-radius:8px;font-size:9pt}.privacy{background:#fff4d8;border-left:5px solid #d69a35}' +
      '.safety{background:#eef7f6;border-left:5px solid #176f75}.citation{font-size:9pt;color:#555}.references{page-break-before:always}' +
      '</style></head><body>' +
      '<div class="eyebrow">' + escape_(labels.heading) + '</div>' +
      '<h1>' + escape_(record.title) + '</h1>' +
      '<div class="meta">' +
      meta_(labels.type, translateType_(record.recordType, language)) +
      meta_(labels.pillar, translatePillar_(record.pillar, language)) +
      meta_(labels.status, translateStatus_(record.status, language)) +
      meta_(labels.owner, translateRole_(record.ownerRole || '—', language)) +
      meta_(labels.priority, translatePriority_(record.priority || 'Routine', language)) +
      meta_(labels.review, translateFrequency_(record.reviewFrequency || 'As needed', language)) +
      '</div>' +
      section_(labels.purpose, box_(record.purpose, labels.noItems)) +
      section_(labels.statement, box_(record.statement, labels.noItems)) +
      section_(labels.appliesTo, appliesHtml) +
      section_(labels.steps, stepHtml) +
      '<h2>' + escape_(es ? 'Revisión y seguimiento' : 'Review and follow-through') + '</h2>' +
      '<div class="meta">' +
      meta_(labels.effective, record.effectiveDate || '—') +
      meta_(labels.lastReviewed, record.lastReviewedDate || '—') +
      meta_(labels.nextReview, record.nextReviewDate || '—') +
      '</div>' +
      section_(labels.notes, box_(record.notes, labels.noItems)) +
      '<p class="citation">' + escape_(labels.citation) + '</p>' +
      '<div class="notice safety">' + escape_(labels.safety) + '</div>' +
      '<div class="notice privacy">' + escape_(labels.privacy) + '</div>' +
      '<section class="references"><h2>' + escape_(labels.references) + '</h2>' +
      '<p>' + escape_(FPD_CONFIG.GUIDEBOOK.APA_REFERENCE) + ' ' +
      escape_(FPD_CONFIG.GUIDEBOOK_URL) + '</p></section>' +
      '</body></html>';
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


  function sanitizeList_(values, maximum, length) {
    return (Array.isArray(values) ? values : [])
      .slice(0, maximum)
      .map(function(value) { return fpdSafeText_(value, length); })
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
    return String(value || 'System_Record')
      .replace(/[^A-Za-z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 70) || 'System_Record';
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
