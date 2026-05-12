const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elementi
const mainMenu = document.getElementById('mainMenu');
const settingsMenu = document.getElementById('settingsMenu');
const scoreMenu = document.getElementById('scoreMenu');
const campaignMenu = document.getElementById('campaignMenu');
const menuBackground = document.getElementById('menuBackground'); 

const startBtn = document.getElementById('startBtn');
const openCampaignBtn = document.getElementById('openCampaignBtn');
const closeCampaignBtn = document.getElementById('closeCampaignBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const openScoreBtn = document.getElementById('openScoreBtn');
const closeScoreBtn = document.getElementById('closeScoreBtn');

const volMinus = document.getElementById('volMinus');
const volPlus = document.getElementById('volPlus');
const volumeValue = document.getElementById('volumeValue');

const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const currentScoreContainer = document.getElementById('currentScoreContainer');
const lastScore = document.getElementById('lastScore');

// Campaign Elementi
const worldTitle = document.getElementById('worldTitle');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');

// Nalaganje tekstur
const birdImg = new Image();
birdImg.src = 'assets/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

const floorImg = new Image();
floorImg.src = 'assets/floor.png';

const backgroundImg = new Image();
backgroundImg.src = 'assets/background.png';

// Nalaganje zvokov
const flapSound = new Audio('assets/flap.wav');
const scoreSound = new Audio('assets/score.wav');
const hitSound = new Audio('assets/hit.wav');
const bgMusic = new Audio('assets/music.wav');

bgMusic.loop = true;

// Varen ovitek za localStorage 
const storage = {
    get: function(key) {
        try { return localStorage.getItem(key); } 
        catch (e) { return null; }
    },
    set: function(key, value) {
        try { localStorage.setItem(key, value); } 
        catch (e) {}
    }
};

// Nastavitve glasnosti
let savedVolume = storage.get('gameVolume');
let currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;

function updateVolumeDisplay() {
    volumeValue.innerText = Math.round(currentVolume * 100);
}

function updateVolumes() {
    flapSound.volume = currentVolume;
    scoreSound.volume = currentVolume;
    hitSound.volume = currentVolume;
    bgMusic.volume = currentVolume;
}

// Inicializiraj glasnosti in prikaz ob zagonu
updateVolumeDisplay();
updateVolumes();

// --- UI NAVIGACIJA ---

openSettingsBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    settingsMenu.style.display = 'flex';
});

closeSettingsBtn.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    mainMenu.style.display = 'flex';
});

openScoreBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    scoreMenu.style.display = 'flex';
});

closeScoreBtn.addEventListener('click', () => {
    scoreMenu.style.display = 'none';
    mainMenu.style.display = 'flex';
});


// --- CAMPAIGN LOGIKA ---

let defaultProgress = {
    1: { unlocked: true,  coins: [true, true, false] }, 
    2: { unlocked: true,  coins: [false, false, false] },
    3: { unlocked: false, coins: [false, false, false] },
    4: { unlocked: false, coins: [false, false, false] },
    5: { unlocked: false, coins: [false, false, false] },
    6: { unlocked: false, coins: [false, false, false] },
    7: { unlocked: false, coins: [false, false, false] },
    8: { unlocked: false, coins: [false, false, false] },
    9: { unlocked: false, coins: [false, false, false] }
};

let savedProgress = storage.get('campaignProgress');
let campaignProgress = savedProgress ? JSON.parse(savedProgress) : defaultProgress;

const campaignPages = [
    { title: "SURFACE", bgClass: "bg-surface", levels: ["LEVEL 1", "LEVEL 2", "BOSS 3"] },
    { title: "UNDERWATER", bgClass: "bg-water", levels: ["LEVEL 4", "LEVEL 5", "BOSS 6"] },
    { title: "LAVA CASTLE", bgClass: "bg-lava", levels: ["LEVEL 7", "LEVEL 8", "BOSS 9"] }
];
let currentCampaignPage = 0;

