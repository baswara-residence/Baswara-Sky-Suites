# Integrasi Google Sheets API & Netlify Functions

Rencana arsitektur dan panduan konfigurasi lengkap untuk menghubungkan Google Sheets API ke Netlify menggunakan Service Account, sehingga website dapat secara otomatis menyimpan data reservasi kamar dan invoice pemesanan customer langsung ke Google Spreadsheet.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan preferensi yang Anda pilih:
> - **Metode Autentikasi**: Netlify Serverless Function menggunakan Google Service Account (backend aman, kunci privat tidak pernah bocor ke browser publik).
> - **Status Kredensial**: Anda sudah memiliki JSON Key dari Google Cloud, siap dimasukkan ke Environment Variables Netlify.
> - **Fungsi Utama**: Menyimpan data formulir booking kamar dan rincian invoice sewa ke Google Sheets.

- **Spreadsheet Target**: `1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A` (atau disesuaikan melalui environment variable `GOOGLE_SPREADSHEET_ID`).
- **Izin Google Sheets**: Email Service Account wajib di-invite sebagai **Editor** pada Google Spreadsheet agar API memiliki izin menambahkan baris baru (`append`).

---

### 1. Overview & Core Concept

- **Tujuan**: Memungkinkan website Baswara Sky Suites mengirimkan data reservasi KYC dan tagihan invoice dari browser ke serverless function Netlify, yang kemudian menulis baris data baru ke Google Sheets secara aman.
- **Masalah yang Diatasi**: Google API memerlukan kredensial privat. Jika dipanggil langsung dari browser tanpa login pengguna, kunci privat rentan tercuri. Dengan Netlify Functions, kredensial tersimpan aman di server Netlify dan customer dapat memesan tanpa perlu login akun Google pribadi mereka.
- **Nilai Utama**: Proses pemesanan 100% mulus bagi customer, dan seluruh data reservasi tersentralisasi di Google Spreadsheet pihak manajemen.

---

### 2. Panduan Langkah Konfigurasi Netlify & Google Sheets

Berikut adalah 3 langkah utama yang perlu dilakukan agar API terhubung sempurna di Netlify:

```
┌─────────────────────────┐         ┌───────────────────────────┐         ┌─────────────────────────┐
│   Frontend (React SPA)  │         │ Netlify Serverless Fn     │         │   Google Sheets API     │
│  ViewingModal / Booking ├────────►│ /api/saveBooking          ├────────►│ 1stru_AZYdNuEfAW...     │
│   (Kirim data form)     │  POST   │ (Auth via Service Account)│ Append  │ (Baris baru tersimpan)  │
└─────────────────────────┘         └───────────────────────────┘         └─────────────────────────┘
```

#### Langkah A: Share Spreadsheet ke Email Service Account (Wajib)
1. Buka spreadsheet Anda di browser: [Google Sheets](https://docs.google.com/spreadsheets/d/1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A/edit).
2. Klik tombol **Share (Bagikan)** di pojok kanan atas.
3. Buka file JSON Service Account yang Anda download dari Google Cloud Console, cari baris `"client_email"` (contoh: `nama-service-account@project-id.iam.gserviceaccount.com`).
4. Tempel (paste) email tersebut ke kolom Share Google Sheets, pastikan role dipilih sebagai **Editor**, lalu klik **Send / Bagikan**.

#### Langkah B: Masukkan Environment Variables di Netlify Dashboard
1. Buka dashboard Netlify Anda di [app.netlify.com](https://app.netlify.com).
2. Pilih situs Anda -> Masuk ke **Site configuration** -> **Environment variables**.
3. Tambahkan 3 variabel berikut:
   - `GOOGLE_CLIENT_EMAIL`: Nilai `client_email` dari file JSON Anda.
   - `GOOGLE_PRIVATE_KEY`: Nilai `private_key` dari file JSON Anda (termasuk tag `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`).
   - `GOOGLE_SPREADSHEET_ID`: `1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A`.

#### Langkah C: Konfigurasi Routing Netlify (`netlify.toml`)
Menyediakan file `netlify.toml` pada repositori agar endpoint API `/api/*` secara otomatis diarahkan ke `/.netlify/functions/*` dan single-page routing React tetap berjalan normal:
- Routing `/api/*` -> `/.netlify/functions/:splat`
- Routing `/*` -> `/index.html`

---

### 3. Key Product Decisions & Trade-Offs

- **Endpoint Terpadu (`saveBooking.cjs` & `getsheetsData.cjs`)**:
  - *Chosen Approach*: Menyediakan endpoint serverless khusus `saveBooking.cjs` di folder `netlify/functions/` untuk operasi tulis (append baris booking), serta mempertahankan `getsheetsData.cjs` untuk membaca data jika dibutuhkan.
  - *Why*: Memisahkan operasi baca dan tulis memudahkan isolasi error, manajemen hak akses, dan optimasi runtime.
- **Dukungan Dual-Mode di Frontend**:
  - *Chosen Approach*: Frontend akan memanggil `/api/saveBooking` terlebih dahulu via Netlify Function. Jika serverless endpoint tidak tersedia atau offline, frontend memiliki opsi fallback ke Google OAuth.
  - *Why*: Memastikan aplikasi tetap dapat diuji coba baik di local development / AI Studio preview maupun saat di-deploy ke Netlify.

---

### 4. Technical Architecture & Data Strategy

#### Diagram Alur Data

```
┌────────────────────────────────────────────────────────┐
│                      PENGGUNA                          │
│  Mengisi formulir KYC & Invoice di ViewingModal        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                FRONTEND (src/lib/...)                  │
│  Format payload: BookingSubmissionData                 │
│  fetch('/api/saveBooking', { method: 'POST', body })   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           NETLIFY FUNCTION (saveBooking.cjs)           │
│  1. Parse request body                                 │
│  2. Inisialisasi google.auth.GoogleAuth                │
│  3. Formatter baris tabel (18 kolom standar)           │
│  4. sheets.spreadsheets.values.append                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            GOOGLE SPREADSHEETS SERVER                  │
│  Menyimpan baris reservasi di tab 'Kuesioner & KYC'    │
└────────────────────────────────────────────────────────┘
```

#### Struktur Kolom Data yang Disimpan:
1. Waktu Pendaftaran (Timestamp ISO/WIB)
2. Nama Lengkap Customer
3. Akun Twitter / X (`x.com/...`)
4. Face Claim
5. Tempat & Tanggal Lahir
6. Pekerjaan
7. Status & Detail Hewan Peliharaan
8. Pilihan Tipe Unit Suite
9. Tower
10. Status Hunian (Sendiri / Berbagi)
11. Rincian Co-Tenants
12. Storyline Singkat
13. Link Thread / Utas Karakter
14. Bukti Persetujuan Rules
15. Nomor Invoice Resmi & Nominal Upfront
16. Status KYC Awal (`PENDING_REVIEW`)

#### File yang Akan Dibuat & Dikonfigurasi:
1. `netlify.toml`: Mengatur folder functions dan redirect rewrite `/api/*`.
2. `netlify/functions/saveBooking.cjs`: Serverless function untuk append row booking ke Google Sheets.
3. `server.ts`: Tambahan proxy route lokal `/api/saveBooking` agar pengujian langsung berhasil di preview dev server.
4. `src/lib/googleSheets.ts` & `src/components/ViewingModal.tsx`: Menghubungkan tombol submit form langsung ke endpoint Netlify.
