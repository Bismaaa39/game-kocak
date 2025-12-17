/* =====================
    CANVAS & ELEMENT
===================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
// const characterImageElement = document.getElementById("characterImage"); // Dihapus

const TILE_SIZE = 32; 

/* =======================================================
    [ ASET GAMBAR & DEFINISI POSE PLAYER ]
========================================================== */

const IMAGE_PATH = 'images'; 

// 1. Gambar Player (Tidak Berubah)
const playerDisplayImage = new Image();
const PLAYER_POSES = {
    down_1: `${IMAGE_PATH}/down_diam_1.png`, up_1: `${IMAGE_PATH}/up_diam_1.png`, left_1: `${IMAGE_PATH}/left_diam_1.png`, right_1: `${IMAGE_PATH}/right_diam_1.png`,   
    down_2: `${IMAGE_PATH}/down_jalan_2.png`, down_3: `${IMAGE_PATH}/down_jalan_3.png`, down_4: `${IMAGE_PATH}/down_jalan_4.png`,  
    up_2: `${IMAGE_PATH}/up_jalan_2.png`, up_3: `${IMAGE_PATH}/up_jalan_3.png`, up_4: `${IMAGE_PATH}/up_jalan_4.png`,    
    left_2: `${IMAGE_PATH}/left_jalan_2.png`, left_3: `${IMAGE_PATH}/left_jalan_3.png`, 
    right_2: `${IMAGE_PATH}/right_jalan_2.png`, right_3: `${IMAGE_PATH}/right_jalan_3.png`, right_4: `${IMAGE_PATH}/right_jalan_4.png`, 
};
const loadedPlayerImages = {};
playerDisplayImage.src = PLAYER_POSES.down_1;
for (const key in PLAYER_POSES) {
    loadedPlayerImages[key] = new Image();
    loadedPlayerImages[key].src = PLAYER_POSES[key];
}

// 2. Gambar Karakter Dialog (TELAH DIHAPUS)
// const charImageNames = ['karakter_senyum', 'karakter_senyum2', 'karakter_meledek', 'karakter_terpukau', 'karakter_marah']; 
const characterSprites = {}; // Dibiarkan kosong

// 3. Gambar Objek BARU (Mengganti Kotak Warna)
const objectImages = {
    'Buku': new Image(),
    'Cermin': new Image(),
    'Catatan': new Image(),
    'Bunga Biru': new Image(),
};
// --- PASTIKAN NAMA FILE INI ADA DI FOLDER 'images/' ANDA ---
objectImages['Buku'].src = `${IMAGE_PATH}/buku_ajaib.png`; 
objectImages['Cermin'].src = `${IMAGE_PATH}/cermin.png`;
objectImages['Catatan'].src = `${IMAGE_PATH}/catatan.png`;
objectImages['Bunga Biru'].src = `${IMAGE_PATH}/bunga_biru.png`;


/* =======================================================
    [ PENGATURAN SCENE 2: OBJEK & PERTANYAAN ]
========================================================== */

// Data 3 Pertanyaan (Sama)
const SCENE_QUESTIONS = [
    {
        question: "Pertanyaan 1: Pupu adalah kakak dari ibu Binyu. Apa hubungan Pupu terhadap Binyu?",
        answer: "bibi"
    },
    {
        question: "Pertanyaan 2: Pupu dan ayah Binyu adalah saudara kandung. Pupu memiliki anak bernama Rahma. Binyu adalah anak dari saudara Pupu tersebut. Apa hubungan Rahma dan Binyu?",
        answer: "sepupu"
    },
    {
        question: "Pertanyaan 3: Zahra adalah ibu dari Rara, Rara adalah ibu dari Rahma, Rahma adalah ibu dari Pupu, Pupu adalah ibu dari Bisma. Apa hubungan Zahra terhadap Bisma?",
        answer: "moyang"
    }
];

