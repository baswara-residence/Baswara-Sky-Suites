const { google } = require('googleapis');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function formatPrivateKey(rawKey) {
  if (!rawKey) return '';
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

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
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1P7txSenSZUnfOy7QCFLLo6tsPHk3nKjM';
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A';
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    const results = {
      timestamp: new Date().toISOString(),
      platform: 'Netlify Serverless Function',
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(rawPrivateKey),
      hasAppsScriptUrl: Boolean(appsScriptUrl),
      clientEmailPrefix: clientEmail ? `${clientEmail.substring(0, 10)}...` : 'Belum diisi',
      spreadsheetId,
      folderId,
      spreadsheetAccessible: false,
      folderAccessible: false,
      folderName: null,
      serviceAccountDiagnosis: 'Belum diuji',
      recommendations: [],
    };

    if (!clientEmail || !rawPrivateKey) {
      results.serviceAccountDiagnosis = 'Environment Variables GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diisi di Netlify Dashboard.';
      results.recommendations.push('Buka Netlify Dashboard > Site Configuration > Environment Variables.');
      results.recommendations.push('Tambahkan GOOGLE_CLIENT_EMAIL dan GOOGLE_PRIVATE_KEY.');
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(results),
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formatPrivateKey(rawPrivateKey),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    // 1. Test Spreadsheet Connection
    const sheets = google.sheets({ version: 'v4', auth });
    try {
      const ssRes = await sheets.spreadsheets.get({ spreadsheetId });
      results.spreadsheetAccessible = true;
      results.spreadsheetTitle = ssRes.data.properties?.title;
    } catch (ssErr) {
      results.spreadsheetAccessible = false;
      results.spreadsheetError = ssErr.message;
      results.recommendations.push(`Pastikan file Google Spreadsheet (${spreadsheetId}) sudah dibagikan (Share) ke "${clientEmail}" sebagai Editor.`);
    }

    // 2. Test Google Drive Folder Connection
    const drive = google.drive({ version: 'v3', auth });
    try {
      const folderRes = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, capabilities, driveId',
        supportsAllDrives: true,
      });
      results.folderAccessible = true;
      results.folderName = folderRes.data.name;
      results.canAddChildren = folderRes.data.capabilities?.canAddChildren;

      if (!results.canAddChildren) {
        results.recommendations.push(`Service Account belum memiliki izin membuat file di folder "${folderRes.data.name}". Pastikan hak akses folder disetel sebagai "Editor".`);
      } else {
        results.serviceAccountDiagnosis = `Folder Google Drive "${folderRes.data.name}" terhubung dengan baik!`;
      }
    } catch (folderErr) {
      results.folderAccessible = false;
      results.folderError = folderErr.message;
      if (folderErr.message?.includes('File not found') || folderErr.code === 404) {
        results.recommendations.push(`Folder ID "${folderId}" tidak ditemukan atau belum dibagikan. Buka Google Drive > Klik Kanan Folder > Bagikan (Share) > Tambahkan "${clientEmail}" sebagai Editor.`);
      } else {
        results.recommendations.push(`Error akses folder: ${folderErr.message}`);
      }
    }

    if (results.spreadsheetAccessible && results.folderAccessible) {
      results.serviceAccountDiagnosis = 'Koneksi Service Account ke Spreadsheet & Drive Berhasil!';
      results.recommendations.push('Catatan Kuota Drive: Service Account Google Cloud di personal My Drive memiliki batasan kuota 0 GB. Jika upload foto JPG gagal karena kuota, gunakan Google Shared Drive (Drive Bersama) atau klik tombol "Hubungkan Akun Google Admin feel.ix.ee@gmail.com" di aplikasi.');
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(results),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
