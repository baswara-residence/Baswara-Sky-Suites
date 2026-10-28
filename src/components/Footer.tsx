import React, { useState } from 'react';
import { ExternalLink, HardDrive } from 'lucide-react';
import { AdminDriveStatusModal } from './AdminDriveStatusModal';

interface FooterProps {
  onOpenViewingModal?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [isAdminDiagOpen, setIsAdminDiagOpen] = useState(false);

  return (
    <>
      <footer className="w-full bg-[#070B12] border-t border-[#D4AF37]/20 px-4 sm:px-8 py-5 sm:py-6 text-slate-400 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Brand & Legal */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-center md:text-left">
            <span className="font-serif tracking-widest text-[#D4AF37] font-semibold uppercase text-xs">
              Baswara Sky Suites
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-[11px] text-slate-300">
              © 2026 PT Baswara Mangkubumi Residence · Prabaswara Group
            </span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="hidden lg:inline text-[11px] text-slate-500">
              Jl. Boulevard Kusuma Menteng No. 8, Jakarta Pusat
            </span>
          </div>

          {/* Right: Inquiries & Disclaimer */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 text-[11px]">
            <span className="text-slate-500 hidden sm:inline">Official Inquiries:</span>
            <a
              href="https://x.com/the_BASWARA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:text-[#F3E5AB] transition-colors inline-flex items-center gap-1 font-mono"
            >
              <span>@the_BASWARA</span>
              <ExternalLink size={10} />
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://x.com/fourgotmenot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:text-[#F3E5AB] transition-colors inline-flex items-center gap-1 font-mono"
            >
              <span>@fourgotmenot</span>
              <ExternalLink size={10} />
            </a>

            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsAdminDiagOpen(true)}
              className="text-slate-400 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1 font-mono text-[10px] cursor-pointer"
              title="Cek Status Koneksi Google Drive & Netlify"
            >
              <HardDrive size={11} />
              <span>Status Drive & Netlify</span>
            </button>

            <span className="hidden md:inline text-slate-700">•</span>
            <span className="text-[10px] text-slate-500 italic hidden md:inline">
              Roleplay purpose only
            </span>
          </div>
        </div>
      </footer>

      <AdminDriveStatusModal
        isOpen={isAdminDiagOpen}
        onClose={() => setIsAdminDiagOpen(false)}
      />
    </>
  );
};

