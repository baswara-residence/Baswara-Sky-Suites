import React, { useState } from 'react';
import { FACILITIES_DATA } from '../data/facilities';
import {
  Sparkles,
  Shield,
  Clock,
  PhoneCall,
  FileText,
  Key,
  ArrowRight,
  CheckCircle,
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
      step: 'Tahap 1',
      title: 'Pendaftaran & Inquiry',
      desc: 'Pengisian formulir online atau hubungi perwakilan resmi via DM X (@the_BASWARA).',
      icon: PhoneCall,
    },
    {
      step: 'Tahap 2',
      title: 'Pengisian Formulir',
      desc: 'Melengkapi profil penghuni, identitas, unit pilihan, kontak darurat, serta menyetujui tata tertib gedung dan komitmen privasi residensial.',
      icon: FileText,
    },
    {
      step: 'Tahap 3',
      title: 'Pembayaran & Deposit',
      desc: 'Penyelesaian security deposit (3 bulan), sewa bulan pertama, dan service charge melalui jalur resmi penagihan manajemen.',
      icon: Shield,
    },
    {
      step: 'Tahap 4',
      title: 'Handover & Aktivasi',
      desc: 'Penyerahan Smart Key, perekaman biometrik (Face Recognition), inspeksi unit, serta pendampingan oleh tim Butler.',
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#D4AF37]/20 pb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB]">
              World-Class Facilities
            </h2>
          </div>

          {/* Tower Selector */}
          <div className="mt-6 md:mt-0 inline-flex p-1 bg-[#111827] border border-[#D4AF37]/20">
            <button
              onClick={() => {
                setSelectedTower('Baskara');
                setActiveFacilityIndex(4);
                setActiveGalleryIndex(0);
              }}
              className={`px-5 py-2 text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer ${
                selectedTower === 'Baskara' ? 'bg-[#D4AF37] text-[#0B0F19]' : 'text-slate-400 hover:text-white'
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
              className={`px-5 py-2 text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer ${
                selectedTower === 'Arunika' ? 'bg-[#D4AF37] text-[#0B0F19]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Arunika Facilities
            </button>
          </div>
        </div>

        {/* Hero Spotlight Image & Facility Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
          
          {/* Left: Dynamic Visual Hero */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden bg-[#111827] border border-[#D4AF37]/35 flex flex-col justify-end group">
            <img
              key={currentImage}
              src={currentImage}
              alt={currentFacility.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />


            {/* Bottom caption */}
            <div className="relative z-10 p-6 sm:p-8 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono mb-1">
                  Tower {currentFacility.tower} · {currentFacility.level}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-white font-medium drop-shadow-md">
                  {currentFacility.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Right: Selected Facility Information Card */}
          <div className="lg:col-span-5 bg-[#111827] border border-[#D4AF37]/30 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Sub-facilities list */}
              {currentFacility.subFacilities && currentFacility.subFacilities.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {currentFacility.subFacilities.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-[#0B0F19] border border-slate-800/90 hover:border-[#D4AF37]/40 transition-colors"
                    >
                      <div className="text-xs font-medium text-[#F3E5AB] mb-1 flex items-center gap-1.5">
                        <span className="text-[#D4AF37]">✦</span>
                        <span>{sub.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  {currentFacility.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <span className="text-[#D4AF37] text-xs mt-0.5">✦</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access & Hours Strip */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Shield size={12} className="text-[#D4AF37]" />
                  <span>Protokol Akses:</span>
                </div>
                <span className="text-[#D4AF37] font-mono text-[11px] font-medium">
                  {currentFacility.accessBadge}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={12} className="text-[#D4AF37]" />
                  <span>Jam Operasional:</span>
                </div>
                <span className="text-slate-300 font-mono text-[11px]">
                  {currentFacility.operationalHours}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive Level Buttons */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {facilities.map((fac, idx) => {
              const isActive = idx === activeFacilityIndex;
              return (
                <button
                  key={fac.id || idx}
                  onClick={() => handleSelectFacility(idx)}
                  className={`p-3.5 text-left border transition-all cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]/40'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-[#D4AF37]" />
                  )}
                  <div className="text-[11px] font-mono uppercase text-[#D4AF37] mb-1 font-bold">
                    <span>{fac.level}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-2 leading-tight">
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
      <div id="services" className="pt-8 border-t border-[#D4AF37]/20">
        
        {/* Sub-Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono mb-3">
            Integrity & Governance
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB] mb-6 [text-wrap:balance]">
            Tata Cara Penyewaan & Layanan Premium
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            Komitmen kami terhadap eksklusivitas dan privasi tercermin dalam 4 langkah terstruktur penyewaan serta verifikasi profil penghuni di Baswara Sky Suites.
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((st, idx) => {
            const IconComponent = st.icon;
            return (
              <div
                key={idx}
                className="bg-[#111827] border border-slate-800 hover:border-[#D4AF37]/50 p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] bg-[#0B0F19] px-2.5 py-1 border border-[#D4AF37]/30">
                      {st.step}
                    </span>
                    <IconComponent size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  </div>

                  <h3 className="text-lg font-serif text-white mb-2 group-hover:text-[#F3E5AB] transition-colors">
                    {st.title}
                  </h3>

                  <p className="text-slate-300 text-xs leading-relaxed font-light">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Governance Protocols */}
        <div className="bg-[#111827] border border-[#D4AF37]/30 p-8 sm:p-10 shadow-2xl mb-12">
          <div className="max-w-3xl mb-8">
            <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB] mb-3">
              Protokol Keamanan & Layanan Residensial
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Standar operasional ketat untuk memastikan ketenteraman dan privasi tanpa kompromi bagi seluruh penghuni.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {protocols.map((proto, pIdx) => (
              <div
                key={pIdx}
                className="p-5 bg-[#0B0F19] border border-slate-800 hover:border-[#D4AF37]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-serif text-white mb-2 font-medium">
                    {proto.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed font-light">
                    {proto.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 text-center sm:text-left">
              Siap memulai tahapan reservasi unit Anda? Tim Leasing & Marketing kami siap memfasilitasi formulir pendaftaran.
            </span>
            <button
              onClick={onOpenViewingModal}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shrink-0"
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