function updateCampaignUI() {
    const pageData = campaignPages[currentCampaignPage];
    
    worldTitle.innerText = pageData.title;
    menuBackground.className = `retro-bg ${pageData.bgClass}`;
    pageIndicator.innerText = `${currentCampaignPage + 1}/${campaignPages.length}`;

    prevPageBtn.disabled = currentCampaignPage === 0;
    nextPageBtn.disabled = currentCampaignPage === campaignPages.length - 1;

    const baseLevel = currentCampaignPage * 3; 

    for (let i = 0; i < 3; i++) {
        const levelNum = baseLevel + i + 1; 
        const btn = document.getElementById(`lvlBtn${i+1}`);
        const coinContainer = document.getElementById(`coins${i+1}`);
        const prog = campaignProgress[levelNum];

        btn.innerText = pageData.levels[i];

        if (prog.unlocked) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }

        if (i === 2 && prog.unlocked) {
            btn.classList.add('boss-btn');
        } else {
            btn.classList.remove('boss-btn');
        }

        const coinDivs = coinContainer.querySelectorAll('.coin');
        for (let c = 0; c < 3; c++) {
            if (prog.coins[c]) {
                coinDivs[c].classList.add('collected');
            } else {
                coinDivs[c].classList.remove('collected');
            }
        }
    }
}

openCampaignBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    campaignMenu.style.display = 'flex';
    menuBackground.style.display = 'block'; // Pokažemo barvno CSS ozadje
    currentCampaignPage = 0; 
    updateCampaignUI();
});

closeCampaignBtn.addEventListener('click', () => {
    campaignMenu.style.display = 'none';
    mainMenu.style.display = 'flex';
    menuBackground.style.display = 'none'; // Skrijemo barvno ozadje in spet pokažemo animiran canvas
});

prevPageBtn.addEventListener('click', () => {
    if (currentCampaignPage > 0) {
        currentCampaignPage--;
        updateCampaignUI();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentCampaignPage < campaignPages.length - 1) {
        currentCampaignPage++;
        updateCampaignUI();
    }
});

for (let i = 1; i <= 3; i++) {
    document.getElementById(`lvlBtn${i}`).addEventListener('click', resetGame);
}

// --- GLASNOST LOGIKA ---
function applyVolumeChange() {
    currentVolume = Math.round(currentVolume * 10) / 10;
    updateVolumeDisplay();
    updateVolumes();
    storage.set('gameVolume', currentVolume);
    
    if (flapSound.paused) {
        flapSound.currentTime = 0;
        flapSound.play().catch(()=>{});
    }
}

volMinus.addEventListener('click', () => {
    currentVolume -= 0.1;
    if (currentVolume < 0) currentVolume = 0;
    applyVolumeChange();
});

volPlus.addEventListener('click', () => {
    currentVolume += 0.1;
    if (currentVolume > 1) currentVolume = 1;
    applyVolumeChange();
});

// --- SPREMENLJIVKE IGRE ---
let frames = 0;
let gameState = 'MENU'; // 'MENU', 'READY', 'PLAYING', 'GAMEOVER'
let score = 0;
let bestScore = storage.get('bestScore') || 0;
bestScoreDisplay.innerText = bestScore;

let flashAlpha = 0; 
let blackFadeAlpha = 0; 
const gameSpeed = 2; 

function tryPlayMusic() {
    if (gameState === 'MENU') {
        bgMusic.play().catch(() => {
            document.addEventListener('click', () => {
                if (gameState === 'MENU') bgMusic.play().catch(() => {});
            }, { once: true });
        });
    }
}
tryPlayMusic();

// --- SCROLLING OBJEKTI ---
const scaledImageWidth = (1920 / 1085) * 512; 

const backgroundLayer = {
    x: 0,
    y: 0,
    width: scaledImageWidth,
    height: 512,
    dx: 0.5, 
    
    draw: function() {
        ctx.drawImage(backgroundImg, this.x, this.y, this.width, this.height);
        ctx.drawImage(backgroundImg, this.x + this.width, this.y, this.width, this.height);
    },
    update: function() {
        // Ozadje se premika vedno, razen ko smo mrtvi
        if (gameState === 'PLAYING' || gameState === 'MENU' || gameState === 'READY') {
            this.x -= this.dx;
            if (this.x <= -this.width) {
                this.x = 0;
            }
        }
    }
};

