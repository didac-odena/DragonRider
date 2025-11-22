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
    if (this.items.length <= 6) {
      for (let i = 0; i < 5; i++) this.items.push(new Background(this.ctx));
    }
    this._scheduleNextSpawn(); // Arranca el ciclo de spawns aleatorios
  }

updateAndDraw(isFrozen = false) {
  if (!isFrozen) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const alive = this.items[i].draw();
      if (alive === false || this.items[i].dead) {
        // Eliminamos del array los que salieron por abajo sin romper el bucle
        this.items.splice(i, 1);
      }}
    }
  }
}
