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

    this.sprite = new Image();
    this.sprite.src = "/assets/images/player-sprite.png";

    this.sprite.vFrames = 12; //posiciones del sprite
    this.sprite.hFrames = 4;
    this.sprite.vFrameIndex = 1; //eje X (matriz del sprite)
    this.sprite.hFrameIndex = 3; //eje Y (matriz del srpite)

    this.sprite.onload = () => {
      this.sprite.isReady = true;
      this.sprite.frameW = Math.floor(this.sprite.width / this.sprite.vFrames);
      this.sprite.frameH = Math.floor(this.sprite.height / this.sprite.hFrames);
      this.w = Player.WIDTH;
      this.h = Player.HEIGHT;
    };
  }

  onKeyPress(event) {
    const isPressed = event.type === "keydown";
    switch (event.keyCode) {
      case KEY_RIGHT:
        if (isPressed) this.vx = PLAYER_SPEED;
        else if (this.vx > 0) this.vx = 0; //IMPORTANTE! al darle esta condicion hace que no se encalle
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
    if (this.sprite.isReady) {
      Utils.debugDrawable(this); //para debugar el sprite

      this.ctx.drawImage(
        this.sprite,
        this.sprite.vFrameIndex * this.sprite.frameW,
        this.sprite.hFrameIndex * this.sprite.frameH,

        this.sprite.frameW,
        this.sprite.frameH,

        this.x,
        this.y,
        this.w,
        this.h
      );
      this.animate();
    }
  }

  animate() {
    if (this.vx > 0) {
      this.sprite.vFrameIndex = 1;
      this.sprite.hFrameIndex = 2;
    } else if (this.vx < 0) {
      this.sprite.vFrameIndex = 1;
      this.sprite.hFrameIndex = 1;
    } else {
      this.sprite.vFrameIndex = 1;
      this.sprite.hFrameIndex = 3;
    }
  }
}
