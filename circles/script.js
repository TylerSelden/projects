var canvas, ctx;
window.onload = function () {
  canvas = document.getElementById("canvas");
  canvas.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left + 1;
    var y = event.clientY - rect.top + 1;
    player.x = x;
    player.y = y;
  });
  ctx = canvas.getContext("2d");
  loop();
}
var dots = [];
var framerate = 15;
var maxDots = 25;
var counter = 0;
var game = true;

function rand(min, max) {
  //min and max exclusive
  return Math.floor(Math.random() * (max - min) + min);
}

function makeNewDot() {
  if (dots.length >= maxDots + counter) {
    return;
  }
  var rand1 = rand(-50, 0);
  var rand2 = rand(500, 550);
  var rand3 = rand(-50, 0);
  var rand4 = rand(500, 550);
  var rand5 = rand(0, 2);
  var rand6 = rand(0, 2);
  var newDot = {
    x: rand(0, 500),
    y: rand(0, 500),
    xSpeed: rand(-2, 2),
    ySpeed: rand(-2, 2),
    radius: rand(5, 50),
    color: randomColor(),
    beenIn: false
  }
  if (newDot.xSpeed < 0) {
    newDot.x += newDot.xSpeed * (canvas.width / newDot.xSpeed);
  } else {
    newDot.x -= newDot.xSpeed * (canvas.width / newDot.xSpeed);
  }
  if (newDot.ySpeed < 0) {
    newDot.y += newDot.ySpeed * (canvas.height / newDot.ySpeed);
  } else {
    newDot.y -= newDot.ySpeed * (canvas.height / newDot.ySpeed);
  }
  dots.push(newDot);
}

/*
X
 \____
| \   |
|  \  |
|___\_|
     \
      \
make random xspeed and yspeed
x = somewhere on canvas
y = somewhere on canvas
*/

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function randomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var player = {
  x: 250,
  y: 250,
  radius: 10,
  color: randomColor()
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function loop() {
  if (!game) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //move player dot
  ctx.fillStyle = player.color;
  circle(player.x, player.y, player.radius);
  //add to dots if < max
  if (dots.length < maxDots + counter) {
    setTimeout(makeNewDot, rand(0, 3000));
  }
  //move dots, render, and check collision
  for (var i = 0; i < dots.length; i++) {
    var dot = dots[i];
    //check for NaN
    if (isNaN(dot.x) || isNaN(dot.y)) {
      dots.splice(i, 1);
      continue;
    }
    dots[i].x += dots[i].xSpeed;
    dots[i].y += dots[i].ySpeed;
    ctx.fillStyle = dots[i].color;
    circle(dots[i].x, dots[i].y, dots[i].radius);
    if (dot.x < (canvas.width + dot.radius) && dot.x > -dot.radius && dot.y < (canvas.height + dot.radius) && dot.y > -dot.radius) {
      dots[i].beenIn = true;
    } else {
      if (dot.beenIn) {
        dots.splice(i, 1);
      }
    }
    //collision detection
    if (distance(dot.x, dot.y, player.x, player.y) < dot.radius + player.radius) {
      if (dot.radius > player.radius) {
        alert("You lose!");
        return;
      } else {
        counter += 1;
        dots.splice(i, 1);
        player.radius += dot.radius / 5;
      }
    }
  }
  ctx.font = "50px comic sans";
  ctx.fillStyle = "#000000";
  ctx.fillText(counter.toLocaleString(), 0, 50);
  window.requestAnimationFrame(loop);
}