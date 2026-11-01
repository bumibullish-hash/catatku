let semuaCatatan = [];
let idDiedit = null;
let idDihapus = null;

const daftarCatatan = document.getElementById('daftarCatatan');
const kolomCari = document.getElementById('cari');
const infoJumlah = document.getElementById('infoJumlah');
const formCatatan = document.getElementById('formCatatan');
const tombolSimpan = document.getElementById('tombolSimpan');
const modalCatatanEl = document.getElementById('modalCatatan');
const modalCatatan = new bootstrap.Modal(modalCatatanEl);
const modalHapus = new bootstrap.Modal(document.getElementById('modalHapus'));

async function muatCatatan() {
  try {
    semuaCatatan = await panggilApi('/api/catatan');
    tampilkanCatatan();
  } catch (err) {
    infoJumlah.textContent = '';
    daftarCatatan.innerHTML = `<div class="col-12 kertas">${buatPesanError(err.message)}</div>`;
  }
}

function buatKartuCatatan(catatan) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="kartu-catatan warna-${catatan.warna}">
        <h2>${aman(catatan.judul)}</h2>
        <p class="isi-catatan">${aman(catatan.isi)}</p>
        <div class="kaki-catatan">
          <span>Diubah ${formatTanggal(catatan.diubah)}</span>
          <div class="aksi-tugas">
            <button type="button" class="btn-ikon" data-aksi="edit" data-id="${catatan.id}" aria-label="Edit catatan ${aman(catatan.judul)}" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn-ikon hapus" data-aksi="hapus" data-id="${catatan.id}" aria-label="Hapus catatan ${aman(catatan.judul)}" title="Hapus">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </article>
    </div>`;
}

function tampilkanCatatan() {
  const kata = kolomCari.value.trim().toLowerCase();
  const hasil = semuaCatatan
    .filter((catatan) => {
      return (
        kata === '' ||
        catatan.judul.toLowerCase().includes(kata) ||
        catatan.isi.toLowerCase().includes(kata)
      );
    })
    .sort((a, b) => b.diubah.localeCompare(a.diubah));

  infoJumlah.textContent = `Menampilkan ${hasil.length} dari ${semuaCatatan.length} catatan`;

  if (semuaCatatan.length === 0) {
    daftarCatatan.innerHTML = `<div class="col-12 kertas">${buatKosong(
      'bi-journal-text',
      'Belum ada catatan',
      'Tulis catatan pertamamu, misalnya jadwal konsultasi atau ringkasan materi.',
      '<button type="button" class="btn btn-primary" data-aksi="tambah">Tambah catatan</button>'
    )}</div>`;
    return;
  }

  if (hasil.length === 0) {
    daftarCatatan.innerHTML = `<div class="col-12 kertas">${buatKosong(
      'bi-search',
      'Tidak ada catatan yang cocok',
      'Coba gunakan kata kunci yang lain.',
      '<button type="button" class="btn btn-outline-primary" data-aksi="atur-ulang">Hapus pencarian</button>'
    )}</div>`;
    return;
  }

  daftarCatatan.innerHTML = hasil.map(buatKartuCatatan).join('');
}

function bukaFormTambah() {
  idDiedit = null;
  formCatatan.reset();
  formCatatan.classList.remove('was-validated');
  document.getElementById('judulModalCatatan').textContent = 'Tambah catatan';
  modalCatatan.show();
}

function bukaFormEdit(id) {
  const catatan = semuaCatatan.find((item) => item.id === id);
  if (!catatan) {
    return;
  }

  idDiedit = id;
  formCatatan.classList.remove('was-validated');
  document.getElementById('judulModalCatatan').textContent = 'Edit catatan';
  document.getElementById('judul').value = catatan.judul;
  document.getElementById('isi').value = catatan.isi;
  document.querySelector(`input[name="warna"][value="${catatan.warna}"]`).checked = true;
  modalCatatan.show();
}

modalCatatanEl.addEventListener('shown.bs.modal', () => {
  document.getElementById('judul').focus();
});

formCatatan.addEventListener('submit', async (e) => {
  e.preventDefault();

  const kolomJudul = document.getElementById('judul');
  const kolomIsi = document.getElementById('isi');
  kolomJudul.value = kolomJudul.value.trim();
  kolomIsi.value = kolomIsi.value.trim();
  formCatatan.classList.add('was-validated');
  if (!formCatatan.checkValidity()) {
    return;
  }

  const isi = {
    judul: kolomJudul.value,
    isi: kolomIsi.value,
    warna: document.querySelector('input[name="warna"]:checked').value
  };

  tombolSimpan.disabled = true;
  try {
    if (idDiedit) {
      const hasil = await panggilApi(`/api/catatan/${idDiedit}`, 'PUT', isi);
      const posisi = semuaCatatan.findIndex((item) => item.id === idDiedit);
      semuaCatatan[posisi] = hasil;
      tampilToast('Catatan berhasil diperbarui');
    } else {
      const hasil = await panggilApi('/api/catatan', 'POST', isi);
      semuaCatatan.push(hasil);
      kolomCari.value = '';
      tampilToast('Catatan berhasil ditambahkan');
    }
    modalCatatan.hide();
    tampilkanCatatan();
  } catch (err) {
    tampilToast(err.message, 'gagal');
  } finally {
    tombolSimpan.disabled = false;
  }
});

daftarCatatan.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-aksi]');
  if (!tombol) {
    return;
  }

  const aksi = tombol.dataset.aksi;
  const id = tombol.dataset.id;

  if (aksi === 'edit') {
    bukaFormEdit(id);
  } else if (aksi === 'hapus') {
    const catatan = semuaCatatan.find((item) => item.id === id);
    idDihapus = id;
    document.getElementById('namaCatatanDihapus').textContent = catatan.judul;
    modalHapus.show();
  } else if (aksi === 'tambah') {
    bukaFormTambah();
  } else if (aksi === 'atur-ulang') {
    kolomCari.value = '';
    tampilkanCatatan();
  }
});

document.getElementById('tombolTambah').addEventListener('click', bukaFormTambah);

document.getElementById('tombolHapus').addEventListener('click', async () => {
  try {
    await panggilApi(`/api/catatan/${idDihapus}`, 'DELETE');
    semuaCatatan = semuaCatatan.filter((item) => item.id !== idDihapus);
    tampilToast('Catatan berhasil dihapus');
    tampilkanCatatan();
  } catch (err) {
    tampilToast(err.message, 'gagal');
  }
  modalHapus.hide();
});

kolomCari.addEventListener('input', tampilkanCatatan);

muatCatatan();
