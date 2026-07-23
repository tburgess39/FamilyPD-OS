/**
 * Optional recent-news suggestions for FamilyPD meeting discussions.
 *
 * GDELT is used when available. Because third-party news APIs can be
 * temporarily unavailable or blocked, FamilyPD never stops the meeting
 * planner. It returns safe browser-based search links as a fallback so a
 * family can still locate a current story and paste the exact HTTPS article
 * link into the planner.
 *
 * FamilyPD checks metadata and links; it does not certify every claim in an
 * article or endorse a publisher.
 */

const NewsService = (function() {
  const QUERY_MAP = {
    en: {
      Health: '("family health" OR "mental health" OR "public health" OR "child safety") sourcelang:english',
      Relationships: '("family relationships" OR "community support" OR "youth wellbeing" OR "social connection") sourcelang:english',
      Education: '("education opportunity" OR "career training" OR "digital literacy" OR "student success") sourcelang:english',
      Finances: '("financial literacy" OR "consumer protection" OR "cost of living" OR "family finances") sourcelang:english',
      Goals: '("goal setting" OR "career opportunity" OR "personal development" OR "community achievement") sourcelang:english',
      Organization: '("family support program" OR "community resource" OR "household preparedness" OR "youth program") sourcelang:english'
    },
    es: {
      Health: '("salud familiar" OR "salud mental" OR "salud pública" OR "seguridad infantil") sourcelang:spanish',
      Relationships: '("relaciones familiares" OR "apoyo comunitario" OR "bienestar juvenil" OR "conexión social") sourcelang:spanish',
      Education: '("oportunidad educativa" OR "capacitación laboral" OR "alfabetización digital" OR "éxito estudiantil") sourcelang:spanish',
      Finances: '("educación financiera" OR "protección del consumidor" OR "costo de vida" OR "finanzas familiares") sourcelang:spanish',
      Goals: '("establecimiento de metas" OR "oportunidad laboral" OR "desarrollo personal" OR "logro comunitario") sourcelang:spanish',
      Organization: '("programa de apoyo familiar" OR "recurso comunitario" OR "preparación del hogar" OR "programa juvenil") sourcelang:spanish'
    }
  };

  const BROWSER_QUERY_MAP = {
    en: {
      Health: 'family health mental health public health child safety',
      Relationships: 'family relationships community support youth wellbeing social connection',
      Education: 'education opportunity career training digital literacy student success',
      Finances: 'financial literacy consumer protection cost of living family finances',
      Goals: 'goal setting career opportunity personal development community achievement',
      Organization: 'family support program community resources household preparedness youth program'
    },
    es: {
      Health: 'salud familiar salud mental salud pública seguridad infantil',
      Relationships: 'relaciones familiares apoyo comunitario bienestar juvenil conexión social',
      Education: 'oportunidad educativa capacitación laboral alfabetización digital éxito estudiantil',
      Finances: 'educación financiera protección del consumidor costo de vida finanzas familiares',
      Goals: 'metas oportunidad laboral desarrollo personal logro comunitario',
      Organization: 'programa de apoyo familiar recursos comunitarios preparación del hogar programa juvenil'
    }
  };


  function searchRecentNews(pillar, language) {
    const lang = GuidanceService.normalizeLanguage(language);
    const cleanPillar = [
      'Health',
      'Relationships',
      'Education',
      'Finances',
      'Goals',
      'Organization'
    ].indexOf(pillar) >= 0 ? pillar : 'Organization';

    const cache = CacheService.getUserCache();
    const cacheKey = 'FPD_NEWS_V2_' + lang + '_' + cleanPillar;
    const cached = cache.get(cacheKey);
    if (cached) {
      const parsed = fpdParseJson_(cached, null);
      if (parsed) return parsed;
    }

    const query = QUERY_MAP[lang][cleanPillar];
    const attempts = [
      buildGdeltUrl_(query, 'json', FPD_CONFIG.NEWS.SEARCH_TIMESPAN),
      buildGdeltUrl_(query, 'jsonfeed', '90d'),
      buildGdeltUrl_(query, 'json', '30d')
    ];

    let results = [];
    let providerMessage = '';
    let lastStatus = 0;

    for (let index = 0; index < attempts.length; index += 1) {
      const attempt = fetchGdelt_(attempts[index]);
      lastStatus = attempt.status || lastStatus;
      if (!attempt.success) continue;

      results = attempt.articles
        .map(normalizeArticle_)
        .filter(isAcceptableArticle_)
        .slice(0, FPD_CONFIG.NEWS.MAX_RESULTS);

      if (results.length) {
        providerMessage = attempt.format === 'jsonfeed'
          ? 'GDELT JSONFeed fallback'
          : FPD_CONFIG.NEWS.PROVIDER;
        break;
      }
    }

    const fallbackSearches = results.length
      ? []
      : buildFallbackSearches_(cleanPillar, lang);

    const output = {
      provider: providerMessage || FPD_CONFIG.NEWS.PROVIDER,
      pillar: cleanPillar,
      language: lang,
      searchedAt: fpdNow_(),
      results: results,
      fallbackSearches: fallbackSearches,
      serviceAvailable: Boolean(results.length),
      serviceStatus: lastStatus,
      notice: results.length
        ? (lang === 'es'
          ? 'Revise el artículo antes de usarlo. FamilyPD muestra metadatos recientes, pero no realiza una verificación completa de hechos.'
          : 'Review the article before using it. FamilyPD displays recent metadata but does not perform a full fact-check.')
        : (lang === 'es'
          ? 'El servicio automático no devolvió artículos. Abra una búsqueda reciente, elija un artículo específico y pegue su enlace HTTPS en FamilyPD.'
          : 'The automatic service did not return articles. Open a recent-news search, choose one specific story, and paste its HTTPS link into FamilyPD.')
    };

    cache.put(cacheKey, JSON.stringify(output), FPD_CONFIG.NEWS.CACHE_SECONDS);
    return output;
  }


  function buildGdeltUrl_(query, format, timespan) {
    return FPD_CONFIG.NEWS.ENDPOINT +
      '?query=' + encodeURIComponent(query) +
      '&mode=ArtList' +
      '&format=' + encodeURIComponent(format) +
      '&sort=DateDesc' +
      '&timespan=' + encodeURIComponent(timespan || '30d') +
      '&maxrecords=' + encodeURIComponent(FPD_CONFIG.NEWS.MAX_RESULTS);
  }


  function fetchGdelt_(url) {
    let response;
    try {
      response = UrlFetchApp.fetch(url, {
        method: 'get',
        muteHttpExceptions: true,
        followRedirects: true,
        validateHttpsCertificates: true,
        headers: {
          Accept: 'application/json,application/feed+json,text/plain;q=0.8,*/*;q=0.5',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      return {
        success: false,
        status: 0,
        articles: [],
        format: ''
      };
    }

    const status = Number(response.getResponseCode() || 0);
    if (status < 200 || status >= 300) {
      return {
        success: false,
        status: status,
        articles: [],
        format: ''
      };
    }

    const data = fpdParseJson_(response.getContentText(), null);
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        status: status,
        articles: [],
        format: ''
      };
    }

    if (Array.isArray(data.articles)) {
      return {
        success: true,
        status: status,
        articles: data.articles,
        format: 'json'
      };
    }

    if (Array.isArray(data.items)) {
      return {
        success: true,
        status: status,
        articles: data.items.map(function(item) {
          item = item || {};
          return {
            title: item.title || '',
            url: item.url || item.external_url || '',
            domain: extractDomain_(item.url || item.external_url || ''),
            publishedDate: item.date_published || item.date_modified || '',
            language: item.language || ''
          };
        }),
        format: 'jsonfeed'
      };
    }

    return {
      success: false,
      status: status,
      articles: [],
      format: ''
    };
  }


  function buildFallbackSearches_(pillar, language) {
    const query = BROWSER_QUERY_MAP[language][pillar];
    const encoded = encodeURIComponent(query);
    const googleLocale = language === 'es'
      ? 'hl=es-419&gl=US&ceid=US:es-419'
      : 'hl=en-US&gl=US&ceid=US:en';

    const searches = [
      {
        id: 'GOOGLE_NEWS',
        title: language === 'es'
          ? 'Buscar noticias recientes en Google News'
          : 'Search recent stories in Google News',
        publisher: 'Google News',
        url: 'https://news.google.com/search?q=' + encoded + '&' + googleLocale,
        note: language === 'es'
          ? 'Elija un artículo específico, ábralo y luego pegue el enlace del artículo en FamilyPD.'
          : 'Choose one specific article, open it, and then paste the article link into FamilyPD.'
      },
      {
        id: 'BING_NEWS',
        title: language === 'es'
          ? 'Buscar noticias recientes en Bing News'
          : 'Search recent stories in Bing News',
        publisher: 'Bing News',
        url: 'https://www.bing.com/news/search?q=' + encoded,
        note: language === 'es'
          ? 'Compare más de una fuente cuando el tema sea importante o controversial.'
          : 'Compare more than one source when the topic is important or disputed.'
      }
    ];

    const official = officialNewsroomForPillar_(pillar, language);
    if (official) searches.push(official);
    return searches;
  }


  function officialNewsroomForPillar_(pillar, language) {
    const records = {
      Health: {
        titleEn: 'Review current public-health updates',
        titleEs: 'Revisar actualizaciones de salud pública',
        publisher: 'Centers for Disease Control and Prevention',
        url: 'https://www.cdc.gov/media/',
        noteEn: 'Use the official newsroom for current public-health notices and updates.',
        noteEs: 'Use la sala de prensa oficial para avisos y actualizaciones actuales.'
      },
      Education: {
        titleEn: 'Review current education announcements',
        titleEs: 'Revisar anuncios actuales de educación',
        publisher: 'U.S. Department of Education',
        url: 'https://www.ed.gov/about/news',
        noteEn: 'Use the official newsroom for current federal education announcements.',
        noteEs: 'Use la sala de prensa oficial para anuncios federales actuales.'
      },
      Finances: {
        titleEn: 'Review current consumer-protection news',
        titleEs: 'Revisar noticias actuales de protección del consumidor',
        publisher: 'Consumer Financial Protection Bureau',
        url: 'https://www.consumerfinance.gov/about-us/newsroom/',
        noteEn: 'Look for current consumer alerts, enforcement news, and financial guidance.',
        noteEs: 'Busque alertas del consumidor, noticias y orientación financiera actuales.'
      },
      Organization: {
        titleEn: 'Review current preparedness information',
        titleEs: 'Revisar información actual de preparación',
        publisher: 'Ready.gov',
        url: 'https://www.ready.gov/news',
        noteEn: 'Use official preparedness information and confirm local instructions when relevant.',
        noteEs: 'Use información oficial y confirme instrucciones locales cuando corresponda.'
      }
    };

    const record = records[pillar];
    if (!record) return null;
    return {
      id: 'OFFICIAL_NEWSROOM_' + pillar.toUpperCase(),
      title: language === 'es' ? record.titleEs : record.titleEn,
      publisher: record.publisher,
      url: record.url,
      note: language === 'es' ? record.noteEs : record.noteEn
    };
  }


  function checkArticleLink(url, language) {
    const lang = GuidanceService.normalizeLanguage(language);
    const checked = ResourceVerificationService.checkResourceLink(url);

    if (!checked.success) {
      throw new Error(lang === 'es'
        ? 'FamilyPD no pudo confirmar el formato HTTPS de este enlace. Ábralo manualmente o use otro enlace.'
        : 'FamilyPD could not confirm the HTTPS format of this link. Open it manually or use another link.');
    }

    const title = fpdSafeText_(
      checked.title ||
      (lang === 'es'
        ? 'Artículo o página de ' + checked.domain
        : 'Article or page from ' + checked.domain),
      500
    );

    return {
      success: true,
      message: lang === 'es'
        ? checked.message + ' Abra y revise el contenido antes de agregarlo.'
        : checked.message + ' Open and review the content before adding it.',
      verification: checked,
      article: {
        title: title,
        url: checked.finalUrl || checked.url,
        publisher: checked.domain,
        publishedDate: '',
        sourceCountry: '',
        language: lang,
        provider: 'Manual link check',
        verificationStatus: checked.verificationStatus,
        secureHttps: checked.secureHttps,
        pageResponded: checked.reachable,
        automatedAccessLimited: checked.automatedAccessLimited,
        verifiedAt: checked.lastCheckedAt
      }
    };
  }


  function sanitizeCheckedArticle(article) {
    article = article || {};
    const url = ResourceVerificationService.sanitizePublicUrl(article.url, false);
    const publisher = fpdSafeText_(
      article.publisher || ResourceVerificationService.extractDomain(url),
      200
    );
    if (!publisher) throw new Error('The checked article needs a public source domain.');

    return {
      title: fpdSafeText_(article.title || 'Article from ' + publisher, 500),
      url: url,
      publisher: publisher,
      publishedDate: normalizePublishedDate_(article.publishedDate),
      sourceCountry: fpdSafeText_(article.sourceCountry, 120),
      language: fpdSafeText_(article.language, 80),
      provider: 'Manual link check',
      verificationStatus: fpdSafeText_(article.verificationStatus, 160),
      secureHttps: Boolean(article.secureHttps),
      pageResponded: Boolean(article.pageResponded),
      automatedAccessLimited: Boolean(article.automatedAccessLimited),
      verifiedAt: fpdSafeText_(article.verifiedAt, 50) || fpdNow_()
    };
  }


  function sanitizeSelectedArticle(article) {
    const normalized = normalizeArticle_(article || {});
    if (!isAcceptableArticle_(normalized)) {
      throw new Error('Choose a recent article with a valid title, source, date, and web link.');
    }
    return normalized;
  }


  function normalizeArticle_(article) {
    article = article || {};
    const url = sanitizeUrl_(article.url || article.url_mobile);
    const domain = fpdSafeText_(
      article.domain || extractDomain_(url),
      200
    );
    const seenDate = normalizePublishedDate_(
      article.publishedDate || article.seendate || article.date ||
      article.date_published
    );

    return {
      title: fpdSafeText_(article.title, 500),
      url: url,
      publisher: domain,
      publishedDate: seenDate,
      sourceCountry: fpdSafeText_(article.sourceCountry || article.sourcecountry, 120),
      language: fpdSafeText_(article.language, 80),
      provider: FPD_CONFIG.NEWS.PROVIDER,
      verifiedAt: fpdNow_()
    };
  }


  function isAcceptableArticle_(article) {
    if (!article.title || !article.publisher || !article.publishedDate || !article.url) {
      return false;
    }

    const published = new Date(article.publishedDate + 'T00:00:00Z');
    if (isNaN(published.getTime())) return false;

    const oldest = new Date();
    oldest.setUTCFullYear(
      oldest.getUTCFullYear() - Number(FPD_CONFIG.NEWS.MAX_AGE_YEARS || 7)
    );

    return published >= oldest && published <= new Date();
  }


  function sanitizeUrl_(value) {
    const text = String(value || '').trim();
    if (!/^https?:\/\/[^\s]+$/i.test(text)) return '';
    return text.substring(0, 2000);
  }


  function extractDomain_(url) {
    const match = String(url || '').match(/^https?:\/\/([^/]+)/i);
    return match ? match[1].replace(/^www\./i, '') : '';
  }


  function normalizePublishedDate_(value) {
    const text = String(value || '').trim();
    if (/^\d{8}T\d{6}Z$/i.test(text)) {
      return text.substring(0, 4) + '-' + text.substring(4, 6) + '-' + text.substring(6, 8);
    }
    if (/^\d{14}$/.test(text)) {
      return text.substring(0, 4) + '-' + text.substring(4, 6) + '-' + text.substring(6, 8);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      return text.substring(0, 10);
    }
    const date = new Date(text);
    return isNaN(date.getTime()) ? '' : date.toISOString().substring(0, 10);
  }


  return {
    searchRecentNews: searchRecentNews,
    checkArticleLink: checkArticleLink,
    sanitizeSelectedArticle: sanitizeSelectedArticle,
    sanitizeCheckedArticle: sanitizeCheckedArticle
  };
})();
