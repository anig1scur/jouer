import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('string')
  public playerId: string;

  @type('string')
  public name: string;

  @type('string')
  public color: string;

  @type('number')
  public score: number = 0;

  @type('number')
  public cardsInHand: number = 0;

  @type('boolean')
  public isHost: boolean = false;

  @type('boolean')
  public isReady: boolean = false;

  @type('boolean')
  public myTurn: boolean = false;

  // Init
  constructor (
    playerId: string,
    name: string,
  ) {
    super();
    this.playerId = playerId;
    this.name = validateName(name);

  }

}
const validateName = (name: string) => name.trim().slice(0, 16);
