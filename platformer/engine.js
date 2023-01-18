var Game = {
  map: function(img, top, width, height, solids, entities) {
    this.img = img;
    this.top = top;
    
    this.width = width;
    this.height = height;
    
    this.solids = solids;
    
    this.entities = entities;
  },
  entity: function(img, dimensions, sprite, hitbox, solidbox, type, inventory, speed, func, hit_func, kill, offset, weight) {
    this.img = img;
    
    this.x = dimensions[0];
    this.y = dimensions[1];
    this.width = dimensions[2];
    this.height = dimensions[3];
    
    this.sprite = {
      index: -1,
      start: sprite[0],
      end: sprite[1],
      width: sprite[2],
      height: sprite[3]
    }
    
    this.hitbox = {
      x: hitbox[0],
      y: hitbox[1],
      width: hitbox[2],
      height: hitbox[3]
    }
    this.solidbox = {
      x: solidbox[0],
      y: solidbox[1],
      width: solidbox[2],
      height: solidbox[3]
    }
    
    this.type = type;
    this.inventory = inventory;
    this.speed = speed;
    
    this.func = func;
    this.hit_func = hit_func;
    this.kill = kill;
    
    this.grounded = false;
    this.fallspeed = 0;
    if (weight == undefined) {
      this.weight = 0;
    } else {
      this.weight = 1;
    }
    
    if (typeof(offset) == "object") {
      this.offset = {
        x: offset[0],
        y: offset[1]
      }
    }
    this.move = function(dirs, speed) {
      if (dirs[0]) {
        this.x += Game.utils.render_solid(this.x + this.solidbox.x, this.y + this.solidbox.y, this.solidbox.width, this.solidbox.height, "left", speed);
      }
      if (dirs[1]) {
        this.y += Game.utils.render_solid(this.x + this.solidbox.x, this.y + this.solidbox.y, this.solidbox.width, this.solidbox.height, "up", speed);
      }
      if (dirs[2]) {
        this.x += Game.utils.render_solid(this.x + this.solidbox.x, this.y + this.solidbox.y, this.solidbox.width, this.solidbox.height, "right", speed);
      }
      if (dirs[3]) {
        this.y += Game.utils.render_solid(this.x + this.solidbox.x, this.y + this.solidbox.y, this.solidbox.width, this.solidbox.height, "down", speed);
      }
    }
    this.jump = function() {
      if (this.grounded) {
        this.grounded = false;
        this.fallspeed = -Game.jumpspeed;
      }
    }
    this.fall = function() {
      if (this.weight !== 0) {
        this.fallspeed += Game.gravity * this.weight;
        if (this.fallspeed > Game.maxfallspeed) {
          this.fallspeed = Game.maxfallspeed;
        }
        if (this.fallspeed < 0) {
          this.move([false, true, false, false], Math.abs(this.fallspeed));
        } else {
          this.move([false, false, false, true], this.fallspeed);
        }
      }
    }
    this.check_roofed = function() {
      var x = this.x;
      var y = this.y;
      var w = this.width;
      var h = this.height;
      var speed = Math.abs(this.fallspeed);
      for (var i = 0; i < Game.currentmap.solids.length; i++) {
        var ogbox = Game.currentmap.solids[i];
        if (!Game.utils.check_collision(x - speed, y - speed, w + (speed * 2), h + (speed * 2), ogbox[0], ogbox[1], ogbox[2], ogbox[3])) {
          continue;
        }
        var currentbox = {
          x: ogbox[0],
          y: ogbox[1] + ogbox[3],
          w: ogbox[2],
          h: speed
        }
        if (Game.utils.check_collision(x, y, w, h, currentbox.x, currentbox.y, currentbox.w, currentbox.h) && this.fallspeed < 0) {
          this.fallspeed = -Game.gravity;
        }
      }
    }
    this.check_grounded = function() {
      this.check_roofed();
      this.grounded = false;
      var x = this.x;
      var y = this.y;
      var w = this.width;
      var h = this.height;
      var speed = this.fallspeed;
      for (var i = 0; i < Game.currentmap.solids.length; i++) {
        var ogbox = Game.currentmap.solids[i];
        if (!Game.utils.check_collision(x - speed, y - speed, w + (speed * 2), h + (speed * 2), ogbox[0], ogbox[1], ogbox[2], ogbox[3])) {
          continue;
        }
        var currentbox = {
          x: ogbox[0],
          y: ogbox[1] - speed,
          w: ogbox[2],
          h: speed
        }
        if (Game.utils.check_collision(x, y, w, h, currentbox.x, currentbox.y, currentbox.w, currentbox.h)) {
          this.grounded = true;
          this.fallspeed = 0;
          return;
        }
      }
    }
  },
  debug: {
    show_hitboxes: false
  },
  renderer: {
    canvas: null,
    ctx: null,
    bg_color: "#000000"
  },
  camera: {
    x: 0,
    y: 0
  },
  gravity: 0.3,
  jumpspeed: 9,
  maxfallspeed: 9,
  player: null,
  maps: [],
  filters: [],
  currentmap: null,
  scenes: [],
  currentscene: null,
  paused: false,
  pause: function() {
    paused = true;
  },
  unpause: function() {
    paused = false;
  },
  dialogue: {
    active: false,
    y: null,
    color: "#000000",
    delta: null,
    filter: null,
    message: []
  },
  utils: {
    load_img: function(path) {
      if (document.getElementById("assets") == null) {
        var div = document.createElement("div");
        div.setAttribute("style", "display: none;");
        div.setAttribute("id", "assets");
        document.body.appendChild(div);
      }
      var img = document.createElement("img");
      img.setAttribute("src", path);
      img.setAttribute("id", path);
      document.getElementById("assets").appendChild(img);
      return document.getElementById(path);
    },
    unload_img: function(path) {
      if (document.getElementById("assets") == null) {
        var div = document.createElement("div");
        div.setAttribute("style", "display: none;");
        div.setAttribute("id", "assets");
        document.body.appendChild(div);
      }
      if (document.getElementById(path) !== null) {
        document.getElementById("assets").removeChild(document.getElementById(path));
      }
    },
    check_collision: function(x1, y1, w1, h1, x2, y2, w2, h2) {
      if (x2 < x1 + w1 && y2 < y1 + h1 && x2 + w2 > x1 && y2 + h2 > y1) {
        return true;
      } else {
        return false;
      }
    },
    render_solid: function(x, y, w, h, dir, speed) {
      var delta = null;
      if (dir == "left") {
        delta = -speed;
        //map solids
        for (var i = 0; i < Game.currentmap.solids.length; i++) {
          var ogbox = Game.currentmap.solids[i];
          if (!Game.utils.check_collision(x - speed, y - speed, w + (speed * 2), h + (speed * 2), ogbox[0], ogbox[1], ogbox[2], ogbox[3])) {
            continue;
          }
          var currentbox = {
            x: ogbox[0] + ogbox[2],
            y: ogbox[1],
            w: speed,
            h: ogbox[3]
          }
          if (Game.utils.check_collision(x, y, w, h, currentbox.x, currentbox.y, currentbox.w, currentbox.h)) {
            delta = currentbox.x - x;
            break;
          }
        }
        return delta;
      } else if (dir == "up") {
        delta = -speed;
        //map hitboxes
        for (var i = 0; i < Game.currentmap.solids.length; i++) {
          var ogbox = Game.currentmap.solids[i];
          if (!Game.utils.check_collision(x - speed, y - speed, w + (speed * 2), h + (speed * 2), ogbox[0], ogbox[1], ogbox[2], ogbox[3])) {
            continue;
          }
          var currentbox = {
            x: ogbox[0],
            y: ogbox[1] + ogbox[3],
            w: ogbox[2],
            h: speed
          }
          if (Game.utils.check_collision(x, y, w, h, currentbox.x, currentbox.y, currentbox.w, currentbox.h)) {
            delta = currentbox.y - y;
            break;
          }
        }
        return delta;
      } else if (dir == "right") {
        delta = speed;
        //map hitboxes
        for (var i = 0; i < Game.currentmap.solids.length; i++) {
          var ogbox = Game.currentmap.solids[i];
          if (!Game.utils.check_collision(x - speed, y - speed, w + (speed * 2), h + (speed * 2), ogbox[0], ogbox[1], ogbox[2], ogbox[3])) {
            continue;
          }
          var currentbox = {
            x: ogbox[0] - speed,
            y: ogbox[1],
            w: speed,
            h: ogbox[3]
          }
          if (Game.utils.check_collision(x, y, w, h, currentbox.x, currentbox.y, currentbox.w, currentbox.h)) {
            delta = ogbox[0] - (x + w);
            break;
          }
        }
        return delta;
      } else if (dir == "down") {
        delta = speed;
        //map hitboxes
        for (var i = 0; i < Game.currentmap.solids.length; i++) {
          var ogbox = Game.currentmap.solids[i];
          if (!Game.utils.check_collision(x - speed, y - speed, w + (speed * 2), h + (speed * 2), ogbox[0], ogbox[1], ogbox[2], ogbox[3])) {
            continue;
          }
          var currentbox = {
            x: ogbox[0],
            y: ogbox[1] - speed,
            w: ogbox[2],
            h: speed
          }
          if (Game.utils.check_collision(x, y, w, h, currentbox.x, currentbox.y, currentbox.w, currentbox.h)) {
            delta = ogbox[1] - (y + h);
            break;
          }
        }
        return delta;
      }
    }
  },
  update_sprites() {
    for (var i = 0; i < Game.currentmap.entities.length; i++) {
      var entity = Game.currentmap.entities[i];
      if (entity.sprite.end - 1 <= entity.sprite.index) {
        entity.sprite.index = entity.sprite.start;
      } else {
        entity.sprite.index += 1;
      }
    }
    //update player sprite
    if (Game.player.sprite.end - 1 <= Game.player.sprite.index) {
      Game.player.sprite.index = Game.player.sprite.start;
    } else {
      Game.player.sprite.index += 1;
    }
  },
  logic_loop: function() {
    if (Game.paused) {
      if (typeof(Game.currentscene) == "function") {
        Game.currentscene();
        return;
      }
    }
    //hitboxes
    Game.player.check_grounded();
    Game.player.fall();
    for (var i = 0; i < Game.currentmap.entities.length; i++) {
      var entity = Game.currentmap.entities[i];
      entity.check_grounded();
      entity.fall();
      entity.func();
      if (Game.utils.check_collision(Game.player.x + Game.player.hitbox.x, Game.player.y + Game.player.hitbox.y, Game.player.hitbox.width, Game.player.hitbox.height, entity.hitbox.x + entity.x, entity.hitbox.y + entity.y, entity.hitbox.width, entity.hitbox.height)) {
        entity.hit_func();
      }
    }
  },
  render_loop: function() {
    //camera follows player
    Game.camera.x = Game.player.x - Game.player.offset.x;
    Game.camera.y = Game.player.y - Game.player.offset.y;
    
    var canvas = Game.renderer.canvas;
    var ctx = Game.renderer.ctx;
    //clear the screen and render it black
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = Game.renderer.bg_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    Game.logic_loop();
    //render the map
    ctx.drawImage(Game.currentmap.img, -Game.camera.x, -Game.camera.y, Game.currentmap.width, Game.currentmap.height);
    //render entities
    for (var i = 0; i < Game.currentmap.entities.length; i++) {
      var entity = Game.currentmap.entities[i];
      //draw the sprite's frame
      ctx.drawImage(entity.img, entity.sprite.width * entity.sprite.index, 0, entity.sprite.width, entity.sprite.height, -Game.player.x + Game.player.offset.x + entity.x, -Game.player.y + Game.player.offset.y + entity.y, entity.width, entity.height);
    }
    //render player
    ctx.drawImage(Game.player.img, Game.player.sprite.width * Game.player.sprite.index, 0, Game.player.sprite.width, Game.player.sprite.height, Game.player.offset.x, Game.player.offset.y, Game.player.width, Game.player.height);
    
    //topmap
    ctx.drawImage(Game.currentmap.top, -Game.camera.x, -Game.camera.y, Game.currentmap.width, Game.currentmap.height);
    //dialogue
    if (Game.dialogue.active) {
      ctx.textAlign = "center";
      ctx.fillStyle = Game.dialogue.color;
      ctx.drawImage(Game.dialogue.filter, 0, 0);
      for (var i = 0; i < Game.dialogue.message.length; i++) {
        ctx.fillText(Game.dialogue.message[i], Game.renderer.canvas.width / 2, Game.dialogue.y + (Game.dialogue.delta * i));
      }
    }
    
    //screen filters
    for (var i = 0; i < Game.filters.length; i++) {
      ctx.drawImage(Game.filters[i], 0, 0);
    }
    //debug options
    if (Game.debug.show_hitboxes) {
      //map soilds
      for (var i = 0; i < Game.currentmap.solids.length; i++) {
        var currentbox = Game.currentmap.solids[i];
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(-Game.player.x + Game.player.offset.x + currentbox[0], -Game.player.y + Game.player.offset.y + currentbox[1], currentbox[2], currentbox[3]);
      }
      //entity hitboxes
      for (var i = 0; i < Game.currentmap.entities.length; i++) {
        var currentbox = Game.currentmap.entities[i].hitbox;
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        ctx.fillRect(-Game.player.x + Game.player.offset.x + currentbox.x + Game.currentmap.entities[i].x, -Game.player.y + Game.player.offset.y + currentbox.y + Game.currentmap.entities[i].y, currentbox.width, currentbox.height);
      }
      //entity solidbox
      for (var i = 0; i < Game.currentmap.entities.length; i++) {
        var currentbox = Game.currentmap.entities[i].solidbox;
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(-Game.player.x + Game.player.offset.x + currentbox.x + Game.currentmap.entities[i].x, -Game.player.y + Game.player.offset.y + currentbox.y + Game.currentmap.entities[i].y, currentbox.width, currentbox.height);
      }
      //player hitbox
      var currentbox = Game.player.hitbox;
      ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
      ctx.fillRect(Game.player.offset.x + currentbox.x, Game.player.offset.y + currentbox.y, currentbox.width, currentbox.height);
      //player solidbox
      currentbox = Game.player.solidbox;
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(Game.player.offset.x + currentbox.x, Game.player.offset.y + currentbox.y, currentbox.width, currentbox.height);
    }
  }
}