/**
 * Server-side data-minimization guard.
 *
 * FamilyPD does not need exact sensitive information. These checks are
 * intentionally conservative and apply to identity, profile, roster,
 * commitments, suggestions, and other non-sensitive planning fields.
 */

const PrivacyGuardService = (function() {
  const PATTERNS = [
    {
      label: 'an email address',
      regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
    },
    {
      label: 'a phone number',
      regex: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/
    },
    {
      label: 'a Social Security number pattern',
      regex: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/
    },
    {
      label: 'a long financial account or card number pattern',
      regex: /\b(?:\d[ -]*?){13,19}\b/
    },
    {
      label: 'an exact date-of-birth label',
      regex: /\b(?:date\s+of\s+birth|birth\s*date|dob)\s*(?:is\b|[:=])\s*\S+/i
    },
    {
      label: 'a password or authentication-code label',
      regex: /\b(?:my\s+)?(?:password|passcode|pin\s*code|verification\s*code|security\s*answer|mfa\s*code|2fa\s*code)\s*(?:is\b|[:=])\s*\S+/i
    },
    {
      label: 'a financial-account label',
      regex: /\b(?:routing\s+number|account\s+number|credit\s+card|debit\s+card|bank\s+login)\s*(?:is\b|[:=])\s*[A-Z0-9-]{3,}/i
    },
    {
      label: 'a government-identification label',
      regex: /\b(?:social\s+security|passport\s+number|driver'?s\s+license|government\s+id|tax\s+id)\s*(?:is\b|[:=])\s*[A-Z0-9-]{3,}/i
    },
    {
      label: 'a confidential medical-record label',
      regex: /\b(?:medical\s+record|insurance\s+number|policy\s+number|diagnosis|medication\s+list)\s*(?:is\b|[:=])\s*\S+/i
    },
    {
      label: 'an exact street-address pattern',
      regex: /\b\d{1,6}\s+[A-Za-z0-9.' -]{2,40}\s+(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|lane|ln\.?|court|ct\.?|parkway|pkwy\.?|highway|hwy\.?)\b/i
    }
  ];


  function validatePayload(payload, contextLabel) {
    const strings = [];
    collectStrings_(payload, strings);

    const findings = [];
    strings.forEach(function(text) {
      PATTERNS.forEach(function(pattern) {
        if (pattern.regex.test(text)) {
          findings.push(pattern.label);
        }
      });
    });

    const unique = findings.filter(function(item, index, all) {
      return all.indexOf(item) === index;
    });

    if (unique.length) {
      throw new Error(
        'FamilyPD blocked this ' +
        fpdSafeText_(contextLabel || 'entry', 80) +
        ' because it may contain ' + unique.join(', ') + '. ' +
        'Replace exact information with a general, non-sensitive description.'
      );
    }

    return true;
  }


  function collectStrings_(value, output) {
    if (typeof value === 'string') {
      output.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(function(item) {
        collectStrings_(item, output);
      });
      return;
    }

    if (value && typeof value === 'object') {
      Object.keys(value).forEach(function(key) {
        collectStrings_(value[key], output);
      });
    }
  }


  return {
    validatePayload: validatePayload
  };
})();
