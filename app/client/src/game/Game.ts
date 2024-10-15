import {Application, Container, Texture, Sprite, Text} from 'pixi.js';
import {Player} from './entities/Player';
import {Card, Hand} from './entities/Card';
import {Models} from '@jouer/common/src';
import {HandManager, PlayersManager, TableManager, ActionManager} from './managers';

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

  private activePlayer: string;
  private handManager: HandManager;
  private tableManager: TableManager;
  private playersManager: PlayersManager;
  private actionManager: ActionManager;

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

    this.tableManager = new TableManager();
    this.tableManager.zIndex = ZINDEXES.TABLE;
    this.app.stage.addChild(this.tableManager);

    this.actionManager = new ActionManager();
    this.actionManager.zIndex = ZINDEXES.UI;
    this.app.stage.addChild(this.actionManager);

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

  private initializeGame = () => {};

  private bindActionCallbacks = () => {
    this.actionManager.bindHandler('play', () => {
      this.playCards(this.me.id, this.handManager.getSelectedCards());
    });

    this.actionManager.bindHandler('jouer', () => {
      this.jouer(this.me.id);
    });

    this.actionManager.bindHandler('borrow', () => {
      this.borrowCard(this.me.id);
    });
  };
  playCards = (playerId: string, cards: Card[]) => {
    const player = this.playersManager.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("It's not your turn!");
    }
    if (!this.isValidPlay(cards)) {
      throw new Error('Invalid play!');
    }
    console.log(cards, 'play');
    this.onActionSend({
      type: 'play',
      playerId,
      ts: 1,
      value: cards.map((card) => card.cardIndex).join(','),
    });
  };

  isSequence(cards: Card[]): boolean {
    const cardValues = cards.map((card) => card.value);

    for (let i = 1; i < cardValues.length; i++) {
      if (cardValues[i] !== cardValues[i - 1] + 1 || cardValues[i] !== cardValues[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }

  private isValidPlay = (cards: Card[]): boolean => {
    // 1. if all cards cardIndex is continuous
    // 2. if is single / sequence / same
    // 3. if the cardIndex is bigger than the last played cardIndex

    if (cards.length === 0) {
      return false;
    }

    const sortedCards = cards.slice().sort((a, b) => a.cardIndex - b.cardIndex);
    for (let i = 1; i < sortedCards.length; i++) {
      if (sortedCards[i].cardIndex !== sortedCards[i - 1].cardIndex + 1) {
        return false;
      }
    }

    if (cards.length === 1) {
      return true;
    } else if (cards.length > 1) {
      if (cards.every((card) => card.value === cards[0].value)) {
        return true;
      } else if (this.isSequence(cards)) {
        return true;
      }
    }

    return false;
  };

  private nextTurn = () => {
    // Implement the logic to move to the next player's turn
    // This might involve skipping players, reversing the order, etc.
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

  borrowCard = (playerId: string) => {
    const player = this.playersManager.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("It's not your turn!");
    }

    // Implement borrowing logic
    // This might involve borrowing a card from the table

    // this.handManager.updatePlayerHand(playerId, player.getHand());

    this.nextTurn();
  };

  private getCurrentPlayer = (): Player => {
    return this.playersManager.get(this.activePlayer);
  };

  private getNextPlayer = (): Player => {
    const currentIndex = this.playersManager.getAll().findIndex((player) => player.id === this.activePlayer);
    return this.playersManager.getAll()[(currentIndex + 1) % this.playersManager.getAll().length];
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
      roomName: "DnD's Happy Scout Time",
      playerName: this.me ? this.me.name : '',
      players,
      playersCount: this.playersManager.getAll().length,
    };
  };

  playerAdd = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
    const player = new Player(attributes.id, attributes.name, attributes.cardCount, attributes.score);

    console.log(player, attributes, 'add');
    this.playersManager.add(player.id, player);

    if (isMe) {
      this.me = player;
    }

    this.onActionSend({
      type: 'ready',
      playerId,
      ts: 1,
      value: '',
    });
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

    player.name = attributes.name;
    player.score = attributes.score;
    player.jouerCount = attributes.jouerCount;
    player.cardCount = attributes.cardCount;

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
      default:
        break;
    }
  };

  activePlayerUpdate = (playerId: string) => {
    this.activePlayer = playerId;
    if (this.activePlayer === this.me.id) {
      this.actionManager.show();
      this.actionManager.setActions(['borrow', 'jouer', 'play']);
      this.bindActionCallbacks();
    } else {
      this.actionManager.hide();
    }
  };

  handUpdate = (cards: any[]) => {
    this.handManager.setCards(cards.map((card, idx) => new Card(idx, card.id, card.values, card.owner, card.state)));
  };

  tableUpdate = (cards: any[]) => {
    this.tableManager.setCards(cards.map((card, idx) => new Card(idx, card.id, card.values, card.owner, card.state)));
  };
}
