class Player {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.h = 40;
    this.w = 60;
  }

  draw() {
    this.ctx.fillRect(
        this.x, 
        this.y, 
        this.w, 
        this.h
    );
  }
}
