import {Client, Room} from 'colyseus';
import {Constants, Maths, Models, Types} from '@jouer/common';
import {GameState} from '../states/GameState';
import { Player } from '../entities';

export class GameRoom extends Room<GameState> {
  //
  // Lifecycle
  //
  onCreate(options: Types.IRoomOptions) {
    // Set max number of clients for this room
    this.maxClients = Maths.clamp(options.roomMaxPlayers || 0, Constants.ROOM_PLAYERS_MIN, Constants.ROOM_PLAYERS_MAX);

    const playerName = options.playerName.slice(0, Constants.PLAYER_NAME_MAX);
    const roomName = options.roomName.slice(0, Constants.ROOM_NAME_MAX);

    // Init Metadata
    this.setMetadata({
      playerName,
      roomName,
      roomMaxPlayers: this.maxClients,
      mode: options.mode,
    });

    // Init State
    this.setState(new GameState(roomName, this.maxClients, this.handleMessage));

    this.setSimulationInterval(() => this.handleTick());

    console.log(`${new Date().toISOString()} [Create] player=${playerName} room=${roomName}max=${this.maxClients} `);
    // Listen to messages from clients
    this.onMessage('*', (client: Client, type: string | number, message: Models.ActionJSON) => {
      const playerId = client.sessionId;

      // Validate which type of message is accepted
      switch (type) {
        case 'borrow':
        case 'jouer':
          this.state.tryGetCard(playerId, message.value, type);
          break;
        case 'ack':
          this.state.ackGetCard(playerId, message.value.cardIdx, message.value.inverse, message.value.targetIdx);
          break;
        case 'play':
          this.onPlay(client, message);
          break;
        case 'ready':
          this.onReady(client);
          break;
        default:
          break;
      }
    });
  }

  onPlay(client: Client, message: Models.ActionJSON) {
    const playerId = client.sessionId;
    this.state.playCards(
      playerId,
      this.state.activePlayer.hand
        .map(
          (card, i) =>
            message.value
              .split(',')
              .map((x) => Number(x))
              .includes(i) && card
        )
        .filter(Boolean)
    );
  }

  onReady(client: Client) {
    const player = this.state.players.get(client.sessionId);
    player.ready = true;
    if (this.state.game.isWaiting) {
      if (this.state.players.size === this.state.game.maxPlayers && this.allPlayersReady()) {
        console.log(`${new Date().toISOString()} [Ready] id=${client.sessionId} player=${player.name}`);
        this.state.startGame();
      }
    }
  }

  onJoin(client: Client, options: Types.IPlayerOptions) {
    console.log(`${new Date().toISOString()} [Join] id=${client.sessionId} player=${options.playerName}`);
    this.state.playerAdd(client.sessionId, options.playerName);
  }

  onLeave(client: Client) {
    console.log(`${new Date().toISOString()} [Leave] id=${client.sessionId}`);
    this.state.playerRemove(client.sessionId);
  }

  allPlayersReady() {
    return Array.from(this.state.players.values()).every((player: Player) => player.ready);
  }

  //
  // Handlers
  //
  handleTick = () => {
    this.state.update();
  };

  handleMessage = (message: Models.MessageJSON) => {
    this.broadcast(message.type, message);
  };
}
