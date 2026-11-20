/* =========================================================
   VEC - SOAL SIMULASI BERTAHAP (6 studi kasus, konteks SMK)
   Setiap soal terdiri dari beberapa pertanyaan bertahap yang
   menuntun siswa/calon guru menemukan solusi lewat simulasi.
   Tidak mengubah XP, leaderboard, atau database Supabase.
   Juga menyediakan window.VECMedia (gambar + video per kasus).
   ========================================================= */
(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const el = (tag, cls, txt) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (txt !== undefined) n.textContent = txt;
        return n;
    };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

    /* ---------------------------------------------------------
       MEDIA PENERAPAN PER STUDI KASUS (gambar + video)
       --------------------------------------------------------- */
    const MEDIA = [
        {
            src: "assets/media/kasus-1.svg",
            alt: "Ilustrasi FGD antara HRD industri, alumni, guru, dan siswa SMK",
            caption: "Suasana FGD Link and Match di ruang rapat/kelas SMK: HRD industri, alumni, guru, dan siswa memetakan kebutuhan kompetensi.",
            penerapan: [
                "Guru dan wakil industri mengisi tabel kesenjangan kompetensi di papan tulis.",
                "Alumni menceritakan alat dan tugas nyata di tempat kerja.",
                "Hasil FGD menjadi dasar revisi jobsheet, misalnya jobsheet ESP32 + IoT."
            ],
            video: [
                { judul: "Video 1 · Link and Match", url: "https://youtu.be/LrlZh41outo?si=ePEMZlOqKJ0kIGIA" },
                { judul: "Video 2 · Link and Match", url: "https://youtu.be/XlOVR46T9XE?si=MXNpIGCrFkDOJI_t" },
                { judul: "Video 3 · Link and Match", url: "https://youtu.be/cXQEfmmoxt0?si=H94Q9c5ZLvn6xyGm" }
            ]
        },
        {
            src: "assets/media/kasus-2.svg",
            alt: "Ilustrasi unit Teaching Factory dengan meja pesanan, produksi, dan QC",
            caption: "Unit Teaching Factory di bengkel elektronika: alur pesanan → produksi → QC → serah terima dengan pendampingan guru.",
            penerapan: [
                "Siswa produksi merakit lampu LED otomatis memakai APD dan SOP.",
                "Siswa QC menguji dengan multimeter dan mengisi checklist mutu.",
                "Siswa admin mencatat pesanan, biaya, dan serah terima ke pelanggan."
            ],
            video: [
                { judul: "Video 1 · Teaching Factory", url: "https://youtu.be/SQRQvuakhj8?si=nVux-MBB1ssLKzGv" },
                { judul: "Video 2 · Teaching Factory", url: "https://youtu.be/pNP61VOjX9w?si=y0pg3_Xaiv9KulP3" }
            ]
        },
        {
            src: "assets/media/kasus-3.svg",
            alt: "Ilustrasi siswa SMK mensimulasikan lampu otomatis Arduino dengan LDR dan LED",
            caption: "Kelas simulasi digital: siswa merancang dan menguji lampu otomatis (Arduino + LDR + LED) sebelum dirakit nyata.",
            penerapan: [
                "Siswa membuat rangkaian di Tinkercad (Arduino) atau Wokwi (ESP32).",
                "Mereka menguji beberapa kondisi cahaya dan mencatat hasilnya.",
                "Guru mengaitkan hasil dengan konsep dasar: pembagi tegangan, arus LED, dan logika program."
            ],
            video: [
                { judul: "Video 1 · Kurikulum Teknik Elektronika", url: "https://youtube.com/shorts/KUoUsfsdglY?si=PbZ3KwNRmA30zbR1" },
                { judul: "Video 2 · Kurikulum Teknik Elektronika", url: "https://youtu.be/v1ze9ol2wvM" }
            ]
        },
        {
            src: "assets/media/kasus-4.svg",
            alt: "Ilustrasi rotasi tiga stasiun praktik laboratorium elektronika SMK",
            caption: "Laboratorium dengan alat terbatas: kelompok kecil berputar antarstasiun dan bertukar peran operator, pencatat, pemeriksa.",
            penerapan: [
                "Satu kit digunakan tiga siswa dengan peran yang bergiliran.",
                "Simulasi Tinkercad/CADe SIMU dipakai sebagai persiapan sebelum praktik langsung.",
                "Jadwal rotasi dan catatan perawatan alat ditempel di dinding lab."
            ],
            video: [
                { judul: "Video 1 · Sarana dan Prasarana", url: "https://youtu.be/sylagPaXedk?si=Bg3hZwElLleGnwUR" },
                { judul: "Video 2 · Sarana dan Prasarana (tautan sama)", url: "https://youtu.be/sylagPaXedk" }
            ]
        },
        {
            src: "assets/media/kasus-5.svg",
            alt: "Ilustrasi tiga siswa SMK bekerja sama pada proyek monitoring suhu",
            caption: "Proyek monitoring suhu oleh tim tiga siswa SMK: pembagian peran jelas, logbook harian, dan penilaian teman sejawat.",
            penerapan: [
                "Matriks pembagian peran ditempel di papan tulis dan disepakati seluruh anggota.",
                "Setiap siswa mengisi logbook harian berisi tugas dan bukti kerja.",
                "Penilaian memadukan produk kelompok, demonstrasi individu, dan penilaian teman sejawat."
            ],
            video: [
                { judul: "Video 1 · Kompetensi Kerja", url: "https://youtu.be/VUSkJYG5CcI?si=UFuAiS4DjzvnfF69" },
                { judul: "Video 2 · Kompetensi Kerja", url: "https://youtu.be/nrfUMHDoZwE?si=fhHnh7qT1KCBLsBT" }
            ]
        },
        {
            src: "assets/media/kasus-6.svg",
            alt: "Ilustrasi latihan uji unjuk kerja siswa SMK dengan penguji dan checklist",
            caption: "Latihan uji unjuk kerja di sekolah: siswa merakit rangkaian dalam waktu terbatas, guru menilai dengan checklist.",
            penerapan: [
                "Penguji menilai prosedur kerja, keselamatan (K3), ketepatan hasil, dan dokumentasi.",
                "Siswa membangun portofolio proyek sebagai bukti kerja.",
                "Latihan ini bukan sertifikasi resmi; sertifikat diberikan setelah asesmen oleh LSP."
            ],
            video: [
                { judul: "Video 1 · Sertifikasi Kompetensi", url: "https://youtu.be/Ho3cxHl-ZRw?si=lNZv2zX9e1s-2tY3" },
                { judul: "Video 2 · Sertifikasi Kompetensi", url: "https://youtu.be/1Qqy3zloj7Q?si=vn-_szaBTBNn0os1" }
            ]
        }
    ];

    window.VECMedia = {
        data: MEDIA,
        buat(index) {
            const m = MEDIA[index];
            if (!m) return null;
            const panel = el("section", "ss-media");
            panel.appendChild(el("h3", "ss-media-title", "Contoh Penerapan di Lingkungan SMK / Kelas"));
            const fig = el("figure", "ss-media-fig");
            const img = document.createElement("img");
            img.src = m.src;
            img.alt = m.alt;
            img.loading = "lazy";
            img.className = "ss-media-img";
            fig.append(img, el("figcaption", "", m.caption));
            panel.appendChild(fig);

            const ul = el("ul", "ss-media-list");
            m.penerapan.forEach((t) => ul.appendChild(el("li", "", t)));
            panel.appendChild(ul);

            const vTitle = el("h4", "ss-media-sub", "Video Referensi Penerapan");
            panel.appendChild(vTitle);
            const vWrap = el("div", "ss-video-links");
            m.video.forEach((v) => {
                const a = el("a", "ss-video-btn");
                a.href = v.url || yt(v.q);
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.append(el("span", "ss-video-play", "▶"), el("span", "", v.judul));
                vWrap.appendChild(a);
            });
            panel.appendChild(vWrap);
            panel.appendChild(el("p", "ss-media-note", "Video referensi dibuka langsung dari YouTube. Gunakan sebagai bahan pengamatan dan diskusi sesuai topik studi kasus."));
            return panel;
        }
    };

    /* ---------------------------------------------------------
       DATA SOAL SIMULASI
       Skor tiap langkah 0..1. fx = dampak pada 3 indikator.
       --------------------------------------------------------- */
    const CASES = [
        /* ================= KASUS 1 ================= */
        {
            title: "Kesenjangan Kompetensi Lulusan dengan Kebutuhan Industri",
            tag: "Link and Match",
            meters: ["Kesesuaian Kompetensi", "Kemitraan Industri", "Kesiapan Siswa"],
            story: "SMK Elektronika Nusantara menerima keluhan mitra industri: sebagian lulusan belum mampu mengoperasikan peralatan modern, membaca diagram rangkaian, dan memecahkan masalah secara mandiri. Kamu adalah guru produktif yang ditunjuk memimpin perbaikan. Selesaikan empat pertanyaan berikut untuk menemukan solusinya.",
            steps: [
                {
                    type: "single",
                    q: "Pertanyaan 1 — Diagnosis. Langkah awal yang paling tepat adalah ...",
                    options: [
                        { t: "Memetakan kompetensi yang dibutuhkan industri, membandingkannya dengan capaian pembelajaran, lalu menentukan kesenjangan.", s: 1, fx: [22, 10, 10], why: "Pemetaan membuat perbaikan terukur dan berbasis data." },
                        { t: "Membeli peralatan terbaru sebanyak mungkin tanpa analisis kebutuhan.", s: 0.3, fx: [4, 0, -4], why: "Alat modern penting, tetapi tanpa pemetaan belum tentu menjawab kesenjangan kompetensi." },
                        { t: "Mengurangi praktik agar teori selesai lebih cepat.", s: 0, fx: [-15, -5, -15], why: "Masalahnya justru kurangnya kemampuan praktik dan pemecahan masalah." },
                        { t: "Menyalahkan siswa karena kurang belajar mandiri.", s: 0, fx: [-10, -10, -10], why: "Bacaan menunjuk pada pembelajaran dan kerja sama yang belum mengikuti industri, bukan semata kemauan siswa." }
                    ]
                },
                {
                    type: "multi",
                    q: "Pertanyaan 2 — Akar penyebab. Pilih SEMUA penyebab yang didukung bacaan kasus.",
                    items: [
                        { t: "Pembelajaran belum sepenuhnya mengikuti perkembangan teknologi industri.", c: true, fx: [8, 0, 4] },
                        { t: "Kerja sama sekolah dengan perusahaan masih terbatas.", c: true, fx: [0, 8, 0] },
                        { t: "Praktik membaca diagram dan pemecahan masalah belum cukup.", c: true, fx: [6, 0, 8] },
                        { t: "Industri elektronika tidak lagi membutuhkan lulusan SMK.", c: false, fx: [-5, -8, 0] },
                        { t: "Gedung sekolah terlalu kecil.", c: false, fx: [0, 0, -3] },
                        { t: "Siswa tidak memiliki minat sama sekali pada elektronika.", c: false, fx: [0, 0, -6] }
                    ],
                    explain: "Penyebab yang didukung bacaan: pembelajaran belum mengikuti teknologi industri, kerja sama terbatas, dan praktik/pemecahan masalah belum cukup."
                },
                {
                    type: "alloc",
                    q: "Pertanyaan 3 — Strategi. Bagikan 100 poin upaya semester ini ke empat kegiatan. Setiap kegiatan punya porsi yang wajar.",
                    cats: [
                        { t: "Pemetaan kompetensi bersama industri", lo: 15, hi: 30 },
                        { t: "Pembaruan jobsheet dan praktik dengan alat modern", lo: 25, hi: 40 },
                        { t: "Kunjungan industri, PKL, dan guru tamu", lo: 20, hi: 35 },
                        { t: "Pelatihan atau magang guru", lo: 10, hi: 25 }
                    ],
                    fx: [20, 18, 16],
                    explain: "Porsi seimbang dengan penekanan pada pembaruan praktik dan keterlibatan industri; pemetaan dan pelatihan guru menjadi fondasi yang tidak boleh diabaikan."
                },
                {
                    type: "order",
                    q: "Pertanyaan 4 — Implementasi. Urutkan siklus pembaruan dari langkah pertama hingga terakhir.",
                    items: [
                        "Adakan FGD dengan industri, alumni, dan guru",
                        "Susun tabel kesenjangan kompetensi",
                        "Revisi satu unit pembelajaran dan uji coba (jobsheet ESP32–IoT)",
                        "Evaluasi hasil bersama mitra, lalu perbaiki"
                    ],
                    fx: [14, 14, 14],
                    explain: "Siklus: kumpulkan masukan → petakan kesenjangan → uji coba perbaikan → evaluasi bersama mitra."
                }
            ],
            solusi: [
                "Adakan FGD satu hari dengan 1–2 mitra industri lokal, alumni, dan guru untuk memetakan kompetensi prioritas.",
                "Perbarui satu unit pembelajaran, misalnya Mikrokontroler menjadi Mikrokontroler dan IoT (ESP32, sensor, dashboard sederhana).",
                "Bangun proyek bersama industri dan siapkan siswa mengikuti sertifikasi melalui LSP sesuai skema; sertifikat tidak diberikan otomatis."
            ],
            praktik: "Tugas lanjutan: role play FGD 30 menit (HRD industri, alumni, guru, siswa), lalu uji contoh program ESP32 di Wokwi.",
            bukti: "Tabel kebutuhan industri vs capaian pembelajaran, notulen FGD, dan rancangan jobsheet ESP32–IoT."
        },

        /* ================= KASUS 2 ================= */
        {
            title: "Penerapan Teaching Factory di Sekolah Teknik Elektronika",
            tag: "Teaching Factory",
            meters: ["Mutu Produk", "Keselamatan Kerja", "Keberlanjutan Unit"],
            story: "SMK Teknologi Mandiri membuka unit produksi sederhana (TEFA) yang menerima pesanan pembuatan dan perbaikan perangkat elektronika. Pelaksanaan belum optimal. Kamu adalah guru pembimbing TEFA. Jawab empat pertanyaan untuk menyusun solusi.",
            steps: [
                {
                    type: "single",
                    q: "Pertanyaan 1 — Titik mulai. Unit produksi sebaiknya dimulai dengan ...",
                    options: [
                        { t: "Satu produk/layanan sederhana (misalnya lampu LED otomatis) dengan alur kerja, SOP, dan pendampingan guru.", s: 1, fx: [18, 14, 18], why: "Mulai kecil memudahkan standardisasi mutu, keselamatan, dan pencatatan." },
                        { t: "Banyak jenis produk sekaligus agar terlihat besar.", s: 0.25, fx: [-6, -6, -4], why: "Terlalu luas untuk fasilitas, guru, dan pesanan yang masih terbatas." },
                        { t: "Siswa mengerjakan pesanan tanpa SOP agar cepat.", s: 0, fx: [-18, -20, -8], why: "Tanpa SOP dan pendampingan, mutu dan keselamatan terabaikan." },
                        { t: "Menunggu peralatan setara industri lengkap baru memulai.", s: 0.2, fx: [0, 4, -12], why: "Menunggu terlalu lama menghentikan pembelajaran; mulai dari yang realistis lalu bertahap." }
                    ]
                },
                {
                    type: "multi",
                    q: "Pertanyaan 2 — Kendala. Pilih SEMUA kendala yang disebut dalam bacaan kasus.",
                    items: [
                        { t: "Sebagian guru belum terbiasa dengan pembelajaran berbasis produksi.", c: true, fx: [0, 0, 6] },
                        { t: "Peralatan praktik belum sepenuhnya memenuhi standar industri.", c: true, fx: [6, 4, 0] },
                        { t: "Pesanan yang diterima masih sedikit sehingga produksi belum konsisten.", c: true, fx: [0, 0, 8] },
                        { t: "Siswa dilarang menyentuh alat sama sekali.", c: false, fx: [-4, 0, -4] },
                        { t: "Produk elektronika tidak laku di mana pun.", c: false, fx: [0, 0, -8] },
                        { t: "Sekolah tidak memiliki ruang praktik.", c: false, fx: [0, 0, -3] }
                    ],
                    explain: "Tiga kendala dalam bacaan: guru belum terbiasa, peralatan belum standar industri, dan pesanan masih sedikit."
                },
                {
                    type: "order",
                    q: "Pertanyaan 3 — Alur kerja. Susun alur TEFA dari pesanan hingga serah terima.",
                    items: [
                        "Terima pesanan pelanggan",
                        "Desain dan simulasi rangkaian",
                        "Produksi/perakitan sesuai SOP",
                        "Pengujian fungsi",
                        "Quality control (checklist mutu)",
                        "Serah terima dan umpan balik pelanggan"
                    ],
                    fx: [18, 12, 14],
                    explain: "Alur lengkap: pesanan → desain → produksi → pengujian → QC → serah terima."
                },
                {
                    type: "alloc",
                    q: "Pertanyaan 4 — Anggaran uji coba. Bagikan 100% anggaran ke empat pos.",
                    cats: [
                        { t: "APD dan perlengkapan keselamatan", lo: 15, hi: 25 },
                        { t: "Alat ukur dan peralatan solder/perbaikan", lo: 25, hi: 40 },
                        { t: "Bahan produksi (komponen, PCB, kemasan)", lo: 20, hi: 35 },
                        { t: "Pelatihan guru dan promosi pesanan", lo: 15, hi: 30 }
                    ],
                    fx: [14, 16, 18],
                    explain: "Keselamatan tidak boleh dikorbankan, peralatan dan bahan menjadi inti produksi, serta pelatihan guru dan promosi menjaga keberlanjutan pesanan."
                }
            ],
            solusi: [
                "Mulai dari satu layanan/produk sederhana, misalnya perakitan lampu LED otomatis atau pemeriksaan perangkat elektronika.",
                "Buat alur pesanan–desain–produksi–pengujian–QC–serah terima dengan supervisi guru.",
                "Lakukan uji coba pesanan terbatas dahulu; hasil dapat dipasarkan jika memenuhi standar, keselamatan, dan aturan sekolah."
            ],
            praktik: "Tugas lanjutan: simulasi pabrik mini (produksi, QC, pemasaran) selama satu pekan dengan checklist QC dan catatan biaya.",
            bukti: "Diagram alur produksi, jobsheet, checklist QC, catatan biaya, dan portofolio foto/video proses."
        },

        /* ================= KASUS 3 ================= */
        {
            title: "Kurikulum yang Tidak Sesuai Perkembangan Teknologi",
            tag: "Kurikulum Teknik Elektronika",
            meters: ["Relevansi Teknologi", "Penguasaan Konsep Dasar", "Keterlaksanaan"],
            story: "Materi di sekolah masih dominan teknologi konvensional, padahal industri memakai otomasi, IoT, dan teknologi digital. Siswa kesulitan beradaptasi saat PKL/magang. Kamu bagian dari tim pengembang kurikulum. Jawab empat pertanyaan, termasuk satu simulasi rangkaian lampu otomatis.",
            steps: [
                {
                    type: "single",
                    q: "Pertanyaan 1 — Respons. Cara terbaik merespons perubahan teknologi adalah ...",
                    options: [
                        { t: "Meninjau capaian pembelajaran bersama pemangku kepentingan lalu mengintegrasikan teknologi baru tanpa mengabaikan konsep dasar.", s: 1, fx: [20, 16, 14], why: "Peninjauan bersama menjaga relevansi sekaligus kekuatan fondasi." },
                        { t: "Menghapus dasar elektronika karena sudah ada teknologi baru.", s: 0, fx: [6, -25, -5], why: "Teknologi baru tetap dibangun di atas konsep dasar." },
                        { t: "Menambah banyak istilah teknologi tanpa praktik.", s: 0.2, fx: [4, -8, -6], why: "Istilah tanpa praktik tidak membangun kompetensi." },
                        { t: "Menunggu semua perusahaan memakai teknologi yang sama.", s: 0, fx: [-15, 0, 0], why: "Menunggu membuat lulusan semakin tertinggal." }
                    ]
                },
                {
                    type: "multi",
                    q: "Pertanyaan 2 — Dampak. Pilih SEMUA dampak yang sesuai bacaan kasus.",
                    items: [
                        { t: "Siswa kesulitan saat mengikuti PKL/magang.", c: true, fx: [0, 0, 4] },
                        { t: "Siswa belum memahami teknologi yang dipakai perusahaan.", c: true, fx: [6, 0, 0] },
                        { t: "Siswa butuh waktu lebih lama beradaptasi dengan peralatan dan sistem kerja baru.", c: true, fx: [4, 0, 4] },
                        { t: "Dasar elektronika menjadi sama sekali tidak berguna.", c: false, fx: [0, -10, 0] },
                        { t: "Industri berhenti menerima siswa PKL.", c: false, fx: [-4, 0, 0] },
                        { t: "Semua nilai ujian pasti turun.", c: false, fx: [0, -4, 0] }
                    ],
                    explain: "Dampak dalam bacaan: kesulitan saat PKL, belum memahami teknologi perusahaan, dan adaptasi lebih lama."
                },
                {
                    type: "ldr",
                    q: "Pertanyaan 3 — Simulasi proyek. Atur ambang gelap-terang agar lampu menyala saat Gelap dan Remang, serta mati saat Terang.",
                    tests: [
                        { name: "Gelap (cahaya 10)", light: 10, expect: true },
                        { name: "Remang (cahaya 45)", light: 45, expect: true },
                        { name: "Terang (cahaya 80)", light: 80, expect: false }
                    ],
                    fx: [20, 14, 18],
                    explain: "Aturannya: LED menyala bila cahaya lebih kecil dari ambang. Ambang harus di atas 45 dan tidak lebih dari 80 agar ketiga uji terpenuhi (nilai sekitar 50–70 aman). Konsep dasar yang terlibat: pembagi tegangan LDR, arus LED, dan logika pembanding."
                },
                {
                    type: "order",
                    q: "Pertanyaan 4 — Peta proyek. Urutkan proyek dari tingkat paling dasar ke paling kompleks.",
                    items: [
                        "Lampu otomatis (Arduino + LDR + LED)",
                        "Smart home sederhana (ESP32 + sensor)",
                        "Monitoring PLTS (sensor arus/tegangan + data)"
                    ],
                    fx: [14, 14, 14],
                    explain: "Proyek bertahap: lampu otomatis, smart home, lalu monitoring PLTS, agar konsep dasar terbangun sebelum integrasi sistem."
                }
            ],
            solusi: [
                "Tinjau capaian pembelajaran secara berkala bersama guru, siswa, alumni, dan mitra industri.",
                "Gunakan pembelajaran berbasis proyek secara proporsional; angka seperti 30:70 hanya rancangan awal, bukan aturan mutlak.",
                "Susun peta proyek bertahap dan nilai fungsi produk, proses desain, pengujian, dokumentasi, dan presentasi."
            ],
            praktik: "Tugas lanjutan: bangun lampu otomatis di Tinkercad (Arduino + LDR + LED); untuk ESP32/IoT gunakan Wokwi. Uji beberapa kondisi cahaya dan jelaskan konsep elektronikanya.",
            bukti: "Peta kurikulum berbasis proyek, diagram rangkaian, tabel hasil uji, video demonstrasi, dan rubrik penilaian."
        },

        /* ================= KASUS 4 ================= */
        {
            title: "Keterbatasan Peralatan Praktik di Laboratorium",
            tag: "Sarana dan Prasarana",
            meters: ["Pemerataan Praktik", "Efisiensi Alat", "Keselamatan dan Perawatan"],
            story: "Satu kelas berisi 24 siswa, tetapi sekolah hanya memiliki 8 kit praktik dan alat ukur yang terbatas. Sebagian siswa hanya mengamati. Waktu praktik 90 menit. Kamu guru yang menyusun strategi. Satu pertanyaan berupa simulator rotasi.",
            steps: [
                {
                    type: "single",
                    q: "Pertanyaan 1 — Masalah utama. Masalah inti dalam kegiatan praktik tersebut adalah ...",
                    options: [
                        { t: "Kesempatan praktik tidak merata karena rasio alat terhadap jumlah siswa terlalu besar dan penggunaan belum diatur.", s: 1, fx: [18, 12, 8], why: "Inilah pokok kasus: sebagian siswa hanya mengamati." },
                        { t: "Siswa terlalu banyak bertanya.", s: 0, fx: [-6, -6, 0], why: "Tidak disebut dalam kasus." },
                        { t: "Praktik langsung tidak diperlukan di elektronika.", s: 0, fx: [-25, -5, -5], why: "Praktik langsung justru inti pembentukan keterampilan." },
                        { t: "Guru kurang berbicara saat menjelaskan.", s: 0, fx: [-4, -4, 0], why: "Bukan akar masalah dalam kasus." }
                    ]
                },
                {
                    type: "multi",
                    q: "Pertanyaan 2 — Akar penyebab. Pilih SEMUA penyebab yang sesuai.",
                    items: [
                        { t: "Jumlah alat terbatas dan perawatan belum terjadwal.", c: true, fx: [4, 6, 6] },
                        { t: "Penggunaan alat belum diatur dengan rotasi dan pembagian peran.", c: true, fx: [8, 8, 0] },
                        { t: "Simulasi belum dimanfaatkan sebagai persiapan sebelum praktik langsung.", c: true, fx: [6, 4, 0] },
                        { t: "Siswa sengaja merusak alat.", c: false, fx: [-4, -4, -8] },
                        { t: "Multimeter tidak berguna untuk pembelajaran.", c: false, fx: [-6, -4, 0] },
                        { t: "Kelas tidak boleh dibagi kelompok.", c: false, fx: [-6, -6, 0] }
                    ],
                    explain: "Penyebab: alat terbatas dan perawatan belum terjadwal, belum ada rotasi/peran, serta simulasi belum dimanfaatkan."
                },
                {
                    type: "lab",
                    q: "Pertanyaan 3 — Simulator rotasi. Tentukan jumlah siswa per kit. Ada 24 siswa, 8 kit, dan 90 menit. Cari pengaturan yang memberi waktu memegang alat terbanyak tanpa banyak menunggu.",
                    students: 24, kits: 8, minutes: 90,
                    fx: [24, 18, 10],
                    explain: "Dengan 3 siswa per kit, dibutuhkan tepat 8 kit sehingga semua bekerja bersamaan: tiap siswa menjadi operator sekitar 30 menit dan tidak menunggu. Jumlah 2 siswa per kit membutuhkan 12 kit sehingga harus dibagi dua sesi dan banyak waktu menunggu."
                },
                {
                    type: "multi",
                    q: "Pertanyaan 4 — Strategi pendukung. Pilih SEMUA langkah yang tepat.",
                    items: [
                        { t: "Rotasi stasiun dengan peran operator, pencatat, dan pemeriksa yang bergantian.", c: true, fx: [10, 8, 4] },
                        { t: "Simulasi (Tinkercad/CADe SIMU) sebagai persiapan sebelum praktik nyata.", c: true, fx: [8, 8, 4] },
                        { t: "Jadwal perawatan dan pemeriksaan keselamatan alat.", c: true, fx: [4, 6, 14] },
                        { t: "Siswa tanpa alat tidak perlu mengikuti praktik.", c: false, fx: [-18, -4, 0] },
                        { t: "Mengganti seluruh praktik dengan ujian tulis.", c: false, fx: [-18, -4, 0] },
                        { t: "Menggunakan simulasi sebagai pengganti permanen praktik fisik.", c: false, fx: [-8, 0, 0] }
                    ],
                    explain: "Simulasi melengkapi, bukan menggantikan, praktik fisik. Rotasi, peran, dan perawatan menjaga pemerataan dan keselamatan."
                }
            ],
            solusi: [
                "Atur kelompok kecil dan rotasi stasiun; satu kit digunakan tiga siswa dengan peran bergantian.",
                "Gunakan simulasi sebagai persiapan sebelum praktik nyata; setiap siswa tetap mendapat giliran memegang alat fisik.",
                "Buat kit portable sederhana sesuai anggaran, serta lakukan inventarisasi, perawatan, dan pemeriksaan keselamatan."
            ],
            praktik: "Tugas lanjutan: rancang rangkaian LED + resistor di Tinkercad, prediksi tegangan/arus, lalu bandingkan dengan pengukuran multimeter secara bergiliran.",
            bukti: "Jadwal rotasi, lembar prediksi dan pengukuran, daftar inventaris, dan catatan perawatan alat."
        },

        /* ================= KASUS 5 (SISWA SMK) ================= */
        {
            title: "Rendahnya Keterampilan Kerja Sama Siswa SMK",
            tag: "Kompetensi Kerja",
            meters: ["Kolaborasi Tim", "Akuntabilitas Individu", "Ketepatan Waktu"],
            story: "Pada proyek sistem kendali sederhana di kelas XI, siswa SMK dibagi dalam tim. Sebagian siswa tidak menjalankan tugas, komunikasi lemah, dan pekerjaan hanya dikerjakan satu atau dua orang sehingga proyek terlambat. Kamu adalah guru pembimbing proyek. Jawab empat pertanyaan untuk memperbaiki proses kerja tim berikutnya.",
            steps: [
                {
                    type: "single",
                    q: "Pertanyaan 1 — Diagnosis. Penyebab utama kerja kelompok tidak efektif adalah ...",
                    options: [
                        { t: "Peran, target, dan indikator kontribusi tiap siswa belum jelas serta tidak ada dokumentasi kontribusi.", s: 1, fx: [18, 18, 10], why: "Tanpa peran dan catatan kontribusi, ketimpangan kerja tersembunyi." },
                        { t: "Siswa SMK memang tidak bisa bekerja dalam tim.", s: 0, fx: [-15, -10, -5], why: "Kerja sama adalah keterampilan yang bisa dilatih, bukan bawaan." },
                        { t: "Proyek terlalu mudah.", s: 0, fx: [0, 0, -5], why: "Tidak ada dasarnya dalam kasus." },
                        { t: "Guru terlalu sering memberi arahan.", s: 0.1, fx: [-5, -5, 0], why: "Kasus justru menunjukkan kurangnya struktur kerja tim." }
                    ]
                },
                {
                    type: "multi",
                    q: "Pertanyaan 2 — Tindakan guru. Pilih SEMUA tindakan guru yang akan memperbaiki proses kerja tim.",
                    items: [
                        { t: "Menyepakati peran dan target setiap anggota sejak awal.", c: true, fx: [10, 8, 8] },
                        { t: "Meminta logbook harian dan pemeriksaan kemajuan mingguan.", c: true, fx: [6, 12, 10] },
                        { t: "Menilai kontribusi individu lewat demonstrasi, tanya jawab, dan refleksi.", c: true, fx: [4, 14, 0] },
                        { t: "Memberi nilai kelompok yang sama untuk semua anggota.", c: false, fx: [-6, -16, 0] },
                        { t: "Membiarkan kelompok menyelesaikan konflik tanpa arahan sama sekali.", c: false, fx: [-10, -6, -8] },
                        { t: "Menilai hanya produk akhir.", c: false, fx: [-4, -12, 0] }
                    ],
                    explain: "Peran jelas, logbook, dan penilaian individu mencegah ketimpangan; nilai sama rata dan penilaian produk saja menyembunyikan kontribusi."
                },
                {
                    type: "assign",
                    q: "Pertanyaan 3 — Simulasi pembagian peran tim. Cocokkan setiap siswa dengan peran yang paling sesuai profilnya.",
                    people: [
                        { name: "Dina", profil: "Teliti, suka menggambar skema dan menghitung nilai komponen." },
                        { name: "Raka", profil: "Terampil menyolder dan menulis program Arduino." },
                        { name: "Salsa", profil: "Komunikatif, rapi mencatat, dan suka menguji serta mempresentasikan hasil." }
                    ],
                    roles: [
                        { t: "Perancang rangkaian", best: "Dina" },
                        { t: "Perakit / programmer", best: "Raka" },
                        { t: "Penguji dan dokumentator / presenter", best: "Salsa" }
                    ],
                    fx: [20, 14, 14],
                    explain: "Peran paling sesuai: Dina sebagai perancang, Raka sebagai perakit/programmer, Salsa sebagai penguji dan dokumentator. Pada proyek berikutnya peran sebaiknya dirotasi agar semua siswa berkembang."
                },
                {
                    type: "alloc",
                    q: "Pertanyaan 4 — Penilaian. Bagi bobot penilaian 100% ke tiga komponen.",
                    cats: [
                        { t: "Produk dan kerja kelompok", lo: 35, hi: 55 },
                        { t: "Penilaian individu (demonstrasi dan tanya jawab)", lo: 25, hi: 45 },
                        { t: "Logbook dan penilaian teman sejawat", lo: 10, hi: 25 }
                    ],
                    fx: [14, 20, 12],
                    explain: "Penilaian seimbang antara produk kelompok dan individu; logbook dan teman sejawat memberi bukti proses. Pembagian 50:50 produk/individu dapat menjadi contoh awal lalu disesuaikan rubrik."
                }
            ],
            solusi: [
                "Untuk tim tiga siswa tetapkan peran perancang rangkaian, perakit/programmer, serta penguji dan dokumentator/presenter; rotasi peran di proyek berikutnya.",
                "Gunakan logbook tugas, target mingguan, dan pemeriksaan kemajuan.",
                "Gabungkan penilaian produk/kelompok dengan penilaian individu melalui demonstrasi, tanya jawab, dan refleksi."
            ],
            praktik: "Tugas lanjutan: rancang alat monitoring suhu sederhana untuk ruang penyimpanan UMKM. Setiap siswa menandatangani pembagian tugas, mengisi logbook, dan menjelaskan kontribusinya saat presentasi.",
            bukti: "Matriks pembagian peran, logbook, prototipe, hasil uji, penilaian teman sejawat, dan refleksi individu."
        },

        /* ================= KASUS 6 ================= */
        {
            title: "Sertifikasi Kompetensi sebagai Bekal Memasuki Dunia Kerja",
            tag: "Sertifikasi Kompetensi",
            meters: ["Kesiapan Uji", "Bukti Kompetensi", "Kesesuaian Skema"],
            story: "Lulusan SMK mampu merakit dan memperbaiki perangkat elektronika, tetapi perusahaan meminta bukti kompetensi sesuai standar. Sekolah mempertimbangkan kerja sama dengan Lembaga Sertifikasi Profesi (LSP). Kamu guru yang menyiapkan siswa. Jawab empat pertanyaan.",
            steps: [
                {
                    type: "single",
                    q: "Pertanyaan 1 — Langkah persiapan. Yang paling tepat dilakukan sekolah adalah ...",
                    options: [
                        { t: "Memetakan kompetensi terhadap skema yang relevan, memberi latihan unjuk kerja, dan menyiapkan asesmen sesuai ketentuan LSP.", s: 1, fx: [20, 14, 20], why: "Persiapan mengacu pada skema dan unit kompetensi yang berlaku." },
                        { t: "Menjanjikan sertifikat kepada semua siswa tanpa penilaian.", s: 0, fx: [-10, -25, -20], why: "Sertifikat kompetensi hanya diberikan setelah dinyatakan kompeten oleh asesmen resmi." },
                        { t: "Menganggap ijazah otomatis sama dengan sertifikat kompetensi.", s: 0, fx: [-5, -20, -10], why: "Ijazah dan sertifikat kompetensi memiliki fungsi berbeda." },
                        { t: "Mengganti praktik dengan hafalan definisi sertifikasi.", s: 0, fx: [-15, -10, -5], why: "Uji kompetensi menilai kemampuan kerja nyata, bukan hafalan." }
                    ]
                },
                {
                    type: "multi",
                    q: "Pertanyaan 2 — Pemahaman. Pilih SEMUA pernyataan yang benar tentang sertifikasi kompetensi.",
                    items: [
                        { t: "Sertifikat menjadi bukti kemampuan sesuai standar/skema yang diikuti.", c: true, fx: [0, 10, 6] },
                        { t: "Perusahaan terbantu memverifikasi kemampuan pelamar melalui sertifikat.", c: true, fx: [0, 8, 0] },
                        { t: "Sertifikat diperoleh setelah asesmen resmi oleh LSP.", c: true, fx: [4, 6, 12] },
                        { t: "Sertifikat otomatis diberikan saat siswa lulus.", c: false, fx: [0, -14, -10] },
                        { t: "Sekolah dapat menerbitkan sertifikat LSP sendiri tanpa asesmen.", c: false, fx: [0, -14, -16] },
                        { t: "Sertifikat menggantikan semua kegiatan praktik.", c: false, fx: [-8, -6, 0] }
                    ],
                    explain: "Sertifikat kompetensi adalah bukti sesuai skema dan hanya diberikan setelah asesmen resmi LSP; fungsinya berbeda dari ijazah."
                },
                {
                    type: "order",
                    q: "Pertanyaan 3 — Simulasi uji unjuk kerja. Urutkan prosedur kerja yang aman dan benar saat merakit rangkaian.",
                    items: [
                        "Periksa alat dan gunakan APD",
                        "Baca gambar kerja/diagram rangkaian",
                        "Pastikan sumber tegangan terputus",
                        "Rakit rangkaian sesuai diagram",
                        "Uji kontinuitas dan periksa sambungan",
                        "Hubungkan sumber daya dan ukur hasil",
                        "Dokumentasikan hasil dan rapikan area kerja"
                    ],
                    fx: [20, 16, 14],
                    explain: "Urutan aman: siapkan alat dan APD → pahami gambar kerja → pastikan tegangan terputus → rakit → uji kontinuitas → energize dan ukur → dokumentasi dan rapikan."
                },
                {
                    type: "single",
                    q: "Pertanyaan 4 — Penyampaian. Bagaimana sekolah sebaiknya menyebut latihan uji unjuk kerja internal?",
                    options: [
                        { t: "Latihan unjuk kerja; sertifikat kompetensi diperoleh melalui asesmen resmi LSP sesuai skema.", s: 1, fx: [10, 16, 18], why: "Jujur dan sesuai ketentuan." },
                        { t: "Sertifikasi resmi BNSP yang diselenggarakan sekolah.", s: 0, fx: [0, -25, -25], why: "Sekolah tidak boleh mengklaim sertifikasi resmi tanpa asesmen LSP." },
                        { t: "Tidak perlu dijelaskan agar siswa tidak bingung.", s: 0.2, fx: [0, -5, -8], why: "Siswa perlu memahami perbedaan latihan dan sertifikasi resmi." }
                    ]
                }
            ],
            solusi: [
                "Identifikasi skema sertifikasi yang sesuai bidang dan tersedia pada LSP berlisensi; cek persyaratan serta unit kompetensinya.",
                "Integrasikan latihan unjuk kerja, SOP, keselamatan, dan checklist asesmen sejak kelas X.",
                "Bangun portofolio proyek berisi tujuan, diagram, proses, hasil uji, video demonstrasi, dan refleksi. Sertifikat hanya diperoleh setelah dinyatakan kompeten."
            ],
            praktik: "Tugas lanjutan: simulasi uji kompetensi (merakit atau mendiagnosis rangkaian dalam waktu terbatas) dengan checklist. Ini latihan, bukan sertifikasi resmi BNSP.",
            bukti: "Checklist unjuk kerja, lembar hasil asesmen latihan, portofolio proyek, dan rencana tindak lanjut kompetensi."
        }
    ];

    /* ---------------------------------------------------------
       STATE
       --------------------------------------------------------- */
    const listEl = $("ssCaseList");
    const contentEl = $("ssContent");
    if (!listEl || !contentEl) return;

    const results = {}; // index -> {pct}
    let active = -1;

    function renderList() {
        listEl.replaceChildren();
        CASES.forEach((c, i) => {
            const btn = el("button", "bab7-scenario-btn" + (i === active ? " active" : ""));
            btn.type = "button";
            btn.append(
                el("small", "", `SOAL ${String(i + 1).padStart(2, "0")}`),
                el("span", "", c.title),
                el("small", "", results[i] ? `✓ Selesai · ${results[i].pct}%` : `${c.steps.length} pertanyaan · ${c.tag}`)
            );
            btn.addEventListener("click", () => openCase(i));
            listEl.appendChild(btn);
        });
    }

    /* ---------------------------------------------------------
       ENGINE
       --------------------------------------------------------- */
    function shuffleNotSame(arr) {
        const idx = arr.map((_, i) => i);
        // rotasi deterministik agar tidak pernah sama dengan urutan benar
        const shift = Math.max(1, Math.floor(arr.length / 2));
        const rotated = idx.slice(shift).concat(idx.slice(0, shift));
        // balik sebagian agar terlihat acak
        if (rotated.length > 3) rotated.push(rotated.splice(1, 1)[0]);
        return rotated;
    }

    function openCase(index) {
        active = index;
        const c = CASES[index];
        const state = { step: 0, scores: [], fx: [0, 0, 0], notes: [] };
        const base = [30, 30, 30];

        contentEl.replaceChildren();
        const kicker = el("div", "bab7-game-kicker", `SOAL ${index + 1} DARI ${CASES.length} · ${c.tag.toUpperCase()}`);
        const heading = el("h3", "", c.title);
        const story = el("div", "bab7-case-context", c.story);

        const meters = el("div", "ss-meters");
        const meterBars = c.meters.map((name) => {
            const row = el("div", "ss-meter");
            const label = el("div", "ss-meter-label");
            const nm = el("span", "", name);
            const val = el("strong", "", "30");
            label.append(nm, val);
            const track = el("div", "ss-meter-track");
            const bar = el("span", "");
            track.appendChild(bar);
            row.append(label, track);
            meters.appendChild(row);
            return { bar, val };
        });
        const updateMeters = () => {
            meterBars.forEach((m, i) => {
                const v = clamp(base[i] + state.fx[i], 0, 100);
                m.bar.style.width = v + "%";
                m.val.textContent = String(Math.round(v));
            });
        };
        updateMeters();

        const dots = el("div", "ss-dots");
        const stepHost = el("div", "ss-step");
        const mediaHost = el("div", "ss-media-host");
        const media = window.VECMedia && window.VECMedia.buat(index);
        if (media) mediaHost.appendChild(media);

        contentEl.append(kicker, heading, story, mediaHost, el("h4", "ss-sub", "Indikator Simulasi"), meters, dots, stepHost);
        renderList();

        const renderDots = () => {
            dots.replaceChildren();
            c.steps.forEach((_, i) => {
                const d = el("span", "ss-dot" + (i < state.step ? " done" : i === state.step ? " now" : ""), String(i + 1));
                dots.appendChild(d);
            });
        };

        const finishStep = (score, fxArr, feedbackNode) => {
            state.scores.push(score);
            const mult = 1;
            fxArr.forEach((v, i) => { state.fx[i] += v * mult * (score >= 0 ? 1 : 0); });
            updateMeters();
            const fb = el("div", "bab7-feedback");
            const pct = Math.round(score * 100);
            const verdict = el("strong", "", score >= 0.99 ? "Tepat sekali. " : score >= 0.6 ? `Cukup tepat (${pct}%). ` : `Perlu diperbaiki (${pct}%). `);
            fb.appendChild(verdict);
            fb.appendChild(feedbackNode);
            stepHost.appendChild(fb);
            const row = el("div", "bab7-next-row");
            const next = el("button", "bab7-primary-btn", state.step === c.steps.length - 1 ? "Lihat Solusi Akhir" : "Pertanyaan Berikutnya →");
            next.type = "button";
            next.addEventListener("click", () => {
                state.step += 1;
                if (state.step >= c.steps.length) showFinal();
                else showStep();
            });
            row.appendChild(next);
            stepHost.appendChild(row);
            fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };

        function showStep() {
            renderDots();
            stepHost.replaceChildren();
            const s = c.steps[state.step];
            stepHost.appendChild(el("p", "bab7-question", s.q));
            const body = el("div", "ss-body");
            stepHost.appendChild(body);
            const fn = BUILDERS[s.type];
            fn(s, body, (score, fxArr, node) => finishStep(score, fxArr, node), stepHost);
        }

        function showFinal() {
            renderDots();
            stepHost.replaceChildren();
            const total = state.scores.reduce((a, b) => a + b, 0) / c.steps.length;
            const pct = Math.round(total * 100);
            results[index] = { pct };
            if (typeof window.vecMarkProgress === "function") {
                window.vecMarkProgress("stepwise", index + 1);
            }
            renderList();

            const box = el("div", "bab7-game-summary ss-final");
            box.appendChild(el("div", "bab7-game-kicker", "SOLUSI AKHIR"));
            box.appendChild(el("div", "score-big", `${pct}%`));
            box.appendChild(el("p", "", pct >= 85 ? "Solusi kamu sangat tepat dan siap diterapkan di kelas atau sekolah." : pct >= 60 ? "Solusi cukup tepat. Tinjau kembali langkah yang belum penuh, lalu coba ulang." : "Solusi perlu ditinjau ulang. Baca umpan balik tiap langkah lalu coba lagi."));
            stepHost.appendChild(box);

            const detail = el("div", "ss-final-grid");
            const sol = el("div", "bab7-practice-card");
            sol.appendChild(el("strong", "", "Solusi yang direkomendasikan"));
            const ul = el("ul", "ss-list");
            c.solusi.forEach((t) => ul.appendChild(el("li", "", t)));
            sol.appendChild(ul);
            const pr = el("div", "bab7-practice-card");
            pr.appendChild(el("strong", "", "Simulasi / praktik lanjutan"));
            pr.appendChild(el("p", "", c.praktik));
            const bk = el("div", "bab7-practice-card");
            bk.appendChild(el("strong", "", "Bukti hasil yang diharapkan"));
            bk.appendChild(el("p", "", c.bukti));
            detail.append(sol, pr, bk);
            stepHost.appendChild(detail);

            const recap = el("div", "ss-recap");
            recap.appendChild(el("strong", "", "Rekap per pertanyaan"));
            state.scores.forEach((sc, i) => {
                recap.appendChild(el("div", "ss-recap-row", `Pertanyaan ${i + 1}: ${Math.round(sc * 100)}%`));
            });
            stepHost.appendChild(recap);

            const row = el("div", "bab7-next-row");
            const again = el("button", "bab7-primary-btn", "Ulangi Soal Ini");
            again.type = "button";
            again.addEventListener("click", () => openCase(index));
            row.appendChild(again);
            if (index < CASES.length - 1) {
                const nxt = el("button", "bab7-primary-btn", "Soal Berikutnya →");
                nxt.type = "button";
                nxt.addEventListener("click", () => openCase(index + 1));
                row.appendChild(nxt);
            }
            stepHost.appendChild(row);
            stepHost.appendChild(el("p", "bab7-muted-note", "Skor soal simulasi bersifat lokal pada sesi ini dan tidak mengubah XP, leaderboard, atau nilai ujian."));
        }

        showStep();
        contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ---------------------------------------------------------
       BUILDER PER JENIS PERTANYAAN
       --------------------------------------------------------- */
    const BUILDERS = {
        single(s, body, done) {
            const wrap = el("div", "bab7-options");
            let answered = false;
            s.options.forEach((o, i) => {
                const b = el("button", "bab7-option", `${String.fromCharCode(65 + i)}. ${o.t}`);
                b.type = "button";
                b.addEventListener("click", () => {
                    if (answered) return;
                    answered = true;
                    [...wrap.children].forEach((x, k) => {
                        x.disabled = true;
                        if (s.options[k].s === 1) x.classList.add("correct");
                        else if (k === i) x.classList.add("incorrect");
                    });
                    const best = s.options.find((x) => x.s === 1);
                    const node = el("span", "", o.why + (o.s < 1 ? ` Jawaban terbaik: ${best.why}` : ""));
                    done(o.s, o.fx, node);
                });
                wrap.appendChild(b);
            });
            body.appendChild(wrap);
        },

        multi(s, body, done) {
            const wrap = el("div", "bab7-options");
            const picked = new Set();
            s.items.forEach((it, i) => {
                const b = el("button", "bab7-option ss-toggle", `☐ ${it.t}`);
                b.type = "button";
                b.addEventListener("click", () => {
                    if (b.disabled) return;
                    if (picked.has(i)) { picked.delete(i); b.classList.remove("active"); b.textContent = `☐ ${it.t}`; }
                    else { picked.add(i); b.classList.add("active"); b.textContent = `☑ ${it.t}`; }
                });
                wrap.appendChild(b);
            });
            const check = el("button", "bab7-primary-btn", "Periksa Jawaban");
            check.type = "button";
            check.addEventListener("click", () => {
                if (picked.size === 0) return;
                check.disabled = true;
                const totalC = s.items.filter((x) => x.c).length;
                let good = 0, bad = 0;
                const fx = [0, 0, 0];
                [...wrap.children].forEach((x, i) => {
                    x.disabled = true;
                    const it = s.items[i];
                    if (it.c) x.classList.add("correct");
                    else if (picked.has(i)) x.classList.add("incorrect");
                    if (picked.has(i)) {
                        if (it.c) good++; else bad++;
                        it.fx.forEach((v, k) => { fx[k] += v; });
                    }
                });
                const score = clamp((good - bad) / totalC, 0, 1);
                done(score, fx, el("span", "", `Kamu memilih ${good} benar dan ${bad} salah dari ${totalC} jawaban benar. ${s.explain}`));
            });
            body.append(wrap, check);
        },

        order(s, body, done) {
            const order = shuffleNotSame(s.items);
            const list = el("ol", "ss-order");
            const check = el("button", "bab7-primary-btn", "Periksa Urutan");
            check.type = "button";
            const paint = () => {
                list.replaceChildren();
                order.forEach((itemIdx, pos) => {
                    const li = el("li", "ss-order-item");
                    li.appendChild(el("span", "ss-order-text", s.items[itemIdx]));
                    const ctrl = el("span", "ss-order-ctrl");
                    const up = el("button", "ss-mini", "▲"); up.type = "button"; up.setAttribute("aria-label", "Naikkan");
                    const dn = el("button", "ss-mini", "▼"); dn.type = "button"; dn.setAttribute("aria-label", "Turunkan");
                    up.disabled = pos === 0 || check.disabled;
                    dn.disabled = pos === order.length - 1 || check.disabled;
                    up.addEventListener("click", () => { [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]]; paint(); });
                    dn.addEventListener("click", () => { [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]]; paint(); });
                    ctrl.append(up, dn);
                    li.appendChild(ctrl);
                    list.appendChild(li);
                });
            };
            paint();
            check.addEventListener("click", () => {
                check.disabled = true;
                paint();
                let match = 0;
                [...list.children].forEach((li, pos) => {
                    if (order[pos] === pos) { match++; li.classList.add("ok"); }
                    else li.classList.add("bad");
                });
                const score = match / s.items.length;
                const right = el("span", "", `${match} dari ${s.items.length} posisi sudah benar. ${s.explain}`);
                done(score, s.fx.map((v) => Math.round(v * score)), right);
            });
            body.append(list, check);
        },

        alloc(s, body, done) {
            const vals = s.cats.map(() => 0);
            const rows = [];
            const total = el("div", "ss-alloc-total", "Total: 0 / 100");
            const check = el("button", "bab7-primary-btn", "Periksa Alokasi");
            check.type = "button";
            check.disabled = true;
            const refresh = () => {
                const sum = vals.reduce((a, b) => a + b, 0);
                total.textContent = `Total: ${sum} / 100`;
                total.classList.toggle("ok", sum === 100);
                check.disabled = sum !== 100;
            };
            s.cats.forEach((cat, i) => {
                const row = el("div", "ss-alloc-row");
                const label = el("label", "", cat.t);
                const out = el("strong", "", "0");
                const input = document.createElement("input");
                input.type = "range"; input.min = "0"; input.max = "100"; input.step = "5"; input.value = "0";
                input.addEventListener("input", () => {
                    vals[i] = Number(input.value);
                    out.textContent = input.value;
                    refresh();
                });
                row.append(label, input, out);
                rows.push({ row, input });
                body.appendChild(row);
            });
            body.append(total, check);
            check.addEventListener("click", () => {
                check.disabled = true;
                let ok = 0;
                const lines = [];
                rows.forEach((r, i) => {
                    r.input.disabled = true;
                    const cat = s.cats[i];
                    const inRange = vals[i] >= cat.lo && vals[i] <= cat.hi;
                    if (inRange) ok++;
                    r.row.classList.add(inRange ? "ok" : "bad");
                    lines.push(`${cat.t}: wajar ${cat.lo}–${cat.hi}`);
                });
                const score = ok / s.cats.length;
                const node = el("span", "", `${ok} dari ${s.cats.length} porsi berada pada rentang wajar. Rentang wajar → ${lines.join("; ")}. ${s.explain}`);
                done(score, s.fx.map((v) => Math.round(v * score)), node);
            });
        },

        assign(s, body, done) {
            const people = el("div", "ss-people");
            s.people.forEach((p) => {
                const card = el("div", "ss-person");
                card.append(el("strong", "", p.name), el("span", "", p.profil));
                people.appendChild(card);
            });
            body.appendChild(people);
            const selects = [];
            s.roles.forEach((r) => {
                const row = el("div", "ss-assign-row");
                row.appendChild(el("label", "", r.t));
                const sel = document.createElement("select");
                const opt0 = el("option", "", "— pilih siswa —"); opt0.value = "";
                sel.appendChild(opt0);
                s.people.forEach((p) => { const o = el("option", "", p.name); o.value = p.name; sel.appendChild(o); });
                row.appendChild(sel);
                selects.push({ sel, row, role: r });
                body.appendChild(row);
            });
            const msg = el("p", "bab7-muted-note", "");
            const check = el("button", "bab7-primary-btn", "Periksa Pembagian Peran");
            check.type = "button";
            check.addEventListener("click", () => {
                const chosen = selects.map((x) => x.sel.value);
                if (chosen.some((v) => !v)) { msg.textContent = "Pilih siswa untuk semua peran."; return; }
                if (new Set(chosen).size !== chosen.length) { msg.textContent = "Setiap siswa harus memegang satu peran yang berbeda."; return; }
                check.disabled = true;
                msg.textContent = "";
                let ok = 0;
                selects.forEach((x) => {
                    x.sel.disabled = true;
                    const good = x.sel.value === x.role.best;
                    if (good) ok++;
                    x.row.classList.add(good ? "ok" : "bad");
                });
                const score = ok / selects.length;
                done(score, s.fx.map((v) => Math.round(v * score)), el("span", "", `${ok} dari ${selects.length} peran sesuai profil. ${s.explain}`));
            });
            body.append(msg, check);
        },

        ldr(s, body, done) {
            const panel = el("div", "ss-ldr");
            const led = el("div", "ss-led");
            const info = el("div", "ss-ldr-info");
            const sliderThr = document.createElement("input");
            sliderThr.type = "range"; sliderThr.min = "0"; sliderThr.max = "100"; sliderThr.value = "20";
            const sliderLight = document.createElement("input");
            sliderLight.type = "range"; sliderLight.min = "0"; sliderLight.max = "100"; sliderLight.value = "70";
            const thrOut = el("strong", "", "20");
            const lightOut = el("strong", "", "70");
            const rowT = el("div", "ss-alloc-row"); rowT.append(el("label", "", "Ambang gelap-terang (diatur oleh kamu)"), sliderThr, thrOut);
            const rowL = el("div", "ss-alloc-row"); rowL.append(el("label", "", "Cahaya ruangan (uji manual)"), sliderLight, lightOut);
            const tests = el("div", "ss-tests");
            const check = el("button", "bab7-primary-btn", "Kunci Rancangan dan Periksa");
            check.type = "button";
            const refresh = () => {
                const thr = Number(sliderThr.value);
                const light = Number(sliderLight.value);
                thrOut.textContent = String(thr);
                lightOut.textContent = String(light);
                const on = light < thr;
                led.classList.toggle("on", on);
                led.textContent = on ? "LED MENYALA" : "LED MATI";
                info.textContent = `Aturan program: JIKA cahaya (${light}) < ambang (${thr}) MAKA LED menyala.`;
                tests.replaceChildren();
                s.tests.forEach((t) => {
                    const res = t.light < thr;
                    const ok = res === t.expect;
                    const row = el("div", "ss-test " + (ok ? "ok" : "bad"));
                    row.textContent = `${ok ? "✓" : "✗"} ${t.name}: LED ${res ? "menyala" : "mati"} (diharapkan ${t.expect ? "menyala" : "mati"})`;
                    tests.appendChild(row);
                });
            };
            sliderThr.addEventListener("input", refresh);
            sliderLight.addEventListener("input", refresh);
            refresh();
            check.addEventListener("click", () => {
                check.disabled = true;
                sliderThr.disabled = true;
                const thr = Number(sliderThr.value);
                const pass = s.tests.filter((t) => (t.light < thr) === t.expect).length;
                const score = pass / s.tests.length;
                done(score, s.fx.map((v) => Math.round(v * score)), el("span", "", `${pass} dari ${s.tests.length} uji lulus pada ambang ${thr}. ${s.explain}`));
            });
            panel.append(led, info, rowT, rowL, tests);
            body.append(panel, check);
        },

        lab(s, body, done) {
            const panel = el("div", "ss-lab");
            const slider = document.createElement("input");
            slider.type = "range"; slider.min = "1"; slider.max = "6"; slider.step = "1"; slider.value = "1";
            const out = el("strong", "", "1");
            const row = el("div", "ss-alloc-row");
            row.append(el("label", "", "Siswa per kit"), slider, out);
            const kitsViz = el("div", "ss-kits");
            const stats = el("div", "ss-lab-stats");
            const check = el("button", "bab7-primary-btn", "Terapkan Pengaturan Ini");
            check.type = "button";
            const calc = (n) => {
                const kitsNeeded = Math.ceil(s.students / n);
                const sessions = Math.ceil(kitsNeeded / s.kits);
                const session = s.minutes / sessions;
                const handsOn = session / n;
                const idle = s.minutes - session;
                const score = clamp((handsOn / 30) * (1 - idle / s.minutes), 0, 1);
                return { kitsNeeded, sessions, session, handsOn, idle, score };
            };
            const refresh = () => {
                const n = Number(slider.value);
                out.textContent = String(n);
                const r = calc(n);
                kitsViz.replaceChildren();
                for (let i = 0; i < Math.min(r.kitsNeeded, 24); i++) {
                    kitsViz.appendChild(el("span", "ss-kit" + (i < s.kits ? " ok" : " over"), "▣"));
                }
                const lines = [
                    `Kit dibutuhkan: ${r.kitsNeeded} (tersedia ${s.kits})`,
                    `Jumlah sesi: ${r.sessions}`,
                    `Waktu bekerja per siswa: ${r.session.toFixed(0)} menit`,
                    `Waktu memegang alat (operator): ${r.handsOn.toFixed(1)} menit`,
                    `Waktu menunggu: ${r.idle.toFixed(0)} menit`
                ];
                stats.replaceChildren();
                lines.forEach((t) => stats.appendChild(el("div", "", t)));
            };
            slider.addEventListener("input", refresh);
            refresh();
            check.addEventListener("click", () => {
                check.disabled = true;
                slider.disabled = true;
                const r = calc(Number(slider.value));
                done(r.score, s.fx.map((v) => Math.round(v * r.score)), el("span", "", `Pengaturanmu menghasilkan ${r.handsOn.toFixed(1)} menit memegang alat dan ${r.idle.toFixed(0)} menit menunggu per siswa. ${s.explain}`));
            });
            panel.append(row, kitsViz, stats);
            body.append(panel, check);
        }
    };

    renderList();
})();