let answeredCorrectly = 0; 
let isQuestionActive = false; 

// Objek di Arena (Arena Terbuka, Tidak Ada Tembok)
const sceneObjects = [
    // --- Petunjuk (Clues) ---
    { x: TILE_SIZE * 2, y: TILE_SIZE * 3, width: TILE_SIZE, height: TILE_SIZE * 2, type: 'clue', name: 'Cermin', dialogue: "Suka banget y ketemu ini benda?" },
    { x: TILE_SIZE * 5, y: TILE_SIZE * 8, width: TILE_SIZE, height: TILE_SIZE, type: 'clue', name: 'Catatan', dialogue: "i hope u like it. Ayo Kebun Binatang?" },
    { x: TILE_SIZE * 12, y: TILE_SIZE * 5, width: TILE_SIZE, height: TILE_SIZE, type: 'clue', name: 'Bunga Biru', dialogue: "teri ma k a. sih." },

    // --- Buku Pertanyaan ---
    { x: TILE_SIZE * 8, y: TILE_SIZE * 2, width: TILE_SIZE, height: TILE_SIZE, type: 'question', name: 'Buku' }
];

// Portal Keluar (Terkunci sampai 3 pertanyaan benar)
const exitPortal = {
    x: canvas.width / 2 - 30,
    y: 0,
    width: 60,
    height: 25,
    glowRadius: 40,
    isLocked: true 
};


/* =======================================================
    [ LOGIKA PEMUATAN GAMBAR ]
========================================================== */

const allImagesToLoad = [playerDisplayImage]; 

// Hapus: Tambahkan gambar karakter dialog
// charImageNames.forEach(name => {
//     characterSprites[name] = new Image();
//     characterSprites[name].src = `${IMAGE_PATH}/${name}.png`; 
//     allImagesToLoad.push(characterSprites[name]); 
// });

// Tambahkan gambar objek (BARU)
for (const key in objectImages) {
    allImagesToLoad.push(objectImages[key]);
}

let imagesLoadedCount = 0; 
let totalImages = allImagesToLoad.length; 
let isLoopRunning = false;

allImagesToLoad.forEach(img => {
    img.onload = () => {
        imagesLoadedCount++;
        if (imagesLoadedCount === totalImages && !isLoopRunning) {
            loop();
            // Pesan dialog awal tanpa gambar karakter
            startDialogue([{text: "Klik objek yang kamu lihat!"}]); 
            isLoopRunning = true;
        }
    };
    img.onerror = () => {
        console.error(`Gagal memuat gambar: ${img.src}`);
        imagesLoadedCount++; 
        if (imagesLoadedCount === totalImages && !isLoopRunning) {
             console.warn("Melanjutkan game meskipun ada gambar yang gagal dimuat.");
             loop();
             // Pesan dialog awal tanpa gambar karakter
             startDialogue([{text: "Ada masalah memuat gambar, tapi ayo kita lanjutkan. Cari Buku!"}]);
             isLoopRunning = true;
        }
    };
});
// --------------------------------------------------------------------------------


/* =====================
    STATE DIALOG & PERTANYAAN
===================== */
let isDialogueActive = false;
const currentDialogue = {
    texts: [], 
    currentTextIndex: 0
};

function startDialogue(dialogueObjects) {
    if (isDialogueActive || isQuestionActive) return; 
    currentDialogue.texts = dialogueObjects;
    currentDialogue.currentTextIndex = 0;
    isDialogueActive = true;
    showDialogue();
}

function showDialogue() {
    const currentLine = currentDialogue.texts[currentDialogue.currentTextIndex]; 
    dialogBox.style.display = 'block';
    
    dialogBox.innerHTML = currentLine.text + "<br><br><small>(TEKAN ENTER / KLIK LAYAR)</small>"; 
    
    // Hapus: Logika menampilkan gambar karakter
    // if (currentLine.image && characterSprites[currentLine.image]) {
    //     characterImageElement.style.display = 'block';
    //     characterImageElement.src = characterSprites[currentLine.image].src;
    // } else {
    //     characterImageElement.style.display = 'none';
    // }
    
    // Pastikan characterImageElement tetap disembunyikan
    document.getElementById("characterImage").style.display = 'none'; 
}

