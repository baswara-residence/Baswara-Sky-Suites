export interface RoomDetail {
  name: string;
  sizeM2: number;
  dimensions: string;
  description: string;
}

export interface UnitFloorPlan {
  schematicType: 'studio' | '1br' | '2br' | '3br' | 'emerald' | 'sapphire' | 'diamond' | 'penthouse' | 'crown';
  dimensions: string;
  ceilingHeight: string;
  balconyType: string;
  privateElevator: boolean;
  rooms: RoomDetail[];
  architecturalHighlights: string[];
}

export interface OrientationDetail {
  heading: 'North-West' | 'North-East' | 'South-West' | 'South-East' | 'North' | 'South' | 'All' | 'The Crown';
  cardinalLabelId: string;
  degrees: number;
  sunlightProfile: string;
  viewLandmarks: string[];
  ambientDescription: string;
  recommendedFor: string;
}

export interface Unit {
  id: string;
  name: string;
  tower: 'Arunika' | 'Baskara';
  type: string;
  sizeM2: number;
  bedrooms: number;
  bathrooms: number;
  capacity: string;
  pricePerMonth: number;
  highlights: string[];
  description: string;
  levelRange: string;
  furnishing: 'Full Furnished Luxury' | 'Semi Furnished' | 'Ultra-Luxury Bespoke';
  view: string;
  position: string;
  orientation?: 'North-West' | 'North-East' | 'South-West' | 'South-East' | 'North' | 'South' | 'All' | 'The Crown';
  floorLayoutNote?: string;
  orientationAnalysis?: OrientationDetail;
  availableOrientations?: OrientationDetail[];
  floorPlan?: UnitFloorPlan;
}

export const getUnitMaxCapacity = (unit: Unit): number => {
  const matches = unit.capacity.match(/\d+/g);
  if (!matches || matches.length === 0) return 2;
  return Math.max(...matches.map(Number));
};

