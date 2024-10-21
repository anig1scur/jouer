export type ActionType = 'borrow' | 'play' | 'jouer' | 'ready' | 'ack';

export interface ActionJSON {
  type: ActionType;
  ts: number;
  playerId: string;
  value: any;
}
