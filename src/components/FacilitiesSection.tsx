import React, { useState } from 'react';
import { FACILITIES_DATA, FacilityLevel } from '../data/facilities';
import { Sparkles, Shield, Clock, Compass, ChevronRight, Eye } from 'lucide-react';

export const FacilitiesSection: React.FC = () => {
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

  return (
    <section id="facilities" className="py-24 max-w-7xl mx-auto px-6">
      
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#D4AF37]/20 pb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono mb-2">
            The Pinnacle of Vertical Amenities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB]">
            World-Class Facilities
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xl">
            Setiap lantai dirancang dengan fungsi presisi. Pilih dan tap fasilitas di bawah untuk melihat visualisasi dan spesifikasi mendalam dari setiap zona.
          </p>
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
      {/* Matches CSS Selector 1: section#facilities > div:nth-of-type(2) > div:nth-of-type(1) > img:nth-of-type(1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
        
        {/* Left: Dynamic Visual Hero */}
        <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden bg-[#111827] border border-[#D4AF37]/35 flex flex-col justify-end group">
          <img
            key={currentImage}
            src={currentImage}
            alt={currentFacility.name}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1600&q=80';
            }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1 bg-[#0B0F19]/90 border border-[#D4AF37]/60 text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider backdrop-blur-sm">
              {currentFacility.level} · {currentFacility.tagline}
            </span>
            <span className="px-2.5 py-1 bg-[#0B0F19]/80 border border-slate-700 text-[10px] font-mono text-slate-300 backdrop-blur-sm flex items-center gap-1.5">
              <Eye size={12} className="text-[#D4AF37]" />
              <span>Visualisasi Resmi</span>
            </span>
          </div>

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
            <div className="flex items-center justify-between text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-2">
              <span className="px-2 py-0.5 bg-[#0B0F19] border border-[#D4AF37]/40">
                {currentFacility.level}
              </span>
              <span>Tower {currentFacility.tower}</span>
            </div>
            
            <h3 className="text-2xl font-serif text-[#F3E5AB] mb-3">
              {currentFacility.name}
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              {currentFacility.description}
            </p>

            {/* Sub-facilities list */}
            {currentFacility.subFacilities && currentFacility.subFacilities.length > 0 ? (
              <div className="space-y-3 mb-6">
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-mono block">
                  Komponen & Ruang Fasilitas:
                </span>
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
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-mono block">
                  Fasilitas Unggulan:
                </span>
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

      {/* Interactive Level Carousel / Grid */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-[#D4AF37] flex items-center gap-2">
          <span>Pilih Lantai Fasilitas (Tap untuk beralih visual):</span>
        </div>

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
                <div className="text-[11px] font-mono uppercase text-[#D4AF37] mb-1 font-bold flex items-center justify-between">
                  <span>{fac.level}</span>
                  {isActive && <span className="text-[10px]">AKTIF</span>}
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-2 leading-tight">
                  {fac.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
};
