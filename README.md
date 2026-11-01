# Panduan CatatKu

Dokumen ini berisi cara menjalankan website, persiapan presentasi, alur demo, dan penjelasan kode yang bisa dipakai kelompok saat dinilai. Data CatatKu disimpan di database MongoDB (MongoDB Atlas).

## 1. Cara menjalankan

Kebutuhan:

- Node.js versi 18 atau lebih baru (disarankan versi LTS, unduh di nodejs.org).
- Browser modern seperti Chrome, Edge, atau Firefox.
- Koneksi internet, karena data tersimpan di MongoDB Atlas.
- Alamat IP komputer sudah diizinkan di MongoDB Atlas (lihat bagian 2).

Langkah:

1. Ekstrak folder proyek, lalu buka terminal di dalam folder `catatku`.
2. Pasang dependensi: `npm install`
3. Periksa file `.env` (lihat bagian 3). Jika belum ada, salin `.env.example` menjadi `.env` lalu isi.
4. Jalankan server: `npm start`
5. Jika berhasil, terminal menampilkan `Terhubung ke MongoDB` lalu `CatatKu berjalan di http://localhost:3000`.
6. Buka `http://localhost:3000` di browser.
7. Hentikan server dengan menekan `Ctrl + C` di terminal.

Jika port 3000 sudah dipakai program lain, ubah nilai `PORT` di file `.env` (misalnya menjadi `4000`), lalu jalankan ulang server dan buka `http://localhost:4000`.

Mengisi data contoh: `npm run reset`. Perintah ini **menghapus isi koleksi `tugas` dan `catatan`** pada database yang tertulis di `MONGODB_DB`, lalu mengisinya dengan 8 tugas dan 5 catatan contoh. Deadline contoh dihitung dari tanggal hari ini, jadi ada tugas yang terlambat, jatuh tempo hari ini, dan masih lama. Database atau koleksi lain tidak disentuh. Setelah reset, muat ulang halaman di browser.

## 2. Menyiapkan MongoDB Atlas

1. Masuk ke akun MongoDB Atlas dan buka cluster yang dipakai.
2. Menu **Security > Database Access**: pastikan ada user database dengan hak baca dan tulis.
3. Menu **Network Access > Add IP Address**: izinkan alamat IP komputer yang menjalankan server. Jika jaringan berpindah-pindah (misalnya saat presentasi), pilih **Allow Access From Anywhere** (`0.0.0.0/0`), lalu hapus aturan itu setelah penilaian selesai.
4. Klik **Connect > Drivers** pada cluster untuk menyalin alamat koneksi (connection string).

Database `catatku` dan koleksinya dibuat otomatis saat data pertama disimpan.

## 3. File `.env`

File `.env` berada di folder `catatku` dan berisi tiga baris:

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/
MONGODB_DB=catatku
PORT=3000
```

- `MONGODB_URI`: alamat koneksi MongoDB Atlas.
- `MONGODB_DB`: nama database yang dipakai.
- `PORT`: nomor port server.

File ini berisi password database. **Jangan dibagikan, jangan diunggah ke GitHub, dan jangan disertakan jika proyek dikirim ke orang lain.** Sertakan `.env.example` saja. Jika password pernah terlihat orang lain, ganti password user database di menu Database Access, lalu perbarui `MONGODB_URI`. Jika password memuat simbol khusus seperti `@` atau `:`, tulis dalam bentuk URL-encode.

## 4. Persiapan sebelum presentasi

- Pastikan internet aktif dan alamat IP komputer sudah diizinkan di Atlas. Jaringan kampus sering berbeda dari jaringan rumah, jadi cek ulang di tempat presentasi atau gunakan hotspot HP sebagai cadangan.
- Jalankan `npm run reset`, lalu `npm start`, agar data demo bersih dan deadline sesuai hari presentasi.
- Buka semua halaman sekali untuk memastikan tidak ada yang gagal dimuat.
- Siapkan tampilan MongoDB Atlas (menu **Browse Collections**) di tab browser lain untuk menunjukkan bahwa data benar-benar tersimpan di database.
- Siapkan tampilan HP. Ada dua cara:
  - Di laptop: tekan `F12`, lalu `Ctrl + Shift + M` (mode perangkat) dan pilih ukuran seperti iPhone atau Galaxy.
  - Di HP asli: sambungkan HP dan laptop ke Wi-Fi yang sama, cari alamat IP laptop (`ipconfig` di Windows, `ifconfig` di macOS/Linux), lalu buka `http://ALAMAT-IP:3000` di HP. Jika Windows menampilkan peringatan firewall, izinkan akses Node.js.