const floorLayer = {
    x: 0,
    y: 0, 
    width: scaledImageWidth,
    height: 512,
    dx: gameSpeed, 
    
    draw: function() {
        ctx.drawImage(floorImg, this.x, this.y, this.width, this.height);
        ctx.drawImage(floorImg, this.x + this.width, this.y, this.width, this.height);
    },
    update: function() {
        // Tla se premikajo vedno, razen ko smo mrtvi
        if (gameState === 'PLAYING' || gameState === 'MENU' || gameState === 'READY') {
            this.x -= this.dx;
            if (this.x <= -this.width) {
                this.x = 0;
            }
        }
        
        // Trki s tlemi se preverjajo samo, če je igra v teku ali med padcem
        if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
            const hitGroundY = canvas.height * 0.75; 
            const bh = bird.getHitbox();
            
            if (bh.y + bh.h >= hitGroundY) {
                gameOver();
            }
        }
    }
};

// Ptič
const bird = {
    x: 50,
    y: 150,
    width: 60,  
    height: 42, 
    hitboxW: 30, 
    hitboxH: 20,
    velocity: 0,
    gravity: 0.25,
    jump: -4.5,
    
    getHitbox: function() {
        return {
            x: this.x + (this.width - this.hitboxW) / 2, 
            y: this.y + (this.height - this.hitboxH) / 2,
            w: this.hitboxW,
            h: this.hitboxH
        };
    },

    draw: function() {
        let rotation = 0;
        
        if (gameState === 'GAMEOVER' && this.velocity === 0) {
            rotation = Math.PI / 2;
        } else if (this.velocity > 0) {
            rotation = Math.min(Math.PI / 2, this.velocity * 0.1); 
        } else {
            rotation = -25 * Math.PI / 180; 
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(rotation);
        ctx.drawImage(birdImg, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    },
    update: function() {
        // Zibanje v meniju!
        if (gameState === 'MENU' || gameState === 'READY') {
            this.y = 150 + Math.sin(Date.now() / 200) * 5;
        } 
        // Padanje med igro in po smrti
        else if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
            this.velocity += this.gravity;
            this.y += this.velocity;
            
            const hitGroundY = canvas.height * 0.75; 
            const bh = this.getHitbox();
            
            if (bh.y + bh.h >= hitGroundY) {
                this.y = hitGroundY - (this.height + this.hitboxH) / 2;
                this.velocity = 0; 
            }
        }
    },
    flap: function() {
        if (gameState === 'PLAYING') {
            this.velocity = this.jump;
            flapSound.currentTime = 0;
            flapSound.play().catch(e => {}); 
        }
    },
    reset: function() {
        this.y = 150;
        this.velocity = 0;
    }
};

// Cevi
const pipes = {
    items: [],
    width: 52,
    gap: 120, 
    dx: gameSpeed, 
    
    draw: function() {
        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            
            ctx.save();
            ctx.translate(p.x, p.y); 
            ctx.scale(1, -1); 
            ctx.drawImage(pipeImg, 0, 0, this.width, 512);
            ctx.restore();

            ctx.drawImage(pipeImg, p.x, p.y + this.gap, this.width, 512);
        }
    },
    update: function() {
        if (gameState !== 'PLAYING') return; 

        if (frames % 100 === 0) {
            let hitGroundY = canvas.height * 0.75; 
            let minPipeHeight = 50; 
            let maxY = hitGroundY - this.gap - minPipeHeight; 
            
            let randomY = Math.random() * (maxY - minPipeHeight) + minPipeHeight;
            
            this.items.push({
                x: canvas.width,
                y: randomY
            });
        }

        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            p.x -= this.dx;

            const bh = bird.getHitbox(); 
            const top_pipe_tip = p.y;
            const bottom_pipe_tip = p.y + this.gap;

            if (bh.x + bh.w > p.x && bh.x < p.x + this.width) {
                if (bh.y < top_pipe_tip || bh.y + bh.h > bottom_pipe_tip) {
                    gameOver();
                }
            }

            if (p.x === bird.x) {
                score++;
                scoreSound.currentTime = 0;
                scoreSound.play().catch(e => {});
            }

            if (p.x + this.width <= 0) {
                this.items.shift();
                i--;
            }
        }
    },
    reset: function() {
        this.items = [];
    }
};

