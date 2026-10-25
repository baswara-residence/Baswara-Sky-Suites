import React from 'react';
import { Shield, Key, FileText, CheckCircle, ExternalLink, ArrowRight, PhoneCall, MessageSquare, Award, Users, Lock, ChevronRight } from 'lucide-react';

interface ServicesAndKYCProps {
  onOpenViewingModal: () => void;
}

export const ServicesAndKYC: React.FC<ServicesAndKYCProps> = ({
  onOpenViewingModal,
}) => {
  const steps = [
    {
      step: 'Tahap 1',
      title: 'Pendaftaran & Inquiry',
      desc: 'Pengisian formulir online (terintegrasi otomatis ke Google Spreadsheet di Google Drive) atau hubungi perwakilan resmi via DM X (@the_BASWARA).',
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
      desc: 'Penerimaan Welcome Box berisi Smart Key, perekaman biometrik (Face Recognition), inspeksi unit, serta pendampingan oleh tim Butler.',
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
    <section id="services" className="py-24 max-w-7xl mx-auto px-6 relative">
      <div id="contact" className="absolute -top-24 left-0" />
      
      {/* Editorial Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono mb-3">
          Integrity & Governance
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB] mb-6 [text-wrap:balance]">
          Tata Cara Penyewaan & Pengisian Formulir
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
          Komitmen kami terhadap eksklusivitas dan privasi tercermin dalam 4 langkah terstruktur penyewaan serta verifikasi profil penghuni di Baswara Sky Suites.
        </p>
      </div>

      {/* 4-Step Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((st, i) => {
          const IconComp = st.icon;
          return (
            <div
              key={i}
              className="bg-[#111827] border border-[#D4AF37]/20 p-6 flex flex-col justify-between hover:border-[#D4AF37] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
                    {st.step}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#0B0F19] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <IconComp size={15} />
                  </div>
                </div>
                <h3 className="text-lg font-serif text-[#F3E5AB] mb-2">
                  {st.title}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Protocols & Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
        
        {/* Residential Service Protocols Box */}
        <div className="lg:col-span-7 bg-[#111827] border border-[#D4AF37]/25 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono mb-2 flex items-center gap-2">
              <Award size={14} />
              <span>Residential Protocols & Stewardship</span>
            </div>
            <h3 className="text-2xl font-serif text-[#F3E5AB] mb-3">
              Standar Tata Kelola & Layanan Residensial
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-light">
              Setiap penghuni di Tower Arunika dan Tower Baskara didampingi standar layanan protokoler tertinggi yang menjaga privasi, kenyamanan, serta kemudahan hidup harian.
            </p>

            <div className="space-y-4">
              {protocols.map((proto, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 bg-[#0B0F19] border border-slate-800 hover:border-[#D4AF37]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-serif text-white font-medium flex items-center gap-2">
                      <span className="text-[#D4AF37]">✦</span>
                      <span>{proto.title}</span>
                    </h4>
                    <span className="text-[10px] font-mono uppercase text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                      {proto.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-4 font-light">
                    {proto.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hubungi Kami (Contact Action Box) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#D4AF37] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-serif text-[#F3E5AB] mb-4">
              Hubungi Kami
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              Layanan konsultasi dan pengajuan sewa unit di Baswara Sky Suites dapat diakses langsung melalui pengisian formulir terpadu maupun komunikasi resmi bersama manajemen di platform X (@the_BASWARA).
            </p>

            <div className="space-y-4 mb-8 text-xs sm:text-sm">
              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase">Alamat Gedung</span>
                <span className="text-slate-200 font-medium">
                  Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat 10310
                </span>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase">Akun Resmi X (Twitter)</span>
                <a
                  href="https://x.com/the_BASWARA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] font-medium hover:underline inline-flex items-center gap-1.5"
                >
                  <span>@the_BASWARA</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase">Akun Manajemen Direct</span>
                <a
                  href="https://x.com/fourgotmenot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] font-medium hover:underline inline-flex items-center gap-1.5"
                >
                  <span>@fourgotmenot</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenViewingModal}
              className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Isi Formulir Penyewaan Unit</span>
              <ArrowRight size={14} />
            </button>

            <a
              href="https://x.com/the_BASWARA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium tracking-widest uppercase transition-colors flex items-center justify-center gap-2 text-center"
            >
              <MessageSquare size={13} />
              <span>Direct Message (DM) di X</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

      </div>

    </section>
  );
};
