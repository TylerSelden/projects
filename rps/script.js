var entities = [];
var each = 250;
var speed = 3;
var life = 500;
var death = false;
var dimensions = {
  w: 10,
  h: 10,
  r: 5
}
rules = [
  ["rock", "scissors", "rock"],
  ["scissors", "paper", "scissors"],
  ["paper", "rock", "paper"]
]
var types = {
  rock: "red",
  paper: "green",
  scissors: "blue"
}
var canvas, ctx, p;

window.onload = function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  p = document.getElementById("output");

  generate();
}

function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function generate() {
  for (var i in types) {
    for (var j = 0; j < each; j++) {
      entities.push({
        type: i,
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        w: dimensions.w,
        h: dimensions.h,
        r: dimensions.r,
        lastchange: 0
      });
    }
  }
  entities = entities.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)
  
  shuffle(entities);
  loop();
}

function touching(a, b) {
  //return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  var d = Math.hypot(b.x-a.x, b.y-a.y);
  return (d <= dimensions.r * 2);
}

function move(current) {
  current.x += rand(-speed, speed);
  current.y += rand(-speed, speed);
  if (current.x < 0) current.x = 0;
  if (current.y < 0) current.y = 0;
  if (current.x > canvas.width) current.x = canvas.width;
  if (current.y > canvas.height) current.y = canvas.height;
}

function percent(num, total) {
  return (Math.floor(((num / total) * 100) * 100) / 100).toFixed(2);
}

function loop() {
  var num = {
    red: 0,
    green: 0,
    blue: 0,
    dead: 0
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i in entities) {
    var current = entities[i];    
    if (!(current.lastchange >= life) || !death) num[types[current.type]]++;
    current.lastchange++;
    if (current.lastchange >= life && death) {
      num.dead++;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(current.x, current.y, current.r, 0, 2 * Math.PI);
      ctx.fill();
      continue;
    }
    move(current);
    
    //detect hits
    for (var j in entities) {
      if (entities[j] == current) continue;
      if (touching(current, entities[j])) {
        //check if rps
        for (var k in rules) {
          if ((current.type == rules[k][0] && entities[j].type == rules[k][1]) || (entities[j].type == rules[k][0] && current.type == rules[k][1])) {
            if (death && (current.lastchange > life || entities[j].lastchange > life)) continue;
            current.type = rules[k][2];
            entities[j].type = rules[k][2];
            current.lastchange = 0;
            entities[j].lastchange = 0;
          }
        }
      }
    }
    
    //render
    ctx.fillStyle = types[current.type];
    ctx.beginPath();
    ctx.arc(current.x, current.y, current.r, 0, 2 * Math.PI);
    ctx.fill();
    //ctx.fillRect(current.x, current.y, current.w, current.h);
  }
  p.innerHTML = "";
  for (var i in num) {
    p.innerHTML += i + ": " + num[i] + " (" + percent(num[i], each * Object.keys(types  ).length) + "%)<br>";
  }
  window.setTimeout(function() {
    loop();
  }, 15)
}