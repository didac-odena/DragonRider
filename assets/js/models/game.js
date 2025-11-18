// ======================================================================
// Orquestador del juego. SOLO Mantiene el loop y delega en los controladores.
// ======================================================================

class Game {
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true; // activar si es necesario para efecto pixel

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

    this.isPaused = false;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  start() {
    // Arranca una sola vez: enciende spawner de fondo + loop de render
    if (!this.drawIntervalId) {
      this.setupListener();
      this.bg.start();
      this.rockSpawn();

      this.rockDifficultyIntervalId = setInterval(() => {
        this.rockMinDelay = Math.max(
          ROCK_SPAWN_MIN_LIMIT_MS,
          this.rockMinDelay * ROCK_SPAWN_DELTA_MS
        );

        this.rockMaxDelay = Math.max(
          this.rockMinDelay + 50, // que max nunca sea menor que min
          this.rockMaxDelay * ROCK_SPAWN_DELTA_MS
        );

        console.log(
          "Nuevo spawn:",
          this.rockMinDelay.toFixed(2),
          this.rockMaxDelay.toFixed(2)
        );
      }, ROCK_SPAWN_STEP_MS);

      this.drawIntervalId = setInterval(() => {
        this.clear();
        this.move();
        this.draw();
        this.checkCollisions();
      }, this.fps);
    }
  }

  setupListener() {
    addEventListener("keydown", (event) => this.player.onKeyPress(event));
    addEventListener("keyup", (event) => this.player.onKeyPress(event));
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
  }

  togglePause() {
    this.isPaused ? (!this.isPaused) : (this.isPaused = true);  
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
    //controla el maximo de posicion en X de player
    if (this.player.x < PLAYER_MARGIN) {
      this.player.x = PLAYER_MARGIN;
    } else if (this.player.x > CANVAS_W - this.player.w - PLAYER_MARGIN) {
      this.player.x = CANVAS_W - this.player.w - PLAYER_MARGIN;
    }
  }

  checkCollisions() {
    // ROCK COLLISIONS
    for (const enemy of this.enemies) {
      if (this.player.collidesWith(enemy)) {
        this.gameOver();
        break;
      }
    }
  }

  gameOver() {
    this.stop();
    console.log("GAME OVER");
  }

  draw() {
    this.bg.updateAndDraw();
    this.enemies.forEach((enemy) => enemy.draw());
    this.player.draw();
  }

  // =================== SPAWN DE ROCAS ===================
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
