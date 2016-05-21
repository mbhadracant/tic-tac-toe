var socket = io();

socket.on('reset button player 1', function() {
    $('#player1-bt').html("PLAYER 1 JOIN");
    $('#player1-bt').css("background-color", "#4CAF50");
    $('#player1-bt').prop('disabled', false);
});

socket.on('reset button player 2', function() {
    $('#player2-bt').html("PLAYER 2 JOIN");
    $('#player2-bt').css("background-color", "#4CAF50");
    $('#player2-bt').prop('disabled', false);
});

socket.on('show when waiting', function(data) {

    $('#title').html("WAITING FOR TWO PLAYERS TO JOIN...");
    $('#main-menu').show();
    if (data.player1Button) {
        $('#player1-bt').html("PLAYER 1 JOINED");
        $('#player1-bt').css("background-color", "red");
        $('#player1-bt').prop('disabled', true);
    }

    if (data.player2Button) {
        $('#player2-bt').html("PLAYER 2 JOINED");
        $('#player2-bt').css("background-color", "red");
        $('#player2-bt').prop('disabled', true);
    }
});


socket.on('lock button player 1', function() {
    $('#player1-bt').html("PLAYER 1 JOINED");
    $('#player1-bt').css("background-color", "red");
    $('#player1-bt').prop('disabled', true);
});

socket.on('lock button player 2', function() {
    $('#player2-bt').html("PLAYER 2 JOINED");
    $('#player2-bt').css("background-color", "red");
    $('#player2-bt').prop('disabled', true);
});

socket.on('change player 1 text', function() {
    $('#status').html("PLAYER 1");
});

socket.on('change player 2 text', function() {
    $('#status').html("PLAYER 2");
});

socket.on('game ready', function() {
    $('#main-menu').fadeOut();


});

socket.on('change title', function(data) {
    $('#title').html(data.message);
});

socket.on('apply tick', function(data) {
    if (data.turn == 2) {
        $("div[data-position-x='" + data.x + "'][data-position-y='" + data.y + "']").append($("<div class='cross'><div class='line1'></div><div class='line2'></div></div>"));


    } else {
        $("div[data-position-x='" + data.x + "'][data-position-y='" + data.y + "']").append($("<div class='circle'></div>"));
    }


});


socket.on('show game', function(game) {
    $('#title').html("PLAYER " + game.turn + " TURN");

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (game.board[i][j] != undefined) {
                if (game.board[i][j] == 1) {
                    $("div[data-position-x='" + i + "'][data-position-y='" + j + "']").append($("<div class='circle'></div>"));
                } else {
                    $("div[data-position-x='" + i + "'][data-position-y='" + j + "']").append($("<div class='cross'><div class='line1'></div><div class='line2'></div></div>"));
                }
            }
        }
    }

    $('#game-board').fadeIn();

});

socket.on('show winning positions', function(data) {
    for (i = 0; i < 3; i++) {
        if (data.player == 1) {
            $("div[data-position-x='" + data.winningPositions[i].x + "'][data-position-y='" + data.winningPositions[i].y + "']").find("div").css("border-color", "green");
        } else {
            $("div[style*='opacity:0.4']").remove();
            if ($("div[data-position-x='" + data.winningPositions[i].x + "'][data-position-y='" + data.winningPositions[i].y + "']").find("div") != undefined) {
                var cross = $("div[data-position-x='" + data.winningPositions[i].x + "'][data-position-y='" + data.winningPositions[i].y + "']").find("div")[0];
                $(cross).children().css("background", "green");
            }
        }
    }
});

socket.on('reset', function() {

    $('body').fadeOut(1500, function() {
        $('#title').html("WAITING FOR TWO PLAYERS TO JOIN...");
        $('#main-menu').show();
        $('#game-board').hide();
        $('.tick-box').empty();
        $('#player1-bt').html("PLAYER 1 JOIN");
        $('#player1-bt').css("background-color", "#4CAF50");
        $('#player1-bt').prop('disabled', false);
        $('#player2-bt').html("PLAYER 2 JOIN");
        $('#player2-bt').css("background-color", "#4CAF50");
        $('#player2-bt').prop('disabled', false);
        $('#status').html("SPECTATOR");
        $('body').fadeIn(1500);
    });

});
