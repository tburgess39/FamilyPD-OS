/**
 * FamilyPD recovery and accessibility patch test runner.
 * Run testFamilyPDRecoveryPatch from the Apps Script function selector.
 * This test does not create, move, or delete Drive files.
 */
function testFamilyPDRecoveryPatch() {
  const shellIdentity = IdentityService.getWorkspaceView();
  if (!shellIdentity || !shellIdentity.publishedVersion) {
    throw new Error('IdentityService did not return a normalized publishedVersion object.');
  }

  const driveStatus = FPDDriveFileServiceV10.diagnoseRoot();
  const familyProfile = FPDFamilyProfileServiceV100.getBootstrap(true);
  const progressCenter = FPDReviewServiceV80.getBootstrap(true);

  const result = {
    ok: true,
    publishedVersionReady: Boolean(shellIdentity.publishedVersion),
    publishedVersionNumber: Number(shellIdentity.publishedVersion.versionNumber || 0),
    workspaceConnected: Boolean(driveStatus.connected),
    workspaceMessage: driveStatus.message || '',
    familyProfileLoaded: Boolean(familyProfile && familyProfile.options),
    missionOptions: familyProfile && familyProfile.options && familyProfile.options.missionOptions
      ? familyProfile.options.missionOptions.length : 0,
    visionOptions: familyProfile && familyProfile.options && familyProfile.options.visionOptions
      ? familyProfile.options.visionOptions.length : 0,
    valueOptions: familyProfile && familyProfile.options && familyProfile.options.valueSuggestions
      ? familyProfile.options.valueSuggestions.length : 0,
    progressCenterLoaded: Boolean(progressCenter && progressCenter.options),
    progressWorkspaceConnected: Boolean(progressCenter && progressCenter.workspace && progressCenter.workspace.connected)
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Optional recovery helper. Paste the existing FamilyPD Workspace folder URL
 * or folder ID into the execution prompt when calling from code.
 */
function rememberFamilyPDWorkspaceFolder(folderIdOrUrl) {
  const id = FPDDriveFileServiceV10.rememberRootId(folderIdOrUrl);
  if (!id) throw new Error('Enter a valid FamilyPD Workspace folder URL or folder ID.');
  FPDFamilyProfileServiceV100.clearCache();
  FPDReviewServiceV80.clearCache();
  return FPDDriveFileServiceV10.diagnoseRoot();
}
