var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('./utility.js');
var bodyParser = require('body-parser');
var gameFile = require('./serverGame.js');

var game = new gameFile.Game();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get("/js/main.js", function(req, res) {
  res.sendFile(__dirname + '/js/main.js');
});

app.get("/js/game.js", function(req, res) {
  res.sendFile(__dirname + '/js/game.js');
});

app.get("/css/main.css", function(req, res) {
  res.sendFile(__dirname + '/css/main.css');
});

var counter = 0;


io.on('connection', function(socket) {
  //On new connection send 'game' event with obstacles and other players
  //Add new player to the existing game
  // socket.name = counter;
  socket.emit('game', getGameState());
  socket.on('update', function(playerState) {

    // console.log(playerState);
    //When player sends an 'update' event, update his player in the game
    //Also add his bullets to the bullet array
    //also send all his information out to the other players
    socket.broadcast.emit('player', playerState)
  });
  // socket.on('disconnect', function() {
  //   //Remove the player from the game
  //   //Update all other players
  //   socket.broadcast.emit('playerLeft', socket.name)
  //
  //
  // });
});

function getGameState() {
  return {
    players: game.players,
    ents: game.ents,
    bullets: game.bullets,
    id: counter++
  }
}


http.listen(process.env.PORT || 3000, function(){
  // console.log('listening on *:3000');
});
