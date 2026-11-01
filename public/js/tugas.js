let semuaTugas = [];
let idDiedit = null;
let idDihapus = null;

const daftarTugas = document.getElementById('daftarTugas');
const kolomCari = document.getElementById('cari');
const pilihStatus = document.getElementById('filterStatus');
const pilihPrioritas = document.getElementById('filterPrioritas');
const infoJumlah = document.getElementById('infoJumlah');
const formTugas = document.getElementById('formTugas');
const tombolSimpan = document.getElementById('tombolSimpan');
const modalTugasEl = document.getElementById('modalTugas');
const modalTugas = new bootstrap.Modal(modalTugasEl);
const modalHapus = new bootstrap.Modal(document.getElementById('modalHapus'));

async function muatTugas() {
  try {
    semuaTugas = await panggilApi('/api/tugas');
    tampilkanTugas();
  } catch (err) {
    infoJumlah.textContent = '';
    daftarTugas.innerHTML = buatPesanError(err.message);
  }
}

function saringTugas() {
  const kata = kolomCari.value.trim().toLowerCase();

  return semuaTugas.filter((tugas) => {
    const cocokKata =
      kata === '' ||
      tugas.judul.toLowerCase().includes(kata) ||
      tugas.matkul.toLowerCase().includes(kata) ||
      tugas.deskripsi.toLowerCase().includes(kata);

    const cocokStatus =
      pilihStatus.value === 'semua' ||
      (pilihStatus.value === 'selesai' && tugas.selesai) ||
      (pilihStatus.value === 'belum' && !tugas.selesai);

    const cocokPrioritas =
      pilihPrioritas.value === 'semua' || tugas.prioritas === pilihPrioritas.value;

    return cocokKata && cocokStatus && cocokPrioritas;
  });
}

function urutkanTugas(daftar) {
  return daftar.sort((a, b) => {
    if (a.selesai !== b.selesai) {
      return a.selesai ? 1 : -1;
    }
    return a.deadline.localeCompare(b.deadline);
  });
}

function tampilkanTugas() {
  const hasil = urutkanTugas(saringTugas());
  infoJumlah.textContent = `Menampilkan ${hasil.length} dari ${semuaTugas.length} tugas`;

  if (semuaTugas.length === 0) {
    daftarTugas.innerHTML = buatKosong(
      'bi-journal-plus',
      'Belum ada tugas',
      'Tambahkan tugas pertamamu supaya deadline tidak terlewat.',
      '<button type="button" class="btn btn-primary" data-aksi="tambah">Tambah tugas</button>'
    );
    return;
  }

  if (hasil.length === 0) {
    daftarTugas.innerHTML = buatKosong(
      'bi-search',
      'Tidak ada tugas yang cocok',
      'Coba ubah kata kunci atau filter yang dipilih.',
      '<button type="button" class="btn btn-outline-primary" data-aksi="atur-ulang">Atur ulang filter</button>'
    );
    return;
  }

  daftarTugas.innerHTML = hasil.map((tugas) => buatBarisTugas(tugas, true)).join('');
}

function aturUlangFilter() {
  kolomCari.value = '';
  pilihStatus.value = 'semua';
  pilihPrioritas.value = 'semua';
}

function bukaFormTambah() {
  idDiedit = null;
  formTugas.reset();
  formTugas.classList.remove('was-validated');
  document.getElementById('judulModalTugas').textContent = 'Tambah tugas';
  modalTugas.show();
}

function bukaFormEdit(id) {
  const tugas = semuaTugas.find((item) => item.id === id);
  if (!tugas) {
    return;
  }

  idDiedit = id;
  formTugas.classList.remove('was-validated');
  document.getElementById('judulModalTugas').textContent = 'Edit tugas';
  document.getElementById('judul').value = tugas.judul;
  document.getElementById('matkul').value = tugas.matkul;
  document.getElementById('prioritas').value = tugas.prioritas;
  document.getElementById('deadline').value = tugas.deadline;
  document.getElementById('deskripsi').value = tugas.deskripsi;
  modalTugas.show();
}

