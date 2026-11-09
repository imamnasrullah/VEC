
// ==========================================
// KONFIGURASI DASAR
// ==========================================

const loginScreen = document.getElementById("loginScreen");
const changePasswordScreen = document.getElementById("changePasswordScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const adminScreen = document.getElementById("adminScreen");

const loginForm = document.getElementById("loginForm");
const changePasswordForm = document.getElementById("changePasswordForm");

const loginMessage = document.getElementById("loginMessage");
const changePasswordMessage = document.getElementById("changePasswordMessage");

let currentUser = null;

// ==========================================
// FUNGSI TAMPILAN
// ==========================================

function showScreen(screen) {
    loginScreen.hidden = screen !== "login";
    changePasswordScreen.hidden = screen !== "changePassword";
    dashboardScreen.hidden = screen !== "dashboard";
    adminScreen.hidden = screen !== "admin";
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// ==========================================
// LOGIN MENGGUNAKAN NIM DAN PASSWORD
// ==========================================


// ==========================================
// LOGIN MENGGUNAKAN NIM DAN PASSWORD
// MELALUI EDGE FUNCTION VEC-LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nim = document.getElementById("loginNim").value.trim();
    const password = document.getElementById("loginPassword").value;
    const loginButton = document.getElementById("loginBtn");

    loginMessage.textContent = "";
    loginMessage.style.color = "#ffb5b5";

    if (!nim || !password) {
        loginMessage.textContent = "NIM dan password wajib diisi.";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Memeriksa...";

    try {
        // Login melalui Edge Function
        const { data, error } = await supabaseClient.functions.invoke(
            "vec-login",
            {
                body: {
                    nim: nim,
                    password: password
                }
            }
        );

        if (error) {
            throw error;
        }

        // Periksa apakah akun terkunci
        if (data?.locked) {
            loginMessage.textContent =
                "Akun terkunci. Silakan hubungi Admin VEC.";
            return;
        }

        // Periksa hasil login
        if (!data?.success || !data?.session) {
            loginMessage.textContent =
                data?.error || "Login gagal. Periksa NIM dan password.";
            return;
        }

        // Simpan sesi login ke Supabase
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });

        if (sessionError) {
            throw sessionError;
        }

        currentUser = sessionData.user;

        // Periksa kewajiban mengganti password
        if (
            currentUser.app_metadata?.must_change_password === true
        ) {
            showScreen("changePassword");
        } else {
            masukDashboard(currentUser);
        }

    } catch (error) {
        console.error("Login gagal:", error);

        loginMessage.textContent =
            "Login gagal. Periksa koneksi atau hubungi Admin VEC.";
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});


// ==========================================
// MENAMPILKAN DASHBOARD
// ==========================================

function masukDashboard(user) {
    currentUser = user;

    // Semua pengguna masuk ke Dashboard Mahasiswa
    showScreen("dashboard");

    // Menu Admin hanya muncul untuk akun Admin
    const adminMenu = document.getElementById("adminMenu");

    if (adminMenu) {
        adminMenu.hidden = user.app_metadata?.role !== "admin";
    }

    const nama =
        user.user_metadata?.nama ||
        user.user_metadata?.nim ||
        "Mahasiswa";

    document.getElementById("userName").textContent = nama;

    // Data XP masih menggunakan data contoh
    const demoUser = {
        level: 3,
        xp: 650,
        nextLevelXp: 1000,
        progress: 68
    };

    document.getElementById("levelNumber").textContent =
        demoUser.level;

    document.getElementById("xpTotal").textContent =
        demoUser.xp.toLocaleString("id-ID");

    document.getElementById("levelXp").textContent =
        demoUser.xp.toLocaleString("id-ID");

    document.getElementById("levelProgress").style.width =
        `${Math.min(100, (demoUser.xp / demoUser.nextLevelXp) * 100)}%`;

    document.getElementById("progressPercent").textContent =
        `${demoUser.progress}%`;

    document.getElementById("progressDonut")
        .style.setProperty("--progress", demoUser.progress);
}

// ==========================================
// GANTI PASSWORD PERTAMA KALI
// ==========================================


changePasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const submitButton = changePasswordForm.querySelector("button[type='submit']");

    changePasswordMessage.textContent = "";

    if (newPassword.length < 8) {
        changePasswordMessage.textContent =
            "Password baru minimal 8 karakter.";
        return;
    }

    if (newPassword !== confirmPassword) {
        changePasswordMessage.textContent =
            "Konfirmasi password tidak sama.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Menyimpan...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "change-password",
            {
                body: {
                    newPassword: newPassword
                }
            }
        );

        if (error) {
            throw error;
        }

        if (!data || !data.success) {
            throw new Error(data?.error || "Gagal mengganti password.");
        }

        changePasswordMessage.style.color = "#59e6b5";
        changePasswordMessage.textContent =
            "Password berhasil disimpan! Silakan login kembali.";

        // Keluar agar login berikutnya memakai token terbaru
        await supabaseClient.auth.signOut();

        currentUser = null;
        changePasswordForm.reset();

        setTimeout(() => {
            showScreen("login");
            loginForm.reset();

            loginMessage.style.color = "#59e6b5";
            loginMessage.textContent =
                "Password berhasil diganti. Silakan login dengan password baru.";
        }, 1500);

    } catch (error) {
        console.error("Gagal mengganti password:", error);

        changePasswordMessage.style.color = "#ffb5b5";
        changePasswordMessage.textContent =
            error.message || "Gagal menyimpan password.";

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Simpan Password Baru";
    }
});



// ==========================================
// NAVIGASI DASHBOARD
// ==========================================

const dashboardHomeContent = document.getElementById("dashboardHomeContent");
const materiPage = document.getElementById("materiPage");


document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {

        // Menghapus status aktif dari semua menu
        document.querySelectorAll(".nav-link").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const page = button.dataset.page;

        // Sembunyikan seluruh halaman terlebih dahulu
        dashboardHomeContent.hidden = true;
        materiPage.hidden = true;
        document.getElementById("challengesPage").hidden = true;
        document.getElementById("studiKasusPage").hidden = true;

        // Tampilkan halaman sesuai menu
        if (page === "Dashboard") {
            dashboardHomeContent.hidden = false;
            showToast("Kamu sedang berada di Dashboard VEC.");
        }

        else if (page === "Materi") {
            materiPage.hidden = false;
        }

        else if (page === "Challenges") {
            document.getElementById("challengesPage").hidden = false;
        }

        else if (page === "Studi Kasus") {
            document.getElementById("studiKasusPage").hidden = false;
        }

        else {
            showToast(`Halaman ${page} sedang dalam tahap pengembangan.`);
        }

        document.getElementById("sidebar").classList.remove("open");
    });
});


// ==========================================
// NAVIGASI TOMBOL DATA-GO
// ==========================================

document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
        const page = button.dataset.go;
        const target = document.querySelector(`[data-page="${page}"]`);

        if (target) target.click();
    });
});


// ==========================================
// DATA MATERI PEMBELAJARAN VEC
// ==========================================

