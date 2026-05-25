const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elementi
const mainMenu = document.getElementById('mainMenu');
const settingsMenu = document.getElementById('settingsMenu');
const scoreMenu = document.getElementById('scoreMenu');
const campaignMenu = document.getElementById('campaignMenu');
const menuBackground = document.getElementById('menuBackground'); 
const campaignUI = document.getElementById('campaignUI'); 

const campaignGameOverMenu = document.getElementById('campaignGameOverMenu');
const levelCompleteMenu = document.getElementById('levelCompleteMenu');

const startBtn = document.getElementById('startBtn');
const openCampaignBtn = document.getElementById('openCampaignBtn');
const closeCampaignBtn = document.getElementById('closeCampaignBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const openScoreBtn = document.getElementById('openScoreBtn');
const closeScoreBtn = document.getElementById('closeScoreBtn');

const retryCampaignBtn = document.getElementById('retryCampaignBtn');
const campaignToMenuBtn = document.getElementById('campaignToMenuBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const victoryToMenuBtn = document.getElementById('victoryToMenuBtn');

const campaignProgressText = document.getElementById('campaignProgressText');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const currentScoreContainer = document.getElementById('currentScoreContainer');
const lastScore = document.getElementById('lastScore');

const musicVolMinus = document.getElementById('musicVolMinus');
const musicVolPlus = document.getElementById('musicVolPlus');
const musicVolumeValue = document.getElementById('musicVolumeValue');

const sfxVolMinus = document.getElementById('sfxVolMinus');
const sfxVolPlus = document.getElementById('sfxVolPlus');
const sfxVolumeValue = document.getElementById('sfxVolumeValue');

const worldTitle = document.getElementById('worldTitle');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');

// Nalaganje tekstur
const birdImg = new Image();
birdImg.src = 'assets/textures/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/textures/pipe.png';

const floorImg = new Image();
floorImg.src = 'assets/backgrounds/floor.png';

const backgroundImg = new Image();
backgroundImg.src = 'assets/backgrounds/background.png';

const coinImg = new Image();
coinImg.src = 'assets/textures/coin.png';

const lvl1BgImg = new Image();
lvl1BgImg.src = 'assets/backgrounds/level1.png';

// DODANO: Level 2 Ozadje
const lvl2BgImg = new Image();
lvl2BgImg.src = 'assets/backgrounds/level2.png';

// Nalaganje zvokov
const flapSound = new Audio('assets/sounds/flap.wav');
const scoreSound = new Audio('assets/sounds/score.wav'); 
const hitSound = new Audio('assets/sounds/hit.wav');
const gameOverSound = new Audio('assets/sounds/gameover.wav'); 
const victorySound = new Audio('assets/sounds/winner.wav'); 

// Glasba
const bgMusic = new Audio('assets/sounds/music.wav');
bgMusic.loop = true;

const endlessMusic = new Audio('assets/sounds/endless.wav');
endlessMusic.loop = true;

const surfaceMusic = new Audio('assets/sounds/surface.wav');
surfaceMusic.loop = true;

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

// --- SPREMENLJIVKE IGRE ---
let frames = 0;
let gameState = 'MENU'; 
let gameMode = 'ENDLESS'; 
let currentLevel = 0; 

let score = 0;
let bestScore = storage.get('bestScore') || 0;
bestScoreDisplay.innerText = bestScore;

let flashAlpha = 0; 
let blackFadeAlpha = 0; 

let gameSpeed = 2; 
let pipeSpawnTimer = 0; 
const maxGameSpeed = 4.2; 

let distanceTraveled = 0;
let currentLevelLength = 6000; 
let coinsSpawned = 0;
let coinsCollectedCurrent = [false, false, false]; 

let savedMusicVolume = storage.get('musicVolume');
let currentMusicVolume = savedMusicVolume !== null ? parseFloat(savedMusicVolume) : 0.5;

let savedSfxVolume = storage.get('sfxVolume');
let currentSfxVolume = savedSfxVolume !== null ? parseFloat(savedSfxVolume) : 0.5;

let currentFadeInterval = null;

function updateVolumeDisplays() {
    musicVolumeValue.innerText = Math.round(currentMusicVolume * 100);
    sfxVolumeValue.innerText = Math.round(currentSfxVolume * 100);
}

function updateVolumes() {
    flapSound.volume = currentSfxVolume;
    scoreSound.volume = currentSfxVolume;
    hitSound.volume = currentSfxVolume;
    gameOverSound.volume = currentSfxVolume; 
    victorySound.volume = currentSfxVolume; 
    
    if (!currentFadeInterval) {
        bgMusic.volume = (gameState === 'MENU') ? currentMusicVolume : 0;
        
        if (gameState === 'PLAYING' || gameState === 'READY') {
            if (gameMode === 'ENDLESS') {
                endlessMusic.volume = currentMusicVolume;
                surfaceMusic.volume = 0;
            } else if (gameMode === 'CAMPAIGN') {
                surfaceMusic.volume = currentMusicVolume;
                endlessMusic.volume = 0;
            }
        } else {
            endlessMusic.volume = 0;
            surfaceMusic.volume = 0;
        }
    }
}

function crossfadeMusic(fadeOutAudio, fadeInAudio) {
    if (currentFadeInterval) clearInterval(currentFadeInterval);
    
    if (fadeInAudio) {
        fadeInAudio.volume = 0;
        fadeInAudio.play().catch(()=>{});
    }
    
    let fadeStep = 0.05; 
    
    currentFadeInterval = setInterval(() => {
        let fadeComplete = true;
        
        if (fadeOutAudio && fadeOutAudio.volume > 0) {
            let newVol = fadeOutAudio.volume - fadeStep;
            fadeOutAudio.volume = newVol < 0 ? 0 : newVol;
            fadeComplete = false;
        } else if (fadeOutAudio && fadeOutAudio.volume === 0 && !fadeOutAudio.paused) {
            fadeOutAudio.pause();
        }
        
        if (fadeInAudio && fadeInAudio.volume < currentMusicVolume) {
            let newVol = fadeInAudio.volume + fadeStep;
            fadeInAudio.volume = newVol > currentMusicVolume ? currentMusicVolume : newVol;
            fadeComplete = false;
        }
        
        if (fadeComplete) {
            clearInterval(currentFadeInterval);
            currentFadeInterval = null;
        }
    }, 50);
}

updateVolumeDisplays();
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

function backToMainMenu() {
    gameState = 'MENU'; 
    bird.reset();       
    pipes.reset();
    coins.reset();
    
    const menus = [campaignGameOverMenu, levelCompleteMenu, campaignMenu];
    menus.forEach(m => m.style.display = 'none');
    
    menuBackground.className = 'retro-bg bg-surface';
    menuBackground.style.backgroundColor = ''; 
    menuBackground.style.display = 'none';
    
    mainMenu.style.transition = 'none';
    mainMenu.style.opacity = '0';
    mainMenu.style.display = 'flex';
    
    requestAnimationFrame(() => {
        mainMenu.style.transition = 'opacity 0.8s ease-in-out';
        mainMenu.style.opacity = '1';
    });
    
    crossfadeMusic(null, bgMusic);
}

campaignToMenuBtn.addEventListener('click', backToMainMenu);
victoryToMenuBtn.addEventListener('click', backToMainMenu);

retryCampaignBtn.addEventListener('click', () => {
    resetGame('CAMPAIGN', currentLevel);
});

nextLevelBtn.addEventListener('click', () => {
    resetGame('CAMPAIGN', currentLevel + 1);
});

// --- CAMPAIGN PROGRESS LOGIKA ---
let defaultProgress = {
    1: { unlocked: true,  coins: [false, false, false] }, 
    2: { unlocked: false, coins: [false, false, false] },
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
    menuBackground.style.display = 'block'; 
    currentCampaignPage = 0; 
    updateCampaignUI();
});

closeCampaignBtn.addEventListener('click', () => {
    campaignMenu.style.display = 'none';
    mainMenu.style.display = 'flex';
    menuBackground.style.display = 'none'; 
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

function applyMusicVolumeChange() {
    currentMusicVolume = Math.round(currentMusicVolume * 10) / 10;
    updateVolumeDisplays();
    updateVolumes();
    storage.set('musicVolume', currentMusicVolume);
}

musicVolMinus.addEventListener('click', () => {
    currentMusicVolume -= 0.1;
    if (currentMusicVolume < 0) currentMusicVolume = 0;
    applyMusicVolumeChange();
});
musicVolPlus.addEventListener('click', () => {
    currentMusicVolume += 0.1;
    if (currentMusicVolume > 1) currentMusicVolume = 1;
    applyMusicVolumeChange();
});

function applySfxVolumeChange() {
    currentSfxVolume = Math.round(currentSfxVolume * 10) / 10;
    updateVolumeDisplays();
    updateVolumes();
    storage.set('sfxVolume', currentSfxVolume);
    if (flapSound.paused) {
        flapSound.currentTime = 0;
        flapSound.play().catch(()=>{});
    }
}
sfxVolMinus.addEventListener('click', () => {
    currentSfxVolume -= 0.1;
    if (currentSfxVolume < 0) currentSfxVolume = 0;
    applySfxVolumeChange();
});
sfxVolPlus.addEventListener('click', () => {
    currentSfxVolume += 0.1;
    if (currentSfxVolume > 1) currentSfxVolume = 1;
    applySfxVolumeChange();
});

function tryPlayMusic() {
    if (gameState === 'MENU') {
        bgMusic.volume = currentMusicVolume;
        bgMusic.play().catch(() => {
            document.addEventListener('click', () => {
                if (gameState === 'MENU') {
                    bgMusic.volume = currentMusicVolume;
                    bgMusic.play().catch(() => {});
                }
            }, { once: true });
        });
    }
}
tryPlayMusic();

// --- SCROLLING OBJEKTI ---
const scaledBgWidth = Math.ceil((1920 / 1085) * 512); 
const scaledCampaignBgWidth = Math.ceil((576 / 324) * 512); 

const backgroundLayer = {
    x: 0,
    y: 0,
    
    draw: function() {
        let imgToDraw = backgroundImg;
        let w = scaledBgWidth;
        
        if (gameMode === 'CAMPAIGN') {
            if (currentLevel === 1) {
                imgToDraw = lvl1BgImg;
                w = scaledCampaignBgWidth;
            } else if (currentLevel === 2) {
                imgToDraw = lvl2BgImg;
                w = scaledCampaignBgWidth;
            }
        }

        let drawX = Math.floor(this.x);
        ctx.drawImage(imgToDraw, drawX, this.y, w, 512);
        ctx.drawImage(imgToDraw, drawX + w - 1, this.y, w, 512);
    },
    update: function() {
        if (gameState === 'PLAYING' || gameState === 'MENU' || gameState === 'READY') {
            let currentDx = (gameState === 'PLAYING') ? gameSpeed * 0.25 : 0.5;
            this.x -= currentDx;
            
            let w = scaledBgWidth;
            if (gameMode === 'CAMPAIGN' && (currentLevel === 1 || currentLevel === 2)) {
                w = scaledCampaignBgWidth;
            }
            if (this.x <= -w) {
                this.x += w; 
            }
        }
    }
};

const floorLayer = {
    x: 0,
    y: 0, 
    width: scaledBgWidth, 
    height: 512,
    
    draw: function() {
        let drawX = Math.floor(this.x);
        ctx.drawImage(floorImg, drawX, this.y, this.width, this.height);
        ctx.drawImage(floorImg, drawX + this.width - 1, this.y, this.width, this.height);
    },
    update: function() {
        if (gameState === 'PLAYING' || gameState === 'MENU' || gameState === 'READY') {
            let currentDx = (gameState === 'PLAYING') ? gameSpeed : 2;
            this.x -= currentDx;
            if (this.x <= -this.width) {
                this.x += this.width;
            }
        }
        
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
        if (gameState === 'MENU' || gameState === 'READY') {
            this.y = 150 + Math.sin(Date.now() / 200) * 5;
        } 
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

// KOVANCI
const coins = {
    items: [],
    size: 30, 
    
    draw: function() {
        for (let i = 0; i < this.items.length; i++) {
            let c = this.items[i];
            if (!c.collected) {
                let actualY = c.baseY;
                
                // V Level 2 kovanec sledi gibanju svoje cevi, v ostalih samo malo lebdi
                if (gameMode === 'CAMPAIGN' && currentLevel === 2) {
                    actualY += Math.sin(frames * 0.05 + c.pipeBobPhase) * 45;
                } else {
                    actualY += Math.sin(frames * 0.1 + c.coinBobPhase) * 8;
                }

                ctx.drawImage(coinImg, c.x, actualY, this.size, this.size);
            }
        }
    },
    update: function() {
        if (gameState !== 'PLAYING') return;

        for (let i = 0; i < this.items.length; i++) {
            let c = this.items[i];
            c.x -= gameSpeed;

            if (!c.collected) {
                const bh = bird.getHitbox();
                
                let actualY = c.baseY;
                if (gameMode === 'CAMPAIGN' && currentLevel === 2) {
                    actualY += Math.sin(frames * 0.05 + c.pipeBobPhase) * 45;
                } else {
                    actualY += Math.sin(frames * 0.1 + c.coinBobPhase) * 8;
                }
                
                if (bh.x < c.x + this.size &&
                    bh.x + bh.w > c.x &&
                    bh.y < actualY + this.size &&
                    bh.h + bh.y > actualY) {
                    
                    c.collected = true;
                    coinsCollectedCurrent[c.id] = true;
                    
                    document.getElementById(`uiCoin${c.id}`).classList.add('collected');
                    
                    scoreSound.currentTime = 0;
                    scoreSound.play().catch(e => {});
                }
            }

            if (c.x + this.size <= 0) {
                this.items.shift();
                i--;
            }
        }
    },
    reset: function() {
        this.items = [];
    }
}

// Cevi
const pipes = {
    items: [],
    width: 52,
    gap: 120, 
    
    draw: function() {
        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            
            // Izračun dejanske Y pozicije cevi (animacija za Level 2)
            let currentY = p.baseY;
            if (gameMode === 'CAMPAIGN' && currentLevel === 2) {
                currentY += Math.sin(frames * 0.05 + p.bobPhase) * 45;
            }

            ctx.save();
            ctx.translate(p.x, currentY); 
            ctx.scale(1, -1); 
            ctx.drawImage(pipeImg, 0, 0, this.width, 512);
            ctx.restore();

            ctx.drawImage(pipeImg, p.x, currentY + this.gap, this.width, 512);
        }
    },
    update: function() {
        if (gameState !== 'PLAYING') return; 

        let stopSpawning = false;
        if (gameMode === 'CAMPAIGN' && distanceTraveled > currentLevelLength - 300) {
            stopSpawning = true;
        }

        pipeSpawnTimer += gameSpeed; 
        if (pipeSpawnTimer >= 220 && !stopSpawning) {
            pipeSpawnTimer = 0; 
            
            let hitGroundY = canvas.height * 0.75; 
            let minPipeHeight = 50; 
            
            // Omejitve generiranja (V Level 2 dodamo buffer, da cevi ne zbežijo v tla ali strop ko lebdijo)
            let amplitude = (gameMode === 'CAMPAIGN' && currentLevel === 2) ? 45 : 0;
            let minY = minPipeHeight + amplitude;
            let maxY = hitGroundY - this.gap - minPipeHeight - amplitude; 
            
            let randomY = Math.random() * (maxY - minY) + minY;
            let pBobPhase = Math.random() * Math.PI * 2; // Naključni ritem za Level 2
            
            this.items.push({
                x: canvas.width,
                baseY: randomY, // Shranimo originalno središče
                bobPhase: pBobPhase,
                passed: false 
            });

            if (gameMode === 'CAMPAIGN' && coinsSpawned < 3) {
                let spawnOffset = canvas.width - bird.x; 

                let triggerDistances = [
                    (currentLevelLength * 0.25) - spawnOffset,
                    (currentLevelLength * 0.50) - spawnOffset,
                    (currentLevelLength * 0.75) - spawnOffset
                ];

                if (distanceTraveled >= triggerDistances[coinsSpawned]) {
                    coins.items.push({
                        x: canvas.width + this.width / 2 - coins.size / 2, 
                        baseY: randomY + this.gap / 2 - coins.size / 2,
                        pipeBobPhase: pBobPhase, // Podeduje gibanje cevi (Za Level 2)
                        coinBobPhase: Math.random() * Math.PI * 2, // Za normalno lebdenje
                        collected: false,
                        id: coinsSpawned 
                    });
                    coinsSpawned++;
                }
            }
        }

        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            p.x -= gameSpeed; 

            // Izračun trenutnega Y cevi med trki
            let currentY = p.baseY;
            if (gameMode === 'CAMPAIGN' && currentLevel === 2) {
                currentY += Math.sin(frames * 0.05 + p.bobPhase) * 45;
            }

            const bh = bird.getHitbox(); 
            const top_pipe_tip = currentY;
            const bottom_pipe_tip = currentY + this.gap;

            if (bh.x + bh.w > p.x && bh.x < p.x + this.width) {
                if (bh.y < top_pipe_tip || bh.y + bh.h > bottom_pipe_tip) {
                    gameOver();
                }
            }

            if (p.x + this.width < bird.x && !p.passed) {
                score++;
                p.passed = true; 
                if (gameMode === 'ENDLESS') {
                    scoreSound.currentTime = 0;
                    scoreSound.play().catch(e => {});
                }
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

// ZMAGA V NIVOJU
function levelComplete() {
    if (gameState === 'GAMEOVER' || gameState === 'VICTORY') return; 
    gameState = 'VICTORY';

    for (let i = 0; i < 3; i++) {
        if (coinsCollectedCurrent[i]) {
            campaignProgress[currentLevel].coins[i] = true;
        }
        
        const vCoin = document.getElementById(`victoryCoin${i}`);
        if (coinsCollectedCurrent[i]) vCoin.classList.add('collected');
        else vCoin.classList.remove('collected');
    }
    
    if (currentLevel < 9) {
        campaignProgress[currentLevel + 1].unlocked = true;
        nextLevelBtn.style.display = 'block';
    } else {
        nextLevelBtn.style.display = 'none'; 
    }
    
    storage.set('campaignProgress', JSON.stringify(campaignProgress));
    
    surfaceMusic.pause();
    surfaceMusic.currentTime = 0;

    setTimeout(() => {
        let fadeInterval = setInterval(() => {
            blackFadeAlpha += 0.05;
            
            if (blackFadeAlpha >= 1) {
                clearInterval(fadeInterval);
                
                bird.reset();
                pipes.reset();
                coins.reset();
                
                campaignUI.style.display = 'none';
                
                menuBackground.className = 'retro-bg';
                menuBackground.style.backgroundColor = '#b08d13'; 
                menuBackground.style.display = 'block'; 
                
                levelCompleteMenu.style.transition = 'none';
                levelCompleteMenu.style.opacity = '0';
                levelCompleteMenu.style.display = 'flex';
                
                updateCampaignUI(); 
                
                victorySound.currentTime = 0;
                victorySound.play().catch(e => {});
                
                requestAnimationFrame(() => {
                    levelCompleteMenu.style.transition = 'opacity 0.8s ease-in-out';
                    levelCompleteMenu.style.opacity = '1';
                    blackFadeAlpha = 0; 
                });
            }
        }, 30);
    }, 1000); 
}

// PORAZ
function gameOver() {
    if (gameState === 'GAMEOVER' || gameState === 'VICTORY') return; 
    gameState = 'GAMEOVER';

    hitSound.play().catch(e => {});
    
    flashAlpha = 1; 
    
    if(currentFadeInterval) clearInterval(currentFadeInterval);
    endlessMusic.pause();
    endlessMusic.currentTime = 0;
    surfaceMusic.pause();
    surfaceMusic.currentTime = 0;
    
    if (gameMode === 'ENDLESS') {
        if (score > bestScore) {
            bestScore = score;
            storage.set('bestScore', bestScore); 
            bestScoreDisplay.innerText = bestScore;
        }
        lastScore.innerText = score;
        currentScoreContainer.style.display = 'block'; 
    }
    
    setTimeout(() => {
        let fadeInterval = setInterval(() => {
            blackFadeAlpha += 0.05;
            
            if (blackFadeAlpha >= 1) {
                clearInterval(fadeInterval);
                
                bird.reset();
                pipes.reset();
                coins.reset();
                gameState = 'MENU';
                
                campaignUI.style.display = 'none';
                menuBackground.style.display = 'none'; 
                
                let targetMenu = mainMenu;
                
                if(gameMode === 'CAMPAIGN') {
                    targetMenu = campaignGameOverMenu;
                    menuBackground.style.display = 'block'; 
                    let progressPercent = Math.min((distanceTraveled / currentLevelLength) * 100, 100).toFixed(0);
                    campaignProgressText.innerText = `${progressPercent}%`;
                }

                targetMenu.style.transition = 'none';
                targetMenu.style.opacity = '0';
                targetMenu.style.display = 'flex';
                
                if (gameMode === 'CAMPAIGN') {
                    gameOverSound.currentTime = 0;
                    gameOverSound.play().catch(e => {});
                }
                
                requestAnimationFrame(() => {
                    targetMenu.style.transition = 'opacity 0.8s ease-in-out';
                    targetMenu.style.opacity = '1';
                    blackFadeAlpha = 0; 
                });
                
                if (gameMode === 'ENDLESS') {
                    crossfadeMusic(null, bgMusic);
                }
            }
        }, 30);
    }, 1200);
}

function resetGame(mode, level = 0) {
    gameMode = mode;
    currentLevel = level;
    
    bird.reset();
    pipes.reset();
    coins.reset();
    score = 0;
    frames = 0;
    distanceTraveled = 0;
    
    if (gameMode === 'CAMPAIGN') {
        gameSpeed = 2.5; 
        coinsSpawned = 0;
        coinsCollectedCurrent = [false, false, false];
        
        document.getElementById('progressFill').style.width = '0%';
        for(let i=0; i<3; i++) {
            document.getElementById(`uiCoin${i}`).classList.remove('collected');
        }
    } else {
        gameSpeed = 2; 
    }
    
    pipeSpawnTimer = 0;
    flashAlpha = 0;
    blackFadeAlpha = 0; 
    gameState = 'READY'; 
    
    const menus = [menuBackground, mainMenu, settingsMenu, scoreMenu, campaignMenu, campaignGameOverMenu, levelCompleteMenu];
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
        
        if (gameMode === 'CAMPAIGN') {
            campaignUI.style.display = 'flex';
            crossfadeMusic(bgMusic, surfaceMusic);
        } else {
            crossfadeMusic(bgMusic, endlessMusic);
        }
        
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

        coins.update();
        coins.draw();

        floorLayer.update();
        floorLayer.draw();

        bird.update();
        bird.draw();

        if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'VICTORY' || gameState === 'READY') {
            if (gameState === 'PLAYING') {
                frames++;
                distanceTraveled += gameSpeed; 
                
                if (gameMode === 'ENDLESS' && gameSpeed < maxGameSpeed) {
                    gameSpeed += 0.0002; 
                }

                if (gameMode === 'CAMPAIGN') {
                    let progressPercent = Math.min((distanceTraveled / currentLevelLength) * 100, 100);
                    document.getElementById('progressFill').style.width = progressPercent + '%';

                    if (distanceTraveled >= currentLevelLength) {
                        levelComplete();
                    }
                }
            }

            if (gameMode === 'ENDLESS') {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 4;
                ctx.font = '30px "Press Start 2P"'; 
                ctx.textAlign = 'center'; 
                ctx.strokeText(score, canvas.width / 2, 70);
                ctx.fillText(score, canvas.width / 2, 70);
                ctx.textAlign = 'start'; 
            }
        }

        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashAlpha -= 0.05; 
        }

        if (blackFadeAlpha > 0) {
            let fadeColor = gameState === 'VICTORY' ? '255, 255, 255' : '0, 0, 0';
            ctx.fillStyle = `rgba(${fadeColor}, ${blackFadeAlpha})`;
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

startBtn.addEventListener('click', () => resetGame('ENDLESS'));

document.getElementById('lvlBtn1').addEventListener('click', () => resetGame('CAMPAIGN', 1));
document.getElementById('lvlBtn2').addEventListener('click', () => resetGame('CAMPAIGN', 2));
document.getElementById('lvlBtn3').addEventListener('click', () => resetGame('CAMPAIGN', 3));

let assetsLoaded = 0;
const totalAssets = 5; // Spremenjeno na 5 zaradi lvl2BgImg

function checkAssets() {
    assetsLoaded++;
    if (assetsLoaded >= totalAssets) {
        requestAnimationFrame(function(time) {
            then = time;
            draw(time);
        });
    }
}

if (floorImg.complete) checkAssets(); else floorImg.onload = checkAssets;
if (backgroundImg.complete) checkAssets(); else backgroundImg.onload = checkAssets;
if (coinImg.complete) checkAssets(); else coinImg.onload = checkAssets;
if (lvl1BgImg.complete) checkAssets(); else lvl1BgImg.onload = checkAssets;
if (lvl2BgImg.complete) checkAssets(); else lvl2BgImg.onload = checkAssets;