function advanceDialogue() {
    if (!isDialogueActive) return;
    currentDialogue.currentTextIndex++;
    if (currentDialogue.currentTextIndex < currentDialogue.texts.length) {
        showDialogue();
    } else {
        isDialogueActive = false;
        dialogBox.style.display = 'none';
        // Hapus: Menyembunyikan elemen gambar karakter
        // characterImageElement.style.display = 'none'; 
        
        if (currentDialogue.isQuestionSource) {
            promptQuestion();
        }
        currentDialogue.isQuestionSource = false; 
    }
}

function promptQuestion() {
    if (answeredCorrectly >= SCENE_QUESTIONS.length) {
        alert("Semua pertanyaan sudah dijawab. Portal Keluar telah terbuka!");
        exitPortal.isLocked = false;
        return;
    }

    const qData = SCENE_QUESTIONS[answeredCorrectly];
    isQuestionActive = true;
    
    let userAnswer = prompt(`(Kunci ${answeredCorrectly + 1} dari 3) \n\n${qData.question} \n\nMasukkan jawaban (huruf KECIL semuaaaaaaaaaaaa):`);
    
    if (userAnswer) {
        userAnswer = userAnswer.toLowerCase().trim();
        
        if (userAnswer === qData.answer.toLowerCase().trim()) {
            answeredCorrectly++;
            alert(`tumben bener! Kamu telah mendapatkan Kunci #${answeredCorrectly}.`);
            
            if (answeredCorrectly >= SCENE_QUESTIONS.length) {
                alert("Selamat! Semua kunci telah terkumpul. Ayo kita pergi dari sini!");
                exitPortal.isLocked = false;
            }
        } else {
            alert("SALAH. Coba lagi masa gabisa si");
        }
    } else {
        alert("Pertanyaan dibatalin, hey dek? sebenrnya, aku mau ngomong tapi takut gimana gitu. Iya sih, aku emang salah tapi dia juga nyebelin, tapi pernah ga sih kamu makan bubur ayam? eh kamu tim diaduk atau engggaaaaaaa? eh lucu gasi photobooth pake seragam putih abu. Tau ga ikan apa yang ga bisa berenang? Ya ga ada lah kocak ikan mana yang ga bisa berenang. Plis pupu jangan main hp di motor. Kamu tau ga? kenapa binyu jadi ketua kelas? karena dia keren banget cool gila woaw idaman para kucing. Eh kucing kok lucu ya? tapi lebih lucu....... Tapi tau gasi kenapa Pupu gasuka sama rumah hantu? Ah gila akal-akalan binyu doang biar .... Bye");
    }
    
    isQuestionActive = false;
}


/* =====================
    PLAYER, KEYBOARD, JOYSTICK, DAN INTERAKSI SENTUH
===================== */
const player = {
    x: canvas.width / 2 - 16, 
    y: canvas.height / 2 - 16, 
    size: 32, 
    speed: 2,
    direction: 'down', 
    isMoving: false,
    frameIndex: 1, 
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
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
}
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function checkCollision(objA, objB) {
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.size > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.size > objB.y
    );
}

