import {Schema, type, MapSchema, ArraySchema, filter} from '@colyseus/schema';
import {Client} from 'colyseus';
import {Player, Card, Deck, Table, Game} from '../entities';
import {Constants, Types, Models} from '@jouer/common';

export class GameState extends Schema {
  @type(Game)
  public game: Game;

  @type({map: Player})
  public players: MapSchema<Player> = new MapSchema<Player>();

  @type(Deck)
  public deck: Deck;

  @type(Table)
  public table: Table;

  @type(['string'])
  public messages: ArraySchema<string> = new ArraySchema<string>();

  @type('string')
  public activePlayer: string = '';

  private onMessage: (message: Models.MessageJSON) => void;

  constructor(roomName: string, maxPlayers: number, onMessage: (message: Models.MessageJSON) => void) {
    super();

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
    // this.updateGameState();
    // if (this.state === 'playing') {
    //   this.updateGameState();
    // }
  }

  private updateGameState() {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.cardCount === 0) {
      this.endGame(currentPlayer);
    }
  }

  startGame() {
    if (this.players.size < 2) {
      throw new Error('Not enough players to start the game');
    }

    console.log('startGame');
    this.initCards();

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
    if (this.playerCount === 2) {
      return (45 - 9) / 2;
    } else if (this.playerCount === 3) {
      return 45 / 3;
    } else if (this.playerCount === 4) {
      return (45 - 1) / 4;
    } else if (this.playerCount === 5) {
      return 45 / 5;
    }
    return 0;
  }

  private initCards() {
    this.deck.initialize(this.playerCount);
    this.players.forEach((player) => {
      player.clearHand();
      console.log(`Dealing cards to ${player.id} ${player.name}`);
      for (let i = 0; i < this.getPlayerHandSize(); i++) {
        player.addCard(this.deck.randomDraw());
      }
      if (player.firstHand) {
        console.log(`Dealing first hand card to ${player.id} ${player.name}`);
        this.activePlayer = player.id;
      }
    });
  }

  playerAdd(id: string, name: string) {
    if (this.players.size >= this.game.maxPlayers) {
      throw new Error('Maximum number of players reached');
    }

    const player = new Player(id, name);
    this.players.set(id, player);

    this.onMessage({
      type: 'joined',
      from: 'server',
      ts: Date.now(),
      params: {name: name},
    });

    // if (this.players.size === this.game.maxPlayers) {
    //   this.startGame();
    // }
  }

  playerRemove(id: string) {
    const player = this.players.get(id);
    if (player) {
      this.onMessage({
        type: 'left',
        from: 'server',
        ts: Date.now(),
        params: {name: player.name},
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
      throw new Error('Invalid play');
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
      throw new Error('Cannot borrow this card');
    }
  }

  private nextTurn() {
    const idx = Array.from(this.players.keys()).indexOf(this.activePlayer);
    const nextIdx = (idx + 1) % this.players.size;
    this.activePlayer = Array.from(this.players.keys())[nextIdx];
  }

  private getCurrentPlayer(): Player {
    return this.players.get(this.activePlayer);
  }

  private endGame(winner: Player) {
    this.game.state = 'awarding';
    this.onMessage({
      type: 'stop',
      from: 'server',
      ts: Date.now(),
      params: {winnerId: winner.id, winnerName: winner.name},
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

  private handleLobbyStart = () => {};

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
