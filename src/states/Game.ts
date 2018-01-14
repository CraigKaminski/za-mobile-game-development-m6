import { Platform } from '../prefabs/Platform';

export class Game extends Phaser.State {
  private background: Phaser.TileSprite;
  private coinsCountLabel: Phaser.Text;
  private coinSound: Phaser.Sound;
  private coinsPool: Phaser.Group;
  private currentPlatform: Platform;
  private cursor: Phaser.CursorKeys;
  private floorPool: Phaser.Group;
  private highScore: number;
  private isJumping: boolean;
  private jumpPeaked: boolean;
  private readonly maxJumpDistance = 120;
  private myCoins: number;
  private overlay: Phaser.BitmapData;
  private panel: Phaser.Sprite;
  private player: Phaser.Sprite;
  private platformPool: Phaser.Group;
  private startJumpY: number;
  private levelSpeed = 200;
  private water: Phaser.TileSprite;

  public init() {
    this.floorPool = this.add.group();
    this.platformPool = this.add.group();
    this.coinsPool = this.add.group();
    this.coinsPool.enableBody = true;
    this.myCoins = 0;

    this.physics.arcade.gravity.y = 1000;

    this.cursor = this.input.keyboard.createCursorKeys();
  }

  public create() {
    this.background = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
    this.background.tileScale.y = 2;
    this.background.autoScroll(-this.levelSpeed / 6, 0);
    this.world.sendToBack(this.background);

    this.player = this.add.sprite(50, 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', [0, 1, 2, 3, 2, 1], 15, true);
    this.physics.arcade.enable(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(38, 60, 7, 4);
    this.player.play('running');

    this.currentPlatform = new Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed, this.coinsPool);
    this.platformPool.add(this.currentPlatform);

    this.coinSound = this.add.audio('coin');

    this.water = this.add.tileSprite(0, this.world.height - 30, this.world.width, 30, 'water');
    this.water.autoScroll(-this.levelSpeed / 2, 0);

    const style = { font: '30px Arial', fill: '#fff' };
    this.coinsCountLabel = this.add.text(10, 20, '0', style);
  }

  public update() {
    if (!this.player.alive) {
      return;
    }

    this.platformPool.forEachAlive((platform: Phaser.Group, index: number) => {
      this.physics.arcade.collide(this.player, platform);

      if (platform.length &&
          (platform.children[platform.length - 1] as Phaser.Sprite).right < 0) {
        platform.kill();
      }
    }, this);

    this.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, undefined, this);

    if ((this.player.body as Phaser.Physics.Arcade.Body).touching.down) {
      (this.player.body as Phaser.Physics.Arcade.Body).velocity.x = this.levelSpeed;
    } else {
      (this.player.body as Phaser.Physics.Arcade.Body).velocity.x = 0;
    }

    if (this.cursor.up.isDown || this.input.activePointer.isDown) {
      this.playerJump();
    } else if (this.cursor.up.isUp || this.input.activePointer.isUp) {
      this.isJumping = false;
    }

    if (this.currentPlatform.length &&
      (this.currentPlatform.children[this.currentPlatform.length - 1] as Phaser.Sprite).right < this.world.width) {
      this.createPlatform();
    }

    this.coinsPool.forEach((coin: Phaser.Sprite) => {
      if (coin.right <= 0) {
        coin.kill();
      }
    }, this);

    if (this.player.top >= this.world.height || this.player.left <= 0) {
      this.gameOver();
    }
  }

  public render() {
    // this.game.debug.body(this.player);
    // this.game.debug.bodyInfo(this.player, 0, 30);
  }

  private collectCoin(player: Phaser.Sprite, coin: Phaser.Sprite) {
    coin.kill();
    this.myCoins++;
    this.coinSound.play();
    this.coinsCountLabel.text = this.myCoins.toString();
  }

  private createPlatform() {
    const nextPlatformData = this.generateRandomPlatform();

    if (nextPlatformData) {
      this.currentPlatform = this.platformPool.getFirstDead();

      if (!this.currentPlatform) {
        this.currentPlatform = new Platform(this.game,
          this.floorPool,
          nextPlatformData.numTiles,
          this.world.width + nextPlatformData.seperation,
          nextPlatformData.y,
          -this.levelSpeed,
          this.coinsPool);

        this.platformPool.add(this.currentPlatform);
      } else {
        this.currentPlatform.prepare(nextPlatformData.numTiles,
                                     this.world.width + nextPlatformData.seperation,
                                     nextPlatformData.y,
                                     -this.levelSpeed);
      }
    }
  }

  private gameOver() {
    this.player.kill();
    this.updateHighScore();

    this.overlay = this.add.bitmapData(this.game.width, this.game.height);
    this.overlay.ctx.fillStyle = '#000';
    this.overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);

    this.panel = this.add.sprite(0, 0, this.overlay);
    this.panel.alpha = 0.55;

    const gameOverPanel = this.add.tween(this.panel);
    gameOverPanel.to({y: 0}, 500);

    gameOverPanel.onComplete.add(() => {
      this.water.stopScroll();
      this.background.stopScroll();

      let style = {font: '30px Arial', fill: '#fff'};
      this.add.text(this.game.width / 2, this.game.height / 2, 'GAME OVER', style)
        .anchor.setTo(0.5);
      style = {font: '20px Arial', fill: '#fff'};
      this.add.text(this.game.width / 2, this.game.height / 2 + 50, 'High score: ' + this.highScore, style)
        .anchor.setTo(0.5);
      this.add.text(this.game.width / 2, this.game.height / 2 + 80, 'Your score: ' + this.myCoins, style)
        .anchor.setTo(0.5);
      this.add.text(this.game.width / 2, this.game.height / 2 + 120, 'Tap to play again', style)
        .anchor.setTo(0.5);

      this.input.onDown.addOnce(this.restart, this);
    }, this);

    gameOverPanel.start();
  }

  private generateRandomPlatform(): {numTiles: number, seperation: number, y: number} {
    const data: any = {};

    const minSeperation = 60;
    const maxSeperation = 200;
    data.seperation = minSeperation + Math.random() * (maxSeperation - minSeperation);

    const minDifY = -120;
    const maxDifY = 120;
    data.y = this.currentPlatform.children[0].y + minDifY + Math.random() * (maxDifY - minDifY);
    data.y = Math.max(150, data.y);
    data.y = Math.min(this.world.height - 50, data.y);

    const minTiles = 1;
    const maxTiles = 5;
    data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);

    return data;
  }

  private playerJump() {
    if ((this.player.body as Phaser.Physics.Arcade.Body).touching.down) {
      this.startJumpY = this.player.y;
      this.isJumping = true;
      this.jumpPeaked = false;
      (this.player.body as Phaser.Physics.Arcade.Body).velocity.y = -300;
    } else if (this.isJumping && !this.jumpPeaked) {
      const distanceJumped = this.startJumpY - this.player.y;

      if (distanceJumped <= this.maxJumpDistance) {
        (this.player.body as Phaser.Physics.Arcade.Body).velocity.y = -300;
      } else {
        this.jumpPeaked = true;
      }
    }
  }

  private restart() {
    this.state.start('Game');
  }

  private updateHighScore() {
    this.highScore = parseInt(localStorage.getItem('highScore') || '0', 10);

    if (this.highScore < this.myCoins) {
      this.highScore = this.myCoins;
      localStorage.setItem('highScore', this.highScore.toString());
    }
  }
}