modalTugasEl.addEventListener('shown.bs.modal', () => {
  document.getElementById('judul').focus();
});

formTugas.addEventListener('submit', async (e) => {
  e.preventDefault();

  const kolomJudul = document.getElementById('judul');
  kolomJudul.value = kolomJudul.value.trim();
  formTugas.classList.add('was-validated');
  if (!formTugas.checkValidity()) {
    return;
  }

  const isi = {
    judul: kolomJudul.value,
    matkul: document.getElementById('matkul').value,
    prioritas: document.getElementById('prioritas').value,
    deadline: document.getElementById('deadline').value,
    deskripsi: document.getElementById('deskripsi').value
  };

  tombolSimpan.disabled = true;
  try {
    if (idDiedit) {
      const hasil = await panggilApi(`/api/tugas/${idDiedit}`, 'PUT', isi);
      const posisi = semuaTugas.findIndex((item) => item.id === idDiedit);
      semuaTugas[posisi] = hasil;
      tampilToast('Tugas berhasil diperbarui');
    } else {
      const hasil = await panggilApi('/api/tugas', 'POST', isi);
      semuaTugas.push(hasil);
      aturUlangFilter();
      tampilToast('Tugas berhasil ditambahkan');
    }
    modalTugas.hide();
    tampilkanTugas();
  } catch (err) {
    tampilToast(err.message, 'gagal');
  } finally {
    tombolSimpan.disabled = false;
  }
});

daftarTugas.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-aksi]');
  if (!tombol) {
    return;
  }

  const aksi = tombol.dataset.aksi;
  const id = tombol.dataset.id;

  if (aksi === 'edit') {
    bukaFormEdit(id);
  } else if (aksi === 'hapus') {
    const tugas = semuaTugas.find((item) => item.id === id);
    idDihapus = id;
    document.getElementById('namaTugasDihapus').textContent = tugas.judul;
    modalHapus.show();
  } else if (aksi === 'tambah') {
    bukaFormTambah();
  } else if (aksi === 'atur-ulang') {
    aturUlangFilter();
    tampilkanTugas();
  }
});

daftarTugas.addEventListener('change', async (e) => {
  if (!e.target.classList.contains('centang')) {
    return;
  }

  const id = e.target.dataset.id;
  try {
    const hasil = await panggilApi(`/api/tugas/${id}/selesai`, 'PATCH');
    const tugas = semuaTugas.find((item) => item.id === id);
    tugas.selesai = hasil.selesai;
    tampilToast(hasil.selesai ? 'Tugas ditandai selesai' : 'Tugas dikembalikan ke belum selesai');
  } catch (err) {
    tampilToast(err.message, 'gagal');
  }

  tampilkanTugas();
  const centangBaru = daftarTugas.querySelector(`.centang[data-id="${id}"]`);
  if (centangBaru) {
    centangBaru.focus();
  }
});

document.getElementById('tombolTambah').addEventListener('click', bukaFormTambah);

document.getElementById('tombolHapus').addEventListener('click', async () => {
  try {
    await panggilApi(`/api/tugas/${idDihapus}`, 'DELETE');
    semuaTugas = semuaTugas.filter((item) => item.id !== idDihapus);
    tampilToast('Tugas berhasil dihapus');
    tampilkanTugas();
  } catch (err) {
    tampilToast(err.message, 'gagal');
  }
  modalHapus.hide();
});

kolomCari.addEventListener('input', tampilkanTugas);
pilihStatus.addEventListener('change', tampilkanTugas);
pilihPrioritas.addEventListener('change', tampilkanTugas);

muatTugas().then(() => {
  const parameter = new URLSearchParams(window.location.search);
  if (parameter.get('baru') === '1') {
    history.replaceState(null, '', 'tugas.html');
    bukaFormTambah();
  }
});
