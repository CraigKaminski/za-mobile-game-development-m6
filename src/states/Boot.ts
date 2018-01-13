export class Boot extends Phaser.State {
  public init() {
    this.stage.backgroundColor = '#fff';
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.physics.startSystem(Phaser.Physics.ARCADE);
  }

  public preload() {
    this.load.image('preloadbar', 'images/preloader-bar.png');
  }

  public create() {
    this.state.start('Preload');
  }
}
