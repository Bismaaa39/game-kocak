const cutsceneContainer = document.getElementById('cutscene');
const dialogTextElement = document.getElementById('dialogText'); // Elemen untuk menampilkan teks utama
const promptElement = document.getElementById('prompt');

// =========================================================
// === PANDUAN MENGEDIT NARASI CERITA ======================
// =========================================================
// Story harus berupa array (daftar) dari string (teks)
// SETIAP STRING (TEKS) DALAM DAFTAR ADALAH 1 PANEL DIALOG
const storyPanels = [
    // [0] Teks pertama:
    "DI PENGHUJUNG TAHUN...",
    
    // [1] Teks kedua (teks sebelumnya akan hilang):
    "SANG KEKUATAN GELAP MENGANCAM KEDAMAIAN DUNIA...",
    
    // [2] Teks ketiga:
    "PARA PAHLAWAN TERAKHIR TELAH GAGAL...",
    
    // [3] Teks keempat (Tambah atau Hapus di sini):

    "KINI, HANYA SATU HARAPAN TERSISA:",
    
    // [4] Teks kelima (Jika ingin menambah, tambahkan koma di akhir baris dan buat baris baru)
    "KAMU. MULAI MISIMU, ORANG BAIK DI DUNIA, SANG DEWAN KEAMANAN!" 
    // Jika tidak ada teks lagi, JANGAN tambahkan koma di akhir baris ini.
];
// =========================================================
// === PANDUAN TAMBAHAN:
// Untuk MENGHAPUS salah satu teks: Hapus baris teks tersebut.
// Untuk MENAMBAH teks: Tambahkan koma (,) di akhir teks sebelumnya, lalu buat baris baru dengan teks di dalam tanda kutip ("Teks Baru").
// =========================================================


let currentPanelIndex = 0;
let isReadyForNext = false;
const TRANSITION_DURATION = 500; // Durasi animasi fade out/in (ms)

// Fungsi utama untuk menampilkan panel berikutnya
function showNextPanel() {
    if (currentPanelIndex < storyPanels.length) {
        // --- Langkah 1: Fade Out Teks Lama ---
        dialogTextElement.classList.remove('active');
        promptElement.classList.remove('active');
        isReadyForNext = false;

        setTimeout(() => {
            // --- Langkah 2: Ganti Teks Baru ---
            dialogTextElement.textContent = storyPanels[currentPanelIndex];
            
            // --- Langkah 3: Fade In Teks Baru ---
            setTimeout(() => {
                dialogTextElement.classList.add('active');
            }, 50);

            // --- Langkah 4: Aktifkan Prompt ---
            setTimeout(() => {
                promptElement.classList.add('active');
                isReadyForNext = true;
                currentPanelIndex++; // Lanjut ke indeks berikutnya
            }, TRANSITION_DURATION + 700); // Tunggu transisi + sedikit jeda
            
        }, TRANSITION_DURATION); // Tunggu fade out selesai

    } else {
        // Story Selesai, Lakukan Transisi ke Game Utama
        
        dialogTextElement.classList.remove('active');
        promptElement.classList.remove('active');
        
        // Transisi: Fade out layar dan pindah halaman
        cutsceneContainer.style.transition = 'background-color 1.5s';
        cutsceneContainer.style.backgroundColor = 'white'; // Efek flash putih
        
        setTimeout(() => {
            window.location.href = 'scene1.html';
        }, 1500); // Tunggu transisi selesai sebelum pindah halaman
    }
}

// Handler Input (Keyboard dan Tap/Klik)
function handleAdvance() {
    if (isReadyForNext) {
        showNextPanel();
    }
}

window.addEventListener("keydown", e => {
    if (e.key === 'Enter' || e.key === ' ') {
        handleAdvance();
    }
});

cutsceneContainer.addEventListener('click', handleAdvance);
cutsceneContainer.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    handleAdvance();
});

// Mulai Cutscene
showNextPanel();