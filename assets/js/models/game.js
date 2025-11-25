// ======================================================================
// Game Orchestrator – main loop and high-level systems
// ======================================================================

class Game {
  constructor(canvasID) {
    // Canvas setup
    this.canvas = document.getElementById(canvasID);
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true;

    // Sound
    this.sound = new SoundManager();
    this.muteButtons = [
      document.getElementById("mute-toggle-menu"),
      document.getElementById("mute-toggle-ingame"),
    ].filter(Boolean);
    this.sound.playMusic(this.sound.musicGameOver);

    // Instructions overlay
    this.instructionsImg = new Image();
    this.instructionsImg.src = "assets/images/interface/instructions-ui.png";
    this.showInstructions = false;
    this.instructionsStartMs = 0;

    // Loop / FPS
    this.fps = FPS;
    this._loopId = null;
    this.drawIntervalId = null;

    // Background & player
    this.bg = new BackgroundController(this.ctx);
    this.player = new Player(
      this.ctx,
      CANVAS_W / 2 - Player.WIDTH / 2,
      CANVAS_H - Player.HEIGHT - PLAYER_MARGIN
    );

    // Enemies (rocks)
    const rock = new Rock(
      this.ctx,
      CANVAS_W / 2 - Rock.WIDTH / 2,
      -Rock.HEIGHT
    );
    this.enemies = [rock];

    this.rockSpawnTimeoutId = null;
    this.rockDifficultyIntervalId = null;
    this.rockMinDelay = ROCK_SPAWN_MIN_MS;
    this.rockMaxDelay = ROCK_SPAWN_MAX_MS;

    // Game state
    this.isGameOver = false;
    this.isPaused = false;

    // UI elements
    this.pauseButton = document.getElementById("pause-button");
    this.tryAgainButton = document.getElementById("tryagain-ui");
    this.startMenu = document.getElementById("start-menu");
    this.startButton = document.getElementById("startgame-ui");

    // Timer
    this.timerElement = document.getElementById("timer");
    this.elapsedMs = 0;
    this._timerId = null;
    this._listenersSetup = false;
    this.timer(); // initial 00:00

    // Score management
    this.scoreManager = new ScoreManager();
  }

  // =====================================================
  // GAME LIFECYCLE (START / STOP)
  // =====================================================

  start() {
    if (this.drawIntervalId) return;

    this.setupListener();
    this._startStatus();
    this._startSystems();
    this._startLoop();
  }

  _startStatus() {
    this.isGameOver = false;
    this.isPaused = false;
    this._resetTimer();

    this.showInstructions = true;
    this.instructionsStartMs = performance.now();
  }

  _startSystems() {
    this.bg.start();
    this.rockSpawn();
    this._startTimer();
    console.log("Arrancando música gameplay");
    this.sound.playMusic(this.sound.musicGameplay);

    // Gradually increases rock spawn difficulty
    this.rockDifficultyIntervalId = setInterval(() => {
      if (this.isPaused || this.isGameOver) return;

      this.rockMinDelay = Math.max(
        ROCK_SPAWN_MIN_LIMIT_MS,
        this.rockMinDelay * ROCK_SPAWN_DELTA_MS
      );
      this.rockMaxDelay = Math.max(
        this.rockMinDelay + 50,
        this.rockMaxDelay * ROCK_SPAWN_DELTA_MS
      );

      console.log(
        "Nuevo spawn:",
        this.rockMinDelay.toFixed(2),
        this.rockMaxDelay.toFixed(2)
      );
    }, ROCK_SPAWN_STEP_MS);
  }

  _startLoop() {
    this.drawIntervalId = setInterval(() => {
      // When paused or game over, keep the last frame frozen
      if (this.isPaused || this.isGameOver) return;

      this.clear();
      this.move();
      this.draw();
      this.checkCollisions();
    }, this.fps);
  }

