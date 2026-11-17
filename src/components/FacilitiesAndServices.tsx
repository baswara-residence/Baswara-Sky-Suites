import React, { useState } from 'react';
import { FACILITIES_DATA } from '../data/facilities';
import {
  Shield,
  Clock,
  PhoneCall,
  FileText,
  Key,
  ArrowRight,
} from 'lucide-react';

interface FacilitiesAndServicesProps {
  onOpenViewingModal: () => void;
}

export const FacilitiesAndServices: React.FC<FacilitiesAndServicesProps> = ({
  onOpenViewingModal,
}) => {
  const [selectedTower, setSelectedTower] = useState<'Baskara' | 'Arunika'>('Baskara');
  const [activeFacilityIndex, setActiveFacilityIndex] = useState<number>(4); // Default to Altitude Sanctuary / Sky Deck
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  const facilities = FACILITIES_DATA.filter((f) => f.tower === selectedTower);
  const currentFacility = facilities[activeFacilityIndex] || facilities[0];

  const currentImage =
    currentFacility?.gallery?.[activeGalleryIndex]?.image ||
    currentFacility?.image ||
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1600&q=80';

  const handleSelectFacility = (idx: number) => {
    setActiveFacilityIndex(idx);
    setActiveGalleryIndex(0);
  };

  const steps = [
    {
      step: '01',
      title: 'Pendaftaran & Inquiry',
      desc: 'Pengisian formulir online atau hubungi perwakilan resmi via akun X resmi (@the_BASWARA).',
      icon: PhoneCall,
    },
    {
      step: '02',
      title: 'Verifikasi & Formulir',
      desc: 'Melengkapi profil penghuni, identitas, unit pilihan, kontak darurat, serta menandatangani komitmen privasi.',
      icon: FileText,
    },
    {
      step: '03',
      title: 'Pembayaran & Escrow',
      desc: 'Penyelesaian sewa pokok dan security deposit (2 bulan refundable) ke rekening resmi Bank Chobank PT Baswara Mangkubumi Residence.',
      icon: Shield,
    },
    {
      step: '04',
      title: 'Handover & Aktivasi',
      desc: 'Penyerahan Smart Key, perekaman biometrik (Face Recognition), inspeksi unit, serta pendampingan butler.',
      icon: Key,
    },
  ];

  const protocols = [
    {
      title: 'Proteksi Privasi & Akses Tertutup VVIP',
      desc: 'Sistem pengamanan biometrik 3D, Face Recognition, serta pengawasan CCTV inframerah terpadu 24 jam.',
      badge: 'Keamanan Tingkat Tinggi',
    },
    {
      title: 'Dedicated Concierge & Butler Service',
      desc: 'Layanan asistensi personal 24 jam untuk reservasi fasilitas, penerimaan paket steril, hingga perjamuan privat.',
      badge: 'Layanan Bintang Lima',
    },
    {
      title: 'Pemeliharaan Utilitas & Smart Home Cepat',
      desc: 'Tim rekayasa teknis siaga merespons kendala Smart Home System dan pendingin udara dalam hitungan menit.',
      badge: 'Maintenance 24/7',
    },
  ];

  return (
    <section id="facilities" className="py-24 max-w-7xl mx-auto px-6 relative">
      
      {/* ================================================= */}
      {/* 1. WORLD-CLASS FACILITIES FLOOR BY FLOOR */}
      {/* ================================================= */}
      <div className="mb-24">
        {/* Editorial Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#855D00]/25 pb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#855D00] font-mono font-bold mb-2">
              Unrivaled Amenities
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#0F172A] font-bold">
              World-Class Facilities
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Fasilitas eksklusif di setiap lantai mulai dari lobby privat, sky pool, hingga helipad rooftop.
            </p>
          </div>

          {/* Tower Selector */}
          <div className="mt-4 md:mt-0 inline-flex p-1 bg-slate-100 border border-slate-300 shadow-sm">
            <button
              onClick={() => {
                setSelectedTower('Baskara');
                setActiveFacilityIndex(4);
                setActiveGalleryIndex(0);
              }}
              className={`px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedTower === 'Baskara' ? 'bg-[#855D00] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Baskara Exclusives (VVIP)
            </button>
            <button
              onClick={() => {
                setSelectedTower('Arunika');
                setActiveFacilityIndex(4);
                setActiveGalleryIndex(0);
              }}
              className={`px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedTower === 'Arunika' ? 'bg-[#855D00] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-white'
              }`}
            >
              Arunika Facilities
            </button>
          </div>
        </div>

        {/* Hero Spotlight Image & Facility Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
          
          {/* Left: Dynamic Visual Hero with High-Contrast Scrim */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden bg-slate-900 border-2 border-slate-300 shadow-xl flex flex-col justify-end group">
            <img
              key={currentImage}
              src={currentImage}
              alt={currentFacility.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Scrim designed for clear photo legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

            {/* Bottom caption with guaranteed white text over measured scrim */}
            <div className="relative z-10 p-6 sm:p-8 space-y-2 text-white">
              <div className="text-xs uppercase tracking-widest text-[#F3E5AB] font-mono font-bold">
                Tower {currentFacility.tower} · {currentFacility.level}
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif text-white font-bold drop-shadow-md">
                {currentFacility.name}
              </h3>
            </div>
          </div>

          {/* Right: Selected Facility Information Card */}
          <div className="lg:col-span-5 bg-white border-2 border-slate-300 shadow-md p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#855D00] font-mono font-bold mb-3">
                Fitur & Spesifikasi Fasilitas
              </div>

              {/* Sub-facilities list */}
              {currentFacility.subFacilities && currentFacility.subFacilities.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {currentFacility.subFacilities.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] hover:border-[#855D00] transition-colors shadow-xs"
                    >
                      <div className="text-xs font-bold text-[#0F172A] mb-1 flex items-center gap-1.5">
                        <span className="text-[#855D00]">✦</span>
                        <span>{sub.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5 mb-6">
                  {currentFacility.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="text-[#855D00] text-xs mt-0.5">✦</span>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access & Hours Strip */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-[#855D00]" />
                  <span className="font-medium">Protokol Akses:</span>
                </div>
                <span className="text-[#855D00] font-mono text-[11px] font-bold">
                  {currentFacility.accessBadge}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#855D00]" />
                  <span className="font-medium">Jam Operasional:</span>
                </div>
                <span className="text-slate-800 font-mono text-[11px] font-bold">
                  {currentFacility.operationalHours}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive Level Buttons (Crisp Architectural Cards) */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {facilities.map((fac, idx) => {
              const isActive = idx === activeFacilityIndex;
              return (
                <button
                  key={fac.id || idx}
                  onClick={() => handleSelectFacility(idx)}
                  className={`p-3.5 text-left border-2 transition-all cursor-pointer relative overflow-hidden group shadow-xs ${
                    isActive
                      ? 'bg-[#FAF7F2] border-[#855D00] shadow-md ring-1 ring-[#855D00]'
                      : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#855D00]" />
                  )}
                  <div className={`text-[11px] font-mono uppercase mb-1 font-bold ${
                    isActive ? 'text-[#855D00]' : 'text-slate-500'
                  }`}>
                    <span>{fac.level}</span>
                  </div>
                  <div className={`text-xs font-bold line-clamp-2 leading-tight ${
                    isActive ? 'text-[#0F172A]' : 'text-slate-700'
                  }`}>
                    {fac.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 2. SERVICES & RENTAL KYC WORKFLOW */}
      {/* ================================================= */}
      <div id="services" className="pt-8 border-t border-[#855D00]/25">
        
        {/* Sub-Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-[#855D00] font-mono font-bold mb-3">
            Integrity & Governance
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#0F172A] font-bold mb-4 [text-wrap:balance]">
            Tata Cara Penyewaan & Layanan Premium
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            Komitmen kami terhadap eksklusivitas dan kenyamanan tercermin dalam 4 langkah terstruktur penyewaan serta verifikasi profil penghuni di Baswara Sky Suites.
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((st, idx) => {
            const IconComponent = st.icon;
            return (
              <div
                key={idx}
                className="bg-white border-2 border-slate-300 hover:border-[#855D00] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#855D00] bg-[#FAF7F2] px-2.5 py-1 border border-[#855D00]/40">
                      Tahap {st.step}
                    </span>
                    <IconComponent size={20} className="text-[#855D00] group-hover:scale-110 transition-transform" />
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#0F172A] mb-2 group-hover:text-[#855D00] transition-colors">
                    {st.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Governance Protocols */}
        <div className="bg-white border-2 border-slate-300 p-8 sm:p-10 shadow-lg mb-12">
          <div className="max-w-3xl mb-8">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] mb-2">
              Protokol Keamanan & Layanan Residensial
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              Standar operasional ketat untuk memastikan ketenteraman dan privasi tanpa kompromi bagi seluruh penghuni.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {protocols.map((proto, pIdx) => (
              <div
                key={pIdx}
                className="p-5 bg-[#FAF7F2] border border-[#E5DFD3] hover:border-[#855D00] transition-colors flex flex-col justify-between shadow-xs"
              >
                <div>
                  <h4 className="text-base font-serif font-bold text-[#0F172A] mb-2">
                    {proto.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    {proto.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-600 text-center sm:text-left">
              Siap memulai tahapan reservasi unit Anda? Tim Leasing & Marketing kami siap memfasilitasi formulir pendaftaran.
            </span>
            <button
              onClick={onOpenViewingModal}
              className="px-6 py-3 bg-[#855D00] hover:bg-[#704D00] text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
            >
              <span>Isi Formulir Penyewaan</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};
