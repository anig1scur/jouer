import * as PIXI from 'pixi.js';
import {colorShade} from '../../utils/color';
import {Text} from 'pixi.js';

type handCard = number[];

const CARD_BG = '#FFEDD7';
const BORDER_COLOR = '#A06C30';

export class Card extends PIXI.Graphics {
  private cardWidth: number;
  private cardHeight: number;
  private topNumber: number;
  private topColor: number;
  private bottomNumber: number;
  private bottomColor: number;
  private padding: number = 15;
  private triangleRadius: number = 10;
  private triangleRatio: number = 4 / 3;
  private selected: boolean = false; // 记录是否被选中

  constructor(
    topNumber: number,
    topColor: number,
    bottomNumber: number,
    bottomColor: number,
    width: number = 120,
    height: number = 180
  ) {
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
    this.eventMode = 'dynamic';
    this.cursor = 'pointer';
    this.on('pointerdown', this.toggleSelect);
  }

  private onHover = (): void => {
    console.log('hover');
  };

  private toggleSelect = (): void => {
    console.log('toggle select');
    this.selected = !this.selected;
    this.y = this.selected ? this.y - 20 : this.y + 20;
  };

  private drawCard(): void {
    this.drawBackground();
    this.drawTopTriangle();
    this.drawBottomTriangle();
    this.hitArea = new PIXI.Rectangle(0, 0, this.cardWidth, this.cardHeight);
  }

  private drawBackground(): void {
    const background = new PIXI.Graphics();
    background.fill(CARD_BG);
    background.roundRect(0, 0, this.cardWidth, this.cardHeight, 10);
    background.fill();

    background.setStrokeStyle({
      color: BORDER_COLOR,
      width: 2,
    });
    background.stroke();
    this.addChild(background);
  }

  private drawTopTriangle(): void {
    const topTriangle = new PIXI.Graphics().setStrokeStyle({
      color: colorShade(this.topColor.toString(16), -50),
      width: 2,
    });
    topTriangle.fill(this.topColor);

    topTriangle.moveTo(this.padding, this.padding);
    topTriangle.lineTo(this.cardWidth / this.triangleRatio, this.padding);
    topTriangle.lineTo(this.padding, this.cardHeight / this.triangleRatio);
    topTriangle.lineTo(this.padding, this.padding);

    // 为什么在 fill 前后 stroke 样式这么不一样？
    // topTriangle.stroke();

    topTriangle.fill();

    topTriangle.stroke();

    const topText = new Text({
      text: this.topNumber.toString(),
      style: {
        fontFamily: 'Kreon',
        fontSize: 48,
        align: 'center',
        fill: 'rgba(0, 0, 0, 0)',
        stroke: {
          color: BORDER_COLOR,
          width: 2,
        },
      },
    });

    topText.position.set(25, 20);

    topTriangle.addChild(topText);

    this.addChild(topTriangle);
  }

  private drawBottomTriangle(): void {
    const bottomTriangle = new PIXI.Graphics().setStrokeStyle({
      color: colorShade(this.bottomColor.toString(16), -50),
      width: 2,
    });
    bottomTriangle.fill(this.bottomColor);
    bottomTriangle.moveTo(this.cardWidth - this.padding, this.cardHeight - this.padding);
    bottomTriangle.lineTo(this.cardWidth - this.cardWidth / this.triangleRatio, this.cardHeight - this.padding);
    bottomTriangle.lineTo(this.cardWidth - this.padding, this.cardHeight - this.cardHeight / this.triangleRatio);
    bottomTriangle.lineTo(this.cardWidth - this.padding, this.cardHeight - this.padding);
    bottomTriangle.fill();
    bottomTriangle.stroke();

    const bottomText = new PIXI.Text({
      text: this.bottomNumber.toString(),
      style: {
        fontFamily: 'Kreon',
        fontSize: 48,
        align: 'center',
        fill: 'white',
        stroke: {
          color: '#A06C30',
          width: 2,
        },
      },
    });

    // bottomText rotate by center
    bottomText.anchor.set(1);
    bottomText.rotation = Math.PI;
    bottomText.position.set(this.cardWidth / 2 + this.padding, this.cardHeight / 2 + this.padding);
    bottomTriangle.addChild(bottomText);
    this.addChild(bottomTriangle);
  }
}

export class Hand extends PIXI.Container {
  private cards: handCard[];
  private activeCards: handCard[] = [];
  private cardWidth: 80;
  private cardHeight: 120;
  private padding: number = 10;

  constructor(cards: handCard[]) {
    super();
    this.cards = cards;
    this.drawHand();
  }

  drawHand(): void {
    this.removeChildren();
    const totalCards = this.cards.length;
    const totalAngle = Math.PI / 6;

    this.cards.forEach((card, index) => {
      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + index * angleStep;

      const cardSprite = new Card(card[0], 0xffe6bd, card[1], 0xe2976f, this.cardWidth, this.cardHeight);
      cardSprite.rotation = angle;
      cardSprite.position.set(index * 80, Math.abs(angle) * 100);

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
}