const daftarMateri = [
    {
        judul: "Konsep Dasar Pendidikan Vokasi",
        ringkasan: "Mengenal pengertian, tujuan, fungsi, dan karakteristik pendidikan vokasi.",
        tujuan: [
            "Memahami pengertian pendidikan vokasi.",
            "Menjelaskan tujuan dan fungsi pendidikan vokasi.",
            "Mengidentifikasi karakteristik pendidikan vokasi."
        ],
        isi: `
            <h3>A. Pengertian Pendidikan Vokasi</h3>
            <p>
                Pendidikan vokasi merupakan pendidikan yang berfokus pada
                penguasaan keterampilan dan keahlian tertentu agar peserta
                didik memiliki kemampuan untuk memasuki dunia kerja.
                Pembelajaran menggabungkan pengetahuan teori dengan
                kegiatan praktik sesuai bidang keahlian.
            </p>

            <h3>B. Tujuan Pendidikan Vokasi</h3>
            <p>
                Pendidikan vokasi bertujuan menghasilkan lulusan yang
                kompeten, terampil, mandiri, dan mampu menyesuaikan diri
                dengan perkembangan teknologi serta kebutuhan dunia kerja.
            </p>

            <h3>C. Fungsi Pendidikan Vokasi</h3>
            <ul>
                <li>Mempersiapkan tenaga kerja yang memiliki keterampilan.</li>
                <li>Meningkatkan kompetensi dan produktivitas masyarakat.</li>
                <li>Mendukung kebutuhan tenaga kerja di berbagai sektor industri.</li>
                <li>Mendorong kemampuan berwirausaha.</li>
            </ul>

            <h3>D. Karakteristik Pendidikan Vokasi</h3>
            <ul>
                <li>Berorientasi pada keterampilan dan kompetensi kerja.</li>
                <li>Memiliki kegiatan praktik yang terstruktur.</li>
                <li>Menyesuaikan pembelajaran dengan kebutuhan industri.</li>
                <li>Menggunakan peralatan dan teknologi sesuai bidang keahlian.</li>
            </ul>

            <h3>Contoh Penerapan</h3>
            <p>
                Pada Program Studi Teknik Elektronika, mahasiswa tidak hanya
                mempelajari teori rangkaian listrik, tetapi juga melakukan
                praktik merakit, mengukur, menguji, dan memperbaiki rangkaian
                elektronika.
            </p>
        `,
        rangkuman: "Pendidikan vokasi adalah pendidikan yang menekankan penguasaan kompetensi dan keterampilan praktis untuk mempersiapkan peserta didik menghadapi dunia kerja."
    },
    {
        judul: "Kurikulum Pendidikan Vokasi",
        ringkasan: "Memahami struktur kurikulum, capaian pembelajaran, dan kompetensi lulusan.",
        tujuan: [
            "Memahami pengertian kurikulum pendidikan vokasi.",
            "Menjelaskan komponen kurikulum.",
            "Memahami hubungan kurikulum dengan kompetensi lulusan."
        ],
        isi: `
            <h3>A. Pengertian Kurikulum</h3>
            <p>
                Kurikulum merupakan seperangkat rencana dan pengaturan
                mengenai tujuan, isi, bahan pembelajaran, serta cara yang
                digunakan sebagai pedoman penyelenggaraan pembelajaran.
            </p>

            <h3>B. Kurikulum dalam Pendidikan Vokasi</h3>
            <p>
                Kurikulum pendidikan vokasi dirancang agar peserta didik
                menguasai pengetahuan, keterampilan, dan sikap kerja yang
                dibutuhkan sesuai bidang keahliannya. Materi teori harus
                didukung kegiatan praktik dan pengalaman kerja.
            </p>

            <h3>C. Komponen Kurikulum</h3>
            <ul>
                <li>Tujuan pendidikan dan capaian pembelajaran.</li>
                <li>Materi atau bahan pembelajaran.</li>
                <li>Strategi dan metode pembelajaran.</li>
                <li>Media serta fasilitas pembelajaran.</li>
                <li>Evaluasi hasil belajar.</li>
            </ul>

            <h3>D. Kompetensi Lulusan</h3>
            <p>
                Lulusan pendidikan vokasi diharapkan memiliki kompetensi
                teknis sesuai bidang keahlian, kemampuan komunikasi,
                kedisiplinan, kerja sama, pemecahan masalah, dan tanggung
                jawab dalam bekerja.
            </p>

            <h3>Contoh Penerapan</h3>
            <p>
                Dalam pembelajaran elektronika, kurikulum dapat mencakup
                mata kuliah dasar elektronika, pengukuran listrik,
                mikrokontroler, sistem kendali, dan praktik perancangan
                rangkaian.
            </p>
        `,
        rangkuman: "Kurikulum pendidikan vokasi menjadi pedoman pembelajaran untuk membentuk lulusan yang memiliki pengetahuan, keterampilan, dan sikap kerja sesuai kebutuhan bidang keahlian."
    },
    {
        judul: "Link and Match dengan Dunia Industri",
        ringkasan: "Memahami hubungan antara lembaga pendidikan dan dunia usaha serta dunia industri.",
        tujuan: [
            "Memahami konsep Link and Match.",
            "Menjelaskan manfaat kerja sama pendidikan dengan industri.",
            "Mengetahui bentuk penerapan kerja sama industri."
        ],
        isi: `
            <h3>A. Pengertian Link and Match</h3>
            <p>
                Link and Match merupakan konsep penyelarasan antara dunia
                pendidikan dengan dunia usaha dan dunia industri agar
                kompetensi lulusan sesuai dengan kebutuhan lapangan kerja.
            </p>

            <h3>B. Tujuan Link and Match</h3>
            <ul>
                <li>Mengurangi kesenjangan kompetensi lulusan dengan kebutuhan industri.</li>
                <li>Meningkatkan kesiapan lulusan memasuki dunia kerja.</li>
                <li>Meningkatkan relevansi materi pembelajaran.</li>
                <li>Memperkuat hubungan antara lembaga pendidikan dan industri.</li>
            </ul>

            <h3>C. Bentuk Kerja Sama</h3>
            <ul>
                <li>Praktik kerja lapangan atau magang.</li>
                <li>Guru atau dosen praktisi dari industri.</li>
                <li>Penyelarasan kurikulum bersama industri.</li>
                <li>Sertifikasi kompetensi sesuai bidang pekerjaan.</li>
                <li>Rekrutmen lulusan oleh perusahaan mitra.</li>
            </ul>

            <h3>Contoh Penerapan</h3>
            <p>
                Mahasiswa Teknik Elektronika melaksanakan magang di
                perusahaan yang bergerak dalam bidang perawatan perangkat
                elektronik. Selama kegiatan tersebut, mahasiswa memperoleh
                pengalaman menggunakan peralatan dan prosedur kerja
                yang diterapkan di industri.
            </p>
        `,
        rangkuman: "Link and Match merupakan upaya menyelaraskan pendidikan dengan kebutuhan industri melalui kerja sama, praktik kerja, penyelarasan kurikulum, dan pengembangan kompetensi."
    },
    {
        judul: "Teaching Factory (TEFA)",
        ringkasan: "Mengenal pembelajaran berbasis produksi atau jasa dengan standar industri.",
        tujuan: [
            "Memahami konsep Teaching Factory.",
            "Menjelaskan prinsip pelaksanaan Teaching Factory.",
            "Mengidentifikasi manfaat Teaching Factory."
        ],
        isi: `
            <h3>A. Pengertian Teaching Factory</h3>
            <p>
                Teaching Factory atau TEFA merupakan model pembelajaran
                yang menghadirkan suasana dan proses kerja industri
                ke dalam lingkungan pendidikan. Peserta didik belajar
                melalui kegiatan menghasilkan produk atau memberikan
                layanan sesuai standar yang ditetapkan.
            </p>

            <h3>B. Prinsip Teaching Factory</h3>
            <ul>
                <li>Berorientasi pada produk atau jasa.</li>
                <li>Mengikuti prosedur dan standar kerja.</li>
                <li>Mengutamakan kualitas hasil pekerjaan.</li>
                <li>Melibatkan peserta didik dalam proses produksi.</li>
                <li>Mengutamakan keselamatan dan kesehatan kerja.</li>
            </ul>

            <h3>C. Manfaat Teaching Factory</h3>
            <ul>
                <li>Meningkatkan keterampilan praktik peserta didik.</li>
                <li>Membiasakan peserta didik dengan budaya kerja industri.</li>
                <li>Melatih kerja sama dan tanggung jawab.</li>
                <li>Mengembangkan kemampuan menghasilkan produk yang bernilai guna.</li>
            </ul>

            <h3>Contoh Penerapan</h3>
            <p>
                Mahasiswa Teknik Elektronika membuat perangkat pengendali
                lampu otomatis. Kegiatan dimulai dari perancangan,
                perakitan, pengujian, hingga pemeriksaan kualitas produk.
            </p>
        `,
        rangkuman: "Teaching Factory adalah model pembelajaran yang menggabungkan kegiatan belajar dengan proses produksi atau jasa berdasarkan prosedur dan standar industri."
    },
    {
        judul: "Model Pembelajaran Pendidikan Vokasi",
        ringkasan: "Mempelajari model pembelajaran yang mendukung keterampilan dan pemecahan masalah.",
        tujuan: [
            "Mengenal berbagai model pembelajaran vokasi.",
            "Menjelaskan karakteristik model pembelajaran.",
            "Menentukan model pembelajaran sesuai kebutuhan praktik."
        ],
        isi: `
            <h3>A. Project Based Learning (PjBL)</h3>
            <p>
                Project Based Learning merupakan model pembelajaran
                berbasis proyek. Peserta didik mengerjakan suatu proyek
                untuk menghasilkan produk atau karya melalui tahapan
                perencanaan, pelaksanaan, dan evaluasi.
            </p>

            <h3>B. Problem Based Learning (PBL)</h3>
            <p>
                Problem Based Learning merupakan pembelajaran yang
                menggunakan masalah nyata sebagai dasar kegiatan belajar.
                Peserta didik menganalisis masalah, mencari informasi,
                dan menyusun solusi.
            </p>

            <h3>C. Pembelajaran Praktik</h3>
            <p>
                Pembelajaran praktik memberikan kesempatan kepada peserta
                didik untuk menerapkan teori secara langsung menggunakan
                alat, bahan, dan peralatan sesuai bidang keahlian.
            </p>

            <h3>D. Pembelajaran Berbasis Kompetensi</h3>
            <p>
                Pembelajaran berbasis kompetensi menekankan pencapaian
                kemampuan tertentu yang dapat dibuktikan melalui hasil
                kerja atau unjuk kerja peserta didik.
            </p>

            <h3>Contoh Penerapan</h3>
            <p>
                Pada materi mikrokontroler, mahasiswa diberikan proyek
                membuat sistem penyiram tanaman otomatis. Mahasiswa
                merancang rangkaian, memprogram mikrokontroler,
                menguji sensor, dan mengevaluasi hasil proyek.
            </p>
        `,
        rangkuman: "Model pembelajaran vokasi menekankan pengalaman langsung, pemecahan masalah, penyelesaian proyek, dan pencapaian kompetensi yang dapat diterapkan dalam pekerjaan."
    },
    {
        judul: "Penilaian Kompetensi",
        ringkasan: "Memahami penilaian pengetahuan, sikap, dan keterampilan peserta didik.",
        tujuan: [
            "Memahami pengertian penilaian kompetensi.",
            "Membedakan aspek kognitif, afektif, dan psikomotorik.",
            "Mengetahui teknik penilaian dalam pendidikan vokasi."
        ],
        isi: `
            <h3>A. Pengertian Penilaian Kompetensi</h3>
            <p>
                Penilaian kompetensi merupakan proses mengumpulkan dan
                mengolah informasi untuk mengetahui pencapaian kemampuan
                peserta didik berdasarkan tujuan pembelajaran atau
                standar kompetensi yang telah ditentukan.
            </p>

            <h3>B. Aspek Penilaian</h3>
            <ul>
                <li><b>Kognitif:</b> mengukur pengetahuan dan pemahaman peserta didik.</li>
                <li><b>Afektif:</b> menilai sikap, kedisiplinan, tanggung jawab, dan kerja sama.</li>
                <li><b>Psikomotorik:</b> menilai keterampilan dalam melakukan suatu pekerjaan atau praktik.</li>
            </ul>

            <h3>C. Teknik Penilaian</h3>
            <ul>
                <li>Tes tertulis untuk mengukur pemahaman teori.</li>
                <li>Observasi untuk menilai sikap dan perilaku.</li>
                <li>Praktik atau unjuk kerja untuk menilai keterampilan.</li>
                <li>Portofolio untuk menilai kumpulan hasil pekerjaan.</li>
                <li>Proyek untuk menilai kemampuan menyelesaikan tugas secara menyeluruh.</li>
            </ul>

            <h3>Contoh Penerapan</h3>
            <p>
                Dalam praktik merakit rangkaian elektronika, penilaian
                kognitif dapat dilakukan melalui pertanyaan tentang fungsi
                komponen, penilaian afektif melalui kedisiplinan dan
                keselamatan kerja, serta penilaian psikomotorik melalui
                ketepatan proses perakitan dan hasil rangkaian.
            </p>
        `,
        rangkuman: "Penilaian kompetensi dalam pendidikan vokasi mencakup pengetahuan, sikap, dan keterampilan agar kemampuan peserta didik dapat dinilai secara menyeluruh."
    }
];

