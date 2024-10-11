// managers.ts

import { Container, Sprite } from 'pixi.js';
import { Card, Player, BaseEntity } from '../entities';

export class BaseManager<T extends BaseEntity> extends Container {
    protected container: Container;

    protected entities: { [key: string]: T };

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


export class CardsManager extends BaseManager<Card> {
  private playerHands: Map<string, Sprite[]> = new Map();
  private lastPlayedCards: Sprite[] = [];

  constructor() {
    super('Cards');
  }

  addPlayerHand(playerId: string, cards: Card[]) {
    // 为玩家创建手牌
  }

  updatePlayerHand(playerId: string, cards: Card[]) {
    // 更新玩家手牌的显示
  }

  setLastPlayedCards(cards: Card[]) {
    // 更新最后打出的牌的显示
  }

  // 其他用于管理卡牌显示的方法
}

export class PlayersManager extends BaseManager<Player> {
  constructor() {
      super('Players');
  }
}
