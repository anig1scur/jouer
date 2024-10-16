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

  borrowCard(player: Player, cardId: string): Card {
    return new Card('0-0', [0, 0]);
  }
}
