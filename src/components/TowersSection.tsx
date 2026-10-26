import React, { useState } from 'react';
import { Shield, Sparkles, Key, Cpu, Eye, Compass, Car, Users } from 'lucide-react';
import arunikaImg from '@/src/assets/images/tower_arunika_facade_1792311582736.jpg';
import baskaraImg from '@/src/assets/images/tower_baskara_facade_1792311582650.jpg';

interface TowersSectionProps {
  onSelectTower: (tower: 'Arunika' | 'Baskara') => void;
}

export const TowersSection: React.FC<TowersSectionProps> = ({ onSelectTower }) => {
  const [activeTab, setActiveTab] = useState<'Arunika' | 'Baskara'>('Arunika');

  return (
    <section id="towers" className="py-24 max-w-7xl mx-auto px-6">
      
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono mb-3">
          Architectural Mastery
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB] mb-6 [text-wrap:balance]">
          The Twin Towers
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
          Kemewahan terbagi ke dalam dua mahakarya arsitektur yang dirancang untuk dua profil gaya hidup yang berbeda: dinamisme modern urban dan puncak privasi ultra-luxury.
        </p>

        {/* Tab Filter Controls */}
        <div className="inline-flex items-center p-1 bg-[#111827] border border-[#D4AF37]/20 mt-8">
          <button
            onClick={() => setActiveTab('Arunika')}
            className={`px-6 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'Arunika' ? 'bg-[#D4AF37] text-[#0B0F19]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tower Arunika
          </button>
          <button
            onClick={() => setActiveTab('Baskara')}
            className={`px-6 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'Baskara' ? 'bg-[#D4AF37] text-[#0B0F19]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tower Baskara
          </button>
        </div>
      </div>

      {/* Active Tower Card */}
      <div className="max-w-3xl mx-auto">
        
        {/* Tower Arunika Card */}
        {activeTab === 'Arunika' && (
          <div className="bg-[#111827] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between group">
            
            {/* Visual Header */}
            <div className="relative h-72 sm:h-80 overflow-hidden">
              <img
                src={arunikaImg}
                alt="Tower Arunika Modern Luxury Skyscraper"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/20" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#F3E5AB] font-mono">Modern Luxury</span>
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] bg-[#0B0F19]/80 px-2 py-1 font-mono">Lantai 7 - 35</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB] mb-2">
                  Tower Arunika
                </h3>
                <div className="text-xs tracking-wider uppercase text-[#D4AF37] mb-4">
                  The Pinnacle of Modern Living
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Menghadirkan keseimbangan sempurna antara dinamisnya kehidupan urban dan kenyamanan modern. Dirancang dengan keunikan tata letak di mana dalam satu lantai (Lantai 7-33) tersedia lengkap tipe unit Studio Executive, 1BR, 2BR, hingga 3BR Corner. Puncak menara di Lantai 34-35 didedikasikan untuk The Baswara Penthouse.
                </p>

                {/* Feature checklist */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Cpu size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Integrated Smart Home:</strong> Kontrol AC, lampu, dan tirai otomatis via smartphone.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Key size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Triple-Guard Access:</strong> Smart Door Lock dengan biometrik, PIN, dan RFID card.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Sparkles size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Layanan Komprehensif:</strong> Commercial Arcade, Business Pods, & The Baswara Lounge.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Users size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Layout Satu Lantai (Lt. 7-33):</strong> Unit Studio Executive, 1BR, 2BR, & 3BR Corner hadir dalam satu lantai.</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Mulai dari</span>
                  <span className="font-serif text-[#D4AF37] text-lg font-semibold tabular-nums">Rp5.500.000</span>
                  <span className="text-xs text-slate-400"> / bulan</span>
                </div>
                <a
                  href="#units"
                  onClick={() => onSelectTower('Arunika')}
                  className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase bg-transparent hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0F19] border border-[#D4AF37] transition-all cursor-pointer"
                >
                  Lihat Unit Arunika
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tower Baskara Card */}
        {activeTab === 'Baskara' && (
          <div className="bg-[#111827] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between group relative">
            <div className="absolute top-4 right-4 z-10 bg-[#D4AF37] text-[#0B0F19] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Ultra-Luxury
            </div>

            {/* Visual Header */}
            <div className="relative h-72 sm:h-80 overflow-hidden">
              <img
                src={baskaraImg}
                alt="Tower Baskara Ultra Luxury Skyscraper"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/20" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#F3E5AB] font-mono">Ultra-Privacy Sanctuary</span>
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] bg-[#0B0F19]/80 px-2 py-1 font-mono">Lantai 7 - 35</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB] mb-2">
                  Tower Baskara
                </h3>
                <div className="text-xs tracking-wider uppercase text-[#D4AF37] mb-4">
                  The Apex of Ultra-Luxury & Privacy
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Didedikasikan untuk tokoh terkemuka dan figur publik yang menginginkan privasi tanpa kompromi. Tanpa lobi terbuka publik, digantikan The Sovereign Foyer tertutup rapat dengan sambutan Personal Attaché. Unit ditata secara presisi berdasarkan arah mata angin: The Emerald (NW, NE, SW, SE), The Sapphire (NW, NE, SW, SE), The Diamond (North & South), dan The Crown.
                </p>

                {/* Feature checklist */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Compass size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Orientasi Mata Angin Presisi:</strong> Emerald & Sapphire (North-West, North-East, South-West, South-East), Diamond (North & South).</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Shield size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Sovereign Foyer:</strong> Privasi absolut tanpa lobi publik, penyambutan langsung Personal Butler.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Eye size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Retina & Facial Recognition:</strong> Akses lift pribadi langsung ke unit & helipad rooftop.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Car size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>Baskara Vault & Clubs:</strong> Showroom supercar parking, Onsen privat, Chef Table & Cigar Lounge.</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Mulai dari</span>
                  <span className="font-serif text-[#D4AF37] text-lg font-semibold tabular-nums">Rp65.000.000</span>
                  <span className="text-xs text-slate-400"> / bulan</span>
                </div>
                <a
                  href="#units"
                  onClick={() => onSelectTower('Baskara')}
                  className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  Lihat Unit Baskara
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
