class SnakeGame {
    constructor() {
        console.log('🐍 SnakeGame initialized');
        this.gridSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.speed = 150;
        
        // Mobile controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.threshold = 30;
        this.allowedTime = 500;
        
        this.setupGame();
    }

    setupGame() {
        console.log('🔧 Setting up game');
        this.gameGrid = document.getElementById('game');
        this.scoreElement = document.getElementById('score');
        this.resetButton = document.getElementById('reset-btn');
        this.menuContainer = document.getElementById('menu-container');
        this.gameContainer = document.getElementById('game-container');

        // Start button
        document.getElementById('start-game').addEventListener('click', () => {
            console.log('🎮 Starting game');
            this.menuContainer.style.display = 'none';
            this.gameContainer.style.display = 'flex';
            this.startGame();
        });

        // Reset button
        this.resetButton.addEventListener('click', () => this.resetGame());

        // Setup mobile controls
        this.setupTouchControls();
    }

    setupMobileControls() {
        console.log('📱 Setting up mobile controls');
        
        // Vérifier si les boutons existent déjà
        if (document.getElementById('mobile-controls')) {
            console.log('📱 Mobile controls already exist');
            return;
        }

        // Créer les boutons directionnels pour mobile
        const mobileControls = document.createElement('div');
        mobileControls.id = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="mobile-btn-container">
                <button class="mobile-btn" id="btn-up">⬆️</button>
                <div class="mobile-btn-row">
                    <button class="mobile-btn" id="btn-left">⬅️</button>
                    <button class="mobile-btn" id="btn-right">➡️</button>
                </div>
                <button class="mobile-btn" id="btn-down">⬇️</button>
            </div>
        `;
        
        // Insérer avant les contrôles
        const controlsElement = document.getElementById('controls');
        if (controlsElement) {
            this.gameContainer.insertBefore(mobileControls, controlsElement);
            console.log('📱 Mobile buttons created');
        }
        
        // Event listeners pour les boutons avec debug
        this.setupButtonListeners();
    }

    setupButtonListeners() {
        const buttons = [
            { id: 'btn-up', direction: { x: 0, y: -1 }, condition: () => this.direction.y === 0 },
            { id: 'btn-down', direction: { x: 0, y: 1 }, condition: () => this.direction.y === 0 },
            { id: 'btn-left', direction: { x: -1, y: 0 }, condition: () => this.direction.x === 0 },
            { id: 'btn-right', direction: { x: 1, y: 0 }, condition: () => this.direction.x === 0 }
        ];

        buttons.forEach(({ id, direction, condition }) => {
            const button = document.getElementById(id);
            if (button) {
                // Touch events pour mobile
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    console.log(`🔴 Button ${id} touched`);
                    if (this.gameRunning && condition()) {
                        this.direction = direction;
                        console.log(`🎯 Direction changed to`, direction);
                    }
                }, { passive: false });

                // Click events pour desktop testing
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🔵 Button ${id} clicked`);
                    if (this.gameRunning && condition()) {
                        this.direction = direction;
                        console.log(`🎯 Direction changed to`, direction);
                    }
                });

                console.log(`✅ Listeners added for ${id}`);
            } else {
                console.error(`❌ Button ${id} not found`);
            }
        });
    }

    setupTouchControls() {
        console.log('📱 Setting up touch controls');
        
        // Bind touch events to the game area
        const gameArea = this.gameGrid;
        if (gameArea) {
            gameArea.addEventListener('touchstart', (e) => {
                if (!this.gameRunning) return;
                
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
                this.startTime = new Date().getTime();
                
                e.preventDefault();
            }, { passive: false });

            gameArea.addEventListener('touchend', (e) => {
                if (!this.gameRunning) return;
                
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const time = new Date().getTime() - this.startTime;

                if (time < this.allowedTime) {
                    const deltaX = touchEndX - this.touchStartX;
                    const deltaY = touchEndY - this.touchStartY;
                    
                    // Horizontal swipe
                    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.threshold) {
                        if (deltaX > 0 && this.direction.x !== -1) {
                            this.direction = { x: 1, y: 0 };
                        } else if (deltaX < 0 && this.direction.x !== 1) {
                            this.direction = { x: -1, y: 0 };
                        }
                    }
                    // Vertical swipe
                    else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.threshold) {
                        if (deltaY > 0 && this.direction.y !== -1) {
                            this.direction = { x: 0, y: 1 };
                        } else if (deltaY < 0 && this.direction.y !== 1) {
                            this.direction = { x: 0, y: -1 };
                        }
                    }
                }
                
                e.preventDefault();
            }, { passive: false });

            gameArea.addEventListener('touchmove', (e) => {
                if (this.gameRunning) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    startGame() {
        console.log('🚀 Game starting');
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.updateScore();
            this.updateGame();
            this.gameInterval = setInterval(() => {
                if (this.gameRunning) {
                    this.updateGame();
                }
            }, this.speed[this.difficulty]);

            this.bombInterval = setInterval(() => {
                const settings = this.bombSettings[this.difficulty];
                if (Math.random() < settings.spawnChance && this.bombs.length < settings.maxBombs) {
                    this.placeBomb();
                }
            }, 5000);
            
            console.log('✅ Game started successfully');
        }
    }

    resetGame() {
        console.log('🔄 Resetting game');
        clearInterval(this.gameInterval);
        clearInterval(this.bombInterval);
        this.bombTimers.forEach(timer => clearTimeout(timer));
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.bombs = [];
        this.bombTimers = [];
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.updateScore();
        this.updateGame();
        this.menuContainer.style.display = 'flex';
        this.gameContainer.style.display = 'none';
    }

    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        console.log(`⌨️ Key pressed: ${e.key}`);
        const oldDirection = { ...this.direction };
        
        switch (e.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) this.direction = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) this.direction = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) this.direction = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) this.direction = { x: 1, y: 0 };
                break;
        }
        
        if (oldDirection.x !== this.direction.x || oldDirection.y !== this.direction.y) {
            console.log(`🎯 Keyboard direction changed to ${JSON.stringify(this.direction)}`);
        }
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y) || 
                this.bombs.some(bomb => bomb.x === food.x && bomb.y === food.y));
        return food;
    }

    generateBomb() {
        let bomb;
        do {
            bomb = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === bomb.x && segment.y === bomb.y) || 
                (this.food && this.food.x === bomb.x && this.food.y === bomb.y) ||
                this.bombs.some(existingBomb => existingBomb.x === bomb.x && existingBomb.y === bomb.y));
        return bomb;
    }

    placeBomb() {
        const bomb = this.generateBomb();
        this.bombs.push(bomb);
        
        const settings = this.bombSettings[this.difficulty];
        const bombTimer = setTimeout(() => {
            const index = this.bombs.indexOf(bomb);
            if (index > -1) {
                this.bombs.splice(index, 1);
                this.updateGame();
            }
        }, settings.lifespan);
        
        this.bombTimers.push(bombTimer);
    }

    updateGame() {
        this.gameGrid.innerHTML = '';
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.gameGrid.appendChild(cell);
        }

        const newHead = {
            x: (this.snake[0].x + this.direction.x + this.gridSize) % this.gridSize,
            y: (this.snake[0].y + this.direction.y + this.gridSize) % this.gridSize
        };

        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.gameRunning = false;
            this.showGameOver();
            return;
        }

        const bombHit = this.bombs.some(bomb => newHead.x === bomb.x && newHead.y === bomb.y);
        if (bombHit) {
            this.gameRunning = false;
            this.showGameOver('BOOM!');
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            this.showConfetti();
        } else {
            this.snake.pop();
        }

        const cells = this.gameGrid.children;
        this.snake.forEach(segment => cells[segment.y * this.gridSize + segment.x].classList.add('snake'));
        cells[this.food.y * this.gridSize + this.food.x].classList.add('food');
        this.bombs.forEach(bomb => cells[bomb.y * this.gridSize + bomb.x].classList.add('bomb'));
    }

    showConfetti() {
        const confettiContainer = this.confetti;
        confettiContainer.innerHTML = '';

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.borderRadius = '50%';
            
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`;
            
            confetti.style.animation = `fall ${Math.random() * 2 + 2}s ease-in-out`;
            confetti.style.animationFillMode = 'forwards';
            
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 2000);
    }

    showGameOver(message = 'GAME OVER') {
        console.log(`💀 Game Over: ${message}`);
        clearInterval(this.gameInterval);
        clearInterval(this.bombInterval);
        this.bombTimers.forEach(timer => clearTimeout(timer));
        const gameOver = document.createElement('div');
        gameOver.style.position = 'absolute';
        gameOver.style.top = '50%';
        gameOver.style.left = '50%';
        gameOver.style.transform = 'translate(-50%, -50%)';
        gameOver.style.color = '#ff0000';
        gameOver.style.textShadow = '0 0 10px #ff0000';
        gameOver.style.fontSize = '3em';
        gameOver.style.zIndex = '1000';
        gameOver.textContent = message;
        
        document.body.appendChild(gameOver);

        setTimeout(() => {
            gameOver.remove();
            this.resetGame();
        }, 2000);
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }
}

// Initialize the game
console.log('🚀 Initializing CyberSnake Game');
const game = new SnakeGame();