const express = require('express');
const path = require('path');
const { hubungkan } = require('./koneksi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', async (req, res, next) => {
  try {
    await hubungkan();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/tugas', require('./routes/tugas'));
app.use('/api/catatan', require('./routes/catatan'));
app.use('/api/ringkasan', require('./routes/ringkasan'));

app.use('/api', (req, res) => {
  res.status(404).json({ pesan: 'Alamat API tidak ditemukan' });
});

app.use((req, res) => {
  res.status(404).send('Halaman tidak ditemukan. <a href="/">Kembali ke beranda</a>');
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ pesan: 'Data yang dikirim tidak valid' });
  }
  console.error(err);
  if (err.message.includes('MONGODB_URI')) {
    return res.status(503).json({ pesan: 'MONGODB_URI belum diisi di server. Isi environment variable lalu deploy ulang.' });
  }
  if (err.name === 'MongoParseError') {
    return res.status(503).json({ pesan: 'Isi MONGODB_URI tidak valid. Periksa tanda kutip atau spasi pada alamat koneksi.' });
  }
  if (err.message.includes('bad auth') || err.code === 18) {
    return res.status(503).json({ pesan: 'Username atau password database salah. Periksa MONGODB_URI.' });
  }
  if (err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({ pesan: 'Server tidak bisa menjangkau MongoDB. Periksa Network Access di MongoDB Atlas.' });
  }
  res.status(500).json({ pesan: 'Terjadi kesalahan pada server' });
});

if (require.main === module && !process.env.VERCEL) {
  hubungkan()
    .then(() => {
      console.log('Terhubung ke MongoDB');
      app.listen(PORT, () => {
        console.log(`CatatKu berjalan di http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Gagal terhubung ke MongoDB:', err.message);
      console.error('Periksa: (1) file .env sudah benar, (2) komputer terhubung ke internet,');
      console.error('(3) alamat IP komputer sudah diizinkan di MongoDB Atlas (Network Access),');
      console.error('(4) username dan password pada MONGODB_URI sudah benar.');
      process.exit(1);
    });
}

module.exports = app;
