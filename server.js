var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = [];

var player1 = null;
var player2 = null;


app.get("/", function(req, res){
  res.sendFile(__dirname + '/views/index.html');
  app.use(express.static(__dirname + '/public'));

});

io.on('connection', function(socket) {
    
    clients[socket.client.id];
    console.log("User connected: " + socket.client.id);

    socket.on('lock player 1', function(id){
      player1 = socket;
      io.emit('lock button player 1');
        socket.emit('change player 1 text');
      console.log("Player 1 Ready: " + socket.client.id);
    });

    socket.on('lock player 2', function(id){
      player2 = socket;
      io.emit('lock button player 2');
      socket.emit('change player 2 text');
      console.log("Player 2 Ready: " + socket.client.id);
    });

  socket.on('disconnect', function(){
      delete clients[socket.client.id];
  });

});

http.listen(3000, function(){
  console.log("listening on *: 3000");
});
