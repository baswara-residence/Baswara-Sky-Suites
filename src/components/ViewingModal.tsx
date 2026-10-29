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
  Mail,
  Download,
  Share2,
  Send,
} from 'lucide-react';
import {
  formatOfficialInvoiceNumber,
  formatOfficialReceiptNumber,
  getNextInvoiceSequence,
  fetchLiveInvoiceSequence,
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
  generateInvoiceJpegDataUrl,
  generateReceiptJpegDataUrl,
  downloadQuoteDataJpg,
  ReceiptData,
} from '../lib/googleDriveInvoice';
import { User, onAuthStateChanged } from 'firebase/auth';
import { AdminDriveStatusModal } from './AdminDriveStatusModal';

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

  // Form states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedTweet, setCopiedTweet] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAdminStatusOpen, setIsAdminStatusOpen] = useState(false);

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

  const formatRupiah = (val?: number | null) => {
    const num = typeof val === 'number' && !isNaN(val) ? val : 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
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
      gasUrl: (typeof window !== 'undefined' ? localStorage.getItem('baswara_gas_url') : null) || undefined,
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

  const captureInvoiceJpegBase64 = async (): Promise<string | null> => {
    try {
      const invoiceElement = document.getElementById('official-invoice-card');
      if (!invoiceElement) return null;
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B0F19',
        logging: false,
      });
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (err) {
      console.warn('html2canvas base64 capture error:', err);
      return null;
    }
  };

  const syncSubmissionToAdminDriveAndSheets = async (
    targetInvoice: QuoteData,
    bookingData: BookingSubmissionData,
    overrideToken?: string
  ) => {
    const token = overrideToken || (await getAccessToken());

    // 1. Tangkap invoice JPG dalam format Base64 untuk dikirim ke Netlify Serverless Function
    setIsSavingToSheets(true);
    setIsSavingToDrive(true);

    // 1. Buat gambar invoice resmi JPG beresolusi tinggi langsung via Canvas
    try {
      const directJpgBase64 = generateInvoiceJpegDataUrl(
        targetInvoice,
        fullName.trim() || 'Tenant',
        normalizedUsername || '@tenant'
      );
      bookingData.invoiceBase64 = directJpgBase64;
    } catch (canvasErr) {
      console.warn('Canvas generator note:', canvasErr);
      const fallbackCapture = await captureInvoiceJpegBase64();
      if (fallbackCapture) {
        bookingData.invoiceBase64 = fallbackCapture;
      }
    }

    // 2. Buat gambar Kuitansi Resmi Pelunasan Sewa (Receipt) langsung via Canvas untuk Google Drive & Spreadsheet admin
    try {
      const receiptNo = targetInvoice.invoiceNumber.replace(/^INV/, 'KWT');
      const todayFormatted = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const receiptData: ReceiptData = {
        receiptNumber: receiptNo,
        invoiceNumber: targetInvoice.invoiceNumber,
        paymentDate: todayFormatted,
        unitName: currentUnit.name,
        tower: currentUnit.tower,
        tenureMonths: targetInvoice.tenureMonths,
        totalAmount: targetInvoice.initialTotalUpfront,
        paymentMethod: `Bank Transfer - ${OFFICIAL_BANK_INFO.bankName} (PT Baswara Mangkubumi Residence)`,
      };
      const directReceiptBase64 = generateReceiptJpegDataUrl(
        receiptData,
        fullName.trim() || 'Tenant',
        normalizedUsername || '@tenant'
      );
      bookingData.receiptBase64 = directReceiptBase64;
    } catch (receiptErr) {
      console.warn('Receipt generator note:', receiptErr);
    }

    if (token) {
      bookingData.adminAccessToken = token;
    }

    // 3. Simpan Data Booking, Invoice JPG, dan Kuitansi JPG ke Google Sheets & Google Drive via Netlify Function
    try {
      const netlifyRes = await saveBookingViaNetlify(bookingData);
      if (netlifyRes.success) {
        setSheetsResult(netlifyRes);
        if (netlifyRes.officialInvoiceNumber) {
          setGeneratedInvoice((prev) => prev ? { ...prev, invoiceNumber: netlifyRes.officialInvoiceNumber! } : prev);
        }
        if (netlifyRes.driveFileUrl || netlifyRes.receiptFileUrl) {
          setDriveResult({
            success: true,
            fileId: netlifyRes.driveFileId,
            fileWebViewLink: netlifyRes.driveFileUrl,
            folderWebViewLink: netlifyRes.driveFolderUrl,
          });
        }
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
      setIsSavingToDrive(false);
    }

    // 3. Cadangan: Jika Netlify belum upload JPG dan token OAuth admin aktif, upload via direct Drive API
    if (token && (!driveResult?.success || !bookingData.invoiceBase64)) {
      setIsSavingToDrive(true);
      try {
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

    // Terbitkan nomor invoice resmi live dari baris Google Sheets:
    // Format: Bulan, Tahun, Nomor Urut, Kode A (Arunika) / B (Baskara), tanpa jenis unit & tanpa lama sewa
    const liveSeqData = await fetchLiveInvoiceSequence(currentUnit.tower);
    const invNumber = attachedQuote?.invoiceNumber || liveSeqData.invoiceNumber;
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
========================================
Status: Pengajuan Telah Dikirim & Sedang Ditinjau Tim Leasing
PENTING: Sebelum transfer pembayaran, wajib konfirmasi ketersediaan unit ke base: @the_BASWARA
Konfirmasi ditujukan ke Manajemen: @the_BASWARA / @fourgotmenot`;
  };

  const handleCopyDM = () => {
    navigator.clipboard.writeText(getDMSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyBank = () => {
    const text = `${OFFICIAL_BANK_INFO.bankName} - ${OFFICIAL_BANK_INFO.accountNumber} (a/n ${OFFICIAL_BANK_INFO.accountHolder})`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleCopyTweetText = () => {
    const inv = generatedInvoice || attachedQuote;
    const invNo = inv?.invoiceNumber || 'INV/BSS/A/...';
    const text = `Halo @the_BASWARA, saya telah melakukan pembayaran sewa unit ${currentUnit.name} (Tower ${currentUnit.tower}) dengan nomor invoice ${invNo}. Berikut bukti transfernya, mohon diproses untuk serah terima kunci. Terima kasih! #BaswaraSkySuites`;
    navigator.clipboard.writeText(text);
    setCopiedTweet(true);
    setTimeout(() => setCopiedTweet(false), 2500);
  };

  const handleDownloadInvoiceJpg = () => {
    const inv = generatedInvoice || attachedQuote;
    if (inv) {
      downloadQuoteDataJpg(inv, fullName.trim() || 'Tenant', normalizedUsername || '@tenant');
    }
  };

  if (!isOpen) return null;

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
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono flex items-center gap-2">
                  <ScrollText size={14} />
                  <span>The Baswara Sky Suites · Pengisian Formulir</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminStatusOpen(true)}
                  className="text-[11px] font-mono text-[#D4AF37] hover:text-[#F3E5AB] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Buka Pengaturan Google Drive & Webhook"
                >
                  <HardDrive size={12} />
                  <span>Pengaturan Drive & Webhook</span>
                </button>
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
                      Unit: {attachedQuote.unit?.name || currentUnit.name} ({attachedQuote.tenureMonths || 3} Bulan) · Total Nilai Sewa: {formatRupiah(attachedQuote.totalContractValue || attachedQuote.initialTotalUpfront || 0)}
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
            <div className="space-y-6 py-2">
              {/* Header Status */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Invoice Resmi Diterbitkan · Status: Belum Dibayar</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB]">
                  Permohonan Sewa Berhasil Didaftarkan
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  Terima kasih, <strong className="text-white font-medium">{fullName}</strong>. Dokumen invoice resmi untuk unit <strong className="text-[#F3E5AB]">{currentUnit.name} (Tower {currentUnit.tower})</strong> telah diterbitkan.
                </p>

                {/* Important Base Confirmation Notice Before Payment */}
                <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 text-xs text-left max-w-xl mx-auto space-y-1.5 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px] font-mono">
                    <AlertCircle size={15} className="text-amber-400 shrink-0" />
                    <span>PENTING: Konfirmasi Ketersediaan Unit Sebelum Transfer</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    Sebelum melakukan transfer pembayaran, <strong>mohon konfirmasi terlebih dahulu ke akun base resmi (<a href="https://x.com/the_BASWARA" target="_blank" rel="noopener noreferrer" className="text-[#F3E5AB] underline font-mono hover:text-white">@the_BASWARA</a>)</strong> untuk memastikan apakah unit yang Anda pilih masih <em>available</em> (tersedia) atau tidak.
                  </p>
                </div>
              </div>

              {/* Action Bar (Download & Copy) */}
              {(() => {
                const inv = generatedInvoice || attachedQuote;
                if (!inv) return null;
                const invNo = inv.invoiceNumber;
                const tweetText = `Halo @the_BASWARA, saya telah melakukan pembayaran sewa unit ${currentUnit.name} (Tower ${currentUnit.tower}) dengan nomor invoice ${invNo}. Berikut bukti transfernya, mohon diproses untuk serah terima kunci. Terima kasih! #BaswaraSkySuites`;
                const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

                return (
                  <>
                    {/* Primary Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
                      <button
                        type="button"
                        onClick={handleDownloadInvoiceJpg}
                        className="flex-1 min-w-[200px] py-3 px-5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0B0F19] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download size={16} />
                        <span>Unduh File JPG Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyBank}
                        className="py-3 px-4 border border-[#D4AF37]/60 text-[#F3E5AB] hover:bg-[#D4AF37]/10 text-xs uppercase tracking-wider font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {copiedBank ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        <span>{copiedBank ? 'Rekening Tersalin!' : 'Salin Rekening Bank'}</span>
                      </button>
                    </div>

                    {/* Official Invoice Card */}
                    <div
                      id="official-invoice-card"
                      className="p-6 sm:p-8 bg-[#0B0F19] border-2 border-[#D4AF37] shadow-2xl text-left max-w-3xl mx-auto space-y-6 relative overflow-hidden"
                    >
                      {/* Watermark / Background Glow */}
                      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-[#D4AF37]/40">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">
                            Official Tenancy Billing
                          </div>
                          <h2 className="text-xl sm:text-2xl font-serif text-[#F3E5AB]">
                            THE BASWARA SKY SUITES
                          </h2>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            PT Baswara Mangkubumi Residence · Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat
                          </p>
                        </div>

                        <div className="text-left sm:text-right space-y-1">
                          <div className="text-xs font-mono font-bold text-[#D4AF37]">
                            NO: {inv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Tanggal Terbit: {inv.issueDate}
                          </div>
                          <div className="text-[11px] text-amber-400">
                            Jatuh Tempo: {inv.dueDate} (7 Hari)
                          </div>
                          <div className="pt-1">
                            <span className="inline-block px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold tracking-wider">
                              BELUM DIBAYAR (PENDING)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tenant & Unit Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-[#080C14] border border-slate-800 space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37]">
                            Ditagihkan Kepada:
                          </div>
                          <div className="font-serif text-white font-medium text-sm">
                            {fullName}
                          </div>
                          <div className="font-mono text-[#D4AF37] text-xs">
                            {normalizedUsername}
                          </div>
                          {faceClaim && (
                            <div className="text-slate-400 text-[11px]">
                              Face Claim: {faceClaim}
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-[#080C14] border border-slate-800 space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37]">
                            Spesifikasi Unit & Hunian:
                          </div>
                          <div className="font-serif text-white font-medium text-sm">
                            {currentUnit.name} · Tower {currentUnit.tower}
                          </div>
                          <div className="text-slate-300 text-[11px]">
                            Masa Sewa: <strong className="text-white">{inv.tenureMonths} Bulan</strong> · Luas: {currentUnit.sizeM2} m²
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Status: {isLivingAlone ? 'Tinggal Sendiri' : `Bersama ${coTenants.length} Penyewa Tambahan`}
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown Table */}
                      <div className="border border-slate-800 overflow-hidden text-xs">
                        <div className="bg-[#111827] px-4 py-2.5 font-mono text-[11px] text-[#D4AF37] flex justify-between uppercase tracking-wider border-b border-slate-800">
                          <span>Deskripsi Tagihan</span>
                          <span>Total (IDR)</span>
                        </div>
                        <div className="divide-y divide-slate-800/80 bg-[#080C14]">
                          {(() => {
                            const baseMo = inv.baseMonthly || (inv.unit?.pricePerMonth ?? Math.round(inv.discountedMonthly / (1 - (inv.discountRate || 0))));
                            const gross = baseMo * inv.tenureMonths;
                            const effectiveRate = inv.discountRate || (inv.tenureMonths === 12 ? 0.10 : inv.tenureMonths === 6 ? 0.05 : 0);
                            const discountVal = effectiveRate > 0 ? Math.round(gross * effectiveRate) : 0;
                            const discountPct = Math.round(effectiveRate * 100);

                            return (
                              <>
                                <div className="px-4 py-2.5 flex justify-between text-slate-200">
                                  <span>Sewa Pokok Unit ({inv.tenureMonths} Bulan)</span>
                                  <span className="font-mono font-medium text-white">
                                    Rp {(effectiveRate > 0 ? gross : (inv.totalRentForTenure || (inv.discountedMonthly * inv.tenureMonths))).toLocaleString('id-ID')}
                                  </span>
                                </div>

                                {effectiveRate > 0 && discountVal > 0 && (
                                  <div className="px-4 py-2.5 flex justify-between bg-emerald-950/25 border-y border-emerald-500/30 text-emerald-300">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-emerald-200">
                                        ✦ Diskon Komitmen Masa Sewa ({discountPct}% · {inv.tenureMonths} Bulan)
                                      </span>
                                      <span className="text-[10px] text-emerald-400/80">
                                        Potongan sewa langsung Rp {(baseMo - inv.discountedMonthly).toLocaleString('id-ID')}/bln
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-300 self-center">
                                      - Rp {discountVal.toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          <div className="px-4 py-2 flex justify-between text-slate-300">
                            <span>Pajak Pertambahan Nilai (PPN 11%)</span>
                            <span className="font-mono text-slate-200">
                              Rp {(inv.ppnAmount || Math.round((inv.totalRentForTenure || 0) * 0.11)).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="px-4 py-2 flex justify-between text-slate-300">
                            <span>Bea Materai & Administrasi Legalisasi Dokumen</span>
                            <span className="font-mono text-slate-200">
                              Rp {(inv.materaiFee || 10000).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="px-4 py-2 flex justify-between text-slate-300">
                            <span>Security Deposit Jaminan (100% Refundable · 2 Bln Sewa Pokok)</span>
                            <span className="font-mono text-slate-200">
                              Rp {inv.securityDeposit.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Grand Total */}
                        <div className="px-4 py-3.5 bg-[#D4AF37]/15 border-t-2 border-[#D4AF37] flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#F3E5AB] uppercase tracking-wider">
                            Total Tagihan Pembayaran:
                          </span>
                          <span className="font-mono text-lg sm:text-xl font-bold text-[#D4AF37]">
                            Rp {inv.initialTotalUpfront.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Official Legal Terms (Tanpa petunjuk transfer di dalam dokumen) */}
                      <div className="p-4 bg-[#080C14] border border-slate-800 space-y-1.5 text-xs">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37]">
                          Ketentuan Resmi Penagihan & Legalitas Dokumen:
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed space-y-1 pt-0.5">
                          <p>1. Dokumen invoice ini merupakan bukti penagihan resmi yang sah, diterbitkan oleh PT Baswara Mangkubumi Residence.</p>
                          <p>2. Security Deposit (Dana Jaminan Pemeliharaan) bersifat 100% dapat dikembalikan (refundable) pada akhir masa sewa.</p>
                          <p>3. Serah terima unit hunian dan akses kartu resmi diproses setelah verifikasi leasing dikonfirmasi.</p>
                        </div>
                      </div>

                      {/* Signatures */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between gap-4 text-[11px]">
                        <div className="space-y-1">
                          <div className="text-slate-500 font-mono text-[10px] uppercase">
                            Mengetahui & Menyetujui,
                          </div>
                          <div className="font-serif text-white font-medium text-xs pt-1">
                            Marcelinus Chitraditya Lokananta Prabaswara
                          </div>
                          <div className="text-[#D4AF37] font-mono text-[10px]">
                            Chief Executive Officer (CEO)
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            PT Baswara Mangkubumi Residence
                          </div>
                        </div>

                        <div className="space-y-1 sm:text-right">
                          <div className="text-slate-500 font-mono text-[10px] uppercase">
                            Otorisasi Leasing & Keuangan,
                          </div>
                          <div className="font-serif text-white font-medium text-xs pt-1">
                            Natasha Wijaya
                          </div>
                          <div className="text-[#D4AF37] font-mono text-[10px]">
                            Head of Leasing & Compliance
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            Baswara Sky Suites Leasing Division
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Payment & Timeline Posting Instructions */}
                    <div className="p-5 bg-[#0B0F19] border border-[#D4AF37]/50 text-left max-w-3xl mx-auto space-y-4 shadow-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <div className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                          <ShieldCheck size={16} />
                          <span>Instruksi Pembayaran & Konfirmasi di Timeline X</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                          Wajib Tag @the_BASWARA
                        </span>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <div className="font-semibold text-white">Unduh & Simpan Invoice Resmi</div>
                            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                              Klik tombol <strong className="text-[#F3E5AB]">"Unduh File JPG Invoice"</strong> di atas untuk menyimpan dokumen tagihan resmi ke galeri / penyimpanan perangkat Anda.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <div className="font-semibold text-white">Transfer Bank ke Rekening Resmi Baswara</div>
                            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                              Transfer total tagihan <strong>Rp {inv.initialTotalUpfront.toLocaleString('id-ID')}</strong> ke Bank Chobank: <strong className="text-[#F3E5AB]">4493 6362 5269 4576</strong> a/n PT Baswara Mangkubumi Residence. Wajib cantumkan nomor invoice <strong>{inv.invoiceNumber}</strong> pada berita transfer.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <div className="font-semibold text-white">Post Bukti Transfer di Timeline X & Tag @the_BASWARA</div>
                            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                              Setelah pembayaran berhasil, unggah/post foto bukti transfer Anda di <strong>timeline akun X (Twitter)</strong> Anda dan tag/mention <strong className="text-[#F3E5AB]">@the_BASWARA</strong>.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Twitter Post Actions */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <a
                          href={twitterIntentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-4 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Send size={14} />
                          <span>Post Bukti Pembayaran ke @the_BASWARA</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleCopyTweetText}
                          className="py-2.5 px-4 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {copiedTweet ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedTweet ? 'Format Tweet Tersalin!' : 'Salin Format Tweet'}</span>
                        </button>
                      </div>

                      {/* Official Receipt Note */}
                      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 italic space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                          <CheckCircle2 size={13} />
                          <span>Kuitansi Pembayaran Resmi (LUNAS):</span>
                        </div>
                        <p>
                          Kuitansi resmi berstatus <strong>LUNAS</strong> beserta stempel cap keemasan dan dokumen serah terima kunci akan otomatis diterbitkan dan diarsipkan langsung ke database manajemen setelah postingan bukti transfer Anda diverifikasi oleh tim kami. Anda tidak perlu mengunduh kuitansi tersebut secara manual.
                        </p>
                      </div>
                    </div>

                    {/* Summary of Reservation Data */}
                    <div className="p-4 bg-[#0B0F19] border border-slate-800 text-left text-xs space-y-2 max-w-3xl mx-auto shadow">
                      <div className="text-[11px] uppercase font-mono tracking-wider text-[#D4AF37] mb-1 flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <ScrollText size={14} />
                          <span>Ringkasan Data Formulir Calon Penghuni</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyDM}
                          className="text-[#D4AF37] hover:underline flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          <Copy size={11} />
                          <span>{copied ? 'Tersalin' : 'Salin Data'}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Nama:</span>
                          <span className="text-white font-medium">{fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Username X:</span>
                          <span className="text-[#D4AF37] font-mono">{normalizedUsername}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Unit:</span>
                          <span className="text-slate-200">{currentUnit.name} (Tower {currentUnit.tower})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status Hunian:</span>
                          <span className="text-slate-200">{isLivingAlone ? 'Tinggal Sendiri' : `Bersama ${coTenants.length} Co-Tenant`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tanda Tangan:</span>
                          <span className="text-[#F3E5AB] font-serif">{signatureName || fullName} (Disetujui)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status KYC:</span>
                          <span className="text-amber-400 font-mono">Menunggu Verifikasi Transfer</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

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

      <AdminDriveStatusModal
        isOpen={isAdminStatusOpen}
        onClose={() => setIsAdminStatusOpen(false)}
      />
    </>
  );
};
