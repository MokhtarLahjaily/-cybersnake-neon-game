class SnakeGame {
    constructor() {
        this.gridSize = 20;
        this.cellSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.bombs = [];
        this.bombTimers = [];
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.difficulty = 'easy';
        this.speed = {
            easy: 150,
            medium: 100,
            hard: 50
        };
        this.bombSettings = {
            easy: {
                maxBombs: 1,
                spawnChance: 0.2,
                lifespan: 10000
            },
            medium: {
                maxBombs: 2,
                spawnChance: 0.3,
                lifespan: 8000
            },
            hard: {
                maxBombs: 3,
                spawnChance: 0.4,
                lifespan: 6000
            }
        };
        this.gameInterval = null;
        this.bombInterval = null;
        this.setupGame();
    }

    setupGame() {
        this.gameGrid = document.getElementById('game');
        this.scoreElement = document.getElementById('score');
        this.resetButton = document.getElementById('reset-btn');
        this.menuContainer = document.getElementById('menu-container');
        this.gameContainer = document.getElementById('game-container');
        this.confetti = document.getElementById('confetti');

        // Difficulty buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-button');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.difficulty = button.dataset.level;
                document.getElementById('start-game').disabled = false;
            });
        });

        document.getElementById('start-game').addEventListener('click', () => {
            this.menuContainer.style.display = 'none';
            this.gameContainer.style.display = 'flex';
            this.startGame();
        });

        this.resetButton.addEventListener('click', () => this.resetGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Ajout du support tactile
        document.addEventListener('touchstart', (e) => {
            if (!this.gameRunning) return;
            
            const touch = e.touches[0];
            const rect = this.gameGrid.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Diviser la grille en 4 zones pour le contrôle
            if (x < centerX && y < centerY) {
                // Haut-Gauche
                if (this.direction.y === 0) this.direction = { x: -1, y: 0 };
            } else if (x > centerX && y < centerY) {
                // Haut-Droite
                if (this.direction.y === 0) this.direction = { x: 1, y: 0 };
            } else if (x < centerX && y > centerY) {
                // Bas-Gauche
                if (this.direction.x === 0) this.direction = { x: 0, y: 1 };
            } else if (x > centerX && y > centerY) {
                // Bas-Droite
                if (this.direction.x === 0) this.direction = { x: 0, y: -1 };
            }
        });
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.updateScore();
            this.updateGame();
            this.gameInterval = setInterval(() => {
                if (this.gameRunning) {
                    this.updateGame();
                }
            }, this.speed[this.difficulty]);

            // Start bomb timer
            this.bombInterval = setInterval(() => {
                const settings = this.bombSettings[this.difficulty];
                if (Math.random() < settings.spawnChance && this.bombs.length < settings.maxBombs) {
                    this.placeBomb();
                }
            }, 5000); // Bomb check every 5 seconds
        }
    }

    resetGame() {
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
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y) || 
                (this.bomb && this.bomb.x === food.x && this.bomb.y === food.y));
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
        // Generate new bomb
        const bomb = this.generateBomb();
        this.bombs.push(bomb);
        
        // Set timer to remove bomb
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
        
        // Create grid cells
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.gameGrid.appendChild(cell);
        }

        // Update snake position
        const newHead = {
            x: (this.snake[0].x + this.direction.x + this.gridSize) % this.gridSize,
            y: (this.snake[0].y + this.direction.y + this.gridSize) % this.gridSize
        };

        // Check for collision with self
        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.gameRunning = false;
            this.showGameOver();
            return;
        }

        // Check for bomb collision
        const bombHit = this.bombs.some(bomb => newHead.x === bomb.x && newHead.y === bomb.y);
        if (bombHit) {
            this.gameRunning = false;
            this.showGameOver('BOOM!');
            return;
        }

        // Add new head
        this.snake.unshift(newHead);

        // Check for food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            this.showConfetti();
        } else {
            this.snake.pop();
        }

        // Update grid
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

    gameLoop() {
        if (this.gameRunning) {
            this.updateGame();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize the game
const game = new SnakeGame();