function tryObjectInteraction() {
    if (isDialogueActive || isQuestionActive) return false; 
    
    // Cek Interaksi dengan Objek Lain
    for (const obj of sceneObjects) {
        if (checkCollision(player, obj)) {
            
            if (obj.type === 'clue') {
                // Hapus: 'image: "karakter_senyum2"'
                startDialogue([{text: obj.dialogue}]); 
                return true; 
            }
            
            else if (obj.type === 'question') {
                currentDialogue.isQuestionSource = true;
                if (answeredCorrectly >= SCENE_QUESTIONS.length) {
                    // Hapus: 'image: "karakter_senyum"'
                    startDialogue([{text: `${obj.name}: Kunci sudah lengkap! Segera menuju Portal Keluar.`}]); 
                } else {
                    // Hapus: 'image: "karakter_terpukau"'
                    startDialogue([{text: `${obj.name}: Kamu butuh ${SCENE_QUESTIONS.length - answeredCorrectly} kunci lagi. Siap menjawab Pertanyaan #${answeredCorrectly + 1}?`}]); 
                }
                return true;
            }
        }
    }
    return false;
}

// Mouse Down (Klik) Listener
canvas.addEventListener("mousedown", e => {
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - joystick.baseX;
    const dy = pos.y - joystick.baseY;
    const dist = Math.hypot(dx, dy);

    // 1. Jika ada dialog aktif, klik memajukan dialog
    if (isDialogueActive || isQuestionActive) { 
        advanceDialogue(); 
        return; 
    }
    
    // 2. Cek apakah klik berada di area Joystick
    if (dist <= joystick.radius * 2) {
        joystick.active = true;
        joystick.knobX = pos.x;
        joystick.knobY = pos.y;
        return; 
    }
    
    // 3. Jika player tidak bergerak dan klik bukan di joystick, coba interaksi objek
    if (!player.isMoving && !joystick.active) {
        tryObjectInteraction();
    }
});

// Touch Start (Sentuh) Listener
canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const pos = getTouchPos(e);
    const dx = pos.x - joystick.baseX;
    const dy = pos.y - joystick.baseY;
    const dist = Math.hypot(dx, dy);

    // 1. Jika ada dialog aktif, sentuh memajukan dialog
    if (isDialogueActive || isQuestionActive) { 
        advanceDialogue(); 
        return; 
    }

    // 2. Cek apakah sentuhan berada di area Joystick
    if (dist <= joystick.radius * 2) {
        joystick.active = true;
        joystick.knobX = pos.x;
        joystick.knobY = pos.y;
        return;
    }
    
    // 3. Jika player tidak bergerak dan sentuhan bukan di joystick, coba interaksi objek
    if (!player.isMoving && !joystick.active) {
        tryObjectInteraction();
    }
});


