import * as PIXI from 'pixi.js';
import Hand from '../assets/hand.png';
import Face from '../assets/face.png';
import Score from '../assets/score.png';
import BoardBg from '../assets/boardBg.png';

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

class StatsBoard extends PIXI.Container {
  private hand: number;
  private score: number;
  private handSprite: PIXI.Sprite;
  private scoreSprite: PIXI.Sprite;
  private handCountText: PIXI.Text;
  private scoreCountText: PIXI.Text;
  private assetsLoader: AssetsLoader;

  constructor(hand: number, score: number, assetsLoader: AssetsLoader) {
    super();
    this.hand = hand;
    this.score = score;
    this.assetsLoader = assetsLoader;
    this.initialize();
  }

  private createSprite(alias: string, options: Partial<PIXI.Sprite>): PIXI.Sprite {
    const sprite = this.assetsLoader.get(alias) as PIXI.Sprite;
    Object.assign(sprite, options);
    this.addChild(sprite);
    return sprite;
  }

  private createText(text: string, style: Partial<PIXI.TextStyle>): PIXI.Text {
    const textObj = new PIXI.Text({
      text,
      style: {
        fontFamily: 'jmadh',
        fontSize: 48,
        fill: 0x70422f,
        ...style,
      },
    });
    this.addChild(textObj);
    return textObj;
  }

  private initialize(): void {
    const commonSpriteOptions = {width: 48, height: 48};
    const commonTextStyle = {fontSize: 64};

    const boardBg = this.createSprite('boardBg', commonSpriteOptions);
    boardBg.width = 140;
    boardBg.height = 160;
    boardBg.position.set(0, 0);
    this.addChild(boardBg);

    this.handSprite = this.createSprite('hand', commonSpriteOptions);
    this.handSprite.position.set(20, 10);

    this.handCountText = this.createText(this.hand.toString(), commonTextStyle);
    this.handCountText.position.set(80, 0);

    this.scoreSprite = this.createSprite('score', commonSpriteOptions);
    this.scoreSprite.position.set(20, 85);

    this.scoreCountText = this.createText(this.score.toString(), commonTextStyle);
    this.scoreCountText.position.set(80, 80);
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

export class Player extends PIXI.Container {
  private hand: number;
  private score: number;
  private faceSprite: PIXI.Sprite | PIXI.Graphics;
  private statsBoard: StatsBoard;
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
      {alias: 'face', src: Face},
      {alias: 'hand', src: Hand},
      {alias: 'score', src: Score},
      {alias: 'boardBg', src: BoardBg},
    ]);

    this.createLeftSide();
    this.createRightSide();
  }

  private createSprite(alias: string, options: Partial<PIXI.Sprite>): PIXI.Sprite {
    const sprite = this.assetsLoader.get(alias) as PIXI.Sprite;
    Object.assign(sprite, options);
    this.addChild(sprite);
    return sprite;
  }

  private createText(text: string, style: Partial<PIXI.TextStyle>): PIXI.Text {
    const textObj = new PIXI.Text({
      text,
      style: {
        fontFamily: 'jmadh',
        fontSize: 48,
        fill: 0x70422f,
        ...style,
      },
    });
    this.addChild(textObj);
    return textObj;
  }

  private createLeftSide(): void {
    const faceWidth = 120;
    this.faceSprite = this.createSprite('face', {
      width: faceWidth,
      height: 120,
    });
    this.faceSprite.position.set(0, 10);

    const nameText = this.createText(this.name, {fontSize: 48});
    const nameTextWidth = nameText.width;

    nameText.position.x = (faceWidth - nameTextWidth) / 2;
    nameText.position.y = 120;
  }

  private createRightSide(): void {
    this.statsBoard = new StatsBoard(this.hand, this.score, this.assetsLoader);
    this.statsBoard.position.set(150, 10);
    this.addChild(this.statsBoard);
  }

  public updateHand(newHand: number): void {
    this.hand = newHand;
    this.statsBoard.updateHand(newHand);
  }

  public updateScore(newScore: number): void {
    this.score = newScore;
    this.statsBoard.updateScore(newScore);
  }
}
