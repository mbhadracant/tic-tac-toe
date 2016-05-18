var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = [];

var player1 = null;
var player2 = null;

var gameStates = ['waiting', 'ready', 'game', 'completed']

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
    app.use(express.static(__dirname + '/public'));
});

io.on('connection', function (socket) {

    events.onConnect(socket);

    socket.on('lock player 1', function () {
        events.onLockPlayer1(socket);
    });

    socket.on('lock player 2', function () {
        events.onLockPlayer2(socket);
    });

    socket.on('disconnect', function () {
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

    },

    onLockPlayer1: function (socket) {

        if (helper.checkBothPlayersAreSame(socket.client.id)) {
            return;
        }

        player1 = socket;
        io.emit('lock button player 1');
        socket.emit('change player 1 text');
        console.log("Player 1 Ready: " + socket.client.id);

    },

    onLockPlayer2: function (socket) {

        if (helper.checkBothPlayersAreSame(socket.client.id)) {
            return;
        }

        player2 = socket;
        io.emit('lock button player 2');
        socket.emit('change player 2 text');
        console.log("Player 2 Ready: " + socket.client.id);

    },

    onDisconnect: function (socket) {
        delete clients[socket.client.id];
    }

};

var helper = {
    
    checkBothPlayersAreSame: function (id) {
       return player1 == clients[id] || player2 == clients[id] ? true : false;
    }

}