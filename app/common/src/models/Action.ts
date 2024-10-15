export type ActionType = 'borrow' | 'play' | 'jouer' | 'ready';

export interface ActionJSON {
  type: ActionType;
  ts: number;
  playerId: string;
  value: any;
}