function gameOver() {
    if (gameState === 'GAMEOVER') return; 
    gameState = 'GAMEOVER';

    hitSound.play().catch(e => {});
    flashAlpha = 1; 
    
    bgMusic.pause(); 
    
    if (score > bestScore) {
        bestScore = score;
        storage.set('bestScore', bestScore); 
        bestScoreDisplay.innerText = bestScore;
    }
    
    lastScore.innerText = score;
    currentScoreContainer.style.display = 'block'; 
    
    setTimeout(() => {
        let fadeInterval = setInterval(() => {
            blackFadeAlpha += 0.05;
            
            if (blackFadeAlpha >= 1) {
                clearInterval(fadeInterval);
                
                // Ponastavimo igro v ozadju, da bo ob zagonu menija že tekla lepa animacija
                bird.reset();
                pipes.reset();
                gameState = 'MENU';
                
                menuBackground.style.display = 'none'; // Odstranimo CSS ozadje, da pokažemo canvas
                
                mainMenu.style.transition = 'none';
                mainMenu.style.opacity = '0';
                mainMenu.style.display = 'flex';
                
                requestAnimationFrame(() => {
                    mainMenu.style.transition = 'opacity 0.8s ease-in-out';
                    mainMenu.style.opacity = '1';
                    
                    blackFadeAlpha = 0; 
                });
                
                bgMusic.currentTime = 0;
                bgMusic.play().catch(e => {});
            }
        }, 30);
    }, 1200);
}

function resetGame() {
    bird.reset();
    pipes.reset();
    score = 0;
    frames = 0;
    flashAlpha = 0;
    blackFadeAlpha = 0; 
    gameState = 'READY'; 
    
    const menus = [menuBackground, mainMenu, settingsMenu, scoreMenu, campaignMenu];
    menus.forEach(menu => {
        menu.style.transition = 'opacity 0.4s ease';
        menu.style.opacity = '0';
    });

    setTimeout(() => {
        menus.forEach(menu => {
            menu.style.display = 'none';
            menu.style.opacity = '1'; 
            menu.style.transition = 'none';
        });
        
        bgMusic.pause();
        bgMusic.currentTime = 0;
        gameState = 'PLAYING'; 
    }, 400); 
}

const fps = 60;
const fpsInterval = 1000 / fps;
let then = performance.now();

function draw(now) {
    requestAnimationFrame(draw);

    let elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        backgroundLayer.update();
        backgroundLayer.draw();

        pipes.update();
        pipes.draw();

        floorLayer.update();
        floorLayer.draw();

        bird.update();
        bird.draw();

        if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'READY') {
            if (gameState === 'PLAYING') frames++;

            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.font = '30px "Press Start 2P"'; 
            
            ctx.textAlign = 'center'; 
            ctx.strokeText(score, canvas.width / 2, 70);
            ctx.fillText(score, canvas.width / 2, 70);
            ctx.textAlign = 'start'; 
        }

        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashAlpha -= 0.05; 
        }

        if (blackFadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${blackFadeAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}

canvas.addEventListener('mousedown', () => {
    bird.flap();
});
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') bird.flap();
});
startBtn.addEventListener('click', resetGame);

let assetsLoaded = 0;
const totalAssets = 2; 

function checkAssets() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        requestAnimationFrame(function(time) {
            then = time;
            draw(time);
        });
    }
}

floorImg.onload = checkAssets;
backgroundImg.onload = checkAssets;