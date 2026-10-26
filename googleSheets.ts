import { getAccessToken } from './googleAuth';

export interface CoTenant {
  name: string;
  xHandle: string;
  faceClaim: string;
  birthPlaceDate: string;
}

export interface BookingSubmissionData {
  fullName: string;
  xHandle: string;
  faceClaim: string;
  birthPlaceDate: string;
  occupation: string;
  hasPets: boolean;
  petsDescription?: string;
  unitName: string;
  tower: string;
  sizeM2: number;
  capacityText?: string;
  isLivingAlone: boolean;
  coTenants: CoTenant[];
  storyLine: string;
  characterThreadLink: string;
  rulesAgreed: boolean;
  signatureName: string;
  signatureDate: string;
  phone?: string;
  invoiceNumber?: string;
  tenureMonths?: number;
  initialTotalUpfront?: number;
  specialNotes?: string;
}

export interface SaveBookingResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  isNewSpreadsheet?: boolean;
  error?: string;
}

const SPREADSHEET_TITLE = 'Baswara Sky Suites - Customer Reservations';
const SHEET_TAB_NAME = 'Kuesioner & KYC';

const HEADERS = [
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

/**
 * Searches user's Google Drive for existing reservations spreadsheet
 */
export async function findExistingSpreadsheet(accessToken: string): Promise<{ id: string; webViewLink?: string } | null> {
  try {
    const q = encodeURIComponent(`name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to query Google Drive files:', await response.text());
      return null;
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        webViewLink: data.files[0].webViewLink,
      };
    }
    return null;
  } catch (err) {
    console.error('Error finding spreadsheet in Google Drive:', err);
    return null;
  }
}

/**
 * Creates a new Google Spreadsheet in Google Drive with formatted headers
 */
export async function createReservationSpreadsheet(accessToken: string): Promise<{ id: string; webViewLink: string }> {
  // 1. Create spreadsheet with title and sheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const createdData = await createResponse.json();
  const spreadsheetId = createdData.spreadsheetId;
  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Add header row
  const headerAppendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TAB_NAME)}!A1:R1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${SHEET_TAB_NAME}!A1:R1`,
        majorDimension: 'ROWS',
        values: [HEADERS],
      }),
    }
  );

  if (!headerAppendResponse.ok) {
    console.warn('Failed to set header values, proceeding anyway:', await headerAppendResponse.text());
  }

  return { id: spreadsheetId, webViewLink };
}

/**
 * Appends customer booking details to Google Spreadsheet in Google Drive
 */
export async function saveBookingToGoogleSheets(
  booking: BookingSubmissionData,
  tokenOverride?: string
): Promise<SaveBookingResult> {
  const token = tokenOverride || (await getAccessToken());
  if (!token) {
    return {
      success: false,
      error: 'Akun Google belum terhubung. Silakan masuk dengan Google untuk menyimpan data ke Spreadsheet.',
    };
  }

  try {
    let isNewSpreadsheet = false;
    let spreadsheet = await findExistingSpreadsheet(token);

    if (!spreadsheet) {
      spreadsheet = await createReservationSpreadsheet(token);
      isNewSpreadsheet = true;
    }

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    const coTenantsText =
      booking.coTenants && booking.coTenants.length > 0
        ? booking.coTenants
            .map(
              (ct, i) =>
                `#${i + 1} ${ct.name} (${ct.xHandle}) | FC: ${ct.faceClaim || '-'} | TTL: ${ct.birthPlaceDate || '-'}`
            )
            .join(';\n')
        : 'Tidak ada (Tinggal Sendiri)';

    const invoiceInfo = booking.invoiceNumber
      ? `Invoice: ${booking.invoiceNumber} (${booking.tenureMonths || 3} Bulan)`
      : '-';

    const rowData = [
      timestamp,
      booking.fullName,
      booking.xHandle,
      booking.faceClaim,
      booking.birthPlaceDate || '-',
      booking.occupation || '-',
      booking.hasPets ? 'Ya' : 'Tidak',
      booking.hasPets ? booking.petsDescription || '-' : '-',
      `${booking.unitName} (${booking.sizeM2} m²)`,
      booking.tower,
      booking.isLivingAlone ? 'Tinggal Sendiri' : 'Bersama Penyewa Lain',
      booking.coTenants?.length || 0,
      coTenantsText,
      booking.storyLine || '-',
      booking.characterThreadLink || '-',
      booking.rulesAgreed ? `Disetujui [TTD: ${booking.signatureName} - ${booking.signatureDate}]` : 'Belum Disetujui',
      invoiceInfo,
      'Menunggu Verifikasi (Pending KYC Tahap 2)',
    ];

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet.id}/values/${encodeURIComponent(
      SHEET_TAB_NAME
    )}!A:R:append?valueInputOption=USER_ENTERED`;

    const appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    if (!appendRes.ok) {
      // If append failed because tab name is different in older spreadsheet, fallback to Sheet1 or query
      const errText = await appendRes.text();
      // Try fallback to row append without explicit tab or first tab
      const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet.id}/values/A:R:append?valueInputOption=USER_ENTERED`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      });

      if (!fallbackRes.ok) {
        return {
          success: false,
          error: `Gagal menambahkan baris ke Spreadsheet: ${errText}`,
        };
      }
    }

    const spreadsheetUrl =
      spreadsheet.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheet.id}/edit`;

    return {
      success: true,
      spreadsheetId: spreadsheet.id,
      spreadsheetUrl,
      isNewSpreadsheet,
    };
  } catch (error: any) {
    console.error('Error saving to Google Sheets:', error);
    return {
      success: false,
      error: error?.message || 'Terjadi kesalahan saat menyinkronkan ke Google Sheets.',
    };
  }
}
