// ======================================================================
// Orquestador del juego. SOLO Mantiene el loop y delega en los controladores.
// ======================================================================

class Game {
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false; // activar si es necesario para efecto pixel

    // Timing del loop
    this.fps = FPS;
    this._loopId = null; // Id del setInterval del loop

    // Controladores y entidades
    this.bg = new BackgroundController(this.ctx); // Fondo: spawns + pintado
    this.player = new Player(
      this.ctx,
      CANVAS_W / 2 - Player.WIDTH / 2, // centrado en X
      CANVAS_H - Player.HEIGHT - PLAYER_MARGIN // pegado abajo con 5 px de margen
    );

    this.drawIntervalId = null; // Id del setInterval del loop de dibuj

    // STOP this.coins = []

    // enemigos
    const rock = new Rock(
      this.ctx,
      CANVAS_W / 2 - Rock.WIDTH / 2,
      -Rock.HEIGHT
    );
    this.enemies = [rock];
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  start() {
    // Arranca una sola vez: enciende spawner de fondo + loop de render
    if (!this.drawIntervalId) {
      this.setupListener();
      this.bg.start();
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
    //if (this.drawIntervalId) {
    // clearInterval(this.drawIntervalId);
    //this.drawIntervalId = null;
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
  //==========COLISIONES

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

  ////===============
  draw() {
    // Solo pintar (sin clear ni move)
    this.bg.updateAndDraw();
    this.enemies.forEach((enemy) => enemy.draw());
    this.player.draw();
  }
}
