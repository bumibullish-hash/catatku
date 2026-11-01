const express = require('express');
const Tugas = require('../models/Tugas');
const Catatan = require('../models/Catatan');

const router = express.Router();

function tanggalGeser(jumlahHari) {
  const tanggal = new Date();
  tanggal.setDate(tanggal.getDate() + jumlahHari);
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
  const hari = String(tanggal.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${hari}`;
}

router.get('/', async (req, res) => {
  const hariIni = tanggalGeser(0);
  const batas = tanggalGeser(3);

  const [belumSelesai, selesai, mendekatiDeadline, jumlahCatatan, tugasTerdekat] = await Promise.all([
    Tugas.countDocuments({ selesai: false }),
    Tugas.countDocuments({ selesai: true }),
    Tugas.countDocuments({ selesai: false, deadline: { $gte: hariIni, $lte: batas } }),
    Catatan.countDocuments(),
    Tugas.find({ selesai: false }).sort({ deadline: 1 }).limit(5)
  ]);

  res.json({ belumSelesai, selesai, mendekatiDeadline, jumlahCatatan, tugasTerdekat });
});

module.exports = router;
