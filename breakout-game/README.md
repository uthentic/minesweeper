# Breakout Game

A classic Breakout arcade game implementation using HTML5 Canvas and JavaScript. Break all the bricks with the ball while keeping it in play using the paddle.

## How to Play

1. Move the paddle left and right using the arrow keys (← →)
2. The ball will bounce off the paddle, walls, and bricks
3. Break all the bricks to win
4. You have 3 lives - don't let the ball fall below the paddle!
5. Your score increases by 10 points for each brick you break
6. The ball speeds up slightly each time it hits the paddle

## File Structure

```
breakout-game/
├── index.html      # Main game HTML structure
├── style.css       # Game styling and layout
└── script.js       # Game logic and mechanics
```

### File Descriptions

- `index.html`: Contains the basic HTML structure, canvas element, and score/lives display
- `style.css`: Handles game styling including layout, colors, and game over screen
- `script.js`: Implements all game mechanics including:
  - Paddle and ball movement
  - Collision detection
  - Brick creation and destruction
  - Score tracking
  - Game over handling

## Local Setup

1. Clone the repository or download the files:
   ```
   git clone <repository-url>
   ```
   Or download and extract the ZIP file

2. Navigate to the breakout-game directory:
   ```
   cd breakout-game
   ```

3. Open the game:
   - Double-click `index.html` or
   - Drag `index.html` into your web browser or
   - Use a local development server (recommended):
     ```
     python3 -m http.server
     ```
     Then open `http://localhost:8000` in your browser

### Requirements
- Modern web browser with HTML5 Canvas support (Chrome, Firefox, Safari, Edge)
- JavaScript enabled