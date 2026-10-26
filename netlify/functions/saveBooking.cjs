const { google } = require('googleapis');
const { Readable } = require('stream');

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

const INVOICE_FOLDER_NAME = 'Baswara Sky Suites - Invoices';
const ADMIN_EMAIL = 'feel.ix.ee@gmail.com';

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
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

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

    // 1. Simpan Invoice ke Google Drive jika terdapat payload gambar JPG base64
    let driveFileId = null;
    let driveFileUrl = null;
    let driveFolderId = null;
    let driveFolderUrl = null;

    if (data.invoiceBase64 && typeof data.invoiceBase64 === 'string') {
      try {
        // Cari atau buat folder "Baswara Sky Suites - Invoices" di Google Drive
        const folderSearch = await drive.files.list({
          q: `name = '${INVOICE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id, name, webViewLink)',
          spaces: 'drive',
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
          driveFolderId = folderSearch.data.files[0].id;
          driveFolderUrl = folderSearch.data.files[0].webViewLink;
        } else {
          const createFolderRes = await drive.files.create({
            requestBody: {
              name: INVOICE_FOLDER_NAME,
              mimeType: 'application/vnd.google-apps.folder',
              description: 'Folder Resmi Penyimpanan Seluruh Invoice Sewa Baswara Sky Suites (PT Baswara Mangkubumi Residence)',
            },
            fields: 'id, webViewLink',
          });
          driveFolderId = createFolderRes.data.id;
          driveFolderUrl = createFolderRes.data.webViewLink;

          // Berikan izin akses folder ke akun admin jika memungkinkan
          try {
            await drive.permissions.create({
              fileId: driveFolderId,
              requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress: ADMIN_EMAIL,
              },
            });
          } catch (permErr) {
            console.info('Folder permission to admin note:', permErr.message);
          }
        }

        // Siapkan buffer gambar JPG dari Base64
        const cleanBase64 = data.invoiceBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        const imageStream = new Readable();
        imageStream.push(imageBuffer);
        imageStream.push(null);

        const safeInvoiceNo = (data.invoiceNumber || 'INV').replace(/\//g, '_');
        const safeName = (data.fullName || 'Tenant').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `Invoice_${safeInvoiceNo}_${safeName}.jpg`;

        // Upload file JPG ke dalam folder Google Drive
        const fileUploadRes = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: driveFolderId ? [driveFolderId] : undefined,
            description: `Official Invoice Sewa ${data.invoiceNumber || ''} untuk ${data.fullName || ''} (Format JPG)`,
            mimeType: 'image/jpeg',
          },
          media: {
            mimeType: 'image/jpeg',
            body: imageStream,
          },
          fields: 'id, name, webViewLink, webContentLink',
        });

        driveFileId = fileUploadRes.data.id;
        driveFileUrl = fileUploadRes.data.webViewLink;

        // Jadikan file dapat dilihat melalui tautan langsung (reader for anyone with link)
        try {
          await drive.permissions.create({
            fileId: driveFileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
        } catch (permErr) {
          console.info('File reader permission note:', permErr.message);
        }
      } catch (driveErr) {
        console.error('Error uploading invoice JPG to Google Drive:', driveErr);
      }
    }

    // 2. Simpan Baris Data Booking & Invoice ke Google Sheets
    // Periksa daftar tab di spreadsheet
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

    // Periksa apakah baris judul header sudah tersedia di sheet
    const checkHeaderRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${targetSheet}'!A1:R1`,
    });

    const existingHeader = checkHeaderRes.data.values;
    if (!existingHeader || existingHeader.length === 0 || existingHeader[0].length === 0) {
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

    let invoiceInfo = data.invoiceNumber
      ? `${data.invoiceNumber} (${data.tenureMonths || 1} bln - Rp ${Number(data.initialTotalUpfront || 0).toLocaleString('id-ID')})`
      : 'Belum diterbitkan';

    if (driveFileUrl) {
      invoiceInfo += ` | Google Drive JPG: ${driveFileUrl}`;
    }

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

    // Tambahkan baris reservasi baru ke Google Sheets
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
        message: 'Data reservasi & invoice JPG berhasil disimpan ke Google Sheets dan Google Drive!',
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        driveFileId,
        driveFileUrl,
        driveFolderUrl,
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
