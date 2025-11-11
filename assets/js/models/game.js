class Game {
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext("2d");

    this.fps = FPS;
    this.drawIntervalId = undefined;

    this.player = new Player(this.ctx, (CANVAS_W / 2)-20, CANVAS_H - 60);
  }

  start() {
    if (!this.drawIntervalId) {
      this.drawIntervalId = setInterval(() => {
        this.draw();
      }, this.fps);
    }
  }

  draw() {
    this.player.draw();
  }
}
