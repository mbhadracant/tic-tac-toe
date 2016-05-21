var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = [];

var player1 = null;
var player2 = null;

var game = null;

var currentState = 'waiting';

var winningPositions = null;
var intervalId = null;
var timer = 5;

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
    app.use(express.static(__dirname + '/public'));
});

io.on('connection', function(socket) {
    console.log(socket.client.id);
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

    socket.on('register tick', function(data) {
        events.onRegisterTick(socket, data);
    });


});

http.listen(3000, function() {
    console.log("listening on *: 3000");
});



var events = {

    onConnect: function(socket) {

        clients[socket.client.id] = socket;

        switch (currentState) {
            case 'waiting':
                events.showWhenWaiting(socket);
                break;
            case 'ready':
                events.showWhenReady(socket);
                break;
            case 'game':
                events.showInGame(socket);
                break;
            case 'completed':
                events.showCompleted(socket);
        }

    },

    onLockPlayer1: function(socket) {


        if (helper.checkIfClientIsPlayer(socket.client.id)) {
            return;
        }

        player1 = socket;
        io.emit('lock button player 1');
        socket.emit('change player 1 text');

        if (helper.checkBothPlayersReady()) {
            this.onGameReady(socket);
        }
    },

    onLockPlayer2: function(socket) {

        if (helper.checkIfClientIsPlayer(socket.client.id)) {
            return;
        }

        player2 = socket;
        io.emit('lock button player 2');
        socket.emit('change player 2 text');

        if (helper.checkBothPlayersReady()) {
            this.onGameReady(socket);
        }

    },

    onDisconnect: function(socket) {

        if (helper.checkIfClientIsPlayer(socket.client.id)) {

            if(currentState == 'waiting') {
                if(player1 == socket) {
                  player1 = null;
                  io.emit('reset button player 1');
                } else {
                  player2 = null;
                  io.emit('reset button player 2');
                }
            } else {
              clearInterval(intervalId);
              player1 = null;
              player2 = null;
              currentState = 'waiting';
              io.emit('reset');
            }
        }

        delete clients[socket.client.id];
    },

    onGameReady: function(socket) {
        currentState = 'ready';
        io.emit('game ready');
        timer = 5;
         intervalId = setInterval(function() {
            if (timer == 0) {
                clearInterval(intervalId);
                helper.createGame();
                currentState = 'game';
                io.emit('show game', game);
                return;
            }

            io.emit('change title', {
                message: "GAME STARTING IN " + timer + "..."
            });

            timer--;
        }, 1000);
    },

    onRegisterTick: function(socket, data) {
        if ((game.turn == 1 && player1 == socket) || (game.turn == 2 && player2 == socket)) {
            if (game.board[data.x][data.y] != undefined) return;

            io.emit('apply tick', {
                x: data.x,
                y: data.y,
                turn: game.turn
            });
            game.turnCounter++;
            game.board[data.x][data.y] = game.turn;
            game.turn = (game.turn == 1) ? 2 : 1;
            if (helper.checkPlayerWin()) {

                player1 = null;
                player2 = null;
                currentState = 'completed';
                var playerWon = game.turn == 1 ? 2 : 1;
                io.emit('show winning positions', {
                    winningPositions: winningPositions,
                    player: playerWon
                });
                timer = 5;

                intervalId = setInterval(function() {
                    if (timer == 0) {
                        clearInterval(intervalId);
                        io.emit('reset');
                        currentState = 'waiting';
                        return;
                    }

                    io.emit('change title', {
                        message: "PLAYER " + playerWon + " HAS WON! NEW GAME WILL BEGIN IN " + timer + "..."
                    });

                    timer--;
                }, 1000);
            } else {
                if (game.turnCounter == 9) {
                    player1 = null;
                    player2 = null;
                    currentState = 'completed';
                    timer = 5;
                     intervalId = setInterval(function() {
                        if (timer == 0) {
                            clearInterval(intervalId);
                            io.emit('reset');
                            currentState = 'waiting';
                            return;
                        }

                        io.emit('change title', {
                            message: "DRAW! NEW GAME WILL BEGIN IN " + timer + "..."
                        });

                        timer--;
                    }, 1000);
                } else {
                    io.emit('change title', {
                        message: "PLAYER " + game.turn + "'S TURN"
                    });
                }

            }


        }

    },



    showWhenWaiting: function(socket) {
        socket.emit('show when waiting', {
            player1Button: player1 != null,
            player2Button: player2 != null
        });
    },

    showWhenReady: function(socket) {
        socket.emit('game ready');
        socket.emit('display counter', timer);
    },

    showInGame: function(socket) {
        socket.emit('show game', game);
    },

    showCompleted: function(socket) {
        var playerWon = game.turn == 1 ? 2 : 1;
        socket.emit('show game', game);
        socket.emit('show winning positions', {
            winningPositions: winningPositions,
            player: playerWon
        });
        socket.emit('change title', {
            message: "PLAYER " + playerWon + " HAS WON! NEW GAME WILL BEGIN IN " + timer + "..."
        });
    }
};

