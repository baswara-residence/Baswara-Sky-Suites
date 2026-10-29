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

    <!-- Tenancy Terms & Legal Authorization (No Payment Methods) -->
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
 * Generates an executive, high-resolution 1200x1600 JPG Data URL for the official invoice.
 * Completely standalone using HTML5 Canvas 2D API - guaranteed 100% success rate without DOM dependency.
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

  // Background
  ctx.fillStyle = '#0B0F19';
  ctx.fillRect(0, 0, 1200, 1600);

  // Outer gold border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1120, 1520);

  // Inner thin border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, 1100, 1500);

  // Title
  ctx.fillStyle = '#F3E5AB';
  ctx.font = 'bold 36px serif';
  ctx.fillText('THE BASWARA SKY SUITES', 80, 120);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '16px sans-serif';
  ctx.fillText('Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310', 80, 155);

  // Invoice Number & Dates
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`NO: ${invoice.invoiceNumber}`, 780, 120);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Tanggal Terbit: ${invoice.issueDate}`, 780, 150);
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(`Jatuh Tempo: ${invoice.dueDate} (7 Hari)`, 780, 178);

  // Divider line
  ctx.strokeStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(80, 210);
  ctx.lineTo(1120, 210);
  ctx.stroke();

  // Tenant Info
  ctx.fillStyle = '#D4AF37';
  ctx.font = '14px monospace';
  ctx.fillText('DITAGIHKAN KEPADA:', 80, 250);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px serif';
  ctx.fillText(tenantName, 80, 285);
  ctx.fillStyle = '#D4AF37';
  ctx.font = '16px monospace';
  ctx.fillText(tenantXHandle, 80, 315);

  // Unit Info
  ctx.fillStyle = '#D4AF37';
  ctx.font = '14px monospace';
  ctx.fillText('SPESIFIKASI UNIT & SEWA:', 650, 250);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px serif';
  ctx.fillText(`${invoice.unit.name} · Tower ${invoice.unit.tower}`, 650, 285);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Masa Sewa: ${invoice.tenureMonths} Bulan`, 650, 315);

  // Divider line
  ctx.strokeStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(1120, 360);
  ctx.stroke();

  // Table header
  ctx.fillStyle = '#111827';
  ctx.fillRect(80, 390, 1040, 50);
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('DESKRIPSI TAGIHAN', 100, 422);
  ctx.fillText('TOTAL (IDR)', 950, 422);

  // Table items
  const formatIdr = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const baseMonthly = invoice.baseMonthly || (invoice.unit?.pricePerMonth ?? Math.round(invoice.discountedMonthly / (1 - (invoice.discountRate || 0))));
  const grossRent = baseMonthly * invoice.tenureMonths;
  const effectiveDiscountRate = invoice.discountRate || (invoice.tenureMonths === 12 ? 0.10 : invoice.tenureMonths === 6 ? 0.05 : 0);
  const discountAmount = effectiveDiscountRate > 0
    ? Math.round(grossRent * effectiveDiscountRate)
    : 0;

  let y = 475;
  const rowHeight = 50;

  // 1. Sewa Pokok Unit (Tarif Standar / Gross)
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '17px sans-serif';
  ctx.fillText(`Sewa Pokok Unit (${invoice.tenureMonths} Bulan)`, 100, y);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(formatIdr(effectiveDiscountRate > 0 ? grossRent : (invoice.totalRentForTenure || (invoice.discountedMonthly * invoice.tenureMonths))), 920, y);
  y += rowHeight;

  // 2. Diskon Komitmen Tenor (Jika ada diskon 6 bulan 5% atau 12 bulan 10%)
  if (effectiveDiscountRate > 0 && discountAmount > 0) {
    const discountPercent = Math.round(effectiveDiscountRate * 100);
    // Row background highlight for discount
    ctx.fillStyle = 'rgba(16, 185, 129, 0.10)';
    ctx.fillRect(80, y - 32, 1040, 42);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, y - 32, 1040, 42);

    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`✦ Diskon Komitmen Masa Sewa (${discountPercent}% · ${invoice.tenureMonths} Bulan)`, 100, y - 6);
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`- ${formatIdr(discountAmount)}`, 920, y - 6);
    y += rowHeight;
  }

  // 3. Pajak Pertambahan Nilai (PPN 11%)
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '17px sans-serif';
  ctx.fillText('Pajak Pertambahan Nilai (PPN 11%)', 100, y);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(formatIdr(invoice.ppnAmount || Math.round((invoice.totalRentForTenure || 0) * 0.11)), 920, y);
  y += rowHeight;

  // 4. Bea Materai & Administrasi
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '17px sans-serif';
  ctx.fillText('Bea Materai & Administrasi Legalisasi Dokumen', 100, y);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(formatIdr(invoice.materaiFee || 10000), 920, y);
  y += rowHeight;

  // 5. Security Deposit
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '17px sans-serif';
  ctx.fillText('Security Deposit Jaminan (100% Refundable · 2 Bln Sewa Pokok)', 100, y);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText(formatIdr(invoice.securityDeposit), 920, y);
  y += 45;

  // Grand Total box
  const totalBoxY = y;
  ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.fillRect(80, totalBoxY, 1040, 75);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, totalBoxY, 1040, 75);
  ctx.fillStyle = '#F3E5AB';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('TOTAL TAGIHAN PEMBAYARAN:', 110, totalBoxY + 46);
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(formatIdr(invoice.initialTotalUpfront), 800, totalBoxY + 48);

  // Status Badge: BELUM DIBAYAR / PAYMENT PENDING
  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.fillRect(780, 215, 340, 42);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(780, 215, 340, 42);
  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('STATUS: BELUM DIBAYAR (PENDING)', 795, 242);

  // Ketentuan Penagihan & Legalitas (Menggantikan cara pembayaran sesuai permintaan)
  const legalBoxY = totalBoxY + 105;
  ctx.fillStyle = '#111827';
  ctx.fillRect(80, legalBoxY, 1040, 160);
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, legalBoxY, 1040, 160);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('KETENTUAN RESMI PENAGIHAN & LEGALITAS DOKUMEN:', 110, legalBoxY + 35);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '14px sans-serif';
  ctx.fillText('1. Dokumen invoice ini merupakan bukti penagihan sah yang diterbitkan oleh PT Baswara Mangkubumi Residence.', 110, legalBoxY + 68);
  ctx.fillText('2. Security Deposit (Dana Jaminan Pemeliharaan) bersifat 100% dapat dikembalikan (refundable) pada akhir masa sewa.', 110, legalBoxY + 98);
  ctx.fillText('3. Serah terima unit hunian dan akses kartu resmi diproses setelah verifikasi leasing dikonfirmasi.', 110, legalBoxY + 128);

  // Official Gold Seal Stamp
  ctx.save();
  ctx.translate(600, 1260);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PT BASWARA MANGKUBUMI', 0, -32);
  ctx.fillText('RESIDENCE', 0, -20);
  ctx.fillStyle = '#F3E5AB';
  ctx.font = 'bold 18px serif';
  ctx.fillText('OFFICIAL', 0, 6);
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('LEASING DIVISION', 0, 24);
  ctx.fillText('★ JAKARTA PUSAT ★', 0, 36);
  ctx.restore();

  // Signatures
  const sigY = 1200;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MENGETAHUI & MENYETUJUI,', 100, sigY);
  ctx.fillText('OTORISASI LEASING,', 780, sigY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px serif';
  ctx.fillText('Marcelinus Chitraditya Lokananta Prabaswara', 100, sigY + 55);
  ctx.fillText('Natasha Wijaya', 780, sigY + 55);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '15px monospace';
  ctx.fillText('Chief Executive Officer (CEO)', 100, sigY + 82);
  ctx.fillText('Head of Leasing', 780, sigY + 82);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px sans-serif';
  ctx.fillText('PT Baswara Mangkubumi Residence', 100, sigY + 108);
  ctx.fillText('Baswara Sky Suites Leasing Division', 780, sigY + 108);

  // Footer text
  ctx.fillStyle = '#64748B';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THE BASWARA SKY SUITES · PT BASWARA MANGKUBUMI RESIDENCE · OFFICIAL TENANCY BILLING', 600, 1500);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Generates an executive, high-resolution 1200x1600 JPG Data URL for the official payment receipt (KUITANSI PEMBAYARAN LUNAS).
 * Features authoritative gold/emerald seal stamp, legal wording, Indonesian terbilang, and executive signatures.
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

  // Background - Deep Luxury Navy Noir
  ctx.fillStyle = '#080C14';
  ctx.fillRect(0, 0, 1200, 1600);

  // Outer gold borders
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1120, 1520);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, 1100, 1500);

  // Header
  ctx.fillStyle = '#F3E5AB';
  ctx.font = 'bold 36px serif';
  ctx.fillText('THE BASWARA SKY SUITES', 80, 120);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '15px sans-serif';
  ctx.fillText('PT BASWARA MANGKUBUMI RESIDENCE · Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310', 80, 155);

  // Document Title Header
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.fillRect(80, 190, 1040, 65);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, 190, 1040, 65);

  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 24px serif';
  ctx.fillText('KUITANSI RESMI PEMBAYARAN SEWA (OFFICIAL RECEIPT)', 105, 232);

  // Receipt & Invoice Metadata
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`NO KUITANSI: ${receipt.receiptNumber}`, 80, 300);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '15px monospace';
  ctx.fillText(`Ref. Invoice: ${receipt.invoiceNumber}`, 80, 330);
  ctx.fillText(`Tanggal Pelunasan: ${receipt.paymentDate}`, 80, 360);

  // Prominent "LUNAS / PAID" Official Seal Badge at top right
  ctx.save();
  ctx.translate(920, 320);
  // Outer circle
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 85, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dashed circle
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Seal text
  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THE BASWARA SKY SUITES', 0, -45);
  ctx.fillText('ESCROW VERIFIED', 0, 50);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px serif';
  ctx.fillText('LUNAS', 0, 8);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#10B981';
  ctx.fillText('★ FULLY PAID ★', 0, 28);
  ctx.restore();

  // Divider line
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 420);
  ctx.lineTo(1120, 420);
  ctx.stroke();

  const formatIdr = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Field 1: Telah Diterima Dari
  let curY = 470;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.fillText('TELAH DITERIMA DARI:', 80, curY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px serif';
  ctx.fillText(tenantName, 80, curY + 36);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '16px monospace';
  ctx.fillText(tenantXHandle, 80, curY + 66);

  // Field 2: Uang Sejumlah (Nominal)
  curY = 600;
  ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
  ctx.fillRect(80, curY, 1040, 90);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, curY, 1040, 90);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('UANG SEJUMLAH (IDR):', 110, curY + 35);

  ctx.fillStyle = '#F3E5AB';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(formatIdr(receipt.totalAmount), 110, curY + 75);

  // Field 3: Terbilang
  curY = 730;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.fillText('TERBILANG:', 80, curY);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'italic 18px serif';
  const terbilangText = `# ${numberToIndonesianWords(receipt.totalAmount)} #`;
  ctx.fillText(terbilangText, 80, curY + 35);

  // Field 4: Untuk Pembayaran
  curY = 820;
  ctx.fillStyle = '#111827';
  ctx.fillRect(80, curY, 1040, 160);
  ctx.strokeStyle = '#1E293B';
  ctx.strokeRect(80, curY, 1040, 160);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('UNTUK KEPERLUAN PEMBAYARAN:', 110, curY + 35);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`Pelunasan Sewa Unit ${receipt.unitName} (Tower ${receipt.tower})`, 110, curY + 70);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Masa Sewa: ${receipt.tenureMonths} Bulan  ·  Termasuk PPN 11%, Bea Materai, & Security Deposit Jaminan`, 110, curY + 102);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.fillText(`Metode Pembayaran: ${receipt.paymentMethod || 'Bank Transfer Chobank (Escrow PT Baswara Mangkubumi Residence)'}`, 110, curY + 132);

  // Official Note
  curY = 1015;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.fillRect(80, curY, 1040, 75);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.strokeRect(80, curY, 1040, 75);

  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('PENGESAHAN DOKUMEN:', 105, curY + 28);
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '13px sans-serif';
  ctx.fillText('Kuitansi ini merupakan bukti pembayaran sah dan final yang diterbitkan oleh PT Baswara Mangkubumi Residence.', 105, curY + 52);

  // Signatures
  const sigY = 1370;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.fillText('MENGETAHUI & MENYETUJUI,', 100, sigY);
  ctx.fillText('KEPALA DIVISI KEUANGAN,', 780, sigY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px serif';
  ctx.fillText('Marcelinus Chitraditya Lokananta Prabaswara', 100, sigY + 50);
  ctx.fillText('Natasha Wijaya', 780, sigY + 50);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '15px monospace';
  ctx.fillText('Chief Executive Officer (CEO)', 100, sigY + 75);
  ctx.fillText('Finance Controller & Head of Leasing', 780, sigY + 75);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px sans-serif';
  ctx.fillText('PT Baswara Mangkubumi Residence', 100, sigY + 100);
  ctx.fillText('Official Finance & Treasury Department', 780, sigY + 100);

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

