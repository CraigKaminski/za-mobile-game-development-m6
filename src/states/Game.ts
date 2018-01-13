import { Platform } from '../prefabs/Platform';

export class Game extends Phaser.State {
  private currentPlatform: Platform;
  private cursor: Phaser.CursorKeys;
  private floorPool: Phaser.Group;
  private isJumping: boolean;
  private jumpPeaked: boolean;
  private readonly maxJumpDistance = 120;
  private myCoins = 0;
  private player: Phaser.Sprite;
  private platformPool: Phaser.Group;
  private startJumpY: number;
  private levelSpeed = 200;

  public init() {
    this.floorPool = this.add.group();
    this.platformPool = this.add.group();

    this.physics.arcade.gravity.y = 1000;

    this.cursor = this.input.keyboard.createCursorKeys();
  }

  public create() {
    this.player = this.add.sprite(50, 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', [0, 1, 2, 3, 2, 1], 15, true);
    this.physics.arcade.enable(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(38, 60, 7, 4);
    this.player.play('running');

    this.currentPlatform = new Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed);
    this.platformPool.add(this.currentPlatform);
  }

  public update() {
    this.platformPool.forEachAlive((platform: Phaser.Group, index: number) => {
      this.physics.arcade.collide(this.player, platform);

      if (platform.length &&
          (platform.children[platform.length - 1] as Phaser.Sprite).right < 0) {
        platform.kill();
      }
    }, this);

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
  }

  public render() {
    // this.game.debug.body(this.player);
    // this.game.debug.bodyInfo(this.player, 0, 30);
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
          -this.levelSpeed);

        this.platformPool.add(this.currentPlatform);
      } else {
        this.currentPlatform.prepare(nextPlatformData.numTiles,
                                     this.world.width + nextPlatformData.seperation,
                                     nextPlatformData.y,
                                     -this.levelSpeed);
      }
    }
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
}
