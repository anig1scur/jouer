
// @type('string')
// public id: string;

// @type('string')
// public name: string;

// @type([Card])
// public hand: Card[];

// @type([Card])
// public eaten: Card[];

// @type('number')
// public score: number;

// @type('number')
// public borrowedCount: number;

// @type('number')
// public jouerCount: number;

// @type('boolean')
// public isMyTurn: boolean;

export interface CardJSON {
  id: string;
  value: number;
  owner: string | null;
  state: string;
}

export interface PlayerJSON {
  id: string;
  name: string;
  hand: CardJSON[];
  eaten: CardJSON[];
  score: number;
  borrowedCount: number;
  jouerCount: number;
  isMyTurn: boolean;
}