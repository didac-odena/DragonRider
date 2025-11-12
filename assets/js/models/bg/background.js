// ==================================================================================
// Sprite individual + Controlador
// ==================================================================================

class Background {
  constructor(ctx) {
    this.ctx = ctx;
    this.vy = BG_VY;
    this.sprite = new Image();
    this.isReady = false; // Se vuelve true tras onload (cuando conocemos tamaño natural)
    this.dead = false;
    this._loadNewSprite(); // Carga la imagen y calcula posición inicial (x,y) y tamaño (w,h)
  }

  _loadNewSprite() {
    //src aleatorio
    const src = BG_ELEMENTS[Math.floor(Math.random() * BG_ELEMENTS.length)];
    this.isReady = false;
    this.sprite = new Image();
    this.sprite.src = src;

    // la imagen carga + conocemos su tamaño natural (sin escalado)
    this.sprite.onload = () => {
      this.w = this.sprite.naturalWidth; // Ancho real del asset en px
      this.h = this.sprite.naturalHeight; // Alto real del asset en px

      // Calculamos X inicial con margen/overhang:
      const cw = this.ctx.canvas.width;
      const overhang = BG_OVERHANG_X; //constante
      const minX = -this.w * overhang; // Límite izquierdo (fuera negativo)
      const maxX = cw - this.w + this.w * overhang; // Límite derecho (más allá del borde)
      this.x = Math.floor(minX + Math.random() * (maxX - minX + 1)); // X aleatoria uniforme en [minX, maxX]
      // Calculamos Y inicial que es la altura del elemento en negativo
      this.y = -this.h;

      this.isReady = true;
    };

    // Si un asset no carga, avisa en consola y NO rompe el juego
    this.sprite.onerror = () => console.log("No carga", src);
  }

  draw() {
    // Si la imagen aún no está lista o el sprite ya “murió” (salió por abajo), no pintes
    if (!this.isReady || this.dead) return false;

    // Avance vertical por frame: cae hacia abajo
    this.y += this.vy;

    // Si el sprite ya salió completamente por la parte inferior, márcalo para eliminar
    if (this.y > this.ctx.canvas.height) {
      this.dead = true;
      return false; // Informa al controlador para que lo borre del array
    }

    // Dibuja la imagen a su tamaño natural (sin pasar w,h → NO hay escalado)
    this.ctx.drawImage(this.sprite, this.x, this.y);
    return true; // El sprite sigue “vivo”
  }
}

// ==================================================================================
// Controlador
// ==================================================================================
class BackgroundController {
  constructor(ctx) {
    this.ctx = ctx;
    this.items = []; // Lista de sprites activos en pantalla
    this._spawnTimerId = null; // Guardián del temporizador para no crear duplicados
  }

  _rand(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }

  // Programa un ÚNICO spawn con retardo aleatorio y se reprograma a sí mismo tras ejecutarse
  _scheduleNextSpawn() {
    if (this._spawnTimerId) return; // Evita lanzar más de un temporizador a la vez
    const delay = this._rand(BG_SPAWN_MIN_MS, BG_SPAWN_MAX_MS); // Delay aleatorio entre BG_SPAWN_MIN_MS y BG_SPAWN_MAX_MS

    this._spawnTimerId = setTimeout(() => {
      this._spawnTimerId = null; // Libera guardia para permitir el siguiente programado
      this.items.push(new Background(this.ctx)); // Crea un nuevo sprite y lo añade al FINAL del array.añadimos al final para mantener el orden de llegada en items[]
      this._scheduleNextSpawn(); // Encadena el siguiente spawn
    }, delay);
  }

  start() {
    // Opcional: crea 5 al inicio para que siempre se vea algo en el arranque
    if (this.items.length <= 6) this.items.push(new Background(this.ctx));
    this._scheduleNextSpawn(); // Arranca el ciclo de spawns aleatorios
  }

  updateAndDraw() {
    // Pintamos del MÁS NUEVO al MÁS VIEJO (de derecha a izquierda en el array).
    // Así, el elemento más antiguo se dibuja el último y queda por encima.
    for (let i = this.items.length - 1; i >= 0; i--) {
      const alive = this.items[i].draw();
      if (alive === false || this.items[i].dead) {
        // Eliminamos del array los que salieron por abajo sin romper el bucle
        this.items.splice(i, 1);
      }
    }
  }
}