// ==========================================
// MENAMPILKAN DAFTAR MATERI
// ==========================================

const materiList = document.getElementById("materiList");
const materiDetail = document.getElementById("materiDetail");
const materiDetailContent = document.getElementById("materiDetailContent");
const kembaliMateri = document.getElementById("kembaliMateri");

function tampilkanDaftarMateri() {
    materiList.innerHTML = "";

    daftarMateri.forEach((materi, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "materi-card";

        card.innerHTML = `
            <div class="materi-number">${index + 1}</div>
            <div>
                <h3>${materi.judul}</h3>
                <p>${materi.ringkasan}</p>
            </div>
        `;

        card.addEventListener("click", () => {
            bukaMateri(index);
        });

        materiList.appendChild(card);
    });
}

// ==========================================
// MEMBUKA ISI MATERI
// ==========================================

function bukaMateri(index) {
    const materi = daftarMateri[index];

    materiList.hidden = true;
    materiDetail.hidden = false;

    materiDetailContent.innerHTML = `
        <article class="materi-isi">
            <span class="materi-label">BAB ${index + 1}</span>
            <h2>${materi.judul}</h2>

            <h3>Tujuan Pembelajaran</h3>
            <ul>
                ${materi.tujuan.map(item => `<li>${item}</li>`).join("")}
            </ul>

            ${materi.isi}

            <div class="materi-rangkuman">
                <h3>Rangkuman</h3>
                <p>${materi.rangkuman}</p>
            </div>
        </article>
    `;

    if (window.lucide) {
        lucide.createIcons();
    }
}

// ==========================================
// KEMBALI KE DAFTAR MATERI
// ==========================================

kembaliMateri.addEventListener("click", () => {
    materiDetail.hidden = true;
    materiList.hidden = false;
});

tampilkanDaftarMateri();


// ==========================================
// DATA STUDI KASUS VEC
// ==========================================

