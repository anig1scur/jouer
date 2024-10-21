export type MessageType =
  | 'waiting'
  | 'start'
  | 'stop'
  | 'joined'
  | 'won'
  | 'left'
  | 'timeout'
  | 'borrow'
  | 'jouer'
  | 'ack'
  | 'turn';

export interface MessageJSON {
  type: MessageType;
  ts: number;
  from: string;
  params: any;
}
