import { Application, Container, Sprite, Text } from 'pixi.js';
import { Card, Player, Deck } from './entities';
import { CardsManager, PlayersManager } from './managers';

const ZINDEXES = {
  TABLE: 1,
  CARDS: 2,
  PLAYERS: 3,
  UI: 4,
};

export interface Stats {
  roomName: string;
  playerName: string;
  players: Player[];
  playersCount: number;
  currentPlayerIndex: number;
  lastPlayedSet: Card[];
}

export class JouerGame {
  private app: Application;
  private table: Container;
  private deck: Deck;
  private cardsManager: CardsManager;
  private playersManager: PlayersManager;
  private currentPlayerIndex: number = 0;
  private lastPlayedSet: Card[] = [];

  constructor (screenWidth: number, screenHeight: number) {
    this.app = new Application({
      width: screenWidth,
      height: screenHeight,
      backgroundColor: 'pink', // Green table color
    });

    this.table = new Container();
    this.table.zIndex = ZINDEXES.TABLE;
    this.app.stage.addChild(this.table);

    this.deck = new Deck();
    this.cardsManager = new CardsManager();
    this.cardsManager.zIndex = ZINDEXES.CARDS;
    this.app.stage.addChild(this.cardsManager);

    this.playersManager = new PlayersManager();
    this.playersManager.zIndex = ZINDEXES.PLAYERS;
    this.app.stage.addChild(this.playersManager);
  }

  start = (renderView: any) => {
    renderView.appendChild(this.app.view);
    this.app.start();
    this.app.ticker.add(this.update);
    this.initializeGame();
  };

  private update = () => {
    // Update game state, animations, etc.
  };

  private initializeGame = () => {
    this.deck.shuffle();
    this.dealCards();
    this.determineStartingPlayer();
  };

  private dealCards = () => {
    const players = this.playersManager.getAll();
    const cardsPerPlayer = Math.floor(this.deck.remainingCards() / players.length);

    players.forEach(player => {
      const cards = this.deck.draw(cardsPerPlayer);
      player.setHand(cards);
      this.cardsManager.addPlayerHand(player.id, cards);
    });
  };

  private determineStartingPlayer = () => {
    // For simplicity, let's start with a random player
    this.currentPlayerIndex = Math.floor(Math.random() * this.playersManager.getAll().length);
  };

  playCards = (playerId: string, cards: Card[]) => {
    const player = this.playersManager.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("It's not your turn!");
    }

    if (!this.isValidPlay(cards)) {
      throw new Error("Invalid play!");
    }

    player.removeCardsFromHand(cards);
    this.lastPlayedSet = cards;
    this.cardsManager.updatePlayerHand(playerId, player.getHand());
    this.cardsManager.setLastPlayedCards(cards);

    this.nextTurn();
  };

  private isValidPlay = (cards: Card[]): boolean => {
    // Implement the logic to check if the play is valid according to Jouer rules
    // This should include checking for pairs, triples, full houses, straights, etc.
    // Also, check if the play beats the last played set
    return true; // Placeholder
  };

  private nextTurn = () => {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playersManager.getAll().length;
  };

  jouer = (playerId: string) => {
    const player = this.playersManager.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("It's not your turn!");
    }

    // Implement jouering logic
    // This might involve drawing a card from the next player's hand
    const nextPlayer = this.getNextPlayer();
    const joueredCard = nextPlayer.removeRandomCard();
    player.addCardToHand(joueredCard);

    this.cardsManager.updatePlayerHand(playerId, player.getHand());
    this.cardsManager.updatePlayerHand(nextPlayer.id, nextPlayer.getHand());

    this.nextTurn();
  };

  private getCurrentPlayer = (): Player => {
    return this.playersManager.getAll()[this.currentPlayerIndex];
  };

  private getNextPlayer = (): Player => {
    const nextIndex = (this.currentPlayerIndex + 1) % this.playersManager.getAll().length;
    return this.playersManager.getAll()[nextIndex];
  };

  getStats = (): Stats => {
    return {
      roomName: "Jouer Game Room",
      playerName: this.getCurrentPlayer().name,
      players: this.playersManager.getAll(),
      playersCount: this.playersManager.getAll().length,
      currentPlayerIndex: this.currentPlayerIndex,
      lastPlayedSet: this.lastPlayedSet,
    };
  };

  // Additional methods for game logic, state updates, etc.
}
