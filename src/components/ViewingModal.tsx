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
} from 'lucide-react';
import {
  formatOfficialInvoiceNumber,
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

    // 1. Buat gambar invoice resmi JPG beresolusi tinggi langsung via Canvas (dijamin 100% selalu ada)
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

    // 2. Simpan Data Booking ke Google Sheets & Upload Invoice JPG ke Google Drive via Netlify Function
    try {
      const netlifyRes = await saveBookingViaNetlify(bookingData);
      if (netlifyRes.success) {
        setSheetsResult(netlifyRes);
        if (netlifyRes.officialInvoiceNumber) {
          setGeneratedInvoice((prev) => prev ? { ...prev, invoiceNumber: netlifyRes.officialInvoiceNumber! } : prev);
        }
        if (netlifyRes.driveFileUrl) {
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
Konfirmasi ditujukan ke Manajemen: @the_BASWARA / @fourgotmenot`;
  };

  const handleCopyDM = () => {
    navigator.clipboard.writeText(getDMSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
            <div className="space-y-6 py-2">
              {/* Header Status */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-[#D4AF37] tracking-widest mb-1.5 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Permohonan Sewa Berhasil Dikirim</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB]">
                    Pengajuan Sedang Ditinjau Tim Leasing
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mt-2">
                    Terima kasih, <strong className="text-white font-medium">{fullName}</strong>. Formulir permohonan sewa untuk unit <strong className="text-[#F3E5AB]">{currentUnit.name} (Tower {currentUnit.tower})</strong> beserta kelengkapan data KYC telah berhasil diterima oleh sistem manajemen The Baswara Sky Suites.
                  </p>
                </div>
              </div>

              {/* Private Tenancy Process Flow */}
              <div className="p-5 bg-[#0B0F19] border border-[#D4AF37]/40 text-left max-w-2xl mx-auto space-y-4 shadow-xl">
                <div className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2 pb-2.5 border-b border-slate-800">
                  <ShieldCheck size={16} />
                  <span>Tahapan Verifikasi & Proses Selanjutnya</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-white">Verifikasi Profil & Kelengkapan KYC</div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        Tim Internal Leasing & Compliance PT Baswara Mangkubumi Residence sedang memvalidasi data pengajuan dan alokasi unit Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-white">Penerbitan & Pengiriman Invoice Resmi Manual</div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        Invoice resmi penagihan sewa format JPG bertanda tangan Direksi & instruksi transfer escrow akan dikirimkan langsung oleh Tim Leasing kami secara privat ke Email / Pesan Pribadi (DM) Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-white">Pelunasan & Serah Terima Kunci Unit (Handover)</div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        Setelah pembayaran diverifikasi, Concierge Officer kami akan mengatur jadwal orientasi privat dan serah terima kartu akses unit Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 italic flex items-center gap-2">
                  <span className="text-[#D4AF37] font-serif">*</span>
                  <span>Catatan: Seluruh dokumen resmi penagihan dan perjanjian sewa diproses secara tertutup oleh Manajemen Leasing untuk menjaga privasi penghuni.</span>
                </div>
              </div>

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
