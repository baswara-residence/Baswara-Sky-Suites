export interface OfficialBankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export const OFFICIAL_BANK_INFO: OfficialBankInfo = {
  bankName: 'Chobank',
  accountNumber: '4493 6362 5269 4576',
  accountHolder: 'PT Baswara Mangkubumi Residence',
};

/**
 * Generates and increments the sequential invoice number.
 * Format requirement:
 * - Bulan (MM), Tahun (YYYY), dan Nomor urut invoice masuk (001, 002, ...)
 * - Kode: 'A' untuk Arunika, 'B' untuk Baskara
 * - TIDAK mencantumkan jenis unit dan lama penyewaan
 * Example: INV/BSS/A/10/2026/001 atau INV/BSS/B/10/2026/002
 */
export const getNextInvoiceSequence = (): number => {
  try {
    const raw = localStorage.getItem('bss_invoice_sequence_counter');
    const current = raw ? parseInt(raw, 10) : 1;
    const next = isNaN(current) ? 1 : current + 1;
    localStorage.setItem('bss_invoice_sequence_counter', String(next));
    return isNaN(current) ? 1 : current;
  } catch {
    return 1;
  }
};

export const getCurrentInvoiceSequence = (): number => {
  try {
    const raw = localStorage.getItem('bss_invoice_sequence_counter');
    const current = raw ? parseInt(raw, 10) : 1;
    return isNaN(current) ? 1 : current;
  } catch {
    return 1;
  }
};

export const formatOfficialInvoiceNumber = (
  tower: 'Arunika' | 'Baskara' | string,
  seqNumber?: number,
  date: Date = new Date()
): string => {
  const isArunika = tower.toLowerCase().includes('arunika');
  const towerCode = isArunika ? 'A' : 'B';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const seq = String(seqNumber ?? getCurrentInvoiceSequence()).padStart(3, '0');
  
  // Format: INV/BSS/[A|B]/[MM]/[YYYY]/[NOMOR_URUT]
  return `INV/BSS/${towerCode}/${month}/${year}/${seq}`;
};

/**
 * Mengambil nomor urut live dari Google Sheets via backend Netlify API, sehingga nomor urut
 * selalu sinkron dan berurutan antar semua customer tanpa bentrok atau terulang dari 1.
 */
export async function fetchLiveInvoiceSequence(tower: string = 'Arunika'): Promise<{ sequence: number; invoiceNumber: string }> {
  try {
    const res = await fetch(`/api/saveBooking?action=getSequence&tower=${encodeURIComponent(tower)}`);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.nextSequence === 'number') {
        localStorage.setItem('bss_invoice_sequence_counter', String(data.nextSequence + 1));
        const invoiceNum = formatOfficialInvoiceNumber(tower, data.nextSequence);
        return { sequence: data.nextSequence, invoiceNumber: invoiceNum };
      }
    }
  } catch (err) {
    console.warn('Fallback sequence local calculation:', err);
  }
  const localSeq = getNextInvoiceSequence();
  return {
    sequence: localSeq,
    invoiceNumber: formatOfficialInvoiceNumber(tower, localSeq),
  };
}
