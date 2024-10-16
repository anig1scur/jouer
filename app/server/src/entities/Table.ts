import {ArraySchema,Schema, type} from '@colyseus/schema';
import {Player} from './Player';
import {Card} from './Card';

export class Table extends Schema {
  @type([Card])
  public cards: ArraySchema<Card> = new ArraySchema<Card>();

  constructor() {
    super();
  }

  canPlayCards(cards: Card[]) {
    return true;
  }

  setCards(cards: Card[]) {
    this.cards = new ArraySchema<Card>(...cards);
  }

  borrowCard(cardIndex: number) {
    const card = this.cards[cardIndex];
    this.setCards(this.cards.map((c, i) => (i === cardIndex ? null : c)).filter(Boolean));
    return card;
  }
}
