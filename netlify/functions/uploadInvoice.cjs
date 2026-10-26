const { google } = require('googleapis');
const { Readable } = require('stream');

exports.handler = async (event, context) => {
  // Hanya menerima method POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Menerima data gambar berupa Base64 dari frontend
    const { fileName, fileBase64, mimeType } = JSON.parse(event.body);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Mengubah string Base64 gambar menjadi buffer stream
    const buffer = Buffer.from(fileBase64, 'base64');
    const mediaStream = Readable.from(buffer);

    // Mengunggah gambar ke folder Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName || `Invoice-${Date.now()}.jpg`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID Folder Netlify
      },
      media: {
        mimeType: mimeType || 'image/jpeg',
        body: mediaStream,
      },
      fields: 'id, name, webViewLink',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        fileId: response.data.id,
        link: response.data.webViewLink, // Link publik file di Drive
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};