const { google } = require('googleapis');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const DEFAULT_HEADERS = [
  'Waktu Pendaftaran',
  'Nama Lengkap',
  'Username X (Twitter)',
  'Face Claim',
  'Tempat, Tanggal Lahir',
  'Pekerjaan',
  'Peliharaan (Pets)',
  'Rincian Peliharaan',
  'Pilihan Unit',
  'Tower',
  'Status Hunian',
  'Jumlah Penyewa Tambahan',
  'Identitas Penyewa Tambahan',
  'Story Line Singkat',
  'Link Thread / Utas Karakter',
  'Persetujuan Rules & Tanda Tangan',
  'Invoice / Masa Sewa',
  'Status KYC',
];

exports.handler = async function (event, context) {
  // Handle preflight OPTIONS request
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
      body: JSON.stringify({ error: 'Method Not Allowed. Gunakan POST untuk menyimpan data booking.' }),
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
          error: 'GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diatur di Netlify Site Environment Variables.',
          tip: 'Buka Netlify Dashboard -> Site Configuration -> Environment Variables, lalu masukkan kredensial Service Account Anda.',
        }),
      };
    }

    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Parse booking submission payload
    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Format body request tidak valid (harus JSON).' }),
      };
    }

    if (!data.fullName && !data.xHandle) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Data formulir tidak lengkap: Nama lengkap atau Username X wajib diisi.' }),
      };
    }

    // Inspect spreadsheet to determine tab name
    const ssMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = (ssMeta.data.sheets || []).map((s) => s.properties?.title || '');
    
    let targetSheet = 'Kuesioner & KYC';
    if (!sheetList.includes(targetSheet)) {
      if (sheetList.length > 0 && sheetList[0]) {
        targetSheet = sheetList[0];
      } else {
        targetSheet = 'Sheet1';
      }
    }

    // Format co-tenants summary
    let coTenantsSummary = '-';
    if (Array.isArray(data.coTenants) && data.coTenants.length > 0) {
      coTenantsSummary = data.coTenants
        .map((c, i) => `${i + 1}. ${c.name || 'Tanpa Nama'} (${c.xHandle || '-'}) - FC: ${c.faceClaim || '-'}, TTL: ${c.birthPlaceDate || '-'}`)
        .join(' | ');
    }

    // Check if sheet already has header row
    const checkHeaderRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${targetSheet}'!A1:R1`,
    });

    const existingHeader = checkHeaderRes.data.values;
    if (!existingHeader || existingHeader.length === 0 || existingHeader[0].length === 0) {
      // Initialize header row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${targetSheet}'!A1:R1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [DEFAULT_HEADERS],
        },
      });
    }

    const timestampWIB = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const invoiceInfo = data.invoiceNumber
      ? `${data.invoiceNumber} (${data.tenureMonths || 1} bln - Rp ${Number(data.initialTotalUpfront || 0).toLocaleString('id-ID')})`
      : 'Belum diterbitkan';

    const rulesSignatureInfo = data.rulesAgreed
      ? `Disetujui (${data.signatureName || data.fullName} - ${data.signatureDate || new Date().toISOString().split('T')[0]})`
      : 'Belum';

    const rowValues = [
      timestampWIB,
      data.fullName || '-',
      data.xHandle || '-',
      data.faceClaim || '-',
      data.birthPlaceDate || '-',
      data.occupation || '-',
      data.hasPets ? 'Ya' : 'Tidak',
      data.petsDescription || '-',
      data.unitName || '-',
      data.tower || '-',
      data.isLivingAlone ? 'Tinggal Sendiri (Single Occupancy)' : 'Bersama Co-Tenant',
      data.coTenants ? String(data.coTenants.length) : '0',
      coTenantsSummary,
      data.storyLine || '-',
      data.characterThreadLink || '-',
      rulesSignatureInfo,
      invoiceInfo,
      'MENUNGGU_REVIEW',
    ];

    // Append new booking row
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${targetSheet}'!A:R`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Data reservasi berhasil disimpan ke Google Sheets!',
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        updatedRange: appendResult.data.updates?.updatedRange,
        updatedRows: appendResult.data.updates?.updatedRows,
      }),
    };
  } catch (error) {
    console.error('Error in saveBooking Netlify function:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message || 'Gagal menyimpan data booking ke Google Sheets.',
        details: error.response?.data || error.stack,
      }),
    };
  }
};
