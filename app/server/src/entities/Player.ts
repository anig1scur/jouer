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
    console.log("Player's session ID:", client.sessionId, "Player's ID:", this.id)
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

  addCard(card: Card): void {
    this.hand.push(card);
  }

  playCards(cards: Card[]): void {
    cards.forEach((card) => {
      const index = this.hand.findIndex((c) => c.id === card.id);
      if (index !== -1) {
        this.hand.splice(index, 1);
      }
    });
  }

  borrowCard(card: Card, idx: number): void {
    this.hand.splice(idx, 1);
    this.jouerCount--;
  }

  eatCards(cards: Card[]): void {
    // this.score += cards.length;
  }

  incrementBorrowedCount(): void {
    // this.borrowedCount++;
  }
}
