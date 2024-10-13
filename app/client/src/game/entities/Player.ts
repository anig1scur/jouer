import * as PIXI from 'pixi.js';
import HandSvg from '../assets/hand.svg';
import HandPng from '../assets/hand.png';

export class AssetsLoader {
  private resources: any = {};

  public async load(assets: {alias: string; src: string}[]): Promise<void> {
    const loadPromises = assets.map((asset) => {
      if (asset.src.endsWith('.png') || asset.src.endsWith('.jpg') || asset.src.endsWith('.jpeg')) {
        return PIXI.Assets.load(asset.src).then((texture) => {
          this.resources[asset.alias] = new PIXI.Sprite(texture);
        });
      } else if (asset.src.endsWith('.svg')) {
        return PIXI.Assets.load({
          alias: asset.alias,
          src: asset.src,
          data: {parseAsGraphicsContext: true},
        }).then((graphicsData) => {
          const graphics = new PIXI.Graphics(graphicsData);
          this.resources[asset.alias] = graphics;
        });
      } else {
        return Promise.reject(new Error(`Unsupported file type: ${asset.src}`));
      }
    });

    await Promise.all(loadPromises);
  }

  public get(alias: string): PIXI.Sprite | PIXI.Graphics {
    return this.resources[alias];
  }
}

export class Player extends PIXI.Container {
  private hand: number;
  private score: number;
  private faceSprite: PIXI.Sprite | PIXI.Graphics;
  private handSprite: PIXI.Sprite;
  private scoreSprite: PIXI.Sprite;
  private handCountText: PIXI.Text;
  private scoreCountText: PIXI.Text;
  private assetsLoader: AssetsLoader;

  constructor(name: string, hand: number, score: number) {
    super();

    this.name = name;
    this.hand = hand;
    this.score = score;
    this.assetsLoader = new AssetsLoader();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.assetsLoader.load([
      {alias: 'faceTexture', src: HandSvg},
      {alias: 'handTexture', src: HandPng},
    ]);

    this.createLeftSide();
    this.createRightSide();
  }

  private createLeftSide(): void {
    // Face
    this.faceSprite = this.assetsLoader.get('faceTexture');
    this.faceSprite.width = 50;
    this.faceSprite.height = 50;
    this.addChild(this.faceSprite);

    // Name
    const nameText = new PIXI.Text(this.name, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
    });
    nameText.position.set(60, 15);
    this.addChild(nameText);
  }

  private createRightSide(): void {
    // Hand
    this.handSprite = this.assetsLoader.get('handTexture') as PIXI.Sprite;
    this.handSprite.width = 100;
    this.handSprite.height = 100;
    this.handSprite.position.set(150, 0);
    this.addChild(this.handSprite);

    // Hand count
    this.handCountText = new PIXI.Text(this.hand.toString(), {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
    });
    this.handCountText.position.set(185, 5);
    this.addChild(this.handCountText);

    // Score
    this.scoreSprite = this.assetsLoader.get('faceTexture') as PIXI.Sprite;
    this.scoreSprite.width = 30;
    this.scoreSprite.height = 30;
    this.scoreSprite.position.set(0, 0);
    this.addChild(this.scoreSprite);

    // Score count
    this.scoreCountText = new PIXI.Text(this.score.toString(), {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
    });
    this.scoreCountText.position.set(255, 5);
    this.addChild(this.scoreCountText);
  }

  public updateHand(newHand: number): void {
    this.hand = newHand;
    this.handCountText.text = newHand.toString();
  }

  public updateScore(newScore: number): void {
    this.score = newScore;
    this.scoreCountText.text = newScore.toString();
  }
}
