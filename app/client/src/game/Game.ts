import {Application, Container, Texture, Sprite, Text} from 'pixi.js';
import {Player} from './entities/Player';
import {Card, Hand} from './entities/Card';
import {Models} from '@jouer/common/src';
import {HandManager, PlayersManager, TableManager, ActionManager, MessageManager} from './managers';

const ZINDEXES = {
  TABLE: 1,
  CARDS: 2,
  PLAYERS: 3,
  UI: 4,
  MESSAGES: 5,
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
  private messageManager: MessageManager;

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

    this.handManager = new HandManager(this.borrowCard);
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

    this.messageManager = new MessageManager();
    this.messageManager.zIndex = ZINDEXES.MESSAGES;
    this.app.stage.addChild(this.messageManager);

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
      this.preBorrowCard(this.me.id, this.tableManager.getSelectedCard());
    });
  };

  playCards = (playerId: string, cards: Card[]) => {
    const player = this.playersManager.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("It's not your turn!");
    }

    this.onActionSend({
      type: 'play',
      playerId,
      ts: 1,
      value: cards.map((card) => card.cardIndex).join(','),
    });
  };

  isSequence(values: number[]): boolean {
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1 || values[i] !== values[i - 1] + 1) {
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

    const hand = this.getCurrentPlayer().getHand();
    const idxes = cards.map((card) => hand.findIndex((c) => c.id === card.id));

    if (!this.isSequence(idxes)) {
      return false;
    }
    const values = cards.map((card) => card.value);
    if (cards.length === 1) {
      return true;
    } else if (cards.length > 1) {
      if (cards.every((card) => card.value === cards[0].value)) {
        return true;
      } else if (this.isSequence(values)) {
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

  preBorrowCard = (playerId: string, card: Card) => {
    const player = this.playersManager.get(playerId);
    if (!player || player !== this.getCurrentPlayer()) {
      throw new Error("It's not your turn!");
    }

    this.onActionSend({
      type: 'tryBorrow',
      playerId,
      ts: 1,
      value: card.cardIndex,
    });
    this.nextTurn();
  };

  borrowCard = (cardIdx: number, inverse: boolean, targetIdx: number) => {
    // const player = this.playersManager.get(playerId);
    // if (!player || player !== this.getCurrentPlayer()) {
    //   throw new Error("It's not your turn!");
    // }

   this.onActionSend({
      type: 'borrow',
      playerId: this.me.id,
      ts: 1,
      value: {cardIdx, inverse, targetIdx},
      // value: card.cardIndex,
    });
  }

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
    if (playerId === this.me?.id) {
      this.actionManager.show();
      this.actionManager.setActions(['borrow', 'jouer', 'play']);
      this.bindActionCallbacks();
    } else {
      this.actionManager.hide();
    }
  };

  handUpdate = (cards: any[]) => {
    console.log(cards, 'handUpdate');
    this.handManager.setCards(
      cards.map((card, idx) => new Card(idx, card.id, card.values, card.owner, card.state, this.handManager, 'hand'))
    );
  };

  tableUpdate = (cards: any[]) => {
    this.tableManager.setCards(
      cards.map((card, idx) => new Card(idx, card.id, card.values, card.owner, card.state, this.tableManager, 'table'))
    );
  };

  borrowingCardUpdate = (card: Models.CardJSON) => {
    if (!card) {
      return;
    }
    const idx = this.tableManager.cards.findIndex((c) => c.id === card.id);
    this.handManager.setBorrowingCard(new Card(idx, card.id, card.values, card.owner, card.state, this.handManager, 'borrow'));
  }
}
