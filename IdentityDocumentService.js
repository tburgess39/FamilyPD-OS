/**
 * FamilyPD Family Profile document generator
 * Build 9.2 - Guided Foundation Update
 */
const FPDFamilyProfileDocumentServiceV100 = (function () {
  'use strict';

  function createProfileFiles() {
    const profile = FPDFamilyProfileServiceV100.getProfile();
    validateProfile_(profile);

    const destination = FPDFamilyProfileServiceV100.getProfileFolder(true);
    if (!destination) {
      const detail = typeof FPDDriveFileServiceV10 !== 'undefined' ? FPDDriveFileServiceV10.connectionMessage() : 'The FamilyPD Workspace connection is unavailable.';
      throw new Error(detail);
    }

    const familyLabel = clean_(profile.familyName) || 'Our Family';
    const dateLabel = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const baseName = sanitizeFileName_('FamilyPD Family Profile - ' + familyLabel + ' - ' + dateLabel);
    const document = DocumentApp.create(baseName);
    const body = document.getBody();
    body.clear();

    addTitle_(body, familyLabel + ' Family Profile');
    if (profile.familyTagline) {
      body.appendParagraph(profile.familyTagline)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
        .setItalic(true);
    }
    body.appendParagraph('Created: ' + friendlyDate_(dateLabel))
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendHorizontalRule();

    addSection_(body, 'Our Family Story', profile.familyStory);
    addSection_(body, 'The Home Environment We Are Building', profile.homeFeeling);
    addSection_(body, 'Our Mission', profile.mission);
    addSection_(body, 'Our Vision', profile.vision);

    addHeading_(body, 'Our Core Values');
    if (profile.values.length) {
      const table = body.appendTable();
      const header = table.appendTableRow();
      header.appendTableCell('Value');
      header.appendTableCell('What It Means to Us');
      header.appendTableCell('What It Looks Like in Practice');
      profile.values.forEach(function (value) {
        const row = table.appendTableRow();
        row.appendTableCell(value.name || 'Value');
        row.appendTableCell(value.meaning || 'Not yet described.');
        row.appendTableCell(value.behaviors || 'Not yet described.');
      });
    } else {
      body.appendParagraph('Core values have not been selected yet.');
    }

    addSection_(body, 'Our Shared Commitments', profile.commitments);

    addHeading_(body, 'Family Members, Roles, and Contributions');
    if (profile.members.length) {
      const memberTable = body.appendTable();
      const header = memberTable.appendTableRow();
      header.appendTableCell('Family Member');
      header.appendTableCell('Role / Contribution');
      header.appendTableCell('Responsibilities');
      header.appendTableCell('Strengths');
      profile.members.forEach(function (member) {
        const row = memberTable.appendTableRow();
        row.appendTableCell(member.name + (member.relationship ? '\n' + member.relationship : ''));
        row.appendTableCell(member.roleTitle || 'Family member');
        row.appendTableCell(member.responsibilities || 'Not yet assigned.');
        row.appendTableCell(member.strengths || 'Not yet described.');
      });
    } else {
      body.appendParagraph('Family members and roles have not been added yet.');
    }

    addHeading_(body, 'Our Starter Goals');
    if (profile.goals.length) {
      const goalTable = body.appendTable();
      const header = goalTable.appendTableRow();
      header.appendTableCell('Pillar');
      header.appendTableCell('Goal');
      header.appendTableCell('Why It Matters');
      header.appendTableCell('First Step');
      header.appendTableCell('Rhythm');
      profile.goals.forEach(function (goal) {
        const row = goalTable.appendTableRow();
        row.appendTableCell(goal.pillar || 'Goals');
        row.appendTableCell(goal.title || 'Goal');
        row.appendTableCell(goal.why || 'Not yet described.');
        row.appendTableCell(goal.firstStep || 'Not yet selected.');
        row.appendTableCell(capitalize_(goal.timeframe));
      });
    } else {
      body.appendParagraph('Starter goals have not been selected yet.');
    }

    addSection_(body, 'Our Family Strengths', profile.strengths);
    addSection_(body, 'Traditions We Want to Protect or Build', profile.traditions);
    addSection_(body, 'Culture, Heritage, and Beliefs We Want to Honor', profile.cultureNotes);

    addHeading_(body, 'Family Agreement');
    body.appendParagraph('We will revisit this profile as our family grows, learns, and changes. We will use it to guide meetings, goals, responsibilities, decisions, and how we treat one another.');
    body.appendParagraph('');
    profile.members.forEach(function (member) {
      body.appendParagraph(member.name + ': ____________________________________    Date: _______________');
    });

    body.appendHorizontalRule();
    body.appendParagraph('FamilyPD privacy reminder: Do not place passwords, account numbers, Social Security numbers, exact dates of birth, medical record details, or other sensitive information in this document.').setItalic(true);
    document.saveAndClose();

    if (typeof FPDDriveFileServiceV10 === 'undefined') {
      throw new Error('FPDDriveFileService.gs is required for Family Profile file creation.');
    }

    const documentId = document.getId();
    const movedDocument = FPDDriveFileServiceV10.moveFile(documentId, destination.id);
    const pdfBlob = FPDDriveFileServiceV10.exportPdf(documentId, baseName + '.pdf');
    const pdfFile = FPDDriveFileServiceV10.createBlobFile(
      destination.id,
      baseName + '.pdf',
      pdfBlob,
      'Generated by the FamilyPD Family Profile.'
    );

    const result = {
      ok: true,
      documentId: documentId,
      documentUrl: movedDocument.webViewLink || 'https://docs.google.com/document/d/' + documentId + '/edit',
      pdfId: pdfFile.id,
      pdfUrl: pdfFile.webViewLink || 'https://drive.google.com/open?id=' + encodeURIComponent(pdfFile.id),
      folderUrl: destination.webViewLink || FPDDriveFileServiceV10.folderUrl(destination.id),
      fileName: pdfFile.name || (baseName + '.pdf'),
      createdAt: new Date().toISOString()
    };

    FPDFamilyProfileServiceV100.updateLastDocument(result);
    return result;
  }

  function validateProfile_(profile) {
    if (!profile.journeyMode) throw new Error('Choose Guided Foundation or Personalized Journey first.');
    if (!clean_(profile.familyName)) throw new Error('Add the family name or preferred profile name before creating the Family Profile.');
    if (!clean_(profile.mission)) throw new Error('Select or write a family mission before creating the Family Profile.');
    if (!clean_(profile.vision)) throw new Error('Select or write a family vision before creating the Family Profile.');
    if (!profile.values || profile.values.length < 3) throw new Error('Select at least three core values before creating the Family Profile.');
  }

  function addTitle_(body, text) {
    body.appendParagraph(text)
      .setHeading(DocumentApp.ParagraphHeading.TITLE)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  }

  function addHeading_(body, text) {
    body.appendParagraph(text).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  }

  function addSection_(body, heading, value) {
    addHeading_(body, heading);
    body.appendParagraph(clean_(value) || 'No response has been entered for this section yet.');
  }

  function capitalize_(value) {
    const text = clean_(value);
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function friendlyDate_(value) {
    const match = clean_(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[2] + '/' + match[3] + '/' + match[1] : clean_(value);
  }

  function sanitizeFileName_(value) {
    return clean_(value)
      .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 140) || 'FamilyPD Family Profile';
  }

  function clean_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  return { createProfileFiles: createProfileFiles };
}());

function fpdFamilyProfileCreateFiles() {
  return FPDFamilyProfileDocumentServiceV100.createProfileFiles();
}
