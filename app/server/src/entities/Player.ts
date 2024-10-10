import { Schema, type } from '@colyseus/schema';
import { Card } from './Card';


export class Player extends Schema {

  @type('string')
  public id: string;

  @type('string')
  public name: string;

  @type([Card])
  public hand: Card[];

  @type([Card])
  public eaten: Card[];

  @type('number')
  public score: number;

  @type('number')
  public borrowedCount: number;

  @type('number')
  public jouerCount: number;

  @type('boolean')
  public isMyTurn: boolean;

  // Init
  constructor (id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
    this.hand = [];
    this.eaten = [];
    this.score = 0;
    this.borrowedCount = 0;
    this.jouerCount = 0;
    this.isMyTurn = false;
  }

  addCard(card: Card): void {
    this.hand.push(card);
  }

  playCards(cards: Card[]): void {
    cards.forEach(card => {
      const index = this.hand.findIndex(c => c.id === card.id);
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
    this.eaten.push(...cards);
    this.score += cards.length;
  }

  incrementBorrowedCount(): void {
    this.borrowedCount++;
  }
}
