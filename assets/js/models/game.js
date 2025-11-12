// ======================================================================
// Orquestador del juego. SOLO Mantiene el loop y delega en los controladores.
// ======================================================================

class Game {
  constructor(canvasID) {

    this.canvas = document.getElementById(canvasID);
    this.canvas.width  = CANVAS_W;                 // 600 (render interno)
    this.canvas.height = CANVAS_H;                 // 600
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;        // Recomendado para pixel-art

    // Timing del loop
    this.fps = FPS;
    this._loopId = null;                            // Id del setInterval del loop

    // Controladores y entidades
    this.bg = new BackgroundController(this.ctx);   // Fondo: spawns + pintado
    this.player = new Player(
      this.ctx,
      CANVAS_W / 2 - Player.WIDTH / 2,              // centrado en X
      CANVAS_H - Player.HEIGHT - 5                  // pegado abajo con 5 px de margen
    );
  }

  start() {
    // Arranca una sola vez: enciende spawner de fondo + loop de render
    if (this._loopId) return;

    this.bg.start();
    this._loopId = setInterval(() => this.draw(), this.fps);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    this.clear();
    this.bg.updateAndDraw();  o
    this.player.draw(); 
  }
}
