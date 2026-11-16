
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
// SINKRONISASI XP VEC
// ==========================================

async function sinkronkanXPVEC() {
     console.log("MULAI FUNGSI SINKRONISASI XP");

    const { data, error } = await supabaseClient.rpc(
        "sinkronkan_xp_vec"
    );

    if (error) {
        console.error("Gagal sinkronisasi XP:", error);
        return;
    }

    console.log("XP berhasil disinkronkan:", data);

    return data;
}


// ==========================================
// MEMUAT STATISTIK DAN VERIFIKASI MISI
// ==========================================
async function muatStatistikMisi(user) {
    const nim = user.user_metadata?.nim;
    if (!nim) return;

    // Periksa apakah Misi 01 sudah memenuhi syarat
    const { data: hasilMisi, error: errorMisi } =
        await supabaseClient.rpc("selesaikan_misi_vec");

    if (errorMisi) {
        console.error("Gagal memeriksa misi:", errorMisi);
        return;
    }

    console.log("Hasil verifikasi misi:", hasilMisi);

    // Ambil jumlah misi yang sudah diselesaikan
    const { count, error } = await supabaseClient
        .from("vec_mission_progress")
        .select("id", { count: "exact", head: true })
        .eq("nim", nim);

    if (error) {
        console.error("Gagal memuat statistik misi:", error);
        return;
    }

    const statsMissionCount =
        document.getElementById("statsMissionCount");

    if (statsMissionCount) {
        statsMissionCount.textContent = count ?? 0;
    }

    console.log("Jumlah misi selesai:", count ?? 0);
}



async function masukDashboard(user) {
    currentUser = user;
    showScreen("dashboard");

    await mulaiPemantauanUjian();

    await muatAvatarVEC(user);

const adminMenu = document.getElementById("adminMenu");

if (adminMenu) {
    const role = user.app_metadata?.role;
    const isAdmin = user.app_metadata?.is_admin === true;

    adminMenu.hidden = !(role === "admin" || isAdmin);
}

    // Atur akses panel pemantauan dan reset ujian
    const adminExamPanel = document.getElementById("adminExamPanel");

if (adminExamPanel) {
    const role = user.app_metadata?.role;
    const isAdmin = user.app_metadata?.is_admin === true;

    adminExamPanel.hidden = !(role === "admin" || isAdmin);
}

// Sinkronkan XP dari aktivitas belajar
await sinkronkanXPVEC();

// Periksa dan catat penyelesaian misi
await muatStatistikMisi(user);

    // Muat ulang seluruh data dashboard
    await Promise.all([
        muatProgressMahasiswa(user),
        muatHasilQuizMahasiswa(user),
        muatProgresMateri(user),
        muatProgresChallenges(user)
    ]);

    perbaruiProgressBelajar();
    perbaruiPencapaian();
    await muatStreakVEC();
    await muatNotifikasiVEC(user);

    console.log("Semua progres, XP, misi, dan badge berhasil diperbarui.");

    // Perbarui leaderboard
    muatDashboardLeaderboard();



// ==========================================
// MENGHITUNG TOTAL PROGRES BELAJAR
// ==========================================
function perbaruiProgressBelajar() {
    const ambilJumlah = (id) => {
        const el = document.getElementById(id);
        return Number(el?.textContent?.split("/")[0] || 0);
    };

    const materi = ambilJumlah("materiProgressCount");
    const challenge = ambilJumlah("challengeProgressCount");
    const quiz = ambilJumlah("quizProgressCount");

    const totalSelesai = materi + challenge + quiz;
    const progress = Math.min(100, Math.round((totalSelesai / 27) * 100));

    const progressPercent = document.getElementById("progressPercent");
    if (progressPercent) {
        progressPercent.textContent = `${progress}%`;
    }

    const progressDonut = document.getElementById("progressDonut");
    if (progressDonut) {
        progressDonut.style.setProperty("--progress", progress);
    }
}

    // Memuat progres secara terpisah
    muatProgressMahasiswa(user);
    muatHasilQuizMahasiswa(user);
    muatProgresMateri(user);
    muatDashboardLeaderboard();

    // Memuat progres Challenges tanpa mengganggu menu Admin
    muatProgresChallenges(user).catch(error => {
        console.error("Gagal memuat progres Challenges:", error);
    });

    const nama =
        user.user_metadata?.nama ||
        user.user_metadata?.nim ||
        "Mahasiswa";

    document.getElementById("userName").textContent = nama;
    
    // Mengatur identitas Profil mahasiswa dan dosen
    const isDosen =
        user.user_metadata?.account_type === "dosen";
    console.log("Role akun:", user.app_metadata?.role);
    console.log("Metadata akun:", user.user_metadata);

    const nomorIdentitas = isDosen
        ? user.user_metadata?.nip || user.user_metadata?.nim || "-"
        : user.user_metadata?.nim || "-";

    const jenisIdentitas = isDosen ? "NIP" : "NIM";

    const profileName = document.getElementById("profileName");
    const profileNIM = document.getElementById("profileNIM");
    const profileInfoName = document.getElementById("profileInfoName");

    const profileInfoNameLabel =
    document.getElementById("profileInfoNameLabel");

    const profileAccountStatus =
    document.getElementById("profileAccountStatus");

    if (profileAccountStatus) {
        profileAccountStatus.textContent = isDosen
            ? "Dosen Aktif"
            : "Mahasiswa Aktif";
    }

    if (profileInfoNameLabel) {
        profileInfoNameLabel.textContent = isDosen
            ? "Nama Dosen"
            : "Nama Mahasiswa";
    }

    const profileInfoNIM = document.getElementById("profileInfoNIM");
    const profileIdLabel = document.getElementById("profileIdLabel");

    const profileTitle = document.getElementById("profileTitle");
    const profileStatus = document.querySelector(".profile-status");

    if (profileTitle) {
        profileTitle.textContent = isDosen
            ? "Profil Dosen"
            : "Profil Mahasiswa";
    }

    if (profileStatus) {
        profileStatus.textContent = isDosen
            ? "● DOSEN"
            : "● MAHASISWA AKTIF";
    }

    if (profileName) profileName.textContent = nama;
    if (profileInfoName) profileInfoName.textContent = nama;

    if (profileNIM) {
        profileNIM.textContent = `${jenisIdentitas}: ${nomorIdentitas}`;
    }

    if (profileInfoNIM) {
        profileInfoNIM.textContent = nomorIdentitas;
    }

    if (profileIdLabel) {
        profileIdLabel.textContent = isDosen
            ? "Nomor Induk Pegawai (NIP)"
            : "Nomor Induk Mahasiswa (NIM)";
    }
}




