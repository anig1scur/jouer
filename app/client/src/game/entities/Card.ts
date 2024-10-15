import * as PIXI from 'pixi.js';
import {colorShade} from '../../utils/color';
import {Text} from 'pixi.js';
import {Models} from '@jouer/common/src';
import {BaseEntity} from '.';

type handCard = Models.CardJSON;

const CARD_BG = '#FFEDD7';
const BORDER_COLOR = '#A06C30';
const PADDING = 15;
const TRIANGLE_RATIO = 4 / 3;
const TOP_COLOR = 0xffe6bd;
const BOTTOM_COLOR = 0xe2976f;
const DEFAULT_CARD_WIDTH = 120;
const DEFAULT_CARD_HEIGHT = 180;
const HAND_CARD_WIDTH = 80;
const HAND_CARD_HEIGHT = 120;

export class Card extends BaseEntity {
  public id: string;
  public values: number[];
  public owner: string;
  public state: string;

  private cardWidth: number = DEFAULT_CARD_WIDTH;
  private cardHeight: number = DEFAULT_CARD_HEIGHT;
  private topNumber: number;
  private bottomNumber: number;

  private selected: boolean = false;
  private cardIndex: number;
  private onSelectCallback: (index: number, selected: boolean) => void;

  constructor(
    cardIndex: number,
    id: string,
    values: number[],
    owner: string,
    state: string,
    onSelectCallback?: (index: number, selected: boolean) => void
  ) {
    super();

    this.id = id;
    this.values = values;
    this.state = state;
    this.owner = owner;

    this.cardIndex = cardIndex;
    this.topNumber = values[0];
    this.bottomNumber = values[1];
    this.onSelectCallback = onSelectCallback;

    this.drawCard();
    this.container.eventMode = 'dynamic';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', this.toggleSelect);
  }

  private toggleSelect = (): void => {
    this.selected = !this.selected;
    this.container.y = this.selected ? this.container.y - 30 : this.container.y + 30;

    this.onSelectCallback(this.cardIndex, this.selected);
  };

  public setSelected(selected: boolean): void {
    this.selected = selected;
    this.container.y = this.selected ? this.container.y - 30 : this.container.y + 30;
  }

  private drawCard(): void {
    this.drawBackground();
    this.drawTopTriangle();
    this.drawBottomTriangle();
    this.container.hitArea = new PIXI.Rectangle(0, 0, this.cardWidth, this.cardHeight);
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
    this.container.addChild(background);
  }

  private drawTopTriangle(): void {
    const topTriangle = new PIXI.Graphics().setStrokeStyle({
      color: colorShade(TOP_COLOR.toString(16), -50),
      width: 2,
    });
    topTriangle.fill(TOP_COLOR);

    topTriangle.moveTo(PADDING, PADDING);
    topTriangle.lineTo(this.cardWidth / TRIANGLE_RATIO, PADDING);
    topTriangle.lineTo(PADDING, this.cardHeight / TRIANGLE_RATIO);
    topTriangle.lineTo(PADDING, PADDING);

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

    this.container.addChild(topTriangle);
  }

  private drawBottomTriangle(): void {
    const bottomTriangle = new PIXI.Graphics().setStrokeStyle({
      color: colorShade(BOTTOM_COLOR.toString(16), -50),
      width: 2,
    });
    bottomTriangle.fill(BOTTOM_COLOR);
    bottomTriangle.moveTo(this.cardWidth - PADDING, this.cardHeight - PADDING);
    bottomTriangle.lineTo(this.cardWidth - this.cardWidth / TRIANGLE_RATIO, this.cardHeight - PADDING);
    bottomTriangle.lineTo(this.cardWidth - PADDING, this.cardHeight - this.cardHeight / TRIANGLE_RATIO);
    bottomTriangle.lineTo(this.cardWidth - PADDING, this.cardHeight - PADDING);
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

    bottomText.anchor.set(1);
    bottomText.rotation = Math.PI;
    bottomText.position.set(this.cardWidth / 2 + PADDING, this.cardHeight / 2 + PADDING);
    bottomTriangle.addChild(bottomText);
    this.container.addChild(bottomTriangle);
  }
}

export class Hand extends PIXI.Container {
  private cards: handCard[];
  private selectedCards: number[] = [];

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
  };

  drawHand(): void {
    this.removeChildren();
    const totalCards = this.cards.length;
    const totalAngle = Math.PI / 8;

    this.cards.forEach((card, index) => {
      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + index * angleStep;

      const cardSprite = new Card(index, card.id, card.values, card.owner, card.state, this.onCardSelect);
      cardSprite.container.rotation = angle;
      cardSprite.container.position.set(index * HAND_CARD_WIDTH, Math.abs(angle) * 200);

      this.addChild(cardSprite.container);
    });
    this.position.set(100, 100);
  }

  public getSelectedCards(): handCard[] {
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

  public reverse(): void {
    this.cards.reverse();
    this.cards.forEach((card, index) => {
      card.values.reverse();
    });
  }
}
