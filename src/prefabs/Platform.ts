export class Platform extends Phaser.Group {
  public floorPool: Phaser.Group;
  private readonly tileSize = 40;

  constructor(game: Phaser.Game, floorPool: Phaser.Group, numTiles: number, x: number, y: number, speed: number) {
    super(game);

    this.floorPool = floorPool;

    this.enableBody = true;

    this.prepare(numTiles, x, y, speed);
  }

  private prepare(numTiles: number, x: number , y: number, speed: number) {
    this.alive = true;

    for (let i = 0; i < numTiles; i++) {
      let floorTile: Phaser.Sprite = this.floorPool.getFirstExists(false);

      if (!floorTile) {
        floorTile = new Phaser.Sprite(this.game, x + i * this.tileSize, y, 'floor');
      } else {
        floorTile.reset(x + i * this.tileSize, y);
      }

      this.add(floorTile);
    }

    this.setAll('body.immovable', true);
    this.setAll('body.allowGravity', false);
    this.setAll('body.velocity.x', speed);
  }
}
