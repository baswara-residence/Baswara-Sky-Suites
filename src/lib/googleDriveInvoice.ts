import { OFFICIAL_BANK_INFO, numberToIndonesianWords, formatOfficialReceiptNumber } from './invoiceUtils';
import { QuoteData } from '../components/CostCalculator';

export const INVOICE_FOLDER_NAME = 'Baswara Sky Suites - Invoices';
export const ADMIN_EMAIL = 'feel.ix.ee@gmail.com';

export interface ReceiptData {
  receiptNumber: string;
  invoiceNumber: string;
  paymentDate: string;
  unitName: string;
  tower: string;
  tenureMonths: number;
  totalAmount: number;
  paymentMethod?: string;
  invoice?: QuoteData;
}

export interface SaveInvoiceToDriveParams {
  accessToken: string;
  invoice: QuoteData;
  tenantName: string;
  tenantXHandle: string;
  isLivingAlone: boolean;
  coTenantsCount: number;
}

export interface DriveInvoiceResult {
  success: boolean;
  folderId?: string;
  folderWebViewLink?: string;
  fileId?: string;
  fileWebViewLink?: string;
  fileName?: string;
  error?: string;
}

/**
 * Searches for or creates a dedicated single folder in Google Drive for all invoices.
 */
export async function getOrCreateInvoicesFolder(accessToken: string): Promise<{ id: string; webViewLink?: string }> {
  // 1. Search for existing folder
  const query = encodeURIComponent(
    `name = '${INVOICE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        webViewLink: data.files[0].webViewLink,
      };
    }
  }

  // 2. Folder does not exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: INVOICE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder Resmi Penyimpanan Seluruh Invoice Sewa Baswara Sky Suites (PT Baswara Mangkubumi Residence)',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat folder Google Drive: ${errText}`);
  }

  const newFolder = await createRes.json();
  return {
    id: newFolder.id,
    webViewLink: newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`,
  };
}

/**
 * Generates an executive standalone HTML document for the official Baswara Sky Suites invoice.
 */
export function generateInvoiceHtml(
  invoice: QuoteData,
  tenantName: string,
  tenantXHandle: string,
  isLivingAlone: boolean,
  coTenantsCount: number
): string {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const discountAmount = invoice.discountRate > 0
    ? invoice.baseMonthly - invoice.discountedMonthly
    : 0;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Invoice Resmi - ${invoice.invoiceNumber} - ${tenantName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0B0F19;
      color: #E2E8F0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .invoice-container {
      max-width: 840px;
      margin: 0 auto;
      background: #111827;
      border: 2px solid #D4AF37;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      padding: 48px;
      position: relative;
    }
    .header {
      border-bottom: 1px solid #1E293B;
      padding-bottom: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }
    .brand-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #D4AF37;
      margin-bottom: 6px;
    }
    .brand-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 26px;
      color: #F3E5AB;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .brand-address {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 4px;
    }
    .brand-contact {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #D4AF37;
      margin-top: 4px;
    }
    .badge-status {
      display: inline-block;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid #D4AF37;
      color: #F3E5AB;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      padding: 6px 12px;
      margin-bottom: 12px;
    }
    .meta-block {
      text-align: right;
    }
    .meta-line {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #94A3B8;
      margin-top: 4px;
    }
    .meta-line strong {
      color: #FFFFFF;
    }
    .meta-line.due {
      color: #FBBF24;
    }
    .client-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #1E293B;
      margin-bottom: 28px;
      font-size: 12px;
    }
    .client-col-right {
      text-align: right;
    }
    .section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #D4AF37;
      margin-bottom: 6px;
    }
    .client-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 17px;
      color: #FFFFFF;
      font-weight: 600;
    }
    .table-container {
      margin-bottom: 28px;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: #94A3B8;
      border-bottom: 1px solid #1E293B;
      padding: 10px 8px;
      text-align: left;
    }
    th.right, td.right { text-align: right; }
    th.center, td.center { text-align: center; }
    td {
      padding: 14px 8px;
      border-bottom: 1px solid rgba(30, 41, 59, 0.6);
      vertical-align: middle;
    }
    td.mono { font-family: 'JetBrains Mono', monospace; }
    .item-desc { color: #E2E8F0; font-weight: 500; font-size: 13px; }
    .item-sub { color: #64748B; font-size: 11px; margin-top: 2px; }
    .highlight-row { background: rgba(212, 175, 55, 0.05); }
    .discount-row { background: rgba(16, 185, 129, 0.08); color: #34D399; }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid #1E293B;
      margin-bottom: 28px;
    }
    .bank-card {
      background: #0B0F19;
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 18px;
      font-size: 12px;
    }
    .bank-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .bank-row.account {
      border-top: 1px solid #1E293B;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 14px;
      color: #F3E5AB;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .totals-list {
      font-size: 12px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #94A3B8;
    }
    .total-row.grand {
      border-top: 1px solid #1E293B;
      padding-top: 12px;
      margin-top: 6px;
      font-size: 15px;
      font-weight: 700;
      color: #F3E5AB;
    }
    .total-row.grand span.val {
      font-family: 'JetBrains Mono', monospace;
      color: #D4AF37;
      font-size: 20px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      font-size: 12px;
      padding-top: 12px;
    }
    .sig-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 36px;
    }
    .sig-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 600;
    }
    .sig-role {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #D4AF37;
      margin-top: 2px;
    }
    .sig-corp {
      font-size: 10px;
      color: #64748B;
      margin-top: 2px;
    }
    @media print {
      body { background: white !important; color: black !important; padding: 0 !important; }
      .invoice-container { border: 1px solid #000 !important; box-shadow: none !important; background: white !important; }
      .brand-title, .client-name, .sig-name, strong { color: black !important; }
      .brand-eyebrow, .brand-contact, .section-label, .sig-role { color: #855d00 !important; }
      .total-row.grand span.val { color: #855d00 !important; }
      .bank-card { background: #fafafa !important; border-color: #ccc !important; }
      th, td { border-color: #ddd !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="brand-title">BASWARA SKY SUITES</h1>
        <div class="brand-address">Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310</div>
      </div>
      <div class="meta-block">
        <div class="meta-line">No. Invoice: <strong>${invoice.invoiceNumber}</strong></div>
        <div class="meta-line">Tanggal Terbit: <strong>${invoice.issueDate}</strong></div>
        <div class="meta-line due">Tenggat Waktu: <strong>${invoice.dueDate} (7 Hari)</strong></div>
      </div>
    </div>

    <!-- Client & Specification -->
    <div class="client-grid">
      <div>
        <div class="section-label">Ditagihkan Kepada (Calon Penyewa):</div>
        <div class="client-name">${tenantName}</div>
        <div style="font-family: 'JetBrains Mono', monospace; color: #D4AF37; margin-top: 2px;">${tenantXHandle}</div>
      </div>
      <div class="client-col-right">
        <div class="section-label">Spesifikasi Kontrak & Unit:</div>
        <div style="font-weight: 600; color: #F3E5AB; font-size: 14px;">${invoice.unit.name} · Tower ${invoice.unit.tower}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Deskripsi Layanan / Item</th>
            <th class="center">Kuantitas</th>
            <th class="right">Tarif Satuan</th>
            <th class="right">Total Nominal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-desc">Sewa Pokok Unit Apartemen (${invoice.unit.name}) - ${invoice.tenureMonths} Bulan</div>
              <div class="item-sub">Tower ${invoice.unit.tower} · Luas ${invoice.unit.sizeM2} m² (${invoice.unit.type}) · ${formatRupiah(invoice.baseMonthly)}/bln × ${invoice.tenureMonths} Bulan</div>
            </td>
            <td class="center mono">${invoice.tenureMonths} Bulan</td>
            <td class="right mono">${formatRupiah(invoice.baseMonthly)}</td>
            <td class="right mono" style="color: #FFFFFF; font-weight: 600;">${formatRupiah(invoice.baseMonthly * invoice.tenureMonths)}</td>
          </tr>

          ${invoice.discountRate > 0 ? `
          <tr class="discount-row">
            <td>
              <div class="item-desc" style="color: #34D399;">✦ Privilege Tenancy Discount (${invoice.discountRate * 100}%)</div>
              <div class="item-sub" style="color: rgba(52, 211, 153, 0.8);">Potongan sewa langsung komitmen masa sewa ${invoice.tenureMonths} bulan</div>
            </td>
            <td class="center mono">${invoice.discountRate * 100}%</td>
            <td class="right mono">-${formatRupiah(invoice.baseMonthly - invoice.discountedMonthly)}/bln</td>
            <td class="right mono" style="font-weight: 600;">-${formatRupiah((invoice.baseMonthly - invoice.discountedMonthly) * invoice.tenureMonths)}</td>
          </tr>` : ''}

          <tr>
            <td>
              <div class="item-desc">Pajak Pertambahan Nilai (PPN 11%)</div>
              <div class="item-sub">Pajak sewa resmi 11% dari total nilai kontrak sewa (${formatRupiah(invoice.totalRentForTenure || (invoice.discountedMonthly * invoice.tenureMonths))})</div>
            </td>
            <td class="center mono">11%</td>
            <td class="right mono">11%</td>
            <td class="right mono" style="color: #FFFFFF; font-weight: 600;">${formatRupiah(invoice.ppnAmount || Math.round((invoice.totalRentForTenure || (invoice.discountedMonthly * invoice.tenureMonths)) * 0.11))}</td>
          </tr>

          <tr>
            <td>
              <div class="item-desc">Bea Materai & Administrasi Legalisasi Dokumen</div>
              <div class="item-sub">Legalisasi berkas perjanjian sewa resmi bermaterai lunas (UU No. 10/2020)</div>
            </td>
            <td class="center mono">1 Dokumen</td>
            <td class="right mono">${formatRupiah(invoice.materaiFee || 10000)}</td>
            <td class="right mono" style="color: #FFFFFF; font-weight: 600;">${formatRupiah(invoice.materaiFee || 10000)}</td>
          </tr>

          <tr class="highlight-row">
            <td>
              <div class="item-desc" style="color: #D4AF37;">Security Deposit Jaminan Pemeliharaan (100% Refundable)</div>
              <div class="item-sub">Dana jaminan pemeliharaan (2 bulan sewa pokok), dikembalikan penuh setelah masa sewa berakhir</div>
            </td>
            <td class="center mono">1 Deposit (2 Bln)</td>
            <td class="right mono">${formatRupiah(invoice.securityDeposit)}</td>
            <td class="right mono" style="color: #D4AF37; font-weight: 700;">${formatRupiah(invoice.securityDeposit)}</td>
          </tr>
          <tr style="background: rgba(212, 175, 55, 0.12); border-top: 2px solid #D4AF37;">
            <td colspan="3" style="padding: 16px 8px; font-weight: 700; color: #F3E5AB; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
              Total Tagihan Pembayaran
            </td>
            <td class="right mono" style="padding: 16px 8px; font-size: 16px; font-weight: 700; color: #D4AF37;">
              ${formatRupiah(invoice.initialTotalUpfront)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Official Bank Account Info -->
    <div class="bank-card" style="margin-bottom: 24px;">
      <div class="section-label">Rekening Pembayaran Resmi (Transfer Bank):</div>
      <div class="bank-row">
        <span style="color: #94A3B8;">Bank Tujuan:</span>
        <strong style="color: #FFFFFF;">Bank ${OFFICIAL_BANK_INFO.bankName}</strong>
      </div>
      <div class="bank-row">
        <span style="color: #94A3B8;">Atas Nama:</span>
        <strong style="color: #FFFFFF;">${OFFICIAL_BANK_INFO.accountHolder}</strong>
      </div>
      <div class="bank-row account">
        <span style="color: #94A3B8; font-weight: 400; font-size: 12px;">Nomor Rekening:</span>
        <span>${OFFICIAL_BANK_INFO.accountNumber}</span>
      </div>
    </div>

    <!-- Tenancy Terms & Legal Authorization -->
    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #1E293B;">
      <div class="section-label">Ketentuan Resmi Penagihan & Legalitas Dokumen:</div>
      <div style="background: #0B0F19; border: 1px solid rgba(212, 175, 55, 0.3); padding: 18px; font-size: 12px; color: #CBD5E1; line-height: 1.6;">
        <p style="margin-bottom: 6px;">1. Dokumen invoice ini merupakan bukti penagihan sah yang diterbitkan oleh PT Baswara Mangkubumi Residence.</p>
        <p style="margin-bottom: 6px;">2. Security Deposit (Dana Jaminan Pemeliharaan) bersifat 100% dapat dikembalikan (refundable) pada akhir masa sewa.</p>
        <p>3. Serah terima unit hunian dan legalisasi berkas perjanjian sewa resmi berlaku efektif setelah konfirmasi leasing.</p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="sig-label">Mengetahui & Menyetujui,</div>
        <div class="sig-name">Marcelinus Chitraditya Lokananta Prabaswara</div>
        <div class="sig-role">Chief Executive Officer (CEO)</div>
        <div class="sig-corp">PT Baswara Mangkubumi Residence</div>
      </div>
      <div style="text-align: right;">
        <div class="sig-label">Otorisasi Leasing,</div>
        <div class="sig-name">Natasha Wijaya</div>
        <div class="sig-role">Head of Leasing</div>
        <div class="sig-corp">Baswara Sky Suites Leasing Division</div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

export interface SaveInvoiceToDriveParams {
  accessToken: string;
  invoice: QuoteData;
  tenantName: string;
  tenantXHandle: string;
  isLivingAlone: boolean;
  coTenantsCount: number;
  jpegBlob?: Blob | null;
}

export interface DriveInvoiceResult {
  success: boolean;
  folderId?: string;
  folderWebViewLink?: string;
  fileId?: string;
  fileWebViewLink?: string;
  fileName?: string;
  error?: string;
}

/**
 * Generates an executive, high-resolution 1200x1600 JPG Data URL for the official invoice (Status: Belum Dibayar).
 * Styled like authentic high-end corporate billing on ivory textured parchment paper.
 */
export function generateInvoiceJpegDataUrl(
  invoice: QuoteData,
  tenantName: string,
  tenantXHandle: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Realistic crisp warm alabaster / parchment paper background
  ctx.fillStyle = '#FCFBF9';
  ctx.fillRect(0, 0, 1200, 1600);

  // Subtle luxury border frame
  ctx.strokeStyle = '#855D00';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1120, 1520);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, 1104, 1504);

  // Decorative corner accents
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = '#855D00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 20);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 20, y);
    ctx.stroke();
  };
  drawCorner(55, 55, 1, 1);
  drawCorner(1145, 55, -1, 1);
  drawCorner(55, 1545, 1, -1);
  drawCorner(1145, 1545, -1, -1);

  // Header Brand
  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('PT BASWARA MANGKUBUMI RESIDENCE  ·  PRABASWARA GROUP', 80, 100);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px serif';
  ctx.fillText('THE BASWARA SKY SUITES', 80, 140);

  ctx.fillStyle = '#475569';
  ctx.font = '15px sans-serif';
  ctx.fillText('Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310', 80, 170);

  // Invoice Meta Box (Right aligned)
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(740, 75, 380, 115);
  ctx.strokeStyle = '#D8CEBA';
  ctx.lineWidth = 1;
  ctx.strokeRect(740, 75, 380, 115);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`INVOICE: ${invoice.invoiceNumber}`, 760, 108);

  ctx.fillStyle = '#334155';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Tanggal Terbit : ${invoice.issueDate}`, 760, 138);

  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Jatuh Tempo    : ${invoice.dueDate} (7 Hari)`, 760, 166);

  // Prominent Status Banner
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(80, 210, 1040, 48);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, 210, 1040, 48);

  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('STATUS: BELUM DIBAYAR', 105, 240);

  // Client & Unit Information Grid
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(80, 275, 510, 110);
  ctx.strokeStyle = '#E2D9C8';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 275, 510, 110);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('DITAGIHKAN KEPADA (CALON PENYEWA):', 98, 302);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px serif';
  ctx.fillText(tenantName, 98, 335);
  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(tenantXHandle, 98, 365);

  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(610, 275, 510, 110);
  ctx.strokeStyle = '#E2D9C8';
  ctx.lineWidth = 1;
  ctx.strokeRect(610, 275, 510, 110);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SPESIFIKASI UNIT & MASA KONTRAK:', 628, 302);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px serif';
  ctx.fillText(`${invoice.unit.name} · Tower ${invoice.unit.tower}`, 628, 335);
  ctx.fillStyle = '#334155';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Masa Sewa: ${invoice.tenureMonths} Bulan  ·  Luas: ${invoice.unit.sizeM2} m²`, 628, 365);

  // Table Header
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(80, 410, 1040, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('DESKRIPSI RINCIAN PENAGIHAN', 100, 439);
  ctx.fillText('TOTAL (IDR)', 950, 439);

  // Format Helper
  const formatIdr = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const baseMonthly = invoice.baseMonthly || (invoice.unit?.pricePerMonth ?? Math.round(invoice.discountedMonthly / (1 - (invoice.discountRate || 0))));
  const grossRent = baseMonthly * invoice.tenureMonths;
  const effectiveDiscountRate = invoice.discountRate || (invoice.tenureMonths === 12 ? 0.10 : invoice.tenureMonths === 6 ? 0.05 : 0);
  const discountAmount = effectiveDiscountRate > 0 ? Math.round(grossRent * effectiveDiscountRate) : 0;

  let y = 495;
  const rowHeight = 52;

  // Row 1: Sewa Pokok
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Sewa Pokok Unit (${invoice.unit.name}) - ${invoice.tenureMonths} Bulan`, 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`Tarif Pokok Rp ${baseMonthly.toLocaleString('id-ID')}/bln × ${invoice.tenureMonths} Bulan`, 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(formatIdr(effectiveDiscountRate > 0 ? grossRent : (invoice.totalRentForTenure || (invoice.discountedMonthly * invoice.tenureMonths))), 920, y + 8);
  
  // Row line
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, y + 34);
  ctx.lineTo(1120, y + 34);
  ctx.stroke();

  y += rowHeight + 10;

  // Row 2: Diskon jika ada
  if (effectiveDiscountRate > 0 && discountAmount > 0) {
    const discountPercent = Math.round(effectiveDiscountRate * 100);
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(80, y - 18, 1040, 46);
    ctx.strokeStyle = '#A7F3D0';
    ctx.strokeRect(80, y - 18, 1040, 46);

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`✦ Diskon Komitmen Masa Sewa (${discountPercent}% · ${invoice.tenureMonths} Bulan)`, 100, y + 10);
    ctx.font = 'bold 17px monospace';
    ctx.fillText(`- ${formatIdr(discountAmount)}`, 920, y + 10);

    y += rowHeight;
  }

  // Row 3: PPN 11%
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Pajak Pertambahan Nilai (PPN 11%)', 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('11% dari total nilai sewa unit apartemen', 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(formatIdr(invoice.ppnAmount || Math.round((invoice.totalRentForTenure || 0) * 0.11)), 920, y + 8);

  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(80, y + 34);
  ctx.lineTo(1120, y + 34);
  ctx.stroke();

  y += rowHeight + 10;

  // Row 4: Bea Materai
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Bea Materai & Administrasi Legalisasi Dokumen', 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Legalisasi perjanjian sewa resmi bermaterai lunas', 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(formatIdr(invoice.materaiFee || 10000), 920, y + 8);

  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(80, y + 34);
  ctx.lineTo(1120, y + 34);
  ctx.stroke();

  y += rowHeight + 10;

  // Row 5: Security Deposit
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Security Deposit Jaminan (100% Refundable · 2 Bln Sewa Pokok)', 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#92400E';
  ctx.fillText('Jaminan pemeliharaan unit, dikembalikan penuh di akhir masa sewa', 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#855D00';
  ctx.fillText(formatIdr(invoice.securityDeposit), 920, y + 8);

  y += 50;

  // Grand Total Box
  const totalBoxY = y;
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(80, totalBoxY, 1040, 80);
  ctx.strokeStyle = '#855D00';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(80, totalBoxY, 1040, 80);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('TOTAL TAGIHAN PEMBAYARAN:', 110, totalBoxY + 48);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 30px monospace';
  ctx.fillText(formatIdr(invoice.initialTotalUpfront), 780, totalBoxY + 50);

  // Official Bank Account Box
  const bankBoxY = totalBoxY + 95;
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(80, bankBoxY, 1040, 92);
  ctx.strokeStyle = '#855D00';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, bankBoxY, 1040, 92);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('REKENING PEMBAYARAN RESMI (TRANSFER BANK):', 105, bankBoxY + 26);

  ctx.fillStyle = '#334155';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Bank ${OFFICIAL_BANK_INFO.bankName}  ·  a/n ${OFFICIAL_BANK_INFO.accountHolder}`, 105, bankBoxY + 54);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Cantumkan nomor invoice (${invoice.invoiceNumber}) pada berita transfer`, 105, bankBoxY + 76);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('NOMOR REKENING RESMI:', 1095, bankBoxY + 30);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(OFFICIAL_BANK_INFO.accountNumber, 1095, bankBoxY + 64);
  ctx.textAlign = 'left';

  // Legal Terms Box
  const legalBoxY = bankBoxY + 110;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(80, legalBoxY, 1040, 126);
  ctx.strokeStyle = '#E2D9C8';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, legalBoxY, 1040, 126);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('KETENTUAN RESMI PENAGIHAN & LEGALITAS DOKUMEN:', 105, legalBoxY + 28);

  ctx.fillStyle = '#334155';
  ctx.font = '14px sans-serif';
  ctx.fillText('1. Dokumen invoice ini merupakan bukti penagihan sah yang diterbitkan oleh PT Baswara Mangkubumi Residence.', 105, legalBoxY + 56);
  ctx.fillText('2. Security Deposit (Dana Jaminan Pemeliharaan) bersifat 100% dapat dikembalikan (refundable) pada akhir masa sewa.', 105, legalBoxY + 82);
  ctx.fillText('3. Serah terima kunci unit hunian dan kartu akses resmi diproses setelah verifikasi leasing dikonfirmasi.', 105, legalBoxY + 108);

  // Official Gold Seal Stamp
  ctx.save();
  ctx.translate(600, 1310);
  ctx.strokeStyle = 'rgba(133, 93, 0, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(133, 93, 0, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PT BASWARA MANGKUBUMI', 0, -32);
  ctx.fillText('RESIDENCE', 0, -20);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px serif';
  ctx.fillText('OFFICIAL', 0, 6);
  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('LEASING DIVISION', 0, 24);
  ctx.fillText('★ JAKARTA PUSAT ★', 0, 38);
  ctx.restore();

  // Signatures
  const sigY = 1270;
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MENGETAHUI & MENYETUJUI,', 100, sigY);
  ctx.fillText('OTORISASI LEASING,', 780, sigY);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px serif';
  ctx.fillText('Marcelinus Chitraditya Lokananta Prabaswara', 100, sigY + 50);
  ctx.fillText('Natasha Wijaya', 780, sigY + 50);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('Chief Executive Officer (CEO)', 100, sigY + 76);
  ctx.fillText('Head of Leasing', 780, sigY + 76);

  ctx.fillStyle = '#64748B';
  ctx.font = '13px sans-serif';
  ctx.fillText('PT Baswara Mangkubumi Residence', 100, sigY + 100);
  ctx.fillText('Baswara Sky Suites Leasing Division', 780, sigY + 100);

  // Footer text
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THE BASWARA SKY SUITES · PT BASWARA MANGKUBUMI RESIDENCE · OFFICIAL TENANCY BILLING', 600, 1530);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Generates an authoritative, high-resolution 1200x1600 JPG Data URL for the official payment receipt (KUITANSI PEMBAYARAN LUNAS).
 * Styled on crisp warm alabaster / parchment paper (#FCFBF9) with the exact matching itemized table and an emerald & gold "LUNAS / FULLY PAID" seal.
 */
export function generateReceiptJpegDataUrl(
  receipt: ReceiptData,
  tenantName: string,
  tenantXHandle: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Warm alabaster textured paper background
  ctx.fillStyle = '#FCFBF9';
  ctx.fillRect(0, 0, 1200, 1600);

  // Outer emerald & gold borders
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1120, 1520);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, 1104, 1504);

  // Decorative corner accents
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 20);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 20, y);
    ctx.stroke();
  };
  drawCorner(55, 55, 1, 1);
  drawCorner(1145, 55, -1, 1);
  drawCorner(55, 1545, 1, -1);
  drawCorner(1145, 1545, -1, -1);

  // Header Brand
  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('PT BASWARA MANGKUBUMI RESIDENCE  ·  PRABASWARA GROUP', 80, 100);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px serif';
  ctx.fillText('THE BASWARA SKY SUITES', 80, 140);

  ctx.fillStyle = '#475569';
  ctx.font = '15px sans-serif';
  ctx.fillText('Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310', 80, 170);

  // Receipt Meta Box (Right aligned)
  ctx.fillStyle = '#ECFDF5';
  ctx.fillRect(740, 75, 380, 115);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(740, 75, 380, 115);

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(`KUITANSI: ${receipt.receiptNumber}`, 755, 108);

  ctx.fillStyle = '#334155';
  ctx.font = '13px monospace';
  ctx.fillText(`Ref. Invoice : ${receipt.invoiceNumber}`, 755, 136);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`Tgl Pelunasan: ${receipt.paymentDate}`, 755, 164);

  // Prominent "LUNAS / FULLY PAID" Status Banner
  ctx.fillStyle = '#ECFDF5';
  ctx.fillRect(80, 210, 1040, 48);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 210, 1040, 48);

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('STATUS: LUNAS', 105, 240);

  // Client & Unit Information Grid
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(80, 275, 510, 110);
  ctx.strokeStyle = '#E2D9C8';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 275, 510, 110);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('TELAH DITERIMA DARI (PENYEWA):', 98, 302);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px serif';
  ctx.fillText(tenantName, 98, 335);
  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(tenantXHandle, 98, 365);

  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(610, 275, 510, 110);
  ctx.strokeStyle = '#E2D9C8';
  ctx.lineWidth = 1;
  ctx.strokeRect(610, 275, 510, 110);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SPESIFIKASI UNIT & MASA KONTRAK:', 628, 302);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px serif';
  ctx.fillText(`${receipt.unitName} · Tower ${receipt.tower}`, 628, 335);
  ctx.fillStyle = '#334155';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Masa Sewa: ${receipt.tenureMonths} Bulan  ·  Status Pembayaran: LUNAS`, 628, 365);

  // Table Header
  ctx.fillStyle = '#065F46';
  ctx.fillRect(80, 410, 1040, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('DESKRIPSI RINCIAN PEMBAYARAN LUNAS', 100, 439);
  ctx.fillText('TOTAL TERBAYAR (IDR)', 880, 439);

  // Format Helper
  const formatIdr = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Financial calculations from attached quote or reconstructed
  const inv = receipt.invoice;
  const tenure = receipt.tenureMonths || 3;
  const effectiveDiscountRate = inv ? (inv.discountRate || (tenure === 12 ? 0.10 : tenure === 6 ? 0.05 : 0)) : (tenure === 12 ? 0.10 : tenure === 6 ? 0.05 : 0);
  
  // Reconstruct if inv not present:
  let totalUpfront = receipt.totalAmount;
  let baseMonthly = inv ? inv.baseMonthly : 0;
  let discountedMonthly = inv ? inv.discountedMonthly : 0;
  let discountAmount = 0;
  let totalRent = 0;
  let ppn = 0;
  let materai = 10000;
  let securityDeposit = 0;

  if (inv) {
    baseMonthly = inv.baseMonthly;
    discountedMonthly = inv.discountedMonthly;
    const grossRent = baseMonthly * tenure;
    discountAmount = effectiveDiscountRate > 0 ? Math.round(grossRent * effectiveDiscountRate) : 0;
    totalRent = inv.totalRentForTenure || (discountedMonthly * tenure);
    ppn = inv.ppnAmount || Math.round(totalRent * 0.11);
    materai = inv.materaiFee || 10000;
    securityDeposit = inv.securityDeposit;
    totalUpfront = inv.initialTotalUpfront;
  } else {
    // Math approximation from totalUpfront = totalRent + 0.11*totalRent + 10000 + 2*discountedMonthly
    // totalRent = discountedMonthly * tenure => totalUpfront = discountedMonthly*(1.11*tenure + 2) + 10000
    const factor = (1.11 * tenure + 2);
    discountedMonthly = Math.round((totalUpfront - 10000) / factor);
    baseMonthly = effectiveDiscountRate > 0 ? Math.round(discountedMonthly / (1 - effectiveDiscountRate)) : discountedMonthly;
    const grossRent = baseMonthly * tenure;
    discountAmount = effectiveDiscountRate > 0 ? Math.round(grossRent * effectiveDiscountRate) : 0;
    totalRent = discountedMonthly * tenure;
    ppn = Math.round(totalRent * 0.11);
    securityDeposit = discountedMonthly * 2;
  }

  const grossRent = baseMonthly * tenure;

  let y = 495;
  const rowHeight = 52;

  // Row 1: Sewa Pokok
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Sewa Pokok Unit (${receipt.unitName}) - ${tenure} Bulan`, 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`Tarif Pokok Rp ${baseMonthly.toLocaleString('id-ID')}/bln × ${tenure} Bulan`, 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(formatIdr(effectiveDiscountRate > 0 ? grossRent : totalRent), 920, y + 8);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, y + 34);
  ctx.lineTo(1120, y + 34);
  ctx.stroke();

  y += rowHeight + 10;

  // Row 2: Diskon jika ada
  if (effectiveDiscountRate > 0 && discountAmount > 0) {
    const discountPercent = Math.round(effectiveDiscountRate * 100);
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(80, y - 18, 1040, 46);
    ctx.strokeStyle = '#A7F3D0';
    ctx.strokeRect(80, y - 18, 1040, 46);

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`✦ Diskon Komitmen Masa Sewa (${discountPercent}% · ${tenure} Bulan)`, 100, y + 10);
    ctx.font = 'bold 17px monospace';
    ctx.fillText(`- ${formatIdr(discountAmount)}`, 920, y + 10);

    y += rowHeight;
  }

  // Row 3: PPN 11%
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Pajak Pertambahan Nilai (PPN 11%)', 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('11% dari total nilai sewa unit apartemen', 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(formatIdr(ppn), 920, y + 8);

  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(80, y + 34);
  ctx.lineTo(1120, y + 34);
  ctx.stroke();

  y += rowHeight + 10;

  // Row 4: Bea Materai
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Bea Materai & Administrasi Legalisasi Dokumen', 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Legalisasi perjanjian sewa resmi bermaterai lunas', 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(formatIdr(materai), 920, y + 8);

  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(80, y + 34);
  ctx.lineTo(1120, y + 34);
  ctx.stroke();

  y += rowHeight + 10;

  // Row 5: Security Deposit
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Security Deposit Jaminan (100% Refundable · 2 Bln Sewa Pokok)', 100, y);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#92400E';
  ctx.fillText('Jaminan pemeliharaan unit, dikembalikan penuh di akhir masa sewa', 100, y + 20);

  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#855D00';
  ctx.fillText(formatIdr(securityDeposit), 920, y + 8);

  y += 50;

  // Grand Total Box (Lunas)
  const totalBoxY = y;
  ctx.fillStyle = '#ECFDF5';
  ctx.fillRect(80, totalBoxY, 1040, 80);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(80, totalBoxY, 1040, 80);

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('TOTAL TELAH DIBAYAR LUNAS:', 110, totalBoxY + 48);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 30px monospace';
  ctx.fillText(formatIdr(totalUpfront), 780, totalBoxY + 50);

  // Terbilang Text & Method
  const legalBoxY = totalBoxY + 95;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(80, legalBoxY, 1040, 160);
  ctx.strokeStyle = '#E2D9C8';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, legalBoxY, 1040, 160);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('TERBILANG:', 105, legalBoxY + 28);

  ctx.fillStyle = '#065F46';
  ctx.font = 'italic bold 15px serif';
  const terbilangStr = `# ${numberToIndonesianWords(totalUpfront)} #`;
  ctx.fillText(terbilangStr, 105, legalBoxY + 54);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('KETERANGAN & METODE TRANSAKSI:', 105, legalBoxY + 86);

  ctx.fillStyle = '#334155';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Metode Pembayaran : ${receipt.paymentMethod || 'Bank Transfer Chobank (Escrow PT Baswara Mangkubumi Residence)'}`, 105, legalBoxY + 110);
  ctx.fillText('Catatan Pengesahan : Pembayaran telah diverifikasi secara sah. Dokumen kuitansi ini bersifat final.', 105, legalBoxY + 134);

  // Prominent "LUNAS / FULLY PAID" Official Seal Stamp at bottom center
  ctx.save();
  ctx.translate(600, 1315);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PT BASWARA MANGKUBUMI', 0, -34);
  ctx.fillText('RESIDENCE', 0, -22);

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 24px serif';
  ctx.fillText('LUNAS', 0, 8);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('★ FULLY PAID ★', 0, 26);
  ctx.fillText('JAKARTA PUSAT', 0, 42);
  ctx.restore();

  // Signatures
  const sigY = 1270;
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MENGETAHUI & MENYETUJUI,', 100, sigY);
  ctx.fillText('DIVISI KEUANGAN & LEASING,', 780, sigY);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px serif';
  ctx.fillText('Marcelinus Chitraditya Lokananta Prabaswara', 100, sigY + 50);
  ctx.fillText('Natasha Wijaya', 780, sigY + 50);

  ctx.fillStyle = '#855D00';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('Chief Executive Officer (CEO)', 100, sigY + 76);
  ctx.fillText('Finance Controller & Head of Leasing', 780, sigY + 76);

  ctx.fillStyle = '#64748B';
  ctx.font = '13px sans-serif';
  ctx.fillText('PT Baswara Mangkubumi Residence', 100, sigY + 100);
  ctx.fillText('Official Finance & Treasury Department', 780, sigY + 100);

  // Footer text
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THE BASWARA SKY SUITES · PT BASWARA MANGKUBUMI RESIDENCE · OFFICIAL PAYMENT RECEIPT', 600, 1530);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Fallback generator that creates a high-resolution JPG Blob using generateInvoiceJpegDataUrl.
 */
async function createFallbackInvoiceJpegBlob(
  invoice: QuoteData,
  tenantName: string,
  tenantXHandle: string
): Promise<Blob> {
  const dataUrl = generateInvoiceJpegDataUrl(invoice, tenantName, tenantXHandle);
  const res = await fetch(dataUrl);
  return await res.blob();
}

/**
 * Saves or updates the invoice into Google Drive as a JPG file.
 */
export async function saveInvoiceToDriveFolder({
  accessToken,
  invoice,
  tenantName,
  tenantXHandle,
  isLivingAlone,
  coTenantsCount,
  jpegBlob,
}: SaveInvoiceToDriveParams): Promise<DriveInvoiceResult> {
  try {
    // 1. Get or create the single folder for all invoices
    const folder = await getOrCreateInvoicesFolder(accessToken);
    const folderId = folder.id;

    // 2. Generate file name for JPG
    const sanitizedNumber = invoice.invoiceNumber.replace(/\//g, '_');
    const sanitizedName = tenantName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Invoice_${sanitizedNumber}_${sanitizedName}.jpg`;

    // 3. Obtain JPG Blob (passed from html2canvas or fallback)
    let finalJpegBlob: Blob;
    if (jpegBlob) {
      finalJpegBlob = jpegBlob;
    } else {
      finalJpegBlob = await createFallbackInvoiceJpegBlob(invoice, tenantName, tenantXHandle);
    }

    // 4. Check if file already exists in this folder
    const fileQuery = encodeURIComponent(
      `name = '${fileName}' and '${folderId}' in parents and trashed = false`
    );
    const checkFileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${fileQuery}&fields=files(id,webViewLink)&pageSize=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let existingFileId: string | null = null;
    let existingWebViewLink: string | null = null;
    if (checkFileRes.ok) {
      const existingData = await checkFileRes.json();
      if (existingData.files && existingData.files.length > 0) {
        existingFileId = existingData.files[0].id;
        existingWebViewLink = existingData.files[0].webViewLink;
      }
    }

    const metadata = {
      name: fileName,
      parents: existingFileId ? undefined : [folderId],
      description: `Official Invoice Sewa ${invoice.invoiceNumber} untuk ${tenantName} di Baswara Sky Suites (Format JPG)`,
      mimeType: 'image/jpeg',
    };

    const boundary = 'baswara_drive_upload_boundary_jpeg_789';
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json; charset=UTF-8',
    });

    const multipartRequestBody = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      metadataBlob,
      `\r\n--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`,
      finalJpegBlob,
      `\r\n--${boundary}--`,
    ], { type: `multipart/related; boundary=${boundary}` });

    let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
    let method = 'POST';

    if (existingFileId) {
      uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,webViewLink`;
      method = 'PATCH';
    }

    const uploadRes = await fetch(uploadUrl, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: multipartRequestBody,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Failed to upload invoice JPG to Google Drive:', errText);
      return {
        success: false,
        folderId,
        folderWebViewLink: folder.webViewLink,
        error: `Gagal menyimpan invoice JPG ke Google Drive (${uploadRes.status}).`,
      };
    }

    const uploadedFileData = await uploadRes.json();

    return {
      success: true,
      folderId,
      folderWebViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folderId}`,
      fileId: uploadedFileData.id,
      fileWebViewLink: uploadedFileData.webViewLink || `https://drive.google.com/file/d/${uploadedFileData.id}/view`,
      fileName,
    };
  } catch (error: any) {
    console.error('Error in saveInvoiceToDriveFolder:', error);
    return {
      success: false,
      error: error?.message || 'Terjadi kesalahan saat menyimpan file JPG ke Google Drive.',
    };
  }
}

