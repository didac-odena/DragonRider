# 🐉 Dragon Rider

LIVE DEMO: [click here](https://dragonrider.netlify.app/)

This project was built using **HTML, CSS and vanilla JavaScript with DOM manipulation and OOP**.

Dragon Rider is a browser-based arcade game built as the Module 1 project for the Ironhack Web Development Bootcamp.  
You control a dragon flying through a dynamic forest, dodging falling rocks for as long as you can.  
Your score is the time you survive.

## 👤 Author

Dídac Odena
Ironhack Web Development Bootcamp – Module 1 Final Project

GitHub: <https://github.com/didac-odena>

--

## 🎮 Gameplay

- You control a dragon that moves horizontally across the screen.
- Rocks fall from the sky at increasing speed and frequency.
- If a rock hits the dragon → **Game Over**.
- Your **score** is the total time survived in the current run.
- If your time is in the **top 5**, you can save your name in the local high score table.

---

## 🎯 Main Features

- Dynamic background with independently falling elements (trees, scenery, etc.).
- Smooth, responsive **player movement** with sprite-based animations (idle, move left/right).
- **Enemy system**:
  - `Rock` enemy with 8×8 sprite-sheet animation.
  - Variable falling speed per rock.
  - Increasing spawn rate over time (difficulty curve).
- **Collision system** with adjustable hitboxes to avoid unfair “air” collisions.
- **Pause & Game Over** logic:
  - Full frame freeze (everything stops: background, rocks, animations, spawn).
  - Dark overlay applied on the last frame.
  - Game Over menu on top of the frozen scene.
- **High score system** using `localStorage`:
  - Stores top 5 survival times and player names.
  - Visible in the start screen.
- **Responsive layout**:
  - Playable comfortably on mobile and desktop.
  - Canvas and UI scaled carefully to avoid browser zoom/scroll glitches.
- **Audio**:
  - Background music in menus.
  - Different track during gameplay.
  - Dedicated controls to toggle music on/off.
- Cleaned and commented codebase, structured by responsibility.

---

## 🧱 Tech Stack

- **HTML5** – Structure for:
  - Start screen
  - Game screen (canvas)
  - Game Over screen
  - Instructions / scoreboard
- **CSS3** – Layout, responsive behaviour and game UI styling.
- **JavaScript (ES6, vanilla)**:
  - DOM manipulation
  - Canvas rendering
  - Game loop
  - Classes and OOP (entities, controllers, utilities)
  - `localStorage` for high scores

No frameworks, no backend – everything runs in the browser.

---

## 🕹️ Controls

### Desktop

- **← / →** or **A / D** – Move the dragon left / right  
- **P** (or similar key, depending on your binding) – Pause / Resume  
- **Mouse / click** – Navigate menus and buttons (Start, Retry, Mute, etc.)

### Mobile

- On-screen controls / touch areas (depending on your implementation) to move the dragon and interact with buttons.

---

## 🧩 Game Architecture

### High-level

- `index.html`  
  Base structure: start screen, game canvas, game over screen, instructions, high score panel.

- `style.css`  
  All visual styles, layout, responsiveness, theme (Dragon Rider look & feel).

- Core JavaScript:
  - `constants.js` – All tunable values (canvas size, FPS, spawn intervals, speeds, etc.).
  - `game.js` – Game loop, global state, orchestration.
  - `player.js` – Player entity (dragon).
  - `background.js` – Single background element (tree/asset) logic.
  - `backgroundController.js` – Manages the collection of background elements.
  - `rock.js` – Enemy rock entity and its sprite animation.
  - `highScoreUI.js` – LocalStorage integration and high score display.
  - `utils.js` – Helper utilities (debug drawing, etc.).
  - `index.js` – Bootstrapping, DOMContentLoaded, wiring buttons and screens.

---

## 🧠 Core Systems

### 1. Game Loop & State Management

The `Game` class owns:

- The **canvas** and its 2D context.
- The **FPS** configuration (based on a constant, typically `1000 / 60`).
- The main loop using `setInterval()`:
  1. `clear()` – Clears the canvas (`clearRect`) to avoid trails.
  2. `move()` – Updates positions of player, background items and rocks.
  3. `draw()` – Draws background, enemies and then the player (correct z-order).
  4. `checkCollisions()` – Detects collisions and triggers Game Over.

The loop early-exits when:

- `isPaused === true`, or  
- `isGameOver === true`  

so no movement or drawing happens in those states (full freeze).

---

### 2. Background System

Goal: make the world feel alive without a simple looping image.

- `Background`:
  - Picks a random image from an array of sprite paths.
  - Waits for `onload` to get natural width/height.
  - Computes a random X within the canvas plus an “overhang” margin (some part can appear slightly outside the canvas for realism).
  - Starts above the screen and falls down at a given speed.
  - When it leaves the canvas, it marks itself as “dead”.

- `BackgroundController`:
  - Holds an array of active `Background` instances.
  - Spawns new elements using a **single chained `setTimeout`** with random delay between `BG_SPAWN_MIN` and `BG_SPAWN_MAX`.
  - Ensures spawn is smooth (no bursts).
  - Iterates elements from newest to oldest when drawing so that **older elements are drawn last** and appear “in front”.
  - Cleans up all `isDead` elements to keep performance and logic tidy.

---

### 3. Player Movement & Animation

- `Player`:
  - Knows its position, size and current velocity.
  - Movement logic is designed to:
    - Avoid keys “cancelling” each other incorrectly.
    - Keep movement smooth and responsive.
  - Includes a **sprite-sheet animation**:
    - Uses an initial frame position.
    - Total number of frames.
    - A frame frequency to advance the animation.
  - Animations for:
    - Idle
    - Moving left
    - Moving right

- `checkBounds()` in `Game`:
  - Ensures the player never leaves the canvas horizontally.

---

### 4. Enemy (Rock) & Difficulty

- `Rock`:
  - First enemy type.
  - Uses a **8×8 sprite-sheet** animation:
    - Iterates across columns; when a row finishes, jumps to the next row.
  - Moves straight down with a **random speed** within a configured range (adds variety).

- Spawn & difficulty:
  - Managed in `Game`:
    - Rocks are spawned on a timer that **gradually decreases the interval** down to a minimum threshold.
    - This naturally increases difficulty over time.
  - Rocks simply handle their own movement/animation; `Game` owns when to create them.

---

### 5. Collision System & Hitboxes

- Collision detection is performed in `Game`, between the player and each rock.
- To avoid unfair collider sizes (because sprites may contain “air” around the actual shape), a `getHitBox()` function provides:
  - A **shrunk rectangle** using an inset value.
  - This makes collisions feel much more accurate and visually honest.

When a collision is detected:

- The game state switches to **Game Over**.
- The loop is frozen.
- Overlay and Game Over UI are displayed.

---

### 6. Pause & Game Over Overlay

One of the trickiest parts was making sure *everything* pauses correctly:

- The loop checks `isPaused` and `isGameOver` before updating or drawing.
- A dedicated `paintOverlay()` method:
  - Applies a dark tint **once** over the already drawn frame.
  - Does not belong to `draw()` to avoid overpainting issues.
- Order in the final frame:
  1. `clear()`
  2. `move()`
  3. `draw()` (background → rocks → player)
  4. `checkCollisions()` (can trigger Game Over)
  5. If Game Over/Pause: `paintOverlay()` + show menu/UI

Result:

- The entire scene (background, trees, rocks, player) freezes and darkens uniformly.
- No new spawns or movements occur while paused or in Game Over.
- Game Over menu renders cleanly above the scene.

---

### 7. High Scores (LocalStorage)

`HighScoreUI` is responsible for:

- Maintaining an array of the **top 5 scores** (best survival times).
- Reading/writing from `localStorage`.
- After every game:
  - If the player’s time qualifies for top 5, they can enter their name.
  - The list is saved persistently in the browser.
- High scores are displayed on the **start screen**.

---

### 8. Menus, Instructions & Audio

- **Start Screen**:
  - “Start Game” button.
  - High score table.
  - Instructions billboard (explaining movement and objective).
- **Game Screen**:
  - Canvas with the game.
  - In-game UI (timer, maybe lives/score).
- **Game Over Screen / Overlay**:
  - Message.
  - Final time.
  - Option to go back to start and try again.

- **Audio**:
  - Background music for menus.
  - Separate track during gameplay.
  - Buttons to mute/unmute music for comfort.

---

