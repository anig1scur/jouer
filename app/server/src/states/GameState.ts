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
  public activePlayerId: string = '';

  get activePlayer(): Player {
    return this.players.get(this.activePlayerId);
  }

  private onMessage: (message: Models.MessageJSON) => void;

  constructor(roomName: string, maxPlayers: number, onMessage: (message: Models.MessageJSON) => void) {
    super();

    this.onMessage = onMessage;
    this.game = new Game({
      roomName,
      maxPlayers,
      mode: 'jouer',
      onWaitingStart: this.handleWaitingStart,
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
        this.activePlayerId = player.id;
      }
    });
  }

  isConsecutive(cards: Card[]): boolean {
    const hands = this.activePlayer.hand;
    const idxes = cards.map((card) => hands.indexOf(card));
    idxes.sort((a, b) => a - b);
    for (let i = 1; i < idxes.length; i++) {
      if (idxes[i] - idxes[i - 1] !== 1) {
        return false;
      }
    }
    return true;
  }

  canPlayCards(cards: Card[]): boolean {

    if (!this.isConsecutive(cards)) {
      return false;
    }

    if (!this.deck.isValidPlay(cards)) {
      return false;
    }
    if (!this.table.cards || this.table.cards.length === 0) {
      return true;
    }

    if (!this.deck.biggerThan(cards, [...this.table.cards])) {
      return false;
    }
    return true;
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
    console.log('playing', cards.map((card) => card.values));
    const player = this.players.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("Not the player's turn");
    }
    if (this.canPlayCards(cards)) {
      player.playCards(cards);
      this.table.setCards(cards);
      this.nextTurn();
    } else {
      // throw new Error('Invalid play');
      console.log('invalid play');
      this.messages.push('Invalid play');
    }
  }

  tryBorrowCard(playerId: string, cardIdx: number) {
    const player = this.players.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("Not the player's turn");
    }

    const card = this.table.cards[cardIdx];
    if (card) {
      player.tryBorrowCard(card);
    } else {
      throw new Error('Cannot borrow this card');
    }
  }


  borrowCard(playerId: string, cardIdx: number, inverse: boolean, targetIdx: number) {
    const player = this.players.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("Not the player's turn");
    }

    console.log('borrowCard', playerId, cardIdx, inverse, targetIdx);

    const card = this.table.borrowCard(cardIdx);
    if (inverse) {
      card.reverse();
    }

    const preOwner = this.players.get(card.owner);
    preOwner.incrementBorrowedCount();

    card.owner = player.id;
    const owner = this.players.get(player.id);
    owner.addCard(card, targetIdx);
    owner.borrowingCard = null;
    this.table.update();

    if (card) {
      this.nextTurn();
    } else {
      throw new Error('Cannot borrow this card');
    }
  }

  private nextTurn() {
    const idx = Array.from(this.players.keys()).indexOf(this.activePlayerId);
    const nextIdx = (idx + 1) % this.players.size;
    this.activePlayerId = Array.from(this.players.keys())[nextIdx];
  }

  private getCurrentPlayer(): Player {
    return this.players.get(this.activePlayerId);
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
