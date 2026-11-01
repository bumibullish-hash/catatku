require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

let sedangTerhubung = null;

async function hubungkan() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const alamat = process.env.MONGODB_URI;
  if (!alamat) {
    throw new Error('MONGODB_URI belum diisi. Salin file .env.example menjadi .env lalu isi alamat MongoDB.');
  }

  if (!sedangTerhubung) {
    sedangTerhubung = mongoose
      .connect(alamat, {
        dbName: process.env.MONGODB_DB || 'catatku',
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5
      })
      .catch((err) => {
        sedangTerhubung = null;
        throw err;
      });
  }

  await sedangTerhubung;
}

module.exports = { hubungkan };