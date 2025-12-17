/* =====================
    CANVAS & ELEMENT
===================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const characterImageElement = document.getElementById("characterImage");

// Hapus Pemuatan Gambar Player lama
// const playerImage = new Image();
// playerImage.src = 'https://i.imgur.com/8Qj8xYp.png'; 

// <--- TAMBAHAN BARU: Deklarasi Gambar Player & Folder (START)

// Gambar yang sedang aktif (Objek Image untuk ditampilkan)
const playerDisplayImage = new Image();

// 1. Definisikan folder tempat gambar player berada. 
// KARENA SEMUA GAMBAR ADA DI FOLDER 'images', KITA GUNAKAN PATH INI:
const IMAGE_PATH = 'images'; 

// 2. Definisikan nama file untuk 16 pose Anda. (!!! PASTIKAN NAMA FILE DAN FORMATNYA COCOK !!!)
const PLAYER_POSES = {
    // A. POSE DIAM (frame _1)
    down_1: `${IMAGE_PATH}/down_diam_1.png`,     // Bawah Diam
    up_1: `${IMAGE_PATH}/up_diam_1.png`,         // Atas Diam
    left_1: `${IMAGE_PATH}/left_diam_1.png`,      // Kiri Diam
    right_1: `${IMAGE_PATH}/right_diam_1.png`,    // Kanan Diam
    
    // B. POSE BERJALAN (frame _2, _3, _4)
    // DOWN (Bawah)
    down_2: `${IMAGE_PATH}/down_jalan_2.png`,  // *HARUS ADA FILE INI*
    down_3: `${IMAGE_PATH}/down_jalan_3.png`,  // *HARUS ADA FILE INI*
    down_4: `${IMAGE_PATH}/down_jalan_4.png`,  // *HARUS ADA FILE INI*
    
    // UP (Atas)
    up_2: `${IMAGE_PATH}/up_jalan_2.png`,    // *HARUS ADA FILE INI*
    up_3: `${IMAGE_PATH}/up_jalan_3.png`,    // *HARUS ADA FILE INI*
    up_4: `${IMAGE_PATH}/up_jalan_4.png`,    // *HARUS ADA FILE INI*

    // LEFT (Kiri)
    left_2: `${IMAGE_PATH}/left_jalan_2.png`,   // *HARUS ADA FILE INI*
    left_3: `${IMAGE_PATH}/left_jalan_3.png`,   // *HARUS ADA FILE INI*

    // RIGHT (Kanan)
    right_2: `${IMAGE_PATH}/right_jalan_2.png`, // *HARUS ADA FILE INI*
    right_3: `${IMAGE_PATH}/right_jalan_3.png`, // *HARUS ADA FILE INI*
    right_4: `${IMAGE_PATH}/right_jalan_4.png`, // *HARUS ADA FILE INI*
};

const loadedPlayerImages = {};

// Pemuatan awal (Misal, ksatria menghadap ke bawah, diam)
playerDisplayImage.src = PLAYER_POSES.down_1;

// Objek untuk memuat semua gambar player (digunakan di logika UPDATE)
for (const key in PLAYER_POSES) {
    loadedPlayerImages[key] = new Image();
    loadedPlayerImages[key].src = PLAYER_POSES[key];
}

// <--- TAMBAHAN BARU: Deklarasi Gambar Player & Folder (END)

// --------------------------------------------------------------------------------

/* =======================================================
    [ PENGATURAN MUDAH ] - HANYA UBAH BAGIAN INI SAJA!
========================================================== */

// 1. DAFTAR NAMA FILE GAMBAR KARAKTER (TANPA .png)
const charImageNames = ['karakter_senyum', 'karakter_senyum2', 'karakter_meledek', 'karakter_terpukau', 'karakter_marah']; 

// 2. DATA DIALOG UTAMA
const INITIAL_DIALOGUE_DATA = [
    {text: "Hai, Pupu'K!", image: "karakter_senyum"},
    {text: "Aku merasa senang kita bertemu lagi!!!!", image: "karakter_terpukau"},
    {text: "Tapi, ada bahaya yang mengintai...", image: "karakter_marah"},
    {text: "Kamu akan memainkan peran sebagai Binyu", image: "karakter_senyum2"},
    {text: "Aku harap kamu bakal sanggup menjalani karakter yang baik hati ini", image: "karakter_meledek"},
    {text: "Jangan lupa cari petunjuk ya nanti! Katanya Binyu janji ga akan ngasih secret lagi!", image: "karakter_senyum2"}
];


/* =======================================================
    [ LOGIKA GAMBAR & PEMUATAN ] - JANGAN UBAH BAGIAN INI
========================================================== */

const characterSprites = {};
const allImagesToLoad = [playerDisplayImage]; 

charImageNames.forEach(name => {
    characterSprites[name] = new Image();
    characterSprites[name].src = `images/${name}.png`; 
    allImagesToLoad.push(characterSprites[name]); 
});

