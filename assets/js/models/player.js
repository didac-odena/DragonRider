class Player {
  // constantes de tamaño del jugador (para poder usarlas al crear y al centrar en el canvas)
  static WIDTH = 60;
  static HEIGHT = 40;

  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = Player.WIDTH;
    this.h = Player.HEIGHT;
  }

  draw() {
    this.ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}
