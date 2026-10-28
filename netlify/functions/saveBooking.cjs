const { google } = require('googleapis');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const https = require('https');

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
  'Link Invoice Belum Lunas (Google Drive)', // Kolom 18 (R)
  'Link Kuitansi Lunas (Google Drive)',      // Kolom 19 (S)
  'Status Pembayaran & KYC',                 // Kolom 20 (T)
];

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
 * Upload image using Google Apps Script Webhook (bypasses Service Account 0GB quota completely)
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
          // Handle redirect
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
  const customDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1P7txSenSZUnfOy7QCFLLo6tsPHk3nKjM';
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!clientEmail || !rawPrivateKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diatur di Netlify Environment Variables.',
        tip: 'Buka Netlify Dashboard -> Site Configuration -> Environment Variables, lalu masukkan kredensial Service Account Anda.',
        help: 'Pastikan Anda telah memasukkan GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SPREADSHEET_ID, dan GOOGLE_DRIVE_FOLDER_ID.',
      }),
    };
  }

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

  const sheets = google.sheets({ version: 'v4', auth });
  let drive = google.drive({ version: 'v3', auth });

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
      const sampleReceiptNumber = `KWT/BSS/${towerCode}/${monthStr}/${yearStr}/${seqStr}`;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          nextSequence,
          sampleInvoiceNumber,
          sampleReceiptNumber,
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

    // 4. Pastikan header sudah ada di Google Sheets (termasuk kolom Link Invoice & Link Kuitansi)
    try {
      const checkHeaderRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${targetSheet}'!A1:T1`,
      });

      const existingHeader = checkHeaderRes.data.values;
      if (!existingHeader || existingHeader.length === 0 || existingHeader[0].length < DEFAULT_HEADERS.length) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${targetSheet}'!A1:T1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [DEFAULT_HEADERS],
          },
        });
      }
    } catch (headErr) {
      console.warn('Header ensure warning:', headErr.message);
    }

    // 5. Hitung nomor urut resmi secara global dari jumlah baris spreadsheet
    let globalSeqNumber = 1;
    try {
      const allRowsRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${targetSheet}'!A:A`,
      });
      const currentRowsCount = (allRowsRes.data.values || []).length;
      globalSeqNumber = Math.max(1, currentRowsCount);
    } catch (seqErr) {
      console.warn('Sequence count fallback:', seqErr.message);
    }

    const towerCode = (data.tower || 'Arunika').toLowerCase().includes('arunika') ? 'A' : 'B';
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const yearStr = now.getFullYear();
    const seqFormatted = String(globalSeqNumber).padStart(3, '0');
    const guaranteedInvoiceNumber = `INV/BSS/${towerCode}/${monthStr}/${yearStr}/${seqFormatted}`;
    const guaranteedReceiptNumber = `KWT/BSS/${towerCode}/${monthStr}/${yearStr}/${seqFormatted}`;

    data.invoiceNumber = guaranteedInvoiceNumber;
    data.receiptNumber = guaranteedReceiptNumber;

    // Check if OAuth Refresh Token or user access token is provided
    let authSource = 'Service Account';
    if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      drive = google.drive({ version: 'v3', auth: oauth2Client });
      authSource = 'OAuth Refresh Token (feel.ix.ee@gmail.com - 15GB Quota)';
    } else {
      const userOAuthToken = data.adminAccessToken ||
        (event.headers.authorization ? event.headers.authorization.replace(/^Bearer /i, '') : null) ||
        process.env.ADMIN_GOOGLE_ACCESS_TOKEN;

      if (userOAuthToken && userOAuthToken.trim().length > 10) {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: userOAuthToken.trim() });
        drive = google.drive({ version: 'v3', auth: oauth2Client });
        authSource = 'Admin OAuth Token (feel.ix.ee@gmail.com)';
      }
    }

    // 6. Simpan File ke Google Drive (Invoice Belum Lunas & Kuitansi Lunas)
    let driveFileId = null;
    let driveFileUrl = data.driveFileUrl || null;
    let receiptFileId = null;
    let receiptFileUrl = data.receiptFileUrl || null;
    let driveFolderId = customDriveFolderId && customDriveFolderId.trim() !== '' ? customDriveFolderId.trim() : null;
    let driveFolderUrl = driveFolderId ? `https://drive.google.com/drive/folders/${driveFolderId}` : null;
    let driveErrors = [];

    // Helper upload file function with robust fallback
    async function uploadImageToDrive(base64Data, filenamePrefix, docDescription) {
      if (!base64Data || typeof base64Data !== 'string') return null;

      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(cleanBase64, 'base64');
      const safeInvoiceNo = guaranteedInvoiceNumber.replace(/\//g, '_');
      const safeName = (data.fullName || 'Tenant').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${filenamePrefix}_${safeInvoiceNo}_${safeName}.jpg`;

      // Method A: Check Google Apps Script Webhook (100% bypasses Service Account quota limitations)
      const targetGasUrl = appsScriptUrl || data.gasUrl;
      if (targetGasUrl) {
        try {
          const gasRes = await uploadViaAppsScript(targetGasUrl, cleanBase64, fileName, driveFolderId);
          if (gasRes && gasRes.success && gasRes.url) {
            return {
              id: gasRes.fileId || null,
              url: gasRes.url,
              isDrive: true,
              source: 'Google Apps Script Webhook',
            };
          }
        } catch (gasErr) {
          console.warn('Apps Script upload note:', gasErr.message);
        }
      }

      // Method B: Google Drive API (supports OAuth token or Service Account)
      try {
        const imageStream = new Readable();
        imageStream.push(imageBuffer);
        imageStream.push(null);

        // Upload with target folder
        let uploadRes;
        try {
          uploadRes = await drive.files.create({
            requestBody: {
              name: fileName,
              parents: driveFolderId ? [driveFolderId] : undefined,
              description: docDescription,
              mimeType: 'image/jpeg',
            },
            media: {
              mimeType: 'image/jpeg',
              body: imageStream,
            },
            fields: 'id, name, webViewLink, webContentLink',
            supportsAllDrives: true,
          });
        } catch (folderSpecificErr) {
          // If folder not found or permission denied on folder, attempt upload to Drive root
          if (driveFolderId && (folderSpecificErr.code === 404 || folderSpecificErr.message?.includes('File not found') || folderSpecificErr.message?.includes('parent'))) {
            console.warn(`Folder ${driveFolderId} not accessible, attempting root upload:`, folderSpecificErr.message);
            const fallbackStream = new Readable();
            fallbackStream.push(imageBuffer);
            fallbackStream.push(null);
            uploadRes = await drive.files.create({
              requestBody: {
                name: fileName,
                description: docDescription,
                mimeType: 'image/jpeg',
              },
              media: {
                mimeType: 'image/jpeg',
                body: fallbackStream,
              },
              fields: 'id, name, webViewLink, webContentLink',
              supportsAllDrives: true,
            });
          } else {
            throw folderSpecificErr;
          }
        }

        const fId = uploadRes.data.id;
        let fUrl = uploadRes.data.webViewLink || `https://drive.google.com/file/d/${fId}/view`;

        // Share permission
        try {
          await drive.permissions.create({
            fileId: fId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
            supportsAllDrives: true,
          });
        } catch (permErr) {
          console.info('Permission setting info:', permErr.message);
        }

        // Share with Admin Email feel.ix.ee@gmail.com
        try {
          await drive.permissions.create({
            fileId: fId,
            requestBody: {
              role: 'writer',
              type: 'user',
              emailAddress: ADMIN_EMAIL,
            },
            supportsAllDrives: true,
          });
        } catch (adminPermErr) {
          console.info('Admin share info:', adminPermErr.message);
        }

        return { id: fId, url: fUrl, isDrive: true, source: authSource };
      } catch (driveErr) {
        console.error(`Google Drive upload error (${filenamePrefix}):`, driveErr.message);
        driveErrors.push(`${filenamePrefix}: ${driveErr.message}`);
        return null;
      }
    }

    // A. Upload Invoice Belum Dibayar
    if (!driveFileUrl && data.invoiceBase64) {
      const invRes = await uploadImageToDrive(
        data.invoiceBase64,
        'Invoice',
        `Official Invoice Sewa ${guaranteedInvoiceNumber} untuk ${data.fullName || ''} (Format JPG)`
      );
      if (invRes) {
        driveFileId = invRes.id;
        driveFileUrl = invRes.url;
      }
    }

    // B. Upload Kuitansi Pelunasan Sewa
    if (!receiptFileUrl && data.receiptBase64) {
      const recRes = await uploadImageToDrive(
        data.receiptBase64,
        'Kuitansi',
        `Kuitansi Resmi Pelunasan Sewa ${guaranteedReceiptNumber} (Invoice ${guaranteedInvoiceNumber}) untuk ${data.fullName || ''}`
      );
      if (recRes) {
        receiptFileId = recRes.id;
        receiptFileUrl = recRes.url;
      }
    }

    // 7. Format baris tabel untuk disimpan ke Google Sheets (20 Kolom: A sampai T)
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

    // Kolom 18: Link Invoice Belum Lunas
    let driveInvoiceCellFormula = 'Belum diunggah';
    if (driveFileUrl) {
      driveInvoiceCellFormula = `=HYPERLINK("${driveFileUrl}"; "Lihat Invoice JPG (Belum Dibayar)")`;
    } else if (driveErrors.length > 0) {
      const quotaDetected = driveErrors.some(e => e.includes('quota') || e.includes('storage'));
      if (quotaDetected) {
        driveInvoiceCellFormula = `=HYPERLINK("${driveFolderUrl || 'https://drive.google.com'}"; "Perlu Shared Drive / Hubungkan Admin (Kuota Service Account 0GB)")`;
      } else {
        driveInvoiceCellFormula = `=HYPERLINK("${driveFolderUrl || 'https://drive.google.com'}"; "Gagal Upload: Bagikan Folder ke Service Account")`;
      }
    }

    // Kolom 19: Link Kuitansi Lunas
    let driveReceiptCellFormula = 'Otomatis Diterbitkan Saat Lunas';
    if (receiptFileUrl) {
      driveReceiptCellFormula = `=HYPERLINK("${receiptFileUrl}"; "Lihat Kuitansi Pelunasan (Lunas)")`;
    } else if (driveErrors.length > 0) {
      driveReceiptCellFormula = `=HYPERLINK("${driveFolderUrl || 'https://drive.google.com'}"; "Arsip Kuitansi Tertunda")`;
    }

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
      driveInvoiceCellFormula,          // R: Link Invoice Belum Lunas (Google Drive)
      driveReceiptCellFormula,          // S: Link Kuitansi Lunas (Google Drive)
      'MENUNGGU_VERIFIKASI_TRANSFER',   // T: Status Pembayaran & KYC
    ];

    // 8. Append baris reservasi baru ke Google Sheets (Range A:T)
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${targetSheet}'!A:T`,
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
        message: 'Data reservasi, invoice belum dibayar, dan kuitansi lunas berhasil diproses!',
        officialInvoiceNumber: guaranteedInvoiceNumber,
        officialReceiptNumber: guaranteedReceiptNumber,
        globalSequence: globalSeqNumber,
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        driveFileId,
        driveFileUrl,
        receiptFileId,
        receiptFileUrl,
        driveFolderUrl,
        driveErrors: driveErrors.length > 0 ? driveErrors : undefined,
        driveTroubleshootTip: driveErrors.length > 0
          ? 'Jika Google Drive menampilkan kuota 0 GB untuk Service Account, bagikan folder di Shared Drive (Drive Bersama) atau klik tombol Hubungkan Akun Google Admin feel.ix.ee@gmail.com di website.'
          : undefined,
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
