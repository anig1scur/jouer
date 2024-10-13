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
  private selected: boolean = false;
  private cardIndex: number;
  private onSelectCallback: (index: number, selected: boolean) => void;

  constructor(
    cardIndex: number,
    topNumber: number,
    topColor: number,
    bottomNumber: number,
    bottomColor: number,
    onSelectCallback: (index: number, selected: boolean) => void,
    width: number = 120,
    height: number = 180
  ) {
    super();
    this.cardIndex = cardIndex;
    this.cardWidth = width;
    this.cardHeight = height;
    this.width = width;
    this.height = height;
    this.topNumber = topNumber;
    this.topColor = topColor;
    this.bottomNumber = bottomNumber;
    this.bottomColor = bottomColor;
    this.onSelectCallback = onSelectCallback;

    this.drawCard();
    this.eventMode = 'dynamic';
    this.cursor = 'pointer';
    this.on('pointerdown', this.toggleSelect);
  }

  private toggleSelect = (): void => {
    this.selected = !this.selected;
    this.y = this.selected ? this.y - 20 : this.y + 20;

    this.onSelectCallback(this.cardIndex, this.selected);
  };

  public setSelected(selected: boolean): void {
    this.selected = selected;
    this.y = this.selected ? this.y - 20 : this.y + 20;
  }

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
  private selectedCards: number[] = [];
  private cardWidth: 80;
  private cardHeight: 120;

  constructor(cards: handCard[]) {
    super();
    this.cards = cards;
    this.drawHand();
  }

  private onCardSelect = (index: number, selected: boolean): void => {
    if (selected) {
      this.selectedCards.push(index);
    } else {
      this.selectedCards = this.selectedCards.filter((i) => i !== index);
    }
    console.log(this.selectedCards);
  };

  drawHand(): void {
    this.removeChildren();
    const totalCards = this.cards.length;
    const totalAngle = Math.PI / 6;

    this.cards.forEach((card, index) => {
      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + index * angleStep;

      const cardSprite = new Card(
        index,
        card[0],
        0xffe6bd,
        card[1],
        0xe2976f,
        this.onCardSelect,
        this.cardWidth,
        this.cardHeight
      );
      cardSprite.rotation = angle;
      cardSprite.position.set(index * 80, Math.abs(angle) * 100);

      this.addChild(cardSprite);
    });
    this.position.set(100, 100);
  }

  public getSelectedCards(): handCard[] {
    // 根据选中的索引返回选中的卡牌
    return this.selectedCards.map((index) => this.cards[index]);
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
