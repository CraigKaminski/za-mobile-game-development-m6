export class Platform extends Phaser.Group {
  private coinsPool: Phaser.Group;
  private floorPool: Phaser.Group;
  private readonly tileSize = 40;

  constructor(game: Phaser.Game, floorPool: Phaser.Group, numTiles: number, x: number, y: number, speed: number, coinsPool: Phaser.Group) {
    super(game);

    this.coinsPool = coinsPool;
    this.floorPool = floorPool;

    this.enableBody = true;

    this.prepare(numTiles, x, y, speed);
  }

  public kill() {
    super.kill();
    super.killAll();

    this.moveAll(this.floorPool);
  }

  public prepare(numTiles: number, x: number , y: number, speed: number) {
    this.revive();

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

    this.addCoins(speed);
  }

  private addCoins(speed: number) {
    const coinsY = 90 + Math.random() * 110;

    this.forEach((tile: Phaser.Sprite) => {
      const hasCoin = Math.random() <= 0.4;

      if (hasCoin) {
        let coin = this.coinsPool.getFirstExists(false);

        if (!coin) {
          coin = new Phaser.Sprite(this.game, tile.x, tile.y - coinsY, 'coin');
          this.coinsPool.add(coin);
        } else {
          coin.reset(tile.x, tile.y - coinsY);
        }

        coin.body.velocity.x = speed;
        coin.body.allowGravity = false;
      }
    }, this);
  }
}
