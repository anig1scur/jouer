// managers.ts
import * as PIXI from 'pixi.js';
import {Container, Sprite} from 'pixi.js';
import {BaseEntity} from '../entities';

import {Card} from '../entities/Card';
import {Player} from '../entities/Player';
import {Models} from '@jouer/common/src';
import {AssetsLoader} from '../../utils/pixitool';
import Btn from '../assets/btn.png';

export class BaseManager<T extends BaseEntity> extends Container {
  protected container: Container;

  protected entities: {[key: string]: T};

  constructor(name: string) {
    super();
    this.container = new Container();
    this.container.name = name;
    this.entities = {};
  }

  // Container
  public show = () => {
    this.visible = true;
  };

  public hide = () => {
    this.visible = false;
  };

  // Entities
  public add = (key: string, entity: T) => {
    this.entities[key] = entity;
    entity.container.position.set(0, this.children.length * 150);
    this.addChild(entity.container);
  };

  public get = (key: string): T | undefined => {
    return this.entities[key];
  };

  public getAll = (): T[] => {
    return Object.values(this.entities);
  };

  public remove = (key: string) => {
    this.removeChild(this.entities[key].container);
    delete this.entities[key];
  };
}

export class HandManager extends BaseManager<Card> {
  public cards: Card[] = [];
  private borrowingCard: Card | null = null;
  private borrowingCardReverse: Card | null = null;
  private emptySlots: PIXI.Graphics[] = [];
  private onSlotClickCallback: (cardIdx: number, inverse: boolean, targetIdx: number) => void;

  constructor(onSlotClickCallback) {
    super('hand');
    this.onSlotClickCallback = onSlotClickCallback;
  }

  emptyHand() {
    this.removeChildren();
    this.entities = {};
    this.cards = [];
    this.borrowingCard = null;
    this.borrowingCardReverse = null;
    this.emptySlots = [];
  }

  setCards(cards: Card[]) {
    this.emptyHand();
    this.cards = cards;
    this.position.set(300, 500);
    const totalCards = cards.length;
    const totalAngle = Math.PI / 6;
    cards.forEach((card, index) => {
      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + index * angleStep;
      card.container.rotation = angle;
      card.container.position.set(index * 80, Math.abs(angle) * 100);
      this.entities[card.id] = card;
      this.addChild(card.container);
    });
  }

  getSelectedCards() {
    return Object.values(this.entities).filter((card) => card.selected);
  }

  setBorrowingCard(card: Card) {
    if (this.borrowingCard) this.removeChild(this.borrowingCard.container);
    if (this.borrowingCardReverse) this.removeChild(this.borrowingCardReverse.container);
    this.emptySlots.forEach((slot) => this.removeChild(slot));

    this.borrowingCard = card.clone();
    console.log('borrowingCard', this.borrowingCard);
    this.borrowingCard.container.position.set(800, -320);
    this.addChild(this.borrowingCard.container);

    // Create and position the reversed card
    this.borrowingCardReverse = card.clone();
    this.borrowingCardReverse.container.position.set(700, -150);
    this.borrowingCardReverse.container.pivot.set(0, 0);
    this.borrowingCardReverse.container.rotation = Math.PI;
    this.addChild(this.borrowingCardReverse.container);

    // Add click event listeners to the cards
    this.borrowingCard.container.interactive = true;
    this.borrowingCardReverse.container.interactive = true;
    this.borrowingCard.container.on('click', () => this.selectBorrowingCard(false));
    this.borrowingCardReverse.container.on('click', () => this.selectBorrowingCard(true));

    // Initially select the normal card
    this.selectBorrowingCard(false);

    // Create empty slots between existing cards
    this.createEmptySlots();
  }

  private selectBorrowingCard(isReverse: boolean) {
    if (this.borrowingCard && this.borrowingCardReverse) {
      this.borrowingCard.container.alpha = isReverse ? 0.5 : 1;
      this.borrowingCardReverse.container.alpha = isReverse ? 1 : 0.5;
    }
  }

  private createEmptySlots() {
    this.emptySlots = [];
    const totalCards = this.cards.length;
    const totalAngle = Math.PI / 6;

    for (let i = 0; i <= totalCards; i++) {
      const slot = new PIXI.Graphics();
      slot.fill({
        color: 0xffffff,
        alpha: 0.5,
      });
      slot.rect(-30, -40, 60, 80);
      slot.fill();

      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + i * angleStep;
      slot.rotation = angle;
      slot.position.set(i * 80 - 30, Math.abs(angle) * 100);

      slot.interactive = true;
      slot.cursor = 'pointer';
      slot.on('click', () => this.onSlotClick(i));

      this.addChild(slot);
      this.emptySlots.push(slot);
    }
  }

  private onSlotClick(index: number) {
    // Handle the slot click event
    console.log(`Slot ${index} clicked`);
    // Here you can implement the logic to insert the borrowing card
    // into the selected position in the this.cards array

    this.onSlotClickCallback(this.borrowingCard.cardIndex, this.borrowingCardReverse.container.alpha === 1, index);
  }

  reverseCards() {}
}

export class TableManager extends BaseManager<Card> {
  constructor() {
    super('table');
  }

