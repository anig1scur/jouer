import { Schema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Deck } from './Deck';
import { Card } from './Card';


export class Table extends Schema {

  @type([Card])
  public cards: Card[];

  constructor () {
    super()
  }

  canPlayCards(cards: Card[]) {
    return true
  }

  addCards(cards: Card[]) {
    this.cards = cards;
  }

  borrowCard(player: Player, cardId: string): Card {

  }
}
