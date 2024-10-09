export type ActionType = 'borrow' | 'play' | 'jouer'

export interface ActionJSON {
  type: ActionType;
  ts: number;
  playerId: string;
  value: any;
}
