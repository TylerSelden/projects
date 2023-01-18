/*

The stock market game cuz why not

To-do:

 -Client-side graph
 -Notification array, rather than string 
 -Clients can make stock

*/

var restoredata = false;
var accountcreate = true;
var version = '---SMG Version 5.4.6---';

var schedule = require('node-schedule');
var https = require('https');
var fs = require('fs');
var websocketModule = require('websocket').server;
var fs = require('fs');

var options = {
  key: fs.readFileSync('../ssl/key.pem'),
  cert: fs.readFileSync('../ssl/cert.pem')
}

var port = 8443;
var httpServ = https.createServer(options);
httpServ.listen(port);
var server = new websocketModule({httpServer: httpServ});

function remove(array, item) {
  var index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var savedata = {};

var clients = [];

var companies = {
  "goople": {
    shares: 1000,
    rand: 50,
    min: 50,
    max: 1000,
    price: rand(50, 1000)
  },
  "orange": {
    shares: 1250,
    rand: 150,
    min: 100,
    max: 2500,
    price: rand(100, 2500)
  },
  "bigmoon": {
    shares: 2500,
    rand: 25,
    min: 25,
    max: 10000,
    price: rand(25, 10000)
  },
  "pepzi": {
    shares: 1575,
    rand: 150,
    min: 25,
    max: 500,
    price: rand(25, 500)
  },
  "walnart": {
    shares: 750,
    rand: 50,
    min: 50,
    max: 1000,
    price: rand(50, 1000)
  },
  "walgreenz": {
    shares: 1500,
    rand: 75,
    min: 50,
    max: 1000,
    price: rand(50, 1000)
  },
  "microhard": {
    shares: 750,
    rand: 100,
    min: 150,
    max: 10000,
    price: rand(150, 10000)
  },
  "tezla": {
    shares: 2500,
    rand: 50,
    min: 25,
    max: 500,
    price: rand(25, 500)
  },
  "instagramma": {
    shares: 1500,
    rand: 100,
    min: 250,
    max: 2500,
    price: rand(250, 2500)
  },
  "bookface": {
    shares: 1500,
    rand: 100,
    min: 250,
    max: 2500,
    price: rand(250, 2500)
  },
  "samsang": {
    shares: 2500,
    rand: 100,
    min: 250,
    max: 2500,
    price: rand(250, 2500)
  },
  "amazoon": {
    shares: 2500,
    rand: 500,
    min: 500,
    max: 10000,
    price: rand(500, 10000)
  },
  "diznee": {
    shares: 1500,
    rand: 1000,
    min: 1000,
    max: 1000000,
    price: rand(1000, 1000000)
  },
  "dinosaur_incorperated": {
    shares: 1,
    rand: 0,
    min: 9999999999,
    max: 9999999999,
    price: 9999999999
  }
}

if (restoredata) restore();

//remove connection key/value from savedata for backups
function rmcon() {
  var newdata = {};
  for (var i in savedata) {
    newdata[i] = {};
    for (var j in savedata[i]) {
      if (j !== "connection") {
        newdata[i][j] = savedata[i][j];
      }
    }
  }
  return newdata;
}

function backup() {
  var data = [];
  data[0] = rmcon();
  data[1] = companies;
  fs.writeFileSync('backup.json', JSON.stringify(data));
}

function restore() {
  var data = JSON.parse(fs.readFileSync('backup.json'));
  
  savedata = data[0];
  companies = data[1];
  
  for (var i in savedata) {
    savedata[i].connection = null;
    backup();
  }
}

function sendmsg(client, n) {
  if (client !== undefined) {
    if (client.username !== null) {
      if (savedata[client.username] !== undefined) {
        savedata[client.username].message = n;
      }
    }
  }
  for (var i in clients) {
    if (clients[i].username !== null) {
      savedata[clients[i].username].net = savedata[clients[i].username].money;
      for (var j in savedata[clients[i].username].shares) {
        savedata[clients[i].username].net += savedata[clients[i].username].shares[j] * companies[j].price;
      }
    }
  }
  var data = {};
  for (var i in savedata) {
    if (savedata[i].net == undefined) {
      data[i] = 0;
    } else {
      data[i] = savedata[i].net;
    }
  }
  var leaderboard = Object.entries(data)
    .sort(([,a],[,b]) => a-b)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  //determine who's online
  var online = {};
  for (var i in leaderboard) {
    if (savedata[i].connection !== null) {
      online[i] = true;
    } else {
      online[i] = false;
    }
  }
  
  for (var i in clients) {
    if (clients[i].username !== null) {
      var message = {
        pm: savedata[clients[i].username].money,
        ps: savedata[clients[i].username].shares,
        companies: {},
        n: savedata[clients[i].username].message,
        net: savedata[clients[i].username].net,
        leaderboard: leaderboard,
        online: online
      }
      for (var j in companies) {
        if (message.ps[j] == undefined || message.ps[j] == null) {
          message.ps[j] = 0;
        }
        message.companies[j] = companies[j];
      }
      clients[i].send(JSON.stringify(message));
      savedata[clients[i].username].message = "Connected to server";
    }
  }
  backup();
}

function init() {
  var msg = {
    pm: 0,
    ps: 0,
    name: [],
    money: [],
    shares: [],
    n: "New account creation has been restricted. If you'd like to join the game, please talk to the person who made this game (you should know who that is).",
    net: 0,
    leaderboard: []
  }
  return msg;
}

var commands = {
  "buy": function(client, og) {
    var data = savedata[client.username];
    var number = parseInt(og.split(" ")[1]);
    var name = og.split(" ")[2];
    var stock = companies[name];
    var willbuy = null;
    
    if (typeof(number) !== 'number' || stock == undefined || isNaN(number)) {
      sendmsg(client, "That command could not be understood.");
      return;
    }
    //check if user is trying to buy -XX
    if (number < 1) {
      sendmsg(client, "You can't buy " + number + " share(s).");
      return;
    }
    //check if price is too high
    var price = number * stock.price;
    if (price > data.money) {
      //price is too high, buy all the user can
      willbuy = data.money / stock.price;
    } else {
      willbuy = number;
    }
    //check if there are enough available stocks
    if (willbuy > stock.shares) { 
      willbuy = stock.shares;
    }
    willbuy = Math.floor(willbuy);
    savedata[client.username].shares[name] += willbuy;
    savedata[client.username].money -= willbuy * stock.price;
    stock.shares -= willbuy;
    if (willbuy == 1) {
      sendmsg(client, "You bought " + willbuy + " share from " + name + ".");
    } else {
      sendmsg(client, "You bought " + willbuy + " shares from " + name + ".");
    }
  },
  "sell": function(client, og) {
    var data = savedata[client.username];
    var number = parseInt(og.split(" ")[1]);
    var name = og.split(" ")[2];
    var stock = companies[name]
    var willsell = null;
    
    if (typeof(number) !== 'number' || stock == undefined || isNaN(number)) {
      sendmsg(client, "That command could not be understood.");
      return;
    }
    //check if user is trying to sell -XX
    if (number < 1) {
      sendmsg(client, "You can't sell " + number + " share(s).");
      return;
    }
    //check if there are enough available stocks
    if (number > savedata[client.username].shares[name]) {
      willsell = savedata[client.username].shares[name];
      if (willsell < 1) {
        sendmsg(client, "You don't have any shares to sell.");
        return;
      }
    } else {
      willsell = number;
    }
    willsell = Math.floor(willsell);
    //give client money and put their shares in the global trade pool
    savedata[client.username].shares[name] -= willsell;
    savedata[client.username].money += willsell * stock.price;
    stock.shares += willsell;
    if (willsell == 1) {
      sendmsg(client, "You sold " + willsell + " share to " + name + ".");
    } else {
      sendmsg(client, "You sold " + willsell + " shares to " + name + ".");
    }
  },
  "send": function(client, og) {
    var number = parseInt(og.split(" ")[1]);
    var r = og.split(" ")[2];
    var sender = savedata[client.username];
    var reciever = savedata[r];
    var willsend = number;
    
    //check if variables are as they should be
    if (typeof(number) !== 'number' || isNaN(number)) {
      sendmsg(client, "That command could not be understood.");
      return;
    }
    //check if user is sending to themselves
    if (client.username == r) {
      sendmsg(client, "You can't send money to yourself.");
      return;
    }
    //check if user exists
    if (reciever == undefined) {
      sendmsg(client, "That user doesn't exist.");
      return;
    }
    //check if sending -XX
    if (number < 1) {
      sendmsg(client, "You can't gift " + number + " to another player.");
      return;
    }
    //check if sender has enough money
    if (sender.money < number) {
      willsend = sender.money;
    }
    savedata[client.username].money -= willsend;
    savedata[r].money += willsend;
    
    savedata[client.username].message = "You sent $" + willsend + " to " + r + ".";
    sendmsg(reciever, "You received $" + willsend + " from " + client.username + ".");
  },
  "steal": function(client, og) {
    sendmsg(client, "The steal command has been removed.");
    return;
    
    var price = parseInt(og.split(" ")[1]);
    var tosteal = parseInt(og.split(" ")[2]);
    var user = og.split(" ")[3]
    
    if (isNaN(price) || isNaN(tosteal)) {
      sendmsg(client, "Make sure you're putting in numbers.");
      return;
    }
    if (savedata[user] == undefined) {
      sendmsg(client, "That user does not exist.");
      return;
    }
    if (client.username == user) {
      sendmsg(client, "You can't steal from yourself!");
      return;
    }
    if (tosteal > savedata[user].money) {
      tosteal = savedata[user].money;
    }
    if (price > tosteal) {
      price = tosteal;
    }
    if (savedata[client.username].money < price) {
      sendmsg(client, "You don't have enough money!");
      return;
    }
    if (savedata[user].money < tosteal) {
      sendmsg(client, "The user doesn't have that much money!");
      return;
    }
    savedata[client.username].money -= price;
    
    var outof = tosteal * 2;
    var r = rand(0, outof);
    
    if (r <= price) {
      savedata[user].money -= tosteal;
      savedata[user].message = client.username + " stole " + tosteal + " from you!";
      savedata[client.username].money += tosteal;
      sendmsg(client, "You stole $" + tosteal + " from " + user + ".");
    } else {
      savedata[user].message = "A user attempted to steal from you.";
      sendmsg(client, "You failed to steal $" + tosteal + " from " + user + ".");
    }
  }
}

function runcommand(client, input) {
  var split = input.split(" ");
  if (commands[split[0]] !== undefined) {
    commands[split[0]](client, input);
  } else {
    sendmsg(client, "That command couldn't be found.");
  }
}

server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.username = null;
  clients.push(connection);
  var initmsg = init();
  connection.send(JSON.stringify(initmsg));
  initmsg.n = "Please wait...";
  connection.on('message', function(msg) {
    msg = msg.utf8Data;
    if (connection.username == null) {
      msg = JSON.parse(msg);
      var uname = msg.u;
      var pword = msg.p;
      connection.username = uname;
      //check if username already exists
      var exists = false; 
      for (var i in savedata) {
        if (savedata[uname] !== undefined) {
          exists = true;
          //username already exists, verify pwd
          if (savedata[uname].pwd == msg.p) {
            connection.send(JSON.stringify(initmsg));
            savedata[connection.username].connection = connection;
            sendmsg(connection, 'Logged in to ' + uname + '.');
          } else {
            initmsg.n = 'Your username or password is incorrect. Reload to try again.';
            connection.send(JSON.stringify(initmsg));
            connection.close();
          }
          break;
        }
      }
      if (!exists) {
        if (accountcreate) {
        //create new save data
        var data = {
          shares: {},
          money: 1000,
          message: null,
          pwd: pword,
          connection: connection
        }
        for (var i in companies) {
          data.shares[i] = 0;
        }
        savedata[uname] = data;
        connection.send(JSON.stringify(initmsg));
        sendmsg(connection, 'New account created under the username ' + uname + '.');
        } else {
          connection.close();
        }
      }
    } else {
      //decode the message
      runcommand(connection, msg);
    }
  });
  connection.on('close', function() {
    if (savedata[connection.username] !== undefined) {
      savedata[connection.username].connection = null;
    }
    remove(clients, connection);
    sendmsg();
  });
});

console.log('WebSocket server successfully started on port ' + port + '.');




//////////////////////////////////////////////////////////////////////////////////////////////////



function loop() {
  for (var i in companies) {
    var stock = companies[i];
    var r = rand(-stock.rand, stock.rand);
    stock.price += r;
    if (stock.price < stock.min) {
      stock.price = stock.min;
    }
    if (stock.price > stock.max) {
      stock.price = stock.max;
    }
  }
  sendmsg()
  setTimeout(() => {
    loop();
  }, 60000);
}


loop();









