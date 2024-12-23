// Minesweeper Game Logic

class Minesweeper {
    constructor() {
        // Game configuration
        this.config = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 24, cols: 24, mines: 99 }
        };
        
        // Game state
        this.board = [];
        this.mineLocations = new Set();
        this.revealed = new Set();
        this.flagged = new Set();
        this.gameOver = false;
        this.isFirstClick = true;
        this.timer = null;
        this.timeElapsed = 0;
        
        // DOM elements
        this.boardElement = document.getElementById('game-board');
        this.statusElement = document.getElementById('game-status');
        this.mineCountElement = document.getElementById('mine-count');
        this.timeElement = document.getElementById('time');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameButton = document.getElementById('new-game');
        
        // Sound effects
        this.clickSound = document.getElementById('click-sound');
        this.explosionSound = document.getElementById('explosion-sound');
        this.winSound = document.getElementById('win-sound');
        
        // Event listeners
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.difficultySelect.addEventListener('change', () => this.startNewGame());
        
        // Start initial game
        this.startNewGame();
    }
    
    startNewGame() {
        // Reset game state
        clearInterval(this.timer);
        this.board = [];
        this.mineLocations.clear();
        this.revealed.clear();
        this.flagged.clear();
        this.gameOver = false;
        this.isFirstClick = true;
        this.timeElapsed = 0;
        this.timeElement.textContent = '0';
        
        // Get current difficulty settings
        const difficulty = this.difficultySelect.value;
        const { rows, cols, mines } = this.config[difficulty];
        
        // Initialize board
        this.initializeBoard(rows, cols);
        this.mineCountElement.textContent = mines;
        this.statusElement.textContent = 'Good luck!';
        
        // Render board
        this.renderBoard();
    }
    
    initializeBoard(rows, cols) {
        // Create empty board
        for (let i = 0; i < rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < cols; j++) {
                this.board[i][j] = {
                    isMine: false,
                    neighborMines: 0
                };
            }
        }
        
        // Set grid style
        this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    }
    
    placeMines(firstClickRow, firstClickCol) {
        const difficulty = this.difficultySelect.value;
        const { rows, cols, mines } = this.config[difficulty];
        
        // Place mines randomly, avoiding first click
        let minesToPlace = mines;
        while (minesToPlace > 0) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            
            // Skip if mine already exists or if it's the first click location
            if (this.board[row][col].isMine || 
                (row === firstClickRow && col === firstClickCol)) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            this.mineLocations.add(`${row},${col}`);
            minesToPlace--;
        }
        
        // Calculate neighbor mines
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValidCell(row, col) {
        const difficulty = this.difficultySelect.value;
        const { rows, cols } = this.config[difficulty];
        return row >= 0 && row < rows && col >= 0 && col < cols;
    }
    
    renderBoard() {
        const difficulty = this.difficultySelect.value;
        const { rows, cols } = this.config[difficulty];
        
        // Clear existing board
        this.boardElement.innerHTML = '';
        
        // Create cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add event listeners
                cell.addEventListener('click', (e) => this.handleClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });
                
                this.boardElement.appendChild(cell);
            }
        }
    }
    
    handleClick(row, col) {
        if (this.gameOver || this.flagged.has(`${row},${col}`)) {
            return;
        }
        
        // Handle first click
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        // Play click sound
        this.clickSound.play();
        
        // Check if mine
        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.explosionSound.play();
            this.revealAllMines();
            this.statusElement.textContent = 'Game Over!';
            clearInterval(this.timer);
            return;
        }
        
        // Reveal cell
        this.revealCell(row, col);
        
        // Check win condition
        if (this.checkWin()) {
            this.gameOver = true;
            this.winSound.play();
            this.statusElement.textContent = 'You Win!';
            clearInterval(this.timer);
        }
    }
    
    handleRightClick(row, col) {
        if (this.gameOver || this.revealed.has(`${row},${col}`)) {
            return;
        }
        
        const key = `${row},${col}`;
        const cell = this.boardElement.children[row * this.config[this.difficultySelect.value].cols + col];
        
        if (this.flagged.has(key)) {
            this.flagged.delete(key);
            cell.classList.remove('flagged');
            cell.textContent = '';
        } else {
            this.flagged.add(key);
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        }
        
        // Update mine counter
        const difficulty = this.difficultySelect.value;
        this.mineCountElement.textContent = this.config[difficulty].mines - this.flagged.size;
    }
    
    revealCell(row, col) {
        const key = `${row},${col}`;
        if (this.revealed.has(key) || this.flagged.has(key)) {
            return;
        }
        
        this.revealed.add(key);
        const cell = this.boardElement.children[row * this.config[this.difficultySelect.value].cols + col];
        cell.classList.add('revealed');
        
        if (this.board[row][col].neighborMines > 0) {
            cell.textContent = this.board[row][col].neighborMines;
            cell.classList.add(`n${this.board[row][col].neighborMines}`);
        } else {
            // Reveal neighbors for empty cells
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (this.isValidCell(newRow, newCol)) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
    
    revealAllMines() {
        this.mineLocations.forEach(loc => {
            const [row, col] = loc.split(',').map(Number);
            const cell = this.boardElement.children[row * this.config[this.difficultySelect.value].cols + col];
            cell.classList.add('revealed', 'mine');
            cell.textContent = '💣';
        });
    }
    
    checkWin() {
        const difficulty = this.difficultySelect.value;
        const { rows, cols, mines } = this.config[difficulty];
        const totalCells = rows * cols;
        return this.revealed.size === totalCells - mines;
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeElapsed++;
            this.timeElement.textContent = this.timeElapsed;
        }, 1000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});