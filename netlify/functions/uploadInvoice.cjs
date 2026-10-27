const { google } = require('googleapis');
const { Readable } = require('stream');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const INVOICE_FOLDER_NAME = 'Baswara Sky Suites - Invoices';
const ADMIN_EMAIL = 'feel.ix.ee@gmail.com';

exports.handler = async (event, context) => {
  // Preflight CORS handler
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Hanya menerima method POST
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
    const customFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !rawPrivateKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diatur di Netlify Environment Variables.',
        }),
      };
    }

    // Menerima data gambar berupa Base64 dari frontend
    const { fileName, fileBase64, mimeType } = JSON.parse(event.body || '{}');

    if (!fileBase64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Payload fileBase64 wajib disertakan.' }),
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: rawPrivateKey.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Mengubah string Base64 gambar menjadi buffer stream murni tanpa prefix data URI
    const cleanBase64 = fileBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const mediaStream = Readable.from(buffer);

    // Tentukan folder tujuan di Google Drive
    let targetFolderId = customFolderId && customFolderId.trim() !== '' ? customFolderId.trim() : null;
    let targetFolderLink = null;

    if (!targetFolderId) {
      // Cari atau buat folder "Baswara Sky Suites - Invoices" otomatis
      try {
        const folderSearch = await drive.files.list({
          q: `name = '${INVOICE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id, name, webViewLink)',
          spaces: 'drive',
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
          targetFolderId = folderSearch.data.files[0].id;
          targetFolderLink = folderSearch.data.files[0].webViewLink;
        } else {
          const createFolderRes = await drive.files.create({
            requestBody: {
              name: INVOICE_FOLDER_NAME,
              mimeType: 'application/vnd.google-apps.folder',
              description: 'Folder Resmi Penyimpanan Seluruh Invoice Sewa Baswara Sky Suites (PT Baswara Mangkubumi Residence)',
            },
            fields: 'id, webViewLink',
          });
          targetFolderId = createFolderRes.data.id;
          targetFolderLink = createFolderRes.data.webViewLink;

          // Share folder ke admin email
          try {
            await drive.permissions.create({
              fileId: targetFolderId,
              requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress: ADMIN_EMAIL,
              },
            });
          } catch (e) {
            console.info('Share folder notice:', e.message);
          }
        }
      } catch (fErr) {
        console.warn('Folder search/create warning:', fErr.message);
      }
    } else {
      targetFolderLink = `https://drive.google.com/drive/folders/${targetFolderId}`;
    }

    // Mengunggah gambar ke folder Google Drive
    const uploadParents = targetFolderId ? [targetFolderId] : undefined;
    const response = await drive.files.create({
      requestBody: {
        name: fileName || `Invoice-${Date.now()}.jpg`,
        parents: uploadParents,
        mimeType: mimeType || 'image/jpeg',
      },
      media: {
        mimeType: mimeType || 'image/jpeg',
        body: mediaStream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = response.data.id;
    const link = response.data.webViewLink;

    // Buat file dapat dibuka oleh siapa saja yang memiliki link
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.info('Permission setting warning:', permErr.message);
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
      }),
    };
  }
};