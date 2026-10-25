export interface StaffMember {
  name: string;
  role: string;
  desc: string;
  category?: 'executive' | 'secretariat' | 'management';
}

export const STAFF_MEMBERS: StaffMember[] = [
  {
    name: 'Chitraditya Prabaswara',
    role: 'Chief Executive Officer (CEO)',
    desc: 'Memimpin visi strategis, keunggulan tata kelola, dan standar mutu tertinggi hunian vertikal terpadu.',
    category: 'executive',
  },
  {
    name: 'Danika Genta',
    role: 'Corporate Secretary',
    desc: 'Penghubung utama kesekretariatan eksekutif, koordinasi protokoler manajemen Prabaswara Group, tata kelola kepatuhan, serta dokumentasi legalitas sewa residensial.',
    category: 'secretariat',
  },
  {
    name: 'Julian Andries',
    role: 'General Manager Operasional',
    desc: 'Tangan kanan CEO yang mengawasi seluruh operasional harian di Tower Arunika dan Tower Baskara serta memastikan standar layanan bintang lima.',
    category: 'management',
  },
  {
    name: 'Natasha Wijaya',
    role: 'Leasing & Marketing Manager',
    desc: 'Memegang kendali penuh atas akun resmi @the_BASWARA, inquiry via DM, verifikasi ketersediaan unit, serta memandu penyewa hingga serah terima unit.',
    category: 'management',
  },
  {
    name: 'Sebastian Pradipta',
    role: 'Head of Concierge & Guest Relations',
    desc: 'Wajah utama di Grand Lobby dan kontak darurat 24 jam. Mengatur reservasi fasilitas privat, penitipan paket, dan menjaga kerahasiaan tamu VVIP.',
    category: 'management',
  },
  {
    name: 'Bima Cokroaminoto',
    role: 'Chief Security Officer',
    desc: 'Mengepalai seluruh sistem keamanan terpadu The Baswara: registrasi biometrik Face Recognition, Smart Door Lock, CCTV, dan akses Baskara Vault.',
    category: 'management',
  },
  {
    name: 'Hendra Kusuma',
    role: 'Chief Engineer & Maintenance',
    desc: 'Menangani operasional seluruh sistem utilitas gedung, kendala teknis Smart Home System di dalam unit, sirkulasi AC sentral, dan fasilitas parkir.',
    category: 'management',
  },
];
