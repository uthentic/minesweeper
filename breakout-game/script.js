// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 5;
const BRICK_ROWS = 5;
const BRICK_COLS = 5;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 30;
const BRICK_PADDING = 10;
const INITIAL_BALL_SPEED = 5;
const BALL_SPEED_INCREMENT = 0.5;
const PADDLE_SPEED = 10;
const POINTS_PER_BRICK = 10;
const INITIAL_LIVES = 3;

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let lives = INITIAL_LIVES;
let gameOver = false;
let ballSpeed = INITIAL_BALL_SPEED;

// Game objects
const paddle = {
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#0000FF',
    dx: 0
};

const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 20,
    radius: BALL_RADIUS,
    speed: INITIAL_BALL_SPEED,
    dx: INITIAL_BALL_SPEED,
    dy: -INITIAL_BALL_SPEED,
    color: '#FF0000'
};

// Create bricks
let bricks = [];
function createBricks() {
    const offsetX = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING))) / 2;
    const offsetY = 50;

    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            bricks[row][col] = {
                x: offsetX + col * (BRICK_WIDTH + BRICK_PADDING),
                y: offsetY + row * (BRICK_HEIGHT + BRICK_PADDING),
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: '#00FF00',
                visible: true
            };
        }
    }
}

// Draw functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBricks() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            if (bricks[row][col].visible) {
                ctx.fillStyle = bricks[row][col].color;
                ctx.fillRect(
                    bricks[row][col].x,
                    bricks[row][col].y,
                    bricks[row][col].width,
                    bricks[row][col].height
                );
            }
        }
    }
}

// Collision detection
function collisionDetection() {
    // Brick collision
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height) {
                    ball.dy = -ball.dy;
                    brick.visible = false;
                    score += POINTS_PER_BRICK;
                    document.getElementById('score').textContent = score;
                }
            }
        }
    }

    // Paddle collision
    if (ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y) {
        ball.dy = -ball.dy;
        ball.speed += BALL_SPEED_INCREMENT;
        // Adjust angle based on where ball hits paddle
        const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.dx = hitPoint * ball.speed;
    }

    // Wall collision
    if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Bottom collision (lose life)
    if (ball.y + ball.radius > CANVAS_HEIGHT) {
        lives--;
        document.getElementById('lives').textContent = lives;
        if (lives === 0) {
            gameOver = true;
            showGameOver();
        } else {
            resetBall();
        }
    }
}

// Reset ball position
function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT - PADDLE_HEIGHT - 20;
    ball.dx = INITIAL_BALL_SPEED;
    ball.dy = -INITIAL_BALL_SPEED;
    ball.speed = INITIAL_BALL_SPEED;
}

// Game over handling
function showGameOver() {
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
}

// Game loop
function update() {
    if (gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Move paddle
    paddle.x += paddle.dx;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > CANVAS_WIDTH) paddle.x = CANVAS_WIDTH - paddle.width;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Check collisions
    collisionDetection();

    // Draw everything
    drawBricks();
    drawBall();
    drawPaddle();

    requestAnimationFrame(update);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        paddle.dx = -PADDLE_SPEED;
    } else if (e.key === 'ArrowRight') {
        paddle.dx = PADDLE_SPEED;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        paddle.dx = 0;
    }
});

// Restart game
document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    score = 0;
    lives = INITIAL_LIVES;
    gameOver = false;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    createBricks();
    resetBall();
    update();
});

// Start game
createBricks();
update();