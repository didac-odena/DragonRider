class Player {
  // constantes de tamaño del jugador (para poder usarlas al crear y al centrar en el canvas)
  static WIDTH = 50;
  static HEIGHT = 50;

  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = Player.WIDTH;
    this.h = Player.HEIGHT;

    this.vx = 0;
  }

  onKeyPress(event) {
    const isPressed = event.type === "keydown";
    switch (event.keyCode) {
      case KEY_RIGHT:
        if (isPressed) this.vx = PLAYER_SPEED;
        else if (this.vx > 0) this.vx = 0;   //IMPORTANTE! al darle esta condicion hace que no se encalle
        break;
      case KEY_LEFT:
        if (isPressed) this.vx = -PLAYER_SPEED;
        else if (this.vx < 0) this.vx = 0;
        break;
    }
  }

  move() {
    this.x += this.vx;
  }

  draw() {
    this.ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