canvas.addEventListener("touchmove", e => {
    if (!joystick.active || isDialogueActive || isQuestionActive) return;
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

window.addEventListener("mousemove", e => {
    if (!joystick.active || isDialogueActive || isQuestionActive) return;
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
    FUNGSI UTAMA: INTERAKSI & UPDATE
===================== */

function handleInteractions() {
    if (isDialogueActive || isQuestionActive) return;

    // Cek Interaksi dengan Portal Keluar
    if (checkCollision(player, exitPortal) && !exitPortal.isLocked) {
        window.location.href = "scene_ending.html"; 
        return;
    } 
    // Jika masih terkunci
    else if (checkCollision(player, exitPortal) && exitPortal.isLocked) {
        if (player.y < exitPortal.y + exitPortal.height) {
             player.y = exitPortal.y + exitPortal.height;
        }
        
        // Pilihan: Tetap ada interaksi ENTER/Dialog saat di portal terkunci
        if (keys['Enter']) {
            // Hapus: 'image: "karakter_marah"'
             startDialogue([{text: `Portal Keluar Terkunci! Kamu butuh ${SCENE_QUESTIONS.length - answeredCorrectly} kunci lagi (Cari Buku).`}]);
             keys['Enter'] = false;
        }
    }
}

function update() {
    if (isDialogueActive || isQuestionActive) return; 
    
    player.isMoving = false; 
    
    let dx = 0;
    let dy = 0;

    // Pergerakan Input
    if (keys["ArrowUp"]) dy -= player.speed;
    if (keys["ArrowDown"]) dy += player.speed;
    if (keys["ArrowLeft"]) dx -= player.speed;
    if (keys["ArrowRight"]) dx += player.speed;

    if (joystick.active) {
        const jdx = joystick.knobX - joystick.baseX;
        const jdy = joystick.knobY - joystick.baseY;
        const dist = Math.hypot(jdx, jdy);
        if (dist > 5) {
            dx += (jdx / dist) * player.speed;
            dy += (jdy / dist) * player.speed;
        }
    }
    
    if (dx !== 0 || dy !== 0) {
        player.isMoving = true;
        
        if (Math.abs(dx) > Math.abs(dy)) { 
            player.direction = (dx > 0) ? 'right' : 'left'; 
        } else if (dy !== 0) {
            player.direction = (dy > 0) ? 'down' : 'up'; 
        }
    }
    
    player.x += dx;
    player.y += dy;

    // Batas layar 
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
    
    // Logika Animasi
    let currentFrameSuffix;
    if (player.isMoving) {
        player.animationTimer++;
        if (player.animationTimer >= player.animationSpeed) {
            player.frameIndex = (player.frameIndex >= 4) ? 2 : player.frameIndex + 1;
            player.animationTimer = 0;
        }
        currentFrameSuffix = `_${player.frameIndex}`;
    } else {
        currentFrameSuffix = '_1';
        player.frameIndex = 1; 
    }
    const poseKey = player.direction + currentFrameSuffix;
    if (loadedPlayerImages[poseKey]) { 
        playerDisplayImage.src = loadedPlayerImages[poseKey].src;
    }
    
    handleInteractions();
}


/* =====================
    DRAW (MENGGAMBAR ASSET OBJEK)
===================== */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4a6c4c"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ===== GAMBAR PORTAL KELUAR (Terkunci/Terbuka) =====
    const gradient = ctx.createRadialGradient(
        exitPortal.x + exitPortal.width / 2,
        exitPortal.y + exitPortal.height / 2,
        5,
        exitPortal.x + exitPortal.width / 2,
        exitPortal.y + exitPortal.height / 2,
        exitPortal.glowRadius
    );
    
    if (exitPortal.isLocked) {
        gradient.addColorStop(0, "rgba(255,0,0,0.7)");
        gradient.addColorStop(1, "rgba(255,0,0,0)");
    } else {
        gradient.addColorStop(0, "rgba(255,255,255,0.9)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
        exitPortal.x - exitPortal.glowRadius,
        exitPortal.y - exitPortal.glowRadius,
        exitPortal.width + exitPortal.glowRadius * 2,
        exitPortal.height + exitPortal.glowRadius * 2
    );

    // Gambar Semua Objek (Petunjuk dan Buku)
    for (const obj of sceneObjects) {
        
        let imageToDraw = null;

        if (obj.type === 'clue' || obj.type === 'question') {
            imageToDraw = objectImages[obj.name]; // Ambil gambar berdasarkan nama objek
        }

        // Cek apakah gambar objek tersedia
        if (imageToDraw && imageToDraw.complete && imageToDraw.naturalWidth !== 0) {
            // Gambar Aset
            ctx.drawImage(imageToDraw, obj.x, obj.y, obj.width, obj.height);
        } else {
            // Fallback: Gambar kotak magenta jika aset belum/gagal dimuat
            ctx.fillStyle = "magenta"; 
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            // Tampilkan nama objek di atas kotak magenta
            ctx.fillText(obj.name.split(' ')[0], obj.x + 2, obj.y + obj.height / 2 + 4); 
        }
    }
    
    // Draw Player
    if (playerDisplayImage.complete && playerDisplayImage.naturalWidth !== 0) {
        ctx.drawImage(playerDisplayImage, player.x, player.y, player.size, player.size);
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    // Draw Joystick
    if (!isDialogueActive && !isQuestionActive) {
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