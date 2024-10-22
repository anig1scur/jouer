export interface CardJSON {
  id: string;
  values: number[];
  owner: string | null;
  state: string;
}

export enum PlayerStatus {
  default = 'default',
  thinking = 'thinking',
  laughing = 'laughing',
  crying = 'crying',
}

export interface PlayerJSON {
  id: string;
  name: string;
  score: number;
  ready?: boolean;
  cardCount: number;
  jouerCount: number;
  borrowedCount: number;
  eatCount: number;
  hand?: CardJSON[];
  status?: PlayerStatus;
}


export interface TableJSON {
  cards: CardJSON[];
}

export interface DeckJSON {
  cards: CardJSON[];
  discard: CardJSON[];
}
