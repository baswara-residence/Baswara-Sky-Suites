import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UnitExplorer } from './components/UnitExplorer';
import { FacilitiesAndServices } from './components/FacilitiesAndServices';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CostCalculator, QuoteData } from './components/CostCalculator';
import { ViewingModal } from './components/ViewingModal';
import { Unit } from './data/units';

export const PAGES = [
  {
    id: 'home',
    num: '01',
    navLabel: 'Beranda',
    title: 'Higher Living, Bigger Dreams',
    subtitle: 'Filosofi, Sambutan & Lokasi Menteng',
  },
  {
    id: 'units',
    num: '02',
    navLabel: 'Tower & Unit',
    title: 'Pilihan Unit & Twin Towers',
    subtitle: 'Tower Arunika & Tower Baskara',
  },
  {
    id: 'facilities',
    num: '03',
    navLabel: 'Fasilitas & Layanan',
    title: 'Fasilitas Bintang Lima & Proses Sewa',
    subtitle: 'Sky Pool, Helipad, Butler & 4 Tahap Sewa',
  },
  {
    id: 'contact',
    num: '04',
    navLabel: 'Tim & Kontak',
    title: 'Manajemen Residensial & Kantor',
    subtitle: 'Direksi, Legal, Layanan Butler & Informasi Kantor',
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [preselectedViewingUnit, setPreselectedViewingUnit] = useState<Unit | null>(null);
  const [activeQuote, setActiveQuote] = useState<QuoteData | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedCalculatorUnit, setSelectedCalculatorUnit] = useState<Unit | null>(null);

  const [selectedTowerFilter, setSelectedTowerFilter] = useState<'All' | 'Arunika' | 'Baskara'>('All');

  const handleOpenCalculator = (unit?: Unit) => {
    setSelectedCalculatorUnit(unit || null);
    setIsCalculatorOpen(true);
  };

  const handleOpenViewingModal = (unit?: Unit) => {
    setPreselectedViewingUnit(unit || null);
    setIsViewingModalOpen(true);
  };

  const handleProceedFromCalculator = (quoteData: QuoteData) => {
    setActiveQuote(quoteData);
    setPreselectedViewingUnit(quoteData.unit || null);
    setIsViewingModalOpen(true);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] text-[#E5E7EB] font-sans selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB] flex flex-col relative">
      
      {/* Top Bar Navigation with page selection */}
      <Navbar
        currentPage={currentPage}
        onNavigatePage={(pageIndex) => setCurrentPage(pageIndex)}
        onOpenViewingModal={() => handleOpenViewingModal()}
        onOpenCalculator={() => handleOpenCalculator()}
      />

      {/* Main Viewport Container (Per Page Architecture) */}
      <main className="flex-1 relative overflow-hidden pt-20">
        <div className="w-full h-full relative overflow-hidden">
          
          {/* Page 0: Home / Beranda & Filosofi */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              currentPage === 0
                ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                : currentPage > 0
                ? 'opacity-0 -translate-y-8 pointer-events-none z-0'
                : 'opacity-0 translate-y-8 pointer-events-none z-0'
            }`}
            aria-hidden={currentPage !== 0}
          >
            <div className="w-full h-full overflow-y-auto overscroll-contain flex flex-col justify-between">
              <div className="flex-1">
                <Hero
                  onOpenViewingModal={() => handleOpenViewingModal()}
                  onOpenCalculator={() => handleOpenCalculator()}
                  onNavigateToUnits={() => setCurrentPage(1)}
                />
              </div>
              <Footer />
            </div>
          </div>

          {/* Page 1: Tower & Unit Explorer */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              currentPage === 1
                ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                : currentPage > 1
                ? 'opacity-0 -translate-y-8 pointer-events-none z-0'
                : 'opacity-0 translate-y-8 pointer-events-none z-0'
            }`}
            aria-hidden={currentPage !== 1}
          >
            <div className="w-full h-full overflow-y-auto overscroll-contain flex flex-col justify-between">
              <div className="flex-1">
                <UnitExplorer
                  selectedTowerFilter={selectedTowerFilter}
                  onSelectTowerFilter={setSelectedTowerFilter}
                  onOpenCalculator={handleOpenCalculator}
                  onOpenViewingModal={handleOpenViewingModal}
                />
              </div>
              <Footer />
            </div>
          </div>

          {/* Page 2: Facilities & Services */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              currentPage === 2
                ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                : currentPage > 2
                ? 'opacity-0 -translate-y-8 pointer-events-none z-0'
                : 'opacity-0 translate-y-8 pointer-events-none z-0'
            }`}
            aria-hidden={currentPage !== 2}
          >
            <div className="w-full h-full overflow-y-auto overscroll-contain flex flex-col justify-between">
              <div className="flex-1">
                <FacilitiesAndServices
                  onOpenViewingModal={() => handleOpenViewingModal()}
                />
              </div>
              <Footer />
            </div>
          </div>

          {/* Page 3: Dedicated Management Team & Contact */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              currentPage === 3
                ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                : 'opacity-0 translate-y-8 pointer-events-none z-0'
            }`}
            aria-hidden={currentPage !== 3}
          >
            <div className="w-full h-full overflow-y-auto overscroll-contain flex flex-col justify-between">
              <div className="flex-1">
                <ContactSection
                  onOpenViewingModal={() => handleOpenViewingModal()}
                />
              </div>
              <Footer />
            </div>
          </div>

        </div>
      </main>

      {/* Floating/Overlay Modals */}
      {isCalculatorOpen && (
        <CostCalculator
          selectedUnit={selectedCalculatorUnit}
          onClose={() => setIsCalculatorOpen(false)}
          onProceedToBooking={handleProceedFromCalculator}
        />
      )}

      <ViewingModal
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
        preselectedUnit={preselectedViewingUnit}
        attachedQuote={activeQuote}
        onOpenCalculator={handleOpenCalculator}
      />

    </div>
  );
}
