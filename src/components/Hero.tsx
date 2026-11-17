import React from 'react';
import { Compass, Calculator } from 'lucide-react';
import heroImage from '../assets/images/hero_sky_suites_1792311582414.jpg';

interface HeroProps {
  onOpenViewingModal: () => void;
  onOpenCalculator: () => void;
  onNavigateToUnits: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCalculator, onNavigateToUnits }) => {
  return (
    <section id="home" className="relative">
      {/* Hero Architectural Banner */}
      <div className="relative min-h-[90vh] flex flex-col justify-between pt-24 pb-16 overflow-hidden">
        {/* Background with warm ivory architectural scrim for high contrast */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Baswara Sky Suites Twin Towers"
            onError={(e) => {
              e.currentTarget.src = '/images/hero_sky_suites_1792311582414.jpg';
            }}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F5] via-[#FBF9F5]/80 to-[#FBF9F5]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#FBF9F5_90%)]" />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full my-auto text-center flex flex-col items-center">
          
          {/* Subtle Pre-title */}
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#9A7B1C] font-semibold mb-6">
            <span>PT Baswara Mangkubumi Residence</span>
            <span aria-hidden="true" className="text-[#9A7B1C]/50">·</span>
            <span>Prabaswara Group</span>
          </div>

          {/* Grand Headline with high-contrast luxury dark charcoal */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-[#0F172A] tracking-wide max-w-5xl leading-[1.15] mb-6 [text-wrap:balance]">
            Higher Living, Bigger Dreams.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-3xl font-light leading-relaxed mb-10 [text-wrap:balance]">
            Mahakarya hunian vertikal ultra-mewah di kawasan paling prestisius Menteng. Menggabungkan privasi mutlak, teknologi pintar, dan keramahtamahan bintang lima.
          </p>

          {/* Actions with high visibility buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onNavigateToUnits}
              className="px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase bg-[#9A7B1C] text-white hover:bg-[#806411] transition-all shadow-[0_4px_20px_rgba(154,123,28,0.3)] flex items-center gap-2 cursor-pointer"
            >
              <Compass size={16} />
              <span>Pilihan Unit & Harga</span>
            </button>

            <button
              onClick={onOpenCalculator}
              className="px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase border-2 border-[#9A7B1C] text-[#855D00] bg-white/80 hover:bg-[#9A7B1C] hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Calculator size={16} />
              <span>Kalkulator Biaya Sewa</span>
            </button>
          </div>

          {/* Location tag */}
          <div className="mt-8 text-xs tracking-wider text-slate-600 font-medium">
            Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat
          </div>
        </div>
      </div>

      {/* Merged About Us Section */}
      <div id="about" className="relative py-20 max-w-5xl mx-auto px-6 border-b border-[#9A7B1C]/25">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#0F172A] mb-6 [text-wrap:balance]">
            Welcome to Baswara Sky Suites
          </h2>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-light text-left sm:text-center max-w-3xl mx-auto">
            <p>
              Selamat datang di mahakarya vertikal terbaru di jantung kota Jakarta. Kini, kunci menuju standar hidup yang lebih tinggi telah menanti Anda. Lebih dari sekadar tempat tinggal, Baswara Sky Suites mengundang Anda untuk merasakan pengalaman <em className="text-[#855D00] font-serif font-semibold">"More Than a Home, A Higher Lifestyle"</em>.
            </p>
            <p>
              Baswara Sky Suites merupakan mahakarya hunian mewah dan eksklusif persembahan <strong className="text-[#0F172A] font-semibold">PT Baswara Mangkubumi Residence</strong> dari <strong className="text-[#0F172A] font-semibold">Prabaswara Group</strong>. Berlokasi strategis di kawasan prestisius Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat, kami hadir untuk mendefinisikan ulang standar hunian modern di pusat ibu kota.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
