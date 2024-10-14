import * as PIXI from 'pixi.js';
import Hand from '../assets/hand.png';
import Face from '../assets/face.png';
import Score from '../assets/score.png';
import BoardBg from '../assets/boardBg.png';
import {AssetsLoader} from '../../utils/pixitool';

class StatsBoard extends PIXI.Container {
  private cardCount: number;
  private score: number;
  private cardCountSprite: PIXI.Sprite;
  private scoreSprite: PIXI.Sprite;
  private cardCountText: PIXI.Text;
  private scoreCountText: PIXI.Text;
  private assetsLoader: AssetsLoader;

  constructor(cardCount: number, score: number, assetsLoader: AssetsLoader) {
    super();
    this.cardCount = cardCount;
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

    this.cardCountSprite = this.createSprite('cardCount', commonSpriteOptions);
    this.cardCountSprite.position.set(20, 10);

    this.cardCountText = this.createText(this.cardCount.toString(), commonTextStyle);
    this.cardCountText.position.set(80, 0);

    this.scoreSprite = this.createSprite('score', commonSpriteOptions);
    this.scoreSprite.position.set(20, 85);

    this.scoreCountText = this.createText(this.score.toString(), commonTextStyle);
    this.scoreCountText.position.set(80, 80);
  }

  public updateHand(newHand: number): void {
    this.cardCount = newHand;
    this.cardCountText.text = newHand.toString();
  }

  public updateScore(newScore: number): void {
    this.score = newScore;
    this.scoreCountText.text = newScore.toString();
  }
}

export class Player extends PIXI.Container {
  private cardCount: number;
  private score: number;
  private faceSprite: PIXI.Sprite | PIXI.Graphics;
  private statsBoard: StatsBoard;
  private assetsLoader: AssetsLoader;

  constructor(name: string, cardCount: number, score: number) {
    super();

    this.name = name;
    this.cardCount = cardCount;
    this.score = score;
    this.assetsLoader = new AssetsLoader();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.assetsLoader.load([
      {alias: 'face', src: Face},
      {alias: 'cardCount', src: Hand},
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
    this.statsBoard = new StatsBoard(this.cardCount, this.score, this.assetsLoader);
    this.statsBoard.position.set(150, 10);
    this.addChild(this.statsBoard);
  }

  public updateHand(newHand: number): void {
    this.cardCount = newHand;
    this.statsBoard.updateHand(newHand);
  }

  public updateScore(newScore: number): void {
    this.score = newScore;
    this.statsBoard.updateScore(newScore);
  }
}
