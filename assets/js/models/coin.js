class Coin {
  constructor(ctx, x, y, w = 12 *2, h = 16*2) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.sprite = new Image();
    this.sprite.src = "/assets/images/sprites/coin.sprite.png";

    this.sprite.vFrames = 4;
    this.sprite.hFrames = 1;
    this.sprite.vFrameIndex = 0;
    this.sprite.hFrameIndex = 0;

    this.sprite.onload = () => {
      this.sprite.isReady = true;
      this.sprite.frameW = Math.floor(this.sprite.width / this.sprite.vFrames); //r3 repasar esto, falta entendimiento
      this.sprite.frameH = Math.floor(this.sprite.height / this.sprite.hFrames);
    };

    this.drawCount = 0;
    this.points = 10;
  }
  
  draw() {
    if (this.sprite.isReady) {
      this.ctx.drawImage(
        this.sprite,
        this.sprite.vFrameIndex * this.sprite.frameW, // x dentro del sprite
        this.sprite.hFrameIndex * this.sprite.frameH, // y dentro del sprite
        this.sprite.frameW, // ancho del recorte
        this.sprite.frameH, // alto del recorte
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
    if (this.drawCount % 10 === 0) {
      this.drawCount = 0;
      this.sprite.vFrameIndex =
        (this.sprite.vFrameIndex + 1) % this.sprite.vFrames;
    }
  }
  
  
}
