// managers.ts
import * as PIXI from 'pixi.js';
import {Container, Sprite} from 'pixi.js';
import {BaseEntity} from '../entities';

import {Card} from '../entities/Card';
import {Player} from '../entities/Player';
import {Models} from '@jouer/common/src';

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
  constructor() {
    super('hand');
  }

  setCards(cards: Card[]) {
    this.removeChildren();
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

  reverseCards() {}
}

export class TableManager extends BaseManager<Card> {
  constructor() {
    super('table');
  }

  setCards(cards: Card[]) {
    this.removeChildren();
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

  reverseCards() {}
}

export class PlayersManager extends BaseManager<Player> {
  constructor() {
    super('Players');
  }
}

class ActionButton extends BaseEntity {
  private text: PIXI.Text;

  constructor(type: Models.ActionType) {
    super();
    this.container = new Container();
    this.container.name = `ActionButton_${type}`;

    const background = new Sprite(PIXI.Texture.WHITE);
    background.width = 120;
    background.height = 40;
    background.tint = 0x3498db;

    this.text = new PIXI.Text({
      text: type.toUpperCase(),
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff,
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

    actions.forEach((action, index) => {
      const button = new ActionButton(action);
      button.container.position.set(index * 140, 0);
      this.entities[action] = button;
      this.addChild(button.container);
    });

    // Center the action buttons
    const totalWidth = actions.length * 140 - 20;
    this.position.set((800 - totalWidth) / 2, 550);
  }

  addClickHandler(action: Models.ActionType, handler: () => void) {
    const button = this.entities[action];
    if (button) {
      button.container.on('click', handler);
    }
  }
}
