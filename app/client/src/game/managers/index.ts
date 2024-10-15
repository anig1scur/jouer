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

  getSelectedCards() {
    return Object.values(this.entities).filter((card) => card.selected);
  }

  reverseCards() {}
}

export class TableManager extends BaseManager<Card> {
  constructor() {
    super('table');
  }

  setCards(cards: Card[]) {
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

    actions.forEach((action, index) => {
      const button = new ActionButton(action);
      button.container.position.set(index * 140, 0);
      this.entities[action] = button;
      this.addChild(button.container);
    });

    // Center the action buttons
    const totalWidth = actions.length * 140 - 20;
    this.position.set(screen.width / 2 - totalWidth / 2, screen.height - 100);
  }

  bindHandler(action: Models.ActionType, handler: () => void) {
    const button = this.entities[action];
    if (button) {
      button.container.on('click', handler);
    }
  }
}