const dataStudiKasusVEC = [
    {
        judul: "Kesenjangan Kompetensi Lulusan dengan Kebutuhan Industri",
        kategori: "Link and Match",
        bacaan: [
            "Sebuah sekolah menengah kejuruan (SMK) memiliki program keahlian Teknik Elektronika. Setiap tahun sekolah tersebut meluluskan banyak siswa yang diharapkan mampu bekerja di bidang industri elektronika.",
            "Namun, perusahaan yang menerima lulusan sekolah tersebut menemukan bahwa sebagian lulusan belum menguasai teknologi yang digunakan di tempat kerja. Mereka masih kesulitan mengoperasikan peralatan modern, membaca diagram rangkaian, dan melakukan pemecahan masalah secara mandiri.",
            "Permasalahan tersebut terjadi karena pembelajaran di sekolah belum sepenuhnya mengikuti perkembangan teknologi industri. Kerja sama antara sekolah dan perusahaan juga masih terbatas. Sekolah perlu mengevaluasi kurikulum, meningkatkan praktik, dan memperkuat hubungan dengan dunia industri."
        ],
        pertanyaan: [
            "Apa permasalahan utama yang dialami oleh lulusan SMK dalam kasus tersebut?",
            "Mengapa kompetensi lulusan belum sesuai dengan kebutuhan dunia industri?",
            "Bagaimana bentuk kerja sama yang dapat dilakukan sekolah dengan perusahaan?",
            "Apa solusi yang dapat diterapkan untuk meningkatkan kompetensi lulusan?"
        ]
    },
    {
        judul: "Penerapan Teaching Factory di Sekolah Vokasi",
        kategori: "Teaching Factory",
        bacaan: [
            "SMK Teknologi Mandiri berencana menerapkan Teaching Factory (TEFA) untuk meningkatkan keterampilan siswa. Melalui program ini, siswa diharapkan dapat belajar dengan suasana kerja yang menyerupai dunia industri.",
            "Sekolah mulai membuka unit produksi sederhana yang menerima pesanan pembuatan dan perbaikan perangkat elektronika. Siswa dilibatkan dalam proses perencanaan, pengerjaan, pengujian, hingga pemeriksaan kualitas produk.",
            "Namun, pelaksanaan program belum berjalan optimal. Beberapa guru belum terbiasa dengan sistem pembelajaran berbasis produksi. Peralatan praktik juga belum sepenuhnya memenuhi standar industri. Selain itu, pesanan yang diterima masih sedikit sehingga kegiatan produksi belum berjalan secara konsisten."
        ],
        pertanyaan: [
            "Apa tujuan utama penerapan Teaching Factory dalam pendidikan vokasi?",
            "Apa saja kendala yang dihadapi sekolah dalam menerapkan Teaching Factory?",
            "Bagaimana peran guru dalam mendukung keberhasilan program Teaching Factory?",
            "Apa langkah yang dapat dilakukan agar Teaching Factory berjalan lebih efektif?"
        ]
    },
    {
        judul: "Kurikulum yang Tidak Sesuai Perkembangan Teknologi",
        kategori: "Kurikulum Vokasi",
        bacaan: [
            "Sebuah lembaga pendidikan vokasi masih menggunakan kurikulum yang disusun beberapa tahun lalu. Materi pembelajaran lebih banyak membahas teknologi konvensional, sedangkan dunia industri telah menggunakan sistem otomasi, Internet of Things (IoT), dan teknologi digital.",
            "Mahasiswa mulai mengalami kesulitan ketika mengikuti kegiatan magang karena belum memahami teknologi yang digunakan perusahaan. Mereka membutuhkan waktu lebih lama untuk beradaptasi dengan peralatan dan sistem kerja yang baru.",
            "Pihak lembaga menyadari bahwa kurikulum perlu diperbarui. Namun, perubahan tersebut membutuhkan koordinasi antara pengelola pendidikan, guru atau dosen, serta pihak industri agar materi pembelajaran tetap relevan dengan kebutuhan pekerjaan."
        ],
        pertanyaan: [
            "Mengapa kurikulum pendidikan vokasi perlu mengikuti perkembangan teknologi?",
            "Apa dampak penggunaan kurikulum yang sudah tidak relevan bagi mahasiswa?",
            "Bagaimana cara melibatkan industri dalam pengembangan kurikulum?",
            "Materi atau kompetensi teknologi apa yang perlu ditambahkan dalam pembelajaran Teknik Elektronika?"
        ]
    },
    {
        judul: "Keterbatasan Peralatan Praktik di Laboratorium",
        kategori: "Sarana dan Prasarana",
        bacaan: [
            "Sebuah sekolah vokasi memiliki jumlah siswa yang cukup banyak, tetapi fasilitas laboratorium elektronika masih terbatas. Beberapa alat ukur, seperti multimeter dan osiloskop, harus digunakan secara bergantian oleh banyak siswa.",
            "Kondisi tersebut menyebabkan waktu praktik menjadi kurang efektif. Sebagian siswa hanya mengamati temannya melakukan pengukuran tanpa mendapatkan kesempatan yang cukup untuk mencoba secara langsung.",
            "Pihak sekolah memiliki keterbatasan anggaran untuk membeli peralatan baru. Oleh karena itu, sekolah perlu mengatur jadwal penggunaan laboratorium, melakukan perawatan peralatan, serta mencari alternatif kerja sama dengan industri atau lembaga lain."
        ],
        pertanyaan: [
            "Apa masalah utama yang terjadi dalam kegiatan praktik tersebut?",
            "Bagaimana keterbatasan peralatan dapat memengaruhi keterampilan siswa?",
            "Apa alternatif yang dapat dilakukan sekolah untuk mengatasi keterbatasan fasilitas?",
            "Mengapa kegiatan praktik langsung penting dalam pendidikan vokasi?"
        ]
    },
    {
        judul: "Rendahnya Keterampilan Kerja Sama Mahasiswa",
        kategori: "Kompetensi Kerja",
        bacaan: [
            "Dalam sebuah kegiatan proyek elektronika, mahasiswa dibagi menjadi beberapa kelompok untuk merancang dan membuat sistem kendali sederhana. Setiap anggota memiliki tugas yang berbeda, seperti merancang rangkaian, membuat program, merakit komponen, dan melakukan pengujian.",
            "Namun, pelaksanaan proyek mengalami hambatan. Beberapa mahasiswa tidak menjalankan tugas sesuai pembagian, komunikasi antaranggotanya kurang baik, dan sebagian pekerjaan hanya dikerjakan oleh satu atau dua orang.",
            "Akibatnya, proyek terlambat diselesaikan dan hasilnya tidak sesuai target. Dosen kemudian mengevaluasi proses pembelajaran dan menyadari bahwa mahasiswa tidak hanya perlu menguasai keterampilan teknis, tetapi juga keterampilan komunikasi, tanggung jawab, dan kerja sama tim."
        ],
        pertanyaan: [
            "Apa penyebab utama kurang efektifnya kerja kelompok dalam kasus tersebut?",
            "Mengapa keterampilan kerja sama penting bagi lulusan pendidikan vokasi?",
            "Bagaimana cara membangun komunikasi dan tanggung jawab dalam sebuah tim?",
            "Bagaimana dosen dapat menilai keterampilan kerja sama mahasiswa?"
        ]
    },
    {
        judul: "Sertifikasi Kompetensi sebagai Bekal Memasuki Dunia Kerja",
        kategori: "Sertifikasi Kompetensi",
        bacaan: [
            "Seorang lulusan pendidikan vokasi memiliki kemampuan yang cukup baik dalam merakit dan memperbaiki perangkat elektronika. Selama mengikuti pendidikan, ia telah melakukan berbagai kegiatan praktik dan menyelesaikan beberapa proyek.",
            "Ketika melamar pekerjaan, perusahaan meminta bukti kompetensi yang dapat menunjukkan bahwa pelamar telah memenuhi standar kemampuan tertentu. Lulusan tersebut belum memiliki sertifikat kompetensi sehingga harus mengikuti proses pengujian untuk membuktikan keterampilannya.",
            "Sekolah kemudian mempertimbangkan untuk bekerja sama dengan Lembaga Sertifikasi Profesi (LSP) agar siswa dapat mengikuti uji kompetensi sesuai bidang keahliannya. Dengan demikian, lulusan tidak hanya memiliki ijazah, tetapi juga bukti kemampuan yang diakui sesuai skema sertifikasi yang diikuti."
        ],
        pertanyaan: [
            "Apa fungsi sertifikasi kompetensi bagi lulusan pendidikan vokasi?",
            "Mengapa perusahaan membutuhkan bukti kompetensi calon tenaga kerja?",
            "Bagaimana peran Lembaga Sertifikasi Profesi dalam pendidikan vokasi?",
            "Apa manfaat sertifikasi kompetensi bagi mahasiswa ketika memasuki dunia kerja?"
        ]
    }
];

