import {Constants, Models, Types} from '@jouer/common';
import {MapSchema, Schema, type} from '@colyseus/schema';
import {Player} from './Player';

export interface IGame {
  mode?: string;
  roomName: string;
  maxPlayers: number;
  onWaitingStart: (message?: Models.MessageJSON) => void;
  onGameStart: (message?: Models.MessageJSON) => void;
  onGameEnd: (message?: Models.MessageJSON) => void;
}

export class Game extends Schema {
  @type('string')
  public state: Types.GameState;

  @type('string')
  public roomName: string;

  @type('number')
  public awardEndsAt: number;

  @type('number')
  public gameEndsAt: number;

  @type('number')
  public maxPlayers: number;

  @type('string')
  public mode: string = 'jouer';
  // only one normal mode for now

  private onWaitingStart: (message?: Models.MessageJSON) => void;

  private onGameStart: (message?: Models.MessageJSON) => void;

  private onGameEnd: (message?: Models.MessageJSON) => void;

  get isWaiting(): boolean {
    return this.state === 'waiting';
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isAwarding(): boolean {
    return this.state === 'awarding';
  }

  // Init
  constructor(attributes: IGame) {
    super();
    this.mode = attributes.mode;
    this.roomName = attributes.roomName;
    this.maxPlayers = attributes.maxPlayers;
    this.onWaitingStart = attributes.onWaitingStart;
    this.onGameStart = attributes.onGameStart;
    this.onGameEnd = attributes.onGameEnd;
    this.state = 'waiting';
  }

  // Update
  update(players: MapSchema<Player>) {
    switch (this.state) {
      case 'waiting':
        this.updateWaiting(players);
        break;
      case 'awarding':
        this.updateAwarding(players);
        break;
      case 'playing':
        this.updateGame(players);
        break;
      default:
        break;
    }
  }

  updateWaiting(players: MapSchema<Player>) {}

  updateAwarding(players: MapSchema<Player>) {
    // If a player is alone, the game stops.
    if (countPlayers(players) === 1) {
      this.startWaiting();
      return;
    }

    // If the award is over, the game starts.
    if (this.awardEndsAt && this.awardEndsAt < Date.now()) {
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
    if (this.gameEndsAt && this.gameEndsAt < Date.now()) {
      this.onGameEnd({
        type: 'timeout',
        from: 'server',
        ts: Date.now(),
        params: {},
      });
      this.startAwarding();

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
        this.startAwarding();

        return;
      }
    }
  }

  // Start
  startWaiting() {
    if (this.isWaiting) {
      return;
    }

    this.state = 'waiting';
    this.awardEndsAt = undefined;
    this.gameEndsAt = undefined;
    this.onWaitingStart();
  }

  startAwarding() {
    if (this.isAwarding) {
      return;
    }

    this.state = 'awarding';
    this.awardEndsAt = Date.now() + Constants.AWARDING_DURATION;
    this.gameEndsAt = undefined;
  }

  startGame() {
    if (this.isPlaying) {
      return;
    }

    this.state = 'playing';
    this.awardEndsAt = undefined;
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
