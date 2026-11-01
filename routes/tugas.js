const express = require('express');
const Tugas = require('../models/Tugas');

const router = express.Router();

function idValid(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function periksaTugas(body) {
  const judul = String(body.judul || '').trim();
  const deskripsi = String(body.deskripsi || '').trim();
  const matkul = String(body.matkul || '').trim();
  const prioritas = body.prioritas;
  const deadline = body.deadline;

  if (judul.length < 3 || judul.length > 100) {
    return { pesan: 'Judul tugas harus terdiri dari 3 sampai 100 karakter' };
  }
  if (matkul.length > 60) {
    return { pesan: 'Nama mata kuliah maksimal 60 karakter' };
  }
  if (deskripsi.length > 500) {
    return { pesan: 'Deskripsi maksimal 500 karakter' };
  }
  if (!['rendah', 'sedang', 'tinggi'].includes(prioritas)) {
    return { pesan: 'Prioritas harus rendah, sedang, atau tinggi' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || isNaN(new Date(deadline))) {
    return { pesan: 'Tanggal deadline tidak valid' };
  }

  return { data: { judul, deskripsi, matkul, prioritas, deadline } };
}

router.get('/', async (req, res) => {
  const daftar = await Tugas.find().sort({ dibuat: 1 });
  res.json(daftar);
});

router.post('/', async (req, res) => {
  const hasil = periksaTugas(req.body || {});
  if (hasil.pesan) {
    return res.status(400).json({ pesan: hasil.pesan });
  }

  const tugasBaru = await Tugas.create(hasil.data);
  res.status(201).json(tugasBaru);
});

router.put('/:id', async (req, res) => {
  if (!idValid(req.params.id)) {
    return res.status(404).json({ pesan: 'Tugas tidak ditemukan' });
  }

  const hasil = periksaTugas(req.body || {});
  if (hasil.pesan) {
    return res.status(400).json({ pesan: hasil.pesan });
  }

  const tugas = await Tugas.findByIdAndUpdate(req.params.id, hasil.data, { new: true });
  if (!tugas) {
    return res.status(404).json({ pesan: 'Tugas tidak ditemukan' });
  }

  res.json(tugas);
});

router.patch('/:id/selesai', async (req, res) => {
  if (!idValid(req.params.id)) {
    return res.status(404).json({ pesan: 'Tugas tidak ditemukan' });
  }

  const tugas = await Tugas.findById(req.params.id);
  if (!tugas) {
    return res.status(404).json({ pesan: 'Tugas tidak ditemukan' });
  }

  tugas.selesai = !tugas.selesai;
  await tugas.save();

  res.json(tugas);
});

router.delete('/:id', async (req, res) => {
  if (!idValid(req.params.id)) {
    return res.status(404).json({ pesan: 'Tugas tidak ditemukan' });
  }

  const tugas = await Tugas.findByIdAndDelete(req.params.id);
  if (!tugas) {
    return res.status(404).json({ pesan: 'Tugas tidak ditemukan' });
  }

  res.json({ pesan: 'Tugas berhasil dihapus' });
});

module.exports = router;
