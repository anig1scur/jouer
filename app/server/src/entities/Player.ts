import {Client} from 'colyseus';
import {filter, Schema, ArraySchema, type} from '@colyseus/schema';
import {Card} from './Card';
import {Models} from '@jouer/common';

export class Player extends Schema {
  @type('string')
  public id: string;

  @type('string')
  public name: string;

  // 暂时注释掉， filter 会导致 borrow 的牌重新发到 table 时其他 player 看不见...
  // @filter(function (this: Player, client: Client, value: ArraySchema<Card>) {
  //   if (this.borrowingCard) {
  //     console.log("borrowingCard filter", this.borrowingCard.id, value.map((card) => card.id));
  //     return true;
  //   }
  //   return client.sessionId === this.id;
  // })
  @type([Card])
  public hand: ArraySchema<Card> = new ArraySchema<Card>();

  @type('number')
  public score: number = 0;

  @type('number')
  public cardCount: number = this.hand.length;

  @type('number')
  public jouerCount: number = 3;

  @type('string')
  public status: Models.PlayerStatus;

  @type('boolean')
  public ready: boolean;

  @type(Card)
  public borrowingCard: Card;

  @type('string')
  public lastAction: string;

  public firstHand: boolean;

  // Init
  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  clearHand(): void {
    this.hand = new ArraySchema<Card>();
  }

  tryGetCard(card: Card, action: string): void {
    this.borrowingCard = card;
    this.lastAction = action;
  }

  addCard(card: Card, idx?: number): void {
    card.owner = this.id;
    if (card.isFirstHandCard()) {
      this.firstHand = true;
      this.status = Models.PlayerStatus.thinking;
    }

    console.log('inserting card', ...card.values);

    // colyseus schema 有 bug ，会丢失 idx 后的一个元素
    if (idx !== undefined) {
      this.hand.splice(idx, 0, card);
    } else {
      this.hand.push(card);
    }

    this.hand = new ArraySchema<Card>(...this.hand);
    this.cardCount = this.hand.length;

    console.log('Player', this.id, 'received card', card.id);
  }

  playCards(cards: Card[]): void {
    const cardIdsToRemove = new Set(cards.map((card) => card.id));
    this.hand = new ArraySchema<Card>(...this.hand.filter((card) => !cardIdsToRemove.has(card.id)));
    this.cardCount = this.hand.length;
  }

  borrowCard(card: Card, idx: number): void {
    this.hand.splice(idx, 1);
    this.jouerCount--;
  }

  jouerCard(card: Card, idx: number): void {
  }

  eatCards(cards: Card[]): void {
    this.score += cards.length;
    this.lastAction = "play"
  }

  incrementBorrowedCount(): void {
    this.score++;
    // this.borrowedCount++;
  }
}
