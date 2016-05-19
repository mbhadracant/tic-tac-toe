var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = [];

var player1 = null;
var player2 = null;

var game = null;

var gameStates = ['waiting', 'ready', 'game', 'completed'];

var currentState = 'waiting';

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
    app.use(express.static(__dirname + '/public'));
});

io.on('connection', function (socket) {

    events.onConnect(socket);

    socket.on('lock player 1', function() {
      events.onLockPlayer1(socket);
    });

    socket.on('lock player 2', function() {
      events.onLockPlayer2(socket);
    });

    socket.on('init game', function() {
      events.onInitGame();
    });

    socket.on('disconnect', function() {
      events.onDisconnect(socket);
    });



});

http.listen(3000, function () {
    console.log("listening on *: 3000");
});



var events = {

    onConnect: function (socket) {

        clients[socket.client.id] = socket;
        console.log("User connected: " + socket.client.id);

        console.log(currentState);
        switch(currentState) {
            case gameStates[0]:
                events.showWhenWaiting(socket);
                break;
            case gameStates[1]:
                events.showWhenReady(socket);
                break;
            case gameStates[2]:
                events.showInGame(socket);
                break;
        }

    },

    onLockPlayer1: function (socket) {
        if (helper.checkIfClientIsPlayer(socket.client.id)) {
            return;
        }

        player1 = socket;
        io.emit('lock button player 1');
        socket.emit('change player 1 text');
        console.log("Player 1 Ready: " + socket.client.id);

        if(helper.checkBothPlayersReady()) {
            currentState = 'ready';
            io.emit('game ready');
        }


    },

    onLockPlayer2: function (socket) {

        if (helper.checkIfClientIsPlayer(socket.client.id)) {
            return;
        }

        player2 = socket;
        io.emit('lock button player 2');
        socket.emit('change player 2 text');
        console.log("Player 2 Ready: " + socket.client.id);

        if(helper.checkBothPlayersReady()) {
            currentState = 'ready';
            io.emit('game ready');
        }

    },

    onDisconnect: function (socket) {

        if(helper.checkIfClientIsPlayer()) {
            if(player1 == socket) {
                player1 = null;
                io.emit('reset button player 1');
            } else {
                player2 = null;
                io.emit('reset button player 2');
            }
        }

        delete clients[socket.client.id];
    },

    onInitGame : function(socket) {

      game = {

          board: [
            [0,0,0],
            [0,0,0],
            [0,0,0]
          ],

          turn : Math.floor((Math.random() * 2) + 1),

          timer : 15,

      };

      currentState = 'game';
      io.emit('show game', game);



    },

    showWhenWaiting : function(socket) {
      socket.emit('show when waiting',
      { player1Button : player1 != null, player2Button : player2 != null});

    },

    showWhenReady : function(socket) {
      socket.emit('game ready');
    },

    showInGame : function(socket) {
      console.log("fasasfa");
      socket.emit('show game',game);
    },

    showCompleted : function() {

    }




};

var helper = {

    checkIfClientIsPlayer : function (id) {
       return player1 == clients[id] || player2 == clients[id] ? true : false;
    },
    checkBothPlayersReady : function() {
        return player1 != null && player2 != null;
    }




}
