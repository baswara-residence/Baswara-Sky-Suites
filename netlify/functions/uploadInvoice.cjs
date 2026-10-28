const { google } = require('googleapis');
const { Readable } = require('stream');
const https = require('https');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const INVOICE_FOLDER_NAME = 'Baswara Sky Suites - Invoices';
const ADMIN_EMAIL = 'feel.ix.ee@gmail.com';

function formatPrivateKey(rawKey) {
  if (!rawKey) return '';
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

/**
 * Upload image using Google Apps Script Webhook
 */
async function uploadViaAppsScript(gasUrl, base64Data, fileName, folderId) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(gasUrl);
      const postData = JSON.stringify({
        base64: base64Data,
        fileName,
        folderId,
      });

      const req = https.request(
        urlObj,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            https.get(res.headers.location, (redirectRes) => {
              let body = '';
              redirectRes.on('data', (chunk) => { body += chunk; });
              redirectRes.on('end', () => {
                try {
                  const parsed = JSON.parse(body);
                  resolve(parsed);
                } catch {
                  resolve(null);
                }
              });
            }).on('error', () => resolve(null));
            return;
          }

          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch {
              resolve(null);
            }
          });
        }
      );

      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    } catch {
      resolve(null);
    }
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const customFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1P7txSenSZUnfOy7QCFLLo6tsPHk3nKjM';
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!clientEmail || !rawPrivateKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diatur di Netlify Environment Variables.',
        }),
      };
    }

    const { fileName, fileBase64, mimeType, gasUrl, adminAccessToken } = JSON.parse(event.body || '{}');

    if (!fileBase64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Payload fileBase64 wajib disertakan.' }),
      };
    }

    const cleanBase64 = fileBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Method A: Check Google Apps Script Webhook
    const targetGasUrl = appsScriptUrl || gasUrl;
    if (targetGasUrl) {
      try {
        const gasRes = await uploadViaAppsScript(targetGasUrl, cleanBase64, fileName || `Invoice-${Date.now()}.jpg`, customFolderId);
        if (gasRes && gasRes.success && gasRes.url) {
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              success: true,
              fileId: gasRes.fileId || null,
              link: gasRes.url,
              webViewLink: gasRes.url,
              folderId: customFolderId,
              source: 'Google Apps Script Webhook',
            }),
          };
        }
      } catch (gasErr) {
        console.warn('Apps Script upload in uploadInvoice warning:', gasErr.message);
      }
    }

    // Method B: Google Drive API
    let drive;
    if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      drive = google.drive({ version: 'v3', auth: oauth2Client });
    } else if (adminAccessToken) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: adminAccessToken });
      drive = google.drive({ version: 'v3', auth: oauth2Client });
    } else {
      const privateKey = formatPrivateKey(rawPrivateKey);
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
        ],
      });
      drive = google.drive({ version: 'v3', auth });
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const mediaStream = Readable.from(buffer);

    let targetFolderId = customFolderId && customFolderId.trim() !== '' ? customFolderId.trim() : null;
    let targetFolderLink = targetFolderId ? `https://drive.google.com/drive/folders/${targetFolderId}` : null;

    let response;
    try {
      response = await drive.files.create({
        requestBody: {
          name: fileName || `Invoice-${Date.now()}.jpg`,
          parents: targetFolderId ? [targetFolderId] : undefined,
          mimeType: mimeType || 'image/jpeg',
        },
        media: {
          mimeType: mimeType || 'image/jpeg',
          body: mediaStream,
        },
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true,
      });
    } catch (parentErr) {
      if (targetFolderId && (parentErr.code === 404 || parentErr.message?.includes('File not found') || parentErr.message?.includes('parent'))) {
        const fallbackStream = Readable.from(buffer);
        response = await drive.files.create({
          requestBody: {
            name: fileName || `Invoice-${Date.now()}.jpg`,
            mimeType: mimeType || 'image/jpeg',
          },
          media: {
            mimeType: mimeType || 'image/jpeg',
            body: fallbackStream,
          },
          fields: 'id, name, webViewLink, webContentLink',
          supportsAllDrives: true,
        });
      } else {
        throw parentErr;
      }
    }

    const fileId = response.data.id;
    const link = response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
    } catch (permErr) {
      console.info('Permission setting warning:', permErr.message);
    }

    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: ADMIN_EMAIL,
        },
        supportsAllDrives: true,
      });
    } catch (adminErr) {
      console.info('Admin permission warning:', adminErr.message);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        fileId: fileId,
        link: link,
        webViewLink: link,
        folderId: targetFolderId,
        folderLink: targetFolderLink,
      }),
    };
  } catch (error) {
    console.error('Error in uploadInvoice function:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message || 'Gagal mengunggah file ke Google Drive',
        tip: error.message?.includes('storage quota')
          ? 'Akun Service Account memiliki kuota 0 GB di My Drive pribadi. Gunakan Shared Drive (Drive Bersama) atau hubungkan akun Google Admin feel.ix.ee@gmail.com.'
          : undefined,
      }),
    };
  }
};