// ==========================================
// MEMPERBARUI BADGE DASHBOARD DAN PENCAPAIAN
// ==========================================
function perbaruiPencapaian() {

    const ambilJumlah = (id) => {
        const el = document.getElementById(id);
        return Number(el?.textContent?.split("/")[0] || 0);
    };

    const materi = ambilJumlah("materiProgressCount");
    const challenge = ambilJumlah("challengeProgressCount");
    const quiz = ambilJumlah("quizProgressCount");

    // Aturan pembukaan badge
    const daftarBadge = [
        {
            id: "badgeBeginner",
            dashboardId: "dashboardBadgeBeginner",
            terbuka: materi >= 1
        },
        {
            id: "badgeTechExplorer",
            dashboardId: "dashboardBadgeTechExplorer",
            terbuka: challenge >= 1
        },
        {
            id: "badgeProblemSolver",
            dashboardId: "dashboardBadgeProblemSolver",
            terbuka: challenge >= 20
        },
        {
            id: "badgeVocationalExpert",
            dashboardId: "dashboardBadgeVocationalExpert",
            terbuka: materi >= 6 && challenge >= 20 && quiz >= 1
        }
    ];

    let jumlahTerbuka = 0;

    daftarBadge.forEach((badge) => {

        if (badge.terbuka) {
            jumlahTerbuka++;
        }

        // Perbarui badge halaman Pencapaian
        const halaman = document.getElementById(badge.id);

        // Perbarui badge Dashboard
        const dashboard = document.getElementById(badge.dashboardId);

        [halaman, dashboard].forEach((el) => {
            if (!el) return;

            const status = el.querySelector(".badge-status");

            if (badge.terbuka) {
                el.classList.remove("locked");
                el.classList.add("unlocked");

                if (status) {
                    status.textContent = "✓ Terbuka";
                }
            } else {
                el.classList.remove("unlocked");
                el.classList.add("locked");

                if (status) {
                    status.textContent = "Belum terbuka";
                }
            }
        });
    });

    // Perbarui jumlah badge di kedua halaman
    ["achievementBadgeCount", "dashboardBadgeCount"].forEach((id) => {
        const el = document.getElementById(id);

        if (el) {
            el.textContent = jumlahTerbuka;
        }
    });

    console.log("Jumlah badge terbuka:", jumlahTerbuka);
}




// MEMUAT PROGRES MATERI MAHASISWA
async function muatProgresMateri(user) {
    const nim = user.user_metadata?.nim;

    if (!nim) return;

    const { data, error } = await supabaseClient
        .from("vec_material_progress")
        .select("materi_id")
        .eq("nim", nim);

    if (error) {
        console.error("Gagal memuat progres materi:", error);
        return;
    }

    const jumlahSelesai = data.length;
    console.log("Jumlah materi selesai:", jumlahSelesai);
    console.log("Data materi:", data);

    const materiProgressCount =
        document.getElementById("materiProgressCount");

    if (materiProgressCount) {
        materiProgressCount.textContent = `${jumlahSelesai}/6`;
    }

    perbaruiProgressBelajar();
    perbaruiPencapaian();
}

// MEMUAT PROGRES CHALLENGES MAHASISWA
async function muatProgresChallenges(user) {
    const nim = user.user_metadata?.nim;

    if (!nim) return;

    const { data, error } = await supabaseClient
        .from("vec_exam_answers")
        .select("question_id")
        .eq("nim", nim);

    if (error) {
        console.error("Gagal memuat progres Challenges:", error);
        return;
    }

    const jumlahTerjawab = Math.min(data.length, 20);

    const challengeProgressCount =
        document.getElementById("challengeProgressCount");

    if (challengeProgressCount) {
        challengeProgressCount.textContent = `${jumlahTerjawab}/20`;
    }

    perbaruiProgressBelajar();
    perbaruiPencapaian();
}



// MEMUAT HASIL QUIZ MAHASISWA DARI SUPABASE
async function muatHasilQuizMahasiswa(user) {
    const nim = user.user_metadata?.nim;

    if (!nim) return;

    const { data, error } = await supabaseClient
        .from("vec_quiz_results")
        .select("id, nilai, completed_at")
        .eq("nim", nim)
        .not("completed_at", "is", null);

    if (error) {
        console.error("Gagal memuat hasil Quiz:", error);
        return;
    }

    console.log("Data hasil Quiz:", data);

    // Perbarui progres Quiz
    const quizProgressCount =
        document.getElementById("quizProgressCount");

    if (quizProgressCount) {
        quizProgressCount.textContent =
            data && data.length > 0 ? "1/1" : "0/1";
    }

    // Hitung nilai rata-rata seluruh Quiz
    const nilaiValid = (data || [])
        .map(item => Number(item.nilai))
        .filter(nilai => Number.isFinite(nilai));

    const rataRata = nilaiValid.length > 0
        ? Math.round(
            nilaiValid.reduce((total, nilai) => total + nilai, 0)
            / nilaiValid.length
        )
        : 0;

    const statsAverageScore =
        document.getElementById("statsAverageScore");

    if (statsAverageScore) {
        statsAverageScore.textContent =
            nilaiValid.length > 0 ? `${rataRata}%` : "--";
    }

    console.log("Nilai rata-rata Quiz:", rataRata);

    perbaruiProgressBelajar();
    perbaruiPencapaian();
}



// ==========================================
// MENGHITUNG TOTAL PROGRES BELAJAR
// ==========================================
function perbaruiProgressBelajar() {
    const ambilJumlah = (id) => {
        const el = document.getElementById(id);
        return Number(el?.textContent?.split("/")[0] || 0);
    };

    const materi = ambilJumlah("materiProgressCount");
    const challenge = ambilJumlah("challengeProgressCount");
    const quiz = ambilJumlah("quizProgressCount");

    const totalSelesai = materi + challenge + quiz;
    const progress = Math.min(
        100,
        Math.round((totalSelesai / 27) * 100)
    );

    const progressPercent = document.getElementById("progressPercent");
    if (progressPercent) {
        progressPercent.textContent = `${progress}%`;
    }

    const progressDonut = document.getElementById("progressDonut");
    if (progressDonut) {
        progressDonut.style.setProperty("--progress", progress);
    }

    console.log("Progres VEC:", materi, challenge, quiz, progress + "%");
}


// MEMUAT PROGRESS MAHASISWA DARI SUPABASE
async function muatProgressMahasiswa(user) {
    const nim = user.user_metadata?.nim;

    if (!nim) return;

    const { data, error } = await supabaseClient
        .from("vec_student_progress")
        .select("total_xp, level")
        .eq("nim", nim)
        .maybeSingle();

    if (error) {
        console.error("Gagal memuat progress:", error);
        showToast("Data perkembangan gagal dimuat.");
        return;
    }

    if (!data) {
        showToast("Data perkembangan mahasiswa belum tersedia.");
        return;
    }

    const xp = Number(data.total_xp);
    const level = Number(data.level);

    // Perbarui Level
    ["levelNumber", "achievementLevel", "profileLevel"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = level;
        });

    // Perbarui Total XP
    ["totalXp", "achievementXP", "profileXP"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = xp.toLocaleString("id-ID");
        });

    // Perbarui XP dalam level saat ini
    const xpDalamLevel = xp % 100;
    const levelXp = document.getElementById("levelXp");

    if (levelXp) {
        levelXp.textContent = xpDalamLevel;
    }

    const xpProgress = xpDalamLevel;
    const levelProgress = document.getElementById("levelProgress");

    if (levelProgress) {
        levelProgress.style.width = `${xpProgress}%`;
    }

    // Progress belajar dihitung dari 27 aktivitas
    perbaruiProgressBelajar();
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
// NAVIGASI PENDAFTARAN EMAIL PEMULIHAN
// ==========================================

// Buka halaman pendaftaran email
document.getElementById("registerRecoveryEmailBtn").addEventListener("click", () => {
    document.getElementById("loginScreen").hidden = true;
    document.getElementById("resetPasswordScreen").hidden = true;
    document.getElementById("registerRecoveryEmailScreen").hidden = false;
});

// Kembali ke halaman login
document.getElementById("backFromRecoveryBtn").addEventListener("click", () => {
    document.getElementById("registerRecoveryEmailScreen").hidden = true;
    document.getElementById("loginScreen").hidden = false;
});


// ==========================================
// RESET PASSWORD MANDIRI MELALUI EMAIL OTP
// ==========================================

// Buka halaman reset password
document.getElementById("forgotPasswordBtn").addEventListener("click", () => {
    document.getElementById("loginScreen").hidden = true;
    document.getElementById("changePasswordScreen").hidden = true;
    document.getElementById("dashboardScreen").hidden = true;
    document.getElementById("resetPasswordScreen").hidden = false;
});

