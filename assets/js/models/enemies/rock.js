class Rock {
  static WIDTH = 40;
  static HEIGHT = 40;
  static FALL_SPEED = 3; // píxeles por frame
  static ANIM_FREQ = 6; // cada cuántos draws avanza un frame
  static INSET_HITBOX = 20;

  constructor(ctx, x, y, speedY) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = Rock.WIDTH;
    this.h = Rock.HEIGHT;

    this.vy = speedY ?? Rock.FALL_SPEED;


    this.sprite = new Image();    
    this.sprite.src = "/assets/images/rock-sprite.png";// --- Sprite 8x8 ---

    this.sprite.vFrames = 8; // columnas
    this.sprite.hFrames = 8; // filas
    this.sprite.vFrameIndex = 0; // col actual
    this.sprite.hFrameIndex = 0; // fila actual

    this.sprite.onload = () => {
      this.sprite.isReady = true;
      this.sprite.frameW = Math.floor(this.sprite.width / this.sprite.vFrames);
      this.sprite.frameH = Math.floor(this.sprite.height / this.sprite.hFrames);
      
      this.w = Rock.WIDTH;
      this.h = Rock.HEIGHT;
    };

    this.drawCount = 0;
  }

  move() {
    this.y += this.vy;
  };

  draw() {
    if (!this.sprite.isReady) return;

    const sx = this.sprite.vFrameIndex * this.sprite.frameW;
    const sy = this.sprite.hFrameIndex * this.sprite.frameH;

    this.ctx.drawImage(
      this.sprite,
      sx,
      sy,
      this.sprite.frameW,
      this.sprite.frameH,
      this.x,
      this.y,
      this.w,
      this.h
    );

    this.animate(Rock.ANIM_FREQ);
    this.drawCount++;
  }

  // Recorre 64 frames: avanza columnas 0..7 y al terminar salta a la siguiente fila 0..7
  animate(frequency) {
    if (this.drawCount % frequency !== 0) return;
    this.drawCount = 0;
    this.sprite.vFrameIndex++; // avanzar a la siguiente columna
    if (this.sprite.vFrameIndex >= this.sprite.vFrames) {
      // fin de fila: reset columna y avanzar fila
      this.sprite.vFrameIndex = 0;
      this.sprite.hFrameIndex =
        (this.sprite.hFrameIndex + 1) % this.sprite.hFrames;
    }
  }
  
  getHitbox() {    //corrige el aire del srpite
    return {
      x: this.x + Rock.INSET_HITBOX,
      y: this.y + Rock.INSET_HITBOX,
      w: this.w - 2 * Rock.INSET_HITBOX,
      h: this.h - 2 * Rock.INSET_HITBOX,
    };
  }
}
