window.onload = function() {
  canvas = document.getElementById("canvas");
  cctx = canvas.getContext("2d", { alpha: false });
  // scene = document.getElementById("scene");
  // ctx = scene.getContext("2d", { alpha: false });

  test();
}

var graphics = {
  "placeholder": "graphics/placeholder.png",
  "test": "graphics/test.jpg",
  "bricks": "graphics/bricks.jpg",
  "stones": "graphics/stones.png"
}

function test() {
  // error handling
  console.error = Game.handleError;
  window.onerror = Game.handleError;

  Game.loadMap(graphics, cctx, Game.init);
}