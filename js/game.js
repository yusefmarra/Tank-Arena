// add scripts
var socket = io();

var game;

socket.on('game', function(gameState) {
  // console.log(gameState);
  game = new Game(gameState.id);
  for (var i = 0; i < gameState.ents.length; i++) {
    game.addEnt(new Obstacle(gameState.ents[i].center, gameState.ents[i].size, game));
  }

  socket.on('playerLeft', function(id) {
    console.log(id + " what the fuck")
    game.enemies.splice(game.enemies.indexOf(id),1);
    game.removeEnt(id);
  });
  // socket.emit('update', game.getPlayerState())
});

socket.on('player', function(playerState) {
  // console.log(playerState);
  if (game.enemies.indexOf(playerState.id) === -1){
    // console.log('making new enemy');
    game.addEnt(new Enemy(playerState.center, playerState.rotation, playerState.turretRotation, playerState.id, playerState.health));
    game.enemies.push(playerState.id);
  } else {
    // console.log('updating enemy');
    game.updateEnemy(playerState);
  }
});


// ;(function (){
  //Grab the canvas element from the DOM and get a 'context object'
  var canvas = document.getElementById('canvasId');
  var ctx = canvas.getContext('2d');
  // Define the Game Object
  function Game(playerid) {

    //Set the game size to equal the canvas size.
    this.gameSize = {x: 1000, y: 500};

    // "entities" array to hold all the game objects
    this.player = new Player(this, this.gameSize, playerid);
    this.enemies = [];
    // var ob1 = new Obstacle(this.gameSize, this);
    // var ob2 = new Obstacle(this.gameSize, this);
    // var ob3 = new Obstacle(this.gameSize, this);
    this.ents = [this.player];
    this.bullets = []
    //so I can refer to the Game object in other scopes
    var self = this;
    this.sounds = [];
    // This function gets executed every 'frame'


    var tick = function() {
      self.update();
      self.draw(ctx);
      socket.emit('update', self.getPlayerState());
      //javascript thing to make sure it runs at a consistent speed across all computers
      requestAnimationFrame(tick);
    };
    // call tick the first time on instantiation
    // self.intro(self);
    tick();



  };

  Game.prototype = {
    //Call the update function on every entity
    update: function() {
      // console.log(this.ents);
      for (var i = 0; i < this.ents.length; i++) {
        this.ents[i].update();
      }
      for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].update()
      }
    },
    //Call the draw function on every entity
    draw: function() {
      ctx.clearRect(0,0,this.gameSize.x, this.gameSize.y)
      for (var i = 0; i < this.ents.length; i++) {
        this.ents[i].draw(ctx);
      }
      for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(ctx);
      }
      // // Draw the Player and AI's health on the screen
      // ctx.font = "35px Serif"
      // ctx.fillStyle = 'red';
      // ctx.fillText("AI: " + this.ai.health, this.gameSize.x-125, 30)
      // ctx.fillStyle = 'blue';
      // ctx.fillText("Player: " + this.player.health, 5, 30)
      //
      // //This tests for win conditions and draws the proper text
      // if (this.player.health <= 0) {
      //   ctx.fillStyle = "red";
      //   ctx.font = "60px Serif";
      //   ctx.fillText("YOU FUCKING LOST!", this.gameSize.x/6, this.gameSize.y/2);
      // } else if (this.ai.health <= 0) {
      //   ctx.fillStyle = "blue";
      //   ctx.font = "60px Serif";
      //   ctx.fillText("YOU FUCKING WON!", this.gameSize.x/6, this.gameSize.y/2);
      // }
    },
    getPlayerState: function() {
      return {
        center: this.player.center,
        rotation: this.player.rotation,
        turretRotation: this.player.radians,
        id: this.player.id,
        health: this.player.health,
      }
    },
    //Add an entity to the entity array
    addEnt: function(ent){
      this.ents.push(ent);
    },
    addBullet: function(bullet) {
      this.bullets.push(bullet);
    },
    updateEnemy: function(playerState) {
      for (var i = 0; i < this.ents.length; i++) {
        if (this.ents[i].id) {
          console.log(playerState.id);
          console.log(this.ents[i].id);
          if (this.ents[i].id == playerState.id) {
            this.ents[i].center = playerState.center;
            this.ents[i].rotation = playerState.rotation;
            this.ents[i].radians = playerState.turretRotation;
            console.log(this.ents[i]);
          }
        }
      }
    },
    removeEnt: function(id) {
      for (var i = 0; i < this.ents.length; i++) {
        if (this.ents[i].id == id) {
          this.ents.splice(i,1);
        }
      }
    },
  };

  // Define the Player object.
  function Player(game, gameSize, id) {
    this.gameSize = gameSize;
    //the instance of the game.
    this.game = game;
    // this.ai = this.game.ents[1];
    this.size = {x:25,y:25};
    this.center = { x: Math.random()*gameSize.x, y: Math.random()*gameSize.y}
    //Input object has a 'keys' dict and an 'isDown' function for getting pressed keys
    this.input = new Input();
    //Tracks the last time the player fired
    this.lastFired = Date.now();
    this.speed = 5;
    //rotation variable from 0 to 359 keeps track of the players orientation
    this.rotation = 0;
    //Need radians for the Math.cos and Math.sin functions
    this.radians = 0;
    this.health = 100;
    this.id = id;
  }

  Player.prototype = {
    update: function() {
      //converty the rotation to radians for forward and reverse movement
      radians = this.rotation * (Math.PI/180)
      // call the proper function based on input
      if (this.input.isDown("Up")) {
        this.forward();
      }
      if (this.input.isDown('Down')) {
        this.reverse();
      }
      if (this.input.isDown("Left")) {
        this.rotate(-5);
      }
      if (this.input.isDown("Right")) {
        this.rotate(5);
      }
      //Fire a bullet if the mouse is being pressed.
      if (this.input.isDown('mouse')) {
        // test if the player has fired too recently
        var newTime = Date.now();
        if (newTime - this.lastFired > 500) {
          var vector = {x:0,y:0};
          vector.x = (this.input.getPos()[0]-this.center.x);
          vector.y = (this.input.getPos()[1]-this.center.y);
          var center = { x: this.center.x, y: this.center.y};
          var bullet = new Bullet(vector, center);
          this.game.addBullet(bullet);
          this.lastFired = newTime;
        }

      }
      //Keep the Player on the screen
      if (this.center.x - this.size.x/2 < 0) {
        this.center.x = this.size.x/2;
      } else if (this.center.x + this.size.x/2 > this.gameSize.x) {
        this.center.x = this.gameSize.x - this.size.x/2;
      }
      if (this.center.y - this.size.x/2 < 0) {
        this.center.y = this.size.y/2;
      } else if (this.center.y + this.size.y/2 > this.gameSize.y) {
        this.center.y = this.gameSize.y - this.size.y/2;
      }

      for (var i = 0; i < this.game.ents.length; i++) {
        if (colliding(this, this.game.ents[i])) {
          this.reverse();
        }
      }

      // console.log(collidingWithBullets(this, this.game.bullets));
      // debugger;
      if (collidingWithBullets(this, this.game.bullets)) {
        this.health -= 10;
        // console.log(this.health);
      }
      if (this.health <= 0){
        // console.log(this);
        this.game.ents.splice(this.game.ents.indexOf(this),1);
      }
    },

    //These functions make the player object move like a tank
    //calculates the vector based off the rotation
    forward: function(){
      this.center.x = this.center.x + (this.speed * Math.sin(this.rotation * (Math.PI/180)))
      this.center.y = this.center.y - (this.speed * Math.cos(this.rotation * (Math.PI/180)))
    },
    reverse: function() {
      this.center.x = this.center.x - (this.speed * Math.sin(this.rotation * (Math.PI/180)))
      this.center.y = this.center.y + (this.speed * Math.cos(this.rotation * (Math.PI/180)))
    },
    rotate: function(degrees) {
      this.rotation += degrees;
      if (this.rotation > 359){
        this.rotation = 0;
      } else if (this.rotation < 0) {
        this.rotation = 359;
      }
    },

    //Draw function for putting the tank on the screen.
    draw: function(ctx){

      var pos = []
      if (this.input.getPos()) {
        pos = this.input.getPos();
      } else {
        pos = [0, this.size.y];
      }
      //Save our canvas's unrotated state
      ctx.save();
      ctx.fillStyle = 'blue';
      ctx.translate(this.center.x, this.center.y);
      // Rotate the canvas
      ctx.rotate(this.rotation*Math.PI/180);

      // Draw the 'tank'
      ctx.fillRect(0 - this.size.x/2,
                   0 - this.size.y/2,
                   this.size.x, this.size.y);
      // ctx.fillRect(0-this.size.x/2-10)

      ctx.beginPath();
      ctx.moveTo(0-this.size.x/2,0-this.size.y/2);
      ctx.lineTo(0, 0-this.size.y+5);
      ctx.lineTo(this.size.x/2, -this.size.y/2);
      ctx.fill();

      //Unrotate the canvas
      ctx.restore();


      // Draw the turret
      // use atan2 to take an difference in coordinates and get radians
      var atanArgs = {x: pos[0]-this.center.x, y: pos[1]-this.center.y};
      this.radians = Math.atan2(atanArgs.x, atanArgs.y);

      // Use Math to get x and y for the end point of the barrel length 25
      var x = 25 * Math.sin(this.radians);
      var y = 25 * Math.cos(this.radians);

      //Save the context
      ctx.save();
      //Set the barrel width
      ctx.lineWidth = 5;
      // Recenter the grid on the player
      ctx.translate(this.center.x, this.center.y);
      // ctx.rotate(radians);
      ctx.beginPath();
      ctx.moveTo(0,0);
      //Draw a line to the end point of the barrel
      ctx.lineTo(x,y);
      ctx.strokeStyle = 'black';
      ctx.stroke();
      //restore the context
      ctx.restore();
    }
  }

  function Enemy(center, rotation, turretRotation, id, health) {
    this.size = {x:25,y:25};
    this.center = { x: center.x, y: center.y}
    //rotation variable from 0 to 359 keeps track of the players orientation
    this.rotation = rotation;
    this.radians = turretRotation;
    this.id = id;
    this.health = health;
  }

  Enemy.prototype = {
    update: function() {

    },
    draw: function(ctx){
      //Save our canvas's unrotated state
      ctx.save();
      ctx.fillStyle = 'red';
      ctx.translate(this.center.x, this.center.y);
      // Rotate the canvas
      ctx.rotate(this.rotation*Math.PI/180);

      // Draw the 'tank'
      ctx.fillRect(0 - this.size.x/2,
                   0 - this.size.y/2,
                   this.size.x, this.size.y);
      // ctx.fillRect(0-this.size.x/2-10)

      ctx.beginPath();
      ctx.moveTo(0-this.size.x/2,0-this.size.y/2);
      ctx.lineTo(0, 0-this.size.y+5);
      ctx.lineTo(this.size.x/2, -this.size.y/2);
      ctx.fill();

      //Unrotate the canvas
      ctx.restore();


      // Draw the turret
      // Use Math to get x and y for the end point of the barrel length 25
      var x = 25 * Math.sin(this.radians);
      var y = 25 * Math.cos(this.radians);

      //Save the context
      ctx.save();
      //Set the barrel width
      ctx.lineWidth = 5;
      // Recenter the grid on the player
      ctx.translate(this.center.x, this.center.y);
      // ctx.rotate(radians);
      ctx.beginPath();
      ctx.moveTo(0,0);
      //Draw a line to the end point of the barrel
      ctx.lineTo(x,y);
      ctx.strokeStyle = 'black';
      ctx.stroke();
      //restore the context
      ctx.restore();
    }
  }

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

  Bullet.prototype = {
    update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
    },
    draw: function(ctx) {
      ctx.fillStyle = 'black';
      ctx.fillRect(this.center.x - this.size.x/2,
                      this.center.y - this.size.y/2,
                      this.size.x, this.size.y)
    }
  };


  function Obstacle(center, size, game){
    this.game = game;
    this.size = { x: size.x, y: size.y };
    this.color = 'grey'; //colors[(Math.random()*4).toFixed(0)];
    this.center = { x: center.x, y: center.y}
  }

  Obstacle.prototype = {
    update: function(){
      if (collidingWithBullets(this, this.game.bullets)) {
        //do Nothing, we're just making sure the bullets dont pass through
      }
    },
    draw: function(ctx) {
      ctx.fillStyle = this.color;
      // Draw the Obstacle
      ctx.fillRect(this.center.x - this.size.x/2,
                   this.center.y - this.size.y/2,
                   this.size.x, this.size.y)
    }
  }

  // Input object tracks input from the keyboard and mouse
  function Input() {
    var keyState = {};
    window.onkeydown = function(event) {
      // event.preventDefault();
      keyState[event.keyIdentifier] = true;
    };
    window.onkeyup = function(event) {
      keyState[event.keyIdentifier] = false;
    };
    window.onmousedown = function(event) {
      keyState['mouse'] = true;
    };
    window.onmouseup = function(event) {
      keyState['mouse'] = false;
    };
    window.onmousemove = function(event) {
      keyState['mousePos'] = [event.offsetX, event.offsetY];
    }
    this.isDown = function(key) {
      return keyState[key] === true;
    }
    this.getPos = function() {
      return keyState['mousePos'];

    }
  }

  var drawRect = function(ctx, ent) {
    ctx.fillRect(ent.center.x - ent.size.x/2,
                 ent.center.y - ent.size.y/2,
                 ent.size.x, ent.size.y)
  };

  var colliding = function(ent1, ent2) {
    return !(ent1 === ent2 ||
             ent1.center.x + ent1.size.x/2 < ent2.center.x - ent2.size.x/2 ||
             ent1.center.y + ent1.size.y/2 < ent2.center.y - ent2.size.y/2 ||
             ent1.center.x - ent1.size.x/2 > ent2.center.x + ent2.size.x/2 ||
             ent1.center.y - ent1.size.y/2 > ent2.center.y + ent2.size.y/2);
  }
  var collidingWithBullets = function(entity, bulletsArray) {
    for (var i = 0; i < bulletsArray.length; i++) {
      if (colliding(entity, bulletsArray[i])) {
        bulletsArray.splice(i,1);
        return true;
      }
    }
    return false;
  }
  var loadSound = function(url, callback) {
    var loaded = function() {
      callback(sound);
      sound.removeEventListener('canplaythrough', loaded)
    }
    var sound = new Audio(url);
    sound.addEventListener('canplaythrough', loaded);
    sound.load();
  }
  var loadSounds = function(urls, callback) {
    var loaded = function() {
      callback(sound);
      sound.removeEventListener('canplaythrough', loaded)
    }
    for (var i = 0; i < urls.length; i++) {
      var sound = new Audio(urls[i])
      sound.addEventListener('canplaythrough', loaded);
      sound.load();
    }
  }

  // window.onload = function() {
  //   var game = new Game();
  // };
// })();
