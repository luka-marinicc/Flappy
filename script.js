const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const mainMenu = document.getElementById('mainMenu');
const startBtn = document.getElementById('startBtn');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const currentScoreDisplay = document.getElementById('currentScoreDisplay');
const lastScore = document.getElementById('lastScore');

const birdImg = new Image();
birdImg.src = 'assets/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

const floorImg = new Image();
floorImg.src = 'assets/floor.png';

const flapSound = new Audio('assets/flap.wav');
const scoreSound = new Audio('assets/score.wav');
const hitSound = new Audio('assets/hit.wav');

flapSound.volume = 0.5;
scoreSound.volume = 0.5;
hitSound.volume = 0.5;

let frames = 0;
let gameState = 'MENU'; 
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
bestScoreDisplay.innerText = bestScore;

let flashAlpha = 0;
const bgStyle = '#4ec0ca';

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
        if (this.velocity > 0) {
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
        this.velocity += this.gravity;
        this.y += this.velocity;
    },
    flap: function() {
        this.velocity = this.jump;
        flapSound.currentTime = 0;
        flapSound.play().catch(e => {}); 
    },
    reset: function() {
        this.y = 150;
        this.velocity = 0;
    }
};

const pipes = {
    items: [],
    width: 52,
    gap: 120, 
    dx: 2, 
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
        if (frames % 100 === 0) {
            let groundY = canvas.height - 112; 
            let minPipeHeight = 50; 
            let maxY = groundY - this.gap - minPipeHeight; 
            
            this.items.push({
                x: canvas.width,
                y: Math.random() * (maxY - minPipeHeight) + minPipeHeight
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

const floor = {
    x: 0,
    y: canvas.height - 112, 
    width: 336, 
    height: 112,
    dx: 2,
    draw: function() {
        let overlap = 2;
        ctx.drawImage(floorImg, this.x, this.y, this.width + overlap, this.height);
        ctx.drawImage(floorImg, this.x + this.width - overlap, this.y, this.width + overlap, this.height);
    },
    update: function() {
        this.x -= this.dx;
        if (this.x <= -this.width) {
            this.x = 0;
        }
        
        const bh = bird.getHitbox();
        if (bh.y + bh.h >= this.y) {
            gameOver();
        }
    }
};

function gameOver() {
    hitSound.play().catch(e => {});
    flashAlpha = 1;
    gameState = 'MENU';
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        bestScoreDisplay.innerText = bestScore;
    }
    
    lastScore.innerText = score;
    currentScoreDisplay.style.display = 'block';
    
    setTimeout(() => {
        mainMenu.style.display = 'flex';
    }, 200);
}

function resetGame() {
    bird.reset();
    pipes.reset();
    score = 0;
    frames = 0;
    flashAlpha = 0;
    gameState = 'PLAYING';
    mainMenu.style.display = 'none';
}

const fps = 60;
const fpsInterval = 1000 / fps;
let then = performance.now();

function draw(now) {
    requestAnimationFrame(draw);

    let elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        ctx.fillStyle = bgStyle;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (gameState === 'PLAYING') {
            pipes.update();
            floor.update();
            bird.update();
            frames++;
        }

        pipes.draw();
        floor.draw();
        bird.draw();

        if (gameState === 'PLAYING') {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '35px "Courier New"';
            
            ctx.textAlign = 'center'; 
            ctx.fillText(score, canvas.width / 2, 50);
            ctx.strokeText(score, canvas.width / 2, 50);
            ctx.textAlign = 'start'; 
        }

        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashAlpha -= 0.05;
        }
    }
}

canvas.addEventListener('mousedown', () => {
    if (gameState === 'PLAYING') bird.flap();
});
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'PLAYING') bird.flap();
});
startBtn.addEventListener('click', resetGame);

floorImg.onload = () => {
    requestAnimationFrame(function(time) {
        then = time;
        draw(time);
    });
};