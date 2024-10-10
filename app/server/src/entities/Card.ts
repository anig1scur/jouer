import { Schema, type } from '@colyseus/schema';

export class Card extends Schema {

  @type('string')
  public id: string;

  @type('number')
  public value: number;

  @type('string')
  public owner: string | null;

  @type('string')
  public state: string;

  // Init
  constructor (id: string, value: number) {
    super();
    this.id = id;
    this.value = value;
    this.owner = null;
    this.state = 'in_deck';
  }

  getPossibleValues(): number[] {
    const [v1, v2] = this.id.split('_');
    return [parseInt(v1), parseInt(v2)];
  }

}
