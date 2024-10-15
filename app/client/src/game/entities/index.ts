import {AnimatedSprite, Container, Graphics, Texture} from 'pixi.js';

import {Constants, Models} from '@jouer/common';
import {TextSprite} from '../sprites';
import {Player as PlayerSprite} from './Player';
import {Card} from './Card';
export interface BaseProps {
  x: number;
  y: number;
  radius: number;
  textures: Texture[];
  zIndex?: number;
}

export class BaseEntity {
  container: Container;

  sprite: AnimatedSprite | TextSprite | Graphics;

  debug?: Graphics;

  constructor(props: BaseProps) {
    this.container = new Container();
    this.sprite = new Graphics();
    this.sprite.fill(0x22aacc).circle(400, 200, 80).fill();
    this.sprite.position.set(props.radius, props.radius);
    this.sprite.width = props.radius * 2;
    this.sprite.height = props.radius * 2;
    // this.sprite.animationSpeed = 0.1;
    this.sprite.zIndex = props.zIndex || 0;
    // this.sprite.play();
    this.container.addChild(this.sprite);

    // Debug
    if (Constants.DEBUG) {
      this.debug = new Graphics();
      this.debug.setStrokeStyle({
        color: 'red',
        width: 1,
      });
      this.debug.circle(this.container.width / 2, this.container.height / 2, this.container.width / 2);
      this.debug.rect(0, 0, this.container.width, this.container.height);
      this.debug.fill();
      this.container.addChild(this.debug);
    }

    // Container
    this.container.pivot.set(this.container.width / 2, this.container.height / 2);
    this.container.x = props.x;
    this.container.y = props.y;
    this.container.sortChildren();
  }

  // Setters
  set visible(visible: boolean) {
    this.container.visible = visible;
  }

  // Getters
  get visible(): boolean {
    return this.container.visible;
  }
}

export class Player extends BaseEntity {
  public id: string;
  public name: string;
  private hand: Card[] = [];
  public score: number = 0;
  public jouerCount: number = 0;
  public cardCount: number = 0;
  public status: Models.PlayerStatus = Models.PlayerStatus.default;

  constructor(props: BaseProps, id: string, name: string) {
    super(props);
    this.id = id;
    this.name = name;
    // const sprite = new PlayerSprite(
  }

  setHand(cards: Card[]) {
    this.hand = cards;
  }

  getHand(): Card[] {
    return this.hand;
  }

  removeCardsFromHand(cards: Card[]) {
    // 实现从手牌中移除特定卡牌的逻辑
  }

  addCardToHand(card: Card) {
    this.hand.push(card);
  }

  removeRandomCard(): Card {
    // 实现从手牌中随机移除一张卡牌的逻辑
    const index = Math.floor(Math.random() * this.hand.length);
    return this.hand.splice(index, 1)[0];
  }
}

export class Deck extends BaseEntity {
  private cards: Card[] = [];

  constructor() {
    super({x: 0, y: 0, textures: [], zIndex: 1, radius: 10});
  }

  shuffle() {
    // 实现洗牌算法
  }

  draw(count: number): Card[] {
    // 从牌堆顶部抽取指定数量的牌
    return this.cards.splice(0, count);
  }

  remainingCards(): number {
    return this.cards.length;
  }
}
