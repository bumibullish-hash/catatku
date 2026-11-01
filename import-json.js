const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { hubungkan } = require('./koneksi');

const { EJSON } = mongoose.mongo.BSON;
const daftarKoleksi = ['tugas', 'catatan'];

async function impor() {
  const data = {};
  for (const nama of daftarKoleksi) {
    const lokasi = path.join(__dirname, `${nama}.json`);
    if (!fs.existsSync(lokasi)) {
      throw new Error(`File ${nama}.json tidak ditemukan di folder ${__dirname}`);
    }
    data[nama] = EJSON.parse(fs.readFileSync(lokasi, 'utf8'));
  }

  await hubungkan();
  console.log(`Mengimpor ke database "${mongoose.connection.name}"...`);

  for (const nama of daftarKoleksi) {
    const koleksi = mongoose.connection.collection(nama);
    await koleksi.deleteMany({});
    await koleksi.insertMany(data[nama]);
    console.log(`Koleksi ${nama}: ${data[nama].length} dokumen berhasil diimpor`);
  }
}

impor()
  .catch((err) => {
    console.error('Impor gagal:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());