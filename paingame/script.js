var previous = [];
var winchance = 75;

function rand(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function fixup(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function display(text) {
  var output = document.getElementById("output");
  output.style.opacity = 0;
  window.setTimeout(function() {
    output.innerHTML = text;
    output.style.opacity = 1;
  }, 2000);
}

function win() {
  alert("You won! Here's a list of all the previous prompts:\n" + previous.join("\n"));
  display("You win! Everybody else has to take one more turn.");
}

function make_pain() {
  //win
  var r = Math.random() * winchance;
  if (r > winchance - 1) {
    win();
    return;
  }
  //else
  var prompt = fixup(rand(actions) + " " + rand(objects) + " " + rand(times) + ".");
  
  previous.push(prompt);
  display(prompt);
}

var actions = [
  "eat",
  "hug",
  "talk about",
  "make up a story about",
  "stare at",
  "don't look at",
  "chew on",
  "hold on to (and don't let go of)",
  "sing to",
  "lick",
  "think about",
  "play with",
  "be angry at",
  "tie up",
  "wave at",
  "wait for",
  "surround",
  "feed",
  "crabwalk around",
  "persue",
  "obey",
  "toss around",
  "charge",
  "focus on",
  "change",
  "fix",
  "damage",
  "interrupt",
  "copy",
  "investigate",
  "carry",
  "clean",
  "command",
  "draw",
  "stomp on",
  "cut",
  "teach algebra to",
  "rap about",
  "make up a song about"
];
var objects = [
  "a pie",
  "a tree",
  "a player of your choice",
  "your favorite player",
  "your least favorite player",
  "candy",
  "hot water",
  "freezing water",
  "ice",
  "a tree",
  "a fruit",
  "a book",
  "deoderant",
  "a fork",
  "a spoon",
  "a knife",
  "a stuffed animal",
  "a banana",
  "a cardboard box",
  "a hot chocolate mug",
  "a shoe",
  "a plastic bag",
  "an acorn",
  "some grass",
  "your phone",
  "a building",
  "a toilet",
  "potatoes",
  "some wires"
];
var times = [
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  //repeat
  "for 10 seconds",
  "for 30 seconds",
  "for half a minute",
  "for 60 seconds",
  "for 1 minute",
  "for 5 minutes",
  "for 10 minutes",
  
  "for the rest of the game"
];