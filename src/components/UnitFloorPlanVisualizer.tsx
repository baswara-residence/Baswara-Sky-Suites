import React, { useState } from 'react';
import { Unit } from '../data/units';
import { Compass, CheckCircle2, Ruler, DoorClosed, Shield, Sparkles } from 'lucide-react';

interface UnitFloorPlanVisualizerProps {
  unit: Unit;
}

export const UnitFloorPlanVisualizer: React.FC<UnitFloorPlanVisualizerProps> = ({ unit }) => {
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(0);
  const fp = unit.floorPlan;

  if (!fp) return null;

  const activeRoom = fp.rooms[selectedRoomIndex] || fp.rooms[0];
  const isBaskara = unit.tower === 'Baskara';
  const orientationDegrees = unit.orientationAnalysis?.degrees ?? 0;

  // Render SVG Blueprint layout based on schematicType
  const renderBlueprintSvg = () => {
    switch (fp.schematicType) {
      // ==========================================
      // 1. STUDIO EXECUTIVE (Arunika - 32 m²)
      // Rooms: 0: Living & Bed, 1: Kitchenette, 2: Bathroom, 3: Balcony
      // ==========================================
      case 'studio':
        return (
          <svg viewBox="0 0 540 360" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-studio" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="540" height="360" fill="#070B14" />
            <rect width="540" height="360" fill="url(#grid-studio)" />

            {/* Architectural Outer Wall */}
            <rect x="40" y="30" width="460" height="300" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Room 3: Private Balcony (Left) */}
            <g
              onClick={() => setSelectedRoomIndex(3)}
              className="cursor-pointer transition-all duration-200"
            >
              <rect
                x="40"
                y="30"
                width="80"
                height="300"
                fill={selectedRoomIndex === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.08)'}
                stroke="#10B981"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
                strokeDasharray="4 2"
              />
              {/* Railing stripes */}
              <line x1="45" y1="30" x2="45" y2="330" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.4" />
              <text x="80" y="180" fill="#10B981" fontSize="11" textAnchor="middle" transform="rotate(-90 80 180)" fontFamily="monospace" fontWeight="bold">
                BALKON PRIVAT (3 m²)
              </text>
            </g>

            {/* Room 0: Living & Bedroom Zone (Center) */}
            <g
              onClick={() => setSelectedRoomIndex(0)}
              className="cursor-pointer transition-all duration-200"
            >
              <rect
                x="120"
                y="30"
                width="250"
                height="300"
                fill={selectedRoomIndex === 0 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.06)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1}
              />
              
              {/* King Bed outline */}
              <rect x="150" y="70" width="110" height="130" fill="rgba(243,229,171,0.08)" stroke="#F3E5AB" strokeWidth="1" rx="4" />
              <rect x="160" y="80" width="90" height="30" fill="rgba(243,229,171,0.18)" stroke="#F3E5AB" strokeWidth="0.5" />
              <circle cx="185" cy="95" r="8" fill="rgba(243,229,171,0.25)" />
              <circle cx="225" cy="95" r="8" fill="rgba(243,229,171,0.25)" />
              <text x="205" y="150" fill="#F3E5AB" fontSize="10" textAnchor="middle" fontFamily="sans-serif">King Bed</text>

              {/* Bedside tables */}
              <rect x="130" y="80" width="18" height="25" fill="#0B0F19" stroke="#D4AF37" strokeWidth="0.6" />
              <rect x="262" y="80" width="18" height="25" fill="#0B0F19" stroke="#D4AF37" strokeWidth="0.6" />
              
              {/* Lounge Sofa */}
              <rect x="150" y="240" width="130" height="45" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeWidth="0.8" rx="3" />
              <rect x="160" y="250" width="110" height="25" fill="rgba(212,175,55,0.15)" stroke="#D4AF37" strokeWidth="0.5" />
              <text x="215" y="266" fill="#D4AF37" fontSize="9" textAnchor="middle">Lounge & Smart TV</text>

              {/* TV Wall Console */}
              <line x1="310" y1="230" x2="310" y2="295" stroke="#94A3B8" strokeWidth="2" />
              <text x="325" y="265" fill="#94A3B8" fontSize="8" transform="rotate(90 325 265)">Smart TV 55"</text>

              <text x="245" y="55" fill="#F3E5AB" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                LIVING & BEDROOM (20 m²)
              </text>
            </g>

            {/* Room 2: Luxury Bathroom (Top-Right) */}
            <g
              onClick={() => setSelectedRoomIndex(2)}
              className="cursor-pointer transition-all duration-200"
            >
              <rect
                x="370"
                y="30"
                width="130"
                height="150"
                fill={selectedRoomIndex === 2 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.07)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              {/* Rain shower booth */}
              <rect x="440" y="40" width="50" height="55" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx="465" cy="67" r="10" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <line x1="440" y1="40" x2="490" y2="95" stroke="#38BDF8" strokeWidth="0.4" strokeOpacity="0.4" />
              
              {/* Vanity & Toilet */}
              <circle cx="395" cy="65" r="12" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <rect x="380" y="110" width="45" height="30" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <text x="435" y="145" fill="#38BDF8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                BATH (4 m²)
              </text>
            </g>

            {/* Room 1: Kitchenette & Pantry (Bottom-Right) */}
            <g
              onClick={() => setSelectedRoomIndex(1)}
              className="cursor-pointer transition-all duration-200"
            >
              <rect
                x="370"
                y="180"
                width="130"
                height="150"
                fill={selectedRoomIndex === 1 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.07)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              {/* Kitchen counter */}
              <rect x="380" y="225" width="110" height="40" fill="rgba(245,158,11,0.12)" stroke="#F59E0B" strokeWidth="0.8" />
              <circle cx="405" cy="245" r="8" fill="none" stroke="#F59E0B" strokeWidth="0.8" />
              <circle cx="430" cy="245" r="8" fill="none" stroke="#F59E0B" strokeWidth="0.8" />
              <rect x="455" y="235" width="25" height="20" fill="none" stroke="#F59E0B" strokeWidth="0.8" />
              
              <text x="435" y="205" fill="#F59E0B" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                PANTRY (5 m²)
              </text>

              {/* Entrance Door Swing from Corridor */}
              <path d="M 460,330 A 40 40 0 0 1 500,290" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="460" y1="330" x2="500" y2="330" stroke="#D4AF37" strokeWidth="2" />
              <text x="435" y="315" fill="#94A3B8" fontSize="8" textAnchor="middle">
                Pintu Koridor & Smart Lock
              </text>
            </g>

            {/* Architectural Compass */}
            {renderCompass(485, 45, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 2. 1 BEDROOM (Arunika - 45 m²)
      // Rooms: 0: Master Bedroom, 1: Living & Dining, 2: Full Kitchen, 3: Master Bathroom
      // ==========================================
      case '1br':
        return (
          <svg viewBox="0 0 580 380" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-1br" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="580" height="380" fill="#070B14" />
            <rect width="580" height="380" fill="url(#grid-1br)" />

            {/* Outer Wall */}
            <rect x="35" y="30" width="510" height="320" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Room 0: Master Bedroom (Left) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="35"
                y="30"
                width="240"
                height="260"
                fill={selectedRoomIndex === 0 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.07)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1}
              />
              <text x="155" y="55" fill="#F3E5AB" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER BEDROOM (18 m²)
              </text>
              {/* King Bed */}
              <rect x="80" y="80" width="140" height="135" fill="rgba(243,229,171,0.08)" stroke="#F3E5AB" strokeWidth="1" rx="4" />
              <rect x="95" y="90" width="110" height="35" fill="rgba(243,229,171,0.18)" stroke="#F3E5AB" strokeWidth="0.5" />
              <text x="150" y="160" fill="#F3E5AB" fontSize="11" textAnchor="middle">Ortopedic King Bed</text>

              {/* Sliding Wardrobe */}
              <rect x="45" y="235" width="130" height="35" fill="#0B0F19" stroke="#94A3B8" strokeWidth="0.8" />
              <text x="110" y="255" fill="#94A3B8" fontSize="9" textAnchor="middle">Lemari Sliding 3 Pintu</text>
            </g>

            {/* Room 1: Living & Dining Room (Right Top) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="275"
                y="30"
                width="270"
                height="170"
                fill={selectedRoomIndex === 1 ? 'rgba(212,175,55,0.28)' : 'rgba(243,229,171,0.05)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="410" y="55" fill="#F3E5AB" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                LIVING & DINING ROOM (17 m²)
              </text>
              {/* Sofa & Coffee table */}
              <rect x="300" y="75" width="115" height="50" fill="rgba(212,175,55,0.1)" stroke="#D4AF37" strokeWidth="0.8" rx="3" />
              <text x="357" y="105" fill="#D4AF37" fontSize="9" textAnchor="middle">Designer 3-Seater</text>
              {/* Marble Dining */}
              <rect x="435" y="80" width="65" height="50" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeWidth="0.8" rx="2" />
              <text x="467" y="110" fill="#D4AF37" fontSize="8" textAnchor="middle">Dining 2-Pax</text>
            </g>

            {/* Room 2: Full Kitchen (Right Bottom Left) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="275"
                y="200"
                width="140"
                height="90"
                fill={selectedRoomIndex === 2 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.07)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="345" y="225" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                FULL KITCHEN (5 m²)
              </text>
              <rect x="285" y="240" width="120" height="25" fill="rgba(245,158,11,0.15)" stroke="#F59E0B" strokeWidth="0.5" />
              <text x="345" y="256" fill="#F59E0B" fontSize="8" textAnchor="middle">Kompor Induksi & Hood</text>
            </g>

            {/* Room 3: Master Bathroom (Right Bottom Right) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="415"
                y="200"
                width="130"
                height="90"
                fill={selectedRoomIndex === 3 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.07)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="480" y="225" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                MASTER BATH (5 m²)
              </text>
              <circle cx="480" cy="255" r="14" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <text x="480" y="259" fill="#38BDF8" fontSize="8" textAnchor="middle">Rainshower</text>
            </g>

            {/* Balcony across bottom */}
            <g className="cursor-pointer">
              <rect x="35" y="290" width="510" height="60" fill="rgba(16,185,129,0.08)" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="290" y="325" fill="#10B981" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                BALKON PANORAMIK KAMAR & LIVING (1.5 m x 3.5 m)
              </text>
            </g>

            {/* Compass */}
            {renderCompass(525, 45, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 3. 2 BEDROOM (Arunika - 68 m² Corner Transition)
      // Rooms: 0: Master Bed, 1: Secondary Bed, 2: Grand Living & Dining, 3: Island Kitchen, 4: Family Bathroom
      // ==========================================
      case '2br':
        return (
          <svg viewBox="0 0 640 420" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-2br" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="640" height="420" fill="#070B14" />
            <rect width="640" height="420" fill="url(#grid-2br)" />

            {/* Outer Wall */}
            <rect x="30" y="25" width="580" height="370" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Room 0: Master Bedroom (Top-Left) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="30"
                y="25"
                width="240"
                height="200"
                fill={selectedRoomIndex === 0 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.07)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1}
              />
              <text x="150" y="48" fill="#F3E5AB" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER BEDROOM (22 m²)
              </text>
              <rect x="70" y="65" width="120" height="110" fill="rgba(243,229,171,0.08)" stroke="#F3E5AB" strokeWidth="1" rx="3" />
              <rect x="80" y="75" width="100" height="30" fill="rgba(243,229,171,0.18)" stroke="#F3E5AB" strokeWidth="0.5" />
              <text x="130" y="130" fill="#F3E5AB" fontSize="10" textAnchor="middle">King-Size + Wardrobe</text>
            </g>

            {/* Room 1: Secondary Bedroom (Bottom-Left) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="30"
                y="225"
                width="240"
                height="170"
                fill={selectedRoomIndex === 1 ? 'rgba(212,175,55,0.28)' : 'rgba(168,85,247,0.07)'}
                stroke="#A855F7"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="150" y="250" fill="#E9D5FF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                SECONDARY BEDROOM (14 m²)
              </text>
              <rect x="80" y="265" width="100" height="95" fill="rgba(168,85,247,0.08)" stroke="#C084FC" strokeWidth="1" rx="3" />
              <text x="130" y="320" fill="#E9D5FF" fontSize="9" textAnchor="middle">Queen Bed / Study</text>
            </g>

            {/* Room 2: Grand Living & Dining (Right Top) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="270"
                y="25"
                width="340"
                height="190"
                fill={selectedRoomIndex === 2 ? 'rgba(212,175,55,0.28)' : 'rgba(243,229,171,0.05)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="440" y="48" fill="#F3E5AB" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                GRAND LIVING & DINING (22 m²)
              </text>
              <rect x="300" y="70" width="130" height="60" fill="rgba(212,175,55,0.1)" stroke="#D4AF37" strokeWidth="0.8" rx="3" />
              <text x="365" y="105" fill="#D4AF37" fontSize="10" textAnchor="middle">Sofa L-Shape</text>
              <rect x="460" y="70" width="85" height="65" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeWidth="0.8" rx="2" />
              <text x="502" y="108" fill="#D4AF37" fontSize="9" textAnchor="middle">Dining 4-Pax</text>
            </g>

            {/* Room 3: Island Gourmet Kitchen (Right Middle) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="270"
                y="215"
                width="190"
                height="120"
                fill={selectedRoomIndex === 3 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.07)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="365" y="240" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                ISLAND KITCHEN (6 m²)
              </text>
              <rect x="300" y="260" width="130" height="35" fill="rgba(245,158,11,0.18)" stroke="#F59E0B" strokeWidth="0.8" rx="2" />
              <text x="365" y="282" fill="#F59E0B" fontSize="8" textAnchor="middle">Bar Island Counter Granit</text>
            </g>

            {/* Room 4: Family Bathroom (Right Bottom) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="460"
                y="215"
                width="150"
                height="120"
                fill={selectedRoomIndex === 4 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.07)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="535" y="240" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                FAMILY BATH (4 m²)
              </text>
              <rect x="480" y="255" width="45" height="30" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <circle cx="560" cy="270" r="12" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <text x="535" y="310" fill="#38BDF8" fontSize="8" textAnchor="middle">Double Vanity & Shower</text>
            </g>

            {/* Corner Balcony across bottom-right */}
            <g className="cursor-pointer">
              <rect x="270" y="335" width="340" height="60" fill="rgba(16,185,129,0.08)" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="440" y="370" fill="#10B981" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                BALKON SUDUT BOULEVARD (1.8 m x 4.0 m)
              </text>
            </g>

            {/* Compass */}
            {renderCompass(580, 45, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 4. 3 BEDROOM CORNER (Arunika - 110 m² · TANPA PRIVATE LIFT)
      // Rooms: 0: Master Suite, 1: Bed 2, 2: Bed 3/Study, 3: Grand Living, 4: Chef Kitchen & Utility, 5: Bathrooms
      // ==========================================
      case '3br':
        return (
          <svg viewBox="0 0 680 440" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-3br" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="680" height="440" fill="#070B14" />
            <rect width="680" height="440" fill="url(#grid-3br)" />

            {/* Outer Wall */}
            <rect x="30" y="25" width="620" height="390" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Dual Wrap-Around Balconies (Top & Right) */}
            <path
              d="M 30,25 L 650,25 L 650,75 L 120,75 L 120,415 L 30,415 Z"
              fill="rgba(16,185,129,0.08)"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="350" y="55" fill="#10B981" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              BALKON GANDA PANORAMIK 180° ({unit.orientationAnalysis?.cardinalLabelId || '180° Corner Vista'})
            </text>

            {/* Main Entrance Foyer from Resident Corridor (Center Bottom - NO PRIVATE LIFT) */}
            <g className="cursor-pointer">
              <rect x="250" y="325" width="160" height="90" fill="rgba(148,163,184,0.08)" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
              <text x="330" y="355" fill="#F3E5AB" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                MAIN ENTRANCE FOYER
              </text>
              <text x="330" y="375" fill="#94A3B8" fontSize="8" textAnchor="middle">Pintu Koridor Residensial</text>
              <text x="330" y="395" fill="#D4AF37" fontSize="8" textAnchor="middle">Smart Biometric Lock</text>
            </g>

            {/* Room 3: Grand Living & Salon (Center-Left) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="120"
                y="75"
                width="290"
                height="250"
                fill={selectedRoomIndex === 3 ? 'rgba(212,175,55,0.28)' : 'rgba(243,229,171,0.06)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="265" y="105" fill="#F3E5AB" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                GRAND LIVING & SALON (32 m²)
              </text>
              <rect x="150" y="130" width="130" height="65" fill="rgba(212,175,55,0.12)" stroke="#D4AF37" strokeWidth="0.8" rx="4" />
              <text x="215" y="165" fill="#D4AF37" fontSize="10" textAnchor="middle">Italian Salon Sofa</text>
              <rect x="300" y="130" width="85" height="75" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeWidth="0.8" rx="3" />
              <text x="342" y="172" fill="#D4AF37" fontSize="9" textAnchor="middle">Dining 8-Pax</text>
            </g>

            {/* Room 0: Master Presidential Suite (Top-Right) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="410"
                y="75"
                width="240"
                height="160"
                fill={selectedRoomIndex === 0 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1}
              />
              <text x="530" y="100" fill="#F3E5AB" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER SUITE (30 m²)
              </text>
              <rect x="460" y="115" width="115" height="90" fill="rgba(243,229,171,0.1)" stroke="#F3E5AB" strokeWidth="0.8" rx="3" />
              <text x="517" y="155" fill="#F3E5AB" fontSize="9" textAnchor="middle">King Suite + Bathtub</text>
            </g>

            {/* Room 1: Bedroom 2 (En-Suite View) (Middle-Right) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="410"
                y="235"
                width="130"
                height="90"
                fill={selectedRoomIndex === 1 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="475" y="260" fill="#38BDF8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                BEDROOM 2 (16 m²)
              </text>
              <text x="475" y="285" fill="#94A3B8" fontSize="8" textAnchor="middle">En-Suite City View</text>
            </g>

            {/* Room 2: Bedroom 3 / Study Suite (Far-Right Middle) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="540"
                y="235"
                width="110"
                height="90"
                fill={selectedRoomIndex === 2 ? 'rgba(168,85,247,0.28)' : 'rgba(168,85,247,0.08)'}
                stroke="#A855F7"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="595" y="260" fill="#E9D5FF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                BEDROOM 3 (13 m²)
              </text>
              <text x="595" y="285" fill="#94A3B8" fontSize="8" textAnchor="middle">Study / Guest Room</text>
            </g>

            {/* Room 4: Chef Kitchen & Utility (Bottom-Left) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="120"
                y="325"
                width="130"
                height="90"
                fill={selectedRoomIndex === 4 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.08)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="185" y="355" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                CHEF KITCHEN (11 m²)
              </text>
              <text x="185" y="380" fill="#94A3B8" fontSize="8" textAnchor="middle">Maid & Ruang Cuci</text>
            </g>

            {/* Room 5: Bathrooms (2 Units) (Bottom-Right) */}
            <g onClick={() => setSelectedRoomIndex(5)} className="cursor-pointer transition-all duration-200">
              <rect
                x="410"
                y="325"
                width="240"
                height="90"
                fill={selectedRoomIndex === 5 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 5 ? 2 : 1}
              />
              <text x="530" y="355" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                BATHROOMS (2 UNIT · 8 m²)
              </text>
              <text x="530" y="380" fill="#94A3B8" fontSize="8" textAnchor="middle">Master Freestanding Bathtub + Family Bath</text>
            </g>

            {/* Compass */}
            {renderCompass(620, 50, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 5. THE EMERALD (Baskara - 220 m² · WITH PRIVATE ELEVATOR FOYER)
      // Rooms: 0: Private Lift Foyer, 1: Grand Living, 2: Cigar Room, 3: Master Suite, 4: Bed 2, 5: Bed 3, 6: Gourmet Kitchen
      // ==========================================
      case 'emerald':
        return (
          <svg viewBox="0 0 700 460" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-em" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="700" height="460" fill="#070B14" />
            <rect width="700" height="460" fill="url(#grid-em)" />

            {/* Corner Outer Wall */}
            <rect x="30" y="25" width="640" height="410" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Wrap-around Corner Balcony (Top & Left) */}
            <path
              d="M 30,25 L 670,25 L 670,75 L 120,75 L 120,435 L 30,435 Z"
              fill="rgba(16,185,129,0.09)"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="380" y="55" fill="#10B981" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              BALKON SUDUT SUNSET / SUNRISE ({unit.orientation} VISTA · 2.0 m x 6.5 m)
            </text>

            {/* Room 0: Private Elevator Foyer (Center Bottom - EXCLUSIVE BASKARA PRIVATE LIFT) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="260"
                y="325"
                width="160"
                height="110"
                fill={selectedRoomIndex === 0 ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.12)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1.5}
              />
              <text x="340" y="355" fill="#F3E5AB" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                PRIVATE ELEVATOR FOYER
              </text>
              <rect x="315" y="370" width="50" height="30" fill="#0B0F19" stroke="#D4AF37" strokeWidth="1" />
              <text x="340" y="390" fill="#D4AF37" fontSize="10" textAnchor="middle" fontWeight="bold">LIFT</text>
              <text x="340" y="420" fill="#94A3B8" fontSize="8" textAnchor="middle">Akses Biometrik Langsung (12 m²)</text>
            </g>

            {/* Room 1: Grand Living & Dining Salon (Center) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="120"
                y="75"
                width="300"
                height="250"
                fill={selectedRoomIndex === 1 ? 'rgba(212,175,55,0.28)' : 'rgba(243,229,171,0.06)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="270" y="105" fill="#F3E5AB" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                GRAND LIVING & SALON (55 m²)
              </text>
              <rect x="150" y="135" width="130" height="70" fill="rgba(212,175,55,0.12)" stroke="#D4AF37" strokeWidth="0.8" rx="4" />
              <text x="215" y="172" fill="#D4AF37" fontSize="10" textAnchor="middle">Poliform Italian Sofa</text>
              <rect x="300" y="135" width="90" height="80" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeWidth="0.8" rx="3" />
              <text x="345" y="178" fill="#D4AF37" fontSize="9" textAnchor="middle">Banquet Dining</text>
            </g>

            {/* Room 2: Private Cigar & Reading Room (Bottom-Left) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="120"
                y="325"
                width="140"
                height="110"
                fill={selectedRoomIndex === 2 ? 'rgba(168,85,247,0.35)' : 'rgba(168,85,247,0.1)'}
                stroke="#A855F7"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="190" y="360" fill="#E9D5FF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                CIGAR & READING ROOM
              </text>
              <text x="190" y="385" fill="#C084FC" fontSize="9" textAnchor="middle">(15 m² · Kedap Suara)</text>
              <text x="190" y="415" fill="#94A3B8" fontSize="8" textAnchor="middle">Ventilasi Khusus HEPA</text>
            </g>

            {/* Room 3: Master Presidential Suite (Top-Right) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="420"
                y="75"
                width="250"
                height="170"
                fill={selectedRoomIndex === 3 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="545" y="105" fill="#F3E5AB" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER SUITE (40 m²)
              </text>
              <rect x="470" y="125" width="130" height="95" fill="rgba(243,229,171,0.1)" stroke="#F3E5AB" strokeWidth="0.8" rx="3" />
              <text x="535" y="170" fill="#F3E5AB" fontSize="10" textAnchor="middle">Calacatta En-Suite + Smart Glass</text>
            </g>

            {/* Room 4: Bedroom 2 En-Suite (Middle-Right) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="420"
                y="245"
                width="130"
                height="100"
                fill={selectedRoomIndex === 4 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="485" y="280" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                BEDROOM 2 (24 m²)
              </text>
              <text x="485" y="305" fill="#94A3B8" fontSize="8" textAnchor="middle">En-Suite Mandiri</text>
            </g>

            {/* Room 5: Bedroom 3 En-Suite (Far-Right Middle) */}
            <g onClick={() => setSelectedRoomIndex(5)} className="cursor-pointer transition-all duration-200">
              <rect
                x="550"
                y="245"
                width="120"
                height="100"
                fill={selectedRoomIndex === 5 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 5 ? 2 : 1}
              />
              <text x="610" y="280" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                BEDROOM 3 (20 m²)
              </text>
              <text x="610" y="305" fill="#94A3B8" fontSize="8" textAnchor="middle">En-Suite Mandiri</text>
            </g>

            {/* Room 6: Gourmet Kitchen & Maid Suite (Bottom-Right) */}
            <g onClick={() => setSelectedRoomIndex(6)} className="cursor-pointer transition-all duration-200">
              <rect
                x="420"
                y="345"
                width="250"
                height="90"
                fill={selectedRoomIndex === 6 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.08)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 6 ? 2 : 1}
              />
              <text x="545" y="375" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                GOURMET KITCHEN & MAID (22 m²)
              </text>
              <text x="545" y="405" fill="#94A3B8" fontSize="8" textAnchor="middle">Commercial Wet Kitchen + Wine Cellar + Maid Suite</text>
            </g>

            {/* Compass */}
            {renderCompass(640, 50, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 6. THE SAPPHIRE DUPLEX (Baskara - 250 m² Duplex 2 Lantai)
      // Rooms: 0: Sky Terrace & Pool, 1: Double-Height Salon, 2: Master Suite, 3: Junior Suite, 4: Guest Beds, 5: Kitchen
      // ==========================================
      case 'sapphire':
        return (
          <svg viewBox="0 0 720 480" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-saph" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="720" height="480" fill="#070B14" />
            <rect width="720" height="480" fill="url(#grid-saph)" />

            <rect x="25" y="25" width="670" height="430" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Room 0: Sky Terrace & Private Plunge Pool (Top Area) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="25"
                width="670"
                height="95"
                fill={selectedRoomIndex === 0 ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.12)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1.5}
              />
              <rect x="250" y="35" width="220" height="70" fill="rgba(56,189,248,0.25)" stroke="#38BDF8" strokeWidth="1" rx="4" />
              <text x="360" y="65" fill="#E0F2FE" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                PRIVATE PLUNGE POOL (25 m²)
              </text>
              <text x="360" y="85" fill="#38BDF8" fontSize="9" textAnchor="middle">Air Hangat · Horizon Panorama ({unit.orientation})</text>
            </g>

            {/* Room 1: Double-Height Living Salon (Left Center) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="120"
                width="360"
                height="230"
                fill={selectedRoomIndex === 1 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="205" y="150" fill="#F3E5AB" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                DOUBLE-HEIGHT SALON (6.2m Void · 50 m²)
              </text>
              <rect x="65" y="175" width="160" height="80" fill="rgba(212,175,55,0.15)" stroke="#D4AF37" strokeWidth="0.8" rx="4" />
              <text x="145" y="215" fill="#D4AF37" fontSize="10" textAnchor="middle">Minotti Bespoke Lounge</text>
              
              {/* Spiral Staircase to Mezzanine */}
              <circle cx="310" cy="225" r="32" fill="rgba(243,229,171,0.08)" stroke="#F3E5AB" strokeWidth="1.2" />
              <text x="310" y="228" fill="#F3E5AB" fontSize="9" textAnchor="middle">Tangga Spiral Duplex</text>
            </g>

            {/* Room 2: Master Presidential Suite (Lt. 2 Mezzanine) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="385"
                y="120"
                width="310"
                height="120"
                fill={selectedRoomIndex === 2 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.06)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="540" y="148" fill="#F3E5AB" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER SUITE (Lt. 2 · 38 m²)
              </text>
              <text x="540" y="175" fill="#D4AF37" fontSize="9" textAnchor="middle">Jacuzzi Kaca Menghadap Sunset</text>
            </g>

            {/* Room 3: Junior Suite (En-Suite Lt. 2) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="385"
                y="240"
                width="310"
                height="110"
                fill={selectedRoomIndex === 3 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.07)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="540" y="275" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                JUNIOR SUITE (Lt. 2 · 22 m²)
              </text>
              <text x="540" y="305" fill="#94A3B8" fontSize="9" textAnchor="middle">Kamar Mandi Marmer Mandiri</text>
            </g>

            {/* Bottom Row: Private Lift Lobby + Kitchen + Guest Beds */}
            {/* Private Lift Lobby */}
            <g className="cursor-pointer">
              <rect x="25" y="350" width="160" height="105" fill="rgba(212,175,55,0.18)" stroke="#D4AF37" strokeWidth="1.2" />
              <text x="105" y="385" fill="#F3E5AB" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                PRIVATE LIFT LOBBY
              </text>
              <rect x="80" y="395" width="50" height="25" fill="#0B0F19" stroke="#D4AF37" strokeWidth="0.8" />
              <text x="105" y="412" fill="#D4AF37" fontSize="9" textAnchor="middle">LIFT</text>
              <text x="105" y="440" fill="#94A3B8" fontSize="8" textAnchor="middle">Pemindai Retina</text>
            </g>

            {/* Room 5: Commercial Gourmet Kitchen */}
            <g onClick={() => setSelectedRoomIndex(5)} className="cursor-pointer transition-all duration-200">
              <rect
                x="185"
                y="350"
                width="230"
                height="105"
                fill={selectedRoomIndex === 5 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.08)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 5 ? 2 : 1}
              />
              <text x="300" y="385" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                GOURMET KITCHEN (18 m²)
              </text>
              <text x="300" y="410" fill="#94A3B8" fontSize="8" textAnchor="middle">Wine Cooler & Maid Quarters</text>
            </g>

            {/* Room 4: 2 Guest Bedrooms (En-Suite Lt. 1) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="415"
                y="350"
                width="280"
                height="105"
                fill={selectedRoomIndex === 4 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="555" y="385" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                2 GUEST BEDROOMS (Lt. 1 · 40 m²)
              </text>
              <text x="555" y="410" fill="#94A3B8" fontSize="8" textAnchor="middle">Dua Kamar Tamu Mandiri En-Suite</text>
            </g>

            {/* Compass */}
            {renderCompass(660, 50, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 7. THE DIAMOND SKY VILLA (Baskara - 380 m² Satu Sayap Penuh · Helipad Link)
      // Rooms: 0: Private Lift Foyer, 1: Grand Salon, 2: Master Wing, 3: VIP Guest, 4: Family Beds, 5: Chef Kitchen, 6: Butler, 7: Balcony
      // ==========================================
      case 'diamond':
        return (
          <svg viewBox="0 0 760 500" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-dia" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="760" height="500" fill="#070B14" />
            <rect width="760" height="500" fill="url(#grid-dia)" />

            <rect x="20" y="20" width="720" height="460" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Room 7: Wrap-Around Panoramic Balcony (180° Top Arch) */}
            <g onClick={() => setSelectedRoomIndex(7)} className="cursor-pointer transition-all duration-200">
              <path
                d="M 20,20 L 740,20 L 740,75 L 20,75 Z"
                fill={selectedRoomIndex === 7 ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.1)'}
                stroke="#10B981"
                strokeWidth={selectedRoomIndex === 7 ? 2 : 1.5}
                strokeDasharray="4 2"
              />
              <text x="380" y="52" fill="#10B981" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                BALKON MELINGKAR 180° ({unit.orientation === 'North' ? 'PANORAMA MONAS & UTARA' : 'PANORAMA SCBD & SELATAN'} · 50 m²)
              </text>
            </g>

            {/* Room 0: Private Lift Foyer & Gallery (Center-Left) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="20"
                y="75"
                width="160"
                height="150"
                fill={selectedRoomIndex === 0 ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.12)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1.5}
              />
              <text x="100" y="105" fill="#F3E5AB" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                PRIVATE LIFT FOYER
              </text>
              <rect x="70" y="120" width="60" height="35" fill="#0B0F19" stroke="#D4AF37" strokeWidth="1" />
              <text x="100" y="142" fill="#D4AF37" fontSize="10" textAnchor="middle" fontWeight="bold">LIFT VVIP</text>
              <text x="100" y="180" fill="#D4AF37" fontSize="8" textAnchor="middle">Direct Helipad Link</text>
              <text x="100" y="200" fill="#94A3B8" fontSize="8" textAnchor="middle">Gallery Foyer (25 m²)</text>
            </g>

            {/* Room 1: Grand Presidential Salon & Ballroom (Center) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="180"
                y="75"
                width="340"
                height="250"
                fill={selectedRoomIndex === 1 ? 'rgba(212,175,55,0.28)' : 'rgba(243,229,171,0.06)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="350" y="110" fill="#F3E5AB" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                GRAND PRESIDENTIAL SALON (95 m²)
              </text>
              <rect x="220" y="140" width="160" height="75" fill="rgba(212,175,55,0.12)" stroke="#D4AF37" strokeWidth="0.8" rx="4" />
              <text x="300" y="180" fill="#D4AF37" fontSize="10" textAnchor="middle">State Banquet (20 Seats)</text>
              <rect x="400" y="140" width="100" height="85" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeWidth="0.8" rx="3" />
              <text x="450" y="185" fill="#D4AF37" fontSize="9" textAnchor="middle">Grand Piano & Salon</text>
            </g>

            {/* Room 2: Master Presidential Wing (Right) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="520"
                y="75"
                width="220"
                height="250"
                fill={selectedRoomIndex === 2 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="630" y="110" fill="#F3E5AB" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER WING (70 m²)
              </text>
              <text x="630" y="150" fill="#D4AF37" fontSize="9" textAnchor="middle">Private Study & Dual Wardrobes</text>
              <circle cx="630" cy="220" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
              <text x="630" y="225" fill="#F3E5AB" fontSize="8" textAnchor="middle">Crystal Spa Bath</text>
            </g>

            {/* Room 3: VIP Guest Suite (Bottom-Left) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="20"
                y="225"
                width="160"
                height="130"
                fill={selectedRoomIndex === 3 ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.08)'}
                stroke="#A855F7"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="100" y="260" fill="#E9D5FF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                VIP GUEST SUITE
              </text>
              <text x="100" y="285" fill="#C084FC" fontSize="9" textAnchor="middle">(35 m² · Akses Terpisah)</text>
              <text x="100" y="315" fill="#94A3B8" fontSize="8" textAnchor="middle">Kamar Mandi En-Suite Mandiri</text>
            </g>

            {/* Room 4: 2 En-Suite Family Bedrooms (Center Bottom) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="180"
                y="325"
                width="240"
                height="155"
                fill={selectedRoomIndex === 4 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="300" y="365" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                2 FAMILY BEDROOMS (50 m²)
              </text>
              <text x="300" y="395" fill="#94A3B8" fontSize="9" textAnchor="middle">Masing-masing 25 m² En-Suite</text>
            </g>

            {/* Room 5: Chef Wet & Dry Kitchen (Right Bottom Left) */}
            <g onClick={() => setSelectedRoomIndex(5)} className="cursor-pointer transition-all duration-200">
              <rect
                x="420"
                y="325"
                width="180"
                height="155"
                fill={selectedRoomIndex === 5 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.08)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 5 ? 2 : 1}
              />
              <text x="510" y="365" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                CHEF KITCHEN (35 m²)
              </text>
              <text x="510" y="395" fill="#94A3B8" fontSize="8" textAnchor="middle">Wet & Dry Kitchen Hotel Standard</text>
            </g>

            {/* Room 6: Butler Quarters & Utility (Far Right Bottom) */}
            <g onClick={() => setSelectedRoomIndex(6)} className="cursor-pointer transition-all duration-200">
              <rect
                x="600"
                y="325"
                width="140"
                height="155"
                fill={selectedRoomIndex === 6 ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.08)'}
                stroke="#94A3B8"
                strokeWidth={selectedRoomIndex === 6 ? 2 : 1}
              />
              <text x="670" y="365" fill="#F3E5AB" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                BUTLER QUARTERS
              </text>
              <text x="670" y="395" fill="#94A3B8" fontSize="8" textAnchor="middle">(20 m² · 2 Staff Quarters)</text>
            </g>

            {/* Compass */}
            {renderCompass(700, 48, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 8. THE BASWARA PENTHOUSE (Arunika - 250 m² Duplex Lt. 34-35)
      // Rooms: 0: Sky Pool, 1: Double-Height Salon, 2: Master Suite, 3: 3 Guest Beds, 4: Kitchen, 5: Foyer
      // ==========================================
      case 'penthouse':
        return (
          <svg viewBox="0 0 720 480" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-pent" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="720" height="480" fill="#070B14" />
            <rect width="720" height="480" fill="url(#grid-pent)" />

            <rect x="25" y="25" width="670" height="430" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Room 0: Private Sky Pool & Terrace (Top) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="25"
                width="670"
                height="100"
                fill={selectedRoomIndex === 0 ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.12)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 0 ? 2 : 1.5}
              />
              <rect x="220" y="35" width="280" height="75" fill="rgba(56,189,248,0.25)" stroke="#38BDF8" strokeWidth="1" rx="4" />
              <text x="360" y="70" fill="#E0F2FE" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                PRIVATE SKY SWIMMING POOL (50 m²)
              </text>
              <text x="360" y="92" fill="#38BDF8" fontSize="9" textAnchor="middle">Air Hangat Ozon · Ketinggian Lantai 35</text>
            </g>

            {/* Room 1: Grand Double-Height Salon (Left) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="125"
                width="360"
                height="225"
                fill={selectedRoomIndex === 1 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="205" y="155" fill="#F3E5AB" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                GRAND DOUBLE-HEIGHT SALON (65 m²)
              </text>
              <rect x="70" y="180" width="160" height="75" fill="rgba(212,175,55,0.12)" stroke="#D4AF37" strokeWidth="0.8" rx="4" />
              <text x="150" y="220" fill="#D4AF37" fontSize="10" textAnchor="middle">6.5m Double Void Ceiling</text>
              <circle cx="310" cy="225" r="30" fill="rgba(243,229,171,0.08)" stroke="#F3E5AB" strokeWidth="1.2" />
              <text x="310" y="230" fill="#F3E5AB" fontSize="8" textAnchor="middle">Tangga Spiral Kaca</text>
            </g>

            {/* Room 2: Master Presidential Suite (Right Top) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="385"
                y="125"
                width="310"
                height="120"
                fill={selectedRoomIndex === 2 ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="540" y="155" fill="#F3E5AB" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                MASTER SUITE (45 m²)
              </text>
              <text x="540" y="180" fill="#D4AF37" fontSize="9" textAnchor="middle">Boutique Dressing & Marble Jacuzzi</text>
            </g>

            {/* Room 3: 3 Guest En-Suite Bedrooms (Right Middle) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="385"
                y="245"
                width="310"
                height="105"
                fill={selectedRoomIndex === 3 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="540" y="280" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                3 GUEST SUITES (55 m²)
              </text>
              <text x="540" y="305" fill="#94A3B8" fontSize="8" textAnchor="middle">Tiga Kamar Tidur En-Suite Penuh</text>
            </g>

            {/* Room 5: Foyer & Entrance Gallery (Bottom-Left) */}
            <g onClick={() => setSelectedRoomIndex(5)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="350"
                width="200"
                height="105"
                fill={selectedRoomIndex === 5 ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.1)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 5 ? 2 : 1}
              />
              <text x="125" y="385" fill="#F3E5AB" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                FOYER & GALLERY (15 m²)
              </text>
              <text x="125" y="415" fill="#94A3B8" fontSize="8" textAnchor="middle">Pintu Ganda Smart Biometric</text>
            </g>

            {/* Room 4: Gourmet Kitchen Wet & Dry (Bottom-Right) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="225"
                y="350"
                width="470"
                height="105"
                fill={selectedRoomIndex === 4 ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.08)'}
                stroke="#F59E0B"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="460" y="385" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                GOURMET KITCHEN WET & DRY (20 m²)
              </text>
              <text x="460" y="415" fill="#94A3B8" fontSize="8" textAnchor="middle">Miele Appliances & Calacatta Marble Island</text>
            </g>

            {/* Compass */}
            {renderCompass(660, 50, orientationDegrees)}
          </svg>
        );

      // ==========================================
      // 9. THE BASKARA CROWN (Triplex Puncak 750 m² · Lt. 33-35)
      // Rooms: 0: Floating Pool, 1: Private Cinema, 2: Imperial Suite, 3: Royal Suites, 4: Banquet Hall, 5: Glass Lift & Helipad
      // ==========================================
      case 'crown':
      default:
        return (
          <svg viewBox="0 0 760 500" className="w-full h-full select-none">
            <defs>
              <pattern id="grid-cr" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="760" height="500" fill="#070B14" />
            <rect width="760" height="500" fill="url(#grid-cr)" />

            <rect x="25" y="25" width="710" height="450" fill="none" stroke="#D4AF37" strokeWidth="3" />

            {/* Room 0: Floating Infinity Pool (Top) */}
            <g onClick={() => setSelectedRoomIndex(0)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="25"
                width="710"
                height="100"
                fill={selectedRoomIndex === 0 ? 'rgba(56,189,248,0.38)' : 'rgba(56,189,248,0.15)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 0 ? 2.5 : 1.5}
              />
              <rect x="230" y="35" width="300" height="75" fill="rgba(56,189,248,0.3)" stroke="#38BDF8" strokeWidth="1" rx="4" />
              <text x="380" y="72" fill="#E0F2FE" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                FLOATING INFINITY POOL (Lt. 34 · 80 m²)
              </text>
              <text x="380" y="94" fill="#38BDF8" fontSize="9" textAnchor="middle">Kolam Kaca Melayang Kantilever 360° Horison</text>
            </g>

            {/* Room 4: Diplomatic Banquet Hall (Center-Left) */}
            <g onClick={() => setSelectedRoomIndex(4)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="125"
                width="380"
                height="230"
                fill={selectedRoomIndex === 4 ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 4 ? 2 : 1}
              />
              <text x="215" y="160" fill="#F3E5AB" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                DIPLOMATIC BANQUET HALL (140 m²)
              </text>
              <rect x="75" y="190" width="180" height="80" fill="rgba(212,175,55,0.12)" stroke="#D4AF37" strokeWidth="0.8" rx="4" />
              <text x="165" y="235" fill="#D4AF37" fontSize="10" textAnchor="middle">Jamuan 30 Orang & Steinway Grand</text>
            </g>

            {/* Room 2: Imperial Master Suite (Center-Right) */}
            <g onClick={() => setSelectedRoomIndex(2)} className="cursor-pointer transition-all duration-200">
              <rect
                x="405"
                y="125"
                width="330"
                height="230"
                fill={selectedRoomIndex === 2 ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.08)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 2 ? 2 : 1}
              />
              <text x="570" y="160" fill="#F3E5AB" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                IMPERIAL MASTER SUITE (Lt. 35 · 120 m²)
              </text>
              <text x="570" y="200" fill="#D4AF37" fontSize="10" textAnchor="middle">Salon Pribadi, Sauna Inframerah & Sky Deck</text>
            </g>

            {/* Room 1: Private Cinema 12-Seat (Bottom-Left) */}
            <g onClick={() => setSelectedRoomIndex(1)} className="cursor-pointer transition-all duration-200">
              <rect
                x="25"
                y="355"
                width="220"
                height="120"
                fill={selectedRoomIndex === 1 ? 'rgba(168,85,247,0.35)' : 'rgba(168,85,247,0.1)'}
                stroke="#A855F7"
                strokeWidth={selectedRoomIndex === 1 ? 2 : 1}
              />
              <text x="135" y="390" fill="#E9D5FF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                PRIVATE CINEMA 12-SEAT
              </text>
              <text x="135" y="415" fill="#C084FC" fontSize="9" textAnchor="middle">(Lt. 33 · 50 m² Dolby Atmos)</text>
            </g>

            {/* Room 3: 4 Guest Royal En-Suites (Bottom-Center) */}
            <g onClick={() => setSelectedRoomIndex(3)} className="cursor-pointer transition-all duration-200">
              <rect
                x="245"
                y="355"
                width="280"
                height="120"
                fill={selectedRoomIndex === 3 ? 'rgba(56,189,248,0.28)' : 'rgba(56,189,248,0.08)'}
                stroke="#38BDF8"
                strokeWidth={selectedRoomIndex === 3 ? 2 : 1}
              />
              <text x="385" y="390" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                4 ROYAL EN-SUITES (120 m²)
              </text>
              <text x="385" y="415" fill="#94A3B8" fontSize="8" textAnchor="middle">Empat Kamar Tidur Tamu Kerajaan</text>
            </g>

            {/* Room 5: Private Glass Lift & Helipad Link (Bottom-Right) */}
            <g onClick={() => setSelectedRoomIndex(5)} className="cursor-pointer transition-all duration-200">
              <rect
                x="525"
                y="355"
                width="210"
                height="120"
                fill={selectedRoomIndex === 5 ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.15)'}
                stroke="#D4AF37"
                strokeWidth={selectedRoomIndex === 5 ? 2 : 1.5}
              />
              <text x="630" y="390" fill="#F3E5AB" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                GLASS LIFT & HELIPAD
              </text>
              <rect x="605" y="405" width="50" height="30" fill="#0B0F19" stroke="#D4AF37" strokeWidth="1" />
              <text x="630" y="425" fill="#D4AF37" fontSize="10" textAnchor="middle" fontWeight="bold">HELIPAD</text>
              <text x="630" y="455" fill="#94A3B8" fontSize="8" textAnchor="middle">Lift Kaca 3 Lantai (30 m²)</text>
            </g>

            {/* Compass */}
            {renderCompass(700, 50, orientationDegrees)}
          </svg>
        );
    }
  };

  // Helper to render dynamic architectural compass rose
  function renderCompass(x: number, y: number, degrees: number) {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* Background Dial */}
        <circle cx="0" cy="0" r="16" fill="#0B0F19" stroke="#D4AF37" strokeWidth="1" />
        <circle cx="0" cy="0" r="13" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
        
        {/* Needle rotated to actual orientation degrees */}
        <g transform={`rotate(${degrees})`}>
          <polygon points="0,-12 4,2 0,-1 -4,2" fill="#D4AF37" />
          <polygon points="0,12 4,-2 0,1 -4,-2" fill="#64748B" />
        </g>

        {/* Cardinal Points */}
        <text x="0" y="-18" fill="#D4AF37" fontSize="8" textAnchor="middle" fontWeight="bold">N</text>
        <text x="0" y="24" fill="#64748B" fontSize="7" textAnchor="middle">S</text>
        <text x="21" y="2" fill="#64748B" fontSize="7" textAnchor="middle">E</text>
        <text x="-21" y="2" fill="#64748B" fontSize="7" textAnchor="middle">W</text>
      </g>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Architectural Specs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#070B14] border border-[#D4AF37]/30 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Dimensi Denah</span>
          <span className="font-mono text-white text-xs font-semibold">{fp.dimensions}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Tinggi Plafon (Ceiling)</span>
          <span className="font-mono text-[#D4AF37] text-xs font-semibold">{fp.ceilingHeight}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Balkon / Teras</span>
          <span className="font-mono text-emerald-400 text-xs truncate block">{fp.balconyType}</span>
        </div>
      </div>

      {/* SVG Blueprint Canvas */}
      <div className="relative border border-[#D4AF37]/50 overflow-hidden shadow-2xl bg-[#070B14] rounded-sm">
        <div className="w-full aspect-[16/10] max-h-[400px] flex items-center justify-center p-2">
          {renderBlueprintSvg()}
        </div>

        <div className="p-2.5 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Ruler size={13} className="text-[#D4AF37]" />
            <span>Zona ruangan terpilih pada denah:</span>
          </span>
          <span className="font-mono text-[#D4AF37] text-[10px] font-semibold">
            {activeRoom.name} ({activeRoom.sizeM2} m² · {activeRoom.dimensions})
          </span>
        </div>
      </div>

      {/* Architectural Highlights */}
      {fp.architecturalHighlights && fp.architecturalHighlights.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[11px] font-mono uppercase text-[#D4AF37] block mb-2">
            Keunggulan Tata Ruang & Sirkulasi:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fp.architecturalHighlights.map((hl, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 size={13} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
