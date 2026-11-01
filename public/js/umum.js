function aman(teks) {
  return String(teks)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function panggilApi(url, metode = 'GET', isi) {
  const opsi = { method: metode, headers: {} };
  if (isi) {
    opsi.headers['Content-Type'] = 'application/json';
    opsi.body = JSON.stringify(isi);
  }

  let respon;
  try {
    respon = await fetch(url, opsi);
  } catch (err) {
    throw new Error('Tidak dapat terhubung ke server. Pastikan server Node.js sedang berjalan.');
  }

  const hasil = await respon.json().catch(() => ({}));
  if (!respon.ok) {
    throw new Error(hasil.pesan || 'Terjadi kesalahan pada server');
  }
  return hasil;
}

function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
  const hari = String(sekarang.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${hari}`;
}

function selisihHari(dari, ke) {
  return Math.round((new Date(ke) - new Date(dari)) / 86400000);
}

function formatTanggal(teks) {
  let tanggal;
  if (teks.length === 10) {
    const [tahun, bulan, hari] = teks.split('-').map(Number);
    tanggal = new Date(tahun, bulan - 1, hari);
  } else {
    tanggal = new Date(teks);
  }
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusDeadline(tugas) {
  if (tugas.selesai) {
    return null;
  }

  const selisih = selisihHari(tanggalHariIni(), tugas.deadline);
  if (selisih < 0) {
    return { teks: `Terlambat ${Math.abs(selisih)} hari`, kelas: 'status-terlambat' };
  }
  if (selisih === 0) {
    return { teks: 'Hari ini', kelas: 'status-hari-ini' };
  }
  if (selisih === 1) {
    return { teks: 'Besok', kelas: 'status-dekat' };
  }
  if (selisih <= 3) {
    return { teks: `${selisih} hari lagi`, kelas: 'status-dekat' };
  }
  return null;
}

function buatBarisTugas(tugas, denganAksi) {
  const status = statusDeadline(tugas);

  const lencanaMatkul = tugas.matkul
    ? `<span class="lencana lencana-matkul">${aman(tugas.matkul)}</span>`
    : '';
  const lencanaStatus = status
    ? `<span class="lencana ${status.kelas}">${status.teks}</span>`
    : '';
  const deskripsi = tugas.deskripsi
    ? `<p class="deskripsi-tugas">${aman(tugas.deskripsi)}</p>`
    : '';
  const tombolAksi = denganAksi
    ? `<div class="aksi-tugas">
        <button type="button" class="btn-ikon" data-aksi="edit" data-id="${tugas.id}" aria-label="Edit tugas ${aman(tugas.judul)}" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn-ikon hapus" data-aksi="hapus" data-id="${tugas.id}" aria-label="Hapus tugas ${aman(tugas.judul)}" title="Hapus">
          <i class="bi bi-trash"></i>
        </button>
      </div>`
    : '';

  return `
    <div class="baris-tugas ${tugas.selesai ? 'tugas-selesai' : ''}">
      <input class="form-check-input centang" type="checkbox" data-id="${tugas.id}" ${tugas.selesai ? 'checked' : ''} aria-label="Tandai selesai: ${aman(tugas.judul)}">
      <div class="isi-tugas">
        <h3 class="judul-tugas">${aman(tugas.judul)}</h3>
        ${deskripsi}
        <div class="info-tugas">
          ${lencanaMatkul}
          <span class="lencana prioritas-${tugas.prioritas}">Prioritas ${tugas.prioritas}</span>
          <span><i class="bi bi-calendar-event"></i> ${formatTanggal(tugas.deadline)}</span>
          ${lencanaStatus}
        </div>
      </div>
      ${tombolAksi}
    </div>`;
}

function buatKosong(ikon, judul, teks, tombol = '') {
  return `
    <div class="kosong">
      <i class="bi ${ikon}"></i>
      <h3>${judul}</h3>
      <p>${teks}</p>
      ${tombol}
    </div>`;
}

function buatPesanError(pesan) {
  return buatKosong('bi-wifi-off', 'Data tidak bisa dimuat', aman(pesan));
}

function tampilToast(pesan, jenis = 'sukses') {
  let wadah = document.getElementById('wadahToast');
  if (!wadah) {
    wadah = document.createElement('div');
    wadah.id = 'wadahToast';
    wadah.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(wadah);
  }

  const warna = jenis === 'sukses' ? 'success' : 'danger';
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center border-0 text-bg-${warna}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${aman(pesan)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>
    </div>`;
  wadah.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  toast.show();
}