  public cards: Card[] = [];

  emptyTable() {
    this.removeChildren();
    this.entities = {};
    this.cards = [];
  }

  setCards(cards: Card[]) {
    this.emptyTable();
    this.cards = cards;
    this.removeChildren();
    this.position.set(500, 200);
    const totalCards = cards.length;
    const totalAngle = Math.PI / 6;
    this.scale.set(0.75);
    cards.forEach((card, index) => {
      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + index * angleStep;
      card.container.rotation = angle;
      card.container.position.set(index * 80, Math.abs(angle) * 100);
      this.entities[card.id] = card;
      this.addChild(card.container);
    });
  }

  reverseCards() {}

  getSelectedCard() {
    return Object.values(this.entities).find((card) => card.selected);
  }
}

export class PlayersManager extends BaseManager<Player> {
  constructor() {
    super('Players');
  }
}

class ActionButton extends BaseEntity {
  private text: PIXI.Text;
  private type: Models.ActionType;

  private assetsLoader: AssetsLoader;

  constructor(type: Models.ActionType) {
    super();
    this.type = type;
    this.container = new Container();
    this.container.name = `ActionButton_${type}`;
    this.assetsLoader = new AssetsLoader();
    this.initialize();
  }

  async initialize() {
    await this.assetsLoader.load([
      {
        alias: 'btn',
        src: Btn,
      },
    ]);
    this.draw();
  }

  draw() {
    const background = this.assetsLoader.get('btn');
    background.scale.set(0.36);
    this.container.pivot.set(background.width / 2, background.height / 2);

    this.container.onmouseover = () => {
      this.container.scale.set(1.1);
    };
    this.container.onmouseout = () => {
      this.container.scale.set(1);
    };

    this.text = new PIXI.Text({
      text: this.type.toUpperCase(),
      style: {
        fontFamily: 'jmadh',
        fontSize: 32,
        fill: 0xa06c30,
      },
    });
    this.text.anchor.set(0.5);
    this.text.position.set(background.width / 2, background.height / 2);

    this.container.addChild(background, this.text);
    this.container.interactive = true;
    this.container.cursor = 'pointer';
  }
}

export class ActionManager extends BaseManager<ActionButton> {
  constructor() {
    super('ActionManager');
  }

  setActions(actions: Models.ActionType[]) {
    this.removeChildren();
    this.entities = {};
    this.container.zIndex = this.zIndex;

    actions.forEach((action, index) => {
      const button = new ActionButton(action);
      button.container.position.set(index * 140, 0);
      this.entities[action] = button;
      this.addChild(button.container);
    });

    const totalWidth = actions.length * 140 - 20;
    this.position.set(screen.width / 2 - totalWidth / 2, 900);
  }

  bindHandler(action: Models.ActionType, handler: () => void) {
    const button = this.entities[action];
    if (button) {
      button.container.on('click', handler);
    }
  }
}

class Message extends BaseEntity {
  private text: PIXI.Text;

  constructor(content: string) {
    super();
    this.text = new PIXI.Text({
      text: content,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 380,
      },
    });
  }

  getText() {
    return this.text;
  }
}

export class MessageManager extends BaseManager<Message> {
  private maxMessages: number;
  private messageContainer: Container;
  public mask: PIXI.Graphics;

  constructor() {
    super('MessageManager');

    this.maxMessages = 30;
    this.messageContainer = new Container();
    this.container = new Container();
    this.container.addChild(this.messageContainer);

    // Create a mask for scrolling
    this.mask = new PIXI.Graphics();
    this.mask.fill(0xffffff);
    this.mask.rect(0, 0, 400, 250);
    this.mask.fill();
    this.messageContainer.mask = this.mask;
    this.container.addChild(this.mask);

    // Set position to top-right corner
    this.container.position.set(window.innerWidth - 420, 20);

    // Enable scrolling
    this.container.interactive = true;
    this.container.on('wheel', this.onScroll.bind(this));
  }

  addMessage(content: string) {
    if (Object.keys(this.entities).length >= this.maxMessages) {
      // Remove the oldest message
      const oldestMessageKey = Object.keys(this.entities)[0];
      const oldestMessage = this.entities[oldestMessageKey];
      this.messageContainer.removeChild(oldestMessage.getText());
      delete this.entities[oldestMessageKey];
    }

    const message = new Message(content);
    const messageText = message.getText();
    messageText.position.set(10, Object.keys(this.entities).length * 20);
    this.messageContainer.addChild(messageText);
    this.entities[content] = message;

    // Adjust position of all messages
    this.adjustMessagePositions();
  }

  private adjustMessagePositions() {
    let yPos = 0;
    for (const key in this.entities) {
      const message = this.entities[key];
      message.getText().position.y = yPos;
      yPos += 20;
    }
  }

  private onScroll(event: WheelEvent) {
    const delta = event.deltaY > 0 ? -20 : 20;
    this.messageContainer.y += delta;

    // Ensure the container stays within bounds
    this.messageContainer.y = Math.min(0, this.messageContainer.y);
    const maxScroll = Math.max(0, this.messageContainer.height - 250);
    this.messageContainer.y = Math.max(-maxScroll, this.messageContainer.y);
  }
}
