import { Application, Container, Sprite, Text } from 'pixi.js';
import { Card, Player, Deck } from './entities';
import { Models } from '@jouer/common/src';
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
  players: Models.PlayerJSON[];
  playersCount: number;
  currentPlayerIndex: number;
  lastPlayedSet: Card[];
}

export const app = new Application();

function resize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const minWidth = 600;
  const minHeight = 400;

  // Calculate renderer and canvas sizes based on current dimensions
  const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
  const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
  const scale = scaleX > scaleY ? scaleX : scaleY;
  const width = windowWidth * scale;
  const height = windowHeight * scale;

  // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
  app.renderer.canvas.style.width = `${ windowWidth }px`;
  app.renderer.canvas.style.height = `${ windowHeight }px`;
  window.scrollTo(0, 0);

  // Update renderer  and navigation screens dimensions
  app.renderer.resize(width, height);
}


export class JouerGame {

  private roomName: string;

  private app: Application;
  private table: Container;
  private deck: Deck;

  private me: Player;

  private cardsManager: CardsManager;
  private playersManager: PlayersManager;
  private currentPlayerIndex: number = 0;
  private lastPlayedSet: Card[] = [];
  private onActionSend: (action: Models.ActionJSON) => void;


  constructor (screenWidth: number, screenHeight: number, onActionSend: any) {
    this.app = app;
    this.app.init({
      backgroundColor: 'pink',
      width: screenWidth,
      height: screenHeight,
      autoDensity: true,
    })

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
    // this.playersManager.
    this.onActionSend = onActionSend;

  }

  start = () => {
    let rootDom = document.getElementById('root');
    rootDom.appendChild(this.app.canvas);
    this.app.start();
    this.app.ticker.add(this.update);
    this.initializeGame();
  };

  stop = () => {
    this.app.ticker.stop();
    this.app.stop();
  }

  private update = () => {
    // Update game state, animations, etc.
  };

  private initializeGame = () => {
    this.dealCards();
    this.determineStartingPlayer();
  };

  private dealCards = () => {
    const players = this.playersManager.getAll();
    console.log(players);
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
    const players: Models.PlayerJSON[] = this.playersManager.getAll().map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      isMyTurn: player === this.getCurrentPlayer(),
      hand: [],
      eaten: [],
      borrowedCount: player.borrowedCount,
      jouerCount: player.jouerCount,

    }));
    return {
      roomName: "Jouer Game Room",
      // playerName: this.getCurrentPlayer().name,
      playerName: 'asdasd',
      players,
      playersCount: this.playersManager.getAll().length,
      currentPlayerIndex: this.currentPlayerIndex,
      lastPlayedSet: this.lastPlayedSet,
    };
  };

  playerAdd = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
    const player = new Player({
      x: 12,
      y: 12,
      radius: 10,
      zIndex: ZINDEXES.PLAYERS,
      textures: [],
    }, playerId, attributes.name);
    this.playersManager.add(player.id, player);
    this.playersManager.addChild(player.sprite);
    console.log(this.playersManager.children)
    // If the player is "you"
    if (isMe) {
      this.me = new Player({
        x: 0,
        y: 0,
        zIndex: ZINDEXES.PLAYERS,
        radius: 10,
        textures: [],
      }, playerId, attributes.name);

      this.playersManager.addChild(this.table);

    }
  };

  playerRemove = (playerId: string, isMe: boolean) => {
    this.playersManager

    // If the player is "you"
    if (isMe) {
      this.me = null;
    }
  }

  playerUpdate = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
    const player = this.playersManager.get(playerId);
    if (!player) {
      return;
    }

    player.name = attributes.name;
    player.score = attributes.score;
    player.borrowedCount = attributes.borrowedCount;
    player.jouerCount = attributes.jouerCount;

    if (isMe) {
      this.me = player;
    }
  }

  gameUpdate = (name: string, value: any) => {
    switch (name) {
      case 'roomName':
        this.roomName = value;
        break;
      default:
        break;
    }
  };


}
