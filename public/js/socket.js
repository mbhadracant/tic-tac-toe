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

socket.on('show when waiting', function (data) {

    $('#title').html("WAITING FOR TWO PLAYERS TO JOIN...");
    $('#main-menu').show();
  if(data.player1Button) {
    $('#player1-bt').html("PLAYER 1 JOINED");
    $('#player1-bt').css("background-color", "red");
    $('#player1-bt').prop('disabled', true);
  }

  if(data.player2Button) {
    $('#player2-bt').html("PLAYER 2 JOINED");
    $('#player2-bt').css("background-color", "red");
    $('#player2-bt').prop('disabled', true);
  }


});


socket.on('lock button player 1', function () {
    $('#player1-bt').html("PLAYER 1 JOINED");
    $('#player1-bt').css("background-color", "red");
    $('#player1-bt').prop('disabled', true);
});

socket.on('lock button player 2', function () {
    $('#player2-bt').html("PLAYER 2 JOINED");
    $('#player2-bt').css("background-color", "red");
    $('#player2-bt').prop('disabled', true);
});

socket.on('change player 1 text', function () {
    $('#status').html("PLAYER 1");
});

socket.on('change player 2 text', function () {
    $('#status').html("PLAYER 2");
});

socket.on('game ready', function (){
  $('#player1-bt').fadeOut();
  $('#player2-bt').fadeOut();

  var counter = 5;

  var intervalId = setInterval(function(){
    if (counter == 0) {
      clearInterval(intervalId);
      socket.emit('init game');
    }


    $('#title').html("GAME STARTING IN " + counter);
    counter--;
  },1000);


});

socket.on('show game', function (game){
    $('#title').html("PLAYER " + game.turn + " TURN");
    $('#game-board').fadeIn();
});
