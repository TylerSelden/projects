var Game = {
  player: {
    x: -50,
    y: -50,
    radius: 1,
    speed: 1.5,
    turnspeed: 2,
    angle: 90,
    zAngle: 0,
    turn: function(dir) {
      if (dir == 0) {
        this.angle -= Game.player.turnspeed;
      } else {
        this.angle += Game.player.turnspeed;
      }
      if (this.angle > 360) {
        this.angle -= 360;
      }
      if (this.angle < 0) {
        this.angle += 360;
      }
    },
    move: function(dir) {
      var angle = this.angle;
      angle += (dir * 90);
      var cos = Math.cos(Game.toRad(angle)); // + facing right
      var sin = Math.sin(Game.toRad(angle)); // - facing up
    
      var deltaX = this.speed * cos;
      var radBufferX = this.radius;
      if (cos < 0) radBufferX *= -1;
      var deltaY = this.speed * sin;
      var radBufferY = this.radius;
      if (sin < 0) radBufferY *= -1;

    
      var mapX = Math.floor((deltaX + this.x + radBufferX) / Game.mapConfig.blockSize);
      var mapY = Math.floor((deltaY + this.y + radBufferY) / Game.mapConfig.blockSize);
      var pMapX = Math.floor((this.x + radBufferX) / Game.mapConfig.blockSize);
      var pMapY = Math.floor((this.y + radBufferY) / Game.mapConfig.blockSize);
      // i will be completely honest, i have no clue what this ^ does or why it's here
      
      if (!Game.checkSolid(mapY, pMapX)) {
        this.y += deltaY;
      }
      if (!Game.checkSolid(pMapY, mapX)) {
        this.x += deltaX;
      }
    }
  },
  rays: {
    quantity: 720,
    fov: 50,
    step: 0.1,
    renderDistance: 30,
    zmatrix: [],
    ymatrix: [],
    dev: []
  },
  mapConfig: {
    darkness: 0.1,
    blockSize: 50,
    tallest: 2
  },
  map: {
    data: `  #################################################
    #           #       # # #   # #       #   #   #
# ####### ### ##### ### # # # ### ### ##### # # ###
#   #       # # #   #           # #   # #   # #   #
# ##### ### ### ########### ### # # ### # ####### #
#   #   #           # # # # #     #   #     # # # #
# ### ####### ##### # # # # # ### # ####### # # # #
# # # # # #   #   #   # #   # #     #           # #
# # # # # # ##### # ### ### ##### ### ####### ### #
#   #   # # #   #   # #       # # #   #         # #
### # # # ### ####### ##### # # # # ##### ####### #
#   # #             #     # # #     #     #   # # #
# ### ### # ##### # # ##### ### ######### # ### # #
# #   #   #   #   # # #     # #   #     #     #   #
# ##### # # ####### # ##### # # ### ### # ##### ###
#       # #     #   # # #     # # # #   #         #
### # # # ####### ### # ### # ### ### ##### #######
# # # # #   #         #     #   #   #     #   #   #
# ####### ##### ### ### # # ### ### # ##### # # # #
#     #   #     #     # # # #       #     # #   # #
##### # # ########### # ####### # # # ### ##### ###
# # #   # # # # #   # # # # # # # #     # # # #   #
# # ##### # # # # # ##### # # ##### ### ### # # ###
#   # #   #   #   #     #   #     # #   # #       #
# # # ### # ##### # # ### ##### ##### ### # ##### #
# #             # # # # # #   # # # # #       # # #
### ##### ####### # ### # ### # # # ### ##### # # #
#   # # #       # # # #         #     #   #     # #
# ### # ##### ### ### ####### ####### # ### # #####
# #     # # #   #   #   #       #       #   #     #
# # ##### # ### # # ### ##### ##### # ### # # ### #
# #         #     # # #             #   # # # # # #
# ### ######### # ### # ####### # ############# # #
# #   #     # # #   # #   # #   #       #     # # #
### # ##### # # # ### # # # ####### ### ### ### # #
#   #       # # #   #   # #   # #   #     #   # # #
# ##### ### # ##### ### ### # # ####### ### # # # #
# # #   #     #   #         # #       #     #   # #
# # ####### ### ##### ### ####### ### ### #########
#   # #       # #   #   # #   #     # #       # # #
# ### ### ##### # ### ##### # # ### ########### # #
#   #   #                 # # # #     #   # #     #
####### # ##### # # ### # # # # ####### ### # # ###
#         # # # # # #   #   #     #     # #   #   #
# ######### # ### ##### ##### # # ### # # # #######
#   #       #   # # #     #   # # #   #           #
### ##### ### # ### # ### # # ### # # #############
#       # # # # #       # # # #   # # #     #     #
### # # # # ### # # ##### ### ### ### # ### # #####
#   # #       #   #   #   #     #         #        
#################################################  `.split("\n"),
    // fix fisheye effect or i kill you :P
    info: {
      " ": {
        solid: false,
        color: {
          r: 0,
          g: 0,
          b: 0
        },
        ceiling: {
          texture: "placeholder",
          height: 2
        }
      },
      "#": {
        solid: true,
        color: {
          r: 75,
          g: 75,
          b: 200
        },
        ceiling: {
          texture: "placeholder",
          height: 2
        },
        height: 2,
        graphic: "placeholder"
      },
      ".": {
        solid: true,
        color: {
          r: 200,
          g: 75,
          b: 75
        },
        ceiling: {
          texture: "placeholder",
          height: 2
        },
        height: 2,
        graphic: "placeholder"
      },
      "-": {
        solid: true,
        color: {
          r: 75,
          g: 75,
          b: 125
        },
        ceiling: {
          texture: "placeholder",
          height: 2
        },
        height: 2,
        graphic: "placeholder"
      }
    }
  },
  graphics: {},
  entities: [
    {
      color: "red",
      x: 250,
      y: 100
    }
  ],
  toRad: function(angle) {
    return angle * Math.PI / 180;
  },
  toDeg: function(angle) {
    return angle * (180 / Math.PI);
  },
  checkSolid: function(y, x) {
    if (Game.map.data[y] !== undefined && Game.map.data[y][x] !== undefined) return Game.map.info[Game.map.data[y][x]].solid;
  },
  angleOf: function(a, b) {
    var dy = a[1] - b[1];
    var dx = a[0] - b[0];
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta - 180;
  },
  getSpriteCoord: function(sprite) {
    var angle = Game.angleOf([Game.player.x, Game.player.y], [sprite.x, sprite.y]) - Game.player.angle;

    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return (angle * (canvas.width / Game.rays.fov)) + (canvas.width / 2);
  },
  distanceTo: function(a, b) {
    var a = a[0] - b[0];
    var b = a[1] - b[1];

    return Math.sqrt(a * a, b * b);
  },
  //asdf4
  closeTo: function(a, b) {
    return Math.abs(a - b) <= 1;
  },
  getZDistances: function() {
    Game.rays.ymatrix = [];
    for (var i = 0; i < Game.rays.quantity / 2; i++) {
      var xAngle = Game.toRad((Game.player.angle));
      var rayX = Game.player.x;
      var rayY = Game.player.y;
      var rayZ = 0.5;
    }
  },
  distanceTo3d: function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    var dz = a[2] - b[2];
    return Math.sqrt( dx * dx + dy * dy + dz * dz );
  },
  getDistances: function () {
    Game.rays.zmatrix = [];
    Game.rays.ymatrix = [];
    for (var i = 0; i < Game.rays.quantity; i++) {
      var angle = Game.toRad((Game.player.angle - (Game.rays.fov / 2)) + ((Game.rays.fov / Game.rays.quantity) * i));
      var rayX = Game.player.x;
      var rayY = Game.player.y;
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);
      var tan = Math.tan(angle);
      var tallest = 0;

      for (var j = 0; j < Game.rays.renderDistance; j++) {
        var stepX, stepY;

        if (sin < 0) {
          stepY = (Math.floor((rayY - 0.0000000001) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayY;
        } else {
          stepY = (Math.ceil((rayY + 0.0000000001) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayY;
        }
        if (cos < 0) {
          stepX = (Math.floor((rayX - 0.0000000001) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayX
        } else {
          stepX = (Math.ceil((rayX + 0.0000000001) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayX;
        }
      

        var nearX = [rayX + stepX, (stepX * tan) + rayY];
        var nearY = [(stepY / tan) + rayX, rayY + stepY];
        var mapX, mapY, onBlock;

        var mirrorGraphic = false;
        if (Game.distanceTo([rayX, rayY], nearX) < Game.distanceTo([rayX, rayY], nearY)) {
          rayX = nearX[0];
          rayY = nearX[1];
          onBlock = nearX[1] % Game.mapConfig.blockSize;
          mapX = Math.floor(rayX / Game.mapConfig.blockSize);
          mapY = Math.floor(rayY / Game.mapConfig.blockSize);
          if (cos < 0) { // + facing right
            mapX -= 1;
            mirrorGraphic = true;
          }
        } else {
          rayX = nearY[0];
          rayY = nearY[1];
          onBlock = nearY[0] % Game.mapConfig.blockSize;
          mapX = Math.floor(rayX / Game.mapConfig.blockSize);
          mapY = Math.floor(rayY / Game.mapConfig.blockSize);
          mirrorGraphic = true;
          if (sin < 0) { // + facing up
            mapY -= 1; 
            mirrorGraphic = false;
          }
        }

        if (Game.checkSolid(mapY, mapX)) {
          var tile = Game.map.data[mapY][mapX];
          var distance = Math.sqrt(Math.pow(rayX - Game.player.x, 2) + Math.pow(rayY - Game.player.y, 2));
          
          if (distance <= tallest) break;
          tallest = distance;

          Game.rays.zmatrix.push([distance, tile, i, onBlock, mirrorGraphic]);
          if (Game.map.info[tile].height >= Game.mapConfig.tallest) break;
        }
      }

      Game.rays.dev[i] = [rayX, rayY];
    }
    Game.rays.zmatrix.sort((a, b) => { return b[0] - a[0] })
  },
  logic: function () {
    var frameBuffer = Date.now();

    for (var i in Game.activeKeys) {
      if (Game.activeKeys[i] && typeof (Game.keyBindings[i]) == "function") Game.keyBindings[i]();
    }

    Game.getDistances();

    setTimeout(function () {
      Game.logic();
    }, (1000 / 60) - (Date.now() - frameBuffer));
  },
  mirrorImage: function(x, width) {
    var half = width / 2;
    return x + ((half - x) * 2);
  },
  getHeight: function(distance) {
    return 64 / distance * 277;
  },
  getFloor: function(distance) {
    var height = 64 / distance * 277;
    return (canvas.height / 2) - (height / 2);
  },
  drawWalls: function() {
    var columnWidth = canvas.width / Game.rays.quantity;
    var furthest = [];
    for (var i in Game.rays.zmatrix) {
      var current = Game.rays.zmatrix[i];
      var distance = current[0] * Math.cos(Game.toRad(((Game.rays.fov / Game.rays.quantity) * current[2]) - (Game.rays.fov / 2)));
      if (distance >= furthest[current[3]]) {
        continue;
      }
      furthest[current[3]] = distance;
      var tile = current[1];
      var onBlock = current[3];

      var wallHeight = Game.getHeight(distance);
      var wallTop = (canvas.height / 2) - (wallHeight / 2) - (wallHeight  * (Game.map.info[tile].height - 1));
      wallHeight *= Game.map.info[tile].height;
      var columnX = current[2] * columnWidth;

      var graphic = Game.graphics[Game.map.info[tile].graphic];
      if (graphic == null) {
        // get wall color
        var r = Game.map.info[tile].color.r - distance * Game.mapConfig.darkness;
        var g = Game.map.info[tile].color.g - distance * Game.mapConfig.darkness;
        var b = Game.map.info[tile].color.b - distance * Game.mapConfig.darkness;
        // var a = (1000 - distance * Game.mapConfig.darkness) / 1000;
        var a = 1;

        // draw the column
        cctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        cctx.fillRect(columnX, wallTop, columnWidth, wallHeight);
      } else {
        // draw the image
        var blockScale = onBlock / Game.mapConfig.blockSize;

        var imageX = blockScale * graphic.width;

        if (current[4]) {
          imageX = Game.mirrorImage(imageX, graphic.width);
        }
        imageX = Math.round(imageX);
        if (imageX == graphic.width) imageX--;
        cctx.drawImage(graphic, imageX, 0, columnWidth, graphic.height, columnX, wallTop, columnWidth, wallHeight);
      }
    }
  },
  drawEntities: function() {
    var entityX = Game.getSpriteCoord(Game.entities[0]);

    cctx.fillStyle = "green";
    cctx.fillRect(x, canvas.height / 2, 50, 50);
  },
  render: function() {
    var frameBuffer = Date.now();
    cctx.clearRect(0, 0, canvas.width, canvas.height);

    Game.drawWalls();



    setTimeout(function () {
      Game.render();
    }, (1000 / 60) - (Date.now() - frameBuffer));
  },
  keyBindings: {
    37: () => { Game.player.turn(0) },
    39: () => { Game.player.turn(1) },
    87: () => { Game.player.move(0) },
    38: () => { Game.player.move(0) },
    68: () => { Game.player.move(1) },
    83: () => { Game.player.move(2) },
    40: () => { Game.player.move(2) },
    65: () => { Game.player.move(3) }
  },
  handleError(err, source, lineno, colno, error) {
    cctx.fillStyle = "black";
    cctx.fillRect(0, 0, canvas.width, canvas.height);
    cctx.fillStyle = "white";
    cctx.font = "20px Sans-Serif";
    cctx.fillText(err, 10, 20);
    cctx.fillText(source, 10, 40);
    cctx.fillText(lineno + ":" + colno, 10, 60);
    cctx.fillText(error, 10, 80);
  },
  activeKeys: [],
  loadMap: function(graphics, context, callback) {
    // create loading screen
    context.font = "20px Sans-Serif";
    context.fillStyle = "white";
    var textY = 20;
    context.fillText("Loading...", 10, textY);
    textY += 20;
    var loaded = 0;
    // load in the graphics
    for (var i in graphics) {
      Game.graphics[i] = new Image();
      Game.graphics[i].onload = function() {
        loaded++;
        if (loaded == Object.keys(graphics).length) {
          callback();
        }
      }
      Game.graphics[i].onerror = function() {
        console.error("Failed to load image: " + this.name, "Game.loadMap", 397, 3, this.src);
        textY += 20;
      }
      Game.graphics[i].name = i;
      Game.graphics[i].src = graphics[i];
    }
  },
  init: function() {
    cctx.imageSmoothingEnabled = true;
    cctx.imageSmoothingQuality = "medium";
    window.addEventListener("keydown", (event) => { Game.activeKeys[event.keyCode] = true });
    window.addEventListener("keyup", (event) => { Game.activeKeys[event.keyCode] = false });
    Game.logic();
    Game.render();
  }
}