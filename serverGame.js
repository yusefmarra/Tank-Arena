// add scripts

function Game() {

  //Set the game size to equal the canvas size.
  this.gameSize = {x: 1000, y: 500};

  // "entities" array to hold all the game objects
  this.players = [];
  var ob1 = new Obstacle(this.gameSize);
  var ob2 = new Obstacle(this.gameSize);
  var ob3 = new Obstacle(this.gameSize);
  this.ents = [ob1, ob2, ob3];
  this.bullets = [];
  //so I can refer to the Game object in other scopes
  var self = this;
}


Game.prototype = {
  addPlayer: function(player) {
    this.players.push(player);
  },
  //Add an entity to the entity array
  addEnt: function(ent){
    this.ents.push(ent);
  },
  addBullet: function(bullet) {
    this.bullets.push(bullet);
  },
}

// Define the Player object.
function Player(center, gameSize, id) {
  this.size = {x:25,y:25};
  this.center = {x: center.x, y: center.y};
  //Tracks the last time the player fired
  this.rotation = 0;
  this.radians = 0;
  //this will be in radians
  this.barrelRotation;
  this.health = 100;
  this.id = id;
}

Player.prototype = {
  update: function() {
    //update the player's position and check if he's colliding
  }
};


function Bullet(vector, center) {
  // var vector = vector;
  this.speed = 20;
  this.center = center;
  this.size = {x:4,y:4};
  var dx = vector.x
  var dy = vector.y
  var distance = Math.sqrt(dx*dx + dy*dy);

  this.velocity = { x: (dx/distance)*this.speed,
                    y: (dy/distance)*this.speed }

  this.center = { x: this.center.x+this.velocity.x,
                  y: this.center.y+this.velocity.y}
};

// Bullet.prototype = {
//   update: function() {
//     this.center.x += this.velocity.x;
//     this.center.y += this.velocity.y;
//   }
// };

function Obstacle(gameSize, game){
  var rand = Math.random()*gameSize.x/10 + 25
  this.size = { x: rand, y: rand };
  this.color = 'grey'; //colors[(Math.random()*4).toFixed(0)];
  this.center = { x: Math.random()*gameSize.x, y: Math.random()*gameSize.y}
}

// Obstacle.prototype = {
//   update: function(){
//     if (collidingWithBullets(this, this.game.bullets)) {
//       //do Nothing, we're just making sure the bullets dont pass through
//     }
//   }
// };



// var colliding = function(ent1, ent2) {
//   return !(ent1 === ent2 ||
//            ent1.center.x + ent1.size.x/2 < ent2.center.x - ent2.size.x/2 ||
//            ent1.center.y + ent1.size.y/2 < ent2.center.y - ent2.size.y/2 ||
//            ent1.center.x - ent1.size.x/2 > ent2.center.x + ent2.size.x/2 ||
//            ent1.center.y - ent1.size.y/2 > ent2.center.y + ent2.size.y/2);
// }
// var collidingWithBullets = function(entity, bulletsArray) {
//   for (var i = 0; i < bulletsArray.length; i++) {
//     if (colliding(entity, bulletsArray[i])) {
//       bulletsArray.splice(i,1);
//       return true;
//     }
//   }
//   return false;
// }

module.exports = {
  Game: Game,
  Player: Player,
  Bullet: Bullet,
  Obstacle: Obstacle
}
