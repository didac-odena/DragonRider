//==CANVAS SETTINGS==
const CANVAS_W = 600;
const CANVAS_H = 550;
const FPS = 1000 / 60;
const PLAYER_MARGIN = 5;

//==BG SETTINGS==
const BG_VY = 0.5;
const BG_SPAWN_MIN_MS = 200;
const BG_SPAWN_MAX_MS = 300;
const BG_OVERHANG_X = 0.75; 
const BG_ZOOM = 0.5;

//keybinds
const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_P = 80;

//==PLAYER SETTINGS==
const PLAYER_SPEED = 5;

//==UNDEFINED
const DEBUG = false; //activa/desactiva el modo debug

// Spawn de rocas
const ROCK_SPAWN_MIN_MS        = 800;   // ventana inicial: min
const ROCK_SPAWN_MAX_MS        = 1200;   // ventana inicial: max
const ROCK_SPAWN_STEP_MS       = 4000;  // cada 30s sube dificultad
const ROCK_SPAWN_MIN_LIMIT_MS  = 250;    // nunca bajar de aquí
const ROCK_SPAWN_DELTA_MS      = 0.95;    // cuánto reducimos min y max cada step

// Velocidad de rocas
const ROCK_SPEED_MIN = 1;
const ROCK_SPEED_MAX = 7;
