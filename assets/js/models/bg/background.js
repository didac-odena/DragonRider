// ==================================================================================
// Individual Sprite 
// ==================================================================================

class Background {
  constructor(ctx) {
    this.ctx = ctx;
    this.vy = BG_VY;
    this.sprite = new Image();
    this.isReady = false;
    this.dead = false;

    this.w = 0;
    this.h = 0;

    this._loadNewSprite();
  }

  _loadNewSprite() {
    const src = BG_ELEMENTS[Math.floor(Math.random() * BG_ELEMENTS.length)];
    this.isReady = false;
    this.sprite = new Image();
    this.sprite.src = src;

    this.sprite.onload = () => {
      const natW = this.sprite.naturalWidth;
      const natH = this.sprite.naturalHeight;
      this.w = natW * BG_ZOOM;
      this.h = natH * BG_ZOOM;

      const cw = this.ctx.canvas.width;
      const overhang = BG_OVERHANG_X;
      const minX = -this.w * overhang;
      const maxX = cw - this.w + this.w * overhang;
      this.x = Math.floor(minX + Math.random() * (maxX - minX + 1));

      this.y = -this.h;

      this.isReady = true;
    };

    this.sprite.onerror = () => console.log("No carga", src);
  }

  draw() {
    if (!this.isReady || this.dead) return true;

    this.y += this.vy;

    if (this.y > this.ctx.canvas.height) {
      this.dead = true;
      return false;
    }

    this.ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
    return true;
  }
}