- Bootstrap, ikon, dan font disimpan di folder `public/vendor`, jadi tampilan website tidak bergantung pada internet.
- Bawa cadangan: folder proyek di flashdisk (tanpa `.env` jika flashdisk dipinjamkan), dan screenshot dari manual book.

## 5. Usulan alur demo (sekitar 8 menit)

| Menit | Bagian | Yang ditunjukkan |
|---|---|---|
| 0-1 | Pembukaan | Nama website, tujuan, dan teknologi (halaman Tentang). |
| 1-2 | Beranda | Empat angka ringkasan dan daftar tugas terdekat. Centang satu tugas dan tunjukkan angka berubah. |
| 2-4 | Tugas | Tambah tugas (tunjukkan validasi form kosong lebih dulu), edit, tandai selesai, cari, filter status dan prioritas, hapus dengan konfirmasi. |
| 4-5 | Catatan | Tambah catatan dengan memilih warna, edit, cari, hapus. |
| 5-6 | Database | Buka MongoDB Atlas (Browse Collections) dan tunjukkan data baru muncul di koleksi `tugas` atau `catatan`. |
| 6-7 | Responsif | Kecilkan jendela atau buka mode HP: menu berubah jadi hamburger, kartu catatan jadi satu kolom. |
| 7-8 | Penjelasan kode | Struktur folder, alur satu fitur (bagian 7), dan tanya jawab. |

Pembagian bicara untuk tiga anggota bisa seperti ini: anggota 1 membahas konsep, tampilan, dan responsif; anggota 2 membahas fitur tugas dan catatan dari sisi pengguna dan JavaScript; anggota 3 membahas backend Node.js, API, dan MongoDB. Sesuaikan dengan jumlah anggota dan siapa mengerjakan apa.

## 6. Penjelasan struktur kode

| Berkas | Fungsi |
|---|---|
| `server.js` | Menghubungkan ke MongoDB, menjalankan Express, menyajikan folder `public`, dan memasang route API. |
| `koneksi.js` | Membaca file `.env` lalu menghubungkan server ke MongoDB memakai Mongoose. |
| `models/Tugas.js` | Struktur data tugas (model Mongoose), disimpan di koleksi `tugas`. |
| `models/Catatan.js` | Struktur data catatan (model Mongoose), disimpan di koleksi `catatan`. |
| `routes/tugas.js` | API tugas: lihat, tambah, ubah, hapus, dan ubah status selesai. Berisi validasi di sisi server. |
| `routes/catatan.js` | API catatan: lihat, tambah, ubah, dan hapus. |
| `routes/ringkasan.js` | Menghitung angka di beranda dan menentukan 5 tugas terdekat. |
| `reset-data.js` | Mengosongkan koleksi lalu mengisi data contoh dengan deadline relatif terhadap hari ini. |
| `.env`, `.env.example` | Pengaturan database. `.env` rahasia, `.env.example` hanya contoh. |
| `public/*.html` | Empat halaman: `index`, `tugas`, `catatan`, `tentang`. |
| `public/css/style.css` | Tema warna, font, dan penyesuaian di atas Bootstrap. |
| `public/js/umum.js` | Fungsi yang dipakai semua halaman: panggil API, format tanggal, label deadline, baris tugas, notifikasi. |
| `public/js/beranda.js`, `tugas.js`, `catatan.js` | Logika tiap halaman. |
| `public/vendor/` | Bootstrap, Bootstrap Icons, dan font yang disimpan lokal. |

