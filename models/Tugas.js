const mongoose = require('mongoose');

const tugasSchema = new mongoose.Schema(
  {
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, default: '', trim: true },
    matkul: { type: String, default: '', trim: true },
    prioritas: { type: String, enum: ['rendah', 'sedang', 'tinggi'], default: 'sedang' },
    deadline: { type: String, required: true },
    selesai: { type: Boolean, default: false }
  },
  {
    collection: 'tugas',
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

module.exports = mongoose.model('Tugas', tugasSchema);
