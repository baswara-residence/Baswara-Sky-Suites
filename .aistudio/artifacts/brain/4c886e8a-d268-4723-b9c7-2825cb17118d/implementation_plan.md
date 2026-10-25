# Rencana Implementasi & Status Fitur Baswara Sky Suites

## 1. Arsitektur Presentasi Per Halaman (Per-Page / Screen-by-Screen)
- [x] **Eliminasi Continuous Long Scroll**: Seluruh halaman utama tidak lagi digulung panjang ke bawah, melainkan disajikan per layar (viewport-locked `h-screen overflow-hidden`).
- [x] **Struktur 4 Halaman Diskret**:
  - **Halaman 01 - Beranda & Filosofi**: Twilight Hero banner, sambutan *"Higher Living, Bigger Dreams"*, filosofi residensial PT Baswara Mangkubumi Residence, dan tombol aksi langsung ke unit.
  - **Halaman 02 - Tower & Unit Explorer**: Pilihan unit Arunika & Baskara, filter kamar tidur, kartu unit luxury, dan visualizer denah unit.
  - **Halaman 03 - Fasilitas & Layanan**: Galeri visual fasilitas bintang lima (Sky Pool, Helipad, Butler, Supercar Vault) dan 4 tahapan sewa resmi.
  - **Halaman 04 - Tim Manajemen & Kontak**: Profil jajaran direksi, tim sekretariat, layanan butler, kantor pusat Jl. Boulevard Kusuma Menteng No. 8, serta footer resmi.
- [x] **Kontrol Navigasi Multimodal**:
  - **Top Navbar Tabs**: Switch instan antar halaman dengan highlight emas aktif (`01 Beranda`, `02 Tower & Unit`, `03 Fasilitas & Layanan`, `04 Tim & Kontak`).
  - **Floating Right-Side Rail**: Indikator titik vertikal dengan nomor dan tooltip nama halaman saat disentuh.
  - **Bottom Controller Bar**: Status nomor halaman (`01 / 04`), visual progress indicator, tombol `Prev` dan `Next`, serta shortcut cepat `Private Viewing`.
  - **Keyboard Navigation**: Tombol `ArrowRight` / `PageDown` dan `ArrowLeft` / `PageUp` untuk berpindah halaman secara cepat.

## 2. Struktur Biaya Sewa & Invoice Transparan
- [x] **PPN 11%**: Dihitung otomatis dari total masa sewa (`Base Rent x Durasi`).
- [x] **Bea Materai**: Biaya legalisasi dokumen Rp 10.000 tercantum transparan.
- [x] **Security Deposit**: Tepat 2 bulan sewa pokok (`discountedMonthly * 2`, 100% Refundable).
- [x] **Penyederhanaan Tampilan Invoice**: Menghilangkan duplikasi tabel dan daftar ringkasan ganda, menghapus baris Rp 0 yang berlebih, dan menyajikan rincian penagihan yang ringkas, bersih, dan mewah.
- [x] **Pembersihan Elemen yang Ditandai & 'Tahap 3'**:
  - Menghapus label "PT BASWARA MANGKUBUMI RESIDENCE · PRABASWARA GROUP" di atas judul invoice.
  - Menghapus "Saluran Resmi X: @the_BASWARA · Leasing Management".
  - Menghapus badge dan penyebutan "STATUS: MENUNGGU PEMBAYARAN TAHAP 3" / "(Tahap 3)".
  - Menghapus baris "Status Hunian", "Luas Unit", dan "Durasi Masa Sewa" dari blok metadata calon penyewa & unit pada tampilan invoice.
- [x] **Penyimpanan Otomatis ke Google Drive**: Invoice yang diterbitkan langsung otomatis diunggah dan disimpan ke folder `Baswara Sky Suites - Invoices` di Google Drive saat formulir dikirim, lengkap dengan tautan langsung untuk membuka dokumen.
- [x] **Formulir Registrasi Utuh**: Mengembalikan formulir pendaftaran (`ViewingModal.tsx`) ke format lengkap semula beserta banner integrasi resmi.
- [x] **Instruksi Pembayaran Resmi**: Rekening BCA a.n. PT Baswara Mangkubumi Residence (`8820 9182 33`).
