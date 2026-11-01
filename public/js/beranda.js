const daftarTerdekat = document.getElementById('daftarTerdekat');

document.getElementById('tanggalHariIni').textContent = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

async function muatBeranda() {
  try {
    const data = await panggilApi('/api/ringkasan');

    document.getElementById('angkaBelumSelesai').textContent = data.belumSelesai;
    document.getElementById('angkaSelesai').textContent = data.selesai;
    document.getElementById('angkaMendekati').textContent = data.mendekatiDeadline;
    document.getElementById('angkaCatatan').textContent = data.jumlahCatatan;

    if (data.tugasTerdekat.length === 0) {
      daftarTerdekat.innerHTML = buatKosong(
        'bi-journal-check',
        'Tidak ada tugas yang menunggu',
        'Semua tugas sudah selesai atau belum ada tugas yang ditambahkan.',
        '<a class="btn btn-primary" href="tugas.html?baru=1">Tambah tugas</a>'
      );
      return;
    }

    daftarTerdekat.innerHTML = data.tugasTerdekat
      .map((tugas) => buatBarisTugas(tugas, false))
      .join('');
  } catch (err) {
    daftarTerdekat.innerHTML = buatPesanError(err.message);
  }
}

daftarTerdekat.addEventListener('change', async (e) => {
  if (!e.target.classList.contains('centang')) {
    return;
  }

  try {
    await panggilApi(`/api/tugas/${e.target.dataset.id}/selesai`, 'PATCH');
    tampilToast('Tugas ditandai selesai');
  } catch (err) {
    tampilToast(err.message, 'gagal');
  }
  muatBeranda();
});

muatBeranda();
