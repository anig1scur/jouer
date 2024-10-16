import {Schema, type, ArraySchema} from '@colyseus/schema';
import {Card} from './Card';

export class Deck extends Schema {
  @type([Card])
  public cards: ArraySchema<Card> = new ArraySchema<Card>();

  @type([Card])
  public discards: ArraySchema<Card> = new ArraySchema<Card>();

  constructor() {
    super();
  }

  initialize(playerCount: number): void {
    this.generateCards(playerCount, true);
  }

  generateCards(playerCount, shuffle?: boolean): void {
    let iStart = playerCount === 2 ? 9 : 10;

    for (let i = iStart; i >= 2; i--) {
      for (let j = i - 1; j >= 1; j--) {
        this.cards.push(new Card(`${i}-${j}`, [i, j]));
      }
    }
    console.log('Shuffling cards', shuffle);
    if (shuffle) {
      this.shuffleCards();
    }
  }

  shuffleCards(): void {
    for (let i = 0; i < this.cards.length; i++) {
      if (Math.random() < 0.5) {
        this.cards[i].reverse();
      }
    }

    this.cards.sort(() => Math.random() - 0.5);
  }

  randomDraw(): Card {
    if (this.cards.length === 0) {
      throw new Error('No more cards in the deck');
    }

    return this.cards.pop()!;
  }

  drawCard(card: Card): void {
    const index = this.cards.findIndex((c) => c.id === card.id);
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
  }

  isSequence(cards: Card[]): boolean {
    const cardValues = cards.map((card) => card.value);

    for (let i = 1; i < cardValues.length; i++) {
      if (cardValues[i] !== cardValues[i - 1] + 1 && cardValues[i] !== cardValues[i - 1] - 1) {
        return false;
      }
    }
    return true;
  }

  isValidPlay(cards: Card[]): boolean {
    if (this.getCardsType(cards) === 'invalid') {
      return false;
    }
    return true;
  }

  biggerThan(cards1: Card[], cards2: Card[]): boolean {
    return this.compareTwoCardList(cards1, cards2) > 0;
  }

  compareTwoCardList(cards1: Card[], cards2: Card[]): number {
    // Rule 1: More cards beat fewer cards
    if (cards1.length !== cards2.length) {
      console.log('length', cards1.length, cards2.length)
      return cards1.length - cards2.length;
    }

    const type1 = this.getCardsType(cards1);
    const type2 = this.getCardsType(cards2);

    // Rule 2: Same > Sequence > Single
    const typeOrder = ['single', 'sequence', 'same'];
    console.log('type', type1, type2)

    if (type1 !== type2) {

      return typeOrder.indexOf(type1) - typeOrder.indexOf(type2);
    }

    // Rule 3: Compare by sum value
    const sum1 = cards1.reduce((acc, card) => acc + card.value, 0);
    const sum2 = cards2.reduce((acc, card) => acc + card.value, 0);
    return sum1 - sum2;
  }

  getCardsType(cards: Card[]): string {
    if (cards.length === 0) return 'invalid';
    if (cards.length === 1) return 'single';

    if (new Set(cards.map((card) => card.value)).size === 1) return 'same';
    if (this.isSequence(cards)) return 'sequence';

    return 'invalid';
  }
}