  stop() {
    clearInterval(this.drawIntervalId);
    this.drawIntervalId = undefined;

    if (this.rockSpawnTimeoutId) {
      clearTimeout(this.rockSpawnTimeoutId);
      this.rockSpawnTimeoutId = null;
    }

    if (this.rockDifficultyIntervalId) {
      clearInterval(this.rockDifficultyIntervalId);
      this.rockDifficultyIntervalId = null;
    }

    this._stopTimer();
  }

  // =====================================================
  // TIMER
  // =====================================================

  timer() {
    if (!this.timerElement) return;
    this.timerElement.textContent = this._formatTime(this.elapsedMs);
  }

  _formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${mm}:${ss}`;
  }

  _resetTimer() {
    this.elapsedMs = 0;
    this.timer();
  }

  _startTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
    }

    this._timerId = setInterval(() => {
      if (this.isPaused || this.isGameOver) return;
      this.elapsedMs += 100;
      this.timer();
    }, 100);
  }

  _stopTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  // =====================================================
  // INPUT / LISTENERS
  // =====================================================

  setupListener() {
    if (this._listenersSetup) return;

    // Try again (reload)
    addEventListener("click", (event) => this.tryAgain(event));

    // Mute sound
    this.muteButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.toggleMute());
    });

    // Start game (start screen)
    addEventListener("click", (event) => this.startGame(event));

    // Pause
    addEventListener("click", (event) => this.togglePause(event));
    addEventListener("keydown", (event) => this.togglePause(event));

    // Keyboard controls
    addEventListener("keydown", (event) => this.player.onKeyPress(event));
    addEventListener("keyup", (event) => this.player.onKeyPress(event));

    // Pointer / touch controls on canvas
    this.canvas.addEventListener("pointerdown", (event) => {
      this.handlePointerDown(event);
    });

    this.canvas.addEventListener("pointerup", () => {
      this.handlePointerUp();
    });

    this.canvas.addEventListener("pointerleave", () => {
      this.handlePointerUp();
    });

    this._listenersSetup = true;
  }

  togglePause(event) {
    const isClicked =
      event.type === "click" && event.target === this.pauseButton;

    const isKeyPressed = event.type === "keydown" && event.keyCode === KEY_P;

    if (isClicked || isKeyPressed) {
      this.isPaused = !this.isPaused;
      console.log("PAUSE:", this.isPaused);

      if (this.isPaused) {
        this.pause();
        this.paintOverlay();
      } else {
        this.resume();
      }
    }
  }

  // UI: toggle global mute state and refresh all mute buttons
  toggleMute() {
    this.sound.toggleMute();

    this.muteButtons.forEach((btn) => {
      if (this.sound.isMuted) {
        btn.classList.add("muted");
        btn.textContent = "🔇";
      } else {
        btn.classList.remove("muted");
        btn.textContent = "🔊";
      }
    });
  }

  tryAgain(event) {
    const isClicked =
      event.type === "click" && event.target === this.tryAgainButton;
    if (isClicked) location.reload();
  }

  // Start menu → game screen transition
  startGame(event) {
    const isClicked =
      event.type === "click" && event.target === this.startButton;
    if (!isClicked) return;

    if (this.startMenu) {
      this.startMenu.classList.add("hidden");
    }

    this.canvas.classList.remove("hidden");

    const ingameMenu = document.querySelector(".menu-ingame");
    if (ingameMenu) {
      ingameMenu.classList.remove("hidden");
    }

    this.start();
  }

  // Pause rock spawns (logic only)
  pause() {
    if (this.rockSpawnTimeoutId) {
      clearTimeout(this.rockSpawnTimeoutId);
      this.rockSpawnTimeoutId = null;
    }
  }

  // Resume rock spawns if game is still active
  resume() {
    if (!this.isGameOver && !this.rockSpawnTimeoutId) {
      this.rockSpawn();
    }
  }

  // ================== TOUCH / POINTER INPUT ==================

  // Touch input: move player left/right depending on tap position
  handlePointerDown(event) {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const xScreen = event.clientX - rect.left;

    const scaleX = rect.width / this.canvas.width;
    const playerCenterCanvas = this.player.x + this.player.w / 2;
    const playerCenterScreen = playerCenterCanvas * scaleX;

    if (xScreen < playerCenterScreen) {
      this.player.startMoveLeft();
    } else {
      this.player.startMoveRight();
    }

    event.preventDefault();
  }

  handlePointerUp() {
    this.player.stopMove();
  }

  // =====================================================
  // MAIN LOOP: CLEAR / MOVE / DRAW / COLLISIONS
  // =====================================================

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  move() {
    this.enemies.forEach((enemy) => enemy.move());
    this.player.move();
    this.checkBounds();
  }

  // Keep player inside horizontal bounds
  checkBounds() {
    if (this.player.x < PLAYER_MARGIN) {
      this.player.x = PLAYER_MARGIN;
    } else if (this.player.x > CANVAS_W - this.player.w - PLAYER_MARGIN) {
      this.player.x = CANVAS_W - this.player.w - PLAYER_MARGIN;
    }
  }

  checkCollisions() {
    for (const enemy of this.enemies) {
      if (this.player.collidesWith(enemy)) {
        this.gameOver();
        break;
      }
    }
  }

  // =====================================================
  // GAME OVER
  // =====================================================

  gameOver() {
    if (this.isGameOver) {
      return;
    }

    this.sound.playMusic(this.sound.musicGameOver);

    this.isGameOver = true;
    this.stop();
    console.log("GAME OVER");

    // Darken the last rendered frame
    this.paintOverlay();

    const finalTime = this.elapsedMs;
    const isRecord = this.scoreManager.isTopScore(finalTime);

    if (isRecord) {
      this.scoreManager.showHighscorePanel(finalTime);
      return;
    }

    const menu = document.getElementById("gameover-menu");
    if (menu) {
      menu.classList.remove("hidden");
    }
  }

  draw() {
    this.bg.updateAndDraw();
    this.enemies.forEach((enemy) => enemy.draw());
    this.player.draw();
    this.drawInstructionsOverlay();
  }

  // Draws a dark overlay over the current canvas frame
  paintOverlay() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // =====================================================
  // INSTRUCTIONS OVERLAY
  // =====================================================

  drawInstructionsOverlay() {
    if (!this.showInstructions) return;

    if (
      !this.instructionsImg.complete ||
      this.instructionsImg.naturalWidth === 0
    )
      return;

    const now = performance.now();
    const elapsed = now - this.instructionsStartMs;

    if (elapsed > INSTRUCTIONS_DURATION_MS) {
      this.showInstructions = false;
      return;
    }

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    let iw = this.instructionsImg.naturalWidth;
    let ih = this.instructionsImg.naturalHeight;

    const maxW = canvasW * 0.95;
    const maxH = canvasH * 0.95;

    const scale = Math.min(maxW / iw, maxH / ih, 1);

    iw *= scale;
    ih *= scale;

    const ix = (canvasW - iw) / 2;
    const iy = (canvasH - ih) / 1.5;

    this.ctx.drawImage(this.instructionsImg, ix, iy, iw, ih);
  }

  // =====================================================
  // ROCK SPAWNING
  // =====================================================

  rockSpawn() {
    const min = this.rockMinDelay;
    const max = this.rockMaxDelay;
    const delay = Math.floor(min + Math.random() * (max - min));

    this.rockSpawnTimeoutId = setTimeout(() => {
      const x = Math.floor(Math.random() * (CANVAS_W - Rock.WIDTH));
      const y = -Rock.HEIGHT;

      // Random vertical speed between ROCK_SPEED_MIN and ROCK_SPEED_MAX
      const speedY =
        ROCK_SPEED_MIN + Math.random() * (ROCK_SPEED_MAX - ROCK_SPEED_MIN);

      this.enemies.push(new Rock(this.ctx, x, y, speedY));

      this.rockSpawn();
    }, delay);
  }
}
