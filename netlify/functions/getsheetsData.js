const { google } = require('googleapis');

exports.handler = async function (event, context) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly', 
        'https://www.googleapis.com/auth/drive.readonly'
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A',
      range: 'Sheet1!A1:D10',
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data.values),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};