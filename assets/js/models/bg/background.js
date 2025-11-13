// ==================================================================================
// Sprite individual 
// ==================================================================================

class Background {
  constructor(ctx) {
    this.ctx = ctx;
    this.vy = BG_VY;
    this.sprite = new Image();
    this.isReady = false; // Se vuelve true tras onload (cuando conocemos tamaño natural)
    this.dead = false;

    this.w = 0;
    this.h = 0;

    this._loadNewSprite(); // Carga la imagen y calcula posición inicial (x,y) y tamaño (w,h)
  }

  _loadNewSprite() {
    //src aleatorio
    const src = BG_ELEMENTS[Math.floor(Math.random() * BG_ELEMENTS.length)];
    this.isReady = false;
    this.sprite = new Image();
    this.sprite.src = src;

    // la imagen carga
    this.sprite.onload = () => {
      const natW = this.sprite.naturalWidth;
      const natH = this.sprite.naturalHeight;
      this.w = natW * BG_ZOOM;
      this.h = natH * BG_ZOOM;

      // Calculamos X inicial con margen/overhang:
      const cw = this.ctx.canvas.width;
      const overhang = BG_OVERHANG_X; //constante
      const minX = -this.w * overhang;
      const maxX = cw - this.w + this.w * overhang;
      this.x = Math.floor(minX + Math.random() * (maxX - minX + 1));
      // Calculamos Y inicial que es la altura del elemento en negativo
      this.y = -this.h;

      this.isReady = true;
    };

    // Si un asset no carga, avisa en consola y NO rompe el juego
    this.sprite.onerror = () => console.log("No carga", src);
  }

  draw() {
    // Si no está listo, NO muere: se salta el frame pero sigue vivo
    if (!this.isReady || this.dead) return true;

    this.y += this.vy;

    if (this.y > this.ctx.canvas.height) {
      this.dead = true;
      return false; // solo false cuando realmente hay que eliminar
    }

    // Dibuja con tamaño ESCALADO coherente con posicionamiento
    this.ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
    return true;
  }
}