// Kembali ke halaman login
document.getElementById("backToLoginBtn").addEventListener("click", () => {
    document.getElementById("resetPasswordScreen").hidden = true;
    document.getElementById("loginScreen").hidden = false;
});

// Kirim OTP ke email pemulihan
document.getElementById("sendResetOtpForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nim = document.getElementById("resetNim").value.trim();
    const message = document.getElementById("sendOtpMessage");
    const button = event.currentTarget.querySelector("button[type='submit']");

    message.textContent = "";
    button.disabled = true;
    button.textContent = "Mengirim OTP...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "send-password-reset-otp",
            {
                body: { nim }
            }
        );

if (error) {
    let detail = null;

    try {
        detail = await error.context.clone().json();
    } catch (e) {
        detail = { error: error.message };
    }

    console.error("DETAIL SERVER OTP:", detail);

    throw new Error(
        detail?.error ||
        detail?.message ||
        error.message
    );
}

        document.getElementById("verifyResetOtpForm").hidden = false;
        document.getElementById("resetNim").readOnly = true;

    } catch (error) {
        console.error("Gagal mengirim OTP:", error);
        message.style.color = "#ffb5b5";
        message.textContent =
            error.message || "Gagal mengirim OTP. Silakan coba lagi.";
    } finally {
        button.disabled = false;
        button.textContent = "Kirim Kode OTP";
    }
});

// Verifikasi OTP dan ganti password
document.getElementById("verifyResetOtpForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nim = document.getElementById("resetNim").value.trim();
    const otp = document.getElementById("resetOtp").value.trim();
    const newPassword = document.getElementById("resetNewPassword").value;
    const confirmPassword = document.getElementById("resetConfirmPassword").value;

    const message = document.getElementById("verifyOtpMessage");
    const button = event.currentTarget.querySelector("button[type='submit']");

    message.textContent = "";

    if (newPassword.length < 8) {
        message.textContent = "Password minimal 8 karakter.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.textContent = "Konfirmasi password tidak sama.";
        return;
    }

    button.disabled = true;
    button.textContent = "Memverifikasi...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "verify-password-reset-otp",
            {
                body: {
                    nim,
                    otp,
                    newPassword
                }
            }
        );

        if (error) throw error;

        if (!data?.success) {
            throw new Error(data?.error || "Verifikasi gagal.");
        }

        message.style.color = "#59e6b5";
        message.textContent = "Password berhasil diganti. Akun sudah terbuka.";

        document.getElementById("resetPasswordScreen").hidden = true;
        document.getElementById("loginScreen").hidden = false;

        document.getElementById("loginNim").value = nim;
        document.getElementById("loginPassword").value = "";
        document.getElementById("loginMessage").textContent =
            "Password berhasil diganti. Silakan login kembali.";
        document.getElementById("loginMessage").style.color = "#59e6b5";

        document.getElementById("sendResetOtpForm").reset();
        document.getElementById("verifyResetOtpForm").reset();
        document.getElementById("verifyResetOtpForm").hidden = true;
        document.getElementById("resetNim").readOnly = false;

    } catch (error) {
        console.error("Gagal verifikasi OTP:", error);
        message.style.color = "#ffb5b5";
        message.textContent =
            error.message || "OTP salah atau gagal mengganti password.";
    } finally {
        button.disabled = false;
        button.textContent = "Verifikasi dan Ganti Password";
    }
});


// ==========================================
// PENDAFTARAN EMAIL PEMULIHAN
// ==========================================

// Kirim OTP ke email baru
document.getElementById("registerRecoveryEmailForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nim = document.getElementById("recoveryNim").value.trim();
    const password = document.getElementById("recoveryPassword").value;
    const email = document.getElementById("recoveryEmail").value.trim();

    const message = document.getElementById("registerRecoveryMessage");
    const button = event.currentTarget.querySelector("button[type='submit']");

    message.textContent = "";
    button.disabled = true;
    button.textContent = "Mengirim OTP...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "send-recovery-email-otp",
            {
                body: { nim, password, email }
            }
        );

        if (error) throw error;
        if (!data?.success) {
            throw new Error(data?.error || "Gagal mengirim OTP.");
        }

        message.style.color = "#59e6b5";
        message.textContent = data.message;

        document.getElementById("verifyRecoveryEmailForm").hidden = false;
        document.getElementById("recoveryNim").readOnly = true;
        document.getElementById("recoveryEmail").readOnly = true;
        document.getElementById("recoveryPassword").readOnly = true;

    } catch (error) {
        console.error("Gagal mengirim OTP email pemulihan:", error);
        message.style.color = "#ffb5b5";
        message.textContent = error.message || "Gagal mengirim OTP.";
    } finally {
        button.disabled = false;
        button.textContent = "Kirim Kode OTP";
    }
});

// Verifikasi OTP email pemulihan
document.getElementById("verifyRecoveryEmailForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nim = document.getElementById("recoveryNim").value.trim();
    const otp = document.getElementById("recoveryOtp").value.trim();

    const message = document.getElementById("verifyRecoveryMessage");
    const button = event.currentTarget.querySelector("button[type='submit']");

    message.textContent = "";
    button.disabled = true;
    button.textContent = "Memverifikasi...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "verify-recovery-email-otp",
            {
                body: { nim, otp }
            }
        );

        if (error) throw error;
        if (!data?.success) {
            throw new Error(data?.error || "Verifikasi gagal.");
        }

        message.style.color = "#59e6b5";
        message.textContent = data.message;

        document.getElementById("registerRecoveryEmailForm").reset();
        document.getElementById("verifyRecoveryEmailForm").reset();

        document.getElementById("verifyRecoveryEmailForm").hidden = true;
        document.getElementById("recoveryNim").readOnly = false;
        document.getElementById("recoveryEmail").readOnly = false;
        document.getElementById("recoveryPassword").readOnly = false;

} catch (error) {
    console.error("Verifikasi email pemulihan gagal:", error);

    let errorMessage = "OTP salah atau gagal diverifikasi.";

    try {
        const response = error.context;
        if (response) {
            const result = await response.json();
            errorMessage = result.error || errorMessage;
        }
    } catch (parseError) {
        console.error("Gagal membaca detail error:", parseError);
    }

    message.style.color = "#ffb5b5";
    message.textContent = errorMessage;

    } finally {
        button.disabled = false;
        button.textContent = "Verifikasi Email";
    }
});


// ==========================================
// NAVIGASI DASHBOARD
// ==========================================

const dashboardHomeContent = document.getElementById("dashboardHomeContent");

const daftarHalaman = [
    "dashboardHomeContent",
    "materiPage",
    "challengesPage",
    "quizPage",
    "studiKasusPage",
    "simulasiPage",
    "leaderboardPage",
    "racingPage",
    "pencapaianPage",
    "adminScreen",
    "profilPage"
];

