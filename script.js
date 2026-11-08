
// ==========================================
// KONFIGURASI DASAR
// ==========================================

const loginScreen = document.getElementById("loginScreen");
const changePasswordScreen = document.getElementById("changePasswordScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

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

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nim = document.getElementById("loginNim").value.trim();
    const password = document.getElementById("loginPassword").value;
    const loginButton = document.getElementById("loginBtn");

    loginMessage.textContent = "";

    if (!nim || !password) {
        loginMessage.textContent = "NIM dan password wajib diisi.";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Memeriksa...";

    try {
        // NIM diubah menjadi email internal untuk Supabase Auth
        const email = `${nim}@vec-login.example.com`;

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        currentUser = data.user;

        // Periksa apakah mahasiswa wajib mengganti password
        if (currentUser.app_metadata?.must_change_password === true) {
            showScreen("changePassword");
        } else {
            masukDashboard(currentUser);
        }

    } catch (error) {
        console.error("Login gagal:", error);

        loginMessage.textContent =
            "Login gagal. Periksa kembali NIM dan password.";
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

    showScreen("dashboard");

    const nama =
        user.user_metadata?.nama ||
        user.user_metadata?.nim ||
        "Mahasiswa";

    document.getElementById("userName").textContent = nama;

    // Data XP masih menggunakan data contoh
    // Nanti kita hubungkan dengan database mahasiswa
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

document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const page = button.dataset.page;

        if (page !== "Dashboard") {
            showToast(`Halaman ${page} sedang dalam tahap pengembangan.`);
        } else {
            showToast("Kamu sedang berada di Dashboard VEC.");
        }

        document.getElementById("sidebar").classList.remove("open");
    });
});

document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
        const page = button.dataset.go;
        const target = document.querySelector(`[data-page="${page}"]`);

        if (target) target.click();
    });
});

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
