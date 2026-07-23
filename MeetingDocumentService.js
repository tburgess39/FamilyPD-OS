/**
 * Generates meeting agenda and minutes PDFs with FamilyPD citations and
 * References. Selected news articles are listed in References.
 */

const MeetingDocumentService = (function() {

  function generateMeetingPdf(meetingId, documentType, languageOverride) {
    const context = WorkspaceService.getCurrentContext();
    const data = DataStoreService.readData();
    const meeting = (data.shared.meetings || []).find(function(item) {
      return String(item.id || '') === String(meetingId || '');
    });
    if (!meeting) throw new Error('FamilyPD could not find that meeting.');

    const language = GuidanceService.normalizeLanguage(
      languageOverride ||
      data.personal && data.personal.profile && data.personal.profile.language ||
      'en'
    );
    const type = String(documentType || 'AGENDA').toUpperCase() === 'MINUTES'
      ? 'MINUTES' : 'AGENDA';

    const html = buildHtml_(meeting, type, language);
    const datePart = meeting.scheduledDate || new Date().toISOString().substring(0, 10);
    const filename = 'FamilyPD_' +
      (type === 'MINUTES' ? 'Meeting_Minutes_' : 'Meeting_Agenda_') +
      sanitizeFilename_(meeting.title) + '_' + datePart + '_' + language + '.pdf';

    const pdfBlob = Utilities
      .newBlob(html, 'text/html', 'FamilyPD_Meeting.html')
      .getAs('application/pdf')
      .setName(filename);

    const folderMap = fpdFolderMap_();
    const parentId = folderMap.MEETINGS || folderMap.GENERATED || context.rootFolderId;
    const file = DriveApiService.createBinaryFile(
      filename,
      'application/pdf',
      parentId,
      pdfBlob.getBytes()
    );

    DataStoreService.appendActivity(
      data,
      type === 'MINUTES' ? 'MEETING_MINUTES_PDF_GENERATED' : 'MEETING_AGENDA_PDF_GENERATED',
      'A privacy-first meeting document was generated.'
    );
    DataStoreService.saveData(data);

    return {
      success: true,
      message: language === 'es'
        ? 'Se generó el documento de la reunión con una sección de Referencias.'
        : 'The meeting document was generated with a References section.',
      filename: filename,
      driveFileId: file.id,
      driveFileUrl: file.webViewLink ||
        'https://drive.google.com/open?id=' + encodeURIComponent(file.id),
      base64Content: Utilities.base64Encode(pdfBlob.getBytes())
    };
  }


  function buildHtml_(meeting, type, language) {
    const es = language === 'es';
    const labels = es ? {
      agenda: 'AGENDA DE REUNIÓN FAMILYPD',
      minutes: 'NOTAS Y DECISIONES DE REUNIÓN FAMILYPD',
      type: 'Tipo',
      status: 'Estado',
      date: 'Fecha',
      time: 'Hora',
      duration: 'Duración',
      format: 'Formato',
      facilitator: 'Facilitador',
      attendees: 'Participantes',
      location: 'Nota de ubicación',
      opening: 'Mensaje de apertura',
      recap: 'Revisión anterior',
      meal: 'Comida',
      materials: 'Materiales',
      topics: 'Temas de la agenda',
      purpose: 'Propósito',
      questions: 'Preguntas para conversar',
      outcome: 'Resultado deseado',
      article: 'Artículo para conversar',
      decisions: 'Decisiones',
      actions: 'Próximas acciones',
      assigned: 'Rol responsable',
      due: 'Fecha objetivo',
      actionStatus: 'Estado',
      notes: 'Notas generales',
      closing: 'Mensaje de cierre',
      references: 'Referencias',
      noItems: 'No se agregaron elementos.',
      privacy:
        'Recordatorio de privacidad: use etiquetas generales y planificación no sensible. No agregue direcciones exactas, números de teléfono, correos, diagnósticos, saldos de cuentas, contraseñas, identificadores ni expedientes confidenciales.',
      citation:
        'La estructura de reunión se adaptó de The Family Personal Development Guidebook (Hall, 2025, pp. 17–20, 54, 57–63).',
      newsNotice:
        'La presencia de un artículo en este documento no significa que FamilyPD haya comprobado cada afirmación. Revise la fuente y el contenido antes de tomar decisiones.'
    } : {
      agenda: 'FAMILYPD MEETING AGENDA',
      minutes: 'FAMILYPD MEETING NOTES & DECISIONS',
      type: 'Type',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      format: 'Format',
      facilitator: 'Facilitator',
      attendees: 'Participants',
      location: 'Location note',
      opening: 'Opening message',
      recap: 'Previous meeting review',
      meal: 'Meal',
      materials: 'Materials',
      topics: 'Agenda topics',
      purpose: 'Purpose',
      questions: 'Discussion questions',
      outcome: 'Desired outcome',
      article: 'Discussion article',
      decisions: 'Decisions',
      actions: 'Next actions',
      assigned: 'Responsible role',
      due: 'Target date',
      actionStatus: 'Status',
      notes: 'General notes',
      closing: 'Closing message',
      references: 'References',
      noItems: 'No items were added.',
      privacy:
        'Privacy reminder: use general labels and non-sensitive planning. Do not add exact addresses, phone numbers, emails, diagnoses, account balances, passwords, identifiers, or confidential records.',
      citation:
        'Meeting structure adapted from The Family Personal Development Guidebook (Hall, 2025, pp. 17–20, 54, 57–63).',
      newsNotice:
        'The presence of an article in this document does not mean FamilyPD fact-checked every claim. Review the source and content before making decisions.'
    };

    const topics = Array.isArray(meeting.topics) ? meeting.topics : [];
    const materials = Array.isArray(meeting.materials) ? meeting.materials : [];
    const attendees = Array.isArray(meeting.attendeeRoles) ? meeting.attendeeRoles : [];
    const decisions = Array.isArray(meeting.decisions) ? meeting.decisions : [];
    const actionItems = Array.isArray(meeting.actionItems) ? meeting.actionItems : [];
    const newsArticles = [];
    topics.forEach(function(topic) {
      if (topic.article && topic.article.url) newsArticles.push(topic.article);
    });

    const meta = [
      meta_(labels.type, translateType_(meeting.meetingType, language)),
      meta_(labels.status, translateStatus_(meeting.status, language)),
      meta_(labels.date, meeting.scheduledDate || ''),
      meta_(labels.time, meeting.scheduledTime || ''),
      meta_(labels.duration, Number(meeting.durationMinutes || 60) + (es ? ' minutos' : ' minutes')),
      meta_(labels.format, translateFormat_(meeting.meetingFormat, language)),
      meta_(labels.facilitator, translateRole_(meeting.facilitatorRole || '', language)),
      meta_(labels.location, meeting.locationNote || '')
    ].join('');

    const topicHtml = topics.length
      ? topics.map(function(topic, index) {
          const promptHtml = (topic.prompts || []).length
            ? '<ul>' + topic.prompts.map(function(prompt) {
                return '<li>' + escape_(prompt) + '</li>';
              }).join('') + '</ul>'
            : '<p class="empty">' + escape_(labels.noItems) + '</p>';

          const articleHtml = topic.article && topic.article.url
            ? '<div class="article"><b>' + escape_(labels.article) + ':</b> ' +
              '<a href="' + escapeAttribute_(topic.article.url) + '">' +
              escape_(topic.article.title) + '</a><br>' +
              '<span>' + escape_(topic.article.publisher) +
              (topic.article.publishedDate ? ' · ' + escape_(topic.article.publishedDate) : '') +
              '</span></div>'
            : '';

          return '<article class="topic"><div class="topic-number">' + (index + 1) + '</div>' +
            '<div><h3>' + escape_(topic.title) + '</h3>' +
            '<p class="tag">' + escape_(translatePillar_(topic.pillar, language)) +
            ' · ' + Number(topic.timeMinutes || 15) + (es ? ' min' : ' min') + '</p>' +
            (topic.purpose ? '<p><b>' + escape_(labels.purpose) + ':</b> ' +
              escape_(topic.purpose) + '</p>' : '') +
            '<h4>' + escape_(labels.questions) + '</h4>' + promptHtml +
            (topic.desiredOutcome ? '<p><b>' + escape_(labels.outcome) + ':</b> ' +
              escape_(topic.desiredOutcome) + '</p>' : '') +
            articleHtml + '</div></article>';
        }).join('')
      : '<p class="empty">' + escape_(labels.noItems) + '</p>';

    const decisionsHtml = decisions.length
      ? '<ul>' + decisions.map(function(item) {
          return '<li>' + escape_(item.text) + '</li>';
        }).join('') + '</ul>'
      : '<p class="empty">' + escape_(labels.noItems) + '</p>';

    const actionsHtml = actionItems.length
      ? '<table><thead><tr><th>' + escape_(labels.actions) + '</th><th>' +
        escape_(labels.assigned) + '</th><th>' + escape_(labels.due) +
        '</th><th>' + escape_(labels.actionStatus) + '</th></tr></thead><tbody>' +
        actionItems.map(function(item) {
          return '<tr><td>' + escape_(item.text) + '</td><td>' +
            escape_(translateRole_(item.assignedRole || '', language)) + '</td><td>' +
            escape_(item.dueDate || '') + '</td><td>' +
            escape_(item.status || '') + '</td></tr>';
        }).join('') + '</tbody></table>'
      : '<p class="empty">' + escape_(labels.noItems) + '</p>';

    const references = [
      '<p>' + escape_(FPD_CONFIG.GUIDEBOOK.APA_REFERENCE) + ' ' +
        escape_(FPD_CONFIG.GUIDEBOOK_URL) + '</p>'
    ];
    newsArticles.forEach(function(article) {
      references.push(
        '<p>' + escape_(article.publisher || 'Publisher') + '. (' +
        escape_((article.publishedDate || '').substring(0, 4) || 'n.d.') +
        '). <em>' + escape_(article.title || 'Article') + '</em>. ' +
        escape_(article.url || '') + '</p>'
      );
    });

    return '<!DOCTYPE html><html lang="' + language + '"><head><meta charset="utf-8"><style>' +
      '@page{size:letter;margin:.5in}body{font-family:Arial,sans-serif;color:#282421;font-size:10.5pt;line-height:1.45}' +
      'h1,h2,h3,h4{color:#541622}h1{font-size:24pt;margin:0 0 4px}h2{font-size:15pt;border-bottom:2px solid #d69a35;padding-bottom:5px;margin-top:22px}' +
      'h3{margin:0 0 4px}.eyebrow{color:#176f75;font-weight:bold;letter-spacing:1.4px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:15px 0}' +
      '.meta div,.box,.topic,.article{border:1px solid #ded6cd;border-radius:9px;padding:9px}.topic{display:grid;grid-template-columns:32px 1fr;gap:10px;margin-bottom:10px}' +
      '.topic-number{width:28px;height:28px;border-radius:50%;background:#176f75;color:#fff;font-weight:bold;text-align:center;line-height:28px}' +
      '.tag{color:#176f75;font-size:9pt;font-weight:bold;margin:2px 0 7px}.article{background:#f3f8f7;margin-top:8px}.article a{color:#176f75;font-weight:bold}' +
      '.empty{font-style:italic;color:#666}ul{margin-top:5px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d8d0c7;padding:7px;text-align:left;vertical-align:top}' +
      'th{background:#f5eee6;color:#541622}.privacy{margin-top:20px;padding:11px;background:#fff4d8;border-left:5px solid #d69a35;font-size:9pt}' +
      '.citation{font-size:9pt;color:#555}.references{page-break-before:always}.news-notice{font-size:9pt;color:#555;border-left:4px solid #176f75;padding-left:9px}' +
      '</style></head><body>' +
      '<div class="eyebrow">' + escape_(type === 'MINUTES' ? labels.minutes : labels.agenda) + '</div>' +
      '<h1>' + escape_(meeting.title) + '</h1><div class="meta">' + meta + '</div>' +
      section_(labels.attendees, attendees.length ? '<ul>' + attendees.map(function(value) {
        return '<li>' + escape_(translateRole_(value, language)) + '</li>';
      }).join('') + '</ul>' : '<p class="empty">' + escape_(labels.noItems) + '</p>') +
      section_(labels.opening, box_(meeting.openingMessage, labels.noItems)) +
      section_(labels.recap, box_(meeting.previousRecap, labels.noItems)) +
      section_(labels.materials, materials.length ? '<ul>' + materials.map(function(value) {
        return '<li>' + escape_(value) + '</li>';
      }).join('') + '</ul>' : '<p class="empty">' + escape_(labels.noItems) + '</p>') +
      section_(labels.meal, box_(meeting.mealPlan, labels.noItems)) +
      section_(labels.topics, topicHtml) +
      (type === 'MINUTES'
        ? section_(labels.notes, box_(meeting.notes, labels.noItems)) +
          section_(labels.decisions, decisionsHtml) +
          section_(labels.actions, actionsHtml)
        : '') +
      section_(labels.closing, box_(meeting.closingMessage, labels.noItems)) +
      (newsArticles.length ? '<p class="news-notice">' + escape_(labels.newsNotice) + '</p>' : '') +
      '<p class="citation">' + escape_(labels.citation) + '</p>' +
      '<div class="privacy">' + escape_(labels.privacy) + '</div>' +
      '<section class="references"><h2>' + escape_(labels.references) + '</h2>' +
      references.join('') + '</section></body></html>';
  }


  function meta_(label, value) {
    return '<div><b>' + escape_(label) + ':</b><br>' + escape_(value || '—') + '</div>';
  }


  function section_(title, content) {
    return '<h2>' + escape_(title) + '</h2>' + content;
  }


  function box_(value, emptyLabel) {
    return value
      ? '<div class="box">' + escape_(value) + '</div>'
      : '<p class="empty">' + escape_(emptyLabel) + '</p>';
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


  function sanitizeFilename_(value) {
    return String(value || 'Meeting')
      .replace(/[^A-Za-z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 60) || 'Meeting';
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
    generateMeetingPdf: generateMeetingPdf
  };
})();
