import React, { useState, useMemo } from 'react';
import { Unit, UNITS_DATA } from '../data/units';
import { UnitFloorPlanVisualizer } from './UnitFloorPlanVisualizer';
import arunikaImg from '../assets/images/tower_arunika_facade_1792311582736.jpg';
import baskaraImg from '../assets/images/tower_baskara_facade_1792311582650.jpg';
import {
  Users,
  Maximize2,
  Check,
  Calculator,
  Sparkles,
  Building2,
  ChevronRight,
  Compass,
  Layers,
  Sun,
  Eye,
  MapPin,
  CheckCircle,
  FileText,
  Shield,
  Key,
  Cpu,
  Car,
} from 'lucide-react';

interface UnitExplorerProps {
  selectedTowerFilter: 'All' | 'Arunika' | 'Baskara';
  onSelectTowerFilter: (tower: 'All' | 'Arunika' | 'Baskara') => void;
  onOpenCalculator: (unit: Unit) => void;
  onOpenViewingModal: (unit?: Unit) => void;
}

export const UnitExplorer: React.FC<UnitExplorerProps> = ({
  selectedTowerFilter,
  onSelectTowerFilter,
  onOpenCalculator,
  onOpenViewingModal,
}) => {
  const [selectedBedroom, setSelectedBedroom] = useState<number | 'all'>('all');
  const [activeModalUnit, setActiveModalUnit] = useState<Unit | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'floorplan' | 'orientation' | 'features'>('floorplan');
  const [activeTowerTab, setActiveTowerTab] = useState<'Arunika' | 'Baskara'>(
    selectedTowerFilter === 'Baskara' ? 'Baskara' : 'Arunika'
  );

  React.useEffect(() => {
    if (selectedTowerFilter === 'Baskara') {
      setActiveTowerTab('Baskara');
    } else if (selectedTowerFilter === 'Arunika') {
      setActiveTowerTab('Arunika');
    }
  }, [selectedTowerFilter]);

  const filteredUnits = useMemo(() => {
    return UNITS_DATA.filter((unit) => {
      if (selectedTowerFilter !== 'All' && unit.tower !== selectedTowerFilter) {
        return false;
      }
      if (selectedBedroom !== 'all') {
        if (selectedBedroom === 0 && unit.bedrooms !== 0) return false;
        if (selectedBedroom === 4 && unit.bedrooms < 4) return false;
        if (selectedBedroom > 0 && selectedBedroom < 4 && unit.bedrooms !== selectedBedroom) return false;
      }
      return true;
    });
  }, [selectedTowerFilter, selectedBedroom]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenDetailModal = (unit: Unit) => {
    setActiveModalUnit(unit);
    setActiveModalTab('floorplan');
  };

  // Compass degrees calculator for the visual compass dial
  const getCompassRotation = (heading?: string) => {
    switch (heading) {
      case 'North': return 0;
      case 'North-East': return 45;
      case 'East': return 90;
      case 'South-East': return 135;
      case 'South': return 180;
      case 'South-West': return 225;
      case 'West': return 270;
      case 'North-West': return 315;
      default: return 0;
    }
  };

  return (
    <section id="units" className="py-24 max-w-7xl mx-auto px-6 relative">
      <div id="towers" className="absolute -top-24 left-0" />

      {/* ================================================= */}
      {/* 1. THE TWIN TOWERS ARCHITECTURAL SHOWCASE */}
      {/* ================================================= */}
      <div className="mb-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-[#9A7B1C] font-mono font-bold mb-3">
            Architectural Mastery
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#0F172A] mb-5 [text-wrap:balance]">
            The Twin Towers
          </h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            Kemewahan terbagi ke dalam dua mahakarya arsitektur yang dirancang untuk dua profil gaya hidup yang berbeda: dinamisme modern urban dan puncak privasi ultra-luxury.
          </p>

          {/* Tab Filter Controls: Tombol Tower Arunika & Tower Baskara */}
          <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-300 shadow-sm mt-8">
            <button
              type="button"
              onClick={() => {
                setActiveTowerTab('Arunika');
                onSelectTowerFilter('Arunika');
              }}
              className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeTowerTab === 'Arunika'
                  ? 'bg-[#9A7B1C] text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Tower Arunika
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTowerTab('Baskara');
                onSelectTowerFilter('Baskara');
              }}
              className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeTowerTab === 'Baskara'
                  ? 'bg-[#9A7B1C] text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Tower Baskara
            </button>
          </div>
        </div>

        {/* Active Tower Card */}
        <div className="max-w-3xl mx-auto">
          
          {/* Tower Arunika Card */}
          {activeTowerTab === 'Arunika' && (
            <div className="bg-white border-2 border-slate-300 hover:border-[#9A7B1C] shadow-lg transition-all duration-300 flex flex-col justify-between group">
              {/* Visual Header */}
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img
                  src={arunikaImg}
                  alt="Tower Arunika Modern Luxury Skyscraper"
                  onError={(e) => {
                    e.currentTarget.src = '/images/tower_arunika_facade_1792311582736.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white font-mono font-bold drop-shadow">Modern Luxury</span>
                  <span className="text-xs uppercase tracking-wider text-amber-300 bg-black/80 px-2.5 py-1 font-mono border border-amber-400/50 font-bold">Lantai 7 - 35</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#0F172A] mb-1.5 font-bold">
                    Tower Arunika
                  </h3>
                  <div className="text-xs tracking-wider uppercase text-[#9A7B1C] mb-4 font-mono font-bold">
                    The Pinnacle of Modern Living
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-6">
                    Hunian modern vertikal di Lantai 7–35 dengan fasilitas terpadu, teknologi smart home terintegrasi, dan pilihan unit lengkap mulai dari Studio hingga Penthouse.
                  </p>

                  {/* Feature checklist */}
                  <div className="space-y-3 mb-8 text-xs text-slate-700">
                    <div className="flex items-start gap-3">
                      <Cpu size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Integrated Smart Home:</strong> Kontrol AC, lampu, dan tirai otomatis via smartphone.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Key size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Triple-Guard Access:</strong> Smart Door Lock dengan biometrik, PIN, dan RFID card.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Layanan Komprehensif:</strong> Commercial Arcade, Business Pods, & The Baswara Lounge.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Layout Satu Lantai (Lt. 7-33):</strong> Unit Studio Executive, 1 Bedroom, 2 Bedrooms, & 3 Bedrooms hadir dalam satu lantai.</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-mono">Mulai dari</span>
                    <span className="font-serif text-[#855D00] text-xl font-bold tabular-nums">Rp5.500.000</span>
                    <span className="text-xs text-slate-500"> / bulan</span>
                  </div>
                  <a
                    href="#units-collection"
                    onClick={() => onSelectTowerFilter('Arunika')}
                    className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-[#9A7B1C] hover:bg-[#806411] text-white shadow-md transition-all cursor-pointer"
                  >
                    Lihat Unit Arunika
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tower Baskara Card */}
          {activeTowerTab === 'Baskara' && (
            <div className="bg-white border-2 border-[#9A7B1C]/40 hover:border-[#9A7B1C] shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
              <div className="absolute top-4 right-4 z-10 bg-[#9A7B1C] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-mono shadow-md">
                Ultra-Luxury
              </div>

              {/* Visual Header */}
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img
                  src={baskaraImg}
                  alt="Tower Baskara Ultra Luxury Skyscraper"
                  onError={(e) => {
                    e.currentTarget.src = '/images/tower_baskara_facade_1792311582650.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white font-mono font-bold drop-shadow">Ultra-Privacy Sanctuary</span>
                  <span className="text-xs uppercase tracking-wider text-amber-300 bg-black/80 px-2.5 py-1 font-mono border border-amber-400/50 font-bold">Lantai 7 - 32</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#0F172A] mb-1.5 font-bold">
                    Tower Baskara
                  </h3>
                  <div className="text-xs tracking-wider uppercase text-[#9A7B1C] mb-4 font-mono font-bold">
                    The Apex of Ultra-Luxury & Privacy
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-6">
                    Sanctuary privat ultra-luxury di Lantai 7–32 dengan The Sovereign Foyer tertutup, akses lift pribadi langsung ke unit, dan layanan Personal Butler 24 jam.
                  </p>

                  {/* Feature checklist */}
                  <div className="space-y-3 mb-8 text-xs text-slate-700">
                    <div className="flex items-start gap-3">
                      <Shield size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Sovereign Foyer:</strong> Privasi absolut tanpa lobi publik, penyambutan langsung Personal Butler.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Eye size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Lift Pribadi & Retina Scan:</strong> Akses private elevator langsung ke unit dan landasan VVIP Helipad.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Car size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Baskara Vault & Clubs:</strong> Showroom supercar parking, Onsen privat, Chef Table & Cigar Lounge.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles size={16} className="text-[#9A7B1C] shrink-0 mt-0.5" />
                      <span><strong>Eksklusivitas Ruang:</strong> Pilihan tipe The Emerald, The Sapphire Duplex, dan The Diamond Sky Villa.</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-mono">Mulai dari</span>
                    <span className="font-serif text-[#855D00] text-xl font-bold tabular-nums">Rp65.000.000</span>
                    <span className="text-xs text-slate-500"> / bulan</span>
                  </div>
                  <a
                    href="#units-collection"
                    onClick={() => onSelectTowerFilter('Baskara')}
                    className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-[#9A7B1C] hover:bg-[#806411] text-white shadow-md transition-all cursor-pointer"
                  >
                    Lihat Unit Baskara
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================================================= */}
      {/* 2. THE UNITS COLLECTION & INTERACTIVE EXPLORER */}
      {/* ================================================= */}
      {/* Section Sub-Header & Filters */}
      <div id="units-collection" className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-[#9A7B1C]/30 pb-6 gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#9A7B1C] font-mono font-bold mb-2">
            Curated Living Spaces
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#0F172A] font-bold">
            The Units Collection
          </h3>
          <p className="text-slate-700 text-xs sm:text-sm mt-1 max-w-xl">
            Pilihan unit mewah mulai dari Studio Executive hingga Sky Villa 380 m² dengan denah presisi dan analisis orientasi cahaya surya.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 md:mt-0 flex flex-wrap items-center gap-3">
          
          {/* Tower Segmented Filter */}
          <div className="inline-flex p-1 bg-slate-100 border border-slate-300 shadow-sm">
            <button
              onClick={() => onSelectTowerFilter('All')}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedTowerFilter === 'All' ? 'bg-[#9A7B1C] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Semua Tower
            </button>
            <button
              onClick={() => onSelectTowerFilter('Arunika')}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedTowerFilter === 'Arunika' ? 'bg-[#9A7B1C] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Arunika
            </button>
            <button
              onClick={() => onSelectTowerFilter('Baskara')}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedTowerFilter === 'Baskara' ? 'bg-[#9A7B1C] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Baskara
            </button>
          </div>

          {/* Bedroom Filter */}
          <div className="inline-flex p-1 bg-slate-100 border border-slate-300 shadow-sm">
            <button
              onClick={() => setSelectedBedroom('all')}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedBedroom === 'all' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Semua Kamar
            </button>
            <button
              onClick={() => setSelectedBedroom(0)}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedBedroom === 0 ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => setSelectedBedroom(1)}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedBedroom === 1 ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              1 BR
            </button>
            <button
              onClick={() => setSelectedBedroom(2)}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedBedroom === 2 ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              2 BR
            </button>
            <button
              onClick={() => setSelectedBedroom(3)}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedBedroom === 3 ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              3 BR
            </button>
            <button
              onClick={() => setSelectedBedroom(4)}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedBedroom === 4 ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              4+ BR / Penthouse
            </button>
          </div>

        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => {
          const isBaskara = unit.tower === 'Baskara';

          return (
            <div
              key={unit.id}
              className={`bg-white border-2 ${
                isBaskara ? 'border-[#9A7B1C]/50' : 'border-slate-300'
              } hover:border-[#9A7B1C] hover:shadow-xl shadow-md transition-all duration-300 p-6 flex flex-col justify-between group relative`}
            >
              {/* Subtle Tower Badge */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className={`font-mono tracking-wider font-bold ${isBaskara ? 'text-[#855D00]' : 'text-slate-600'}`}>
                  Tower {unit.tower}
                </span>
                {isBaskara && (
                  <span className="text-[10px] font-mono uppercase bg-amber-100 text-[#855D00] font-bold px-2 py-0.5 border border-amber-300">
                    VVIP
                  </span>
                )}
              </div>

              {/* Title & Specs */}
              <div>
                <h3 className="text-xl font-serif text-[#0F172A] group-hover:text-[#9A7B1C] font-bold transition-colors mb-3">
                  {unit.name}
                </h3>
                
                {/* Clean unboxed metadata with dot separators */}
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-5 font-mono">
                  <span className="text-slate-900 font-bold">{unit.sizeM2} m²</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>{unit.capacity}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>{unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Kamar`}</span>
                </div>

                {/* Key feature list */}
                <div className="space-y-2 mb-6 border-t border-slate-200 pt-4">
                  {unit.highlights.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-[#9A7B1C] text-xs font-bold">✦</span>
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-slate-200">
                <div className="mb-4">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Harga Sewa</span>
                  <div className="font-serif text-[#855D00] text-2xl font-bold tabular-nums">
                    {formatRupiah(unit.pricePerMonth)}
                    <span className="text-xs text-slate-500 font-sans font-normal"> / bulan</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenCalculator(unit)}
                    className="py-2.5 px-2 text-[11px] tracking-wider uppercase border-2 border-[#9A7B1C] text-[#855D00] bg-white hover:bg-[#9A7B1C] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold shadow-sm"
                  >
                    <Calculator size={13} />
                    <span>Hitung Biaya</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetailModal(unit)}
                    className="py-2.5 px-2 text-[11px] tracking-wider uppercase bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold shadow-sm"
                  >
                    <Maximize2 size={13} />
                    <span>Detail Unit</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comprehensive Unit Detail Modal with Floor Plan & Orientation Analysis */}
      {activeModalUnit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white border-2 border-[#9A7B1C] max-w-4xl w-full p-6 sm:p-8 relative my-6 sm:my-10 shadow-2xl max-h-[92vh] overflow-y-auto text-slate-900">
            <button
              onClick={() => setActiveModalUnit(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 text-xl font-bold z-20 cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-xs text-[#9A7B1C] uppercase tracking-widest font-mono font-bold mb-1">
              Spesifikasi & Denah Arsitektural · Tower {activeModalUnit.tower}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
              <h3 className="text-2xl sm:text-3xl font-serif text-[#0F172A] font-bold">
                {activeModalUnit.name}
              </h3>
              <div className="font-serif text-[#855D00] text-2xl font-bold">
                {formatRupiah(activeModalUnit.pricePerMonth)}
                <span className="text-xs text-slate-500 font-sans font-normal"> / bulan</span>
              </div>
            </div>

            {/* Modal Navigation Tabs: Floor Plan / Orientation / Features */}
            <div className="flex border-b border-slate-200 mb-6 gap-2">
              <button
                onClick={() => setActiveModalTab('floorplan')}
                className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeModalTab === 'floorplan'
                    ? 'border-[#9A7B1C] text-[#855D00] font-bold bg-[#FAF8F5]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={14} />
                <span>Denah Lantai (Floor Plan)</span>
              </button>

              <button
                onClick={() => setActiveModalTab('orientation')}
                className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeModalTab === 'orientation'
                    ? 'border-[#9A7B1C] text-[#855D00] font-bold bg-[#FAF8F5]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass size={14} />
                <span>Arah Mata Angin & Cahaya</span>
              </button>

              <button
                onClick={() => setActiveModalTab('features')}
                className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeModalTab === 'features'
                    ? 'border-[#9A7B1C] text-[#855D00] font-bold bg-[#FAF8F5]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={14} />
                <span>Spesifikasi & Fasilitas</span>
              </button>
            </div>

            {/* TAB 1: FLOOR PLAN (DENAH ARSITEKTUR) */}
            {activeModalTab === 'floorplan' && (
              <div className="space-y-6">
                {activeModalUnit.availableOrientations && activeModalUnit.availableOrientations.length > 1 && (
                  <div className="p-3 bg-[#FAF8F5] border border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px] font-bold">
                      <Compass size={13} className="text-[#9A7B1C]" />
                      <span>Arah Hadap Denah:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalUnit.availableOrientations.map((ori) => {
                        const isSelected = activeModalUnit.orientation === ori.heading;
                        return (
                          <button
                            key={ori.heading}
                            onClick={() => {
                              setActiveModalUnit({
                                ...activeModalUnit,
                                orientation: ori.heading,
                                orientationAnalysis: ori,
                              });
                            }}
                            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#9A7B1C] text-white font-bold shadow-sm'
                                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                            }`}
                          >
                            {ori.heading}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <UnitFloorPlanVisualizer unit={activeModalUnit} />
              </div>
            )}

            {/* TAB 2: EXCLUSIVE ORIENTATION & LIGHTING ANALYSIS */}
            {activeModalTab === 'orientation' && (
              <div className="space-y-6">
                {/* Orientation Selector for Units with Multiple Orientations */}
                {activeModalUnit.availableOrientations && activeModalUnit.availableOrientations.length > 1 && (
                  <div className="p-4 bg-[#FAF8F5] border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Compass size={16} className="text-[#9A7B1C]" />
                      <span className="text-xs font-mono uppercase text-[#0F172A] font-bold tracking-wider">
                        Pilihan Arah Menara:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeModalUnit.availableOrientations.map((ori) => {
                        const isSelected = activeModalUnit.orientation === ori.heading;
                        return (
                          <button
                            key={ori.heading}
                            onClick={() => {
                              setActiveModalUnit({
                                ...activeModalUnit,
                                orientation: ori.heading,
                                orientationAnalysis: ori,
                              });
                            }}
                            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#9A7B1C] text-white font-bold shadow-sm'
                                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-[#9A7B1C]'
                            }`}
                          >
                            {ori.cardinalLabelId.split('·')[0].trim()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeModalUnit.orientationAnalysis ? (
                  <div className="space-y-6">
                    {/* Visual Compass & Heading Header */}
                    <div className="p-5 bg-[#FAF8F5] border border-[#9A7B1C]/40 flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Interactive Visual Compass Graphic */}
                      <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full border-2 border-dashed border-[#9A7B1C] flex items-center justify-center relative bg-white shadow-inner">
                          {/* Compass Rose Points */}
                          <span className="absolute top-1 text-[10px] font-mono text-[#855D00] font-bold">N</span>
                          <span className="absolute bottom-1 text-[10px] font-mono text-slate-500 font-bold">S</span>
                          <span className="absolute left-1.5 text-[10px] font-mono text-slate-500 font-bold">W</span>
                          <span className="absolute right-1.5 text-[10px] font-mono text-slate-500 font-bold">E</span>
                          
                          {/* Inner dial */}
                          <div className="w-20 h-20 rounded-full border border-slate-300 flex items-center justify-center relative bg-amber-50/40">
                            {/* Needle pointing to active degrees */}
                            <div
                              className="absolute w-1.5 h-14 transition-transform duration-700 ease-out origin-center"
                              style={{
                                transform: `rotate(${activeModalUnit.orientationAnalysis.degrees}deg)`
                              }}
                            >
                              <div className="w-full h-1/2 bg-[#9A7B1C] rounded-t-full shadow-md" />
                              <div className="w-full h-1/2 bg-slate-400 rounded-b-full" />
                            </div>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#9A7B1C] z-10 border-2 border-white shadow-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Direction Details */}
                      <div className="space-y-2 text-center md:text-left">
                        <div className="text-[11px] font-mono uppercase text-[#855D00] font-bold tracking-wider">
                          Orientasi Hadap Menara
                        </div>
                        <h4 className="text-xl sm:text-2xl font-serif text-[#0F172A] font-bold">
                          {activeModalUnit.orientationAnalysis.cardinalLabelId}
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
                          {activeModalUnit.orientationAnalysis.ambientDescription}
                        </p>
                      </div>

                    </div>

                    {/* Detailed Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sunlight Card */}
                      <div className="p-4 bg-[#FAF8F5] border border-slate-300 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#0F172A] font-bold">
                          <Sun size={15} className="text-[#9A7B1C]" />
                          <span>Profil Pencahayaan & Suhu Alami:</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {activeModalUnit.orientationAnalysis.sunlightProfile}
                        </p>
                      </div>

                      {/* View & Landmarks Card */}
                      <div className="p-4 bg-[#FAF8F5] border border-slate-300 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#0F172A] font-bold">
                          <Eye size={15} className="text-[#9A7B1C]" />
                          <span>Pemandangan & Landmark Terlihat:</span>
                        </div>
                        <ul className="space-y-1.5">
                          {activeModalUnit.orientationAnalysis.viewLandmarks.map((lm, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                              <span className="text-[#9A7B1C] text-[10px] font-bold">✦</span>
                              <span>{lm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-6 bg-[#FAF8F5] border border-slate-300 text-center text-xs text-slate-600">
                    Orientasi mata angin terpadu dengan sirkulasi cahaya silang modern.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FEATURES & AMENITIES */}
            {activeModalTab === 'features' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeModalUnit.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 p-3 bg-[#FAF8F5] border border-slate-200 shadow-sm">
                      <span className="text-[#9A7B1C] mt-0.5 font-bold">✦</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 mt-6">
              <button
                onClick={() => {
                  const unit = activeModalUnit;
                  setActiveModalUnit(null);
                  onOpenCalculator(unit);
                }}
                className="flex-1 py-3 text-xs uppercase tracking-widest font-bold border-2 border-[#9A7B1C] text-[#855D00] bg-white hover:bg-[#9A7B1C] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Calculator size={14} />
                <span>Kalkulasi Biaya & Deposit</span>
              </button>
              
              <button
                onClick={() => {
                  const unit = activeModalUnit;
                  setActiveModalUnit(null);
                  onOpenViewingModal(unit);
                }}
                className="flex-1 py-3 text-xs uppercase tracking-widest font-bold bg-[#9A7B1C] hover:bg-[#806411] text-white transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={14} />
                <span>Isi Formulir Penyewaan Unit</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
