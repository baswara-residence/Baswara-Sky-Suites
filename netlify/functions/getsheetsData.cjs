const { google } = require('googleapis');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A';

    if (!clientEmail || !rawPrivateKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum dikonfigurasi di Netlify Environment Variables.',
        }),
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: rawPrivateKey.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly', 
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Check range requested or default to first 20 rows
    const range = (event.queryStringParameters && event.queryStringParameters.range) || 'Sheet1!A1:R20';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        spreadsheetId,
        values: response.data.values || [],
      }),
    };
  } catch (error) {
    console.error('Error in getsheetsData function:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message || 'Gagal membaca data dari Google Sheets.' }),
    };
  }
};