// ==========================================
// MENAMPILKAN DAFTAR STUDI KASUS
// ==========================================

const studiKasusList = document.getElementById("studiKasusList");
const studiKasusDetail = document.getElementById("studiKasusDetail");
const studiKasusDetailContent =
    document.getElementById("studiKasusDetailContent");

const kembaliStudiKasus =
    document.getElementById("kembaliStudiKasus");

function tampilkanDaftarStudiKasus() {

    studiKasusList.hidden = false;
    studiKasusDetail.hidden = true;

    studiKasusList.replaceChildren();

    dataStudiKasusVEC.forEach((kasus, index) => {

        const kartu = document.createElement("div");
        kartu.className = "studi-kasus-card";

        const nomor = document.createElement("span");
        nomor.className = "studi-kasus-nomor";
        nomor.textContent = `STUDI KASUS ${index + 1}`;

        const kategori = document.createElement("span");
        kategori.className = "studi-kasus-kategori";
        kategori.textContent = kasus.kategori;

        const judul = document.createElement("h3");
        judul.textContent = kasus.judul;

        const deskripsi = document.createElement("p");
        deskripsi.textContent =
            kasus.bacaan[0].substring(0, 140) + "...";

        const tombol = document.createElement("button");
        tombol.type = "button";
        tombol.textContent = "Baca dan Analisis →";

        tombol.addEventListener("click", () => {
            bukaStudiKasus(index);
        });

        kartu.append(
            nomor,
            kategori,
            judul,
            deskripsi,
            tombol
        );

        studiKasusList.appendChild(kartu);
    });
}

// ==========================================
// MEMBUKA DETAIL STUDI KASUS
// ==========================================


async function bukaStudiKasus(index) {
    const kasus = dataStudiKasusVEC[index];
    const nomorKasus = index + 1;

    studiKasusList.hidden = true;
    studiKasusDetail.hidden = false;
    studiKasusDetailContent.replaceChildren();

    // Judul dan kategori
    const judul = document.createElement("h2");
    judul.textContent = kasus.judul;

    const kategori = document.createElement("p");
    kategori.className = "studi-kasus-kategori";
    kategori.textContent = kasus.kategori;

    const subJudul = document.createElement("h3");
    subJudul.textContent = "Bacaan Studi Kasus";

    studiKasusDetailContent.append(judul, kategori, subJudul);

    // Menampilkan bacaan
    kasus.bacaan.forEach((paragraf) => {
        const p = document.createElement("p");
        p.textContent = paragraf;
        p.className = "studi-kasus-bacaan";
        studiKasusDetailContent.appendChild(p);
    });

    // Mengambil jawaban mahasiswa dari Supabase
    const nim = currentUser?.user_metadata?.nim;
    let jawabanTersimpan = [];

    if (nim) {
        const { data, error } = await supabaseClient
            .from("vec_case_answers")
            .select("question_no, answer")
            .eq("nim", nim)
            .eq("case_no", nomorKasus);

        if (error) {
            console.error("Gagal mengambil jawaban:", error);
            showToast("Gagal mengambil jawaban tersimpan.");
        } else {
            jawabanTersimpan = data || [];
        }
    }

    const jawabanMap = new Map(
        jawabanTersimpan.map((item) => [
            item.question_no,
            item.answer
        ])
    );

    // Bagian pertanyaan dan jawaban
    const judulAnalisis = document.createElement("h3");
    judulAnalisis.textContent = "Pertanyaan dan Jawaban Analisis";
    studiKasusDetailContent.appendChild(judulAnalisis);

    kasus.pertanyaan.forEach((pertanyaan, questionIndex) => {
        const nomorPertanyaan = questionIndex + 1;

        const wadah = document.createElement("div");
        wadah.className = "studi-kasus-question";

        const teksPertanyaan = document.createElement("h4");
        teksPertanyaan.textContent =
            `${nomorPertanyaan}. ${pertanyaan}`;

        const textarea = document.createElement("textarea");
        textarea.rows = 5;
        textarea.maxLength = 5000;
        textarea.placeholder = "Tuliskan jawaban analisis kamu...";
        textarea.value = jawabanMap.get(nomorPertanyaan) || "";

        const tombolSimpan = document.createElement("button");
        tombolSimpan.type = "button";
        tombolSimpan.textContent = "Simpan Jawaban";

        const pesan = document.createElement("p");
        pesan.className = "studi-kasus-save-message";

        tombolSimpan.addEventListener("click", async () => {
            const jawaban = textarea.value.trim();

            if (!jawaban) {
                pesan.textContent = "Jawaban tidak boleh kosong.";
                return;
            }

            tombolSimpan.disabled = true;
            tombolSimpan.textContent = "Menyimpan...";
            pesan.textContent = "";

            const { data, error } = await supabaseClient.rpc(
                "save_vec_case_answer",
                {
                    p_case_no: nomorKasus,
                    p_question_no: nomorPertanyaan,
                    p_answer: jawaban
                }
            );

            tombolSimpan.disabled = false;
            tombolSimpan.textContent = "Simpan Jawaban";

            if (error) {
                console.error("Gagal menyimpan jawaban:", error);
                pesan.textContent =
                    error.message || "Jawaban gagal disimpan.";
                return;
            }

            if (data?.success) {
                pesan.textContent = "Jawaban berhasil disimpan.";
                showToast("Jawaban berhasil disimpan.");
            } else {
                pesan.textContent = "Jawaban gagal disimpan.";
            }
        });

        wadah.append(
            teksPertanyaan,
            textarea,
            tombolSimpan,
            pesan
        );

        studiKasusDetailContent.appendChild(wadah);
    });
}


// ==========================================
// TOMBOL KEMBALI
// ==========================================

kembaliStudiKasus.addEventListener("click", () => {
    tampilkanDaftarStudiKasus();
});

// Tampilkan daftar saat halaman dimuat
tampilkanDaftarStudiKasus();



// ==========================================
// NAVIGASI ADMIN VEC
// ==========================================

const adminMenu = document.getElementById("adminMenu");

if (adminMenu) {
    adminMenu.addEventListener("click", () => {

        if (currentUser?.app_metadata?.role !== "admin") {
            showToast("Akses hanya untuk Admin.");
            return;
        }

        showScreen("admin");

        document.getElementById("sidebar")
            .classList.remove("open");

        // Memuat data pemantauan ujian
        muatDataUjianAdmin();
    });
}

// ==========================================
// NOTIFIKASI
// ==========================================

document.getElementById("notificationBtn").addEventListener("click", () => {
    showToast("Belum ada notifikasi baru. Semangat menyelesaikan misi!");
});

// ==========================================
// LOGOUT
// ==========================================

document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        showToast("Gagal logout. Silakan coba lagi.");
        console.error(error);
        return;
    }

    currentUser = null;
    loginForm.reset();
    showScreen("login");

    showToast("Berhasil logout.");
});

// ==========================================
// MENU MOBILE
// ==========================================

