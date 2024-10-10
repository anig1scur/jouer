export interface PlayerJSON {
  playerId: string;
  name: string;
  color: string;
  score: number;
  cardsInHand: number;
  isHost: boolean;
  isReady: boolean;
  myTurn: boolean;
}
