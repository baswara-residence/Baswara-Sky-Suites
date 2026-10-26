import React from 'react';
import { STAFF_MEMBERS } from '../data/staff';
import { ExternalLink, ArrowRight, MessageSquare } from 'lucide-react';

interface ContactSectionProps {
  onOpenViewingModal: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  onOpenViewingModal,
}) => {
  return (
    <section id="contact" className="py-24 max-w-7xl mx-auto px-6 relative">
      
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono mb-3">
          Executive Leadership & Inquiries
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3E5AB] mb-6 [text-wrap:balance]">
          Management Team & Contact
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
          Para profesional berdedikasi yang mengawal standar pelayanan bintang lima, integritas tata kelola, dan kenyamanan residensial di Baswara Sky Suites.
        </p>
      </div>

      {/* 1. Dedicated Management Team Grid */}
      <div className="bg-[#111827] border border-[#D4AF37]/30 p-6 sm:p-10 mb-12 shadow-2xl">
        {/* Staff Grid */}
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

      {/* 2. Official Communication & Leasing Inquiries Card */}
      <div className="bg-[#111827] border border-[#D4AF37]/30 p-6 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono mb-2">
              Official Channels
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#F3E5AB] mb-4">
              Residential Leasing & Inquiries
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              Layanan konsultasi dan pengajuan sewa unit di Baswara Sky Suites dapat diakses langsung melalui pengisian formulir terpadu maupun komunikasi resmi bersama manajemen di platform X (@the_BASWARA).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase font-mono">Akun Resmi X</span>
                <a
                  href="https://x.com/the_BASWARA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] font-medium hover:underline inline-flex items-center gap-1.5 mt-1"
                >
                  <span>@the_BASWARA</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase font-mono">Manajemen Direct</span>
                <a
                  href="https://x.com/fourgotmenot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] font-medium hover:underline inline-flex items-center gap-1.5 mt-1"
                >
                  <span>@fourgotmenot</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <button
              onClick={onOpenViewingModal}
              className="w-full py-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Isi Formulir Penyewaan Unit</span>
              <ArrowRight size={14} />
            </button>

            <a
              href="https://x.com/the_BASWARA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium tracking-widest uppercase transition-colors flex items-center justify-center gap-2 text-center"
            >
              <MessageSquare size={14} />
              <span>Direct Message (DM) di X</span>
              <ExternalLink size={13} />
            </a>
          </div>

        </div>
      </div>

    </section>
  );
};
