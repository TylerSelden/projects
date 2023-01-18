// map: img, width, height, solids, entities
// entity: img, dimensions, sprite, hitbox, solidbox, type, inventory, speed, func, hit_func, kill, offset (required; not used)

var dummy = function() {}
var loopstop = false;

var solids = [
  [222, 75, 567, 47],
  [225, 121, 35, 271],
  [217, 361, 227, 33],
  [410, 361, 33, 155],
  [410, 477, 275, 39],
  [655, 427, 32, 89],
  [655, 427, 124, 34],
  [754, 75, 35, 385],
  [443, 220, 90, 24],
  [553, 327, 93, 27]
];

var assets = [
  "player.png",
  "test_level.png",
  "empty.png",
  "dialogue.png"
];

window.onload = function() {
  //load images
  for (var i in assets) {
    assets[i] = Game.utils.load_img(assets[i]);
  }
  
  Game.platformer = true;
  engine_setup();
  
  var x, y;
  if (window.localStorage.y !== undefined) {
    x = parseInt(window.localStorage.x);
    y = parseInt(window.localStorage.y);
  } else {
    x = 494;
    y = 445;
  }
  Game.player = new Game.entity(assets[0], [x, y, 32, 32], [0, 0, 32, 32], [0, 0, 32, 32], [0, 0, 32, 32], null, [], 3, dummy, dummy, dummy, [Game.renderer.canvas.width / 2 - 32, Game.renderer.canvas.height / 2 - 32], 1);
  
  Game.currentmap = new Game.map(assets[1], assets[2], 1280, 720, solids, []);
  Game.maps.push(Game.currentmap);
  setup();
  loop();
  spriteloop();
}

function engine_setup() {
  Array.prototype.remove = function(item) {
    const index = this.indexOf(item);
    if (index > -1) {
      this.splice(index, 1); // 2nd parameter means remove one item only
    }
  }
  Game.debug.show_hitboxes = false;
  Game.renderer.bg_color = "#eaeaea";
  Game.renderer.canvas = document.getElementById("canvas");
  Game.renderer.ctx = canvas.getContext("2d");
  Game.renderer.ctx.imageSmoothingEnabled = false;
  Game.renderer.ctx.font = "20px Comic Sans MS";
  
  //dialogue setup
  Game.dialogue.y = 350;
  Game.dialogue.delta = 30;
  Game.dialogue.filter = assets[3];
  Game.dialogue.message = ["", "", "", ""];
}

var keys = {
  left: false,
  up: false,
  right: false,
  down: false,
  space: false
}

function setup() {
  window.addEventListener("keydown", (e) => {
    var key = e.keyCode;
    if (Game.dialogue.active) {
      if (key == 32) Game.dialogue.active = false;
      return;
    }
    if (key == 37 || key == 65) {
      keys.left = true;
    }
    if (key == 38 || key == 87) {
      keys.up = true;
    }
    if (key == 39 || key == 68) {
      keys.right = true;
    }
    if (key == 40 || key == 83) {
      keys.down = true;
    }
    if (key == 32) {
      if (!loopstop) {
        loopstop = true;
      } else {
        loopstop = false;
        loop();
      }
      keys.space = true;
    }
  });
  
  window.addEventListener("keyup", (e) => {
    var key = e.keyCode;
    if (key == 37 || key == 65) {
      keys.left = false;
    }
    if (key == 38 || key == 87) {
      keys.up = false;
    }
    if (key == 39 || key == 68) {
      keys.right = false;
    }
    if (key == 40 || key == 83) {
      keys.down = false;
    }
    if (key == 32) {
      keys.space = false;
    }
  });
}

function spriteloop() {
  window.localStorage.x = Game.player.x;
  window.localStorage.y = Game.player.y;
  Game.update_sprites();
  window.setTimeout(spriteloop, 50);
}

function loop() {
  if (Game.dialogue.active) {
    keys = {
      left: false,
      up: false,
      right: false,
      down: false,
      space: false
    }
  }
  var dirs = [false, false, false, false];
  if (keys.left) {
    dirs[0] = true;
  }
  if (keys.up) {
    if (Game.platformer) {
      Game.player.jump();
    } else {
      dirs[1] = true;
    }
  }
  if (keys.right) {
    dirs[2] = true;
  }
  if (keys.down) {
    dirs[3] = true;
  }
  document.getElementById("x").innerHTML = Game.player.x;
  document.getElementById("y").innerHTML = Game.player.y;
  document.getElementById("xs").innerHTML = Game.player.speed;
  document.getElementById("ys").innerHTML = Game.player.fallspeed;
  Game.player.move(dirs, Game.player.speed);
  Game.render_loop();
  if (!loopstop) {
    window.setTimeout(loop, 15);
  }
}