export const UNITS_DATA: Unit[] = [
  // ==========================================
  // TOWER ARUNIKA
  // Lantai 7 - 33: Dalam satu lantai ada unit Studio - 3BR
  // Lantai 34 - 35: The Baswara Penthouse
  // ==========================================
  {
    id: 'arunika-studio',
    name: 'Studio Executive',
    tower: 'Arunika',
    type: 'Studio',
    sizeM2: 32,
    bedrooms: 0,
    bathrooms: 1,
    capacity: '1 - 2 Orang',
    pricePerMonth: 5500000,
    position: 'Middle Unit',
    floorLayoutNote: 'Lantai 7 - 33 (Tersedia berdampingan Studio hingga 3BR dalam satu lantai)',
    levelRange: 'Lantai 7 - 33',
    furnishing: 'Full Furnished Luxury',
    view: 'Menteng Cityscape View',
    highlights: [
      'Open-plan layout efisien nan elegan',
      '1 Kamar Mandi modern & pantry marmer',
      'Balkon privat menghadap panorama kota',
      'Full-Furnished: Smart TV, sofa desainer, lemari built-in, kulkas 2 pintu & microwave',
      'Smart Home System & Smart Door Lock (biometrik, PIN, RFID)'
    ],
    description: 'Unit efisien nan elegan di Lantai 7-33 yang dirancang khusus bagi profesional dinamis, berada dalam satu lantai terintegrasi bersama tipe 1BR hingga 3BR.',
    orientationAnalysis: {
      heading: 'North',
      cardinalLabelId: 'Utara (North) · Cityscape',
      degrees: 0,
      sunlightProfile: 'Pencahayaan Alami Stabil & Teduh — Menerima cahaya matahari seimbang sepanjang hari tanpa panas berlebih dari terik barat.',
      viewLandmarks: ['Koridor Kusuma Menteng', 'Skyline Kota Jakarta Pusat', 'Taman Hijau Menteng'],
      ambientDescription: 'Orientasi utara yang tenang dengan sirkulasi angin sejuk dari balkon privat, sempurna untuk konsentrasi kerja dan istirahat.',
      recommendedFor: 'Profesional muda, ekspatriat dinamis, dan pasangan modern yang mendambakan kepraktisan hunian bintang lima.'
    },
    floorPlan: {
      schematicType: 'studio',
      dimensions: '8.0 m x 4.0 m',
      ceilingHeight: '3.2 meter',
      balconyType: 'Balkon Kaca Tempered Privat (1.5 m x 3.0 m)',
      privateElevator: false,
      rooms: [
        { name: 'Living & Bedroom Zone', sizeM2: 20, dimensions: '5.0 m x 4.0 m', description: 'Area open-plan luas dengan kasur ortopedik queen-size, lemari tanam, dan smart TV rotasi.' },
        { name: 'Kitchenette & Pantry', sizeM2: 5, dimensions: '2.5 m x 2.0 m', description: 'Countertop marmer granit, kompor induksi tanam, microwave, dan kulkas dua pintu.' },
        { name: 'Luxury Bathroom', sizeM2: 4, dimensions: '2.0 m x 2.0 m', description: 'Sanitary Toto Neorest, shower kaca walk-in, dan ventilasi exhaust otomatis.' },
        { name: 'Private Balcony', sizeM2: 3, dimensions: '1.0 m x 3.0 m', description: 'Balkon menghadap panorama kota Menteng dengan railing kaca tebal.' }
      ],
      architecturalHighlights: [
        'Tata ruang open-plan tanpa sekat masif untuk memaksimalkan kelapangan',
        'Jendela kaca double-glazed setinggi lantai ke plafon kedap suara',
        'Lemari built-in dengan pencahayaan LED internal otomatis'
      ]
    }
  },
  {
    id: 'arunika-1br',
    name: '1 Bedroom',
    tower: 'Arunika',
    type: '1 Bedroom',
    sizeM2: 45,
    bedrooms: 1,
    bathrooms: 1,
    capacity: '2 Orang',
    pricePerMonth: 9500000,
    position: 'Middle Unit',
    floorLayoutNote: 'Lantai 7 - 33 (Tersedia berdampingan Studio hingga 3BR dalam satu lantai)',
    levelRange: 'Lantai 7 - 33',
    furnishing: 'Full Furnished Luxury',
    view: 'Central Jakarta Skyline',
    highlights: [
      '1 Kamar Tidur luas dengan tempat tidur ortopedik king-size',
      '1 Kamar Mandi marmer & living area terpisah',
      'Kitchen set lengkap dengan kompor induksi & microwave',
      'Full-Furnished premium & pencahayaan suasana otomatis',
      'Smart Home System terintegrasi smartphone'
    ],
    description: 'Keseimbangan ideal antara privasi kamar tidur dan ruang bersantai lapang untuk eksekutif muda di lantai residensial terpadu Tower Arunika.',
    orientationAnalysis: {
      heading: 'North-East',
      cardinalLabelId: 'Timur Laut (North-East) · Morning Sun',
      degrees: 45,
      sunlightProfile: 'Cahaya Fajar Sejuk — Menerima sinar matahari pagi yang segar, menciptakan suasana cerah bersemangat tanpa hawa panas di sore hari.',
      viewLandmarks: ['Pemandangan Fajar Menteng', 'Jalan Boulevard Kusuma', 'Kawasan Hijau Cagar Budaya'],
      ambientDescription: 'Orientasi fajar yang membawa energi positif di pagi hari dan keteduhan relaksasi di penghujung hari kerja.',
      recommendedFor: 'Eksekutif korporat, diplomat muda, atau pasangan baru menikah.'
    },
    floorPlan: {
      schematicType: '1br',
      dimensions: '9.0 m x 5.0 m',
      ceilingHeight: '3.2 meter',
      balconyType: 'Balkon Kamar & Living Room (1.5 m x 3.5 m)',
      privateElevator: false,
      rooms: [
        { name: 'Master Bedroom', sizeM2: 18, dimensions: '4.5 m x 4.0 m', description: 'Tempat tidur King-size ortopedik, meja rias/kerja, dan lemari pakaian sliding 3 pintu.' },
        { name: 'Living & Dining Room', sizeM2: 17, dimensions: '4.5 m x 3.8 m', description: 'Sofa desainer 3-seater, meja makan marmer 2 kursi, dan Smart TV OLED 55 inci.' },
        { name: 'Full Kitchen', sizeM2: 5, dimensions: '2.5 m x 2.0 m', description: 'Kitchen set lengkap, kompor induksi ganda, cooker hood, dan microwave grill.' },
        { name: 'Master Bathroom', sizeM2: 5, dimensions: '2.5 m x 2.0 m', description: 'Kamar mandi marmer dengan rain shower termostatik dan cermin kabinet LED.' }
      ],
      architecturalHighlights: [
        'Zonasi privasi tegas antara kamar tidur pribadi dan living room publik',
        'Akses balkon langsung dari living room dengan pintu kaca geser kedap suara'
      ]
    }
  },
  {
    id: 'arunika-2br',
    name: '2 Bedrooms',
    tower: 'Arunika',
    type: '2 Bedrooms',
    sizeM2: 68,
    bedrooms: 2,
    bathrooms: 1,
    capacity: '3 - 4 Orang',
    pricePerMonth: 23000000,
    position: 'Transisi Sudut',
    floorLayoutNote: 'Lantai 7 - 33 (Tersedia berdampingan Studio hingga 3BR dalam satu lantai)',
    levelRange: 'Lantai 7 - 33',
    furnishing: 'Full Furnished Luxury',
    view: 'Kusuma Boulevard View',
    highlights: [
      '2 Kamar Tidur luas & 1 Kamar Mandi mewah',
      'Grand living & dining room terhubung lapang',
      'Full kitchen dengan island counter granit',
      'Posisi transisi sudut dengan sirkulasi cahaya maksimal',
      'Smart Home AC multi-zona & Smart Door Lock biometrik'
    ],
    description: 'Pilihan favorit keluarga modern yang mengutamakan kelapangan ruang berkumpul, berada di posisi transisi sudut lantai 7-33.',
    orientationAnalysis: {
      heading: 'South-East',
      cardinalLabelId: 'Tenggara (South-East) · Dual Aspect',
      degrees: 135,
      sunlightProfile: 'Sinar Pagi Hangat & Terang Alami — Pencahayaan merata ke dua sudut ruang berkat jendela sudut ganda yang lapang.',
      viewLandmarks: ['Boulevard Kusuma', 'Kawasan Kedutaan Rasuna Said', 'Taman Kota Sudirman Timur'],
      ambientDescription: 'Posisi transisi sudut gedung memberikan aliran udara silang (cross ventilation) alami yang menjaga kesegaran hunian sepanjang hari.',
      recommendedFor: 'Keluarga modern dengan anak atau penghuni yang membutuhkan ruang kerja terpisah.'
    },
    floorPlan: {
      schematicType: '2br',
      dimensions: '10.0 m x 6.8 m',
      ceilingHeight: '3.3 meter',
      balconyType: 'Balkon Sudut Menghadap Boulevard (1.8 m x 4.0 m)',
      privateElevator: false,
      rooms: [
        { name: 'Master Bedroom', sizeM2: 22, dimensions: '5.0 m x 4.4 m', description: 'Kamar tidur utama dengan kasur King-size, meja kerja terintegrasi, dan walk-in wardrobe.' },
        { name: 'Secondary Bedroom', sizeM2: 14, dimensions: '3.8 m x 3.7 m', description: 'Kamar tidur anak / ruang kerja dengan kasur Queen-size dan meja belajar ergonomis.' },
        { name: 'Grand Living & Dining', sizeM2: 22, dimensions: '5.5 m x 4.0 m', description: 'Ruang keluarga lapang dengan meja makan marmer 4 kursi dan sofa L-shape.' },
        { name: 'Island Gourmet Kitchen', sizeM2: 6, dimensions: '3.0 m x 2.0 m', description: 'Dapur modern dengan counter bar island granit dan perabot tanam premium.' },
        { name: 'Family Bathroom', sizeM2: 4, dimensions: '2.2 m x 1.8 m', description: 'Kamar mandi marmer berpartisi kaca tempered dengan double vanity mirror.' }
      ],
      architecturalHighlights: [
        'Orientasi sudut dengan dua sisi jendela untuk pencahayaan alami maksimal',
        'Kitchen island fungsional yang menyatu estetis dengan ruang makan'
      ]
    }
  },
  {
    id: 'arunika-3br-corner',
    name: '3 Bedrooms',
    tower: 'Arunika',
    type: '3 Bedrooms',
    sizeM2: 110,
    bedrooms: 3,
    bathrooms: 2,
    capacity: '4 - 6 Orang',
    pricePerMonth: 38000000,
    position: 'Corner Unit',
    floorLayoutNote: 'Lantai 7 - 33 (Tersedia berdampingan Studio hingga 3BR dalam satu lantai)',
    levelRange: 'Lantai 7 - 33',
    furnishing: 'Full Furnished Luxury',
    view: 'Panoramic 180° Menteng & Jakarta Skyline',
    highlights: [
      '3 Kamar Tidur & 2 Kamar Mandi (1 En-suite + Bathtub)',
      'Maid room (kamar asisten mandiri) & area utilitas terpisah',
      'Balkon ganda dengan sudut pandang panorama 180°',
      'Master bedroom dengan walk-in closet elegan',
      'Alokasi 2 dedicated parking slot di basement'
    ],
    description: 'Unit sudut prestisius di Lantai 7-33 dengan pemandangan 180 derajat tanpa halangan, menyempurnakan konfigurasi lengkap satu lantai Tower Arunika.',
    orientationAnalysis: {
      heading: 'South-West',
      cardinalLabelId: 'Sudut Barat Daya (South-West) · 180° Panoramic',
      degrees: 225,
      sunlightProfile: 'Pencahayaan Spektakuler Sore Hari — Sudut pandang 180 derajat yang memadukan kehangatan golden hour dengan pemandangan lampu metropolitan di malam hari.',
      viewLandmarks: ['Menteng Historic Quarter', 'Segitiga Emas Sudirman-Thamrin', 'Panorama Senja Barat'],
      ambientDescription: 'Dua sisi dinding kaca sudut menghadirkan panorama cakrawala ibukota yang dramatis dari siang hingga gemerlap malam hari.',
      recommendedFor: 'Keluarga mapan, diplomat senior, dan ekspatriat level direksi.'
    },
    floorPlan: {
      schematicType: '3br',
      dimensions: '12.5 m x 8.8 m',
      ceilingHeight: '3.4 meter',
      balconyType: 'Balkon Ganda Panoramik (Living & Master Bedroom)',
      privateElevator: false,
      rooms: [
        { name: 'Master Presidential Suite', sizeM2: 30, dimensions: '6.0 m x 5.0 m', description: 'Kamar utama sudut dengan walk-in closet, bathtub marmer, dan balkon privat.' },
        { name: 'Bedroom 2 (En-Suite View)', sizeM2: 16, dimensions: '4.0 m x 4.0 m', description: 'Kamar kedua dengan lemari built-in dan jendela kaca panorama.' },
        { name: 'Bedroom 3 / Study Suite', sizeM2: 13, dimensions: '3.8 m x 3.4 m', description: 'Kamar multifungsi ideal untuk kamar anak, perpustakaan, atau ruang kerja pribadi.' },
        { name: 'Grand Living & Salon', sizeM2: 32, dimensions: '8.0 m x 4.0 m', description: 'Ruang tamu dan makan megah untuk menjamu 8 orang dengan pemandangan 180 derajat.' },
        { name: 'Chef Kitchen & Utility', sizeM2: 11, dimensions: '3.8 m x 2.9 m', description: 'Dapur lengkap dengan ruang cuci terpisah dan kamar asisten rumah tangga.' },
        { name: 'Bathrooms (2 Units)', sizeM2: 8, dimensions: 'Total 2 Kamar Mandi', description: 'Master bathroom dengan bathtub freestanding marmer + kamar mandi keluarga.' }
      ],
      architecturalHighlights: [
        'Balkon ganda terpisah untuk ruang keluarga dan kamar tidur utama',
        'Kamar asisten mandiri dan akses servis terpisah'
      ]
    }
  },
  {
    id: 'arunika-penthouse',
    name: 'The Baswara Penthouse',
    tower: 'Arunika',
    type: 'Penthouse Duplex',
    sizeM2: 250,
    bedrooms: 4,
    bathrooms: 4,
    capacity: '5 - 8 Orang',
    pricePerMonth: 95000000,
    position: 'The Crown (Lt. 34-35)',
    orientation: 'The Crown',
    floorLayoutNote: 'Lantai 34 - 35 (Mahkota Puncak Tower Arunika)',
    levelRange: 'Lantai 34 - 35',
    furnishing: 'Ultra-Luxury Bespoke',
    view: 'Unobstructed 360° Sky Horizon',
    highlights: [
      'Duplex megah 2 lantai (Lantai 34 - 35) dengan void tinggi',
      '4 Kamar Tidur en-suite & akses lift eksklusif lantai puncak',
      'Private swimming pool & sky terrace terbuka',
      'Wet & dry kitchen dengan peralatan komersial Miele',
      'Alokasi 3 dedicated VIP parking slot di basement'
    ],
    description: 'Mahakarya puncak Tower Arunika yang menaungi Lantai 34-35, menghadirkan private swimming pool di teras langit dan akses lantai penthouse eksklusif.',
    orientationAnalysis: {
      heading: 'The Crown',
      cardinalLabelId: 'Mahkota Puncak 360° (The Crown)',
      degrees: 0,
      sunlightProfile: 'Sirkulasi Surya 360 Derajat Penuh — Menangkap siklus matahari penuh mulai dari fajar Menteng hingga lembayung senja di atas Monas.',
      viewLandmarks: ['Puncak Monas', 'Teluk Jakarta', 'CBD Sudirman-Thamrin', 'Kawasan Hijau Menteng'],
      ambientDescription: 'Ketinggian absolut di lantai 34-35 tanpa tetangga di atas kepala, menghadirkan keheningan sanctuary langit yang agung.',
      recommendedFor: 'Konglomerat, diplomat kepala misi, dan keluarga terkemuka.'
    },
    floorPlan: {
      schematicType: 'penthouse',
      dimensions: '16.0 m x 15.6 m (Duplex 2 Lantai)',
      ceilingHeight: '6.5 meter (Double Void Salon)',
      balconyType: 'Sky Terrace Terbuka dengan Private Swimming Pool',
      privateElevator: false,
      rooms: [
        { name: 'Private Sky Pool & Terrace', sizeM2: 50, dimensions: '10.0 m x 5.0 m', description: 'Kolam renang pribadi melayang di ketinggian lantai 35 dengan dek kayu ulin.' },
        { name: 'Grand Double-Height Salon', sizeM2: 65, dimensions: '10.0 m x 6.5 m', description: 'Ruang tamu dua lantai dengan void menjulang dan tangga spiral kaca artistik.' },
        { name: 'Master Presidential Suite', sizeM2: 45, dimensions: '9.0 m x 5.0 m', description: 'Kamar tidur utama di lantai atas dengan ruang ganti butik dan jacuzzi marmer.' },
        { name: '3 Guest En-Suite Bedrooms', sizeM2: 55, dimensions: 'Rata-rata 18 m² / kamar', description: 'Tiga kamar tidur tamu dengan kamar mandi en-suite dan jendela dinding penuh.' },
        { name: 'Gourmet Kitchen (Wet & Dry)', sizeM2: 20, dimensions: '5.0 m x 4.0 m', description: 'Peralatan komersial Miele, island marmer Calacatta, dan wine storage.' },
        { name: 'Foyer & Entrance Gallery', sizeM2: 15, dimensions: '5.0 m x 3.0 m', description: 'Foyer marmer pribadi unit dengan pintu ganda dan sistem Smart Door Lock biometrik.' }
      ],
      architecturalHighlights: [
        'Akses lift prioritas berkecepatan tinggi menuju lantai penthouse dengan kartu akses RFID',
        'Kolam renang pribadi di atas awan dengan sistem filtrasi air hangat ozon'
      ]
    }
  },

  // ==========================================
  // TOWER BASKARA
  // Lantai 7 – 12 : Zona The Emerald (4 unit sudut per lantai: NW, NE, SW, SE)
  // Lantai 15 – 24: Zona The Sapphire (Duplex Penthouse: NW, NE, SW, SE)
  // Lantai 25 – 32: Zona The Diamond (2 unit Sky Villa: Sayap North & South)
  // Lantai 33 – 35: The Baskara Crown (Flagship Triplex)
  // ==========================================

    // --- ZONA THE EMERALD (Lantai 7 - 12) ---
  {
    id: 'baskara-emerald',
    name: 'The Emerald',
    tower: 'Baskara',
    type: '3-Bedrooms Signature Estate',
    sizeM2: 220,
    bedrooms: 3,
    bathrooms: 3,
    capacity: '4 - 6 Orang',
    pricePerMonth: 65000000,
    position: 'Corner Estate (Lt. 7 - 12)',
    orientation: 'North-West',
    floorLayoutNote: 'Lantai 7 – 12 (Zona The Emerald: 4 unit sudut per lantai)',
    levelRange: 'Lantai 7 - 12',
    furnishing: 'Ultra-Luxury Bespoke',
    view: 'Cakrawala Megah Menteng & Jakarta Vista',
    highlights: [
      '3 Kamar Tidur luas & Foyer marmer privat dengan private elevator',
      'Ruang cerutu (Cigar lounge) & ruang baca kedap suara mandiri',
      'Kamar mandi utama marmer Calacatta dengan Smart Glass elektrik',
      'Balkon melengkung sudut dengan pemandangan cakrawala ibu kota',
      'Akses Baskara Private Club, 2-3 parking slots & Butler 24/7'
    ],
    description: 'Unit sudut mewah di Zona The Emerald (Lt. 7-12) dengan foyer privat, lift biometrik eksklusif, ruang cerutu kedap suara, dan pilihan sudut orientasi panorama cakrawala Jakarta.',
    orientationAnalysis: {
      heading: 'North-West',
      cardinalLabelId: 'Sudut Barat Laut (North-West) · 315°',
      degrees: 315,
      sunlightProfile: 'Golden Hour Sunset Megah — Menerima cahaya matahari sore yang hangat dengan filter kaca UV reflektif ganda, memberikan nuansa magis menjelang senja.',
      viewLandmarks: ['Puncak Tugu Monas', 'Cakrawala Senja Jakarta Barat', 'Lanskap Hijau Menteng Utara'],
      ambientDescription: 'Posisi sudut Barat Laut dirancang khusus bagi pecinta seni dan cerutu yang menikmati keteduhan sore berlatar siluet monumen nasional.',
      recommendedFor: 'Kolektor seni, eksekutif senior, dan diplomat yang mengapresiasi pemandangan senja paling prestisius di Jakarta.'
    },
    availableOrientations: [
      {
        heading: 'North-West',
        cardinalLabelId: 'Sudut Barat Laut (North-West) · 315°',
        degrees: 315,
        sunlightProfile: 'Golden Hour Sunset Megah — Menerima cahaya matahari sore yang hangat dengan filter kaca UV reflektif ganda, memberikan nuansa magis menjelang senja.',
        viewLandmarks: ['Puncak Tugu Monas', 'Cakrawala Senja Jakarta Barat', 'Lanskap Hijau Menteng Utara'],
        ambientDescription: 'Posisi sudut Barat Laut dirancang khusus bagi pecinta seni dan cerutu yang menikmati keteduhan sore berlatar siluet monumen nasional.',
        recommendedFor: 'Kolektor seni, eksekutif senior, dan diplomat yang mengapresiasi pemandangan senja paling prestisius di Jakarta.'
      },
      {
        heading: 'North-East',
        cardinalLabelId: 'Sudut Timur Laut (North-East) · 45°',
        degrees: 45,
        sunlightProfile: 'Cahaya Fajar Sejuk & Segar — Menangkap sinar matahari pagi yang jernih dan menyegarkan, menciptakan atmosfer sejuk alami sepanjang siang.',
        viewLandmarks: ['Menteng Heritage Conservation District', 'Taman Suropati & Cik Ditiro', 'Panorama Matahari Terbit'],
        ambientDescription: 'Menghadap area cagar budaya Menteng yang rindang dengan pohon-pohon peninggalan era kolonial, memberikan panorama hijau asri yang menyejukkan jiwa.',
        recommendedFor: 'Penghuni yang mengutamakan ketenangan alam, fajar segar, dan privasi hijau Menteng.'
      },
      {
        heading: 'South-West',
        cardinalLabelId: 'Sudut Barat Daya (South-West) · 225°',
        degrees: 225,
        sunlightProfile: 'Siluet Senja Perkotaan Dramatis — Menyuguhkan pemandangan matahari terbenam spektakuler yang disusul gemerlap jutaan lampu pencakar langit koridor Sudirman.',
        viewLandmarks: ['Sudirman Central Business District (SCBD)', 'Gedung Menara Astra & BCA', 'Skyline Koridor Thamrin'],
        ambientDescription: 'Energi metropolitan tingkat tinggi yang berpadu dengan keteduhan interior kedap suara The Baswara, menyajikan sanctuary tenang di tengah denyut pusat keuangan.',
        recommendedFor: 'Bankir investasi, pemilik modal ventura, dan pemimpin korporasi multinasional.'
      },
      {
        heading: 'South-East',
        cardinalLabelId: 'Sudut Tenggara (South-East) · 135°',
        degrees: 135,
        sunlightProfile: 'Pencahayaan Pagi Hangat & Lembut — Menerima paparan sinar matahari fajar tanpa hawa panas di siang dan sore hari.',
        viewLandmarks: ['Koridor Kedutaan HR Rasuna Said', 'Taman Menteng Selatan', 'Skyline Mega Kuningan'],
        ambientDescription: 'Perpaduan sudut pandang yang harmonis antara kehijauan rimbun pemukiman Menteng Selatan dan kemegahan distrik diplomatik Rasuna Said.',
        recommendedFor: 'Diplomat asing, keluarga pejabat tinggi, dan individu yang menghargai privasi terlindung.'
      }
    ],
    floorPlan: {
      schematicType: 'emerald',
      dimensions: '15.5 m x 14.2 m',
      ceilingHeight: '3.6 meter',
      balconyType: 'Balkon Sudut Sunset Melengkung (2.0 m x 6.5 m)',
      privateElevator: true,
      rooms: [
        { name: 'Private Elevator Foyer', sizeM2: 12, dimensions: '4.0 m x 3.0 m', description: 'Pintu lift pribadi membuka ke foyer marmer Nero Marquina dengan console table desainer.' },
        { name: 'Grand Living & Salon', sizeM2: 55, dimensions: '10.0 m x 5.5 m', description: 'Salon luas berdinding marmer dengan furnitur Poliform Italia dan jendela sudut lantai ke plafon.' },
        { name: 'Private Cigar & Reading Room', sizeM2: 15, dimensions: '4.2 m x 3.6 m', description: 'Ruang baca dan cerutu berinsulasi kedap suara dengan sistem ventilasi hisap HEPA khusus.' },
        { name: 'Master Bedroom Suite', sizeM2: 40, dimensions: '8.0 m x 5.0 m', description: 'Kamar utama megah dengan walk-in closet Italia dan master bathroom berdinding Smart Glass.' },
        { name: 'Bedroom 2 (En-Suite)', sizeM2: 24, dimensions: '5.0 m x 4.8 m', description: 'Kamar kedua dengan kamar mandi dalam marmer Calacatta dan tempat tidur King-size.' },
        { name: 'Bedroom 3 (En-Suite)', sizeM2: 20, dimensions: '4.5 m x 4.4 m', description: 'Kamar tidur en-suite ketiga menghadap panorama utara yang teduh.' },
        { name: 'Gourmet Kitchen & Maid Suite', sizeM2: 22, dimensions: '5.5 m x 4.0 m', description: 'Dapur komersial, lemari wine bertemperatur presisi, dan kamar asisten mandiri.' }
      ],
      architecturalHighlights: [
        'Akses lift biometrik privat langsung membuka ke dalam unit tanpa lorong bersama',
        'Ruang cerutu (cigar lounge) kedap suara terintegrasi exhaust pembersih udara mandiri'
      ]
    }
  },

  // --- ZONA THE SAPPHIRE (Lantai 15 - 24) ---
  {
    id: 'baskara-sapphire',
    name: 'The Sapphire',
    tower: 'Baskara',
    type: '4 Bedrooms Duplex Penthouse',
    sizeM2: 250,
    bedrooms: 4,
    bathrooms: 4,
    capacity: '5 - 8 Orang',
    pricePerMonth: 110000000,
    position: 'Duplex (Lt. 15 - 24)',
    orientation: 'North-West',
    floorLayoutNote: 'Lantai 15 – 24 (Zona The Sapphire: Duplex 2 lantai bertumpuk)',
    levelRange: 'Lantai 15 - 24',
    furnishing: 'Ultra-Luxury Bespoke',
    view: 'Sudirman CBD Skyline & Menteng Panoramic View',
    highlights: [
      'Duplex 2 lantai bertumpuk dengan void double-height salon 6.2 meter',
      'Private sky terrace & heated plunge pool eksklusif di teras langit',
      '4 Kamar Tidur luas dengan master suite di lantai mezzanine',
      'Lift pribadi langsung menuju unit dan akses showroom parkir supercar',
      'Pelayanan butler khusus 24/7 & Chef Table dining access'
    ],
    description: 'Duplex Penthouse 2 lantai spektakuler di Zona The Sapphire (Lt. 15-24) dengan langit-langit double-height 6.2 meter, kolam renang plunge pool privat, dan akses lift pribadi.',
    orientationAnalysis: {
      heading: 'North-West',
      cardinalLabelId: 'Sudut Barat Laut (North-West) · 315°',
      degrees: 315,
      sunlightProfile: 'Sunset Megah Sudirman — Panorama matahari terbenam spektakuler berpadu cahaya gedung-gedung tertinggi ibu kota di koridor Sudirman-Thamrin.',
      viewLandmarks: ['Gedung Tertinggi Sudirman', 'Siluet Sunset Jakarta', 'Baskara Sky Deck Horizon'],
      ambientDescription: 'Kombinasi kolam renang privat di ketinggian lantai 20-an dan pemandangan sunset ibu kota menciptakan suasana resor langit yang tak tertandingi.',
      recommendedFor: 'Tokoh publik, pengusaha terkemuka, dan keluarga modern yang mendambakan kemegahan duplex.'
    },
    availableOrientations: [
      {
        heading: 'North-West',
        cardinalLabelId: 'Sudut Barat Laut (North-West) · 315°',
        degrees: 315,
        sunlightProfile: 'Sunset Megah Sudirman — Panorama matahari terbenam spektakuler berpadu cahaya gedung-gedung tertinggi ibu kota di koridor Sudirman-Thamrin.',
        viewLandmarks: ['Gedung Tertinggi Sudirman', 'Siluet Sunset Jakarta', 'Baskara Sky Deck Horizon'],
        ambientDescription: 'Kombinasi kolam renang privat di ketinggian lantai 20-an dan pemandangan sunset ibu kota menciptakan suasana resor langit yang tak tertandingi.',
        recommendedFor: 'Tokoh publik, pengusaha terkemuka, dan keluarga modern yang mendambakan kemegahan duplex.'
      },
      {
        heading: 'North-East',
        cardinalLabelId: 'Sudut Timur Laut (North-East) · 45°',
        degrees: 45,
        sunlightProfile: 'Fajar Emas Menteng — Sinar matahari fajar yang menyinari double-height glass window, memberikan penerangan alami megah dari pagi hingga siang.',
        viewLandmarks: ['Cagar Budaya Menteng Heritage', 'Taman Suropati', 'Horizon Fajar Jakarta'],
        ambientDescription: 'Pemandangan hijau Menteng dari ketinggian lantai duplex dengan suasana tenang dan sejuk alami.',
        recommendedFor: 'Keluarga yang mengapresiasi pencahayaan pagi sehat dan keteduhan kawasan bersejarah Menteng.'
      },
      {
        heading: 'South-West',
        cardinalLabelId: 'Sudut Barat Daya (South-West) · 225°',
        degrees: 225,
        sunlightProfile: 'Sudirman City Lights — Gemerlap jutaan lampu gedung pencakar langit segitiga emas di malam hari yang memantul di atas permukaan plunge pool.',
        viewLandmarks: ['SCBD Sudirman', 'Menara Astra & Wisma 46', 'Kuningan Financial District'],
        ambientDescription: 'Pemandangan malam spektakuler kota metropolitan modern langsung dari teras langit dan ruang tamu dua lantai.',
        recommendedFor: 'Pecinta kehidupan malam metropolitan dan pemandangan skyline gedung berkilau.'
      },
      {
        heading: 'South-East',
        cardinalLabelId: 'Sudut Tenggara (South-East) · 135°',
        degrees: 135,
        sunlightProfile: 'Pagi Hangat & Udara Sejuk — Menangkap angin sejuk tenggara dan matahari pagi tanpa hawa terik di sore hari.',
        viewLandmarks: ['Kedutaan Besar HR Rasuna Said', 'Taman Kota Hijau', 'Skyline Mega Kuningan'],
        ambientDescription: 'Suasana damai dan privat dengan dek travertine yang nyaman untuk sarapan pagi di udara terbuka.',
        recommendedFor: 'Eksekutif yang mencari keseimbangan sempurna antara privasi dan ketenangan.'
      }
    ],
    floorPlan: {
      schematicType: 'sapphire',
      dimensions: '16.8 m x 15.0 m (Duplex 2 Lantai)',
      ceilingHeight: '6.2 meter (Double Void Salon)',
      balconyType: 'Private Sky Terrace & Heated Plunge Pool (3.0 m x 8.0 m)',
      privateElevator: true,
      rooms: [
        { name: 'Sky Terrace & Plunge Pool', sizeM2: 25, dimensions: '5.0 m x 5.0 m', description: 'Kolam renang langit privat dengan dek berjemur marmer travertine dan kaca pelindung angin.' },
        { name: 'Grand Double-Height Salon', sizeM2: 50, dimensions: '8.0 m x 6.2 m', description: 'Salon megah dengan void 6.2 meter, tangga spiral arsitektural, dan jendela kaca katedral.' },
        { name: 'Master Presidential Suite (Lt. 2)', sizeM2: 38, dimensions: '7.6 m x 5.0 m', description: 'Kamar tidur utama di lantai mezzanine dengan walk-in dressing room dan jacuzzi kaca.' },
        { name: 'Junior En-Suite Bedroom (Lt. 2)', sizeM2: 22, dimensions: '5.0 m x 4.4 m', description: 'Kamar en-suite kedua di lantai atas dengan pemandangan cakrawala terbuka.' },
        { name: '2 En-Suite Bedrooms (Lt. 1)', sizeM2: 40, dimensions: 'Dua kamar tidur di lantai bawah', description: 'Dua kamar tidur tamu di lantai dasar dengan kamar mandi marmer masing-masing.' },
        { name: 'Commercial Gourmet Kitchen', sizeM2: 18, dimensions: '4.5 m x 4.0 m', description: 'Kitchen island marmer, lemari pendingin wine, dan maid quarter mandiri.' }
      ],
      architecturalHighlights: [
        'Plunge pool berpemanas air otomatis untuk kenyamanan berenang kapan saja',
        'Akses private elevator langsung dari basement supercar garage'
      ]
    }
  },

  // --- ZONA THE DIAMOND (Lantai 25 - 32) ---
  {
    id: 'baskara-diamond',
    name: 'The Diamond',
    tower: 'Baskara',
    type: '4-Bedrooms Sky Villa',
    sizeM2: 380,
    bedrooms: 4,
    bathrooms: 5,
    capacity: '6 - 10 Orang',
    pricePerMonth: 140000000,
    position: 'Upper Levels (Lt. 25 - 32)',
    orientation: 'North',
    floorLayoutNote: 'Lantai 25 – 32 (Zona The Diamond: Hanya 2 unit per lantai Sayap Utara & Selatan)',
    levelRange: 'Lantai 25 - 32',
    furnishing: 'Ultra-Luxury Bespoke',
    view: 'Panorama 180° Monas & Jakarta City Horizon',
    highlights: [
      'Sky Villa masif seluas 380 m² menguasai penuh satu sayap menara',
      'Hanya 2 unit per lantai (Lt. 25-32) untuk privasi absolut tanpa gangguan',
      'Balkon melingkar panoramik dengan sudut pandang 180° tanpa halangan',
      '4 Kamar Tidur en-suite (termasuk kamar tamu terpisah dengan akses khusus)',
      'Dapur wet & dry berspesifikasi komersial untuk koki pribadi (private chef)',
      'Akses langsung lift privat menuju Rooftop VVIP Helipad'
    ],
    description: 'Sky Villa seluas 380 m² yang menguasai satu sayap penuh Lantai 25-32, dilengkapi balkon melingkar 180 derajat dan akses langsung ke Rooftop Helipad.',
    orientationAnalysis: {
      heading: 'North',
      cardinalLabelId: 'Sayap Utara (North Wing) · 0° / 360°',
      degrees: 0,
      sunlightProfile: 'Pencahayaan Konsisten & Sejuk Sepanjang Hari — Menerima pencahayaan alami paling teduh dan stabil di iklim tropis, tanpa panas menyengat dari barat.',
      viewLandmarks: ['Puncak Monas Emas', 'Istana Kepresidenan & Medan Merdeka', 'Teluk Jakarta & Cakrawala Utara'],
      ambientDescription: 'Mendominasi seluruh sayap utara lantai 25-32 dengan balkon melingkar 180 derajat yang memandang langsung ikon kebanggaan ibu kota Republik Indonesia.',
      recommendedFor: 'Tokoh nasional, duta besar negara adidaya, dan pimpinan korporasi multinasional.'
    },
    availableOrientations: [
      {
        heading: 'North',
        cardinalLabelId: 'Sayap Utara (North Wing) · 0° / 360°',
        degrees: 0,
        sunlightProfile: 'Pencahayaan Konsisten & Sejuk Sepanjang Hari — Menerima pencahayaan alami paling teduh dan stabil di iklim tropis, tanpa panas menyengat dari barat.',
        viewLandmarks: ['Puncak Monas Emas', 'Istana Kepresidenan & Medan Merdeka', 'Teluk Jakarta & Cakrawala Utara'],
        ambientDescription: 'Mendominasi seluruh sayap utara lantai 25-32 dengan balkon melingkar 180 derajat yang memandang langsung ikon kebanggaan ibu kota Republik Indonesia.',
        recommendedFor: 'Tokoh nasional, duta besar negara adidaya, dan pimpinan korporasi multinasional.'
      },
      {
        heading: 'South',
        cardinalLabelId: 'Sayap Selatan (South Wing) · 180°',
        degrees: 180,
        sunlightProfile: 'Panorama Megah Metropolitan Terang & Berpendar — Memandang megahnya distrik finansial SCBD dan Sudirman yang menyajikan keindahan kota metropolitan kelas dunia.',
        viewLandmarks: ['SCBD Sudirman Golden Triangle', 'Mega Kuningan Diplomatic Enclave', 'Jalan Layang Semanggi'],
        ambientDescription: 'Mendominasi penuh seluruh sayap selatan lantai 25-32. Di malam hari, unit ini berubah menjadi observatorium langit privat dengan kilau lampu pencakar langit spektakuler.',
        recommendedFor: 'Taipan bisnis, pimpinan lembaga keuangan internasional, dan keluarga konglomerat.'
      }
    ],
    floorPlan: {
      schematicType: 'diamond',
      dimensions: '22.0 m x 17.5 m (Satu Sayap Penuh)',
      ceilingHeight: '3.8 meter',
      balconyType: 'Balkon Melingkar Panoramik 180° (Lebar 2.5 meter mengitari seluruh sayap)',
      privateElevator: true,
      rooms: [
        { name: 'Private Lift Foyer & Gallery', sizeM2: 25, dimensions: '6.0 m x 4.2 m', description: 'Foyer megah marmer Calacatta dengan pintu masuk ganda keamanan biometrik retina.' },
        { name: 'Grand Presidential Salon & Ballroom', sizeM2: 95, dimensions: '14.0 m x 6.8 m', description: 'Ruang jamuan negara seluas 95 m² yang menampung 20 tamu kehormatan dengan pemandangan Monas.' },
        { name: 'Master Presidential Wing', sizeM2: 70, dimensions: '10.0 m x 7.0 m', description: 'Sayap kamar utama dengan private study, dual walk-in dressing rooms, dan bathtub marmer kristal.' },
        { name: 'VIP Guest Suite (Akses Terpisah)', sizeM2: 35, dimensions: '7.0 m x 5.0 m', description: 'Kamar tamu VIP dengan foyer dan kamar mandi dalam mandiri untuk menjaga privasi pemilik.' },
        { name: '2 En-Suite Family Bedrooms', sizeM2: 50, dimensions: 'Masing-masing 25 m²', description: 'Dua kamar tidur anak / keluarga dengan kamar mandi marmer dan pemandangan cakrawala utara.' },
        { name: 'Chef Wet & Dry Kitchen', sizeM2: 35, dimensions: '7.0 m x 5.0 m', description: 'Dapur berspesifikasi hotel bintang lima dengan cold room dan fasilitas koki pribadi.' },
        { name: 'Butler Quarters & Utility', sizeM2: 20, dimensions: '5.0 m x 4.0 m', description: 'Kamar tinggal dua asisten/butler pribadi dengan kamar mandi mandiri.' },
        { name: 'Wrap-Around Panoramic Balcony', sizeM2: 50, dimensions: 'Balkon 180° mengelilingi sayap', description: 'Teras melingkar dengan dek santai luar ruangan dan taman mini vertikal.' }
      ],
      architecturalHighlights: [
        'Hanya 2 unit per lantai (Lt. 25-32) menjamin privasi absolut tanpa kontak tetangga',
        'Balkon melingkar 180 derajat dengan sudut pandang tak terhalang ke Monas dan cakrawala',
        'Akses prioritas langsung ke Rooftop Helipad via lift internal ekspres'
      ]
    }
  }
];

