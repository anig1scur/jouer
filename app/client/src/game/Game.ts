import {Application, Container, Texture, Sprite, Text} from 'pixi.js';
import {Player} from './entities/Player';
import {Card, Hand} from './entities/Card';
import {Models} from '@jouer/common/src';
import {HandManager, PlayersManager} from './managers';

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
  app.renderer.canvas.style.width = `${windowWidth}px`;
  app.renderer.canvas.style.height = `${windowHeight}px`;
  window.scrollTo(0, 0);

  // Update renderer  and navigation screens dimensions
  app.renderer.resize(width, height);
}

export class JouerGame {
  private roomName: string;

  private app: Application;
  private table: Container;
  private hand: Hand;

  private me: Player;

  private handManager: HandManager;
  private playersManager: PlayersManager;
  private currentPlayerIndex: number = 0;
  private onActionSend: (action: Models.ActionJSON) => void;

  constructor(screenWidth: number, screenHeight: number, onActionSend: any) {
    this.app = app;
    this.app.init({
      backgroundAlpha: 0,
      width: screenWidth,
      height: screenHeight,
      resizeTo: window,
      autoDensity: true,
      antialias: true,
      resolution: 2,
    });

    let color1 = '#FBE89A';
    let color2 = '#F69C6C';

    let canvas = document.createElement('canvas');

    let ctx = canvas.getContext('2d');
    let gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientFill.addColorStop(0, color1);
    gradientFill.addColorStop(1, color2);

    ctx.fillStyle = gradientFill;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    let texture = Texture.from(canvas);

    let sprite = new Sprite(texture);
    sprite.width = window.innerWidth;
    sprite.height = window.innerHeight;

    app.stage.addChild(sprite);

    window.addEventListener('resize', () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);

      canvas.height = window.innerHeight;
      gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradientFill.addColorStop(0, color1);
      gradientFill.addColorStop(1, color2);
      ctx.fillStyle = gradientFill;
      ctx.fillRect(0, 0, 1, canvas.height);

      texture.update();
      sprite.width = window.innerWidth;
      sprite.height = window.innerHeight;
    });

    this.table = new Container();
    this.table.zIndex = ZINDEXES.TABLE;
    this.app.stage.addChild(this.table);

    this.handManager = new HandManager();
    this.handManager.zIndex = ZINDEXES.CARDS;
    this.app.stage.addChild(this.handManager);

    this.playersManager = new PlayersManager();
    this.playersManager.zIndex = ZINDEXES.PLAYERS;
    this.app.stage.addChild(this.playersManager);

    // const eunice = new PlayerSprite('Eunice', 5, 10);
    // const kusa = new PlayerSprite('kusa', 5, 10);
    // const helen = new PlayerSprite('Helen', 5, 10);
    // const ring = new PlayerSprite('ring', 5, 10);

    // eunice.scale.set(0.5);
    // kusa.scale.set(0.5);
    // helen.scale.set(0.5);
    // ring.scale.set(0.5);

    // eunice.position.set(100, 60);
    // kusa.position.set(100, 160);
    // helen.position.set(100, 260);
    // ring.position.set(100, 360);

    // this.app.stage.addChild(eunice);
    // this.app.stage.addChild(kusa);
    // this.app.stage.addChild(helen);
    // this.app.stage.addChild(ring);

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
  };

  private update = () => {
    // Update game state, animations, etc.



  };

  private initializeGame = () => {
    this.determineStartingPlayer();
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
      throw new Error('Invalid play!');
    }

    player.removeCardsFromHand(cards);
    // this.handManager.updatePlayerHand(playerId, player.getHand());
    // this.handManager.setLastPlayedCards(cards);

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

    // this.handManager.updatePlayerHand(playerId, player.getHand());
    // this.handManager.updatePlayerHand(nextPlayer.id, nextPlayer.getHand());

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
      hand: player.getHand(),
      cardCount: player.cardCount,
      jouerCount: player.jouerCount,
    }));
    return {
      roomName: "Dnd's Happy Scout Time",
      playerName: this.me ? this.me.name : '',
      players,
      playersCount: this.playersManager.getAll().length,
      currentPlayerIndex: this.currentPlayerIndex,
    };
  };

  playerAdd = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
    const player = new Player(attributes.name, attributes.cardCount, attributes.score);

    console.log(player, attributes, 'add');
    this.playersManager.add(player.id, player);

    // If the player is "you"
    // if (isMe) {
    //   this.me = new Player(attributes.name, attributes.cardCount, attributes.score);

    //   this.playersManager.addChild(this.table);
    // }
    this.onActionSend({
      type: "ready",
      playerId,
      ts: 1,
      value:""
    })
  };

  playerRemove = (playerId: string, isMe: boolean) => {
    this.playersManager;

    // If the player is "you"
    if (isMe) {
      this.me = null;
    }
  };

  playerUpdate = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
    const player = this.playersManager.get(playerId);
    if (!player) {
      return;
    }

    console.log(player, attributes, 'update');
    player.name = attributes.name;
    player.score = attributes.score;
    player.jouerCount = attributes.jouerCount;
    player.cardCount = attributes.cardCount;
    player.setHand(attributes.hand || []);

    if (isMe) {
      this.me = player;
    }
  };

  gameUpdate = (name: string, value: any) => {
    console.log(name, value);
    switch (name) {
      case 'roomName':
        this.roomName = value;
        break;
      case 'hand':
        this.hand = value;
        break;
      default:
        break;
    }
  };

  handUpdate = (cards: any[]) => {
    this.handManager.setCards(cards.map((card, idx) => new Card(idx, card.id, card.values, card.owner, card.state)));
  };
}
