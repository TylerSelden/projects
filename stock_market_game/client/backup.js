var firstmsg = false;
var e = [];
var canvas, ctx;

var loaded = false;

var prevdata = {};

function c(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function cap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function leaderboard(msg) {
  var nets = Object.values(msg.leaderboard).reverse();
  var unames = Object.keys(msg.leaderboard).reverse();
  document.getElementById("leaderboard").innerHTML = '<tr><th>Place</th><th>Username</th><th>Net worth</th></tr>';
  for (var i in nets) {
    var tr = document.createElement("tr");
    var th0 = document.createElement("th");
    var th1 = document.createElement("th");
    var th2 = document.createElement("th");
    th0.innerHTML = parseInt(i) + 1;
    th1.innerHTML = unames[i];
    th2.innerHTML = "$" + c(nets[i]);
    tr.appendChild(th0);
    tr.appendChild(th1);
    tr.appendChild(th2);
    document.getElementById("leaderboard").appendChild(tr);
  }
}

function maketable(msg) {
  //refresh table to original state
  document.getElementById("com").innerHTML = "";
  var head = document.createElement("tr");
  var el = [
    document.createElement("th"),
    document.createElement("th"),
    document.createElement("th"),
    document.createElement("th")
  ]
  el[0].innerHTML = "Companies";
  el[1].innerHTML = "Your Shares";
  el[2].innerHTML = "Shares Available";
  el[3].innerHTML = "Price";
  head.appendChild(el[0]);
  head.appendChild(el[1]);
  head.appendChild(el[2]);
  head.appendChild(el[3]);
  document.getElementById("com").appendChild(head);
  //create the rest of the rows
  for (var i in msg.companies) {
    var name = i;
    var stock = msg.companies[i];
    
    var tr = document.createElement("tr");
    tr.setAttribute("name", "tr");
    var th0 = document.createElement("th");
    var th1 = document.createElement("th");
    var th2 = document.createElement("th");
    var th3 = document.createElement("th");
    th0.innerHTML = cap(name);
    th1.innerHTML = c(msg.ps[name]);
    th2.innerHTML = c(stock.shares);
    th3.innerHTML = "$" + c(stock.price);
    tr.appendChild(th0);
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    
    document.getElementById("com").appendChild(tr);
  }
}

window.onload = function() {
  socket = new WebSocket("wss://server.benti.dev:8443");
  
  socket.onmessage = function(msg) {
    //console.clear();
    msg = JSON.parse(msg.data);
    console.log(msg);
    e[2].innerHTML = msg.n;
    e[1].innerHTML = "Your balance: <strong>$" + c(msg.pm) + "</strong>";
    e[4].innerHTML = "Your net worth: <strong>$" + c(msg.net) + "</strong>";
    
    maketable(msg);
    leaderboard(msg);
  }
  
  e[0] = document.getElementById("input");
  e[1] = document.getElementById("pm");
  e[2] = document.getElementById("n");
  e[3] = document.getElementById("password");
  e[4] = document.getElementById("net");
  
  socket.onclose = function() {
    e[2].innerHTML = "<strong>Disconnected from server</strong>";
  }
  
  //check for username in cookies
  if (window.localStorage.getItem("stock_market_username") !== null) {
    socket.onopen = function() {
      e[0].value = window.localStorage.getItem("stock_market_username");
      e[3].value = window.localStorage.getItem("stock_market_password");
      send();
    }
  }
  
  e[0].addEventListener("keydown", keydown);
  e[3].addEventListener("keydown", keydown);
}

function keydown(e) {
  if (e.keyCode == 13 || e.which == 13) {
    send();
  }
}

function send() {
  if (!firstmsg) {
    firstmsg = true;
    e[0].placeholder = "Command";
    e[3].remove();
    if (socket.readyState == 1) {
      var data = {
        u: e[0].value.toLowerCase().replaceAll(" ", "_"),
        p: e[3].value.toLowerCase()
      }
      socket.send(JSON.stringify(data));
      window.localStorage.setItem("stock_market_username", e[0].value.replaceAll(" ", "_"));
      window.localStorage.setItem("stock_market_password", e[3].value);
    } else {
      e[2].value = "You aren't connected to the server";
    }
    e[0].value = "";
    return;
  }
  if (socket.readyState == 1) {
    //check for logout command
    if (e[0].value.toLowerCase().includes("logout")) {
      window.localStorage.removeItem("stock_market_username");
      window.localStorage.removeItem("stock_market_password");
      location.reload();
    } else {
      socket.send(e[0].value.toLowerCase());
    }
  } else {
    e[2].value = "You aren't connected to the server";
  }
  e[0].value = "";
}