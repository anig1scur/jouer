import { Schema, type } from '@colyseus/schema';

export class Card extends Schema {

  @type('string')
  public id: string;

  @type(['number'])
  public values: number[];

  @type('string')
  public owner: string | null;

  @type('string')
  public state: string;

  // Init
  constructor (id: string, values: number[]) {
    super();
    this.id = id;
    this.values = values;
    this.owner = null;
    this.state = 'in_deck';
  }

}
