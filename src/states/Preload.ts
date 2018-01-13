export class Preload extends Phaser.State {
  private preloadBar: Phaser.Sprite;

  public preload() {
    this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);

    this.load.image('playerDead', 'images/player_dead.png');
    this.load.image('floor', 'images/floor.png');
    this.load.image('water', 'images/water.png');
    this.load.image('coin', 'images/coin.png');
    this.load.image('background', 'images/background.png');
    this.load.spritesheet('player', 'images/player_spritesheet.png', 51, 67, 5, 2, 3);
    this.load.audio('coin', ['audio/coin.mp3', 'audio/coin.ogg']);
  }

  public create() {
    this.state.start('Game');
  }
}
