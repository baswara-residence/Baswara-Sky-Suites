import React from 'react';
import { STAFF_MEMBERS } from '../data/staff';
import { ExternalLink, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';

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
        <div className="text-xs uppercase tracking-[0.25em] text-[#855D00] font-mono font-bold mb-3">
          Executive Leadership & Inquiries
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#0F172A] font-bold mb-4 [text-wrap:balance]">
          Management Team & Contact
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
          Para profesional berdedikasi yang mengawal standar pelayanan bintang lima, integritas tata kelola, dan kenyamanan residensial di Baswara Sky Suites.
        </p>
      </div>

      {/* 1. Dedicated Management Team Grid */}
      <div className="bg-white border-2 border-slate-300 p-6 sm:p-10 mb-12 shadow-lg">
        <div className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-widest text-[#855D00] font-bold flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Dewan Manajemen & Residensial Officer</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">PT Baswara Mangkubumi Residence</span>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STAFF_MEMBERS.map((staff, idx) => {
            const isCEO = staff.category === 'executive';
            const isSec = staff.category === 'secretariat';

            return (
              <div
                key={idx}
                className={`p-5 border-2 transition-all duration-300 flex flex-col justify-between shadow-xs ${
                  isCEO
                    ? 'md:col-span-2 lg:col-span-2 border-[#855D00] bg-[#FAF7F2] shadow-md'
                    : isSec
                    ? 'border-[#855D00]/60 bg-white'
                    : 'border-slate-300 bg-white hover:border-[#855D00]'
                }`}
              >
                <div>
                  <div className="mb-1.5">
                    <h4 className="text-base font-serif text-[#0F172A] font-bold">
                      {staff.name}
                    </h4>
                  </div>

                  <div className="text-xs text-[#855D00] font-mono font-bold mb-3">
                    {staff.role}
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    {staff.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Official Communication & Leasing Inquiries Card */}
      <div className="bg-white border-2 border-slate-300 p-6 sm:p-10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-widest text-[#855D00] font-mono font-bold mb-2">
              Official Channels
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#0F172A] font-bold mb-3">
              Residential Leasing & Inquiries
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              Layanan konsultasi dan pengajuan sewa unit di Baswara Sky Suites dapat diakses langsung melalui pengisian formulir terpadu maupun komunikasi resmi bersama manajemen di platform X (<a href="https://x.com/the_BASWARA" target="_blank" rel="noopener noreferrer" className="text-[#855D00] font-bold hover:underline">@the_BASWARA</a>).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] shadow-xs">
                <span className="text-slate-500 text-[10px] block uppercase font-mono font-bold">Akun Resmi X (Base)</span>
                <a
                  href="https://x.com/the_BASWARA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#855D00] font-bold hover:underline inline-flex items-center gap-1.5 mt-1 font-mono text-sm"
                >
                  <span>@the_BASWARA</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] shadow-xs">
                <span className="text-slate-500 text-[10px] block uppercase font-mono font-bold">Manajemen Direct</span>
                <a
                  href="https://x.com/fourgotmenot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#855D00] font-bold hover:underline inline-flex items-center gap-1.5 mt-1 font-mono text-sm"
                >
                  <span>@fourgotmenot</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <button
              onClick={onOpenViewingModal}
              className="w-full py-4 bg-[#855D00] hover:bg-[#704D00] text-white text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Isi Formulir Penyewaan Unit</span>
              <ArrowRight size={14} />
            </button>

            <a
              href="https://x.com/the_BASWARA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 border-2 border-[#855D00] hover:bg-[#855D00] hover:text-white text-[#855D00] bg-white text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 text-center shadow-xs"
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
