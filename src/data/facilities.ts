import supercarVaultImg from '../assets/images/supercar_vault_1792672656950.jpg';
import sovereignFoyerImg from '../assets/images/sovereign_foyer_1792672657246.jpg';
import poolImg from '../assets/images/altitude_sanctuary_pool_1792311584127.jpg';
import aristocratClubImg from '../assets/images/aristocrat_club_1792672659047.jpg';
import helipadImg from '../assets/images/rooftop_helipad_1792672658134.jpg';

export interface FacilitySubItem {
  title: string;
  description: string;
}

export interface FacilityLevel {
  id: string;
  level: string;
  name: string;
  tower: 'Arunika' | 'Baskara' | 'Both';
  tagline: string;
  description: string;
  image: string;
  gallery: { title: string; image: string }[];
  amenities: string[];
  subFacilities: FacilitySubItem[];
  accessBadge: string;
  operationalHours: string;
}

export const FACILITIES_DATA: FacilityLevel[] = [
  // ==========================================
  // TOWER BASKARA EXCLUSIVES (ULTRA-LUXURY VVIP)
  // ==========================================
  {
    id: 'baskara-b1',
    level: 'Basement',
    name: 'Baskara Vault & Supercar Sanctuary',
    tower: 'Baskara',
    tagline: 'Museum-Grade Automotive Vault & Robotic Valet',
    description: 'Area parkir bawah tanah khusus supercar berlantai epoksi antibakteri dengan pencahayaan pameran (showroom lighting), pengatur kelembapan udara konstan, dan sistem valet nirsentuh otomatis.',
    image: supercarVaultImg,
    gallery: [
      {
        title: 'Supercar Gallery & Vault',
        image: supercarVaultImg
      },
      {
        title: 'Touchless Automated Valet',
        image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: "Chauffeur's Lounge & Private Rest Suite",
        image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Supercar Gallery & Vault ber-AC dengan humidity control 50%',
      'Touchless Automated Valet dengan sistem parkir robotik canggih',
      "Chauffeur's Lounge eksklusif dengan shower room & kafetaria mini",
      'EV Supercharging ultra-fast bay & stasiun detailing mandiri'
    ],
    subFacilities: [
      {
        title: 'Supercar Gallery & Vault',
        description: 'Lantai epoksi premium, pencahayaan showroom terfokus, dan isolasi kelembapan udara untuk merawat mobil koleksi bernilai tinggi.'
      },
      {
        title: 'Touchless Automated Valet',
        description: 'Sistem parkir robotik canggih tanpa sentuhan fisik manusia untuk proteksi maksimal bodi dan interior kendaraan.'
      },
      {
        title: "Chauffeur's Lounge",
        description: 'Ruang istirahat sangat nyaman bagi pengemudi pribadi atau asisten keamanan, lengkap dengan kafetaria kecil dan ruang mandi.'
      }
    ],
    accessBadge: 'Akses Biometrik & Supercar Key',
    operationalHours: '24 Jam Penuh'
  },
  {
    id: 'baskara-l1',
    level: 'Lantai 1',
    name: 'The Sovereign Arrival & Secret Foyer',
    tower: 'Baskara',
    tagline: 'Concealed Porte-Cochère & Dedicated Personal Attaché',
    description: 'Kedatangan VVIP yang tersembunyi dari jalan utama, dikelilingi taman vertikal rimbun untuk proteksi privasi mutlak tanpa lobi umum yang bising.',
    image: sovereignFoyerImg,
    gallery: [
      {
        title: 'VVIP Drop-Off & Secret Garden',
        image: sovereignFoyerImg
      },
      {
        title: 'The Sovereign Foyer & Concierge',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Private Waiting Pods',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'VVIP Drop-Off tersembunyi dikelilingi dinding taman vertikal tinggi',
      'The Sovereign Foyer: penyambutan privat langsung Dedicated Personal Attaché',
      'Private Waiting Pods akustik kedap suara bagi tamu menunggu izin biometrik',
      'Pemindai retina & pengenal wajah 3D langsung menuju lift pribadi'
    ],
    subFacilities: [
      {
        title: 'VVIP Drop-Off & Secret Garden',
        description: 'Area kedatangan yang tersembunyi dari jalan raya utama Boulevard Menteng, dirancang bebas dari jangkauan paparazzi atau pandangan publik.'
      },
      {
        title: 'The Sovereign Foyer',
        description: 'Tanpa lobi publik terbuka yang ramai. Digantikan dengan foyer privat marmer megah di mana tamu disambut oleh Personal Attaché pribadi.'
      },
      {
        title: 'Private Waiting Pods',
        description: 'Ruang tunggu tertutup bergaya lounge dengan sofa desainer untuk tamu sebelum mendapat persetujuan akses biometrik dari pemilik unit.'
      }
    ],
    accessBadge: 'Retina & Facial Biometric Only',
    operationalHours: '24 Jam Penuh'
  },
  {
    id: 'baskara-l2',
    level: 'Lantai 2',
    name: 'The Baskara Wellness & Grooming Arcade',
    tower: 'Baskara',
    tagline: 'Medical Concierge, Bespoke Pet Parlor & Haute Tailor',
    description: 'Suaka perawatan kesehatan privat 24 jam dengan dokter in-house, salon spa hewan peliharaan mewah ber-AC, serta layanan penatu busana haute couture.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'The Medical Concierge Suite',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Bespoke Pet Parlor & Daycare',
        image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Haute Couture Care & Master Tailor',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'The Medical Concierge: klinik kesehatan 24/7 & dokter jaga in-house',
      'Layanan infus multivitamin, pemeriksaan rutin & perawat panggilan ke unit',
      'Bespoke Pet Parlor: salon perawatan hewan peliharaan & penitipan ber-AC',
      'Haute Couture Care: dry cleaning gaun mewah, tas kulit & penjahit siaga'
    ],
    subFacilities: [
      {
        title: 'The Medical Concierge',
        description: 'Klinik kesehatan 24/7 dengan dokter jaga in-house. Melayani infus vitamin, medical check-up rutin, hingga home-visit ke dalam unit.'
      },
      {
        title: 'Bespoke Pet Parlor & Daycare',
        description: 'Salon perawatan hewan peliharaan premium, spa aromaterapi hewan, serta penitipan nyaman dengan pengatur suhu ruangan sejuk.'
      },
      {
        title: 'Haute Couture Care & Tailor',
        description: 'Layanan penatu khusus untuk dry-cleaning gaun malam bernilai tinggi, perawatan restorasi tas/sepatu kulit branded, dan tailor siaga.'
      }
    ],
    accessBadge: 'Penghuni Baskara & Paspor Medis',
    operationalHours: '24 Jam (Medis) / 08:00 - 20:00 (Arcade)'
  },
  {
    id: 'baskara-l3',
    level: 'Lantai 3',
    name: 'The Executive & Security Hub',
    tower: 'Baskara',
    tagline: 'RF-Shielded Boardroom, Safe Deposit & Personal Shopper Drop',
    description: 'Pusat diplomasi dan bisnis berkualifikasi intelijen dengan ruang rapat kedap suara anti-penyadapan, brankas penyimpanan rahasia, dan transit paket mewah.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'The Boardroom & Anti-Eavesdropping Pod',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Safe Deposit Vault & Document Archive',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'The Gourmet Pantry (Personal Shopper Transit)',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'The Boardroom: ruang rapat kedap suara anti-penyadapan bersinyal terenkripsi',
      'Safe Deposit Vault baja ganda untuk dokumen rahasia negara & perhiasan',
      'The Gourmet Pantry: lemari bertemperatur dingin-hangat untuk paket kurir',
      'Pengantaran kurir barang mewah ke unit dilakukan secara steril oleh Butler'
    ],
    subFacilities: [
      {
        title: 'The Boardroom & Safe Deposit',
        description: 'Ruang rapat super-privat berinsulasi Faraday cage (anti-sadap) untuk diskusi bisnis krusial, terhubung jalur brankas dokumen rahasia.'
      },
      {
        title: 'The Gourmet Pantry (Personal Shopper Drop)',
        description: 'Ruang penyimpanan bertemperatur dingin dan hangat. Personal shopper atau kurir luxury brand meletakkan barang di sini untuk dihantarkan butler.'
      }
    ],
    accessBadge: 'Otoritas Eksekutif & Enkripsi PIN',
    operationalHours: '06:00 - 24:00'
  },
  {
    id: 'baskara-l5',
    level: 'Lantai 5',
    name: 'The Altitude Sanctuary (The Sky Deck)',
    tower: 'Baskara',
    tagline: 'Private Cabana Pool, Hyperbaric Oxygen & Japanese Hinoki Onsen',
    description: 'Suaka relaksasi nirbising dengan kolam renang cabana tertutup gaya resor butik, pemandian air panas onsen Jepang Hinoki, ruang terapi hiperbarik, dan studio kebugaran privat.',
    image: poolImg,
    gallery: [
      {
        title: 'Private Cabana Pool',
        image: poolImg
      },
      {
        title: 'Hyperbaric & Japanese Onsen Retreat',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Bespoke Movement Studio (Pilates & Yoga)',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Private Cabana Pool dengan sunken daybed tertutup untuk privasi total renang',
      'Ruang terapi oksigen hiperbarik mutakhir untuk regenerasi sel dan anti-aging',
      'Pemandian air panas onsen Jepang tradisional dari kayu Hinoki alami',
      'Bespoke Movement Studio: suhu dan alat dipersiapkan personal sebelum sesi'
    ],
    subFacilities: [
      {
        title: 'Private Cabana Pool',
        description: 'Kolam renang infinity bernuansa resor butik yang dibatasi cabana partisi tertutup (bukan kursi santai terbuka), memberikan privasi saat berenang.'
      },
      {
        title: 'Hyperbaric & Onsen Retreat',
        description: 'Ruang terapi oksigen hiperbarik untuk peremajaan sel, pemandian air panas (onsen) gaya Jepang privat, dan ruang sauna inframerah.'
      },
      {
        title: 'Bespoke Movement Studio',
        description: 'Studio kebugaran kosong yang peralatan dan suhunya disiapkan sesuai permintaan sebelum Anda tiba, lengkap dengan instruktur privat.'
      }
    ],
    accessBadge: 'Kartu Akses VVIP Baskara',
    operationalHours: '06:00 - 22:00'
  },
  {
    id: 'baskara-l6',
    level: 'Lantai 6',
    name: 'The Aristocrat Club',
    tower: 'Baskara',
    tagline: "Chef's Table Fine-Dining, Private KTV & Sommelier Wine Cellar",
    description: 'Pusat gastronomi dan relaksasi eksklusif penghuni dengan dapur perjamuan koki Michelin privat, ruang KTV akustik standar rekaman, dan cigar lounge berinsulasi udara.',
    image: aristocratClubImg,
    gallery: [
      {
        title: "Chef's Table Fine-Dining Suite",
        image: aristocratClubImg
      },
      {
        title: 'Private KTV & Acoustic Suite',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'The Habano & Master Wine Cellar',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      "Chef's Table Fine-Dining: dapur jamuan koki Bintang Michelin privat",
      'Private KTV & Acoustic Suite dengan panggung mini dan layar lengkung raksasa',
      'The Habano & Wine Cellar: ruang cerutu bertekanan negatif dan wine tasting',
      'Pelayanan langsung oleh Sommelier residen bersertifikasi internasional'
    ],
    subFacilities: [
      {
        title: 'Private KTV & Acoustic Suite',
        description: 'Ruang karaoke VVIP dengan sistem audio high-end kelas studio, panggung mini, layar lengkung raksasa, dan pencahayaan cerdas.'
      },
      {
        title: "Chef's Table Fine-Dining",
        description: 'Ruang makan malam privat elegan. Penghuni dapat mengundang Koki Bintang Michelin untuk memasak secara eksklusif menjamu tamu kehormatan.'
      },
      {
        title: 'The Habano & Wine Cellar',
        description: 'Ruang cerutu berventilasi khusus yang terhubung dengan ruang wine tasting, dilayani langsung oleh seorang sommelier berdedikasi.'
      }
    ],
    accessBadge: 'Baskara Club Membership',
    operationalHours: '12:00 - 02:00'
  },
  {
    id: 'baskara-rooftop',
    level: 'Rooftop',
    name: 'VVIP Rooftop Helipad & Sky Lounge',
    tower: 'Baskara',
    tagline: 'Private Aviation Landing Deck & Express Sky Lift',
    description: 'Landasan helikopter privat bersertifikasi ICAO di atap mahkota Tower Baskara, terhubung langsung melalui lift ekspres VVIP menuju Penthouse dan Sky Villa.',
    image: helipadImg,
    gallery: [
      {
        title: 'VVIP Helipad Deck',
        image: helipadImg
      },
      {
        title: 'Helipad Observation Sky Lounge',
        image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Helipad operasional 24 jam dengan koordinasi radar ATC Menteng',
      'Lift ekspres langsung dari landasan helipad menuju Penthouse & Sky Villa',
      'Layanan penjemputan limusin Mercedes-Maybach standby di basement',
      'Inspeksi pengawalan protokoler resmi Chief Security Officer'
    ],
    subFacilities: [
      {
        title: 'Helipad Privat Bersertifikasi',
        description: 'Landasan pendaratan helikopter standar internasional dengan lampu navigasi malam, windsock terkalibrasi, dan kru pendarat siaga.'
      },
      {
        title: 'Sky Transit Lounge',
        description: 'Ruang singgah elegan berpanorama 360 derajat Jakarta untuk menyambut tamu sebelum transit ke lantai hunian.'
      }
    ],
    accessBadge: 'Otoritas Penerbangan & Pemilik Unit',
    operationalHours: '24 Jam (Sesuai Reservasi)'
  },

  // ==========================================
  // TOWER ARUNIKA FACILITIES (MODERN LUXURY RESIDENCE)
  // ==========================================
  {
    id: 'arunika-b1',
    level: 'Basement',
    name: 'Resident Parking, EV Station & Utility Hub',
    tower: 'Arunika',
    tagline: 'Automated Guidance, EV Superchargers & Penthouse VIP Bays',
    description: 'Area parkir bawah tanah khusus penghuni yang dilengkapi sistem parkir otomatis pintar, stasiun pengisian daya mobil listrik (EV), lot parkir dedicated VIP untuk Penthouse, serta ruang utilitas gedung terpadu.',
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'Automated Parking Bay & Guidance',
        image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Electric Vehicle (EV) Superchargers',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Sistem pemandu lot parkir otomatis berbasis sensor pintar',
      'Stasiun pengisian daya mobil listrik cepat (EV Charging Stations)',
      'Dedicated parking slot (1 slot untuk Studio-2BR, 2-3 slot untuk 3BR & Penthouse)',
      'Pemantauan CCTV 24 jam & akses pintu kartu RFID berenkripsi'
    ],
    subFacilities: [
      {
        title: 'Area Parkir Cerdas',
        description: 'Sensor otomatis menampilkan ketersediaan lot parkir secara real-time pada display LED koridor.'
      },
      {
        title: 'Stasiun Pengisian Daya EV',
        description: 'Dukungan charger kendaraan listrik AC & DC fast-charging ramah lingkungan.'
      }
    ],
    accessBadge: 'Kartu Akses RFID Penghuni',
    operationalHours: '24 Jam Penuh'
  },
  {
    id: 'arunika-l1',
    level: 'Lantai 1',
    name: 'Grand Lobby, Concierge & Marketing Gallery',
    tower: 'Arunika',
    tagline: '8-Meter Ceiling, Marble Foyer & 24/7 Resident Concierge',
    description: 'Area drop-off megah dengan kanopi berarsitektur modern, Grand Lobby berhias marmer impor, meja Concierge 24 jam di bawah naungan Sebastian Pradipta, dan Marketing Gallery resmi.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'Grand Drop-Off & Canopy',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Meja Concierge Sebastian Pradipta',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Marketing & Residential Experience Gallery',
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Grand Lobby dengan plafon setinggi 8 meter dan ornamen emas kontemporer',
      'Meja Resident Concierge 24 jam untuk reservasi, surat-menyurat & bantuan darurat',
      'Marketing Gallery interaktif dengan maket arsitektur digital The Baswara',
      'Valet drop-off service & lounge penyambutan ber-AC'
    ],
    subFacilities: [
      {
        title: 'Area Drop-off & Grand Lobby',
        description: 'Akses masuk nyaman dengan layanan valet siap sedia menyambut penghuni dan tamu kehormatan.'
      },
      {
        title: 'Meja Concierge & Guest Relations',
        description: 'Pusat bantuan 24 jam untuk pengaturan reservasi fasilitas, penerimaan paket kilat, dan layanan taksi eksekutif.'
      }
    ],
    accessBadge: 'Akses Publik & Verifikasi Tamu',
    operationalHours: '24 Jam Penuh'
  },
  {
    id: 'arunika-l2',
    level: 'Lantai 2',
    name: 'Commercial Arcade & Daily Conveniences',
    tower: 'Arunika',
    tagline: 'Artisanal Cafe, Gourmet Minimarket & Executive Laundry',
    description: 'Area komersial bergaya arcade butik yang mencakup Kafe Premium beraroma kopi artisanal, Minimarket Eksekutif berisi kebutuhan impor harian, dan fasilitas laundry pakaian mewah.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'Kafe Premium & Bakery Artisanal',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Minimarket Eksekutif',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Fasilitas Laundry & Dry Clean Cepat',
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Kafe Premium menyajikan seduhan kopi spesialti, brunch, dan pastry hangat',
      'Minimarket Eksekutif dengan produk segar organik impor dan wine pilihan',
      'Layanan laundry & dry cleaning express dengan antar-jemput langsung ke unit',
      'Area tempat duduk alfresco menghadap pepohonan Jalan Boulevard Kusuma'
    ],
    subFacilities: [
      {
        title: 'Kafe Premium',
        description: 'Kopi sangrai pilihan dan hidangan ringan sarapan pagi tanpa perlu keluar dari kawasan apartemen.'
      },
      {
        title: 'Minimarket Eksekutif',
        description: 'Kebutuhan harian berkualitas prima, aneka buah segar, keju artisan, dan perlengkapan harian.'
      },
      {
        title: 'Laundry & Garment Care',
        description: 'Perawatan pakaian modern dengan deterjen ramah lingkungan serta setrika uap berstandar butik.'
      }
    ],
    accessBadge: 'Penghuni & Pengunjung Terdaftar',
    operationalHours: '07:00 - 22:00'
  },
  {
    id: 'arunika-l3',
    level: 'Lantai 3',
    name: 'Business Pod & Co-Working Hub',
    tower: 'Arunika',
    tagline: 'Soundproof Focus Pods & High-Tech Private Meeting Rooms',
    description: 'Co-working hub modern nan tenang yang dilengkapi bilik kerja privat kedap suara, ruang rapat privat berpintu sandi digital, jaringan internet serat optik kecepatan tinggi, dan bar minuman gratis.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'Co-Working Lounge & Hotdesks',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Private Meeting Room & 4K Video Suite',
        image: 'https://images.unsplash.com/photo-1431540015161-0bf866a2d407?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Soundproof Solo Work Pods',
        image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Private meeting rooms berkapasitas 6-12 orang dengan smart TV 75 inci',
      'Soundproof solo focus pods untuk panggilan video dan zoom tanpa gangguan suara',
      'Koneksi internet Gigabit Wi-Fi 6 berlatensi rendah',
      'Bar kopi, teh herbal, dan air mineral alkali gratis untuk penghuni'
    ],
    subFacilities: [
      {
        title: 'Co-Working Hub',
        description: 'Ruang kerja bersama dengan pencahayaan ramah mata dan stopkontak terintegrasi di setiap meja.'
      },
      {
        title: 'Private Meeting Rooms',
        description: 'Dapat direservasi via meja Concierge untuk presentasi klien penting atau kerja tim intensif.'
      }
    ],
    accessBadge: 'Kartu Akses Penghuni Tower Arunika',
    operationalHours: '06:00 - 23:00'
  },
  {
    id: 'arunika-l5',
    level: 'Lantai 5',
    name: 'The Sky Deck (Infinity Pool, Gym & Sky Garden)',
    tower: 'Arunika',
    tagline: '25m Panoramic Infinity Lap Pool, Technogym & Tropical Oasis',
    description: 'Area rekreasi utama luar ruangan yang mencakup kolam renang infinity pool menghadap panorama kota Menteng, pusat kebugaran (gym) berspesifikasi Technogym terkini, dan taman hijau sky garden untuk relaksasi.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'Infinity Lap Pool & Menteng Skyline',
        image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Pusat Kebugaran (Gym) Technogym',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Tropical Sky Garden & Yoga Lawn',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Infinity lap pool 25 meter dengan air garam (saltwater) ramah kulit',
      'Pusat kebugaran lengkap dengan beban bebas, treadmill layar virtual, dan dumbel',
      'Sky garden hijau rindang dengan jogging path dan tempat bersantai sore',
      'Kolam anak terpisah dan dek jemur santai dengan pemandangan cakrawala'
    ],
    subFacilities: [
      {
        title: 'Infinity Pool & Sun Deck',
        description: 'Berenang di tepi cakrawala Jakarta Pusat dengan pancaran matahari tropis yang menenangkan.'
      },
      {
        title: 'Pusat Kebugaran (Gym)',
        description: 'Dipandu pelatih kebugaran bersertifikasi dengan alat kardio dan beban terlengkap.'
      },
      {
        title: 'Sky Garden',
        description: 'Taman atap hijau terawat dengan bunga tropis dan angin sejuk untuk melepas kepenatan.'
      }
    ],
    accessBadge: 'Penghuni Tower Arunika & Baskara',
    operationalHours: '06:00 - 22:00'
  },
  {
    id: 'arunika-l6',
    level: 'Lantai 6',
    name: 'The Baswara Lounge & Private Cinema',
    tower: 'Arunika',
    tagline: '18-Seat Leather Private Cinema, Cigar Lounge, Spa & Billiards',
    description: 'Pusat hiburan dan relaksasi penghuni yang terdiri dari bioskop pribadi (private cinema) 18 kursi recliner kulit, cigar lounge dengan sistem sirkulasi pembersih udara, fasilitas spa rileks, serta ruang biliar (billiard pool).',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        title: 'Bioskop Pribadi (Private Cinema 18 Kursi)',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Cigar & Whiskey Reading Lounge',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Ruang Biliar (Billiard Pool) & Game Room',
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1600&q=80'
      },
      {
        title: 'Fasilitas Spa & Sauna Relaksasi',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80'
      }
    ],
    amenities: [
      'Bioskop pribadi 18 kursi recliner kulit dengan layar Dolby Vision & tata suara Atmos',
      'Cigar lounge mewah berfilter HEPA karbon aktif untuk kenyamanan aromatik',
      'Fasilitas spa relaksasi lengkap dengan sauna kayu cedar & ruang pijat terapi',
      'Ruang biliar profesional 9-feet dengan bar cocktail mandiri'
    ],
    subFacilities: [
      {
        title: 'Bioskop Pribadi (Private Cinema)',
        description: 'Tonton film favorit atau adakan nobar eksklusif bersama keluarga dan kolega dalam privasi kedap suara.'
      },
      {
        title: 'Cigar Lounge & Spa',
        description: 'Perpaduan santai menikmati cerutu pilihan dan terapi pijat menyegarkan tubuh.'
      },
      {
        title: 'Ruang Biliar (Billiard Pool)',
        description: 'Meja biliar standar kejuaraan dengan stik profesional dan sofa santai berbahan beludru gelap.'
      }
    ],
    accessBadge: 'Khusus Penghuni & Reservasi Concierge',
    operationalHours: '10:00 - 24:00'
  }
];
