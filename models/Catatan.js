const mongoose = require('mongoose');

const catatanSchema = new mongoose.Schema(
  {
    judul: { type: String, required: true, trim: true },
    isi: { type: String, required: true, trim: true },
    warna: { type: String, enum: ['kuning', 'biru', 'hijau', 'merah', 'ungu'], default: 'kuning' }
  },
  {
    collection: 'catatan',
    timestamps: { createdAt: 'dibuat', updatedAt: 'diubah' },
    toJSON: {
      versionKey: false,
      transform: (doc, hasil) => {
        hasil.id = hasil._id.toString();
        delete hasil._id;
        return hasil;
      }
    }
  }
);

module.exports = mongoose.model('Catatan', catatanSchema);
