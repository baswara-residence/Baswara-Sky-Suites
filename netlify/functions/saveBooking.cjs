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
  'Link Invoice JPG (Google Drive)', // Kolom khusus link file JPG di Google Drive
  'Status KYC',
];

const INVOICE_FOLDER_NAME = 'Baswara Sky Suites - Invoices';
const ADMIN_EMAIL = 'feel.ix.ee@gmail.com';

exports.handler = async function (event, context) {
  // 1. Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A';
  const customDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !rawPrivateKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diatur di Netlify Environment Variables.',
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

  // 2. Tentukan target sheet tab
  let targetSheet = 'Kuesioner & KYC';
  try {
    const ssMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = (ssMeta.data.sheets || []).map((s) => s.properties?.title || '');
    if (!sheetList.includes(targetSheet)) {
      targetSheet = sheetList.length > 0 && sheetList[0] ? sheetList[0] : 'Sheet1';
    }
  } catch (metaErr) {
    console.warn('Metadata query warning:', metaErr.message);
  }

  // 3. Handle GET: Mengambil nomor urut invoice global berikutnya secara live dari baris Google Sheets
  if (event.httpMethod === 'GET') {
    try {
      const checkRowsRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${targetSheet}'!A:A`,
      });
      const rows = checkRowsRes.data.values || [];
      const nextSequence = Math.max(1, rows.length); // Baris 1 adalah header, baris 2 adalah urut 1

      const queryTower = (event.queryStringParameters && event.queryStringParameters.tower) || 'Arunika';
      const towerCode = queryTower.toLowerCase().includes('arunika') ? 'A' : 'B';
      const now = new Date();
      const monthStr = String(now.getMonth() + 1).padStart(2, '0');
      const yearStr = now.getFullYear();
      const seqStr = String(nextSequence).padStart(3, '0');
      const sampleInvoiceNumber = `INV/BSS/${towerCode}/${monthStr}/${yearStr}/${seqStr}`;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          nextSequence,
          sampleInvoiceNumber,
        }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: err.message, nextSequence: 1 }),
      };
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed. Gunakan GET untuk nomor urut atau POST untuk menyimpan booking.' }),
    };
  }

  try {
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

    // 4. Pastikan header sudah ada di Google Sheets (termasuk kolom baru Link Invoice JPG)
    const checkHeaderRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${targetSheet}'!A1:S1`,
    });

    const existingHeader = checkHeaderRes.data.values;
    if (!existingHeader || existingHeader.length === 0 || existingHeader[0].length < DEFAULT_HEADERS.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${targetSheet}'!A1:S1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [DEFAULT_HEADERS],
        },
      });
    }

    // 5. Hitung nomor urut resmi secara global dari jumlah baris spreadsheet
    const allRowsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${targetSheet}'!A:A`,
    });
    const currentRowsCount = (allRowsRes.data.values || []).length;
    const globalSeqNumber = Math.max(1, currentRowsCount);

    const towerCode = (data.tower || 'Arunika').toLowerCase().includes('arunika') ? 'A' : 'B';
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const yearStr = now.getFullYear();
    const seqFormatted = String(globalSeqNumber).padStart(3, '0');
    const guaranteedInvoiceNumber = `INV/BSS/${towerCode}/${monthStr}/${yearStr}/${seqFormatted}`;

    data.invoiceNumber = guaranteedInvoiceNumber;

    // 6. Simpan Invoice JPG ke Google Drive jika terdapat payload gambar
    let driveFileId = null;
    let driveFileUrl = data.driveFileUrl || null; // Gunakan driveFileUrl jika sudah di-upload sebelumnya
    let driveFolderId = customDriveFolderId && customDriveFolderId.trim() !== '' ? customDriveFolderId.trim() : null;
    let driveFolderUrl = null;

    if (!driveFileUrl && data.invoiceBase64 && typeof data.invoiceBase64 === 'string') {
      try {
        if (!driveFolderId) {
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

            // Beri akses ke email admin
            try {
              await drive.permissions.create({
                fileId: driveFolderId,
                requestBody: {
                  role: 'writer',
                  type: 'user',
                  emailAddress: ADMIN_EMAIL,
                },
              });
            } catch (shareErr) {
              console.info('Share folder note:', shareErr.message);
            }
          }
        } else {
          driveFolderUrl = `https://drive.google.com/drive/folders/${driveFolderId}`;
        }

        // Siapkan stream buffer JPG
        const cleanBase64 = data.invoiceBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        const imageStream = new Readable();
        imageStream.push(imageBuffer);
        imageStream.push(null);

        const safeInvoiceNo = guaranteedInvoiceNumber.replace(/\//g, '_');
        const safeName = (data.fullName || 'Tenant').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `Invoice_${safeInvoiceNo}_${safeName}.jpg`;

        // Upload file JPG
        const fileUploadRes = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: driveFolderId ? [driveFolderId] : undefined,
            description: `Official Invoice Sewa ${guaranteedInvoiceNumber} untuk ${data.fullName || ''} (Format JPG)`,
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

        // Jadikan file JPG bisa dibuka oleh siapa saja yang memiliki link
        try {
          await drive.permissions.create({
            fileId: driveFileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
        } catch (permErr) {
          console.info('File permission note:', permErr.message);
        }
      } catch (driveErr) {
        console.error('Error uploading invoice JPG to Google Drive:', driveErr);
      }
    }

    // 7. Format baris tabel untuk disimpan ke Google Sheets (19 Kolom: A sampai S)
    let coTenantsSummary = '-';
    if (Array.isArray(data.coTenants) && data.coTenants.length > 0) {
      coTenantsSummary = data.coTenants
        .map((c, i) => `${i + 1}. ${c.name || 'Tanpa Nama'} (${c.xHandle || '-'}) - FC: ${c.faceClaim || '-'}, TTL: ${c.birthPlaceDate || '-'}`)
        .join(' | ');
    }

    const timestampWIB = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const invoiceInfo = `${guaranteedInvoiceNumber} (${data.tenureMonths || 1} bln - Rp ${Number(data.initialTotalUpfront || 0).toLocaleString('id-ID')})`;

    // Kolom 18: Link Google Drive (menggunakan hyperlink clickable di spreadsheet)
    const driveCellFormula = driveFileUrl
      ? `=HYPERLINK("${driveFileUrl}"; "Lihat Invoice JPG di Google Drive")`
      : 'Belum diunggah';

    const rulesSignatureInfo = data.rulesAgreed
      ? `Disetujui (${data.signatureName || data.fullName} - ${data.signatureDate || new Date().toISOString().split('T')[0]})`
      : 'Belum';

    const rowValues = [
      timestampWIB,                     // A: Waktu Pendaftaran
      data.fullName || '-',             // B: Nama Lengkap
      data.xHandle || '-',              // C: Username X (Twitter)
      data.faceClaim || '-',            // D: Face Claim
      data.birthPlaceDate || '-',       // E: Tempat, Tanggal Lahir
      data.occupation || '-',           // F: Pekerjaan
      data.hasPets ? 'Ya' : 'Tidak',    // G: Peliharaan (Pets)
      data.petsDescription || '-',      // H: Rincian Peliharaan
      data.unitName || '-',             // I: Pilihan Unit
      data.tower || '-',                // J: Tower
      data.isLivingAlone ? 'Tinggal Sendiri (Single Occupancy)' : 'Bersama Co-Tenant', // K: Status Hunian
      data.coTenants ? String(data.coTenants.length) : '0',                           // L: Jumlah Penyewa Tambahan
      coTenantsSummary,                 // M: Identitas Penyewa Tambahan
      data.storyLine || '-',            // N: Story Line Singkat
      data.characterThreadLink || '-',  // O: Link Thread / Utas Karakter
      rulesSignatureInfo,               // P: Persetujuan Rules & Tanda Tangan
      invoiceInfo,                      // Q: Invoice / Masa Sewa
      driveCellFormula,                 // R: Link Invoice JPG (Google Drive) <-- KOLOM DEDIKASI
      'MENUNGGU_REVIEW',                // S: Status KYC
    ];

    // 8. Append baris reservasi baru ke Google Sheets (Range A:S)
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${targetSheet}'!A:S`,
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
        message: 'Data reservasi & link invoice JPG berhasil disimpan ke Google Sheets dan Google Drive!',
        officialInvoiceNumber: guaranteedInvoiceNumber,
        globalSequence: globalSeqNumber,
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
