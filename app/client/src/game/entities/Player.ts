import {Card} from './Card';
import {Models} from '@jouer/common/src';
import {BaseEntity} from '.';

export class Player extends BaseEntity {
  public id: string;
  public name: string;
  public ready: boolean;
  public score: number = 0;
  public jouerCount: number = 0;
  public cardCount: number = 0;
  public status: Models.PlayerStatus = Models.PlayerStatus.default;
  private hand: Card[] = [];

  constructor(id: string, name: string, cardCount: number, score: number) {
    super();

    this.id = id;
    this.name = name;
    this.cardCount = cardCount;
    this.score = score;
  }

  setHand(cards: Card[]) {
    this.hand = cards;
  }

  getHand(): Card[] {
    return this.hand;
  }

  public updateHand(newHand: number): void {
    this.cardCount = newHand;
  }

  public updateScore(newScore: number): void {
    this.score = newScore;
  }

  removeRandomCard(): Card {
    const randomIndex = Math.floor(Math.random() * this.hand.length);
    const card = this.hand[randomIndex];
    this.hand.splice(randomIndex, 1);
    return card;
  }

  removeCardsFromHand(cards: Card[]): void {
    cards.forEach((card) => {
      const index = this.hand.findIndex((c) => c.id === card.id);
      this.hand.splice(index, 1);
    });
  }

  addCardToHand(card: Card): void {
    this.hand.push(card);
  }
}
