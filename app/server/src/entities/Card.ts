import {Schema, type} from '@colyseus/schema';

export class Card extends Schema {
  @type('string')
  public id: string;

  @type(['number'])
  public values: Array<number> = new Array<number>();

  @type('number')
  public value: number;

  @type('string')
  public owner?: string;

  @type('string')
  public state: string;

  getValues(): number[] {
    return this.values;
  }

  // Init
  constructor(id: string, values: number[], owner?: string) {
    super();
    this.id = id;
    this.values = values;
    this.value = values[0];
    this.owner = owner;
    this.state = 'in_deck';
  }

  isFirstHandCard(): boolean {
    // [1,2] [2,1]
    return this.values.reduce((a, b) => a + b) === 3;
  }

  reverse() {
    this.values.reverse();
    this.value = this.values[0];
  }
}