export const TOWER_INFO = {
  Arunika: {
    tagline: 'The Pinnacle of Modern Living',
    philosophy: 'Menghadirkan keseimbangan sempurna antara dinamisnya kehidupan urban modern dan ketenangan hunian sanctuary berkelas.',
    floorDistribution: 'Lantai 7 - 33: Dalam satu lantai tersedia unit Studio Executive, 1BR, 2BR, hingga 3BR Corner. Lantai 34 - 35: The Baswara Penthouse.',
    features: [
      'Layout Terpadu: Unit Studio hingga 3BR tersedia dalam satu lantai (Lt. 7-33)',
      'Smart Home System terintegrasi smartphone (lampu, AC, tirai)',
      'Smart Door Lock (biometrik sidik jari, PIN numerik, kartu RFID)',
      'Commercial Arcade, Business Pods, The Sky Deck & The Baswara Lounge'
    ]
  },
  Baskara: {
    tagline: 'The Apex of Ultra-Luxury & Privacy',
    philosophy: 'Diciptakan secara eksklusif bagi segmen VVIP yang menempatkan privasi mutlak dan kenyamanan paripurna di atas segalanya.',
    floorDistribution: 'Lantai 7–12: The Emerald (4 sudut: NW, NE, SW, SE). Lantai 15–24: The Sapphire Duplex (4 sudut: NW, NE, SW, SE). Lantai 25–32: The Diamond Sky Villa (2 sayap: North & South).',
    features: [
      'The Emerald (Lt. 7-12): 4 unit per lantai di setiap sudut (North-West, North-East, South-West, South-East)',
      'The Sapphire (Lt. 15-24): Duplex Penthouse 2 lantai (North-West, North-East, South-West, South-East)',
      'The Diamond (Lt. 25-32): Sky Villa 380 m² (2 unit per lantai: Sayap North & South)',
      'The Sovereign Foyer privat tanpa lobi terbuka umum',
      'Dedicated Personal Attaché & Butler pribadi siaga 24/7',
      'Baskara Vault & Supercar Sanctuary, Touchless Robotic Valet',
      'Rooftop VVIP Helipad terintegrasi lift privat langsung'
    ]
  }
};
