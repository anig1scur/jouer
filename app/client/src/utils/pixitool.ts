import * as PIXI from 'pixi.js';

export class AssetsLoader {
  private resources: Record<string, PIXI.Sprite | PIXI.Graphics> = {};

  public async load(assets: {alias: string; src: string}[]): Promise<void> {
    const loadPromises = assets.map(async (asset) => {
      if (asset.src.endsWith('.svg')) {
        const graphicsData = await PIXI.Assets.load({
          alias: asset.alias,
          src: asset.src,
          data: {parseAsGraphicsContext: true},
        });
        this.resources[asset.alias] = new PIXI.Graphics(graphicsData);
      } else {
        const texture = await PIXI.Assets.load(asset.src);
        this.resources[asset.alias] = new PIXI.Sprite(texture);
      }
    });

    await Promise.all(loadPromises);
  }

  public get(alias: string): PIXI.Sprite | PIXI.Graphics {
    return this.resources[alias];
  }
}