document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// ==========================================
// PERIKSA SESSION SAAT HALAMAN DIBUKA
// ==========================================

async function periksaSession() {
    showScreen("login");

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Gagal memeriksa session:", error);
        return;
    }

    const user = data.session?.user;

    if (!user) {
        return;
    }

    currentUser = user;

    if (user.app_metadata?.must_change_password === true) {
        showScreen("changePassword");
    } else {
        masukDashboard(user);
    }
}

periksaSession();

// ==========================================
// PENCARIAN MAHASISWA ADMIN VEC
// ==========================================

const adminSearchBtn = document.getElementById("adminSearchBtn");
const adminSearchNim = document.getElementById("adminSearchNim");
const adminStudentResult = document.getElementById("adminStudentResult");
const adminMessage = document.getElementById("adminMessage");

if (adminSearchBtn) {
    adminSearchBtn.addEventListener("click", cariMahasiswaAdmin);
}

async function cariMahasiswaAdmin() {
    if (!currentUser || currentUser.app_metadata?.role !== "admin") {
        adminMessage.textContent = "Akses khusus Admin VEC.";
        return;
    }

    const nim = adminSearchNim.value.trim();

    if (!/^\d{8}$/.test(nim)) {
        adminMessage.textContent = "Masukkan NIM yang terdiri dari 8 angka.";
        adminStudentResult.innerHTML = "";
        return;
    }

    adminSearchBtn.disabled = true;
    adminSearchBtn.textContent = "Mencari...";
    adminMessage.textContent = "";
    adminStudentResult.innerHTML = "";

    try {
        const { data, error } =
            await supabaseClient.functions.invoke("admin-search-student", {
                body: { nim }
            });

        if (error) throw error;

        if (!data.success) {
            throw new Error(data.error || "Mahasiswa tidak ditemukan.");
        }

        const student = data.student;

        adminStudentResult.innerHTML = `
            <div class="panel" style="margin-top:20px;">
                <h3>Hasil Pencarian Mahasiswa</h3>
                <p><b>NIM:</b> ${student.nim}</p>
                <p><b>Nama:</b> ${student.nama}</p>
                <p><b>Status:</b> ${student.is_active ? "Aktif" : "Tidak Aktif"}</p>
                <p><b>Percobaan Login Gagal:</b> ${student.failed_attempts}/3</p>
                <p><b>Status Login:</b> ${student.is_locked ? "Terkunci" : "Tidak Terkunci"}</p>
                <button type="button" id="adminResetPasswordBtn">
    Reset Password
</button>
            </div>
        `;
                document
            .getElementById("adminResetPasswordBtn")
            .addEventListener("click", resetPasswordMahasiswa);

    } catch (error) {
        console.error("Pencarian mahasiswa gagal:", error);
        adminMessage.textContent =
            error.message || "Gagal mencari mahasiswa.";
    } finally {
        adminSearchBtn.disabled = false;
        adminSearchBtn.textContent = "Cari Mahasiswa";
    }
}


async function resetPasswordMahasiswa() {
    const nim = adminSearchNim.value.trim();
    const resetBtn = document.getElementById("adminResetPasswordBtn");

    if (!confirm(`Yakin ingin mereset password mahasiswa ${nim}?`)) {
        return;
    }

    resetBtn.disabled = true;
    resetBtn.textContent = "Mereset...";

    try {
        const { data, error } =
            await supabaseClient.functions.invoke("admin-reset-password", {
                body: { nim }
            });

        if (error) throw error;

        if (!data.success) {
            throw new Error(data.error || "Reset password gagal.");
        }

        adminMessage.textContent =
            `Password berhasil direset untuk ${data.nama}.`;

        adminStudentResult.innerHTML += `
    <div class="admin-reset-result">
        <h3>Password Sementara Berhasil Dibuat</h3>
        <p>NIM: ${data.nim}</p>
        <p>Nama: ${data.nama}</p>
        <p>Password sementara:</p>
        <span class="temporary-password">${data.temporaryPassword}</span>
        <p>Mahasiswa wajib mengganti password saat login berikutnya.</p>
    </div>
`;  

    } catch (error) {
        console.error("Reset password gagal:", error);
        adminMessage.textContent =
            error.message || "Gagal mereset password.";
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = "Reset Password";
    }
}



const adminLoadStudentsBtn = document.getElementById("adminLoadStudentsBtn");
const adminStudentsList = document.getElementById("adminStudentsList");

if (adminLoadStudentsBtn) {
    adminLoadStudentsBtn.addEventListener("click", tampilkanSeluruhMahasiswa);
}

async function tampilkanSeluruhMahasiswa() {
    if (!currentUser || currentUser.app_metadata?.role !== "admin") {
        adminMessage.textContent = "Akses khusus Admin VEC.";
        return;
    }

    adminLoadStudentsBtn.disabled = true;
    adminLoadStudentsBtn.textContent = "Memuat data...";
    adminStudentsList.textContent = "";

    try {
        const { data, error } =
            await supabaseClient.functions.invoke("admin-list-students", {
                body: {}
            });

        if (error) throw error;

        if (!data.success) {
            throw new Error(data.error || "Gagal mengambil daftar mahasiswa.");
        }

        if (!Array.isArray(data.students) || data.students.length === 0) {
            adminStudentsList.textContent = "Belum ada data mahasiswa.";
            return;
        }

        const table = document.createElement("table");
        table.className = "admin-students-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>No.</th>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Status</th>
                    <th>Login Gagal</th>
                    <th>Status Login</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        data.students.forEach((student, index) => {
            const row = document.createElement("tr");

            const values = [
                index + 1,
                student.nim,
                student.nama,
                student.is_active ? "Aktif" : "Tidak Aktif",
                `${student.failed_attempts}/3`,
                student.is_locked ? "Terkunci" : "Tidak Terkunci"
            ];

            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        adminStudentsList.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = `Daftar Mahasiswa (${data.total})`;

        adminStudentsList.append(heading, table);

        adminMessage.textContent = "Daftar mahasiswa berhasil dimuat.";

    } catch (error) {
        console.error("Gagal memuat mahasiswa:", error);
        adminMessage.textContent =
            error.message || "Gagal mengambil daftar mahasiswa.";
    } finally {
        adminLoadStudentsBtn.disabled = false;
        adminLoadStudentsBtn.textContent = "Tampilkan Seluruh Mahasiswa";
    }
}


// ==========================================
// KEMBALI KE DASHBOARD MAHASISWA
// ==========================================

const adminLogoutBtn = document.getElementById("adminLogoutBtn");

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {

        if (currentUser) {
            showScreen("dashboard");
        }

    });
}


// ==========================================
// SISTEM CHALLENGES - UJIAN VEC
// ==========================================

const examStart = document.getElementById("examStart");
const examArea = document.getElementById("examArea");
const examWaiting = document.getElementById("examWaiting");
const examResult = document.getElementById("examResult");

const mulaiUjianBtn = document.getElementById("mulaiUjianBtn");
const kumpulkanUjianBtn = document.getElementById("kumpulkanUjianBtn");

const examPackage = document.getElementById("examPackage");
const examTimer = document.getElementById("examTimer");
const examProgressText = document.getElementById("examProgressText");
const examProgressBar = document.getElementById("examProgressBar");
const examQuestions = document.getElementById("examQuestions");

const waitingTimer = document.getElementById("waitingTimer");
const examFinalScore = document.getElementById("examFinalScore");
const examResultMessage = document.getElementById("examResultMessage");

let examEndsAt = null;
let examTimerInterval = null;
let examPollingInterval = null;
let examSaving = false;
let examAnswers = {};

// ==========================================
// FORMAT WAKTU
// ==========================================

function formatExamTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ==========================================
// TAMPILAN HALAMAN
// ==========================================

function tampilkanBagianUjian(bagian) {
    examStart.hidden = bagian !== "start";
    examArea.hidden = bagian !== "exam";
    examWaiting.hidden = bagian !== "waiting";
    examResult.hidden = bagian !== "result";
}

// ==========================================
// PROGRESS JAWABAN
// ==========================================

function perbaruiProgress() {
    const totalSoal = examQuestions.querySelectorAll(".exam-question-card").length;
    const terjawab = Object.keys(examAnswers).length;

    examProgressText.textContent = `${terjawab} dari ${totalSoal} soal terjawab`;

    const persen = totalSoal > 0
        ? (terjawab / totalSoal) * 100
        : 0;

    examProgressBar.style.width = `${persen}%`;
}

// ==========================================
// TAMPILKAN SOAL
// ==========================================

function tampilkanSoal(questions, answers) {
    examAnswers = {};

    if (Array.isArray(answers)) {
        answers.forEach((item) => {
            examAnswers[item.question_id] = item.answer;
        });
    }

    if (!Array.isArray(questions) || questions.length !== 20) {
    showToast("Soal ujian harus berjumlah 20 soal.");
    return;
    }

    examQuestions.innerHTML = questions.map((soal, index) => {
        const pilihan = soal.options || {};

        return `
            <div class="exam-question-card">
                <h4>${index + 1}. ${soal.question}</h4>

                ${Object.entries(pilihan).map(([huruf, teks]) => `
                    <label class="exam-option">
                        <input
                            type="radio"
                            name="question-${soal.id}"
                            value="${huruf}"
                            ${examAnswers[soal.id] === huruf ? "checked" : ""}
                        >
                        <span><b>${huruf}.</b> ${teks}</span>
                    </label>
                `).join("")}
            </div>
        `;
    }).join("");

    examQuestions.querySelectorAll("input[type='radio']").forEach((radio) => {
        radio.addEventListener("change", async () => {
            if (examSaving) return;

            const questionId = Number(
                radio.name.replace("question-", "")
            );

            const answer = radio.value;

            await simpanJawaban(questionId, answer);
        });
    });

    perbaruiProgress();
}

// ==========================================
// SIMPAN JAWABAN KE SUPABASE
// ==========================================

async function simpanJawaban(questionId, answer) {
    examSaving = true;

    const { error } = await supabaseClient.rpc(
        "save_vec_exam_answer",
        {
            p_question_id: questionId,
            p_answer: answer
        }
    );

    examSaving = false;

    if (error) {
        console.error("Gagal menyimpan jawaban:", error);
        showToast("Jawaban gagal disimpan. Silakan coba lagi.");
        await ambilStatusUjian();
        return;
    }

    examAnswers[questionId] = answer;
    perbaruiProgress();
}

// ==========================================
// TIMER UJIAN
// ==========================================

function mulaiTimerUjian(endsAt) {
    clearInterval(examTimerInterval);

    examEndsAt = new Date(endsAt).getTime();

    function updateTimer() {
        const sisaWaktu = examEndsAt - Date.now();

        examTimer.textContent = formatExamTime(sisaWaktu);

        if (sisaWaktu <= 0) {
            clearInterval(examTimerInterval);
            ambilStatusUjian();
        }
    }

    updateTimer();

    examTimerInterval = setInterval(updateTimer, 500);
}

// ==========================================
// TIMER MENUNGGU HASIL
// ==========================================

function mulaiTimerMenunggu(endsAt) {
    clearInterval(examTimerInterval);

    examEndsAt = new Date(endsAt).getTime();

    function updateTimer() {
        const sisaWaktu = examEndsAt - Date.now();

        waitingTimer.textContent = formatExamTime(sisaWaktu);

        if (sisaWaktu <= 0) {
            clearInterval(examTimerInterval);
            ambilStatusUjian();
        }
    }

    updateTimer();

    examTimerInterval = setInterval(updateTimer, 500);
}

// ==========================================
// AMBIL STATUS UJIAN
// ==========================================

async function ambilStatusUjian() {
    const { data, error } = await supabaseClient.rpc(
        "get_vec_exam_state"
    );

    if (error) {
        console.error("Gagal mengambil status ujian:", error);
        showToast("Gagal memuat status ujian.");
        return;
    }

    if (!data || data.started === false) {
        clearInterval(examTimerInterval);
        tampilkanBagianUjian("start");
        return;
    }

    if (data.result_released === true) {
        clearInterval(examTimerInterval);

        tampilkanBagianUjian("result");

        examFinalScore.textContent = data.score ?? 0;
        examResultMessage.textContent =
            "Ujian telah selesai. Hasil ujian kamu sudah dapat dilihat.";

        return;
    }

    if (data.status === "Dikumpulkan") {
        clearInterval(examTimerInterval);

        tampilkanBagianUjian("waiting");

        mulaiTimerMenunggu(data.ends_at);
        return;
    }

    if (data.status === "Berlangsung") {
        tampilkanBagianUjian("exam");

        examPackage.textContent = `Paket ${data.package}`;

        tampilkanSoal(data.questions, data.answers || []);

        mulaiTimerUjian(data.ends_at);
        return;
    }
}

// ==========================================
// MULAI UJIAN
// ==========================================

mulaiUjianBtn.addEventListener("click", async () => {
    mulaiUjianBtn.disabled = true;
    mulaiUjianBtn.textContent = "Menyiapkan ujian...";

    const { data, error } = await supabaseClient.rpc(
        "start_vec_exam"
    );

    mulaiUjianBtn.disabled = false;
    mulaiUjianBtn.textContent = "Mulai Ujian";

    if (error) {
        console.error("Gagal memulai ujian:", error);
        showToast("Ujian gagal dimulai. Silakan coba lagi.");
        return;
    }

    if (data) {
        await ambilStatusUjian();
    }
});

// ==========================================
// KUMPULKAN UJIAN
// ==========================================

kumpulkanUjianBtn.addEventListener("click", async () => {
    const yakin = confirm(
        "Apakah kamu yakin ingin mengumpulkan jawaban? Setelah dikumpulkan, jawaban tidak dapat diubah."
    );

    if (!yakin) return;

    kumpulkanUjianBtn.disabled = true;
    kumpulkanUjianBtn.textContent = "Mengumpulkan...";

    const { error } = await supabaseClient.rpc(
        "submit_vec_exam"
    );

    kumpulkanUjianBtn.disabled = false;
    kumpulkanUjianBtn.textContent = "Kumpulkan Jawaban";

    if (error) {
        console.error("Gagal mengumpulkan ujian:", error);
        showToast("Jawaban gagal dikumpulkan.");
        return;
    }

    showToast("Jawaban berhasil dikumpulkan.");

    await ambilStatusUjian();
});

// ==========================================
// PEMBARUAN STATUS OTOMATIS
// ==========================================

async function mulaiPemantauanUjian() {
    clearInterval(examPollingInterval);

    await ambilStatusUjian();

    examPollingInterval = setInterval(() => {
        ambilStatusUjian();
    }, 3000);
}

// ==========================================
// JALANKAN SAAT HALAMAN DIMUAT
// ==========================================

mulaiPemantauanUjian();


// ==========================================
// PEMANTAUAN UJIAN - ADMIN VEC
// ==========================================

// Mengambil panel Admin
const examAdminScreen = document.getElementById("adminScreen");
const examAdminPanel = examAdminScreen?.querySelector(".panel");

// Membuat area pemantauan
let examAdminContainer = document.getElementById("adminExamPanel");

