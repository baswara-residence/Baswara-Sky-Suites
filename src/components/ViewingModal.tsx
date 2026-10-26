import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Unit, UNITS_DATA, getUnitMaxCapacity } from '../data/units';
import { QuoteData } from './CostCalculator';
import {
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  FileText,
  Calculator,
  UserPlus,
  Trash2,
  ShieldCheck,
  BookOpen,
  PenTool,
  Check,
  Users,
  Dog,
  ScrollText,
  Building2,
  Sparkles,
  Lock,
  FolderArchive,
  HardDrive,
  FileDown,
} from 'lucide-react';
import {
  formatOfficialInvoiceNumber,
  getNextInvoiceSequence,
  OFFICIAL_BANK_INFO,
} from '../lib/invoiceUtils';
import { googleSignIn, getAccessToken, saveAdminToken, auth } from '../lib/googleAuth';
import {
  saveBookingToGoogleSheets,
  saveBookingViaNetlify,
  SaveBookingResult,
  BookingSubmissionData,
  CoTenant,
} from '../lib/googleSheets';
import {
  saveInvoiceToDriveFolder,
  ADMIN_EMAIL,
  DriveInvoiceResult,
  INVOICE_FOLDER_NAME,
  generateInvoiceHtml,
} from '../lib/googleDriveInvoice';
import { User, onAuthStateChanged } from 'firebase/auth';

interface ViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnit?: Unit | null;
  attachedQuote?: QuoteData | null;
  onOpenCalculator?: (unit?: Unit) => void;
}

