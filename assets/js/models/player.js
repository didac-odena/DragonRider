// ======================================================================
// Player – movement, sprite animation and collision box
// ======================================================================

class Player {
  // Static dimensions (used for placement and hitbox)
  static WIDTH = 75;
  static HEIGHT = 75;

  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = Player.WIDTH;
    this.h = Player.HEIGHT;

    this.vx = 0;

    // Sprite sheet
    this.sprite = new Image();
    this.sprite.src = "/assets/images/player-sprite.png";

    // Sprite matrix definition
    this.sprite.vFrames = 12;
    this.sprite.hFrames = 4;
    this.sprite.vFrameIndex = 1;
    this.sprite.hFrameIndex = 3;

    this.sprite.onload = () => {
      this.sprite.isReady = true;
      this.sprite.frameW = Math.floor(this.sprite.width / this.sprite.vFrames);
      this.sprite.frameH = Math.floor(this.sprite.height / this.sprite.hFrames);
      this.w = Player.WIDTH;
      this.h = Player.HEIGHT;
    };

    this.drawCount = 0; // Used for frame animation timing
  }

  // =====================================================
  // KEYBOARD INPUT
  // =====================================================

  onKeyPress(event) {
    const isPressed = event.type === "keydown";

    switch (event.keyCode) {
      case KEY_RIGHT:
        if (isPressed) this.vx = PLAYER_SPEED;
        else if (this.vx > 0) this.vx = 0;
        break;

      case KEY_LEFT:
        if (isPressed) this.vx = -PLAYER_SPEED;
        else if (this.vx < 0) this.vx = 0;
        break;
    }
  }

  // =====================================================
  // TOUCH / POINTER CONTROLS
  // =====================================================

  startMoveLeft() {
    this.onKeyPress({ type: "keydown", keyCode: KEY_LEFT });
  }

  startMoveRight() {
    this.onKeyPress({ type: "keydown", keyCode: KEY_RIGHT });
  }

  stopMove() {
    this.onKeyPress({ type: "keyup", keyCode: KEY_LEFT });
    this.onKeyPress({ type: "keyup", keyCode: KEY_RIGHT });
  }

  // =====================================================
  // MOVEMENT
  // =====================================================

  move() {
    this.x += this.vx;
  }

  // =====================================================
  // DRAW & SPRITE ANIMATION
  // =====================================================

  draw() {
    if (!this.sprite.isReady) return;

    Utils.debugDrawable(this);

    this.ctx.drawImage(
      this.sprite,
      this.sprite.vFrameIndex * this.sprite.frameW,
      this.sprite.hFrameIndex * this.sprite.frameH,
      this.sprite.frameW,
      this.sprite.frameH,
      this.x,
      this.y,
      this.w,
      this.h
    );

    this.animate();
    this.drawCount++;
  }

  // Selects animation based on movement direction
  animate() {
    if (this.vx > 0) {
      this.animateFrames(2, 0, 3, 10); // moving right
    } else if (this.vx < 0) {
      this.animateFrames(1, 0, 3, 10); // moving left
    } else {
      this.animateFrames(3, 0, 3, 10); // idle
    }
  }

  // Cycles through frame row/column in sprite sheet
  animateFrames(initialHFrame, initialVFrame, frames, frequency) {
    if (this.sprite.hFrameIndex !== initialHFrame) {
      this.sprite.hFrameIndex = initialHFrame;
      this.sprite.vFrameIndex = initialVFrame;
    } else if (this.drawCount % frequency === 0) {
      this.drawCount = 0;
      this.sprite.vFrameIndex = (this.sprite.vFrameIndex + 1) % frames;
    }
  }

  // =====================================================
  // COLLISION
  // =====================================================

  collidesWith(other) {
    if (!other) return false;

    const b =
      typeof other.getHitbox === "function"
        ? other.getHitbox()
        : { x: other.x, y: other.y, w: other.w, h: other.h };

    return (
      this.x < b.x + b.w &&
      this.x + this.w > b.x &&
      this.y < b.y + b.h &&
      this.y + this.h > b.y
    );
  }
}
