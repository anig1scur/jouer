import {Constants, Models, Types} from '@jouer/common';
import {MapSchema, Schema, type} from '@colyseus/schema';
import {Player} from './Player';

export interface IGame {
  roomName: string;
  maxPlayers: number;
  mode: string;
  onWaitingStart: (message?: Models.MessageJSON) => void;
  onGameStart: (message?: Models.MessageJSON) => void;
  onGameEnd: (message?: Models.MessageJSON) => void;
}

export class Game extends Schema {
  @type('string')
  public state: Types.GameState = 'waiting';

  @type('string')
  public roomName: string;

  @type('number')
  public lobbyEndsAt: number;

  @type('number')
  public gameEndsAt: number;

  @type('number')
  public maxPlayers: number;

  @type('string')
  public mode: string;

  // Hidden fields
  private onWaitingStart: (message?: Models.MessageJSON) => void;

  private onGameStart: (message?: Models.MessageJSON) => void;

  private onGameEnd: (message?: Models.MessageJSON) => void;

  // Init
  constructor(attributes: IGame) {
    super();
    this.roomName = attributes.roomName;
    this.maxPlayers = attributes.maxPlayers;
    this.mode = attributes.mode;
    this.onWaitingStart = attributes.onWaitingStart;
    this.onGameStart = attributes.onGameStart;
    this.onGameEnd = attributes.onGameEnd;
  }

  // Update
  update(players: MapSchema<Player>) {
    switch (this.state) {
      case 'waiting':
        this.updateWaiting(players);
        break;
      case 'awarding':
        this.updateLobby(players);
        break;
      case 'playing':
        this.updateGame(players);
        break;
      default:
        break;
    }
  }

  updateWaiting(players: MapSchema<Player>) {
    // If there are two players, the game starts.
    if (countPlayers(players) > 1) {
      this.startLobby();
    }
  }

  updateLobby(players: MapSchema<Player>) {
    // If a player is alone, the game stops.
    if (countPlayers(players) === 1) {
      this.startWaiting();
      return;
    }

    // If the lobby is over, the game starts.
    if (this.lobbyEndsAt < Date.now()) {
      this.startGame();
    }
  }

  updateGame(players: MapSchema<Player>) {
    // If a player is alone, the game stops.
    if (gameEnd()) {
      this.onGameEnd();
      this.startWaiting();
      return;
    }

    // If the time is out, the game stops.
    if (this.gameEndsAt < Date.now()) {
      this.onGameEnd({
        type: 'timeout',
        from: 'server',
        ts: Date.now(),
        params: {},
      });
      this.startLobby();

      return;
    }

    if (gameEnd()) {
      const player = getWinningPlayer(players);
      if (player) {
        this.onGameEnd({
          type: 'won',
          from: 'server',
          ts: Date.now(),
          params: {
            name: player.name,
          },
        });
        this.startLobby();

        return;
      }
    }
  }

  // Start
  startWaiting() {
    this.lobbyEndsAt = undefined;
    this.gameEndsAt = undefined;
    this.state = 'waiting';
    this.onWaitingStart();
  }

  startLobby() {
    this.lobbyEndsAt = Date.now() + Constants.LOBBY_DURATION;
    this.gameEndsAt = undefined;
  }

  startGame() {
    this.lobbyEndsAt = undefined;
    this.gameEndsAt = Date.now() + Constants.GAME_DURATION;
    this.onGameStart();
  }
}

function gameEnd() {
  // Implement the game end logic here
  return false;
}

function countPlayers(players: MapSchema<Player>) {
  return players.size;
}

function getWinningPlayer(players: MapSchema<Player>): Player | null {
  let winningPlayer = null;

  players.forEach((player) => {
    if (!winningPlayer || player.score > winningPlayer.score) {
      winningPlayer = player;
    }
  });

  return winningPlayer;
}