## 7. Alur satu fitur: menambah tugas

Alur ini cocok dijelaskan saat ditanya cara frontend, backend, dan database terhubung.

1. Pengguna menekan **Tambah tugas**. Modal Bootstrap terbuka (`tugas.html`, fungsi `bukaFormTambah` di `tugas.js`).
2. Pengguna mengisi form lalu menekan **Simpan tugas**. Event `submit` dijalankan.
3. JavaScript memeriksa isian dengan `checkValidity()`. Jika tidak valid, pesan merah muncul dan tidak ada data yang dikirim.
4. Jika valid, `panggilApi` di `umum.js` mengirim `POST /api/tugas` berisi data dalam format JSON memakai `fetch`.
5. Server menerima di `routes/tugas.js`. Fungsi `periksaTugas` memeriksa ulang data (judul 3-100 karakter, prioritas, format tanggal).
6. Jika valid, `Tugas.create(...)` (model Mongoose di `models/Tugas.js`) menyimpan dokumen baru ke koleksi `tugas` di MongoDB, lalu server membalas dengan data tugas tersebut.
7. Browser menerima balasan, menambahkan tugas ke daftar, menampilkan notifikasi, dan menggambar ulang daftar.

## 8. Daftar API

| Metode | Alamat | Fungsi |
|---|---|---|
| GET | `/api/tugas` | Mengambil semua tugas. |
| POST | `/api/tugas` | Menambah tugas. |
| PUT | `/api/tugas/:id` | Mengubah tugas. |
| PATCH | `/api/tugas/:id/selesai` | Membalik status selesai atau belum selesai. |
| DELETE | `/api/tugas/:id` | Menghapus tugas. |
| GET | `/api/catatan` | Mengambil semua catatan. |
| POST | `/api/catatan` | Menambah catatan. |
| PUT | `/api/catatan/:id` | Mengubah catatan. |
| DELETE | `/api/catatan/:id` | Menghapus catatan. |
| GET | `/api/ringkasan` | Angka ringkasan beranda dan 5 tugas terdekat. |

`:id` adalah nomor unik (ObjectId) yang dibuat MongoDB. Di API dan di browser, nomor ini ditampilkan sebagai `id`.

## 9. Struktur data di MongoDB

Database `catatku` (nama dapat diubah lewat `MONGODB_DB`) memiliki dua koleksi.

**Koleksi `tugas`**: `_id`, `judul`, `deskripsi`, `matkul`, `prioritas` (`rendah`, `sedang`, atau `tinggi`), `deadline` (teks berformat `tahun-bulan-tanggal`), `selesai` (true atau false), `dibuat`, dan `diubah`.

**Koleksi `catatan`**: `_id`, `judul`, `isi`, `warna` (`kuning`, `biru`, `hijau`, `merah`, atau `ungu`), `dibuat`, dan `diubah`.

Kolom `dibuat` dan `diubah` diisi otomatis oleh Mongoose.

## 10. Aturan yang berlaku di website

- **Mendekati deadline** di beranda: tugas yang belum selesai dengan deadline hari ini sampai 3 hari ke depan. Tugas yang sudah lewat tidak dihitung di angka ini, tetapi diberi label merah "Terlambat" di daftar.
- **Tugas terdekat** di beranda: 5 tugas belum selesai dengan deadline paling awal, termasuk yang sudah terlambat.
- **Urutan di halaman Tugas**: tugas belum selesai lebih dulu (deadline paling awal di atas), lalu tugas selesai.
- **Urutan di halaman Catatan**: catatan yang terakhir diubah tampil paling depan.
- **Kartu catatan** menampilkan maksimal 8 baris isi. Isi lengkap terlihat saat catatan diedit.
- Judul tugas 3-100 karakter, judul catatan 3-80 karakter, isi catatan maksimal 2000 karakter.