let imagesLoadedCount = 0; 
let totalImages = allImagesToLoad.length; 
let isLoopRunning = false;

// Perbaiki logika pemuatan gambar agar menunggu SEMUA gambar DIALOG dimuat
allImagesToLoad.forEach(img => {
    img.onload = () => {
        imagesLoadedCount++;
        if (imagesLoadedCount === totalImages && !isLoopRunning) {
            loop();
            startDialogue(INITIAL_DIALOGUE_DATA); 
            isLoopRunning = true;
        }
    };
    img.onerror = () => {
        console.error(`Gagal memuat gambar: ${img.src}`);
        imagesLoadedCount++; 
        if (imagesLoadedCount === totalImages && !isLoopRunning) {
             console.warn("Melanjutkan game meskipun ada gambar yang gagal dimuat.");
             loop();
             startDialogue(INITIAL_DIALOGUE_DATA);
             isLoopRunning = true;
        }
    };
});
// --------------------------------------------------------------------------------


/* =====================
    STATE DIALOG (SAMA)
===================== */
let isDialogueActive = false;
const currentDialogue = {
    texts: [], 
    currentTextIndex: 0
};

function startDialogue(dialogueObjects) {
    if (isDialogueActive) return;
    currentDialogue.texts = dialogueObjects;
    currentDialogue.currentTextIndex = 0;
    isDialogueActive = true;
    showDialogue();
}

function showDialogue() {
    const currentLine = currentDialogue.texts[currentDialogue.currentTextIndex]; 
    dialogBox.style.display = 'block';
    dialogBox.innerHTML = currentLine.text + "<br><br><small>(TEKAN ENTER)</small>";

    if (currentLine.image) {
        characterImageElement.style.display = 'block';
        characterImageElement.src = characterSprites[currentLine.image].src;
    } else {
        characterImageElement.style.display = 'none';
    }
}

function advanceDialogue() {
    if (!isDialogueActive) return;
    currentDialogue.currentTextIndex++;
    if (currentDialogue.currentTextIndex < currentDialogue.texts.length) {
        showDialogue();
    } else {
        isDialogueActive = false;
        dialogBox.style.display = 'none';
        characterImageElement.style.display = 'none';
    }
}


/* =====================
    PLAYER, KEYBOARD, JOYSTICK
===================== */
const player = {
    x: 300,
    y: 160,
    size: 32, // Ukuran Sprite 32x32
    speed: 2,
    
    direction: 'down', // Arah saat ini ('down', 'up', 'left', 'right')
    isMoving: false,
    frameIndex: 1, // Bingkai saat ini (1, 2, 3, atau 4)
    animationTimer: 0,
    animationSpeed: 8 
};
// ----------------------------------------------

const keys = {};
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", e => keys[e.key] = false);

function handleKeyDown(e) {
    if (e.key === 'Enter') {
        if (isDialogueActive) {
            advanceDialogue();
            keys[e.key] = false; 
            return;
        }
    }
    keys[e.key] = true;
}

const joystick = {
    active: false,
    baseX: 60,
    baseY: canvas.height - 60,
    knobX: 60,
    knobY: canvas.height - 60,
    radius: 35
};

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
    };
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const pos = getTouchPos(e);
    const dx = pos.x - joystick.baseX;
    const dy = pos.y - joystick.baseY;
    const dist = Math.hypot(dx, dy);

    if (isDialogueActive) {
        advanceDialogue();
        return;
    }

    if (dist <= joystick.radius * 2) {
        joystick.active = true;
        joystick.knobX = pos.x;
        joystick.knobY = pos.y;
    }
});

canvas.addEventListener("touchmove", e => {
    if (!joystick.active || isDialogueActive) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    const dx = pos.x - joystick.baseX;
    const dy = pos.y - joystick.baseY;
    const dist = Math.hypot(dx, dy);

    if (dist > joystick.radius) {
        joystick.knobX = joystick.baseX + (dx / dist) * joystick.radius;
        joystick.knobY = joystick.baseY + (dy / dist) * joystick.radius;
    } else {
        joystick.knobX = pos.x;
        joystick.knobY = pos.y;
    }
});

canvas.addEventListener("touchend", e => {
    e.preventDefault();
    joystick.active = false;
    joystick.knobX = joystick.baseX;
    joystick.knobY = joystick.baseY;
});

canvas.addEventListener("mousedown", e => {
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - joystick.baseX;
    const dy = pos.y - joystick.baseY;
    const dist = Math.hypot(dx, dy);

    if (isDialogueActive) {
        advanceDialogue();
        return;
    }

    if (dist <= joystick.radius * 2) {
        joystick.active = true;
        joystick.knobX = pos.x;
        joystick.knobY = pos.y;
    }
});

window.addEventListener("mousemove", e => {
    if (!joystick.active || isDialogueActive) return;
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - joystick.baseX;
    const dy = pos.y - joystick.baseY;
    const dist = Math.hypot(dx, dy);

    if (dist > joystick.radius) {
        joystick.knobX = joystick.baseX + (dx / dist) * joystick.radius;
        joystick.knobY = joystick.baseY + (dy / dist) * joystick.radius;
    } else {
        joystick.knobX = pos.x;
        joystick.knobY = pos.y;
    }
});

