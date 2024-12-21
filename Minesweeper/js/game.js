// Minesweeper Game Core Logic

// Game difficulty configurations
const DIFFICULTY_LEVELS = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 24, cols: 24, mines: 99 }
};

// Cell class to manage individual cell state
class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.adjacentMines = 0;
    }
}

// Main Game class
class Game {
    constructor() {
        this.board = [];
        this.difficulty = 'easy';
        this.isGameOver = false;
        this.isFirstClick = true;
        this.minesCount = 0;
        this.revealedCount = 0;
        this.timeElapsed = 0;
        this.timerInterval = null;
        
        // Initialize sound effects
        this.sounds = {
            reveal: new Audio('sounds/reveal.mp3'),
            explosion: new Audio('sounds/explosion.mp3'),
            flag: new Audio('sounds/flag.mp3'),
            win: new Audio('sounds/win.mp3')
        };
        
        // Set volume for all sounds (subtle)
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
        
        this.setupEventListeners();
    }

    // Initialize game with selected difficulty
    initialize(difficulty = 'easy') {
        this.difficulty = difficulty;
        this.isGameOver = false;
        this.isFirstClick = true;
        const config = DIFFICULTY_LEVELS[difficulty];
        this.minesCount = config.mines;
        this.rows = config.rows;
        this.cols = config.cols;
        this.createBoard();
        this.renderBoard();
    }

    // Set up event listeners for game board
    setupEventListeners() {
        const gameBoard = document.getElementById('gameBoard');
        
        // Left click handler
        gameBoard.addEventListener('click', (e) => {
            if (this.isGameOver) return;
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.handleCellClick(row, col);
        });

        // Right click handler
        gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.isGameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.toggleFlag(row, col);
        });

        // Touch support for flagging (long press)
        let touchTimer;
        gameBoard.addEventListener('touchstart', (e) => {
            if (this.isGameOver) return;
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            touchTimer = setTimeout(() => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.toggleFlag(row, col);
            }, 500);
        });

        gameBoard.addEventListener('touchend', () => {
            clearTimeout(touchTimer);
        });
    }

    // Create empty game board
    createBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = new Cell(row, col);
            }
        }
    }

    // Place mines randomly (called after first click)
    placeMines(firstClickRow, firstClickCol) {
        let minesToPlace = this.minesCount;
        while (minesToPlace > 0) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Skip if mine already exists or if it's the first clicked cell
            if (this.board[row][col].isMine || 
                (row === firstClickRow && col === firstClickCol)) {
                continue;
            }

            this.board[row][col].isMine = true;
            minesToPlace--;
        }
        this.calculateAdjacentMines();
    }

    // Calculate adjacent mines for each cell
    calculateAdjacentMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].adjacentMines = this.countAdjacentMines(row, col);
                }
            }
        }
    }

    // Count mines adjacent to a cell
    countAdjacentMines(row, col) {
        let count = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    // Check if cell coordinates are valid
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    // Get remaining mines count
    getRemainingMines() {
        let flaggedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isFlagged) {
                    flaggedCount++;
                }
            }
        }
        return this.minesCount - flaggedCount;
    }

    // Check if game is won
    checkWin() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (!cell.isMine && !cell.isRevealed) {
                    return false;
                }
            }
        }
        return true;
    }

    // Start timer
    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            document.getElementById('timeCount').textContent = this.timeElapsed;
        }, 1000);
    }

    // Stop timer
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Handle cell click
    handleCellClick(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isFlagged || cell.isRevealed) return;
        
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        if (cell.isMine) {
            this.gameOver(false);
            return;
        }
        
        this.revealCell(row, col);
        
        if (this.checkWin()) {
            this.gameOver(true);
        }
    }

    // Reveal cell and handle empty cells
    revealCell(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.revealedCount++;
        
        // Play reveal sound
        this.sounds.reveal.currentTime = 0;
        this.sounds.reveal.play();
        
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('revealed');
        
        if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
        } else {
            // Reveal adjacent cells for empty cells
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (this.isValidCell(newRow, newCol)) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }

    // Toggle flag on cell
    toggleFlag(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.toggle('flagged');
        
        // Play flag toggle sound
        this.sounds.flag.currentTime = 0;
        this.sounds.flag.play();
        
        // Update mines counter
        document.getElementById('minesCount').textContent = this.getRemainingMines();
    }

    // Handle game over
    gameOver(isWin) {
        this.isGameOver = true;
        this.stopTimer();
        
        // Play appropriate sound
        if (isWin) {
            this.sounds.win.currentTime = 0;
            this.sounds.win.play();
        } else {
            this.sounds.explosion.currentTime = 0;
            this.sounds.explosion.play();
        }
        
        // Reveal all mines
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMine) {
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cellElement.classList.add('mine');
                }
            }
        }
        
        // Update game status
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = isWin ? 'You Win!' : 'Game Over!';
    }
}

    // Render game board in DOM
    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        // Set grid columns based on difficulty
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        // Create and append cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add ARIA attributes for accessibility
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', `Cell at row ${row + 1}, column ${col + 1}`);
                
                gameBoard.appendChild(cell);
            }
        }
        
        // Update mines counter display
        document.getElementById('minesCount').textContent = this.minesCount;
    }
}

// Create global game instance
const game = new Game();

// Add CSS styles for the game board cells
const style = document.createElement('style');
style.textContent = `
    .cell {
        width: 100%;
        aspect-ratio: 1;
        background-color: #ddd;
        border: 1px solid #999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        user-select: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .cell:hover {
        background-color: #ccc;
    }
    
    .cell.revealed {
        background-color: #f0f0f0;
    }
    
    .cell.flagged::before {
        content: '🚩';
    }
    
    .cell.mine {
        background-color: #ff4444;
    }
`;