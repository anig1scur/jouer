import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Game, Player } from '../entities';
import { Models, } from '@jouer/common';

export class GameState extends Schema {
  @type(Game)
  public game: Game;

  @type({ map: Player })
  public players: MapSchema<Player> = new MapSchema<Player>();

  private actions: Models.ActionJSON[] = [];

  private onMessage: (message: Models.MessageJSON) => void;

  //
  // Init
  //
  constructor (
    roomName: string,
    maxPlayers: number,
    mode: string,
    onMessage: (message: Models.MessageJSON) => void,
  ) {
    super();

    // Game
    this.game = new Game({
      roomName,
      maxPlayers,
      mode,
      onWaitingStart: this.handleWaitingStart,
      onLobbyStart: this.handleLobbyStart,
      onGameStart: this.handleGameStart,
      onGameEnd: this.handleGameEnd,
    });

    // Callback
    this.onMessage = onMessage;
  }

  //
  // Updates
  //
  update() {
    this.updateGame();
    this.updatePlayers();
  }

  playerPushAction(action: Models.ActionJSON) {
    this.actions.push(action);
  }

  private handleWaitingStart = () => {
    this.onMessage({
      type: 'waiting',
      from: 'server',
      ts: Date.now(),
      params: {},
    });
  };

  private handleLobbyStart = () => {

  }

  private handleGameStart = () => {

    this.onMessage({
      type: 'start',
      from: 'server',
      ts: Date.now(),
      params: {},
    });
  }

  private handleGameEnd = () => {

    this.onMessage({
      type: 'stop',
      from: 'server',
      ts: Date.now(),
      params: {},
    }
    )
  }



  private updateGame() {
    this.game.update(this.players);
  }

  private updatePlayers() {
    let action: Models.ActionJSON;

    while (this.actions.length > 0) {
      action = this.actions.shift();

      switch (action.type) {
        case 'borrow':
          this.playerBorrow(action.playerId, action.ts, action.value.cards);
          break;
        case 'play':
          this.playerPlay(action.playerId, action.ts, action.value.cards);
          break;
        case 'jouer':
          this.playerJouer(action.playerId, action.ts, action.value.cardId);
          break;
        default:
          break;
      }
    }
  }

  private playerBorrow(playerId: string, ts: number, cardId: string) {
    const player = this.players.get(playerId);

    if (player) {
      // player.borrowCard(ts, cardId);
    }
  }

  private playerPlay(playerId: string, ts: number, cards: string[]) {
    const player = this.players.get(playerId);

    if (player) {
      // player.playCards(ts, cards);
    }
  }

  private playerJouer(playerId: string, ts: number, cardId: string) {
    const player = this.players.get(playerId);

    if (player) {
      // player.jouerCard(ts, cardId);
    }
  }

  playerAdd(playerId: string, playerName: string) {
    this.players.set(playerId, new Player(playerId, playerName));
  }

  playerRemove(playerId: string) {
    this.players.delete(playerId);
  }

}
