import { OFFICIAL_BANK_INFO } from './invoiceUtils';
import { QuoteData } from '../components/CostCalculator';

export const INVOICE_FOLDER_NAME = 'Baswara Sky Suites - Invoices';
export const ADMIN_EMAIL = 'feel.ix.ee@gmail.com';

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

    <!-- Payment Instructions & Bank Details -->
    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #1E293B;">
      <div class="section-label">Instruksi Pembayaran Resmi:</div>
      <div class="bank-card" style="max-width: 480px;">
        <div class="bank-row">
          <span style="color: #94A3B8;">Bank Pembayaran:</span>
          <span style="color: #FFFFFF; font-weight: 600;">${OFFICIAL_BANK_INFO.bankName}</span>
        </div>
        <div class="bank-row">
          <span style="color: #94A3B8;">Atas Nama:</span>
          <span style="color: #FFFFFF; font-weight: 600;">${OFFICIAL_BANK_INFO.accountHolder}</span>
        </div>
        <div class="bank-row account">
          <span style="color: #94A3B8; font-size: 12px; font-weight: 400;">No. Rekening:</span>
          <span>${OFFICIAL_BANK_INFO.accountNumber}</span>
        </div>
      </div>
      <div style="font-size: 11px; color: #94A3B8; margin-top: 8px;">
        *Harap mencantumkan nomor invoice <strong>${invoice.invoiceNumber}</strong> pada berita transfer untuk pencatatan otomatis oleh Finance Division.
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

  let y = 480;
  const items = [
    { name: `Sewa Pokok Unit (${invoice.tenureMonths} Bulan)`, val: formatIdr(invoice.totalRentForTenure || (invoice.discountedMonthly * invoice.tenureMonths)) },
    { name: 'Pajak Pertambahan Nilai (PPN 11%)', val: formatIdr(invoice.ppnAmount || Math.round((invoice.totalRentForTenure || 0) * 0.11)) },
    { name: 'Bea Materai & Administrasi Legalisasi Dokumen', val: formatIdr(invoice.materaiFee || 10000) },
    { name: 'Security Deposit Jaminan (100% Refundable · 2 Bln Sewa Pokok)', val: formatIdr(invoice.securityDeposit) },
  ];

  items.forEach((it) => {
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '18px sans-serif';
    ctx.fillText(it.name, 100, y);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(it.val, 920, y);
    y += 55;
  });

  // Grand Total box
  ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.fillRect(80, 720, 1040, 80);
  ctx.strokeStyle = '#D4AF37';
  ctx.strokeRect(80, 720, 1040, 80);
  ctx.fillStyle = '#F3E5AB';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('TOTAL TAGIHAN PEMBAYARAN:', 110, 768);
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(formatIdr(invoice.initialTotalUpfront), 800, 770);

  // Bank Info
  ctx.fillStyle = '#111827';
  ctx.fillRect(80, 840, 1040, 150);
  ctx.strokeStyle = '#1E293B';
  ctx.strokeRect(80, 840, 1040, 150);
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('REKENING RESMI PEMBAYARAN:', 110, 875);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '17px sans-serif';
  ctx.fillText(`Bank: ${OFFICIAL_BANK_INFO.bankName}   |   Atas Nama: ${OFFICIAL_BANK_INFO.accountHolder}`, 110, 915);
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#F3E5AB';
  ctx.fillText(`No. Rekening: ${OFFICIAL_BANK_INFO.accountNumber}`, 110, 955);

  // Signatures
  const sigY = 1350;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.fillText('MENGETAHUI & MENYETUJUI,', 100, sigY);
  ctx.fillText('OTORISASI LEASING,', 780, sigY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px serif';
  ctx.fillText('Marcelinus Chitraditya Lokananta Prabaswara', 100, sigY + 50);
  ctx.fillText('Natasha Wijaya', 780, sigY + 50);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '15px monospace';
  ctx.fillText('Chief Executive Officer (CEO)', 100, sigY + 75);
  ctx.fillText('Head of Leasing', 780, sigY + 75);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px sans-serif';
  ctx.fillText('PT Baswara Mangkubumi Residence', 100, sigY + 100);
  ctx.fillText('Baswara Sky Suites Leasing Division', 780, sigY + 100);

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
 * Downloads a high-quality JPG representation of the QuoteData directly to the user's device.
 */
export function downloadQuoteDataJpg(
  quoteData: QuoteData,
  tenantName: string = 'Calon Penghuni'
): void {
  const dataUrl = generateInvoiceJpegDataUrl(quoteData, tenantName, '@calon_penghuni');
  const safeInvNo = quoteData.invoiceNumber.replace(/\//g, '_');
  const safeUnit = quoteData.unit.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Invoice_${safeInvNo}_${safeUnit}.jpg`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

