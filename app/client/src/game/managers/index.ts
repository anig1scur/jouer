// managers.ts

import {Container, Sprite} from 'pixi.js';
import {BaseEntity} from '../entities';

import {Hand, Card} from '../entities/Card';
import {Player} from '../entities/Player';

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
    super('Cards');
  }

  setCards(cards: Card[]) {
    this.removeChildren();
    this.position.set(100, 400);
    const totalCards = cards.length;
    const totalAngle = Math.PI / 6;
    cards.forEach((card, index) => {
      const angleStep = totalAngle / totalCards;
      const angle = -totalAngle / 2 + index * angleStep;
      card.container.rotation = angle;
      card.container.position.set(index * 100, Math.abs(angle) * 100);
      this.addChild(card.container);
    });
  }
}

export class PlayersManager extends BaseManager<Player> {
  constructor() {
    super('Players');
  }
}
