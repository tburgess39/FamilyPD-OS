/**
 * Security and authenticity foundation.
 *
 * A copied popup is not proof of authenticity. The domain remains the primary
 * user-verification signal. This prototype is hosted by Google Apps Script and
 * is clearly labeled as a prototype.
 */

const SecurityService = (function() {

  function getPublicSecurityInfo() {
    return {
      deploymentMode: FPD_CONFIG.DEPLOYMENT_MODE,
      officialSite: FPD_CONFIG.OFFICIAL_SITE,
      securityPage: FPD_CONFIG.OFFICIAL_SECURITY_PAGE,
      approvedProductionHosts: FPD_CONFIG.APPROVED_PRODUCTION_HOSTS,
      approvedPrototypeHosts: FPD_CONFIG.APPROVED_PROTOTYPE_HOSTS,
      passwordRule:
        'FamilyPD will never ask you to type a Google password into a FamilyPD form. ' +
        'Google authentication should occur only on a Google-owned sign-in page.',
      privacyRule:
        'Do not enter sensitive or confidential information into FamilyPD.'
    };
  }


  function signPayload(payload) {
    const secret = getSigningSecret_();
    const bytes = Utilities.computeHmacSha256Signature(
      String(payload),
      secret,
      Utilities.Charset.UTF_8
    );

    return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, '');
  }


  function verifyPayload(payload, signature) {
    const expected = signPayload(payload);
    return constantTimeEquals_(expected, String(signature || ''));
  }


  function getIssuerId() {
    const props = PropertiesService.getScriptProperties();
    let value = props.getProperty('FPD_ISSUER_ID');

    if (!value) {
      value = 'FPD-ISSUER-' + Utilities.getUuid();
      props.setProperty('FPD_ISSUER_ID', value);
    }

    return value;
  }


  function getSigningSecret_() {
    const props = PropertiesService.getScriptProperties();
    let secret = props.getProperty('FPD_UPDATE_PACK_SIGNING_SECRET');

    if (!secret) {
      secret = [
        Utilities.getUuid(),
        Utilities.getUuid(),
        String(new Date().getTime())
      ].join(':');

      props.setProperty('FPD_UPDATE_PACK_SIGNING_SECRET', secret);
    }

    return secret;
  }


  function constantTimeEquals_(a, b) {
    const first = String(a || '');
    const second = String(b || '');
    const maxLength = Math.max(first.length, second.length);
    let difference = first.length ^ second.length;

    for (let i = 0; i < maxLength; i += 1) {
      difference |=
        (first.charCodeAt(i) || 0) ^
        (second.charCodeAt(i) || 0);
    }

    return difference === 0;
  }


  return {
    getPublicSecurityInfo: getPublicSecurityInfo,
    signPayload: signPayload,
    verifyPayload: verifyPayload,
    getIssuerId: getIssuerId
  };
})();
