import {Client} from 'colyseus';
import {filter, Schema, ArraySchema, type} from '@colyseus/schema';
import {Card} from './Card';
import {Models} from '@jouer/common';

export class Player extends Schema {
  @type('string')
  public id: string;

  @type('string')
  public name: string;

  @filter(function (this: Player, client: Client, value: ArraySchema<Card>) {
    if (client.sessionId === this.id) {
      console.log(
        "Player's session ID:",
        client.sessionId,
        this.hand.map((card) => card.id)
      );
    }
    return client.sessionId === this.id;
  })
  @type([Card])
  public hand: ArraySchema<Card> = new ArraySchema<Card>();

  @type('number')
  public score: number;

  @type('number')
  public cardCount: number;

  @type('number')
  public jouerCount: number;

  @type('string')
  public status: Models.PlayerStatus;

  @type('boolean')
  public ready: boolean;

  @type(Card)
  public borrowingCard: Card;

  public firstHand: boolean;

  // Init
  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
    this.hand = new ArraySchema<Card>();
    this.score = 0;
    this.cardCount = 0;
    this.jouerCount = 0;
  }

  clearHand(): void {
    this.hand = new ArraySchema<Card>();
  }

  tryBorrowCard(card: Card) {
    this.borrowingCard = card;
  }

  addCard(card: Card, idx?: number): void {
    card.owner = this.id;
    if (card.isFirstHandCard()) {
      this.firstHand = true;
      this.status = Models.PlayerStatus.thinking;
    }
    if (idx !== undefined) {
      this.hand.splice(idx, 0, card);
    } else {
      this.hand.push(card);
    }
    this.hand = new ArraySchema<Card>(...this.hand);
    console.log('Player', this.id, 'received card', card.id);
  }

  playCards(cards: Card[]): void {
    console.log(this.hand, 'playing !');

    const cardIdsToRemove = new Set(cards.map((card) => card.id));

    this.hand = new ArraySchema<Card>(...this.hand.filter((card) => !cardIdsToRemove.has(card.id)));
  }

  borrowCard(card: Card, idx: number): void {
    this.hand.splice(idx, 1);
    this.jouerCount--;
  }

  eatCards(cards: Card[]): void {
    // this.score += cards.length;
  }

  incrementBorrowedCount(): void {
    this.score++;
    // this.borrowedCount++;
  }
}