export const ViewingModal: React.FC<ViewingModalProps> = ({
  isOpen,
  onClose,
  preselectedUnit,
  attachedQuote,
  onOpenCalculator,
}) => {
  // 1. Nama lengkap*
  const [fullName, setFullName] = useState('');
  
  // 2. username* (wajib menggunakan format x.com/username)
  const [usernameInput, setUsernameInput] = useState('');
  
  // 3. face claim*
  const [faceClaim, setFaceClaim] = useState('');
  
  // 4. tempat, tanggal lahir
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // 5. pekerjaan
  const [occupation, setOccupation] = useState('');
  
  // 6. pets: y/n (jika yes, jelaskan jenis dan ras)
  const [hasPets, setHasPets] = useState<'yes' | 'no'>('no');
  const [petsDescription, setPetsDescription] = useState('');
  
  // 7. pilihan unit
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    attachedQuote?.unit?.id || preselectedUnit?.id || UNITS_DATA[0].id
  );
  
  // 8. tinggal sendiri/tidak
  const [isLivingAlone, setIsLivingAlone] = useState<boolean>(true);
  const [coTenants, setCoTenants] = useState<CoTenant[]>([]);
  
  // 9. story line & link utas/thread
  const [storyLine, setStoryLine] = useState('');
  const [characterThreadLink, setCharacterThreadLink] = useState('');
  
  // 10. persetujuan rules & tanda tangan
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesSpreadsheetUrl] = useState<string>(
    'https://bit.ly/thebaswara'
  );

  // Generated Official Invoice state (diterbitkan khusus oleh pemilik)
  const [generatedInvoice, setGeneratedInvoice] = useState<QuoteData | null>(null);
  const [invoiceCopied, setInvoiceCopied] = useState(false);

  // Form states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Google Workspace state
  const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isSavingToSheets, setIsSavingToSheets] = useState(false);
  const [sheetsResult, setSheetsResult] = useState<SaveBookingResult | null>(null);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveResult, setDriveResult] = useState<DriveInvoiceResult | null>(null);
  const [syncToDrive, setSyncToDrive] = useState(true);

  // Invoice issuance state (tanpa ketergantungan Google Cloud)
  const [isOwnerAuthorized] = useState<boolean>(true);
  const isOwner = true;
  const [isInvoiceIssued, setIsInvoiceIssued] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGoogleUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (attachedQuote?.unit) {
      setSelectedUnitId(attachedQuote.unit.id);
    } else if (preselectedUnit) {
      setSelectedUnitId(preselectedUnit.id);
    }
  }, [attachedQuote, preselectedUnit]);

  // Find currently selected unit and maximum occupants
  const currentUnit = UNITS_DATA.find((u) => u.id === selectedUnitId) || UNITS_DATA[0];
  const maxCapacity = getUnitMaxCapacity(currentUnit);
  // Main tenant takes 1 spot, so max additional co-tenants is maxCapacity - 1
  const maxCoTenants = Math.max(1, maxCapacity - 1);

  // If unit changed and coTenants exceed max allowed, truncate gracefully
  useEffect(() => {
    if (coTenants.length > maxCoTenants) {
      setCoTenants((prev) => prev.slice(0, maxCoTenants));
    }
  }, [maxCoTenants, coTenants.length]);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper to normalize and ensure x.com/ format
  const formatUsername = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    // Strip http://, https://, www., and x.com/ or twitter.com/
    let handle = trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/^(x\.com|twitter\.com)\//i, '')
      .replace(/^@/, '');
    return `x.com/${handle}`;
  };

  const handleAddCoTenant = () => {
    if (coTenants.length >= maxCoTenants) return;
    setCoTenants([
      ...coTenants,
      {
        name: '',
        xHandle: 'x.com/',
        faceClaim: '',
        birthPlaceDate: '',
      },
    ]);
  };

  const handleUpdateCoTenant = (index: number, field: keyof CoTenant, value: string) => {
    const updated = [...coTenants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setCoTenants(updated);
  };

  const handleRemoveCoTenant = (index: number) => {
    setCoTenants(coTenants.filter((_, i) => i !== index));
  };

  const normalizedUsername = formatUsername(usernameInput);

  const buildBookingData = (
    overrideInv?: string,
    overrideTenure?: number,
    overrideUpfront?: number
  ): BookingSubmissionData => {
    const birthInfo = [birthPlace.trim(), birthDate.trim()].filter(Boolean).join(', ');
    const signatureDateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      fullName: fullName.trim(),
      xHandle: normalizedUsername,
      faceClaim: faceClaim.trim(),
      birthPlaceDate: birthInfo || '-',
      occupation: occupation.trim() || '-',
      hasPets: hasPets === 'yes',
      petsDescription: hasPets === 'yes' ? petsDescription.trim() : undefined,
      unitName: currentUnit.name,
      tower: currentUnit.tower,
      sizeM2: currentUnit.sizeM2,
      capacityText: currentUnit.capacity,
      isLivingAlone,
      coTenants: isLivingAlone ? [] : coTenants,
      storyLine: storyLine.trim(),
      characterThreadLink: characterThreadLink.trim(),
      rulesAgreed,
      signatureName: signatureName.trim() || fullName.trim(),
      signatureDate: signatureDateStr,
      invoiceNumber: overrideInv || generatedInvoice?.invoiceNumber || attachedQuote?.invoiceNumber,
      tenureMonths: overrideTenure || generatedInvoice?.tenureMonths || attachedQuote?.tenureMonths || 3,
      initialTotalUpfront: overrideUpfront || generatedInvoice?.initialTotalUpfront || attachedQuote?.initialTotalUpfront,
    };
  };

  const captureInvoiceJpegBlob = async (): Promise<Blob | null> => {
    try {
      const invoiceElement = document.getElementById('official-invoice-card');
      if (!invoiceElement) return null;
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B0F19',
        logging: false,
      });
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
      });
    } catch (err) {
      console.warn('html2canvas capture error:', err);
      return null;
    }
  };

  const syncSubmissionToAdminDriveAndSheets = async (
    targetInvoice: QuoteData,
    bookingData: BookingSubmissionData,
    overrideToken?: string
  ) => {
    const token = overrideToken || (await getAccessToken());

    // 1. Simpan Data Booking & Invoice ke Google Sheets via Netlify Function (Service Account)
    setIsSavingToSheets(true);
    try {
      const netlifyRes = await saveBookingViaNetlify(bookingData);
      if (netlifyRes.success) {
        setSheetsResult(netlifyRes);
      } else if (token) {
        // Fallback ke OAuth jika Netlify Service Account belum aktif
        const directRes = await saveBookingToGoogleSheets(bookingData, token);
        setSheetsResult(directRes);
      } else {
        setSheetsResult(netlifyRes);
      }
    } catch (err: any) {
      setSheetsResult({
        success: false,
        error: err?.message || 'Gagal menyimpan ke Google Sheets.',
      });
    } finally {
      setIsSavingToSheets(false);
    }

    // 2. Simpan Invoice ke Google Drive Administrator dalam format JPG (jika admin OAuth token tersedia)
    if (token) {
      setIsSavingToDrive(true);
      try {
        await new Promise((r) => setTimeout(r, 250));
        const jpegBlob = await captureInvoiceJpegBlob();

        const driveRes = await saveInvoiceToDriveFolder({
          accessToken: token,
          invoice: targetInvoice,
          tenantName: fullName.trim(),
          tenantXHandle: normalizedUsername,
          isLivingAlone,
          coTenantsCount: coTenants.length,
          jpegBlob,
        });
        setDriveResult(driveRes);
      } catch (err: any) {
        setDriveResult({
          success: false,
          error: err?.message || 'Gagal menyimpan invoice JPG ke Google Drive Administrator.',
        });
      } finally {
        setIsSavingToDrive(false);
      }
    }
  };

  const handleGoogleConnect = async () => {
    setIsSigningInGoogle(true);
    setAuthNotice(null);
    try {
      const res = await googleSignIn();
      if (res.cancelled) {
        return;
      }
      if (res.error) {
        setAuthNotice(res.error);
        return;
      }
      if (res.user && res.accessToken) {
        setGoogleUser(res.user);
        await saveAdminToken(res.accessToken, res.user.email || ADMIN_EMAIL);
        if (isSubmitted) {
          const currentInv = generatedInvoice || attachedQuote;
          if (currentInv) {
            await syncSubmissionToAdminDriveAndSheets(currentInv, buildBookingData(), res.accessToken);
          }
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Strict validation
    if (!fullName.trim()) {
      setValidationError('Nama lengkap wajib diisi.');
      return;
    }
    if (!normalizedUsername || normalizedUsername === 'x.com/') {
      setValidationError('Username wajib diisi.');
      return;
    }
    if (!faceClaim.trim()) {
      setValidationError('Face claim wajib diisi.');
      return;
    }
    if (hasPets === 'yes' && !petsDescription.trim()) {
      setValidationError('Silakan jelaskan jenis dan ras hewan peliharaan Anda.');
      return;
    }
    if (!isLivingAlone && coTenants.length === 0) {
      setValidationError('Anda memilih tinggal tidak sendiri. Silakan tambahkan minimal 1 identitas penyewa tambahan.');
      return;
    }
    if (!isLivingAlone) {
      for (let i = 0; i < coTenants.length; i++) {
        if (!coTenants[i].name.trim()) {
          setValidationError(`Nama penyewa tambahan #${i + 1} wajib diisi.`);
          return;
        }
        if (!coTenants[i].xHandle.trim() || coTenants[i].xHandle.trim() === 'x.com/') {
          setValidationError(`Username penyewa tambahan #${i + 1} wajib diisi.`);
          return;
        }
      }
    }
    if (!storyLine.trim()) {
      setValidationError('Storyline karakter wajib diisi.');
      return;
    }
    if (!characterThreadLink.trim()) {
      setValidationError('Link utas / thread karakter wajib diisi.');
      return;
    }
    if (!rulesAgreed) {
      setValidationError('Anda wajib membaca dan mencentang persetujuan House Rules The Baswara Sky Suites.');
      return;
    }
    if (!signatureName.trim()) {
      setValidationError('Silakan ketikkan nama Anda pada kolom tanda tangan digital sebagai persetujuan hukum.');
      return;
    }

    // Terbitkan nomor invoice resmi:
    // Format: Bulan, Tahun, Nomor Urut, Kode A (Arunika) / B (Baskara), tanpa jenis unit & tanpa lama sewa
    const seq = getNextInvoiceSequence();
    const invNumber = attachedQuote?.invoiceNumber || formatOfficialInvoiceNumber(currentUnit.tower, seq);
    const tenure = (attachedQuote?.tenureMonths || 3) as 3 | 6 | 12;
    const baseMonthly = currentUnit.pricePerMonth;
    const discountRate = tenure === 12 ? 0.10 : tenure === 6 ? 0.05 : 0;
    const discountedMonthly = Math.round(baseMonthly * (1 - discountRate));
    const isBaskara = currentUnit.tower === 'Baskara';
    const totalRentForTenure = discountedMonthly * tenure;

    // Pajak Pertambahan Nilai (PPN 11%)
    const ppnRate = 0.11;
    const ppnAmount = Math.round(totalRentForTenure * ppnRate);

    // Bea Materai & Administrasi Legalisasi Dokumen
    const materaiFee = 10000;

    const securityDeposit = discountedMonthly * 2;
    const serviceChargePerM2 = 0;
    const monthlyServiceCharge = 0;
    const vaultFee = 0;
    const butlerFee = 0;
    const wineLockerFee = 0;
    const totalAddons = 0;
    const selectedAddonsList = isBaskara ? [
      'Dedicated Supercar Vault & Valet (Termasuk di Harga Sewa · Rp 0)',
      '24/7 Dedicated Butler Attaché (Termasuk di Harga Sewa · Rp 0)',
      'Private Wine Cellar & Sommelier Locker (Termasuk di Harga Sewa · Rp 0)',
      'Service Charge (IPL) & Dedicated VIP Parking (Termasuk di Harga Sewa · Rp 0)',
    ] : [
      'Dedicated VIP Parking (Termasuk di Harga Sewa · Rp 0)',
      'Service Charge (IPL) Gedung (Termasuk di Harga Sewa · Rp 0)',
    ];
    const totalMonthlyOngoing = discountedMonthly;
    const initialTotalUpfront = totalRentForTenure + ppnAmount + materaiFee + securityDeposit;
    const totalContractValue = initialTotalUpfront;

    const today = new Date();
    const issueDateFormatted = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const dueDateFormatted = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newInvoice: QuoteData = {
      invoiceNumber: invNumber,
      issueDate: issueDateFormatted,
      dueDate: dueDateFormatted,
      unit: currentUnit,
      tenureMonths: tenure,
      baseMonthly,
      discountRate,
      discountedMonthly,
      serviceChargePerM2,
      monthlyServiceCharge,
      vaultFee,
      butlerFee,
      wineLockerFee,
      totalAddons,
      totalRentForTenure,
      ppnRate,
      ppnAmount,
      materaiFee,
      totalMonthlyOngoing,
      securityDeposit,
      initialTotalUpfront,
      totalContractValue,
      selectedAddonsList,
    };

    setGeneratedInvoice(newInvoice);
    setIsSubmitted(true);

    const bookingData = buildBookingData(invNumber, tenure, totalContractValue);
    // Auto-sync to administrator's Google Drive (JPG) and Google Sheets
    syncSubmissionToAdminDriveAndSheets(newInvoice, bookingData);
  };

  const handleManualSaveToSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      await handleGoogleConnect();
      return;
    }

    const currentInv = generatedInvoice || attachedQuote;
    if (currentInv) {
      await syncSubmissionToAdminDriveAndSheets(currentInv, buildBookingData(), token);
    }
  };

  const getDMSummary = () => {
    const birthInfo = [birthPlace.trim(), birthDate.trim()].filter(Boolean).join(', ');
    const coTenantsBlock = !isLivingAlone && coTenants.length > 0
      ? coTenants
          .map(
            (ct, idx) =>
              `  [Penyewa #${idx + 1}]
  - Nama: ${ct.name}
  - Username: ${formatUsername(ct.xHandle)}
  - Face Claim: ${ct.faceClaim || '-'}
  - TTL: ${ct.birthPlaceDate || '-'}`
          )
          .join('\n\n')
      : 'Tinggal Sendiri (Tanpa Penyewa Tambahan)';

    const inv = generatedInvoice || (attachedQuote ? {
      invoiceNumber: attachedQuote.invoiceNumber,
      tenureMonths: attachedQuote.tenureMonths,
      initialTotalUpfront: attachedQuote.initialTotalUpfront,
    } : null);

    return `FORMULIR PENYEWAAN UNIT
The Baswara Sky Suites · Menteng, Jakarta Pusat
========================================
1. Nama Lengkap: ${fullName}
2. Username X: ${normalizedUsername}
3. Face Claim: ${faceClaim}
4. Tempat, Tanggal Lahir: ${birthInfo || '-'}
5. Pekerjaan: ${occupation || '-'}
6. Pets: ${hasPets === 'yes' ? `Ya (${petsDescription})` : 'Tidak'}
7. Pilihan Unit: ${currentUnit.name} (Tower ${currentUnit.tower}, ${currentUnit.sizeM2} m² - Kapasitas: ${currentUnit.capacity})
8. Status Hunian: ${isLivingAlone ? 'Tinggal Sendiri' : 'Tinggal Bersama Penyewa Tambahan'}
${!isLivingAlone ? `Identitas Penyewa Tambahan (${coTenants.length} orang):\n${coTenantsBlock}\n` : ''}
9. Storyline Karakter:
${storyLine}

Link Utas / Thread Karakter:
${characterThreadLink}
========================================
10. Persetujuan Rules: Disetujui (Telah membaca & mematuhi House Rules)
Tanda Tangan Digital: ${signatureName || fullName} [Verified]
${inv ? `========================================
INVOICE RESMI SEWA TERBIT:
Nomor Invoice: #${inv.invoiceNumber}
Masa Sewa: ${inv.tenureMonths} Bulan
Total Pembayaran Awal: ${formatRupiah(inv.initialTotalUpfront)}
Instruksi Transfer Resmi:
Bank: ${OFFICIAL_BANK_INFO.bankName}
No. Rekening: ${OFFICIAL_BANK_INFO.accountNumber}
Atas Nama: ${OFFICIAL_BANK_INFO.accountHolder}
` : ''}========================================
Konfirmasi ditujukan ke Manajemen: @the_BASWARA / @fourgotmenot`;
  };

  const handleCopyDM = () => {
    navigator.clipboard.writeText(getDMSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyInvoiceText = () => {
    if (!generatedInvoice) return;
    const inv = generatedInvoice;
    const text = `INVOICE RESMI SEWA - THE BASWARA SKY SUITES
PT BASWARA MANGKUBUMI RESIDENCE · PRABASWARA GROUP
Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310
------------------------------------------------------------
No. Invoice   : ${inv.invoiceNumber}
Tanggal Terbit: ${inv.issueDate}
Jatuh Tempo   : ${inv.dueDate} (7 Hari)
Status        : MENUNGGU PEMBAYARAN SEWA

DITAGIHKAN KEPADA:
Nama          : ${fullName}
Username X    : ${normalizedUsername}
Unit          : ${inv.unit.name} (Tower ${inv.unit.tower})
Durasi Sewa   : ${inv.tenureMonths} Bulan

RINCIAN PENAGIHAN PEMBAYARAN:
1. Biaya Sewa Pokok Unit (${inv.tenureMonths} Bulan)
   = ${formatRupiah(inv.totalRentForTenure || (inv.discountedMonthly * inv.tenureMonths))} (${inv.tenureMonths} Bulan × ${formatRupiah(inv.discountedMonthly)}/bln)${inv.discountRate > 0 ? ` [Diskon Tenor: ${inv.discountRate * 100}%]` : ''}
2. Pajak Pertambahan Nilai (PPN 11%)
   = ${formatRupiah(inv.ppnAmount || Math.round((inv.totalRentForTenure || (inv.discountedMonthly * inv.tenureMonths)) * 0.11))} (11% dari Total Nilai Sewa)
3. Bea Materai & Biaya Administrasi Dokumen Perjanjian
   = ${formatRupiah(inv.materaiFee || 10000)} (Legalisasi Bermaterai Lunas)
4. Service Charge Gedung (IPL) & Dedicated VIP Parking
   = Rp 0 (Sudah Termasuk dalam Biaya Sewa)
5. Fasilitas Tambahan VVIP (Butler 24/7, Supercar Vault, Wine Cellar)
   = Rp 0 (Sudah Termasuk dalam Biaya Sewa)
6. Security Deposit Jaminan Unit (2 Bulan Sewa Pokok, 100% Refundable)
   = ${formatRupiah(inv.securityDeposit)}
------------------------------------------------------------
TOTAL PEMBAYARAN: ${formatRupiah(inv.initialTotalUpfront)}
(Mencakup: Biaya Sewa Penuh ${inv.tenureMonths} Bulan + PPN 11% + Materai + Security Deposit Refundable)

INSTRUKSI PEMBAYARAN RESMI:
Bank          : ${OFFICIAL_BANK_INFO.bankName}
Nomor Rekening: ${OFFICIAL_BANK_INFO.accountNumber}
Atas Nama     : ${OFFICIAL_BANK_INFO.accountHolder}
*Harap mencantumkan nomor invoice ${inv.invoiceNumber} pada berita transfer.
------------------------------------------------------------
Mengetahui & Menyetujui:
Marcelinus Chitraditya Lokananta Prabaswara (CEO PT Baswara Mangkubumi Residence)
Natasha Wijaya (Head of Leasing)`;

    navigator.clipboard.writeText(text);
    setInvoiceCopied(true);
    setTimeout(() => setInvoiceCopied(false), 3000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex justify-center items-start">
        <div className={`bg-[#0D111A] border border-[#D4AF37]/35 w-full p-6 sm:p-8 relative my-6 sm:my-10 shadow-2xl max-h-[90vh] overflow-y-auto transition-all ${
          isSubmitted ? 'max-w-4xl' : 'max-w-2xl'
        }`}>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {!isSubmitted ? (
            <div>
              <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono mb-2 flex items-center gap-2">
                <ScrollText size={14} />
                <span>The Baswara Sky Suites · Pengisian Formulir</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-[#F3E5AB] mb-1">
                Formulir Penyewaan Unit
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                The Baswara Sky Suites · Menteng, Jakarta Pusat
              </p>

              {attachedQuote && (
                <div className="mb-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-start gap-3">
                  <FileText className="text-[#D4AF37] shrink-0 mt-0.5" size={18} />
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-[#F3E5AB]">
                      Terkoneksi dengan Invoice Resmi #{attachedQuote.invoiceNumber}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Unit: {attachedQuote.unit.name} ({attachedQuote.tenureMonths} Bulan) · Total Nilai Sewa: {formatRupiah(attachedQuote.totalContractValue || attachedQuote.initialTotalUpfront)}
                    </p>
                  </div>
                </div>
              )}


              {validationError && (
                <div className="mb-4 p-3 bg-rose-950/40 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {authNotice && (
                <div className="mb-4 p-2.5 bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-amber-400" />
                  <span>{authNotice}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Nama Lengkap & 2. Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Username *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 bg-slate-900 border border-r-0 border-slate-800 text-slate-500 text-xs font-mono">
                        x.com/
                      </span>
                      <input
                        type="text"
                        required
                        value={usernameInput.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/^(x\.com|twitter\.com)\//i, '').replace(/^@/, '')}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="username"
                        className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Face Claim & 5. Pekerjaan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Face Claim *
                    </label>
                    <input
                      type="text"
                      required
                      value={faceClaim}
                      onChange={(e) => setFaceClaim(e.target.value)}
                      placeholder="Nama Face Claim..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Profesi / Pekerjaan..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Tempat, Tanggal Lahir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Kota kelahiran..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 6. Pets: y/n */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1.5">
                    Membawa Hewan Peliharaan? *
                  </label>
                  <div className="flex items-center gap-6 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="pets"
                        value="no"
                        checked={hasPets === 'no'}
                        onChange={() => setHasPets('no')}
                        className="accent-[#D4AF37]"
                      />
                      <span>Tidak</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="pets"
                        value="yes"
                        checked={hasPets === 'yes'}
                        onChange={() => setHasPets('yes')}
                        className="accent-[#D4AF37]"
                      />
                      <span>Ya</span>
                    </label>
                  </div>

                  {hasPets === 'yes' && (
                    <input
                      type="text"
                      required={hasPets === 'yes'}
                      value={petsDescription}
                      onChange={(e) => setPetsDescription(e.target.value)}
                      placeholder="Jelaskan jenis dan ras peliharaan..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  )}
                </div>

                {/* 7. Pilihan Unit */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs uppercase tracking-wider text-slate-300">
                      Pilihan Unit Apartemen *
                    </label>
                    {attachedQuote && (
                      <span className="text-[10px] text-[#D4AF37] font-mono">
                        Invoice #{attachedQuote.invoiceNumber}
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <optgroup label="Tower Arunika">
                      {UNITS_DATA.filter((u) => u.tower === 'Arunika').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (Tower Arunika)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tower Baskara">
                      {UNITS_DATA.filter((u) => u.tower === 'Baskara').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (Tower Baskara)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 8. Status Hunian */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs uppercase tracking-wider text-slate-300">
                      Status Hunian *
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Maks. {maxCoTenants} penyewa tambahan
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="isLivingAlone"
                        checked={isLivingAlone}
                        onChange={() => {
                          setIsLivingAlone(true);
                          setCoTenants([]);
                        }}
                        className="accent-[#D4AF37]"
                      />
                      <span>Tinggal Sendiri</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="isLivingAlone"
                        checked={!isLivingAlone}
                        onChange={() => {
                          setIsLivingAlone(false);
                          if (coTenants.length === 0) {
                            handleAddCoTenant();
                          }
                        }}
                        className="accent-[#D4AF37]"
                      />
                      <span>Tinggal Bersama</span>
                    </label>
                  </div>

                  {/* Co-tenants form */}
                  {!isLivingAlone && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Penyewa Tambahan ({coTenants.length}/{maxCoTenants}):</span>
                        {coTenants.length < maxCoTenants && (
                          <button
                            type="button"
                            onClick={handleAddCoTenant}
                            className="text-[11px] text-[#D4AF37] hover:underline font-mono cursor-pointer"
                          >
                            + Tambah Penyewa
                          </button>
                        )}
                      </div>

                      {coTenants.map((tenant, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#080C14] border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-[#D4AF37]">
                              Penyewa #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoTenant(idx)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <input
                              type="text"
                              required
                              value={tenant.name}
                              onChange={(e) => handleUpdateCoTenant(idx, 'name', e.target.value)}
                              placeholder="Nama Lengkap *"
                              className="w-full bg-[#0D111A] border border-slate-800 text-slate-100 p-2 text-xs focus:border-[#D4AF37] focus:outline-none"
                            />
                            <input
                              type="text"
                              required
                              value={tenant.xHandle}
                              onChange={(e) => handleUpdateCoTenant(idx, 'xHandle', e.target.value)}
                              placeholder="Username (x.com/...) *"
                              className="w-full bg-[#0D111A] border border-slate-800 text-slate-100 p-2 text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={tenant.faceClaim}
                              onChange={(e) => handleUpdateCoTenant(idx, 'faceClaim', e.target.value)}
                              placeholder="Face Claim"
                              className="w-full bg-[#0D111A] border border-slate-800 text-slate-100 p-2 text-xs focus:border-[#D4AF37] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={tenant.birthPlaceDate}
                              onChange={(e) => handleUpdateCoTenant(idx, 'birthPlaceDate', e.target.value)}
                              placeholder="Tempat, Tanggal Lahir"
                              className="w-full bg-[#0D111A] border border-slate-800 text-slate-100 p-2 text-xs focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 9. Storyline Karakter */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Storyline Karakter *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={storyLine}
                      onChange={(e) => setStoryLine(e.target.value)}
                      placeholder="Ringkasan storyline pribadi karakter..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Link Utas / Thread Karakter *
                    </label>
                    <input
                      type="url"
                      required
                      value={characterThreadLink}
                      onChange={(e) => setCharacterThreadLink(e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full bg-[#080C14] border border-slate-800 text-slate-100 p-2.5 text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 10. Persetujuan Rules & Tanda Tangan */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={rulesAgreed}
                      onChange={(e) => setRulesAgreed(e.target.checked)}
                      className="accent-[#D4AF37] mt-0.5 shrink-0"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      Saya telah membaca dan menyetujui seluruh tata tertib The Baswara Sky Suites (
                      <a
                        href="https://bit.ly/thebaswara"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D4AF37] hover:underline inline-flex items-center gap-0.5 font-medium"
                      >
                        See rules <ExternalLink size={10} />
                      </a>
                      ). *
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Tanda Tangan Digital Calon Penyewa *
                    </label>
                    <input
                      type="text"
                      required
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Ketik nama lengkap Anda sebagai tanda tangan..."
                      className="w-full bg-[#080C14] border border-slate-800 text-[#F3E5AB] font-serif p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                  >
                    Kirim Formulir
                  </button>
                </div>

              </form>
            </div>
          ) : (
            <div className="space-y-8 py-2">
              {/* Header Status */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37]">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-[#D4AF37] tracking-widest mb-1">
                    Invoice Resmi Telah Diterbitkan
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB]">
                    Invoice Berhasil Diterbitkan
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mt-1">
                    Formulir penyewaan unit <strong className="text-white">{currentUnit.name} (Tower {currentUnit.tower})</strong> telah dicatat dalam sistem. Invoice resmi pembayaran sewa telah diterbitkan di bawah ini.
                  </p>
                </div>
              </div>

              {/* OFFICIAL INVOICE */}
              {generatedInvoice && (
                <div className="space-y-4">
                  {/* Top Action Bar for Invoice */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F19] p-3 border border-[#D4AF37]/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-slate-200 font-mono">
                        Invoice Resmi: #{generatedInvoice.invoiceNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyInvoiceText}
                        className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                        <span>{invoiceCopied ? 'Tersalin!' : 'Salin Teks Invoice'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Google Sheets Sync Status Bar */}
                  {isSavingToSheets && (
                    <div className="bg-[#111827] border border-amber-500/30 p-2.5 flex items-center justify-between text-xs text-amber-200">
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-amber-400" />
                        <span>Menyimpan reservasi & invoice ke Google Sheets...</span>
                      </div>
                    </div>
                  )}

                  {sheetsResult?.success && (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        <span>Data reservasi tersimpan otomatis ke Google Sheets</span>
                      </div>
                      {sheetsResult.spreadsheetUrl && (
                        <a
                          href={sheetsResult.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-300 hover:text-white underline font-mono text-[11px]"
                        >
                          <span>Buka Spreadsheet</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {sheetsResult && !sheetsResult.success && (
                    <div className="bg-rose-950/30 border border-rose-500/30 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-rose-400 shrink-0" />
                        <span className="text-[11px] max-w-sm sm:max-w-md">{sheetsResult.error}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleManualSaveToSheets}
                        className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-600/40 text-[11px] font-mono cursor-pointer"
                      >
                        Coba Simpan Ulang
                      </button>
                    </div>
                  )}

                  {/* Printable Luxury Invoice Card (Rendered to JPG for Google Drive) */}
                  <div id="official-invoice-card" className="bg-[#0B0F19] border-2 border-[#D4AF37]/50 p-6 sm:p-8 relative text-slate-200 shadow-2xl">
                    {/* Watermark / Digital Seal */}
                    <div className="absolute right-8 top-12 opacity-10 pointer-events-none select-none hidden sm:block">
                      <div className="w-48 h-48 border-4 border-[#D4AF37] rounded-full flex flex-col items-center justify-center text-[#D4AF37] font-serif text-center p-4 rotate-[-12deg]">
                        <span className="text-xs font-mono uppercase tracking-widest">OFFICIAL SEAL</span>
                        <span className="font-bold text-sm">PT BASWARA</span>
                        <span className="text-[10px]">MANGKUBUMI RESIDENCE</span>
                        <span className="text-[9px] font-mono mt-1">VERIFIED 2026</span>
                      </div>
                    </div>

                    {/* Invoice Header */}
                    <div className="border-b border-slate-800 pb-6 mb-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB] tracking-wide">
                            BASWARA SKY SUITES
                          </h2>
                          <p className="text-xs text-slate-400 mt-1">
                            Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-xs font-mono text-slate-400">
                            No. Invoice: <span className="text-white font-bold text-sm">{generatedInvoice.invoiceNumber}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Tanggal Terbit: {generatedInvoice.issueDate}
                          </div>
                          <div className="text-xs text-amber-300 font-mono mt-0.5">
                            Tenggat Pembayaran: {generatedInvoice.dueDate} (7 Hari)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tenant & Lease Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] mb-1">
                          Ditagihkan Kepada (Calon Penyewa):
                        </div>
                        <div className="font-semibold text-white text-base font-serif">
                          {fullName}
                        </div>
                        <div className="text-[#D4AF37] font-mono mt-0.5">
                          {normalizedUsername}
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] mb-1">
                          Spesifikasi Kontrak & Unit:
                        </div>
                        <div className="font-semibold text-[#F3E5AB] text-sm">
                          {generatedInvoice.unit.name} · Tower {generatedInvoice.unit.tower}
                        </div>
                      </div>
                    </div>

                    {/* Simplified Luxury Billing Statement */}
                    <div className="py-6 border-b border-slate-800">
                      <div className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] mb-4">
                        Rincian Penagihan Sewa
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Item 1: Sewa Pokok */}
                        <div className="flex items-start justify-between py-2 border-b border-slate-800/60">
                          <div>
                            <div className="text-slate-100 font-medium text-sm">
                              Sewa Pokok Unit Apartemen ({generatedInvoice.unit.name}) · {generatedInvoice.tenureMonths} Bulan
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Tower {generatedInvoice.unit.tower} · {formatRupiah(generatedInvoice.baseMonthly)}/bln × {generatedInvoice.tenureMonths} Bulan
                              {generatedInvoice.discountRate > 0 && (
                                <span className="ml-2 text-emerald-400 font-mono">
                                  (Diskon Tenor {generatedInvoice.discountRate * 100}%: -{formatRupiah((generatedInvoice.baseMonthly - generatedInvoice.discountedMonthly) * generatedInvoice.tenureMonths)})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right font-mono text-white font-medium text-sm whitespace-nowrap pl-4">
                            {formatRupiah(generatedInvoice.totalRentForTenure || (generatedInvoice.discountedMonthly * generatedInvoice.tenureMonths))}
                          </div>
                        </div>

                        {/* Item 2: PPN 11% */}
                        <div className="flex items-start justify-between py-2 border-b border-slate-800/60">
                          <div>
                            <div className="text-slate-200 font-medium">
                              Pajak Pertambahan Nilai (PPN 11%)
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Pajak sewa resmi 11% dari total nilai kontrak sewa
                            </div>
                          </div>
                          <div className="text-right font-mono text-white font-medium whitespace-nowrap pl-4">
                            {formatRupiah(generatedInvoice.ppnAmount || Math.round((generatedInvoice.totalRentForTenure || (generatedInvoice.discountedMonthly * generatedInvoice.tenureMonths)) * 0.11))}
                          </div>
                        </div>

                        {/* Item 3: Bea Materai */}
                        <div className="flex items-start justify-between py-2 border-b border-slate-800/60">
                          <div>
                            <div className="text-slate-200 font-medium">
                              Bea Materai & Administrasi Dokumen
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Legalisasi berkas perjanjian sewa resmi bermaterai lunas
                            </div>
                          </div>
                          <div className="text-right font-mono text-white font-medium whitespace-nowrap pl-4">
                            {formatRupiah(generatedInvoice.materaiFee || 10000)}
                          </div>
                        </div>

                        {/* Item 4: Security Deposit */}
                        <div className="flex items-start justify-between p-3 border border-[#D4AF37]/30 bg-[#D4AF37]/5">
                          <div>
                            <div className="text-[#D4AF37] font-medium flex items-center gap-1.5">
                              <ShieldCheck size={14} />
                              <span>Security Deposit Jaminan Unit (100% Refundable)</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              2 bulan sewa pokok, jaminan pemeliharaan (dikembalikan penuh di akhir sewa)
                            </div>
                          </div>
                          <div className="text-right font-mono text-[#D4AF37] font-semibold text-sm whitespace-nowrap pl-4">
                            {formatRupiah(generatedInvoice.securityDeposit)}
                          </div>
                        </div>

                        {/* Grand Total Bar */}
                        <div className="flex items-center justify-between bg-[#D4AF37]/15 p-3.5 border border-[#D4AF37]/40 mt-3">
                          <div>
                            <div className="text-xs font-mono uppercase tracking-wider text-[#F3E5AB] font-semibold">
                              Total Tagihan Pembayaran
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Total sewa {generatedInvoice.tenureMonths} bulan + PPN 11% + materai + security deposit 2 bulan
                            </div>
                          </div>
                          <div className="text-right font-mono text-xl sm:text-2xl text-[#D4AF37] font-bold">
                            {formatRupiah(generatedInvoice.initialTotalUpfront)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Summary & Official Bank Instructions */}
                    <div className="py-6 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start text-left">
                      <div>
                        <div className="text-xs uppercase font-mono tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                          <Building2 size={14} />
                          <span>Instruksi Pembayaran Resmi:</span>
                        </div>
                        <div className="bg-[#111827] p-3.5 border border-[#D4AF37]/40 text-xs space-y-1.5 shadow">
                          <div className="text-slate-300 flex justify-between">
                            <span className="text-slate-400">Bank:</span>
                            <span className="font-semibold text-white">{OFFICIAL_BANK_INFO.bankName}</span>
                          </div>
                          <div className="text-slate-300 flex justify-between">
                            <span className="text-slate-400">Atas Nama:</span>
                            <span className="font-semibold text-white">{OFFICIAL_BANK_INFO.accountHolder}</span>
                          </div>
                          <div className="text-slate-300 flex justify-between items-center pt-1 border-t border-slate-800">
                            <span className="text-slate-400">Nomor Rekening:</span>
                            <span className="font-mono text-[#F3E5AB] font-bold text-sm tracking-wider select-all">
                              {OFFICIAL_BANK_INFO.accountNumber}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                          *Harap mencantumkan nomor invoice <strong className="text-[#F3E5AB]">{generatedInvoice.invoiceNumber}</strong> pada berita transfer untuk verifikasi otomatis Finance Division.
                        </p>
                      </div>

                      <div className="flex justify-between text-xs pt-2 sm:pt-0">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-slate-400 mb-6">
                            Menyetujui,
                          </div>
                          <div className="font-serif text-white font-medium text-sm">
                            Marcelinus Chitraditya Lokananta Prabaswara
                          </div>
                          <div className="text-[11px] text-[#D4AF37] font-mono">
                            CEO
                          </div>
                          <div className="text-[10px] text-slate-400">
                            PT Baswara Mangkubumi
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-mono uppercase text-slate-400 mb-6">
                            Otorisasi Leasing,
                          </div>
                          <div className="font-serif text-white font-medium text-sm">
                            Natasha Wijaya
                          </div>
                          <div className="text-[11px] text-[#D4AF37] font-mono">
                            Head of Leasing
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Leasing Division
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Details */}
              <div className="p-4 bg-[#0B0F19] border border-slate-800 text-left text-xs space-y-2.5 max-w-2xl mx-auto shadow">
                <div className="text-xs uppercase font-mono tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <ScrollText size={14} />
                  <span>Ringkasan Formulir Penyewaan Unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pemohon:</span>
                  <span className="text-white font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Username X:</span>
                  <span className="text-[#D4AF37] font-mono">{normalizedUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Face Claim:</span>
                  <span className="text-slate-200">{faceClaim}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Terpilih:</span>
                  <span className="text-white font-medium">{currentUnit.name} (Tower {currentUnit.tower})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Hunian:</span>
                  <span className="text-slate-200">
                    {isLivingAlone ? 'Tinggal Sendiri' : `Bersama ${coTenants.length} Penyewa Tambahan`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peliharaan (Pets):</span>
                  <span className="text-slate-200">{hasPets === 'yes' ? petsDescription : 'Tidak ada'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanda Tangan Digital:</span>
                  <span className="text-[#F3E5AB] font-serif">{signatureName || fullName} (Disetujui)</span>
                </div>
              </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <button
                  onClick={handleCopyDM}
                  className="py-3 px-4 border border-[#D4AF37] text-xs uppercase tracking-wider text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-2"
                >
                  <Copy size={14} />
                  <span>{copied ? 'Tersalin!' : 'Salin Format Formulir'}</span>
                </button>

                <a
                  href="https://x.com/the_BASWARA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-[#D4AF37] text-xs uppercase tracking-wider font-semibold text-[#0B0F19] hover:bg-[#F3E5AB] flex items-center justify-center gap-2"
                >
                  <span>Kirim via DM X @the_BASWARA</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSheetsResult(null);
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-white underline pt-2 block mx-auto cursor-pointer"
              >
                Selesai & Tutup Jendela
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Official Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-[#D4AF37] max-w-xl w-full p-6 sm:p-8 relative my-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X size={20} />
            </button>

            <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono mb-2">
              Official Tenancy Covenant
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-[#F3E5AB] mb-4">
              Tata Tertib & House Rules The Baswara Sky Suites
            </h3>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <h4 className="text-sm font-serif text-white mb-1">1. Privasi & Kerahasiaan Tingkat Tinggi (Strict Non-Disclosure)</h4>
                <p>
                  Penghuni dan tamu dilarang mempublikasikan denah unit privat, sistem keamanan, atau membocorkan identitas penghuni lain tanpa izin tertulis dari Manajemen.
                </p>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <h4 className="text-sm font-serif text-white mb-1">2. Ketertiban & Batas Suara (Quiet Hours)</h4>
                <p>
                  Jam tenang diberlakukan setiap hari mulai pukul 22:00 WIB hingga 07:00 WIB. Dilarang mengadakan pesta atau aktivitas berisik yang mengganggu kenyamanan sanctuary.
                </p>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <h4 className="text-sm font-serif text-white mb-1">3. Kebijakan Hewan Peliharaan (Pet Policy)</h4>
                <p>
                  Hewan peliharaan wajib memiliki sertifikat vaksin aktif, menggunakan tali kekang (leash) di seluruh area publik/lift, serta menjaga kebersihan sanitasi hunian.
                </p>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <h4 className="text-sm font-serif text-white mb-1">4. Kapasitas Hunian & Penyewa Tambahan</h4>
                <p>
                  Jumlah penghuni tidak boleh melebihi kapasitas resmi unit. Seluruh penyewa tambahan wajib didaftarkan melalui kuesioner resmi dan diverifikasi identitasnya.
                </p>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <h4 className="text-sm font-serif text-white mb-1">5. Larangan Sub-leasing & Pengalihan Unit</h4>
                <p>
                  Penyewa dilarang keras menyewakan kembali unit kepada pihak ketiga (sub-leasing) baik sebagian maupun keseluruhan tanpa persetujuan Direksi PT Baswara Mangkubumi Residence.
                </p>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <h4 className="text-sm font-serif text-white mb-1">6. Kepatuhan Pembayaran & Deposit</h4>
                <p>
                  Pembayaran biaya sewa dan refundable deposit wajib dilunasi sesuai invoice resmi yang dikeluarkan oleh sistem keuangan PT Baswara Mangkubumi Residence.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setRulesAgreed(true);
                  setShowRulesModal(false);
                }}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Saya Telah Membaca & Menyetujui Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