/**
 * Saves a high-quality JPG representation of the QuoteData to the specified Google Drive folder via Netlify function.
 */
export async function saveQuoteJpgToDrive(
  quoteData: QuoteData,
  tenantName: string = 'Calon Penghuni'
): Promise<{ success: boolean; link?: string; fileId?: string; error?: string }> {
  try {
    const dataUrl = generateInvoiceJpegDataUrl(quoteData, tenantName, '@calon_penghuni');
    const safeInvNo = quoteData.invoiceNumber.replace(/\//g, '_');
    const safeUnit = quoteData.unit.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Invoice_${safeInvNo}_${safeUnit}.jpg`;

    const res = await fetch('/api/uploadInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileBase64: dataUrl,
        mimeType: 'image/jpeg',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Server error (${res.status}): Gagal menyimpan ke Google Drive`,
      };
    }

    return {
      success: true,
      link: data.link || data.webViewLink,
      fileId: data.fileId,
    };
  } catch (err: any) {
    console.error('Error in saveQuoteJpgToDrive:', err);
    return {
      success: false,
      error: err.message || 'Koneksi ke endpoint /api/uploadInvoice gagal.',
    };
  }
}

/**
 * Downloads a high-quality JPG representation of the QuoteData (Invoice Belum Dibayar) directly to the user's device.
 */
export function downloadQuoteDataJpg(
  quoteData: QuoteData,
  tenantName: string = 'Calon Penghuni',
  tenantXHandle: string = '@calon_penghuni'
): void {
  const dataUrl = generateInvoiceJpegDataUrl(quoteData, tenantName, tenantXHandle);
  const safeInvNo = quoteData.invoiceNumber.replace(/\//g, '_');
  const safeUnit = (quoteData.unit?.name || 'Unit').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Invoice_${safeInvNo}_${safeUnit}_UNPAID.jpg`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads an official high-quality JPG representation of the Payment Receipt (Kuitansi Lunas).
 */
export function downloadReceiptJpg(
  receiptData: ReceiptData,
  tenantName: string = 'Penghuni',
  tenantXHandle: string = '@penghuni'
): void {
  const dataUrl = generateReceiptJpegDataUrl(receiptData, tenantName, tenantXHandle);
  const safeReceiptNo = receiptData.receiptNumber.replace(/\//g, '_');
  const fileName = `Kuitansi_${safeReceiptNo}_LUNAS.jpg`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

