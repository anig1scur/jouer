export type MessageType =
  | 'waiting'
  | 'start'
  | 'stop'
  | 'joined'
  | 'won'
  | 'left'
  | 'timeout'
  | 'tryBorrow'
  | 'borrow'
  | 'jouer'
  | 'turn';

export interface MessageJSON {
  type: MessageType;
  ts: number;
  from: string;
  params: any;
}
