const express = require('express');
const Catatan = require('../models/Catatan');

const router = express.Router();

const daftarWarna = ['kuning', 'biru', 'hijau', 'merah', 'ungu'];

function idValid(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function periksaCatatan(body) {
  const judul = String(body.judul || '').trim();
  const isi = String(body.isi || '').trim();
  const warna = body.warna;

  if (judul.length < 3 || judul.length > 80) {
    return { pesan: 'Judul catatan harus terdiri dari 3 sampai 80 karakter' };
  }
  if (isi.length < 1 || isi.length > 2000) {
    return { pesan: 'Isi catatan wajib diisi dan maksimal 2000 karakter' };
  }
  if (!daftarWarna.includes(warna)) {
    return { pesan: 'Warna catatan tidak valid' };
  }

  return { data: { judul, isi, warna } };
}

router.get('/', async (req, res) => {
  const daftar = await Catatan.find().sort({ diubah: -1 });
  res.json(daftar);
});

router.post('/', async (req, res) => {
  const hasil = periksaCatatan(req.body || {});
  if (hasil.pesan) {
    return res.status(400).json({ pesan: hasil.pesan });
  }

  const catatanBaru = await Catatan.create(hasil.data);
  res.status(201).json(catatanBaru);
});

router.put('/:id', async (req, res) => {
  if (!idValid(req.params.id)) {
    return res.status(404).json({ pesan: 'Catatan tidak ditemukan' });
  }

  const hasil = periksaCatatan(req.body || {});
  if (hasil.pesan) {
    return res.status(400).json({ pesan: hasil.pesan });
  }

  const catatan = await Catatan.findByIdAndUpdate(req.params.id, hasil.data, { new: true });
  if (!catatan) {
    return res.status(404).json({ pesan: 'Catatan tidak ditemukan' });
  }

  res.json(catatan);
});

router.delete('/:id', async (req, res) => {
  if (!idValid(req.params.id)) {
    return res.status(404).json({ pesan: 'Catatan tidak ditemukan' });
  }

  const catatan = await Catatan.findByIdAndDelete(req.params.id);
  if (!catatan) {
    return res.status(404).json({ pesan: 'Catatan tidak ditemukan' });
  }

  res.json({ pesan: 'Catatan berhasil dihapus' });
});

module.exports = router;
