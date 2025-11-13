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
      CANVAS_H - Player.HEIGHT - 5 // pegado abajo con 5 px de margen
    );

    this.drawIntervalId = null; // Id del setInterval del loop de dibujo

    //listeners agrupados aqui
  }

  start() {
    // Arranca una sola vez: enciende spawner de fondo + loop de render
    if (!this.drawIntervalId) {
      this.setupListener();
      this.bg.start();
      this.drawIntervalId = setInterval(() => {
        this.clear();
        this.move();
        this.draw();
      }, this.fps);
    }
  }

  setupListener() {
    addEventListener('keydown', (event) => this.player.onKeyPress(event));
    addEventListener('keyup', (event) => this.player.onKeyPress(event));
  }

  // Añadido para que puedas parar el loop cuando quieras (alineado con el patrón del bootcamp)
  stop() {
    if (this.drawIntervalId) {
      clearInterval(this.drawIntervalId);
      this.drawIntervalId = null;
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  move() {
    function checkBounds() {
      
    }


    this.player.move();
    checkBounds();
  }

  checkBounds(){    //controla el maximo de movimiento


  }

  draw() {
    // Solo pintar (sin clear ni move)
    this.bg.updateAndDraw();
    this.player.draw();
  }
}
