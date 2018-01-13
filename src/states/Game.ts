import { Physics } from 'phaser-ce';

import { Platform } from '../prefabs/Platform';

export class Game extends Phaser.State {
  private cursor: Phaser.CursorKeys;
  private floorPool: Phaser.Group;
  private isJumping: boolean;
  private jumpPeaked: boolean;
  private readonly maxJumpDistance = 120;
  private myCoins = 0;
  private player: Phaser.Sprite;
  private platform: Platform;
  private startJumpY: number;

  public init() {
    this.floorPool = this.add.group();

    this.physics.arcade.gravity.y = 1000;

    this.cursor = this.input.keyboard.createCursorKeys();
  }

  public create() {
    this.player = this.add.sprite(50, 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', [0, 1, 2, 3, 2, 1], 15, true);
    this.physics.arcade.enable(this.player);
    (this.player.body as Physics.Arcade.Body).setSize(38, 60, 7, 4);
    this.player.play('running');

    this.platform = new Platform(this.game, this.floorPool, 12, 0, 200);
    this.add.existing(this.platform);
  }

  public update() {
    this.physics.arcade.collide(this.player, this.platform);

    if (this.cursor.up.isDown || this.input.activePointer.isDown) {
      this.playerJump();
    } else if (this.cursor.up.isUp || this.input.activePointer.isUp) {
      this.isJumping = false;
    }
  }

  public render() {
    // this.game.debug.body(this.player);
    // this.game.debug.bodyInfo(this.player, 0, 30);
  }

  private playerJump() {
    if ((this.player.body as Physics.Arcade.Body).touching.down) {
      this.startJumpY = this.player.y;
      this.isJumping = true;
      this.jumpPeaked = false;
      (this.player.body as Physics.Arcade.Body).velocity.y = -300;
    } else if (this.isJumping && !this.jumpPeaked) {
      const distanceJumped = this.startJumpY - this.player.y;
      console.log('distanceJumped');
      if (distanceJumped <= this.maxJumpDistance) {
        (this.player.body as Physics.Arcade.Body).velocity.y = -300;
      } else {
        this.jumpPeaked = true;
      }
    }
  }
}
