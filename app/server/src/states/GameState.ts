import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';
import { Player, Card, Deck, Table, Game } from '../entities';
import { Constants, Types, Models } from '@jouer/common';

export class GameState extends Schema {

  @type(Game)
  public game: Game;

  @type('string')
  public roomName: string;

  @type('number')
  public maxPlayers: number;

  @type('string')
  public state: 'waiting' | 'playing' | 'finished' = 'waiting';

  @type({ map: Player })
  public players: MapSchema<Player> = new MapSchema<Player>();

  @type(Deck)
  public deck: Deck;

  @type(Table)
  public table: Table;

  private currentPlayerIndex: number = 0;

  private onMessage: (message: Models.MessageJSON) => void;

  constructor (
    roomName: string,
    maxPlayers: number,
    onMessage: (message: Models.MessageJSON) => void,
  ) {
    super();

    this.roomName = roomName;
    this.maxPlayers = maxPlayers;
    this.onMessage = onMessage;
    this.game = new Game({
      roomName,
      maxPlayers,
      mode: 'jouer',
      onWaitingStart: this.handleWaitingStart,
      onLobbyStart: this.handleLobbyStart,
      onGameStart: this.handleGameStart,
      onGameEnd: this.handleGameEnd,
    });

    this.deck = new Deck();
    this.table = new Table();
  }

  update() {
    if (this.state === 'playing') {
      this.updateGameState();
    }
  }

  private updateGameState() {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.hand.length === 0) {
      this.endGame(currentPlayer);
    }
  }

  startGame() {
    if (this.players.size < 2) {
      throw new Error("Not enough players to start the game");
    }

    this.state = 'playing';
    this.dealInitialCards();

    this.onMessage({
      type: 'start',
      from: 'server',
      ts: Date.now(),
      params: {},
    });
  }

  get playerCount(): number {
    return this.players.size;
  }



  getPlayerHandSize(): number {

    if (this.playerCount === 3) {
      return 45 / 3;
    } else if (this.playerCount === 4) {
      return (45 - 1) / 4;
    } else if (this.playerCount === 5) {
      return 45 / 5;
    }
    return 0;
  }

  private dealInitialCards() {
    for (let i = 0;i < this.getPlayerHandSize();i++) {
      this.players.forEach(player => {
        player.addCard(this.deck.randomDraw());
      });
    }
  }

  playerAdd(id: string, name: string) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error("Maximum number of players reached");
    }

    const player = new Player(id, name);
    this.players.set(id, player);
    console.log(`Player ${name} joined the game`);

    this.onMessage({
      type: 'joined',
      from: 'server',
      ts: Date.now(),
      params: { name: name },
    });

    if (this.players.size === this.maxPlayers) {
      this.startGame();
    }
    // this.players.onAdd
  }

  playerRemove(id: string) {
    const player = this.players.get(id);
    if (player) {
      this.onMessage({
        type: 'left',
        from: 'server',
        ts: Date.now(),
        params: { name: player.name },
      });
      this.players.delete(id);
    }
  }


  playCards(playerId: string, cards: Card[]) {
    const player = this.players.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("Not the player's turn");
    }

    if (this.table.canPlayCards(cards)) {
      player.playCards(cards);
      this.table.addCards(cards);
      this.nextTurn();
    } else {
      throw new Error("Invalid play");
    }
  }

  borrowCard(playerId: string, cardId: string) {
    const player = this.players.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("Not the player's turn");
    }

    const card = this.table.borrowCard(player, cardId);
    if (card) {
      this.getCurrentPlayer().incrementBorrowedCount();
      this.nextTurn();
    } else {
      throw new Error("Cannot borrow this card");
    }
  }

  private nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.size;
    const nextPlayer = this.getCurrentPlayer();
    nextPlayer.isMyTurn = true;

    // this.onMessage({
    //   type: ''
    //   from: 'server',
    //   ts: Date.now(),
    //   params: { playerId: nextPlayer.id },
    // });
  }

  private getCurrentPlayer(): Player {
    return Array.from(this.players.values())[this.currentPlayerIndex];
  }

  private endGame(winner: Player) {
    this.state = 'finished';
    this.onMessage({
      type: 'stop',
      from: 'server',
      ts: Date.now(),
      params: { winnerId: winner.id, winnerName: winner.name },
    });
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
  };

  private handleGameStart = () => {
    this.onMessage({
      type: 'start',
      from: 'server',
      ts: Date.now(),
      params: {},
    });
  };

  private handleGameEnd = (message?: Models.MessageJSON) => {
    if (message) {
      this.onMessage(message);
    }

    this.onMessage({
      type: 'stop',
      from: 'server',
      ts: Date.now(),
      params: {},
    });
  };

}
