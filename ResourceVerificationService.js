/**
 * Privacy-first public HTTPS link checker.
 *
 * The checker verifies the URL format, blocks local/private network hosts,
 * validates HTTPS certificates through UrlFetchApp, follows a small number of
 * public HTTPS redirects, records the HTTP response when available, and tries
 * to read a page title. Some legitimate sites block automated requests from
 * cloud services; those links are reported as secure HTTPS addresses with
 * limited automated verification instead of being treated as invalid.
 *
 * This is not a fact-check, reputation score, nonprofit verification,
 * eligibility decision, malware scan, or guarantee that page content is safe.
 */

const ResourceVerificationService = (function() {
  const MAX_REDIRECTS = 5;
  const MAX_TITLE_BYTES = 65536;
  const LIMITED_STATUS_CODES = {
    401: true,
    403: true,
    405: true,
    406: true,
    416: true,
    429: true
  };


  function checkResourceLink(url) {
    const clean = sanitizePublicUrl(url, false);
    const originalDomain = extractDomain(clean);
    let currentUrl = clean;
    let currentDomain = originalDomain;
    let response = null;
    let status = 0;
    let title = '';
    let certificateValidated = false;
    let redirectCount = 0;
    let redirectLocation = '';
    let automatedAccessLimited = false;
    let fetchError = '';
    let fetchUnavailableReason = '';

    try {
      for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
        const attempt = fetchPage_(currentUrl, true, false);
        response = attempt.response;
        status = attempt.status;
        certificateValidated = true;

        if (isRedirectStatus_(status)) {
          const location = getHeader_(response, 'Location');
          const nextUrl = resolveRedirect_(currentUrl, location);
          if (!nextUrl || index === MAX_REDIRECTS) {
            redirectLocation = nextUrl || sanitizeRedirect_(location);
            break;
          }
          redirectCount += 1;
          redirectLocation = nextUrl;
          currentUrl = nextUrl;
          currentDomain = extractDomain(currentUrl);
          continue;
        }
        break;
      }

      // Range requests are respectful of bandwidth, but some normal websites
      // reject them. Retry once without Range for those status codes.
      if (LIMITED_STATUS_CODES[status]) {
        automatedAccessLimited = true;
        try {
          const retry = fetchPage_(currentUrl, false, true);
          if (retry.status >= 200 && retry.status < 400) {
            response = retry.response;
            status = retry.status;
            automatedAccessLimited = false;
          } else if (retry.status) {
            status = retry.status;
          }
        } catch (retryError) {
          fetchError = String(retryError && retryError.message || retryError);
        }
      }

      if (response) {
        title = extractPageTitle_(safeContentText_(response));
      }
    } catch (error) {
      fetchError = String(error && error.message || error);
      certificateValidated = false;
      automatedAccessLimited = true;
      fetchUnavailableReason = classifyFetchFailure_(fetchError);
    }

    const responded = status >= 200 && status < 400;
    const publicHttpsAddress = Boolean(clean && originalDomain);
    // A complete HTTPS URL on a normal public domain is useful even when a
    // website blocks automated requests or is outside the deployment's URL
    // allowlist. In that case FamilyPD reports only the checks it actually
    // completed and never claims that the certificate or page was verified.
    const success = publicHttpsAddress;
    const verificationStatus = verificationStatus_(
      responded,
      automatedAccessLimited,
      certificateValidated,
      redirectCount,
      status
    );

    return {
      success: success,
      reachable: responded,
      secureHttps: true,
      publicDomain: true,
      certificateValidated: certificateValidated,
      automatedAccessLimited: automatedAccessLimited,
      url: clean,
      finalUrl: currentUrl,
      domain: currentDomain || originalDomain,
      originalDomain: originalDomain,
      title: title,
      httpStatus: status,
      redirectCount: redirectCount,
      redirectLocation: redirectLocation,
      verificationStatus: verificationStatus,
      verificationChecks: {
        completeHttpsAddress: true,
        publicInternetDomain: true,
        localOrPrivateHostBlocked: true,
        httpsCertificateCheck: certificateValidated,
        pageResponded: responded,
        automatedAccessLimited: automatedAccessLimited
      },
      fetchUnavailableReason: fetchUnavailableReason,
      lastCheckedAt: fpdNow_(),
      message: verificationMessage_(
        responded,
        automatedAccessLimited,
        certificateValidated,
        status,
        currentDomain || originalDomain,
        fetchError,
        fetchUnavailableReason
      )
    };
  }


  function fetchPage_(url, useRange, followRedirects) {
    const headers = {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.7',
      'Accept-Language': 'en-US,en;q=0.8,es;q=0.6',
      'Cache-Control': 'no-cache'
    };
    if (useRange) headers.Range = 'bytes=0-65535';

    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      followRedirects: Boolean(followRedirects),
      muteHttpExceptions: true,
      validateHttpsCertificates: true,
      headers: headers
    });

    return {
      response: response,
      status: Number(response.getResponseCode() || 0)
    };
  }


  function sanitizePublicUrl(value, allowBlank) {
    const text = String(value || '').trim();
    if (!text && allowBlank) return '';
    if (!/^https:\/\/[^\s]+$/i.test(text)) {
      throw new Error('Use a complete public HTTPS link beginning with https://');
    }

    const domain = extractDomain(text);
    if (!domain || isUnsafeHost_(domain)) {
      throw new Error(
        'Use a normal public website address. Local, private, and numeric network addresses are not allowed.'
      );
    }

    return text.substring(0, 2000);
  }


  function extractDomain(value) {
    const match = String(value || '').match(/^https:\/\/([^\/:?#]+)/i);
    return match ? match[1].replace(/^www\./i, '').toLowerCase() : '';
  }


  function isUnsafeHost_(host) {
    const value = String(host || '').toLowerCase();
    if (!value) return true;
    if (value === 'localhost' ||
        value.endsWith('.localhost') ||
        value.endsWith('.local') ||
        value.endsWith('.internal') ||
        value.endsWith('.lan') ||
        value.endsWith('.home')) {
      return true;
    }
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return true;
    if (value.indexOf(':') >= 0) return true;
    return false;
  }


  function isRedirectStatus_(status) {
    return [301, 302, 303, 307, 308].indexOf(Number(status)) >= 0;
  }


  function getHeader_(response, name) {
    if (!response || !response.getAllHeaders) return '';
    const headers = response.getAllHeaders() || {};
    const lower = String(name || '').toLowerCase();
    const key = Object.keys(headers).find(function(item) {
      return String(item).toLowerCase() === lower;
    });
    const value = key ? headers[key] : '';
    return Array.isArray(value) ? String(value[0] || '') : String(value || '');
  }


  function resolveRedirect_(baseUrl, location) {
    const target = String(location || '').trim();
    if (!target) return '';

    if (/^https:\/\//i.test(target)) {
      try {
        return sanitizePublicUrl(target, false);
      } catch (error) {
        return '';
      }
    }

    if (/^http:\/\//i.test(target)) return '';

    const originMatch = String(baseUrl || '').match(/^(https:\/\/[^\/]+)(\/.*)?$/i);
    if (!originMatch) return '';
    const origin = originMatch[1];
    let resolved = '';

    if (target.charAt(0) === '/') {
      resolved = origin + target;
    } else {
      const basePath = String(baseUrl).replace(/[?#].*$/, '').replace(/\/[^\/]*$/, '/');
      resolved = basePath + target;
    }

    try {
      return sanitizePublicUrl(resolved, false);
    } catch (error) {
      return '';
    }
  }


  function safeContentText_(response) {
    try {
      return String(response && response.getContentText
        ? response.getContentText()
        : '').substring(0, MAX_TITLE_BYTES);
    } catch (error) {
      return '';
    }
  }


  function extractPageTitle_(html) {
    const text = String(html || '').substring(0, MAX_TITLE_BYTES);
    const og = text.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) || text.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i
    );
    if (og && og[1]) return cleanHtmlText_(og[1]);

    const twitter = text.match(
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) || text.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["'][^>]*>/i
    );
    if (twitter && twitter[1]) return cleanHtmlText_(twitter[1]);

    const title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return title && title[1] ? cleanHtmlText_(title[1]) : '';
  }


  function cleanHtmlText_(value) {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#(\d+);/g, function(match, number) {
        return String.fromCharCode(Number(number));
      })
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  }


  function sanitizeRedirect_(value) {
    const text = String(value || '').trim();
    if (!/^https:\/\/[^\s]+$/i.test(text)) return '';
    try {
      return sanitizePublicUrl(text, false);
    } catch (error) {
      return '';
    }
  }


  function looksLikeCertificateError_(message) {
    return /certificate|ssl|tls|handshake/i.test(String(message || ''));
  }


  function verificationStatus_(
    responded,
    limited,
    certificateValidated,
    redirectCount,
    status
  ) {
    if (responded && redirectCount > 0) return 'Secure HTTPS link and redirect checked';
    if (responded) return 'Secure HTTPS link and page response checked';
    if (limited && certificateValidated) {
      return 'Secure HTTPS address; automated page check limited';
    }
    if (certificateValidated || status > 0) return 'Secure HTTPS address checked';
    if (limited) return 'Secure HTTPS format and public domain checked; automated page check unavailable';
    return 'Secure HTTPS format and public domain checked; page response not confirmed';
  }


  function verificationMessage_(
    responded,
    limited,
    certificateValidated,
    status,
    domain,
    fetchError,
    fetchUnavailableReason
  ) {
    if (responded) {
      return 'FamilyPD confirmed a public HTTPS address, validated the HTTPS connection, and received a page response from ' +
        domain + '. This does not verify the organization, accuracy, safety, or current availability of the content.';
    }
    if (limited) {
      return 'FamilyPD confirmed a public HTTPS address for ' + domain +
        ' and attempted a certificate-validated connection. The website limited automated checking (HTTP ' +
        status + '). Open the page in your browser and review the organization and content.';
    }
    if (certificateValidated || status > 0) {
      return 'FamilyPD confirmed a public HTTPS address for ' + domain +
        ', but did not receive a normal page response' +
        (status ? ' (HTTP ' + status + ')' : '') +
        '. Open the page manually and review it before using it.';
    }
    if (fetchUnavailableReason === 'ALLOWLIST') {
      return 'FamilyPD confirmed that ' + domain +
        ' uses a complete public HTTPS address. This deployment is not permitted to fetch that domain automatically, so the certificate and page response were not verified. Open the page and review the organization and content.';
    }
    return 'FamilyPD confirmed that ' + domain +
      ' uses a complete public HTTPS address, but could not complete the automated page check.' +
      (fetchError ? ' The site may block automated requests or be temporarily unavailable.' : '');
  }


  function classifyFetchFailure_(message) {
    const text = String(message || '');
    if (/allowlist|whitelist|not permitted|not allowed|urlfetch/i.test(text)) {
      return 'ALLOWLIST';
    }
    if (/certificate|ssl|tls|handshake/i.test(text)) return 'CERTIFICATE';
    if (/timed out|timeout/i.test(text)) return 'TIMEOUT';
    return 'FETCH_FAILED';
  }


  return {
    checkResourceLink: checkResourceLink,
    sanitizePublicUrl: sanitizePublicUrl,
    extractDomain: extractDomain
  };
})();
