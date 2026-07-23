/**
 * In-text citation and References foundation.
 *
 * Research-based learning, news, data stories, videos, discussion guides,
 * reports, and PDFs must contain both in-text citations and References.
 */

const CitationService = (function() {

  function getCitationPreview(contentId) {
    const safeId = fpdSafeText_(contentId, 150);

    if (!safeId) {
      throw new Error('A Content ID is required.');
    }

    const data = DataStoreService.readSources();
    const sourceIndex = {};

    (data.sources || []).forEach(function(source) {
      const id = String(source.id || source.sourceId || '');
      if (id) sourceIndex[id] = source;
    });

    const citations = (data.contentCitations || [])
      .filter(function(citation) {
        return String(citation.contentId || '') === safeId;
      })
      .sort(function(first, second) {
        return Number(first.displayOrder || 0) -
          Number(second.displayOrder || 0);
      });

    const inText = [];
    const references = [];
    const used = {};

    citations.forEach(function(citation) {
      const source = sourceIndex[String(citation.sourceId || '')];
      if (!source) return;

      inText.push(
        citation.inTextOverride ||
        formatInText_(source, citation.locator)
      );

      const sourceId = String(source.id || source.sourceId || '');
      if (!used[sourceId]) {
        references.push(formatReference_(source));
        used[sourceId] = true;
      }
    });

    return {
      contentId: safeId,
      inTextCitations: inText,
      references: references
    };
  }


  function formatInText_(source, locator) {
    const author =
      source.authorOrOrganization ||
      source.organization ||
      source.author ||
      'Source';
    const year = source.year || 'n.d.';
    const location = fpdSafeText_(locator, 100);

    return '(' + author + ', ' + year +
      (location ? ', ' + location : '') + ')';
  }


  function formatReference_(source) {
    if (source.apaReferenceOverride) {
      return String(source.apaReferenceOverride);
    }

    const author =
      source.authorOrOrganization ||
      source.organization ||
      source.author ||
      'Unknown author';
    const year = source.year || 'n.d.';
    const title = source.title || 'Untitled source';
    const publisher = source.publisher || source.publication || '';
    const doi = source.doi
      ? 'https://doi.org/' +
        String(source.doi).replace(/^https?:\/\/doi\.org\//i, '')
      : '';
    const url = doi || source.url || '';

    let reference = author + '. (' + year + '). ' + title + '.';
    if (publisher) reference += ' ' + publisher + '.';
    if (url) reference += ' ' + url;

    return reference;
  }


  return {
    getCitationPreview: getCitationPreview,
    formatInText: formatInText_,
    formatReference: formatReference_
  };
})();
