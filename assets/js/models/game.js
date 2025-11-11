class Game {

    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext('2d');

        this.fps = FPS;
        this.drawIntervalId = undefined;
    }

    start() {
        if (!this.drawIntervalId) {
            
            this.drawIntervalId = setInterval(() => {
                console.log(`Draw test`);
            }, this.fps);
        }
    }
 }