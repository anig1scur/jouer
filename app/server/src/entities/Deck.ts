import { Schema, type } from '@colyseus/schema';
import { Card } from './Card';


export class Deck extends Schema {
  // cards: Card[];
  // discards: Card[];

  @type([Card])
  public cards: Card[];

  @type([Card])
  public discards: Card[];


  constructor () {
    super();
    this.cards = [];
    this.discards = [];
  }

  initialize(): void {
    this.generateCards(true);
  }

  generateCards(shuffle: boolean): void {
    this.cards = [];
    for (let i = 1;i <= 10;i++) {
      for (let j = i + 1;j <= 10;j++) {
        this.cards.push(new Card(`${ i }-${ j }`, i));
        this.cards.push(new Card(`${ j }-${ i }`, j));
      }
    }
    if (shuffle) {
      this.shuffleCards();
    }
  }

  shuffleCards(): void {
    for (let i = this.cards.length - 1;i > 0;i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  randomDraw(): Card {
    if (this.cards.length === 0) {
      throw new Error("No more cards in the deck");
    }
    return this.cards.pop()!;
  }

  drawCard(card: Card): void {
    const index = this.cards.findIndex(c => c.id === card.id);
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
  }


  isSequence(cards: Card[]): boolean {
    const cardValues = cards.map(card => card.value);

    for (let i = 1;i < cardValues.length;i++) {
      if ((cardValues[i] !== cardValues[i - 1] + 1) || cardValues[i] !== cardValues[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }

  compareTwoCardList(cards1: Card[], cards2: Card[]): number {
    // Rule 1: More cards beat fewer cards
    if (cards1.length !== cards2.length) {
      return cards1.length - cards2.length;
    }

    const type1 = this.getCardsType(cards1);
    const type2 = this.getCardsType(cards2);

    // Rule 2: Same > Sequence > Single
    const typeOrder = ['single', 'sequence', 'same'];
    if (type1 !== type2) {
      return typeOrder.indexOf(type1) - typeOrder.indexOf(type2);
    }

    // Rule 3: Compare by sum value
    const sum1 = cards1.reduce((acc, card) => acc + card.value, 0);
    const sum2 = cards2.reduce((acc, card) => acc + card.value, 0);
    return sum1 - sum2;
  }

  getCardsType(cards: Card[]): string {
    if (cards.length === 1) return 'single';
    if (cards.every(card => card.value === cards[0].value)) return 'same';
    if (this.isSequence(cards)) return 'sequence';

    return 'invalid';
  }
}