## 11. Kemungkinan pertanyaan dosen

**Kenapa memakai MongoDB?**
MongoDB menyimpan data dalam bentuk dokumen mirip JSON, sehingga cocok dengan data JavaScript yang dikirim antara browser dan server. MongoDB Atlas juga tersedia sebagai layanan cloud, jadi tidak perlu memasang database di komputer. Setiap tugas dan catatan disimpan sebagai satu dokumen.

**Apa fungsi Mongoose?**
Mongoose menghubungkan Node.js ke MongoDB dan memungkinkan kita mendefinisikan struktur data lewat model (`models/Tugas.js` dan `models/Catatan.js`), serta menyediakan fungsi seperti `create`, `find`, `findByIdAndUpdate`, dan `findByIdAndDelete`.

**Kenapa alamat database ada di file `.env`, bukan di kode?**
Alamat koneksi berisi password. Dengan menaruhnya di `.env` dan mengecualikannya dari Git (`.gitignore`), password tidak ikut terunggah saat kode dibagikan.

**Bagaimana website dibuat responsif?**
Memakai grid Bootstrap (`col-12 col-md-6 col-lg-4`) untuk kartu catatan, `navbar-expand-md` agar menu menjadi hamburger di layar kecil, dan beberapa media query di `style.css` untuk jarak serta tombol di layar HP.

**Kenapa validasi ada di browser dan di server?**
Validasi di browser memberi tahu pengguna dengan cepat. Validasi di server tetap perlu karena permintaan ke API bisa dikirim tanpa lewat form.

**Bagaimana mencegah kode HTML berbahaya yang diketik pengguna?**
Teks dari pengguna dilewatkan fungsi `aman()` di `umum.js` sebelum ditampilkan, sehingga tanda seperti `<` dan `>` tampil sebagai teks biasa.

**Kenapa tidak ada login?**
Sesuai konsep yang disepakati, CatatKu dipakai satu orang. Semua orang yang memakai website dengan database yang sama akan melihat data yang sama.

**Apa keterbatasan website ini?**
Data tidak dipisahkan per pengguna, tidak ada pengingat otomatis atau notifikasi deadline, dan website membutuhkan koneksi internet ke MongoDB Atlas.

## 12. Jika terjadi masalah

| Masalah | Penyebab dan solusi |
|---|---|
| `npm` tidak dikenali | Node.js belum terpasang. Pasang dari nodejs.org lalu buka terminal baru. |
| `Cannot find module` | Jalankan `npm install` di dalam folder `catatku`. |
| `MONGODB_URI belum diisi` | File `.env` tidak ada atau kosong. Salin `.env.example` menjadi `.env` lalu isi. |
| `Gagal terhubung ke MongoDB` dengan `Server selection timed out` | Alamat IP komputer belum diizinkan di Network Access Atlas, atau internet mati. Tambahkan IP di Atlas, tunggu sebentar, lalu jalankan ulang. |
| `bad auth` atau `Authentication failed` | Username atau password di `MONGODB_URI` salah. Periksa di Database Access. |
| `querySrv ECONNREFUSED` atau `querySrv ENOTFOUND` | Jaringan atau DNS tidak bisa mencari alamat `mongodb+srv`. Cek internet, coba jaringan lain (misalnya hotspot HP), atau ganti DNS komputer. |
| `EADDRINUSE` (port terpakai) | Ubah `PORT` di `.env`. |
| Halaman menampilkan "Data tidak bisa dimuat" | Server tidak berjalan. Jalankan `npm start`, lalu muat ulang halaman. |
| Data kacau atau ingin mulai dari awal | Jalankan `npm run reset`. |
| Halaman tidak berubah setelah kode diedit | Server harus dimulai ulang untuk kode di `routes/`, `models/`, dan `server.js`. Untuk file di `public/`, cukup muat ulang browser (`Ctrl + F5`). |