document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {

        // Hapus status aktif menu
        document.querySelectorAll(".nav-link").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const page = button.dataset.page;

        // Sembunyikan semua halaman
        daftarHalaman.forEach((id) => {
            const halaman = document.getElementById(id);
            if (halaman) halaman.hidden = true;
        });

        // Tampilkan halaman tujuan
        const halamanTujuan = {
        "Dashboard": "dashboardHomeContent",
        "Materi": "materiPage",
        "Challenges": "challengesPage",
        "Quiz": "quizPage",
        "Studi Kasus": "studiKasusPage",
        "Simulasi": "simulasiPage",
        "Leaderboard": "leaderboardPage",
        "VEC Racing": "racingPage",
        "Pencapaian": "pencapaianPage",
        "Profil": "profilPage",
        "Admin VEC": "adminScreen"
        };

        const targetId = halamanTujuan[page];
        const target = targetId
            ? document.getElementById(targetId)
            : null;

        if (target) {
            target.hidden = false;

            if (page === "Admin VEC") {
    showScreen("admin");
    return;
}

            if (page === "Leaderboard") {
                muatLeaderboardVEC();
            }

            if (page === "Dashboard") {
                showToast("Kamu sedang berada di Dashboard VEC.");
            }
        } else {
            showToast(`Halaman ${page} sedang dalam tahap pengembangan.`);
        }

        document.getElementById("sidebar")?.classList.remove("open");
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
        judul: "Konsep Dasar Pendidikan Teknik Elektronika",
        ringkasan: "Mengenal pengertian, tujuan, fungsi, dan karakteristik pendidikan teknik elektronika.",
        tujuan: [
            "Memahami pengertian pendidikan teknik elektronika.",
            "Menjelaskan tujuan dan fungsi pendidikan teknik elektronika.",
            "Mengidentifikasi karakteristik pendidikan teknik elektronika."
        ],
        isi: `
            <h3>A. Pengertian Pendidikan Teknik Elektronika</h3>
            <p>
                Pendidikan teknik elektronika merupakan pendidikan yang berfokus pada
                penguasaan keterampilan dan keahlian tertentu agar peserta
                didik memiliki kemampuan untuk memasuki dunia kerja.
                Pembelajaran menggabungkan pengetahuan teori dengan
                kegiatan praktik sesuai bidang keahlian.
            </p>

            <h3>B. Tujuan Pendidikan Teknik Elektronika</h3>
            <p>
                Pendidikan teknik elektronika bertujuan menghasilkan lulusan yang
                kompeten, terampil, mandiri, dan mampu menyesuaikan diri
                dengan perkembangan teknologi serta kebutuhan dunia kerja.
            </p>

            <h3>C. Fungsi Pendidikan Teknik Elektronika</h3>
            <ul>
                <li>Mempersiapkan tenaga kerja yang memiliki keterampilan.</li>
                <li>Meningkatkan kompetensi dan produktivitas masyarakat.</li>
                <li>Mendukung kebutuhan tenaga kerja di berbagai sektor industri.</li>
                <li>Mendorong kemampuan berwirausaha.</li>
            </ul>

            <h3>D. Karakteristik Pendidikan Teknik Elektronika</h3>
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
        rangkuman: "Pendidikan teknik elektronika adalah pendidikan yang menekankan penguasaan kompetensi dan keterampilan praktis untuk mempersiapkan peserta didik menghadapi dunia kerja."
    },
    {
        judul: "Kurikulum Pendidikan Teknik Elektronika",
        ringkasan: "Memahami struktur kurikulum, capaian pembelajaran, dan kompetensi lulusan.",
        tujuan: [
            "Memahami pengertian kurikulum pendidikan teknik elektronika.",
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

            <h3>B. Kurikulum dalam Pendidikan Teknik Elektronika</h3>
            <p>
                Kurikulum pendidikan teknik elektronika dirancang agar peserta didik
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
                Lulusan pendidikan teknik elektronika diharapkan memiliki kompetensi
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
        rangkuman: "Kurikulum pendidikan teknik elektronika menjadi pedoman pembelajaran untuk membentuk lulusan yang memiliki pengetahuan, keterampilan, dan sikap kerja sesuai kebutuhan bidang keahlian."
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
        judul: "Model Pembelajaran Pendidikan Teknik Elektronika",
        ringkasan: "Mempelajari model pembelajaran yang mendukung keterampilan dan pemecahan masalah.",
        tujuan: [
            "Mengenal berbagai model pembelajaran teknik elektronika.",
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
        rangkuman: "Model pembelajaran teknik elektronika menekankan pengalaman langsung, pemecahan masalah, penyelesaian proyek, dan pencapaian kompetensi yang dapat diterapkan dalam pekerjaan."
    },
    {
        judul: "Penilaian Kompetensi",
        ringkasan: "Memahami penilaian pengetahuan, sikap, dan keterampilan peserta didik.",
        tujuan: [
            "Memahami pengertian penilaian kompetensi.",
            "Membedakan aspek kognitif, afektif, dan psikomotorik.",
            "Mengetahui teknik penilaian dalam pendidikan teknik elektronika."
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
        rangkuman: "Penilaian kompetensi dalam pendidikan teknik elektronika mencakup pengetahuan, sikap, dan keterampilan agar kemampuan peserta didik dapat dinilai secara menyeluruh."
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

        <div class="materi-selesai-area">
            <button type="button" id="tandaiMateriSelesai" class="btn-materi-selesai">
                ✓ Tandai Materi Selesai
            </button>
        </div>
    `;

    const tombolSelesai = document.getElementById("tandaiMateriSelesai");

tombolSelesai.addEventListener("click", async () => {
    const nim = currentUser?.user_metadata?.nim;

    if (!nim) {
        showToast("Identitas mahasiswa tidak ditemukan.");
        return;
    }

    tombolSelesai.disabled = true;
    tombolSelesai.textContent = "Menyimpan...";

    const { error } = await supabaseClient
        .from("vec_material_progress")
        .upsert(
            {
                nim: nim,
                materi_id: index + 1
            },
            {
                onConflict: "nim,materi_id",
                ignoreDuplicates: true
            }
        );

    if (error) {
        console.error("Gagal menyimpan materi:", error);
        tombolSelesai.disabled = false;
        tombolSelesai.textContent = "✓ Tandai Materi Selesai";
        showToast("Progres materi gagal disimpan.");
        return;
    }

    tombolSelesai.textContent = "✓ Materi Selesai";
    tombolSelesai.classList.add("selesai");
    showToast("Progres materi berhasil disimpan!");
    });

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
        judul: "Penerapan Teaching Factory di Sekolah Teknik Elektronika",
        kategori: "Teaching Factory",
        bacaan: [
            "SMK Teknologi Mandiri berencana menerapkan Teaching Factory (TEFA) untuk meningkatkan keterampilan siswa. Melalui program ini, siswa diharapkan dapat belajar dengan suasana kerja yang menyerupai dunia industri.",
            "Sekolah mulai membuka unit produksi sederhana yang menerima pesanan pembuatan dan perbaikan perangkat elektronika. Siswa dilibatkan dalam proses perencanaan, pengerjaan, pengujian, hingga pemeriksaan kualitas produk.",
            "Namun, pelaksanaan program belum berjalan optimal. Beberapa guru belum terbiasa dengan sistem pembelajaran berbasis produksi. Peralatan praktik juga belum sepenuhnya memenuhi standar industri. Selain itu, pesanan yang diterima masih sedikit sehingga kegiatan produksi belum berjalan secara konsisten."
        ],
        pertanyaan: [
            "Apa tujuan utama penerapan Teaching Factory dalam pendidikan teknik elektronika?",
            "Apa saja kendala yang dihadapi sekolah dalam menerapkan Teaching Factory?",
            "Bagaimana peran guru dalam mendukung keberhasilan program Teaching Factory?",
            "Apa langkah yang dapat dilakukan agar Teaching Factory berjalan lebih efektif?"
        ]
    },
    {
        judul: "Kurikulum yang Tidak Sesuai Perkembangan Teknologi",
        kategori: "Kurikulum Teknik Elektronika",
        bacaan: [
            "Sebuah lembaga pendidikan teknik elektronika masih menggunakan kurikulum yang disusun beberapa tahun lalu. Materi pembelajaran lebih banyak membahas teknologi konvensional, sedangkan dunia industri telah menggunakan sistem otomasi, Internet of Things (IoT), dan teknologi digital.",
            "Mahasiswa mulai mengalami kesulitan ketika mengikuti kegiatan magang karena belum memahami teknologi yang digunakan perusahaan. Mereka membutuhkan waktu lebih lama untuk beradaptasi dengan peralatan dan sistem kerja yang baru.",
            "Pihak lembaga menyadari bahwa kurikulum perlu diperbarui. Namun, perubahan tersebut membutuhkan koordinasi antara pengelola pendidikan, guru atau dosen, serta pihak industri agar materi pembelajaran tetap relevan dengan kebutuhan pekerjaan."
        ],
        pertanyaan: [
            "Mengapa kurikulum pendidikan teknik elektronika perlu mengikuti perkembangan teknologi?",
            "Apa dampak penggunaan kurikulum yang sudah tidak relevan bagi mahasiswa?",
            "Bagaimana cara melibatkan industri dalam pengembangan kurikulum?",
            "Materi atau kompetensi teknologi apa yang perlu ditambahkan dalam pembelajaran Teknik Elektronika?"
        ]
    },
    {
        judul: "Keterbatasan Peralatan Praktik di Laboratorium",
        kategori: "Sarana dan Prasarana",
        bacaan: [
            "Sebuah sekolah teknik elektronika memiliki jumlah siswa yang cukup banyak, tetapi fasilitas laboratorium elektronika masih terbatas. Beberapa alat ukur, seperti multimeter dan osiloskop, harus digunakan secara bergantian oleh banyak siswa.",
            "Kondisi tersebut menyebabkan waktu praktik menjadi kurang efektif. Sebagian siswa hanya mengamati temannya melakukan pengukuran tanpa mendapatkan kesempatan yang cukup untuk mencoba secara langsung.",
            "Pihak sekolah memiliki keterbatasan anggaran untuk membeli peralatan baru. Oleh karena itu, sekolah perlu mengatur jadwal penggunaan laboratorium, melakukan perawatan peralatan, serta mencari alternatif kerja sama dengan industri atau lembaga lain."
        ],
        pertanyaan: [
            "Apa masalah utama yang terjadi dalam kegiatan praktik tersebut?",
            "Bagaimana keterbatasan peralatan dapat memengaruhi keterampilan siswa?",
            "Apa alternatif yang dapat dilakukan sekolah untuk mengatasi keterbatasan fasilitas?",
            "Mengapa kegiatan praktik langsung penting dalam pendidikan teknik elektronika?"
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
            "Mengapa keterampilan kerja sama penting bagi lulusan pendidikan teknik elektronika?",
            "Bagaimana cara membangun komunikasi dan tanggung jawab dalam sebuah tim?",
            "Bagaimana dosen dapat menilai keterampilan kerja sama mahasiswa?"
        ]
    },
    {
        judul: "Sertifikasi Kompetensi sebagai Bekal Memasuki Dunia Kerja",
        kategori: "Sertifikasi Kompetensi",
        bacaan: [
            "Seorang lulusan pendidikan teknik elektronika memiliki kemampuan yang cukup baik dalam merakit dan memperbaiki perangkat elektronika. Selama mengikuti pendidikan, ia telah melakukan berbagai kegiatan praktik dan menyelesaikan beberapa proyek.",
            "Ketika melamar pekerjaan, perusahaan meminta bukti kompetensi yang dapat menunjukkan bahwa pelamar telah memenuhi standar kemampuan tertentu. Lulusan tersebut belum memiliki sertifikat kompetensi sehingga harus mengikuti proses pengujian untuk membuktikan keterampilannya.",
            "Sekolah kemudian mempertimbangkan untuk bekerja sama dengan Lembaga Sertifikasi Profesi (LSP) agar siswa dapat mengikuti uji kompetensi sesuai bidang keahliannya. Dengan demikian, lulusan tidak hanya memiliki ijazah, tetapi juga bukti kemampuan yang diakui sesuai skema sertifikasi yang diikuti."
        ],
        pertanyaan: [
            "Apa fungsi sertifikasi kompetensi bagi lulusan pendidikan teknik elektronika?",
            "Mengapa perusahaan membutuhkan bukti kompetensi calon tenaga kerja?",
            "Bagaimana peran Lembaga Sertifikasi Profesi dalam pendidikan teknik elektronika?",
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
// NOTIFIKASI VEC
// ==========================================

const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");

if (notificationBtn && notificationPanel) {

    notificationBtn.addEventListener("click", function (event) {
        event.stopPropagation();

        notificationPanel.hidden = !notificationPanel.hidden;
    });

    notificationPanel.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    document.addEventListener("click", function () {
        notificationPanel.hidden = true;
    });
}


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
const role = currentUser?.app_metadata?.role;
const isAdmin = currentUser?.app_metadata?.is_admin === true;

if (!currentUser || (role !== "admin" && !isAdmin)) {
    adminMessage.textContent = "Akses khusus Admin VEC.";
    return;
}

    const nim = adminSearchNim.value.trim();

    if (!/^\d{8,20}$/.test(nim)) {
    adminMessage.textContent = "Masukkan NIM/NIP yang terdiri dari 8–20 angka.";
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
      if (
        !currentUser ||
        (
            currentUser.app_metadata?.role !== "admin" &&
            currentUser.app_metadata?.is_admin !== true
        )
    ) {
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

        const accounts = data.students;

 
const table = document.createElement("table");
table.className = "admin-students-table";

table.innerHTML = `
    <thead>
        <tr>
            <th>No.</th>
            <th>NIM / NIP</th>
            <th>Nama</th>
            <th>Email Pemulihan</th>
            <th>Status</th>
            <th>Aksi</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

const tbody = table.querySelector("tbody");

accounts.forEach((account, index) => {
    const row = document.createElement("tr");

    const values = [
        index + 1,
        account.nim,
        account.nama,
        account.recovery_email || "Belum terdaftar",
        account.recovery_email ? "Terdaftar" : "Belum terdaftar"
    ];

    values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const resetButton = document.createElement("button");

    resetButton.type = "button";
    resetButton.textContent = "Reset Email";
    resetButton.disabled = !account.recovery_email;

    resetButton.addEventListener("click", async () => {
        const yakin = confirm(
            `Reset email pemulihan akun ${account.nama} (${account.nim})?`
        );

        if (!yakin) return;

        resetButton.disabled = true;
        resetButton.textContent = "Mereset...";

        try {
            const { data, error } =
                await supabaseClient.functions.invoke(
                    "admin-reset-recovery-email",
                    {
                        body: { nim: account.nim }
                    }
                );

            if (error) throw error;

            if (!data?.success) {
                throw new Error(data?.error || "Gagal mereset email.");
            }

            alert(data.message);

            await muatEmailPemulihanAdmin(
                adminRecoverySearch.value.trim()
            );

        } catch (error) {
        console.error("Gagal memuat daftar mahasiswa:", error);
        adminMessage.textContent =
        error.message || "Gagal mengambil daftar mahasiswa.";

            resetButton.disabled = false;
            resetButton.textContent = "Reset Email";
        }
    });

    actionCell.appendChild(resetButton);
    row.appendChild(actionCell);

    tbody.appendChild(row);
});

const heading = document.createElement("h3");
heading.textContent = `Daftar Email Pemulihan (${accounts.length})`;

adminStudentsList.replaceChildren(heading, table);
adminMessage.textContent =
    "Data mahasiswa/dosen berhasil dimuat.";

    } catch (error) {
        console.error("Gagal memuat email pemulihan:", error);
        adminRecoveryMessage.textContent =
            error.message || "Gagal mengambil data email pemulihan.";
    }
}

if (adminLoadRecoveryEmailsBtn) {
    adminLoadRecoveryEmailsBtn.addEventListener("click", () => {
        muatEmailPemulihanAdmin();
    });
}

if (adminRecoverySearchBtn) {
    adminRecoverySearchBtn.addEventListener("click", () => {
        muatEmailPemulihanAdmin(adminRecoverySearch.value.trim());
    });
}

// ==========================================
// TAMBAH AKUN DOSEN ADMIN VEC
// ==========================================

const addLecturerBtn = document.getElementById("addLecturerBtn");
const lecturerName = document.getElementById("lecturerName");
const lecturerNip = document.getElementById("lecturerNip");
const lecturerMessage = document.getElementById("lecturerMessage");

if (addLecturerBtn) {
    addLecturerBtn.addEventListener("click", tambahAkunDosen);
}

async function tambahAkunDosen() {
   

    if (!currentUser || (role !== "admin" && isAdmin !== true)) {
        lecturerMessage.textContent = "Akses khusus Admin VEC.";
        return;
    }

    const nama = lecturerName.value.trim();
    const nip = lecturerNip.value.replace(/\s/g, "");

    if (!nama) {
        lecturerMessage.textContent = "Nama dosen wajib diisi.";
        return;
    }

    if (!/^\d{18}$/.test(nip)) {
        lecturerMessage.textContent = "NIP harus terdiri dari 18 angka.";
        return;
    }

const isAdmin = document.getElementById("lecturerAccess").value === "true";

const hakAkses = isAdmin
    ? "Dosen + Admin VEC"
    : "Dosen Biasa";

    const konfirmasi = confirm(
        
        `Tambahkan akun dosen berikut?\n\nNama: ${nama}\nNIP: ${nip}\nHak akses: ${hakAkses}`
    );

    if (!konfirmasi) return;

    addLecturerBtn.disabled = true;
    addLecturerBtn.textContent = "Membuat Akun...";
    lecturerMessage.textContent = "";

    try {
        const { data, error } =
            await supabaseClient.functions.invoke("admin-add-leaturer", {
 body: {
    nama: nama,
    nip: nip,
    is_admin: document.getElementById("lecturerAccess").value === "true"
}
            });

        if (error) throw error;

        if (!data?.success) {
            throw new Error(data?.error || "Gagal membuat akun dosen.");
        }

        lecturerMessage.textContent =
            "Akun dosen berhasil dibuat. Password awal menggunakan NIP.";

        lecturerName.value = "";
        lecturerNip.value = "";

        alert(
            `AKUN DOSEN BERHASIL DIBUAT\n\n` +
            `Nama: ${data.dosen.nama}\n` +
            `NIP: ${data.dosen.nip}\n` +
            `Password awal: ${data.dosen.password_awal}\n` +
`Hak akses: ${hakAkses}\n\n` +
            `Dosen wajib mengganti password saat login pertama.`
        );

    } catch (error) {
        console.error("Tambah akun dosen gagal:", error);

        lecturerMessage.textContent =
            error.message || "Gagal membuat akun dosen.";

    } finally {
        addLecturerBtn.disabled = false;
        addLecturerBtn.textContent = "Tambahkan Akun Dosen";
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

            // Tampilkan kembali halaman utama Dashboard
            const dashboardHome = document.getElementById("dashboardHomeContent");

            if (dashboardHome) {
                dashboardHome.hidden = false;
            }

            // Aktifkan menu Dashboard
            document.querySelectorAll(".nav-link").forEach(item => {
                item.classList.remove("active");
            });

            const dashboardMenu = document.querySelector('[data-page="Dashboard"]');

            if (dashboardMenu) {
                dashboardMenu.classList.add("active");
            }
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

    // Perbarui progres Challenges di Dashboard
    await muatProgresChallenges(currentUser);
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
    const { data: { session }, error: sessionError } =
        await supabaseClient.auth.getSession();

    console.log("CEK SESI SEBELUM RPC:", {
        adaSession: !!session,
        userId: session?.user?.id,
        nim: session?.user?.user_metadata?.nim,
        sessionError
    });

    const { data, error } = await supabaseClient.rpc(
        "get_vec_exam_state"
    );

    if (error) {
        console.error("Gagal mengambil status ujian:", error);
        showToast("Gagal memuat status ujian.");
        return;
    }

    // Bagian kode selanjutnya tetap seperti semula.

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




// ==========================================
// PEMANTAUAN UJIAN - ADMIN VEC
// ==========================================

// Mengambil panel Admin
const examAdminScreen = document.getElementById("adminScreen");
const examAdminPanel = examAdminScreen?.querySelector(".panel");

// Membuat area pemantauan
let examAdminContainer = document.getElementById("adminExamPanel");

if (!examAdminContainer) {
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

    <button type="button" id="adminResetAllExamsBtn">
        Reset Semua Ujian Mahasiswa
    </button>
</div>

    <div id="adminResetAllExamsMessage"></div>

    <div id="adminResetExamMessage"></div>

    <div id="adminExamSummary"></div>
    <div id="adminExamList"></div>
`;


    const challengesContainer = document.querySelector(
        "#challengesPage .challenges-container"
    );

    if (challengesContainer) {
        challengesContainer.prepend(examAdminContainer);
    }
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


// ==========================================
// LEADERBOARD VEC
// ==========================================

async function muatLeaderboardVEC() {
    const topContainer = document.getElementById("leaderboardTop");
    const listContainer = document.getElementById("leaderboardList");
    const messageContainer = document.getElementById("leaderboardMessage");

    if (!topContainer || !listContainer) return;

    topContainer.innerHTML = "Memuat leaderboard...";
    listContainer.innerHTML = `
        <tr><td colspan="4">Memuat data...</td></tr>
    `;

    if (messageContainer) messageContainer.textContent = "";

    try {
    const { data, error } = await supabaseClient.rpc(
        "get_vec_xp_leaderboard"
    );

        if (error) throw error;

        if (!data || data.length === 0) {
            topContainer.innerHTML = `
                <p>Belum ada mahasiswa dengan hasil ujian yang dirilis.</p>
            `;

            listContainer.innerHTML = `
                <tr>
                    <td colspan="4">
                        Belum ada data leaderboard.
                    </td>
                </tr>
            `;
            return;
        }

        // TIGA PERINGKAT TERATAS
        const medali = ["🥇", "🥈", "🥉"];

        topContainer.innerHTML = data.slice(0, 3).map((item, index) => `
            <div class="leaderboard-rank-card">
                <div class="leaderboard-medal">
                    ${medali[index]}
                </div>
                <h3>${escapeLeaderboardHTML(item.nama)}</h3>
                <p>${escapeLeaderboardHTML(item.nim)}</p>
                <strong>${Number(item.skor).toLocaleString("id-ID")}</strong>
                <small>EXP</small>
            </div>
        `).join("");

        // SELURUH DAFTAR PERINGKAT
        listContainer.innerHTML = data.map(item => `
            <tr>
                <td>${item.peringkat}</td>
                <td>${escapeLeaderboardHTML(item.nama)}</td>
                <td>${escapeLeaderboardHTML(item.nim)}</td>
                <td><strong>${item.skor}</strong></td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Leaderboard gagal dimuat:", error);

        topContainer.innerHTML = "Gagal memuat leaderboard.";

        listContainer.innerHTML = `
            <tr>
                <td colspan="4">
                    Terjadi kesalahan saat mengambil data.
                </td>
            </tr>
        `;
    }
}


    // MEMUAT 3 JUARA LEADERBOARD DI DASHBOARD
    async function muatDashboardLeaderboard() {
        const container = document.getElementById("dashboardLeaderboardList");

        if (!container) return;

        try {
            const { data, error } = await supabaseClient.rpc(
                "get_vec_xp_leaderboard"
            );

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = `
                    <li>Belum ada data peringkat.</li>
                `;
                return;
            }

            const medali = ["gold-rank", "silver-rank", "bronze-rank"];
            const avatar = ["👨🏻‍🎓", "👩🏻‍🎓", "🧑🏻‍🎓"];

            container.innerHTML = data.slice(0, 3).map((item, index) => `
                <li>
                    <span class="rank ${medali[index]}">${index + 1}</span>
                    <span class="mini-avatar">${avatar[index]}</span>
                    <span class="leader-name">
                        ${escapeLeaderboardHTML(item.nama)}
                    </span>
                    <b>${Number(item.skor).toLocaleString("id-ID")} XP</b>
                </li>
            `).join("");

        } catch (error) {
            console.error("Gagal memuat leaderboard Dashboard:", error);

            container.innerHTML = `
                <li>Gagal memuat peringkat.</li>
            `;
        }
    }


// Mencegah teks dari database dianggap sebagai HTML
function escapeLeaderboardHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Muat ketika menu Leaderboard dibuka
document.querySelector('[data-page="Leaderboard"]')
    ?.addEventListener("click", muatLeaderboardVEC);

// Tombol perbarui
document.getElementById("refreshLeaderboardBtn")
    ?.addEventListener("click", muatLeaderboardVEC);

// ==========================================
// SIMULASI HUKUM KIRCHHOFF I (KCL)
// ==========================================

const tombolKCL = document.getElementById("hitungKCL");

if (tombolKCL) {
    tombolKCL.addEventListener("click", function () {

        const arusMasuk = Number(
            document.getElementById("arusMasuk").value
        );

        const arusKeluar1 = Number(
            document.getElementById("arusKeluar1").value
        );

        const arusKeluar2 = Number(
            document.getElementById("arusKeluar2").value
        );

        const hasilKCL = document.getElementById("hasilKCL");

        const semuaInput = [
            document.getElementById("arusMasuk"),
            document.getElementById("arusKeluar1"),
            document.getElementById("arusKeluar2")
        ];

        if (semuaInput.some(input =>
            input.value.trim() === "" ||
            !Number.isFinite(Number(input.value)) ||
            Number(input.value) < 0
        )) {
            hasilKCL.innerHTML = `
                <p>Masukkan nilai arus yang valid dan tidak negatif.</p>
            `;
            return;
        }

        const totalArusKeluar = arusKeluar1 + arusKeluar2;

        document.getElementById("labelArusMasuk").textContent =
            `I₁ = ${arusMasuk} A`;

        document.getElementById("labelArusKeluar1").textContent =
            `I₂ = ${arusKeluar1} A`;

        document.getElementById("labelArusKeluar2").textContent =
            `I₃ = ${arusKeluar2} A`;

        const selisih = Math.abs(arusMasuk - totalArusKeluar);

        if (selisih < 0.001) {
            hasilKCL.classList.remove("status-salah");
            hasilKCL.classList.add("status-benar");
            hasilKCL.innerHTML = `
                <h4>Benar! Arus Seimbang</h4>
                <p>Arus Masuk = ${arusMasuk} A</p>
                <p>Total Arus Keluar = ${totalArusKeluar} A</p>
                <p>ΣI masuk = ΣI keluar</p>
                <p>Hukum Kirchhoff I terpenuhi.</p>
            `;
        } else {
            hasilKCL.classList.remove("status-benar");
            hasilKCL.classList.add("status-salah");
            hasilKCL.innerHTML = `
                <h4>Belum Seimbang</h4>
                <p>Arus Masuk = ${arusMasuk} A</p>
                <p>Total Arus Keluar = ${totalArusKeluar} A</p>
                <p>Selisih Arus = ${selisih.toFixed(2)} A</p>
                <p>Ubah nilai arus agar jumlah arus masuk dan keluar sama.</p>
            `;
        }
    });
}

// ==========================================
// SIMULASI HUKUM KIRCHHOFF II (KVL)
// ==========================================

const tombolKVL = document.getElementById("hitungKVL");

if (tombolKVL) {
    tombolKVL.addEventListener("click", function () {

        const sumber = Number(
            document.getElementById("teganganSumber").value
        );

        const R1 = Number(
            document.getElementById("resistor1").value
        );

        const R2 = Number(
            document.getElementById("resistor2").value
        );

        const hasil = document.getElementById("hasilKVL");

        const inputKVL = [
            document.getElementById("teganganSumber"),
            document.getElementById("resistor1"),
            document.getElementById("resistor2")
        ];

        if (inputKVL.some(input =>
            input.value.trim() === "" ||
            !Number.isFinite(Number(input.value)) ||
            Number(input.value) <= 0
        )) {
            hasil.innerHTML = `
                <h4>Input Tidak Valid</h4>
                <p>Masukkan tegangan dan hambatan lebih dari 0.</p>
            `;
            return;
        }

        // Menghitung arus rangkaian seri
        const hambatanTotal = R1 + R2;
        const arus = sumber / hambatanTotal;

        // Menghitung tegangan pada resistor
        const V1 = arus * R1;
        const V2 = arus * R2;

        // Memperbarui nilai pada diagram KVL
        document.getElementById("labelSumberKVL").textContent =
            `Vs = ${sumber} V`;

        document.getElementById("labelR1KVL").textContent =
            `R₁ = ${R1} Ω`;

        document.getElementById("labelR2KVL").textContent =
            `R₂ = ${R2} Ω`;

        document.getElementById("labelArusKVL").textContent =
            `I = ${arus.toFixed(2)} A`;

        // Membuktikan Hukum Kirchhoff II
        const totalTegangan = V1 + V2;
        const selisih = Math.abs(sumber - totalTegangan);

        hasil.classList.remove("status-benar", "status-salah");
        hasil.classList.add(
            selisih < 0.001 ? "status-benar" : "status-salah"
        );

        hasil.innerHTML = `
            <h4>Hasil Perhitungan KVL</h4>

            <p>Hambatan Total = ${hambatanTotal.toFixed(2)} Ω</p>
            <p>Arus Rangkaian = ${arus.toFixed(2)} A</p>

            <p>Tegangan R₁ = ${V1.toFixed(2)} V</p>
            <p>Tegangan R₂ = ${V2.toFixed(2)} V</p>

            <p>Tegangan Sumber = ${sumber.toFixed(2)} V</p>
            <p>Total Tegangan Resistor = ${totalTegangan.toFixed(2)} V</p>

            <h4>
                ${selisih < 0.001
                    ? "Benar! Hukum Kirchhoff II Terpenuhi"
                    : "Perhitungan Belum Seimbang"}
            </h4>

            <p>ΣV = Vs - V₁ - V₂ = ${selisih < 0.001 ? "0 V" : (sumber - totalTegangan).toFixed(4) + " V"}</p>
        `;
    });
}

// ==========================================
// MEMUAT STREAK BELAJAR
// ==========================================

async function muatStreakVEC() {
    const { data, error } = await supabaseClient.rpc("hitung_streak_vec");

    if (error) {
        console.error("Gagal memuat streak:", error);
        return;
    }

    const statsStreak = document.getElementById("statsStreak");

    if (statsStreak) {
        statsStreak.textContent = `${data ?? 0} Hari`;
    }

    console.log("Streak belajar:", data);
}

// ==========================================
// MEMUAT NOTIFIKASI VEC
// ==========================================

async function muatNotifikasiVEC(user) {
    const nim = user.user_metadata?.nim;
    const container = document.getElementById("notificationList");

    if (!nim || !container) return;

    container.innerHTML = "<p>Memuat notifikasi...</p>";

    const [materi, challenge, quiz, misi] = await Promise.all([
        supabaseClient
            .from("vec_material_progress")
            .select("materi_id, completed_at")
            .eq("nim", nim),

        supabaseClient
            .from("vec_exam_answers")
            .select("question_id, updated_at")
            .eq("nim", nim),

        supabaseClient
            .from("vec_quiz_results")
            .select("nilai, completed_at")
            .eq("nim", nim)
            .not("completed_at", "is", null),

        supabaseClient
            .from("vec_mission_progress")
            .select("mission_id, completed_at")
            .eq("nim", nim)
    ]);

    const daftar = [];

    if (materi.data) {
        materi.data.forEach(item => {
            daftar.push({
                icon: "📚",
                judul: "Materi berhasil diselesaikan",
                detail: `Materi ${item.materi_id} selesai dipelajari`,
                waktu: item.completed_at
            });
        });
    }

    if (challenge.data?.length) {
        const terbaru = challenge.data.reduce((a, b) =>
            new Date(a.updated_at) > new Date(b.updated_at) ? a : b
        );

        const jumlah = new Set(
            challenge.data.map(item => item.question)
        ).size;

        daftar.push({
            icon: "🎯",
            judul: jumlah >= 20
                ? "Challenge berhasil diselesaikan"
                : "Aktivitas Challenge",
            detail: `${jumlah} dari 20 soal telah dijawab`,
            waktu: terbaru.updated_at
        });
    }

    if (quiz.data) {
        quiz.data.forEach(item => {
            daftar.push({
                icon: "📝",
                judul: "Quiz telah diselesaikan",
                detail: `Nilai Quiz: ${item.nilai}`,
                waktu: item.completed_at
            });
        });
    }

    if (misi.data) {
        misi.data.forEach(item => {
            daftar.push({
                icon: "🏆",
                judul: "Misi berhasil diselesaikan",
                detail: `Misi ID ${item.mission_id} selesai · 100 XP`,
                waktu: item.completed_at
            });
        });
    }

    daftar.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    const terbaru = daftar.slice(0, 10);

    if (!terbaru.length) {
        container.innerHTML = `
            <div class="notification-empty">
                <div style="font-size:40px;">🔔</div>
                <b>Belum ada notifikasi</b>
                <p>Aktivitas belajar kamu akan muncul di sini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = terbaru.map(item => `
        <div class="notification-item">
            <span>${item.icon}</span>
            <div>
                <b>${item.judul}</b>
                <p>${item.detail}</p>
                <small>${new Date(item.waktu).toLocaleString("id-ID")}</small>
            </div>
        </div>
    `).join("");
}

// ==========================================
// AVATAR BERDASARKAN JENIS KELAMIN
// ==========================================

async function muatAvatarVEC(user) {
    const nim = user.user_metadata?.nim;
    const avatar = document.getElementById("dashboardAvatar");

    if (!nim || !avatar) return;

    const { data, error } = await supabaseClient
        .from("allowed_student")
        .select("jenis_kelamin")
        .eq("nim", nim)
        .maybeSingle();

    console.log("NIM akun:", nim);
    console.log("Data jenis kelamin:", data);
    console.log("Error jenis kelamin:", error);

    if (error || !data) return;

    if (data?.jenis_kelamin === "Laki-laki") {
        avatar.textContent = "👨🏻‍🎓";
    } else if (data?.jenis_kelamin === "Perempuan") {
        avatar.textContent = "👩🏻‍🎓";
    }
}


async function muatEmailPemulihanAdmin(kataKunci = "") {
    if (!currentUser || currentUser.app_metadata?.role !== "admin") {
        adminRecoveryMessage.textContent = "Akses khusus Admin VEC.";
        return;
    }

    adminRecoveryList.textContent = "";
    adminRecoveryMessage.textContent = "Memuat data email pemulihan...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "admin-list-students",
            { body: {} }
        );

        if (error) throw error;

        if (!data?.success) {
            throw new Error(data?.error || "Gagal mengambil data akun.");
        }

        const keyword = kataKunci.toLowerCase();

        const accounts = (data.students || []).filter((account) =>
            String(account.nim).toLowerCase().includes(keyword) ||
            String(account.nama).toLowerCase().includes(keyword)
        );

        if (accounts.length === 0) {
            adminRecoveryMessage.textContent = "Akun tidak ditemukan.";
            return;
        }

        const table = document.createElement("table");
        table.className = "admin-students-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>No.</th>
                    <th>NIM / NIP</th>
                    <th>Nama</th>
                    <th>Email Pemulihan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        accounts.forEach((account, index) => {
            const row = document.createElement("tr");

            const values = [
                index + 1,
                account.nim,
                account.nama,
                account.recovery_email || "Belum terdaftar",
                account.recovery_email ? "Terdaftar" : "Belum terdaftar"
            ];

            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const resetButton = document.createElement("button");

            resetButton.type = "button";
            resetButton.textContent = "Reset Email";
            resetButton.disabled = !account.recovery_email;

            resetButton.addEventListener("click", async () => {
                if (!confirm(`Reset email pemulihan akun ${account.nama} (${account.nim})?`)) {
                    return;
                }

                resetButton.disabled = true;
                resetButton.textContent = "Mereset...";

                try {
                    const { data, error } =
                        await supabaseClient.functions.invoke(
                            "admin-reset-recovery-email",
                            { body: { nim: account.nim } }
                        );

                    if (error) throw error;
                    if (!data?.success) {
                        throw new Error(data?.error || "Gagal mereset email.");
                    }

                    alert(data.message);
                    await muatEmailPemulihanAdmin(adminRecoverySearch.value.trim());

                } catch (error) {
                    console.error("Gagal reset email:", error);
                    alert(error.message || "Gagal mereset email.");
                    resetButton.disabled = false;
                    resetButton.textContent = "Reset Email";
                }
            });

            actionCell.appendChild(resetButton);
            row.appendChild(actionCell);
            tbody.appendChild(row);
        });

        const heading = document.createElement("h3");
        heading.textContent = `Daftar Email Pemulihan (${accounts.length})`;

        adminRecoveryList.replaceChildren(heading, table);
        adminRecoveryMessage.textContent = "Data email pemulihan berhasil dimuat.";

    } catch (error) {
        console.error("Gagal memuat email pemulihan:", error);
        adminRecoveryMessage.textContent =
            error.message || "Gagal mengambil data email pemulihan.";
    }
}


// RESET SEMUA UJIAN MAHASISWA
examAdminContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("#adminResetAllExamsBtn");

    if (!button) return;

    const message = document.getElementById("adminResetAllExamsMessage");

    if (!currentUser || currentUser.app_metadata?.role !== "admin") {
        message.textContent = "Akses khusus Admin VEC.";
        return;
    }

    if (!confirm(
        "PERINGATAN!\n\n" +
        "Semua jawaban dan nilai ujian seluruh mahasiswa akan dihapus.\n\n" +
        "Lanjutkan?"
    )) return;

    if (!confirm(
        "KONFIRMASI TERAKHIR!\n\n" +
        "Seluruh mahasiswa akan kembali ke status Belum Mulai.\n\n" +
        "Reset sekarang?"
    )) return;

    button.disabled = true;
    button.textContent = "Mereset Semua Ujian...";
    message.textContent = "Sedang memproses...";

    try {
        const { data, error } = await supabaseClient.rpc(
            "admin_reset_all_vec_exams"
        );

        if (error) throw error;
        if (!data?.success) {
            throw new Error(data?.message || "Reset gagal.");
        }

        message.textContent =
            `${data.message} Jawaban dihapus: ${data.answers_deleted}. ` +
            `Penugasan dihapus: ${data.assignments_deleted}.`;

        alert(message.textContent);

    } catch (error) {
        console.error("Reset semua ujian gagal:", error);
        message.textContent = error.message || "Reset gagal.";
        alert(message.textContent);

    } finally {
        button.disabled = false;
        button.textContent = "Reset Semua Ujian Mahasiswa";
    }
});
