// ======================================================================
// Orquestador del juego. SOLO Mantiene el loop y delega en los controladores.
// ======================================================================

class Game {
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true;

    this.fps = FPS;
    this._loopId = null;

    // Controladores y entidades del bg
    this.bg = new BackgroundController(this.ctx); // Fondo: spawns + pintado
    this.player = new Player(
      this.ctx,
      CANVAS_W / 2 - Player.WIDTH / 2, // centrado en X
      CANVAS_H - Player.HEIGHT - PLAYER_MARGIN // pegado abajo con 5 px de margen
    );

    this.drawIntervalId = null; // Id del setInterval del loop de dibuj

    // enemigos
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

    this.pauseButton = document.getElementById("pause-button");
    this.isGameOver = false;

    // botones/menus de interfaz
    this.tryAgainButton = document.getElementById("tryagain-ui");
    this.startMenu = document.getElementById("start-menu");
    this.startButton = document.getElementById("startgame-ui");

    //TIMER
    this.timerElement = document.getElementById("timer");
    this.isPaused = false;
    this.elapsedMs = 0;
    this._timerId = null; // id del intervalo del timer
    this._listenersSetup = false; // flag para no duplicar listeners
    this.timer();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
  }

  _startSystems() {
    this.bg.start();
    this.rockSpawn();
    this._startTimer();

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
      // Si está en pausa o en game over, NO tocamos el canvas -> se queda el último frame
      if (this.isPaused || this.isGameOver) return;

      this.clear();
      this.move();
      this.draw();          // 1) PINTAMOS el frame normal
      this.checkCollisions(); // 2) LUEGO comprobamos colisiones (puede disparar gameOver)
    }, this.fps);
  }

  pause() {
    if (this.rockSpawnTimeoutId) {
      clearTimeout(this.rockSpawnTimeoutId);
      this.rockSpawnTimeoutId = null;
    }
  }

  resume() {
    // reanuda spawn solo si no hay timeout activo y no es game over
    if (!this.isGameOver && !this.rockSpawnTimeoutId) {
      this.rockSpawn();
    }
  }

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
      this.elapsedMs += 1000;
      this.timer();
    }, 1000);
  }

  _stopTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  setupListener() {
    if (this._listenersSetup) return;

    // Try again (recarga)
    addEventListener("click", (event) => this.tryAgain(event));

    // Start game (pantalla inicial)
    addEventListener("click", (event) => this.startGame(event));

    // Pausa
    addEventListener("click", (event) => this.togglePause(event));
    addEventListener("keydown", (event) => this.togglePause(event));

    // Controles del player
    addEventListener("keydown", (event) => this.player.onKeyPress(event));
    addEventListener("keyup", (event) => this.player.onKeyPress(event));

    this._listenersSetup = true;
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

  tryAgain(event) {
    const isClicked =
      event.type === "click" && event.target === this.tryAgainButton;
    if (isClicked) location.reload();
  }

  // >>>>>> AQUÍ VA LA LÓGICA DEL START GAME <<<<<<
  startGame(event) {
    const isClicked =
      event.type === "click" && event.target === this.startButton;
    if (!isClicked) return;

    // Ocultamos el menú de inicio
    if (this.startMenu) {
      this.startMenu.classList.add("hidden");
    }

    // Mostramos canvas
    this.canvas.classList.remove("hidden");

    // Mostramos HUD in-game
    const ingameMenu = document.querySelector(".menu-ingame");
    if (ingameMenu) {
      ingameMenu.classList.remove("hidden");
    }

    // Arrancamos el juego (si no está ya arrancado)
    this.start();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  move() {
    this.enemies.forEach((enemy) => enemy.move());
    this.player.move();
    this.checkBounds();
  }

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

  gameOver() {
    this.isGameOver = true;
    this.stop();
    console.log("GAME OVER");

    // oscurecemos el ÚLTIMO frame ya dibujado
    this.paintOverlay();

    const menu = document.getElementById("gameover-menu");
    if (menu) menu.classList.remove("hidden");
  }

  draw() {
    this.bg.updateAndDraw();
    this.enemies.forEach((enemy) => enemy.draw());
    this.player.draw();
  }

  // Pinta un overlay oscuro sobre el canvas actual (lo que haya: fondo + árboles + rocas + player)
  paintOverlay() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // =================== SPAWN DE ROCAS ==================
  rockSpawn() {
    const min = this.rockMinDelay;
    const max = this.rockMaxDelay;
    const delay = Math.floor(min + Math.random() * (max - min));

    this.rockSpawnTimeoutId = setTimeout(() => {
      const x = Math.floor(Math.random() * (CANVAS_W - Rock.WIDTH));
      const y = -Rock.HEIGHT;

      // velocidad aleatoria entre ROCK_SPEED_MIN y ROCK_SPEED_MAX
      const speedY =
        ROCK_SPEED_MIN + Math.random() * (ROCK_SPEED_MAX - ROCK_SPEED_MIN);

      this.enemies.push(new Rock(this.ctx, x, y, speedY));

      // siguiente spawn
      this.rockSpawn();
    }, delay);
  }
}
