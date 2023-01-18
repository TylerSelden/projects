/*

The stock market game cuz why not

To-do:

 -Client-side graph
 -Notification array, rather than string 
 -Clients can make stock

*/

var restoredata = true;

var version = '---SMG Version 5.4.6---';

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
    savedata[client.username].message = n;
    //set the net worth
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
      for (var j in message.ps) {
        //message.net += message.ps[j] * companies[j].price;
        message.companies[j] = companies[j];
      }
      clients[i].send(JSON.stringify(message));
      savedata[clients[i].username].message = "Connected to server<br>Server maintenence is ongoing. This means that the server will be restarting frequently. If you get disconnected, please reload the page. This should not last for more than 10 minutes.<br>-T.S.";
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
    n: "Please enter your username and password.",
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
    sendmsg(client, "You sent $" + willsend + " to " + r + ".");
    sendmsg(reciever.connection, "You received $" + willsend + " from " + client.username + ".");
  },
  "query7699190109": function(client, og) {
    sendmsg(client, JSON.stringify(savedata));
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
      }
    } else {
      //decode the message
      runcommand(connection, msg);
    }
  });
  connection.on('close', function() {
    savedata[connection.username].connection = null;
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









