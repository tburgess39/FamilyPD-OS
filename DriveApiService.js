/**
 * Narrow Google Drive access through the Drive REST API.
 *
 * This file intentionally does not use DriveApp or SpreadsheetApp.
 * The manifest requests drive.file, which limits the app to files it creates
 * or files the user explicitly shares with the app.
 */

const DriveApiService = (function() {
  const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';
  const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';


  function createFolder(name, parentId) {
    const metadata = {
      name: fpdSafeText_(name, 200),
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || 'root']
    };

    return requestJson_(
      DRIVE_BASE + '/files?fields=id,name,mimeType,parents,trashed,webViewLink',
      {
        method: 'post',
        contentType: 'application/json; charset=UTF-8',
        payload: JSON.stringify(metadata)
      }
    );
  }


  function createTextFile(name, mimeType, parentId, text) {
    return createMultipartFile_(
      name,
      mimeType,
      parentId,
      Utilities.newBlob(String(text || ''), mimeType).getBytes()
    );
  }


  function createBinaryFile(name, mimeType, parentId, bytes) {
    return createMultipartFile_(
      name,
      mimeType,
      parentId,
      bytes || []
    );
  }


  function createMultipartFile_(name, mimeType, parentId, bytes) {
    const boundary = '-------FamilyPD' + Utilities.getUuid().replace(/-/g, '');
    const metadata = {
      name: fpdSafeText_(name, 200),
      mimeType: mimeType,
      parents: [parentId]
    };

    const prefix = [
      '--' + boundary,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      '--' + boundary,
      'Content-Type: ' + mimeType,
      '',
      ''
    ].join('\r\n');

    const suffix = '\r\n--' + boundary + '--';
    const payload = joinBytes_([
      Utilities.newBlob(prefix).getBytes(),
      bytes,
      Utilities.newBlob(suffix).getBytes()
    ]);

    return requestJson_(
      UPLOAD_BASE + '/files?uploadType=multipart&fields=' +
        'id,name,mimeType,parents,trashed,webViewLink,createdTime,modifiedTime,size',
      {
        method: 'post',
        contentType: 'multipart/related; boundary=' + boundary,
        payload: payload
      }
    );
  }


  function updateTextFile(fileId, mimeType, text) {
    return updateBinaryFile(
      fileId,
      mimeType,
      Utilities.newBlob(String(text || ''), mimeType).getBytes()
    );
  }


  function updateBinaryFile(fileId, mimeType, bytes) {
    return requestJson_(
      UPLOAD_BASE + '/files/' + encodeURIComponent(fileId) +
        '?uploadType=media&fields=id,name,mimeType,parents,trashed,webViewLink,modifiedTime,size',
      {
        method: 'patch',
        contentType: mimeType,
        payload: bytes || []
      }
    );
  }


  function getTextFile(fileId) {
    const response = request_(
      DRIVE_BASE + '/files/' + encodeURIComponent(fileId) + '?alt=media',
      { method: 'get' }
    );
    return response.getContentText('UTF-8');
  }


  function getBinaryFile(fileId) {
    const response = request_(
      DRIVE_BASE + '/files/' + encodeURIComponent(fileId) + '?alt=media',
      { method: 'get' }
    );
    return response.getBlob().getBytes();
  }


  function getMetadata(fileId) {
    return requestJson_(
      DRIVE_BASE + '/files/' + encodeURIComponent(fileId) +
        '?fields=id,name,mimeType,parents,trashed,webViewLink,createdTime,modifiedTime,size',
      { method: 'get' }
    );
  }


  function trashFile(fileId) {
    return requestJson_(
      DRIVE_BASE + '/files/' + encodeURIComponent(fileId) +
        '?fields=id,name,trashed',
      {
        method: 'patch',
        contentType: 'application/json; charset=UTF-8',
        payload: JSON.stringify({ trashed: true })
      }
    );
  }


  function isUsable(fileId, expectedMimeType) {
    if (!fileId) return false;

    try {
      const metadata = getMetadata(fileId);
      if (!metadata || metadata.trashed) return false;
      if (expectedMimeType && metadata.mimeType !== expectedMimeType) return false;
      return true;
    } catch (error) {
      return false;
    }
  }


  function requestJson_(url, options) {
    const response = request_(url, options);
    const text = response.getContentText('UTF-8');
    return text ? JSON.parse(text) : {};
  }


  function request_(url, options) {
    const params = Object.assign({}, options || {});
    params.headers = Object.assign({}, params.headers || {}, {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    });
    params.muteHttpExceptions = true;
    params.followRedirects = true;

    const response = UrlFetchApp.fetch(url, params);
    const code = response.getResponseCode();

    if (code < 200 || code >= 300) {
      const body = response.getContentText('UTF-8');
      let message = 'Google Drive request failed with status ' + code + '.';

      try {
        const parsed = JSON.parse(body);
        if (parsed.error && parsed.error.message) {
          message = parsed.error.message;
        }
      } catch (ignored) {
        if (body) message += ' ' + body.substring(0, 300);
      }

      throw new Error(message);
    }

    return response;
  }


  function joinBytes_(parts) {
    const output = [];

    parts.forEach(function(part) {
      const bytes = part || [];
      for (let index = 0; index < bytes.length; index += 1) {
        output.push(bytes[index]);
      }
    });

    return output;
  }


  return {
    createFolder: createFolder,
    createTextFile: createTextFile,
    createBinaryFile: createBinaryFile,
    updateTextFile: updateTextFile,
    updateBinaryFile: updateBinaryFile,
    getTextFile: getTextFile,
    getBinaryFile: getBinaryFile,
    getMetadata: getMetadata,
    trashFile: trashFile,
    isUsable: isUsable
  };
})();
