/* VEC - Evaluasi BAB 7
 * 20 soal kontekstual yang dipetakan ke enam pokok bahasan materi.
 */
(() => {
  "use strict";

  const questions = [
    // 1. Kesenjangan kompetensi dan Link and Match (3 soal)
    { topic: "Kesenjangan kompetensi dan Link and Match", q: "Perusahaan menemukan lulusan SMK belum terampil membaca diagram dan menggunakan alat ukur modern. Langkah awal sekolah yang paling tepat adalah ...", o: ["Mengurangi semua kegiatan praktik", "Memetakan kebutuhan kompetensi industri lalu membandingkannya dengan pembelajaran", "Mengganti seluruh mata pelajaran dengan teori industri", "Menyerahkan penyesuaian kompetensi kepada siswa"], a: 1, e: "Pemetaan kebutuhan industri dan capaian pembelajaran membantu sekolah menemukan kesenjangan yang perlu diperbaiki." },
    { topic: "Kesenjangan kompetensi dan Link and Match", q: "Contoh kegiatan Link and Match yang paling langsung membantu penyelarasan kompetensi adalah ...", o: ["Sekolah menyusun materi tanpa masukan pihak luar", "Siswa hanya menghafal profil perusahaan", "Sekolah dan mitra industri meninjau kompetensi serta jobsheet bersama", "Industri menentukan nilai siswa tanpa melihat proses belajar"], a: 2, e: "Penyelarasan kurikulum dan jobsheet bersama mitra membuat kompetensi yang dilatih lebih relevan dengan pekerjaan." },
    { topic: "Kesenjangan kompetensi dan Link and Match", q: "Selain keterampilan teknis, kompetensi yang perlu dilatih agar lulusan siap bekerja adalah ...", o: ["Komunikasi, disiplin, kerja sama, dan pemecahan masalah", "Kecepatan menyelesaikan tugas tanpa prosedur", "Menghafal nama seluruh perusahaan", "Bekerja sendiri dan menghindari diskusi"], a: 0, e: "Dunia kerja membutuhkan kompetensi teknis sekaligus sikap dan keterampilan nonteknis." },

    // 2. Teaching Factory (3 soal)
    { topic: "Teaching Factory", q: "Ciri utama Teaching Factory (TEFA) dalam pembelajaran SMK adalah ...", o: ["Pembelajaran hanya berlangsung melalui ceramah", "Siswa menghasilkan produk atau jasa melalui proses dan standar kerja", "Semua pekerjaan dilakukan oleh guru", "Produk dibuat tanpa pemeriksaan kualitas"], a: 1, e: "TEFA membawa proses kerja industri ke lingkungan belajar melalui produksi barang atau jasa dengan standar yang ditetapkan." },
    { topic: "Teaching Factory", q: "Unit produksi sekolah menerima pesanan perbaikan perangkat elektronika. Sebelum pekerjaan dimulai, siswa sebaiknya ...", o: ["Langsung membongkar perangkat tanpa pemeriksaan", "Menentukan harga tanpa memeriksa kerusakan", "Menganalisis kebutuhan, membagi tugas, menyiapkan alat, dan mengikuti SOP serta K3", "Menyerahkan seluruh pekerjaan kepada satu siswa"], a: 2, e: "Perencanaan, pembagian peran, kesiapan alat, SOP, dan K3 merupakan bagian penting alur TEFA." },
    { topic: "Teaching Factory", q: "Bagaimana cara sekolah menjaga mutu produk dalam kegiatan TEFA?", o: ["Melakukan pengujian dan pemeriksaan kualitas berdasarkan kriteria", "Mengutamakan jumlah produk tanpa pengujian", "Membiarkan setiap kelompok memakai standar berbeda", "Menilai produk hanya dari tampilannya"], a: 0, e: "Quality control memastikan produk memenuhi fungsi, keselamatan, dan kriteria mutu yang telah ditetapkan." },

    // 3. Kurikulum dan perkembangan teknologi (4 soal)
    { topic: "Perkembangan teknologi dan kurikulum", q: "Kurikulum Teknik Elektronika perlu ditinjau secara berkala terutama karena ...", o: ["Semua konsep dasar elektronika sudah tidak diperlukan", "Perubahan teknologi memengaruhi alat, proses kerja, dan kompetensi yang dibutuhkan", "Kurikulum harus selalu diganti setiap semester", "Teknologi baru hanya perlu diketahui tanpa dipraktikkan"], a: 1, e: "Perkembangan teknologi dapat mengubah kebutuhan kompetensi, sehingga kurikulum perlu dievaluasi secara terencana." },
    { topic: "Perkembangan teknologi dan kurikulum", q: "Sekolah ingin menambahkan materi IoT ke pembelajaran. Langkah yang paling tepat adalah ...", o: ["Menghapus seluruh materi dasar rangkaian", "Menambahkan istilah IoT tanpa tujuan pembelajaran", "Memetakan kompetensi, menyiapkan proyek dan fasilitas, serta tetap menguatkan dasar elektronika", "Mengganti semua praktik dengan video"], a: 2, e: "Teknologi baru perlu diintegrasikan dengan capaian dan praktik yang jelas tanpa menghilangkan fondasi keilmuan." },
    { topic: "Perkembangan teknologi dan kurikulum", q: "Pihak yang sebaiknya dilibatkan saat mengevaluasi relevansi kurikulum kejuruan adalah ...", o: ["Hanya pengelola sekolah", "Guru, industri, alumni, dan pemangku kepentingan terkait", "Hanya siswa kelas akhir", "Hanya penyedia perangkat lunak"], a: 1, e: "Masukan berbagai pihak membantu kurikulum mencerminkan kebutuhan pembelajaran dan dunia kerja." },
    { topic: "Perkembangan teknologi dan kurikulum", q: "Contoh pembaruan pembelajaran yang menghubungkan dasar elektronika dengan teknologi baru adalah ...", o: ["Menghafal istilah sensor tanpa praktik", "Meniadakan pengukuran listrik", "Mempelajari IoT tanpa memahami input dan output", "Membuat proyek pemantauan suhu dengan sensor dan mikrokontroler sambil menguji rangkaian"], a: 3, e: "Proyek sensor dan mikrokontroler menghubungkan konsep dasar, pemrograman, pengukuran, dan penerapan teknologi." },

    // 4. Sarana prasarana (3 soal)
    { topic: "Sarana dan prasarana praktik", q: "Jumlah multimeter terbatas sehingga tidak semua siswa dapat praktik bersamaan. Strategi paling tepat adalah ...", o: ["Mengatur rotasi kelompok, pembagian peran, dan jadwal penggunaan alat", "Meminta sebagian siswa tidak mengikuti praktik", "Menghapus praktik dari pembelajaran", "Membiarkan siswa berebut alat"], a: 0, e: "Rotasi dan pembagian peran membantu pemerataan kesempatan belajar dan penggunaan alat secara tertib." },
    { topic: "Sarana dan prasarana praktik", q: "Sebelum laboratorium digunakan, guru perlu memastikan ...", o: ["Semua alat dibiarkan menyala", "Alat, instalasi, bahan, dan prosedur keselamatan siap digunakan", "Siswa bebas memilih alat tanpa instruksi", "Tidak diperlukan pemeriksaan alat"], a: 1, e: "Pemeriksaan kesiapan alat dan penerapan K3 mengurangi risiko dan mendukung praktik yang efektif." },
    { topic: "Sarana dan prasarana praktik", q: "Peran simulasi digital ketika fasilitas praktik terbatas adalah ...", o: ["Menggantikan seluruh pengalaman praktik fisik", "Menjadi satu-satunya dasar penilaian keterampilan", "Membantu latihan awal dan prediksi, lalu dilengkapi praktik serta pengukuran nyata", "Menghilangkan kebutuhan memahami prosedur keselamatan"], a: 2, e: "Simulasi mendukung pemahaman dan persiapan, tetapi tidak sepenuhnya menggantikan penggunaan alat dan praktik nyata." },

    // 5. Pembelajaran kolaboratif (3 soal)
    { topic: "Pembelajaran kolaboratif", q: "Dalam proyek elektronika, hanya satu siswa yang mengerjakan seluruh tugas. Perbaikan pembelajaran yang paling tepat adalah ...", o: ["Membiarkan kondisi tersebut karena produk selesai", "Membagi peran, target tiap tahap, dan tanggung jawab setiap anggota", "Memberi nilai sama tanpa memantau kontribusi", "Menghentikan proyek kelompok"], a: 1, e: "Pembagian peran dan target membuat kontribusi anggota lebih jelas dan dapat dipantau." },
    { topic: "Pembelajaran kolaboratif", q: "Dokumen yang membantu guru memantau kontribusi tiap anggota kelompok adalah ...", o: ["Daftar hadir saja", "Poster promosi", "Logbook atau catatan proses dan pembagian tugas", "Daftar nilai kelas lain"], a: 2, e: "Logbook mencatat tugas, perkembangan, kendala, dan kontribusi setiap anggota." },
    { topic: "Pembelajaran kolaboratif", q: "Penilaian proyek kelompok yang adil sebaiknya mempertimbangkan ...", o: ["Produk akhir saja", "Jumlah anggota kelompok saja", "Kecepatan presentasi saja", "Kualitas produk, proses, komunikasi, tanggung jawab, dan kontribusi individu"], a: 3, e: "Penilaian proses dan kontribusi individu melengkapi penilaian hasil kelompok." },

    // 6. Penilaian dan sertifikasi (4 soal)
    { topic: "Penilaian dan sertifikasi kompetensi", q: "Penilaian kognitif pada praktik elektronika digunakan untuk mengukur ...", o: ["Pengetahuan dan pemahaman konsep", "Kerapian seragam saja", "Kecepatan berjalan", "Jumlah alat yang dimiliki siswa"], a: 0, e: "Ranah kognitif berkaitan dengan pengetahuan, pemahaman, dan kemampuan berpikir." },
    { topic: "Penilaian dan sertifikasi kompetensi", q: "Cara paling tepat menilai keterampilan siswa saat merakit rangkaian adalah ...", o: ["Hanya melihat daftar hadir", "Mengamati unjuk kerja berdasarkan rubrik dan memeriksa hasil rangkaian", "Menilai berdasarkan jumlah teman", "Memberi nilai tanpa kriteria"], a: 1, e: "Unjuk kerja dan hasil produk memberi bukti langsung tentang keterampilan yang dicapai." },
    { topic: "Penilaian dan sertifikasi kompetensi", q: "Apa perbedaan latihan uji kompetensi di sekolah dengan sertifikasi resmi?", o: ["Keduanya selalu menghasilkan sertifikat resmi", "Latihan sekolah tidak perlu kriteria", "Sertifikasi resmi mengikuti skema dan proses asesmen lembaga berwenang", "Sertifikat otomatis didapat setelah mengikuti pelajaran"], a: 2, e: "Latihan membantu persiapan, sedangkan sertifikasi resmi memerlukan asesmen sesuai skema dan ketentuan lembaga berwenang." },
    { topic: "Penilaian dan sertifikasi kompetensi", q: "Siswa akan mengikuti asesmen kompetensi bidang perakitan elektronika. Persiapan yang paling tepat adalah ...", o: ["Menghafal nama komponen saja", "Menyiapkan sertifikat kehadiran", "Menghindari praktik agar tidak salah", "Mempelajari unit kompetensi, berlatih unjuk kerja, menerapkan K3, dan menyiapkan bukti pekerjaan"], a: 3, e: "Persiapan harus mengacu pada kompetensi yang dinilai dan menunjukkan bukti kemampuan melalui praktik yang benar dan aman." }
  ];

  const $ = (id) => document.getElementById(id);
  const app = $("bab7QuizApp");
  if (!app) return;

  const progress = $("bab7QuizProgress");
  const topic = $("bab7QuizTopic");
  const bar = $("bab7QuizProgressBar");
  const questionBox = $("bab7QuizQuestion");
  const optionsBox = $("bab7QuizOptions");
  const feedback = $("bab7QuizFeedback");
  const nextButton = $("bab7QuizNext");
  const resultBox = $("bab7QuizResult");

  let index = 0;
  let score = 0;
  let answered = false;
  let finished = false;

  function renderQuestion() {
    const item = questions[index];
    answered = false;
    progress.textContent = `Soal ${index + 1} dari ${questions.length}`;
    topic.textContent = item.topic;
    bar.style.width = `${(index / questions.length) * 100}%`;
    questionBox.innerHTML = `<h3>${index + 1}. ${item.q}</h3>`;
    optionsBox.replaceChildren();
    feedback.hidden = true;
    feedback.textContent = "";
    nextButton.disabled = true;
    nextButton.textContent = index === questions.length - 1 ? "Lihat Hasil" : "Soal Berikutnya";

    item.o.forEach((label, optionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bab7-quiz-option";
      button.textContent = `${String.fromCharCode(65 + optionIndex)}. ${label}`;
      button.addEventListener("click", () => chooseAnswer(optionIndex));
      optionsBox.appendChild(button);
    });
  }

  function chooseAnswer(choice) {
    if (answered || finished) return;
    answered = true;
    const item = questions[index];
    const buttons = [...optionsBox.querySelectorAll("button")];
    buttons.forEach((button, i) => {
      button.disabled = true;
      if (i === item.a) button.classList.add("correct");
      if (i === choice && i !== item.a) button.classList.add("incorrect");
    });
    const correct = choice === item.a;
    if (correct) score++;
    feedback.hidden = false;
    feedback.innerHTML = `<strong>${correct ? "Jawaban benar." : "Jawaban belum tepat."}</strong> ${item.e}`;
    nextButton.disabled = false;
  }

  async function saveResult(value) {
    // Menggunakan tabel hasil Quiz VEC yang sudah dibaca oleh dashboard.
    // Jika skema/izin database belum tersedia, hasil tetap tampil secara lokal.
    try {
      const user = typeof currentUser !== "undefined" ? currentUser : null;
      const nim = user?.user_metadata?.nim;
      if (!nim || typeof supabaseClient === "undefined") return { saved: false, reason: "Sesi mahasiswa tidak ditemukan." };
      const { error } = await supabaseClient.from("vec_quiz_results").insert({
        nim,
        nilai: value,
        completed_at: new Date().toISOString()
      });
      if (error) throw error;
      if (typeof sinkronkanXPVEC === "function") await sinkronkanXPVEC();
      if (typeof muatHasilQuizMahasiswa === "function") await muatHasilQuizMahasiswa(user);
      return { saved: true };
    } catch (error) {
      console.error("Hasil Quiz BAB 7 belum tersimpan ke database:", error);
      return { saved: false, reason: "Hasil tampil, tetapi belum tersimpan ke database. Periksa izin dan struktur tabel vec_quiz_results." };
    }
  }

  async function showResult() {
    finished = true;
    bar.style.width = "100%";
    const nilai = Math.round((score / questions.length) * 100);
    questionBox.hidden = true;
    optionsBox.hidden = true;
    feedback.hidden = true;
    nextButton.hidden = true;
    resultBox.hidden = false;
    resultBox.innerHTML = `<h3>Quiz BAB 7 selesai</h3><p><strong>${score} dari ${questions.length} jawaban benar</strong></p><p style="font-size:2rem;font-weight:800;color:#59e6b5;margin:8px 0">${nilai}/100</p><p>${nilai >= 80 ? "Sangat baik! Pemahamanmu terhadap BAB 7 sudah kuat." : nilai >= 60 ? "Cukup baik. Pelajari kembali pokok bahasan yang masih belum dikuasai." : "Terus berlatih. Baca kembali enam materi dan kerjakan ulang Quiz."}</p><p id="bab7QuizSaveStatus">Menyimpan hasil...</p><button type="button" id="bab7QuizRestart" class="bab7-primary-btn bab7-quiz-restart">Ulangi Quiz</button>`;
    const save = await saveResult(nilai);
    const status = $("bab7QuizSaveStatus");
    if (status) status.textContent = save.saved ? "Hasil berhasil disimpan ke progres Quiz VEC." : save.reason;
    $("bab7QuizRestart")?.addEventListener("click", restart);
  }

  function restart() {
    index = 0;
    score = 0;
    finished = false;
    questionBox.hidden = false;
    optionsBox.hidden = false;
    nextButton.hidden = false;
    resultBox.hidden = true;
    renderQuestion();
  }

  nextButton.addEventListener("click", () => {
    if (!answered) return;
    if (index === questions.length - 1) {
      showResult();
    } else {
      index++;
      renderQuestion();
    }
  });

  renderQuestion();
})();
