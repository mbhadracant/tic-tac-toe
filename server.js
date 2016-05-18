var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = [];

var player1Id = null;
var player2Id = null;


app.get("/", function(req, res){
  res.sendFile(__dirname + '/views/index.html');
  app.use(express.static(__dirname + '/public'));

});

io.on('connection', function(socket) {

    clients.push(socket);
    console.log("User connected: " + socket.id);

    socket.on('lock player 1', function(id){
      player1Id = id;
      io.emit('lock button player 1');
      console.log("Player 1 Ready: " + socket.id);
    });

    socket.on('lock player 2', function(id){
      player2Id = id;
      io.emit('lock button player 2');
      console.log("Player 2 Ready: " + socket.id);
    });

  socket.on('disconnect', function(){
      var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
        }
  });

});

function getClient(id) {
    for(i = 0; i < clients.length;i++) {
        if(clients[i].id.substring(2,clients[i].id.length) == id) {
            return clients[i];
        }
    }
}


http.listen(3000, function(){
  console.log("listening on *: 3000");
});
