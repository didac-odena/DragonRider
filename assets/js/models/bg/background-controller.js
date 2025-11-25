// ==================================================================================
// Controller
// ==================================================================================
class BackgroundController {
  constructor(ctx) {
    this.ctx = ctx;
    this.items = [];
    this._spawnTimerId = null;
  }

  _rand(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }

  _scheduleNextSpawn() {
    if (this._spawnTimerId) return; 
    const delay = this._rand(BG_SPAWN_MIN_MS, BG_SPAWN_MAX_MS); // random delay BG_SPAWN_MIN_MS & BG_SPAWN_MAX_MS

    this._spawnTimerId = setTimeout(() => {
      this._spawnTimerId = null; 
      this.items.push(new Background(this.ctx)); 
      this._scheduleNextSpawn();
    }, delay);
  }

  start() {
    if (this.items.length <= 6) {
      for (let i = 0; i < 5; i++) this.items.push(new Background(this.ctx));
    }
    this._scheduleNextSpawn();
  }

  updateAndDraw(isFrozen = false) {
    if (!isFrozen) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const alive = this.items[i].draw();
        if (alive === false || this.items[i].dead) {
          this.items.splice(i, 1);
        }
      }
    }
  }
}
