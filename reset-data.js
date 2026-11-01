const mongoose = require('mongoose');
const { hubungkan } = require('./koneksi');
const Tugas = require('./models/Tugas');
const Catatan = require('./models/Catatan');

function tanggalGeser(jumlahHari) {
  const tanggal = new Date();
  tanggal.setDate(tanggal.getDate() + jumlahHari);
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
  const hari = String(tanggal.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${hari}`;
}

const sekarang = Date.now();
const waktu = (menitLalu) => new Date(sekarang - menitLalu * 60000);

function tugasContoh(judul, deskripsi, matkul, prioritas, hariDeadline, selesai, menitLalu) {
  return {
    judul,
    deskripsi,
    matkul,
    prioritas,
    deadline: tanggalGeser(hariDeadline),
    selesai,
    dibuat: waktu(menitLalu),
    diubah: waktu(menitLalu)
  };
}

function catatanContoh(judul, isi, warna, menitLalu) {
  return { judul, isi, warna, dibuat: waktu(menitLalu), diubah: waktu(menitLalu) };
}

const tugas = [
  tugasContoh('Laporan praktikum basis data', 'Lengkapi ERD dan hasil query pada bab 3.', 'Basis Data', 'tinggi', -1, false, 5000),
  tugasContoh('Presentasi proyek pemrograman web', 'Siapkan demo dan pembagian bicara tiap anggota.', 'Pemrograman Web', 'tinggi', 0, false, 4800),
  tugasContoh('Kerjakan soal latihan algoritma', 'Soal nomor 1 sampai 10 tentang rekursi.', 'Algoritma dan Struktur Data', 'sedang', 2, false, 4000),
  tugasContoh('Rangkuman bab 4 jaringan komputer', 'Fokus pada model OSI dan TCP/IP.', 'Jaringan Komputer', 'sedang', 4, false, 3500),
  tugasContoh('Baca jurnal untuk tugas metodologi', '', 'Metodologi Penelitian', 'rendah', 7, false, 3000),
  tugasContoh('Tugas kelompok analisis sistem', 'Gabungkan diagram use case dari semua anggota.', 'Analisis dan Perancangan Sistem', 'sedang', 10, false, 2500),
  tugasContoh('Kuis online statistika', 'Kuis distribusi normal sudah dikerjakan.', 'Statistika', 'rendah', -3, true, 6000),
  tugasContoh('Kumpulkan form KRS', '', '', 'rendah', -5, true, 8000)
];

const catatan = [
  catatanContoh('Jadwal konsultasi dosen', 'Senin 10.00 dengan Pak Dosen untuk bimbingan proyek.\nBawa draft laporan dan laptop.', 'kuning', 1200),
  catatanContoh('Referensi belajar', 'Dokumentasi Bootstrap, MDN Web Docs, dan dokumentasi Express untuk bahan laporan.', 'biru', 900),
  catatanContoh('Rumus penting statistika', 'Rata-rata = jumlah data dibagi banyak data.\nVarians = rata-rata kuadrat selisih data terhadap rata-rata.', 'hijau', 600),
  catatanContoh('Barang dibawa saat presentasi', 'Laptop, charger, kabel HDMI, dan flashdisk cadangan berisi source code.', 'merah', 300),
  catatanContoh('Catatan kuliah jaringan', 'TCP bersifat connection-oriented, UDP tidak. Port HTTP 80, HTTPS 443.', 'ungu', 100)
];

async function isiUlang() {
  await hubungkan();
  const namaDatabase = mongoose.connection.name;
  console.log(`Menghapus isi koleksi "tugas" dan "catatan" di database "${namaDatabase}"...`);

  await Tugas.deleteMany({});
  await Catatan.deleteMany({});
  await Tugas.collection.insertMany(tugas);
  await Catatan.collection.insertMany(catatan);

  console.log(`Data contoh dibuat: ${tugas.length} tugas dan ${catatan.length} catatan.`);
}

isiUlang()
  .catch((err) => {
    console.error('Gagal mengisi data contoh:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
