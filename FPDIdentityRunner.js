/** Manual test for the guided Family Profile service. */
function testFPDFamilyProfile() {
  const result = FPDFamilyProfileServiceV100.getBootstrap(true);
  console.log(JSON.stringify({
    ok: Boolean(result && result.profile && result.options),
    pathSelected: Boolean(result && result.summary && result.summary.pathSelected),
    missionOptions: result && result.options ? result.options.missionOptions.length : 0,
    visionOptions: result && result.options ? result.options.visionOptions.length : 0,
    valueOptions: result && result.options ? result.options.valueSuggestions.length : 0,
    goalOptions: result && result.options ? result.options.goalSuggestions.length : 0
  }, null, 2));
  return result;
}
