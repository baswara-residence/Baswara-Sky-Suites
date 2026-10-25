import React from 'react';
import { Shield, Sparkles, Building2, UserCheck, Award, HeartHandshake } from 'lucide-react';

export interface StaffMember {
  name: string;
  role: string;
  desc: string;
  category?: 'executive' | 'secretariat' | 'management';
}

export const STAFF_MEMBERS: StaffMember[] = [
  {
    name: 'Marcelinus Chitraditya Lokananta Prabaswara',
    role: 'Chief Executive Officer (CEO)',
    desc: 'Memimpin visi strategis, keunggulan tata kelola, dan standar mutu tertinggi hunian vertikal terpadu.',
  },
  {
    name: 'Danika Genta',
    role: 'Corporate Secretary',
    desc: 'Penghubung utama kesekretariatan eksekutif, koordinasi protokoler manajemen Prabaswara Group, tata kelola kepatuhan, serta dokumentasi legalitas sewa residensial.',
  },
  {
    name: 'Julian Andries',
    role: 'General Manager Operasional',
    desc: 'Tangan kanan CEO yang mengawasi seluruh operasional harian di Tower Arunika dan Tower Baskara serta memastikan standar layanan bintang lima.',
  },
  {
    name: 'Natasha Wijaya',
    role: 'Leasing & Marketing Manager',
    desc: 'Memegang kendali penuh atas akun resmi @the_BASWARA, inquiry via DM, verifikasi ketersediaan unit, serta memandu penyewa hingga serah terima unit.',
  },
  {
    name: 'Sebastian Pradipta',
    role: 'Head of Concierge & Guest Relations',
    desc: 'Wajah utama di Grand Lobby dan kontak darurat 24 jam. Mengatur reservasi fasilitas privat, penitipan paket, dan menjaga kerahasiaan tamu VVIP.',
  },
  {
    name: 'Bima Cokroaminoto',
    role: 'Chief Security Officer',
    desc: 'Mengepalai seluruh sistem keamanan terpadu The Baswara: registrasi biometrik Face Recognition, Smart Door Lock, CCTV, dan akses Baskara Vault.',
  },
  {
    name: 'Hendra Kusuma',
    role: 'Chief Engineer & Maintenance',
    desc: 'Menangani operasional seluruh sistem utilitas gedung, kendala teknis Smart Home System di dalam unit, sirkulasi AC sentral, dan fasilitas parkir.',
  },
];

export const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-24 max-w-7xl mx-auto px-6">
      
      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB] mb-6 [text-wrap:balance]">
          Welcome to Baswara Sky Suites
        </h2>

        <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light text-left sm:text-center">
          <p>
            Selamat datang di mahakarya vertikal terbaru di jantung kota Jakarta. Kini, kunci menuju standar hidup yang lebih tinggi telah menanti Anda. Lebih dari sekadar tempat tinggal, Baswara Sky Suites mengundang Anda untuk merasakan pengalaman <em className="text-[#D4AF37] font-serif">"More Than a Home, A Higher Lifestyle"</em>.
          </p>
          <p>
            Baswara Sky Suites merupakan mahakarya hunian mewah dan eksklusif persembahan <strong className="text-white font-medium">PT Baswara Mangkubumi Residence</strong> dari <strong className="text-white font-medium">Prabaswara Group</strong>. Berlokasi strategis di kawasan prestisius Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat, kami hadir untuk mendefinisikan ulang standar hunian modern di pusat ibu kota.
          </p>
        </div>
      </div>

      {/* Dedicated Management & Staff Team Section */}
      <div className="bg-[#111827] border border-[#D4AF37]/30 p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="mb-8 pb-6 border-b border-slate-800">
          <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB]">
            Dedicated Management Team
          </h3>
        </div>

        {/* Staff Grid (Tanpa Tanggal Lahir) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STAFF_MEMBERS.map((staff, idx) => {
            const isCEO = staff.category === 'executive';
            const isSec = staff.category === 'secretariat';

            return (
              <div
                key={idx}
                className={`p-5 bg-[#0B0F19] border transition-all duration-300 flex flex-col justify-between ${
                  isCEO
                    ? 'md:col-span-2 lg:col-span-2 border-[#D4AF37]/70 bg-gradient-to-r from-[#0B0F19] via-[#111827] to-[#0B0F19] shadow-lg'
                    : isSec
                    ? 'border-[#D4AF37]/45'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="mb-2">
                    <h4 className="text-base font-serif text-white font-medium">
                      {staff.name}
                    </h4>
                  </div>

                  <div className="text-xs text-[#D4AF37] font-mono mb-3">
                    {staff.role}
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed font-light">
                    {staff.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
