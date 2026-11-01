require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

async function hubungkan() {
  const alamat = process.env.MONGODB_URI;
  if (!alamat) {
    throw new Error('MONGODB_URI belum diisi. Salin file .env.example menjadi .env lalu isi alamat MongoDB.');
  }

  await mongoose.connect(alamat, {
    dbName: process.env.MONGODB_DB || 'catatku',
    serverSelectionTimeoutMS: 10000
  });
}

module.exports = { hubungkan };
