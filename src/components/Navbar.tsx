import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: number;
  onNavigatePage: (pageIndex: number) => void;
  onOpenViewingModal?: () => void;
  onOpenCalculator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigatePage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { pageIndex: 0, label: 'Beranda' },
    { pageIndex: 1, label: 'Tower & Unit' },
    { pageIndex: 2, label: 'Fasilitas & Layanan' },
    { pageIndex: 3, label: 'Tim & Kontak' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#855D00]/20 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Wordmark: Baswara Sky Suites */}
        <button
          onClick={() => onNavigatePage(0)}
          className="text-left group cursor-pointer"
        >
          <div className="text-lg sm:text-xl md:text-2xl font-serif tracking-[0.15em] text-[#855D00] uppercase whitespace-nowrap shrink-0 group-hover:text-[#704D00] transition-colors font-bold">
            Baswara Sky Suites
          </div>
        </button>

        {/* Clean Menu Navigation Links (Page-by-page switch) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs tracking-wider uppercase font-semibold">
          {navLinks.map((link) => {
            const isActive = currentPage === link.pageIndex;
            return (
              <button
                key={link.pageIndex}
                onClick={() => onNavigatePage(link.pageIndex)}
                className={`py-2 px-1 relative transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center ${
                  isActive
                    ? 'text-[#855D00] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#855D00]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-[#9A7B1C] focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FBF9F5] border-b border-[#855D00]/25 px-6 py-6 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.pageIndex;
              return (
                <button
                  key={link.pageIndex}
                  onClick={() => {
                    onNavigatePage(link.pageIndex);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-xs font-semibold tracking-widest uppercase py-3 px-3 flex items-center justify-between border-b border-slate-200 transition-colors ${
                    isActive
                      ? 'bg-white text-[#9A7B1C] border-l-4 border-l-[#9A7B1C] shadow-sm'
                      : 'text-slate-700 hover:text-[#9A7B1C]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#9A7B1C]" />}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