if (examAdminPanel && !examAdminContainer) {
    examAdminContainer = document.createElement("div");
    examAdminContainer.id = "adminExamPanel";
    examAdminContainer.className = "admin-exam-panel";


examAdminContainer.innerHTML = `
    <hr>
    <h3>Pemantauan Ujian VEC</h3>
    <p>Pantau aktivitas dan hasil ujian seluruh mahasiswa.</p>

    <div class="admin-exam-controls">
        <button type="button" id="adminRefreshExamBtn">
            Perbarui Data Ujian
        </button>

        <button type="button" id="adminFinishExamBtn">
            Selesaikan Semua Ujian
        </button>
    </div>

    <hr>

    <h3>Reset Ujian Mahasiswa</h3>
    <p>Masukkan NIM mahasiswa untuk mengulang ujian dari awal.</p>

    <div class="admin-exam-controls">
        <input
            type="text"
            id="adminResetExamNim"
            placeholder="Masukkan NIM mahasiswa"
            maxlength="8"
        >

        <button type="button" id="adminResetExamBtn">
            Reset Ujian
        </button>
    </div>

    <div id="adminResetExamMessage"></div>

    <div id="adminExamSummary"></div>
    <div id="adminExamList"></div>
`;


    examAdminPanel.appendChild(examAdminContainer);
}

// Mengambil elemen tombol dan daftar
const adminRefreshExamBtn =
    document.getElementById("adminRefreshExamBtn");

const adminFinishExamBtn =
    document.getElementById("adminFinishExamBtn");

const adminExamSummary =
    document.getElementById("adminExamSummary");

const adminExamList =
    document.getElementById("adminExamList");

const adminResetExamNim =
    document.getElementById("adminResetExamNim");

const adminResetExamBtn =
    document.getElementById("adminResetExamBtn");

const adminResetExamMessage =
    document.getElementById("adminResetExamMessage");


// Format tanggal
function formatTanggalUjian(waktu) {
    if (!waktu) return "-";

    return new Date(waktu).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short"
    });
}


// Membuat elemen teks dengan aman
function buatTeksUjian(tag, isi, className = "") {
    const elemen = document.createElement(tag);
    elemen.textContent = isi;

    if (className) {
        elemen.className = className;
    }

    return elemen;
}


// Memuat data seluruh ujian
async function muatDataUjianAdmin() {
    if (currentUser?.app_metadata?.role !== "admin") {
        showToast("Akses hanya untuk Admin.");
        return;
    }

    adminExamList.textContent = "Memuat data ujian...";

    const { data, error } = await supabaseClient.rpc(
        "admin_list_vec_exam"
    );

    if (error) {
        console.error("Gagal memuat data ujian:", error);

        adminExamList.textContent =
            "Gagal memuat data ujian. Silakan coba lagi.";

        showToast("Gagal mengambil data ujian.");
        return;
    }

    if (!data?.success) {
        adminExamList.textContent =
            "Data ujian tidak dapat ditampilkan.";
        return;
    }

    const students = data.students || [];

    adminExamList.replaceChildren();

    const sudahMulai = students.filter(
        student => student.started_at
    ).length;

    const sedangBerlangsung = students.filter(
        student => student.status === "Berlangsung"
    ).length;

    const sudahDikumpulkan = students.filter(
        student => student.status === "Dikumpulkan"
    ).length;

    adminExamSummary.replaceChildren();

    adminExamSummary.append(
        buatTeksUjian("p", `Total mahasiswa: ${students.length}`),
        buatTeksUjian("p", `Sudah mulai: ${sudahMulai}`),
        buatTeksUjian("p", `Sedang berlangsung: ${sedangBerlangsung}`),
        buatTeksUjian("p", `Sudah dikumpulkan: ${sudahDikumpulkan}`)
    );

    if (students.length === 0) {
        adminExamList.textContent = "Belum ada mahasiswa aktif.";
        return;
    }

    const tabel = document.createElement("table");
    tabel.className = "admin-exam-table";

    const thead = document.createElement("thead");
    const header = document.createElement("tr");

    [
        "No", "NIM", "Nama", "Paket",
        "Mulai Ujian", "Status", "Nilai"
    ].forEach(judul => {
        header.appendChild(buatTeksUjian("th", judul));
    });

    thead.appendChild(header);

    const tbody = document.createElement("tbody");

    students.forEach((student, index) => {
        const baris = document.createElement("tr");

        let status = "Belum Mulai";

        if (student.status === "Berlangsung") {
            status = "Sedang Berlangsung";
        } else if (student.status === "Dikumpulkan") {
            status = "Dikumpulkan";
        }

        const nilai =
            student.result_released && student.score !== null
                ? student.score
                : "Belum Dirilis";

        [
            index + 1,
            student.nim,
            student.nama,
            student.package || "-",
            formatTanggalUjian(student.started_at),
            status,
            nilai
        ].forEach(isi => {
            baris.appendChild(
                buatTeksUjian("td", String(isi))
            );
        });

        tbody.appendChild(baris);
    });

    tabel.append(thead, tbody);
    adminExamList.appendChild(tabel);
}


// Tombol perbarui data
adminRefreshExamBtn?.addEventListener("click", () => {
    muatDataUjianAdmin();
});


// Tombol selesaikan semua ujian
adminFinishExamBtn?.addEventListener("click", async () => {
    if (currentUser?.app_metadata?.role !== "admin") {
        showToast("Akses hanya untuk Admin.");
        return;
    }

    const yakin = confirm(
        "Apakah kamu yakin ingin menyelesaikan semua ujian yang sudah dimulai? Hasil ujian akan dirilis."
    );

    if (!yakin) return;

    adminFinishExamBtn.disabled = true;
    adminFinishExamBtn.textContent = "Memproses...";

    const { error } = await supabaseClient.rpc(
        "admin_finish_vec_exam"
    );

    adminFinishExamBtn.disabled = false;
    adminFinishExamBtn.textContent = "Selesaikan Semua Ujian";

    if (error) {
        console.error("Gagal menyelesaikan ujian:", error);
        showToast("Gagal menyelesaikan ujian.");
        return;
    }

    showToast("Seluruh ujian berhasil diselesaikan.");

    await muatDataUjianAdmin();
});


// Tombol reset ujian mahasiswa
adminResetExamBtn?.addEventListener("click", async () => {

    if (currentUser?.app_metadata?.role !== "admin") {
        showToast("Akses hanya untuk Admin.");
        return;
    }

    const nim = adminResetExamNim.value.trim();

    if (!/^\d{8}$/.test(nim)) {
        adminResetExamMessage.textContent =
            "Masukkan NIM yang terdiri dari 8 angka.";
        return;
    }

    const yakin = confirm(
        `Apakah kamu yakin ingin mereset ujian mahasiswa ${nim}? Seluruh jawaban dan nilai sebelumnya akan dihapus.`
    );

    if (!yakin) return;

    adminResetExamBtn.disabled = true;
    adminResetExamBtn.textContent = "Mereset...";

    adminResetExamMessage.textContent = "";

    const { data, error } = await supabaseClient.rpc(
        "admin_reset_vec_exam",
        {
            p_nim: nim
        }
    );

    adminResetExamBtn.disabled = false;
    adminResetExamBtn.textContent = "Reset Ujian";

    if (error) {
        console.error("Gagal mereset ujian:", error);

        adminResetExamMessage.textContent =
            error.message || "Gagal mereset ujian mahasiswa.";

        return;
    }

    if (!data?.success) {
        adminResetExamMessage.textContent =
            "Reset ujian gagal dilakukan.";
        return;
    }

    adminResetExamMessage.textContent =
        `Ujian mahasiswa ${nim} berhasil direset.`;

    adminResetExamNim.value = "";

    showToast("Ujian mahasiswa berhasil direset.");

    await muatDataUjianAdmin();
});
