import React, { useState } from 'react';
import { Unit, UNITS_DATA } from '../data/units';
import {
  Calculator,
  Check,
  Copy,
  ShieldCheck,
  ArrowRight,
  X,
  FileText,
  Printer,
  Sparkles,
  Building2,
  Calendar,
  Download,
} from 'lucide-react';
import { formatOfficialInvoiceNumber, OFFICIAL_BANK_INFO } from '../lib/invoiceUtils';
import { downloadQuoteDataJpg } from '../lib/googleDriveInvoice';

export interface QuoteData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  unit: Unit;
  tenureMonths: 3 | 6 | 12;
  baseMonthly: number;
  discountRate: number;
  discountedMonthly: number;
  serviceChargePerM2: number;
  monthlyServiceCharge: number;
  vaultFee: number;
  butlerFee: number;
  wineLockerFee: number;
  totalAddons: number;
  totalRentForTenure: number;
  ppnRate: number;
  ppnAmount: number;
  materaiFee: number;
  totalMonthlyOngoing: number;
  securityDeposit: number;
  initialTotalUpfront: number;
  totalContractValue: number;
  selectedAddonsList: string[];
}

interface CostCalculatorProps {
  selectedUnit: Unit | null;
  onClose: () => void;
  onProceedToBooking: (quoteData: QuoteData) => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  selectedUnit: initialUnit,
  onClose,
  onProceedToBooking,
}) => {
  const [activeUnitId, setActiveUnitId] = useState<string>(
    initialUnit ? initialUnit.id : UNITS_DATA[0].id
  );
  // Rental duration: only 3, 6, and 12 months as requested
  const [tenureMonths, setTenureMonths] = useState<3 | 6 | 12>(12);
  const [copied, setCopied] = useState<boolean>(false);
  const [invoiceCopied, setInvoiceCopied] = useState<boolean>(false);
  // View mode: 'calculator' or 'invoice'
  const [activeTab, setActiveTab] = useState<'calculator' | 'invoice'>('calculator');

  const unit = UNITS_DATA.find((u) => u.id === activeUnitId) || UNITS_DATA[0];
  const isBaskara = unit.tower === 'Baskara';

  const handleUnitChange = (unitId: string) => {
    setActiveUnitId(unitId);
  };

  // Calculations
  const baseMonthly = unit.pricePerMonth;

  // Tenure discount: 3 bulan = 0%, 6 bulan = 5%, 12 bulan = 10%
  const discountRate = tenureMonths === 12 ? 0.10 : tenureMonths === 6 ? 0.05 : 0;
  const discountedMonthly = Math.round(baseMonthly * (1 - discountRate));

  // Biaya sewa langsung sesuai masa sewa (Direct total rent for tenure)
  const totalRentForTenure = discountedMonthly * tenureMonths;

  // Pajak Pertambahan Nilai (PPN) 11% dari total nilai sewa
  const ppnRate = 0.11;
  const ppnAmount = Math.round(totalRentForTenure * ppnRate);

  // Bea Materai & Biaya Administrasi legalisasi dokumen perjanjian sewa
  const materaiFee = 10000;

  // Security deposit: 2 bulan harga sewa pokok (Refundable di akhir masa kontrak)
  const securityDeposit = discountedMonthly * 2;

  // Service charge (IPL): Rp 0 (Termasuk dalam Biaya Sewa)
  const serviceChargePerM2 = 0;
  const monthlyServiceCharge = 0;

  // Fasilitas Add-ons: Sudah include di harga sewa (Rp 0)
  const vaultFee = 0;
  const butlerFee = 0;
  const wineLockerFee = 0;
  const totalAddons = 0;

  const totalMonthlyOngoing = discountedMonthly;
  // Total Pembayaran: Biaya sewa + PPN 11% + Materai + Security Deposit
  const initialTotalUpfront = totalRentForTenure + ppnAmount + materaiFee + securityDeposit;
  const totalContractValue = initialTotalUpfront;

  const selectedAddonsList: string[] = isBaskara ? [
    'Dedicated Supercar Vault & Valet (Termasuk di Harga Sewa · Rp 0)',
    '24/7 Dedicated Butler Attaché (Termasuk di Harga Sewa · Rp 0)',
    'Private Wine Cellar & Sommelier Locker (Termasuk di Harga Sewa · Rp 0)',
    'Dedicated VIP Parking & Service Charge (IPL) (Termasuk di Harga Sewa · Rp 0)',
  ] : [
    'Dedicated VIP Parking (Termasuk di Harga Sewa · Rp 0)',
    'Service Charge (IPL) Gedung (Termasuk di Harga Sewa · Rp 0)',
  ];

  const invoiceNumber = formatOfficialInvoiceNumber(unit.tower);
  
  const today = new Date();
  const issueDateFormatted = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dueDateObj = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueDateFormatted = dueDateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quoteData: QuoteData = {
    invoiceNumber,
    issueDate: issueDateFormatted,
    dueDate: dueDateFormatted,
    unit,
    tenureMonths,
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyQuote = () => {
    const text = `ESTIMASI SEWA BASWARA SKY SUITES
Unit: ${unit.name} (${unit.tower})
Luas: ${unit.sizeM2} m²
Durasi Kontrak: ${tenureMonths} Bulan ${discountRate > 0 ? `(Diskon Tenor ${discountRate * 100}%)` : ''}
----------------------------------------
RINCIAN BIAYA SEWA (${tenureMonths} BULAN):
• Sewa Pokok Unit (${tenureMonths} Bulan): ${formatRupiah(totalRentForTenure)} (${tenureMonths} Bulan × ${formatRupiah(discountedMonthly)}/bln)${discountRate > 0 ? ` (Harga Normal: ${formatRupiah(baseMonthly)}/bln)` : ''}
• Pajak Pertambahan Nilai (PPN 11%): ${formatRupiah(ppnAmount)}
• Bea Materai & Administrasi Legalisasi: ${formatRupiah(materaiFee)}
• Service Charge Gedung & VIP Parking: Rp 0 (Sudah Termasuk dalam Biaya Sewa)
• Layanan Tambahan Baskara (Butler, Supercar Vault, Wine Cellar): Rp 0 (Sudah Termasuk dalam Biaya Sewa)
• Security Deposit (2 Bulan Sewa Pokok - Refundable): ${formatRupiah(securityDeposit)}
----------------------------------------
TOTAL PEMBAYARAN: ${formatRupiah(initialTotalUpfront)}
(Mencakup: Biaya Sewa Penuh ${tenureMonths} Bulan + PPN 11% + Materai + Security Deposit Refundable)

Rekening Resmi Pembayaran:
Bank: ${OFFICIAL_BANK_INFO.bankName}
Atas Nama: ${OFFICIAL_BANK_INFO.accountHolder}
Nomor Rekening: ${OFFICIAL_BANK_INFO.accountNumber}

Lokasi: Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat
Resmi X: @the_BASWARA`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyInvoice = () => {
    const invoiceText = `========================================================
             INVOICE RESMI SEWA UNIT
            PT BASWARA MANGKUBUMI RESIDENCE
           Baswara Sky Suites · Menteng, Jakarta
========================================================
No. Invoice : ${invoiceNumber}
Tanggal     : ${issueDateFormatted}
Jatuh Tempo : ${dueDateFormatted}
Status      : PROFORMA / MENUNGGU PEMBAYARAN

PENYEWA / PROSPEK:
Calon Penghuni Terverifikasi
Unit        : ${unit.name} (${unit.tower})
Luas Unit   : ${unit.sizeM2} m²
Masa Sewa   : ${tenureMonths} Bulan

RINCIAN PENAGIHAN PEMBAYARAN:
1. Biaya Sewa Pokok Unit (${tenureMonths} Bulan)
   = ${formatRupiah(totalRentForTenure)} (${tenureMonths} Bulan × ${formatRupiah(discountedMonthly)}/bln)${discountRate > 0 ? ` [Diskon Tenor ${discountRate * 100}%]` : ''}
2. Pajak Pertambahan Nilai (PPN 11%)
   = ${formatRupiah(ppnAmount)} (11% dari Total Nilai Sewa)
3. Bea Materai & Biaya Administrasi Dokumen Perjanjian
   = ${formatRupiah(materaiFee)} (Legalisasi Bermaterai Lunas)
4. Service Charge Gedung (IPL) & Dedicated VIP Parking
   = Rp 0 (Sudah Termasuk dalam Biaya Sewa)
5. Fasilitas Tambahan VVIP (Butler 24/7, Supercar Vault, Wine Cellar)
   = Rp 0 (Sudah Termasuk dalam Biaya Sewa)
6. Security Deposit Jaminan Unit (2 Bulan Sewa Pokok, 100% Refundable)
   = ${formatRupiah(securityDeposit)}

--------------------------------------------------------
TOTAL PEMBAYARAN: ${formatRupiah(initialTotalUpfront)}
(Mencakup: Biaya Sewa Penuh ${tenureMonths} Bulan + PPN 11% + Materai + Security Deposit Refundable)
--------------------------------------------------------

REKENING RESMI PEMBAYARAN:
Bank           : ${OFFICIAL_BANK_INFO.bankName}
Atas Nama      : ${OFFICIAL_BANK_INFO.accountHolder}
No. Rekening   : ${OFFICIAL_BANK_INFO.accountNumber}

DISETUJUI OLEH:
PT Baswara Mangkubumi Residence
CEO: Marcelinus Chitraditya Lokananta Prabaswara
Head of Leasing: Natasha Wijaya
========================================================`;

    navigator.clipboard.writeText(invoiceText);
    setInvoiceCopied(true);
    setTimeout(() => setInvoiceCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex justify-center items-start">
      <div className="bg-[#111827] border border-[#D4AF37] max-w-4xl w-full p-6 sm:p-8 relative my-6 sm:my-10 shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 z-10 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* TAB 1: KALKULATOR BIAYA */}
        {activeTab === 'calculator' && (
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB] mb-6 pr-10">
              Kalkulator Biaya Sewa & Rincian Pembayaran
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Unit Selection */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-300 mb-2">
                    Pilih Tipe Unit Apartemen
                  </label>
                  <select
                    value={activeUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-700 text-slate-100 p-3 text-sm focus:border-[#D4AF37] focus:outline-none"
                  >
                    <optgroup label="Tower Arunika">
                      {UNITS_DATA.filter((u) => u.tower === 'Arunika').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tower Baskara">
                      {UNITS_DATA.filter((u) => u.tower === 'Baskara').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    <span>Tower: <strong className={isBaskara ? 'text-[#D4AF37]' : 'text-slate-200'}>{unit.tower}</strong></span>
                  </div>
                </div>

                {/* Lease Duration Buttons: 3 Bulan, 6 Bulan, dan 12 Bulan SAJA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider text-slate-300">
                      Durasi Masa Sewa (Privilege Tenure)
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* 3 Bulan */}
                    <button
                      type="button"
                      onClick={() => setTenureMonths(3)}
                      className={`p-3 text-center border text-xs tracking-wider transition-colors cursor-pointer ${
                        tenureMonths === 3
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3E5AB]'
                          : 'border-slate-800 bg-[#0B0F19] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-sm">3 Bulan</div>
                      <div className="text-[10px] text-slate-400">Tarif Standar</div>
                    </button>

                    {/* 6 Bulan */}
                    <button
                      type="button"
                      onClick={() => setTenureMonths(6)}
                      className={`p-3 text-center border text-xs tracking-wider transition-colors cursor-pointer ${
                        tenureMonths === 6
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3E5AB]'
                          : 'border-slate-800 bg-[#0B0F19] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-sm">6 Bulan</div>
                      <div className="text-[10px] text-[#D4AF37]">Diskon 5%</div>
                    </button>

                    {/* 12 Bulan */}
                    <button
                      type="button"
                      onClick={() => setTenureMonths(12)}
                      className={`p-3 text-center border text-xs tracking-wider transition-colors cursor-pointer ${
                        tenureMonths === 12
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3E5AB]'
                          : 'border-slate-800 bg-[#0B0F19] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-sm">12 Bulan</div>
                      <div className="text-[10px] text-[#D4AF37]">Diskon 10%</div>
                    </button>
                  </div>
                </div>



              </div>

              {/* Right Column: Breakdown & Summary */}
              <div className="lg:col-span-6 bg-[#0B0F19] border border-[#D4AF37]/30 p-6 flex flex-col justify-between">
                <div>
                  {/* Rincian Biaya Sewa (Tanpa Duplikasi) */}
                  <div className="space-y-3 pb-5 border-b border-slate-800 text-xs sm:text-sm">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                      Rincian Biaya Sewa ({tenureMonths} Bulan)
                    </div>

                    {/* 1. Biaya Sewa Pokok Unit (Sesuai Tenor) */}
                    <div className="flex justify-between items-center text-slate-300">
                      <div>
                        <span className="font-medium text-slate-200 block">Sewa Pokok Unit ({unit.name})</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatRupiah(discountedMonthly)}/bln × {tenureMonths} Bulan
                          {discountRate > 0 && (
                            <span className="text-emerald-400 ml-1">
                              (Diskon Tenor {discountRate * 100}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-200 font-semibold">
                        {formatRupiah(totalRentForTenure)}
                      </span>
                    </div>

                    {/* 2. Pajak Pertambahan Nilai (PPN 11%) */}
                    <div className="flex justify-between items-center text-slate-300">
                      <div>
                        <span className="font-medium text-slate-200 block">Pajak Pertambahan Nilai (PPN 11%)</span>
                        <span className="text-[10px] text-slate-400">11% dari total nilai sewa</span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-200 font-semibold">
                        {formatRupiah(ppnAmount)}
                      </span>
                    </div>

                    {/* 3. Bea Materai & Administrasi Legalisasi Dokumen */}
                    <div className="flex justify-between items-center text-slate-300">
                      <div>
                        <span className="font-medium text-slate-200 block">Bea Materai & Administrasi</span>
                        <span className="text-[10px] text-slate-400">Legalisasi perjanjian sewa bermaterai lunas</span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-200 font-semibold">
                        {formatRupiah(materaiFee)}
                      </span>
                    </div>

                    {/* 4. Security Deposit Jaminan Unit */}
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#D4AF37]" />
                        <div>
                          <span className="font-medium text-slate-200 block">
                            Security Deposit (2 Bulan Sewa Pokok)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            100% Refundable di akhir masa kontrak
                          </span>
                        </div>
                      </span>
                      <span className="font-mono tabular-nums text-slate-200 font-semibold">
                        {formatRupiah(securityDeposit)}
                      </span>
                    </div>
                  </div>

                  {/* Total Pembayaran */}
                  <div className="py-4 border-b border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#D4AF37]/10 p-3.5 border border-[#D4AF37]/40">
                      <div>
                        <span className="text-xs sm:text-sm uppercase tracking-wider text-[#F3E5AB] font-bold block">
                          Total Pembayaran
                        </span>
                        <span className="text-[10px] text-slate-300">
                          Biaya Sewa ({tenureMonths} Bulan) + PPN 11% + Materai + Security Deposit
                        </span>
                      </div>
                      <div className="font-serif text-2xl sm:text-3xl text-[#D4AF37] font-bold tabular-nums font-mono">
                        {formatRupiah(initialTotalUpfront)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-slate-800 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="w-full py-2.5 px-3 border border-slate-700 text-xs tracking-wider uppercase text-slate-200 hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copied ? 'Tersalin!' : 'Salin Ringkasan Estimasi Biaya'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceedToBooking(quoteData);
                    }}
                    className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Lanjut ke Pengisian Formulir Sewa</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: INVOICE RESMI SEWA (TERHUBUNG LANGSUNG DENGAN KALKULATOR) */}
        {activeTab === 'invoice' && (
          <div className="space-y-6">
            
            {/* Invoice Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F19] p-3 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-200 font-mono">
                  Invoice Terhubung Langsung dengan Perhitungan Kalkulator
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadQuoteDataJpg(quoteData, 'Calon Penghuni', '@calon_penghuni')}
                  className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37] hover:bg-[#D4AF37]/30 text-[#F3E5AB] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Unduh File JPG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyInvoice}
                  className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{invoiceCopied ? 'Tersalin!' : 'Salin Teks Invoice'}</span>
                </button>
              </div>
            </div>

            {/* Printable Official Invoice Card */}
            <div className="bg-[#0B0F19] border-2 border-[#D4AF37]/50 p-6 sm:p-8 relative text-slate-200">
              
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
                    <div className="text-xs font-mono text-slate-300">
                      No: <span className="text-white font-semibold">{invoiceNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Tanggal Terbit: {issueDateFormatted}
                    </div>
                    <div className="text-[11px] text-amber-400">
                      Tenggat Pembayaran: {dueDateFormatted} (7 Hari)
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
                  <div className="font-medium text-white text-sm">
                    Pendaftar Sewa Terverifikasi
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] mb-1">
                    Spesifikasi Kontrak & Unit:
                  </div>
                  <div className="font-semibold text-[#F3E5AB] text-sm">
                    {unit.name} · {unit.tower}
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
                        Sewa Pokok Unit ({unit.name}) · {tenureMonths} Bulan
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tower {unit.tower} · {formatRupiah(baseMonthly)}/bln × {tenureMonths} Bulan
                        {discountRate > 0 && (
                          <span className="ml-2 text-emerald-400 font-mono">
                            (Diskon Tenor {discountRate * 100}%: -{formatRupiah((baseMonthly - discountedMonthly) * tenureMonths)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-mono text-white font-medium text-sm whitespace-nowrap pl-4">
                      {formatRupiah(totalRentForTenure)}
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
                      {formatRupiah(ppnAmount)}
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
                      {formatRupiah(materaiFee)}
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
                      {formatRupiah(securityDeposit)}
                    </div>
                  </div>

                  {/* Grand Total Bar */}
                  <div className="flex items-center justify-between bg-[#D4AF37]/15 p-3.5 border border-[#D4AF37]/40 mt-3">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-[#F3E5AB] font-semibold">
                        Total Tagihan Pembayaran
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total sewa {tenureMonths} bulan + PPN 11% + materai + security deposit 2 bulan
                      </div>
                    </div>
                    <div className="text-right font-mono text-xl sm:text-2xl text-[#D4AF37] font-bold">
                      {formatRupiah(initialTotalUpfront)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Instructions & Executive Signatures */}
              <div className="py-6 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-[#D4AF37] mb-2">
                    Instruksi Pembayaran Resmi:
                  </div>
                  <div className="bg-[#111827] p-3.5 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Bank:</span>
                      <span className="font-medium text-white">{OFFICIAL_BANK_INFO.bankName}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Atas Nama:</span>
                      <span className="font-medium text-white">{OFFICIAL_BANK_INFO.accountHolder}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                      <span className="text-slate-400">No. Rekening:</span>
                      <span className="font-mono text-[#F3E5AB] font-bold text-sm tracking-wider">{OFFICIAL_BANK_INFO.accountNumber}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    *Harap sertakan nomor invoice <strong className="text-slate-200">{invoiceNumber}</strong> pada berita transfer.
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

            {/* Bottom Actions in Invoice Mode */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className="py-3 px-4 border border-slate-700 text-xs tracking-wider uppercase text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Calculator size={14} />
                <span>Ubah Perhitungan Kalkulator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToBooking(quoteData);
                }}
                className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Lanjut ke Pengisian Formulir (Kaitkan Invoice #{invoiceNumber})</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
