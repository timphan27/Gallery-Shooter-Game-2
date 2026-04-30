class Pond extends Phaser.Scene {
    constructor() {
        super('pondScene');
    }
    preload() {
        this.load.image('player', 'assets/kenney_alien-ufo-pack/PNG/shipGreen_manned.png'); //load player
        this.load.image('bullet', 'assets/kenney_alien-ufo-pack/PNG/laserGreen3.png'); //load player bullet
        this.load.image('duck', 'assets/kenney_shooting-gallery/PNG/Objects/duck_yellow.png'); //load normal duck
        this.load.image('duckFast', 'assets/kenney_shooting-gallery/PNG/Objects/duck_brown.png');  //load fast duck
        this.load.image('bulletEnemy', 'assets/kenney_shooting-gallery/PNG/HUD/icon_bullet_gold_short.png'); //enemy bullet
        this.load.audio('duckCollisionSound', 'assets/kenney_impact-sounds/Audio/footstep_concrete_001.ogg'); //load enemy collision sound
        this.load.audio('playerCollisionSound', 'assets/kenney_impact-sounds/Audio/footstep_grass_003.ogg'); //load player collision sound
    }

    create() {

        //setup UI for score and wave number
        this.wave = 1;  //wave number 
        this.score = 0;
        this.health = 5; //player HP, restart game should it fall 0 

        this.canFire = true; //can fire by default
        this.cooldown = 500 //set cd between each bullet (ms)


        this.baseDuckSpeed = 50; //set base speed for ducks
        this.baseFastDuckSpeed = 120;


        this.uiText = this.add.text( //set up UI placeholder
            this.scale.width - 20,
            10,
            "",
            {
                fontSize: "20px",
                color: "#ffffff"

            }
        );

        this.uiText.setOrigin(1, 0); // RIGHT align

        let center = this.scale.width / 2;
        this.player = this.add.sprite(center, 620, 'player'); //create player sprite
        this.player.setScale(0.8); //scale player sprite down

        this.playerSpeed = 750; //player mov speed

        this.bulletsEnemy = []; //array to store enemy bullets 
        this.bullets = []; //array to store player bullets
        this.bulletSpeed = 500; //base bullet speed for the player
        this.bulletSpeedEnemy = 200; //base bullet speed for the duck 

        //key inputs
        this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE //for shooting 
        });

        this.ducks = []; //array to store enemy ducks
        this.ducksSpawned = 0;
        this.maxDucks = 5;

        this.time.addEvent({
            delay: 1250,
            callback: this.spawnDuck, //pass reference to spawnDuck()
            callbackScope: this,
            loop: true
        });

        this.duckHitSound = this.sound.add('duckCollisionSound'); //create duck collision sound    
        this.playerHitSound = this.sound.add('playerCollisionSound') //create player collision sound
    }

    update(time, delta) {

        let halfWidth = this.player.width / 2;
        let screenWidth = this.scale.width;

        this.player.x = Phaser.Math.Clamp(this.player.x, halfWidth, screenWidth - halfWidth); //create out of bounds for player x position 

        //key events -----------
        let dt = delta / 1000;

        if (this.keys.left.isDown) { //move left
            this.player.x = this.player.x - this.playerSpeed * dt;
        }

        if (this.keys.right.isDown) { //move right
            this.player.x = this.player.x + this.playerSpeed * dt;
        }


        if (Phaser.Input.Keyboard.JustDown(this.keys.space) && this.canFire) {
            let bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet');
            bullet.speed = this.bulletSpeed; //set bullet speed (500)
            this.bullets.push(bullet); //add bullet to array 
            this.canFire = false;

            this.time.delayedCall(this.cooldown, () => {
                this.canFire = true;
            })
        }


        //PLAYER: bullet movement, go through every bullet in the array
        for (let i = 0; i < this.bullets.length; i++) {
            let b = this.bullets[i]; //access ith element 
            b.y = b.y - b.speed * dt; //adjust y position each frame the bullet is active 
        }

        //DUCK bullet movement
        for (let i = 0; i < this.bulletsEnemy.length; i++) {
            let b = this.bulletsEnemy[i];
            b.y = b.y + b.speed * dt;  //move bullet down based on its speed assigned
        }

        //duck pathing
        for (let i = 0; i < this.ducks.length; i++) {
            let d = this.ducks[i];

            d.y += d.speedY * dt; //update y position based on speed 

            d.x = d.baseX + Math.sin(d.y * 0.02) * d.amplitude;

            if (d.y > this.scale.height - 50) { //if position of duck reaches the border of the screen, go to restart scene
                 d.destroy();
                 this.ducks.splice(i, 1);
                 this.health--;
            }
        }


        // collision detection: check every bullet against every duck 
        for (let i = 0; i < this.bullets.length; i++) { //iterate through bullets
            let bullet = this.bullets[i];
            for (let j = 0; j < this.ducks.length; j++) { //iterate through each duck
                let duck = this.ducks[j];

                if (this.collides(bullet, duck)) { //if they collide at any point, remove duck and that specific bullet

                    // remove duck visually
                    duck.destroy();

                    // remove from array
                    this.ducks.splice(j, 1);
                    j--;

                    // remove bullet
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    i--;

                    // score increase
                    this.score += 10;

                    this.duckHitSound.play(); //play sound when duck collides with bullet

                    break; //stop checking ducks for this bullet
                }
            }
        }

        //check every enemy bullet against the player 
        for (let i = 0; i < this.bulletsEnemy.length; i++) {
            let b = this.bulletsEnemy[i];
            if (this.collides(b, this.player)) {
                b.destroy();
                this.bulletsEnemy.splice(i, 1);//remove from array and decrement index
                i--;
                //this.playerHitSound.play();
                this.health--; //subtract 1 health
                this.playerHitSound.play();
            }


        }

        //check if the max number of ducks has spawned AND all ducks are dead
        if (this.ducksSpawned >= this.maxDucks && this.ducks.length === 0) { 
            this.updateWave(); //if so, move on to next wave 
        }

        //update score, wave number and health
        this.uiText.setText(
            "Score: " + this.score + "\n" + "Wave: " + this.wave + "\nHealth: " + this.health
        );


        //if health is 0 or less, restart game
        if (this.health <= 0) { 
                      this.scene.start('restartScene');
                }

    }

    spawnDuck() {
        if (this.ducksSpawned >= this.maxDucks) { //check if the max number of ducks has been spawned for the current wave 
            return;
        }

        let x = Phaser.Math.Between(50, this.scale.width - 50); //generate a random x position between 50 and horizontal edges

        let isFast = Phaser.Math.Between(0, 100) < 20; //gives a 30% spawn rate for fast ducks

        let type;

        if (isFast) { //check if the duck should be normal or the fast variant 
            type = 'duckFast';
        } else {
            type = 'duck';
        }

        let duck = this.add.sprite(x, 50, type); //add sprite using the x value generated earlier 
        duck.baseX = x; //record the base x value as we will overwrite duck.x in the pathing

        duck.amplitude = 70; //will move the duck 60 pixels left/right 

        if (isFast) {  //determine speed based on type
            duck.speedY = this.baseFastDuckSpeed
        } else {
            duck.speedY = this.baseDuckSpeed
        }

        duck.shootTimer = this.time.addEvent({ //give each duck its own timer for bullet firing
            delay: 3500, //set time between each bullet cast
            callback: () => {
                let bullet = this.add.sprite(duck.x, duck.y + 20, 'bulletEnemy'); //create bullet 
                bullet.setFlipY(true);
                bullet.speed = 200;
                this.bulletsEnemy.push(bullet);
            },
            loop: true
        });

        this.ducks.push(duck);
        this.ducksSpawned++;
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }


    updateWave() { //called in update() when all remaining ducks are dead AND the maximum amount of ducks has spawned 
        this.wave++;

        this.maxDucks += 2; //add more ducks 

        this.baseDuckSpeed += 25; //increment duck base speeds 
        this.baseFastDuckSpeed += 25;

        this.ducksSpawned = 0; // reset spawn counter for next wave
    }
}