class Player {
  // constantes de tamaño del jugador (para poder usarlas al crear y al centrar en el canvas)
  static WIDTH = 75;
  static HEIGHT = 75;

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

    this.drawCount = 0; //sirve para contar las veces que se pinta de cara a animateFrames
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
      this.drawCount++;
    }
  }

  animate() {
    if (this.vx > 0) {    
      this.animateFrames(2, 0, 3, 10);
    } else if (this.vx < 0) {
      this.animateFrames(1, 0, 3, 10);
    } else {
      this.animateFrames(3, 0, 3, 10);
    }
  }

  animateFrames(initialHFrame, initialVFrame, frames, frequency) {   
    if (this.sprite.hFrameIndex !== initialHFrame){
      this.sprite.hFrameIndex = initialHFrame;
      this.sprite.vFrameIndex = initialVFrame;
    } else if (this.drawCount % frequency === 0) {
      this.drawCount = 0;
      this.sprite.vFrameIndex = (this.sprite.vFrameIndex + 1) % frames;
    }
    
  }
}