window.addEventListener("mouseup", () => {
    joystick.active = false;
    joystick.knobX = joystick.baseX;
    joystick.knobY = joystick.baseY;
});


/* =====================
    UPDATE (Penambahan Logika Animasi)
===================== */
function update() {
    if (isDialogueActive) return;

    player.isMoving = false; // Reset status bergerak
    
    // Pergerakan Keyboard & Penentuan Arah
    if (keys["ArrowUp"]) {
        player.y -= player.speed;
        player.direction = 'up';
        player.isMoving = true;
    } 
    if (keys["ArrowDown"]) {
        player.y += player.speed;
        player.direction = 'down';
        player.isMoving = true;
    }
    if (keys["ArrowLeft"]) {
        player.x -= player.speed;
        player.direction = 'left';
        player.isMoving = true;
    }
    if (keys["ArrowRight"]) {
        player.x += player.speed;
        player.direction = 'right';
        player.isMoving = true;
    }

    // Pergerakan Joystick & Penentuan Arah
    if (joystick.active) {
        const dx = joystick.knobX - joystick.baseX;
        const dy = joystick.knobY - joystick.baseY;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            player.x += (dx / dist) * player.speed;
            player.y += (dy / dist) * player.speed;
            player.isMoving = true;
            
            // Tentukan arah Joystick
            if (Math.abs(dx) > Math.abs(dy)) { 
                player.direction = (dx > 0) ? 'right' : 'left'; 
            } else { 
                player.direction = (dy > 0) ? 'down' : 'up'; 
            }
        }
    }
    
    // <--- LOGIKA ANIMASI MANUAL: Ganti Gambar Berdasarkan Status (START) ---
    let currentFrameSuffix;

    if (player.isMoving) {
        player.animationTimer++;
        if (player.animationTimer >= player.animationSpeed) {
            // Berputar dari frame 2, 3, 4 (Bingkai berjalan)
            player.frameIndex = (player.frameIndex >= 4) ? 2 : player.frameIndex + 1;
            player.animationTimer = 0;
        }
        currentFrameSuffix = `_${player.frameIndex}`;
        
    } else {
        // DIAM: Selalu gunakan bingkai pertama (frame _1)
        currentFrameSuffix = '_1';
        player.frameIndex = 1; // Reset index animasi ke 1 (pose diam)
    }
    
    // Buat kunci yang sesuai dengan objek PLAYER_POSES (misal: 'down_1', 'right_3')
    const poseKey = player.direction + currentFrameSuffix;

    // Ganti gambar yang ditampilkan (menggunakan objek yang sudah dimuat)
    if (loadedPlayerImages[poseKey]) { 
        playerDisplayImage.src = loadedPlayerImages[poseKey].src;
    }
    // <--- LOGIKA ANIMASI MANUAL: Ganti Gambar Berdasarkan Status (END) ---

    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

    // ===== CEK MASUK PORTAL =====
    if (
        player.x < portal.x + portal.width &&
        player.x + player.size > portal.x &&
        player.y < portal.y + portal.height &&
        player.y + player.size > portal.y
    ) {
        window.location.href = "scene2.html";
    }
}


/* =====================
    DRAW (Perubahan untuk menampilkan Gambar Baru)
===================== */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4a6c4c"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ===== CAHAYA PUTIH PORTAL =====
    const gradient = ctx.createRadialGradient(
        portal.x + portal.width / 2,
        portal.y + portal.height / 2,
        5,
        portal.x + portal.width / 2,
        portal.y + portal.height / 2,
        portal.glowRadius
    );

    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(
        portal.x - portal.glowRadius,
        portal.y - portal.glowRadius,
        portal.width + portal.glowRadius * 2,
        portal.height + portal.glowRadius * 2
    );

    // <--- PERUBAHAN DRAW PLAYER ---
    if (playerDisplayImage.complete && playerDisplayImage.naturalWidth !== 0) {
        ctx.drawImage(playerDisplayImage, player.x, player.y, player.size, player.size);
    } else {
        // Jika gambar belum dimuat (atau error), tampilkan kotak putih/default
        ctx.fillStyle = "white";
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }
    // ----------------------------

    if (!isDialogueActive) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(joystick.knobX, joystick.knobY, 14, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}


/* =====================
    LOOP
===================== */
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// startDialogue(INITIAL_DIALOGUE_DATA); // <--- KODE LAMA INI DIHAPUS 

// =====================
// ZONA PINDAH SCENE
// =====================
// --- PERBAIKAN BUG FATAL: DEKLARASI PORTAL DIPINDAH KE ATAS ---
const portal = {
    x: canvas.width / 2 - 30,
    y: 0,
    width: 60,
    height: 25,
    glowRadius: 40
};
// -------------------------------------------------------------