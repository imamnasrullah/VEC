/* =========================================================
   VEC - AKTIVITAS BAB 7
   Konteks: Program Studi Pendidikan Teknik Elektronika
   Materi: Tantangan Kurikulum dan Pembelajaran
   ========================================================= */
(() => {
    "use strict";

    const scenarios = [
        {
            title: "Kesenjangan Kompetensi dan Kebutuhan Industri",
            tag: "Relevansi kompetensi",
            context: "Lulusan dari program keahlian Teknik Elektronika belum terbiasa menggunakan peralatan modern, membaca diagram rangkaian, dan memecahkan masalah secara mandiri. Materi dan praktik pembelajaran belum cukup mengikuti kebutuhan tempat kerja.",
            question: "Sebagai calon pendidik Teknik Elektronika, langkah awal paling tepat untuk merespons masalah tersebut adalah ...",
            options: [
                "Memetakan kompetensi yang dibutuhkan industri, membandingkannya dengan capaian pembelajaran, lalu memperkuat praktik yang relevan.",
                "Mengurangi kegiatan praktik agar seluruh materi teori dapat diselesaikan lebih cepat.",
                "Mengganti semua materi dengan satu perangkat terbaru tanpa menganalisis kebutuhan kompetensi.",
                "Menyerahkan seluruh tanggung jawab penyesuaian kompetensi kepada mahasiswa."
            ],
            answer: 0,
            feedback: "Pemetaan kebutuhan industri dan capaian pembelajaran membantu pendidik menemukan kesenjangan secara terukur. Hasil pemetaan dapat digunakan untuk memperbarui materi, tugas praktik, dan bentuk kerja sama dengan industri.",
            practice: 'Role play FGD 30 menit: bagi peran HRD industri, alumni, pendidik, dan mahasiswa. Petakan tiga skill prioritas, bandingkan dengan materi saat ini, lalu buat tabel kesenjangan dan jobsheet ESP32 + IoT. Uji contoh program ESP32 melalui Wokwi atau simulator yang mendukung ESP32.',
        },
        {
            title: "Penerapan Teaching Factory",
            tag: "Pembelajaran berbasis produksi",
            context: "Satuan pendidikan merencanakan unit produksi dan layanan perbaikan perangkat elektronika. Pelaksanaan belum optimal karena pendidik belum terbiasa mengelola pembelajaran berbasis produksi, fasilitas belum memadai, dan pesanan masih terbatas.",
            question: "Peran pendidik Teknik Elektronika yang paling sesuai untuk memperbaiki pembelajaran berbasis Teaching Factory adalah ...",
            options: [
                "Membiarkan mahasiswa mengerjakan pesanan tanpa prosedur dan pendampingan.",
                "Merancang alur kerja dan jobsheet, membimbing proses produksi, serta menerapkan pemeriksaan mutu dan refleksi hasil kerja.",
                "Mengutamakan jumlah produk selesai tanpa memperhatikan proses dan keselamatan kerja.",
                "Mengubah seluruh kegiatan menjadi ceramah tentang proses industri."
            ],
            answer: 1,
            feedback: "Pendidik berperan merancang pengalaman belajar yang menyerupai proses kerja, memberi pendampingan, dan memastikan proses serta produk dievaluasi. Kegiatan harus tetap memperhatikan prosedur dan mutu.",
            practice: 'Simulasi pabrik mini: Senin desain dan simulasi; Selasa–Kamis produksi/perakitan; Jumat uji mutu dan presentasi. Bagi peran produksi, quality control (QC), dan pemasaran. Rancang lampu LED otomatis, susun SOP, uji fungsi dengan checklist, lalu presentasikan mutu dan biaya produk. Produksi nyata harus diawasi pendidik dan mengikuti keselamatan kerja.',
        },
        {
            title: "Kurikulum dan Perkembangan Teknologi",
            tag: "Pembaruan kurikulum",
            context: "Materi pembelajaran masih dominan membahas teknologi konvensional, sementara lingkungan kerja telah menggunakan otomasi, Internet of Things (IoT), dan teknologi digital. Mahasiswa kesulitan beradaptasi ketika mengikuti magang.",
            question: "Bagaimana pendidik dan pengembang kurikulum sebaiknya merespons perubahan teknologi tersebut?",
            options: [
                "Menghapus seluruh dasar elektronika karena teknologi baru selalu menggantikannya.",
                "Menunggu sampai semua perusahaan menggunakan teknologi yang sama.",
                "Meninjau capaian pembelajaran bersama pemangku kepentingan, lalu mengintegrasikan teknologi baru tanpa mengabaikan konsep dasar.",
                "Menambahkan sebanyak mungkin istilah teknologi tanpa kegiatan praktik."
            ],
            answer: 2,
            feedback: "Kurikulum perlu ditinjau secara berkala. Dasar elektronika tetap penting, sementara konteks otomasi, IoT, dan teknologi digital dapat diintegrasikan melalui materi, proyek, dan praktik yang sesuai.",
            practice: 'Simulasi digital: buat lampu otomatis dengan Arduino, sensor cahaya (LDR), dan LED di Tinkercad. Untuk ESP32/IoT gunakan Wokwi atau simulator yang mendukung ESP32. Uji beberapa kondisi, catat hasil, lalu jelaskan konsep elektronika yang digunakan.',
        },
        {
            title: "Keterbatasan Peralatan Laboratorium",
            tag: "Sarana pembelajaran praktik",
            context: "Jumlah alat ukur seperti multimeter dan osiloskop belum sebanding dengan jumlah peserta. Sebagian hanya mengamati teman bekerja sehingga kesempatan melakukan pengukuran langsung menjadi terbatas.",
            question: "Strategi pembelajaran yang paling tepat untuk memastikan setiap peserta tetap memperoleh pengalaman praktik adalah ...",
            options: [
                "Mengatur rotasi kelompok dan jadwal penggunaan alat, membagi peran praktik, serta menyiapkan alternatif demonstrasi atau simulasi sebelum praktik langsung.",
                "Meminta peserta yang tidak kebagian alat untuk tidak mengikuti kegiatan.",
                "Mengganti seluruh kegiatan praktik dengan ujian tertulis.",
                "Menggunakan satu alat secara bergantian tanpa batas waktu dan tanpa lembar kerja."
            ],
            answer: 0,
            feedback: "Rotasi, pembagian peran, jobsheet, perawatan alat, dan simulasi pendukung dapat meningkatkan pemerataan kesempatan belajar. Simulasi melengkapi, bukan sepenuhnya menggantikan, praktik langsung.",
            practice: 'Simulasi lab virtual: gunakan Tinkercad untuk rangkaian Arduino, Wokwi untuk ESP32, CADe SIMU untuk kendali listrik, atau PLC Fiddle untuk logika PLC sesuai materi. Prediksi hasil simulasi, lalu bandingkan dengan praktik nyata dan pengukuran multimeter secara bergiliran. Simulasi melengkapi, bukan menggantikan, praktik fisik.',
        },
        {
            title: "Kerja Sama dalam Proyek Elektronika",
            tag: "Kolaborasi dan komunikasi",
            context: "Dalam proyek sistem kendali sederhana, pembagian tugas tidak berjalan. Komunikasi lemah dan sebagian besar pekerjaan dilakukan satu atau dua anggota sehingga proyek terlambat dan hasilnya tidak sesuai target.",
            question: "Apa tindakan pendidik yang paling efektif untuk memperbaiki proses kerja kelompok pada proyek berikutnya?",
            options: [
                "Memberi nilai kelompok yang sama tanpa melihat kontribusi setiap anggota.",
                "Membiarkan kelompok menyelesaikan konflik sendiri tanpa arahan.",
                "Menilai hanya produk akhir dan mengabaikan proses kerja.",
                "Menetapkan peran dan tanggung jawab, target tiap tahap, logbook kontribusi, serta evaluasi individu dan kelompok."
            ],
            answer: 3,
            feedback: "Pembagian peran yang jelas, target bertahap, dokumentasi kontribusi, dan refleksi membantu mengembangkan kompetensi teknis sekaligus komunikasi, tanggung jawab, dan kolaborasi.",
            practice: 'Simulasi kerja tim: rancang alat monitoring suhu sederhana untuk UMKM. Tetapkan peran perancang, perakit/programmer, dan penguji/presenter; gunakan logbook dan penilaian kontribusi individu.',
        },
        {
            title: "Sertifikasi Kompetensi",
            tag: "Pengakuan kompetensi",
            context: "Lulusan mampu merakit dan memperbaiki perangkat elektronika, tetapi belum memiliki bukti kompetensi sesuai standar yang diminta perusahaan. Program pendidikan mempertimbangkan kerja sama dengan Lembaga Sertifikasi Profesi (LSP).",
            question: "Apa langkah pembelajaran yang paling tepat untuk mempersiapkan mahasiswa menghadapi uji kompetensi?",
            options: [
                "Menjanjikan sertifikat kepada semua mahasiswa tanpa proses penilaian.",
                "Memetakan kompetensi terhadap skema yang relevan, memberi latihan berbasis unjuk kerja, dan menyiapkan asesmen sesuai ketentuan LSP.",
                "Mengganti semua praktik dengan latihan menghafal definisi sertifikasi.",
                "Menganggap ijazah otomatis sama dengan sertifikat kompetensi."
            ],
            answer: 1,
            feedback: "Persiapan perlu mengacu pada skema dan unit kompetensi yang relevan. Latihan unjuk kerja membantu mahasiswa memahami standar, prosedur, dan bukti kompetensi yang akan dinilai.",
            practice: 'Simulasi uji kompetensi: rakit atau diagnosis rangkaian dalam waktu terbatas. Penguji menilai prosedur, keselamatan, ketepatan hasil, dan dokumentasi. Ini latihan, bukan sertifikasi resmi BNSP.',
        }
    ];

    const $ = id => document.getElementById(id);

    // ---------------- SIMULASI KEPUTUSAN ----------------
    const scenarioList = $("bab7ScenarioList");
    const scenarioContent = $("bab7ScenarioContent");
    let activeScenario = -1;
    const scenarioAnswered = new Set();

    function renderScenarioList() {
        if (!scenarioList) return;
        scenarioList.replaceChildren();
        scenarios.forEach((scenario, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "bab7-scenario-btn" + (index === activeScenario ? " active" : "");
            const small = document.createElement("small");
            small.textContent = `TANTANGAN ${String(index + 1).padStart(2, "0")}`;
            const title = document.createElement("span");
            title.textContent = scenario.title;
            const state = document.createElement("small");
            state.textContent = scenarioAnswered.has(index) ? "✓ Sudah dianalisis" : scenario.tag;
            button.append(small, title, state);
            button.addEventListener("click", () => openScenario(index));
            scenarioList.appendChild(button);
        });
    }

    function openScenario(index) {
        activeScenario = index;
        const scenario = scenarios[index];
        if (!scenarioContent) return;
        scenarioContent.replaceChildren();

        const kicker = document.createElement("div");
        kicker.className = "bab7-game-kicker";
        kicker.textContent = `TANTANGAN ${index + 1} DARI 6 · ${scenario.tag.toUpperCase()}`;
        const heading = document.createElement("h3");
        heading.textContent = scenario.title;
        const context = document.createElement("div");
        context.className = "bab7-case-context";
        context.textContent = scenario.context;
        const question = document.createElement("p");
        question.className = "bab7-question";
        question.textContent = scenario.question;
        const options = document.createElement("div");
        options.className = "bab7-options";
        const feedback = document.createElement("div");
        feedback.className = "bab7-feedback";
        feedback.hidden = true;

        scenario.options.forEach((option, optionIndex) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "bab7-option";
            button.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.trim()}`;
            button.addEventListener("click", () => {
                if (options.dataset.answered === "true") return;
                options.dataset.answered = "true";
                const correct = optionIndex === scenario.answer;
                [...options.children].forEach((item, i) => {
                    item.disabled = true;
                    if (i === scenario.answer) item.classList.add("correct");
                    else if (i === optionIndex && !correct) item.classList.add("incorrect");
                });
                scenarioAnswered.add(index);
                if (typeof window.vecMarkProgress === "function") {
                    window.vecMarkProgress("decision", index + 1);
                }
                feedback.hidden = false;
                feedback.replaceChildren();
                const result = document.createElement("strong");
                result.textContent = correct ? "Keputusan tepat. " : "Keputusan belum tepat. ";
                const explanation = document.createTextNode(scenario.feedback);
                feedback.append(result, explanation);
                renderScenarioList();
            });
            options.appendChild(button);
        });

        const practice = document.createElement("div");
        practice.className = "bab7-practice-card";
        const practiceTitle = document.createElement("strong");
        practiceTitle.textContent = "Simulasi Praktik di Kelas / Sekolah";
        const practiceText = document.createElement("p");
        practiceText.textContent = scenario.practice;
        practice.append(practiceTitle, practiceText);

        const hint = document.createElement("p");
        hint.className = "bab7-muted-note";
        hint.textContent = "Pilih satu keputusan. Baca umpan balik untuk memahami alasan dan tindak lanjutnya.";
        scenarioContent.append(kicker, heading, context, question, options, feedback, practice, hint);
        renderScenarioList();
    }

    renderScenarioList();

    // ---------------- GAME MISI BAB 7 ----------------
    const stage = $("bab7GameStage");
    const startButton = $("bab7GameStart");
    const missionLabel = $("bab7GameMission");
    const scoreLabel = $("bab7GameScore");
    const progressLabel = $("bab7GameProgressText");
    const progressBar = $("bab7GameProgress");

    let gameIndex = 0;
    let gameScore = 0;
    let gameCompleted = 0;
    let gameStarted = false;

    function updateGameStats() {
        if (missionLabel) missionLabel.textContent = `${Math.min(gameIndex + 1, 6)} / 6`;
        if (scoreLabel) scoreLabel.textContent = String(gameScore);
        if (progressLabel) progressLabel.textContent = `${gameCompleted} / 6 selesai`;
        if (progressBar) progressBar.style.width = `${(gameCompleted / 6) * 100}%`;
    }

    function showGameIntro() {
        if (!stage) return;
        stage.innerHTML = `
            <div class="bab7-empty-state">
                <span class="bab7-empty-icon">🎓</span>
                <h3>Siap Menjalankan Misi?</h3>
                <p>Enam misi akan menguji pemahamanmu terhadap enam tantangan pada studi kasus BAB 7. Pilih jawaban terbaik berdasarkan situasi yang diberikan.</p>
                <button type="button" id="bab7GameStart" class="bab7-primary-btn">Mulai Misi</button>
            </div>`;
        $("bab7GameStart")?.addEventListener("click", startGame);
    }

    function startGame() {
        gameIndex = 0;
        gameScore = 0;
        gameCompleted = 0;
        gameStarted = true;
        updateGameStats();
        renderGameQuestion();
    }

    function renderGameQuestion() {
        if (!stage) return;
        if (gameIndex >= scenarios.length) {
            renderGameSummary();
            return;
        }
        const scenario = scenarios[gameIndex];
        stage.replaceChildren();
        const kicker = document.createElement("div");
        kicker.className = "bab7-game-kicker";
        kicker.textContent = `MISI ${gameIndex + 1} · ${scenario.tag.toUpperCase()}`;
        const heading = document.createElement("h3");
        heading.textContent = scenario.title;
        const context = document.createElement("div");
        context.className = "bab7-case-context";
        context.textContent = scenario.context;
        const question = document.createElement("p");
        question.className = "bab7-question";
        question.textContent = scenario.question;
        const practice = document.createElement("div");
        practice.className = "bab7-practice-card";
        const practiceTitle = document.createElement("strong");
        practiceTitle.textContent = "Tantangan Praktik";
        const practiceText = document.createElement("p");
        practiceText.textContent = scenario.practice;
        practice.append(practiceTitle, practiceText);
        const options = document.createElement("div");
        options.className = "bab7-options";
        const feedback = document.createElement("div");
        feedback.className = "bab7-feedback";
        feedback.hidden = true;

        scenario.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "bab7-option";
            button.textContent = `${String.fromCharCode(65 + index)}. ${option.trim()}`;
            button.addEventListener("click", () => {
                if (options.dataset.answered === "true") return;
                options.dataset.answered = "true";
                const correct = index === scenario.answer;
                if (correct) gameScore += 100;
                gameCompleted += 1;
                if (typeof window.vecMarkProgress === "function") {
                    window.vecMarkProgress("game", gameIndex + 1);
                }
                updateGameStats();
                [...options.children].forEach((item, i) => {
                    item.disabled = true;
                    if (i === scenario.answer) item.classList.add("correct");
                    else if (i === index && !correct) item.classList.add("incorrect");
                });
                feedback.hidden = false;
                feedback.replaceChildren();
                const result = document.createElement("strong");
                result.textContent = correct ? "Benar · +100 poin. " : "Belum tepat · 0 poin. ";
                feedback.append(result, document.createTextNode(scenario.feedback));
                const nextRow = document.createElement("div");
                nextRow.className = "bab7-next-row";
                const next = document.createElement("button");
                next.type = "button";
                next.className = "bab7-primary-btn";
                next.textContent = gameIndex === scenarios.length - 1 ? "Lihat Hasil" : "Misi Berikutnya →";
                next.addEventListener("click", () => {
                    gameIndex += 1;
                    updateGameStats();
                    renderGameQuestion();
                });
                nextRow.appendChild(next);
                stage.appendChild(nextRow);
            });
            options.appendChild(button);
        });
        stage.append(kicker, heading, context, question, practice, options, feedback);
    }

    function renderGameSummary() {
        if (!stage) return;
        stage.innerHTML = `
            <div class="bab7-game-summary">
                <div class="bab7-game-kicker">MISI SELESAI</div>
                <span class="bab7-empty-icon">🏁</span>
                <h3>Rangkaian Tantangan BAB 7 Selesai</h3>
                <div class="score-big">${gameScore} / 600</div>
                <p>Kamu menjawab ${gameCompleted} dari 6 misi. Gunakan umpan balik pada setiap misi untuk meninjau kembali keputusan pembelajaran.</p>
                <button type="button" id="bab7GameRestart" class="bab7-primary-btn">Ulangi Permainan</button>
            </div>`;
        gameStarted = false;
        $("bab7GameRestart")?.addEventListener("click", startGame);
        updateGameStats();
    }

    startButton?.addEventListener("click", startGame);
    updateGameStats();
})();
