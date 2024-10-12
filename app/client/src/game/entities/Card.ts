import * as PIXI from 'pixi.js';
import { colorShade } from '../../utils/color';

type handCard = number[];

export class Card extends PIXI.Container {
  private cardWidth: number;
  private cardHeight: number;
  private topNumber: number;
  private topColor: number;
  private bottomNumber: number;
  private bottomColor: number;
  private padding: number = 15;
  private triangleRadius: number = 10;
  private triangleRatio: number = 4 / 3;

  constructor (topNumber: number, topColor: number, bottomNumber: number, bottomColor: number, width: number = 120, height: number = 180) {
    super();
    this.cardWidth = width;
    this.cardHeight = height;
    this.width = width;
    this.height = height;
    this.topNumber = topNumber;
    this.topColor = topColor;
    this.bottomNumber = bottomNumber;
    this.bottomColor = bottomColor;

    this.drawCard();
  }

  private drawCard(): void {
    this.drawBackground();
    this.drawTopTriangle();
    this.drawBottomTriangle();
  }

  private drawBackground(): void {
    const background = new PIXI.Graphics();
    background.fill(0xFFFFFF);
    background.drawRoundedRect(0, 0, this.cardWidth, this.cardHeight, 10);
    background.fill();
    this.addChild(background);
  }

  private drawTopTriangle(): void {
    const topTriangle = new PIXI.Graphics().setStrokeStyle({
      color: colorShade(this.topColor.toString(16), -50),
      width: 2,
    })
    topTriangle.fill(this.topColor);

    topTriangle.moveTo(this.padding, this.padding);
    topTriangle.lineTo(this.cardWidth / this.triangleRatio, this.padding);
    topTriangle.lineTo(this.padding, this.cardHeight / this.triangleRatio);
    topTriangle.lineTo(this.padding, this.padding);

    // 为什么在 fill 前后 stroke 样式这么不一样？
    // topTriangle.stroke();

    topTriangle.fill();

    topTriangle.stroke();

    const topText = new PIXI.Text(this.topNumber.toString(), {
      fontSize: 32,
      fill: 0xFFFFFF,
      align: 'center'
    });
    topText.position.set(30, 30);

    topTriangle.addChild(topText);

    this.addChild(topTriangle);
  }

  private drawBottomTriangle(): void {
    const bottomTriangle = new PIXI.Graphics().setStrokeStyle({
      color: colorShade(this.bottomColor.toString(16), -50),
      width: 2,
    })
    bottomTriangle.fill(this.bottomColor);
    bottomTriangle.moveTo(this.cardWidth - this.padding, this.cardHeight - this.padding);
    bottomTriangle.lineTo(this.cardWidth - this.cardWidth / this.triangleRatio, this.cardHeight - this.padding);
    bottomTriangle.lineTo(this.cardWidth - this.padding, this.cardHeight - this.cardHeight / this.triangleRatio);
    bottomTriangle.lineTo(this.cardWidth - this.padding, this.cardHeight - this.padding);
    bottomTriangle.fill();
    bottomTriangle.stroke();

    const bottomText = new PIXI.Text(this.bottomNumber.toString(), {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xFFFFFF,
      align: 'center'
    });
    bottomText.position.set(this.cardWidth / 2 + this.padding, this.cardHeight / 2 + this.padding);
    bottomTriangle.addChild(bottomText);
    this.addChild(bottomTriangle);
  }


  public setTopNumber(number: number): void {
    this.topNumber = number;
    this.removeChildren();
    this.drawCard();
  }

  public setBottomNumber(number: number): void {
    this.bottomNumber = number;
    this.removeChildren();
    this.drawCard();
  }

  public setTopColor(color: number): void {
    this.topColor = color;
    this.removeChildren();
    this.drawCard();
  }

  public setBottomColor(color: number): void {
    this.bottomColor = color;
    this.removeChildren();
    this.drawCard();
  }
}

export class Hand extends PIXI.Container {
  private cards: handCard[];
  private cardWidth: 80;
  private cardHeight: 120;
  private padding: number = 10;

  constructor (cards: handCard[]) {
    super();
    this.cards = cards;
    this.drawHand();
  }

  drawHand(): void {
    this.removeChildren();
    const cardLen = this.cards.length;
    this.cards.forEach((card, index) => {
      const cardSprite = new Card(card[0], 0xFFC0CB, card[1], 0xC0C0C0, this.cardWidth, this.cardHeight);
      cardSprite.position.set(index * 100, Math.abs((index + 1) - cardLen / 2) * 8);
      this.addChild(cardSprite);
    });
    this.position.set(100, 100);
  }

  public addCard(card: handCard): void {
    this.cards.push(card);
    this.drawHand();
  }

  public removeCard(index: number): void {
    this.cards.splice(index, 1);
    this.drawHand();
  }

  public reverse(): void {
    this.cards.reverse();
    this.drawHand();
  }
}
