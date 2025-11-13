class Utils {
  static debugDrawable(drawable) {
    if (DEBUG === true) {
      drawable.ctx.save(); // sirve para guardar el canvas
      drawable.ctx.strokeStyle = "red";
      drawable.ctx.strokeRect(drawable.x, drawable.y, drawable.w, drawable.h);

      drawable.ctx.restore(); // sirve para recuperar el canvas, si no se hace esto queda todo el ctx editado
    }
  }
}