var helper = {

    checkIfClientIsPlayer: function(id) {
        return player1 == clients[id] || player2 == clients[id] ? true : false;
    },
    checkBothPlayersReady: function() {
        return player1 != null && player2 != null;
    },

    createGame: function() {
        game = {

            board: [
                [, , ],
                [, , ],
                [, , ]
            ],

            turn: Math.floor((Math.random() * 2) + 1),

            turnCounter: 0

        };
    },

    checkPlayerWin: function() {

        if (game.board[0][0] === game.board[0][1] && game.board[0][2] === game.board[0][0] && game.board[0][1] === game.board[0][2] && game.board[0][0] != undefined) {
            winningPositions = [{
                x: 0,
                y: 0
            }, {
                x: 0,
                y: 1
            }, {
                x: 0,
                y: 2
            }];
            return true;
        } else if (game.board[1][0] === game.board[1][1] && game.board[1][0] === game.board[1][2] && game.board[1][2] === game.board[1][1] && game.board[1][0] != undefined) {
            winningPositions = [{
                x: 1,
                y: 0
            }, {
                x: 1,
                y: 1
            }, {
                x: 1,
                y: 2
            }];
            return true;
        } else if (game.board[2][0] === game.board[2][1] && game.board[2][0] === game.board[2][2] && game.board[2][2] === game.board[2][1] && game.board[2][0] != undefined) {
            winningPositions = [{
                x: 2,
                y: 0
            }, {
                x: 2,
                y: 1
            }, {
                x: 2,
                y: 2
            }];
            return true;
        } else if (game.board[0][0] === game.board[1][0] && game.board[0][0] === game.board[2][0] && game.board[2][0] === game.board[1][0] && game.board[0][0] != undefined) {
            winningPositions = [{
                x: 0,
                y: 0
            }, {
                x: 1,
                y: 0
            }, {
                x: 2,
                y: 0
            }];
            return true;
        } else if (game.board[0][1] == game.board[1][1] && game.board[0][1] == game.board[2][1] && game.board[2][1] == game.board[1][1] && game.board[0][1] != undefined) {
            winningPositions = [{
                x: 0,
                y: 1
            }, {
                x: 1,
                y: 1
            }, {
                x: 2,
                y: 1
            }];
            return true;
        } else if (game.board[0][2] == game.board[1][2] && game.board[0][2] == game.board[2][2] && game.board[2][2] == game.board[1][2] && game.board[0][2] != undefined) {
            winningPositions = [{
                x: 0,
                y: 2
            }, {
                x: 1,
                y: 2
            }, {
                x: 2,
                y: 2
            }];
            return true;
        } else if (game.board[0][0] == game.board[1][1] && game.board[0][0] == game.board[2][2] && game.board[2][2] == game.board[1][1] && game.board[0][0] != undefined) {
            winningPositions = [{
                x: 0,
                y: 0
            }, {
                x: 1,
                y: 1
            }, {
                x: 2,
                y: 2
            }];
            return true;
        } else if (game.board[0][2] == game.board[1][1] && game.board[0][2] == game.board[2][0] && game.board[2][0] == game.board[1][1] && game.board[0][2] != undefined) {
            winningPositions = [{
                x: 0,
                y: 2
            }, {
                x: 1,
                y: 1
            }, {
                x: 2,
                y: 0
            }];
            return true;
        } else {
            return false;
        }
    }
};
