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
  mode: string;
  state: string;
  roomName: string;
  players: Models.PlayerJSON[];
  playersCount: number;
  playersMaxCount: number;
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
  private state: string;
  private roomName: string;
  private awardEndsAt: number;
  private gameEndsAt: number;
  private maxPlayers: number;
  private mode: string;

  private me: Player;
  private app: Application;

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
      // width: screenWidth,
      // height: screenHeight,
      width: screenWidth * window.devicePixelRatio,
      height: screenHeight * window.devicePixelRatio,
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

    this.onActionSend = onActionSend;
  }

  start = (ref: HTMLElement) => {
    ref.appendChild(this.app.canvas);
    this.app.start();
    this.app.ticker.add(this.update);
  };

  stop = () => {
    this.app.ticker.stop();
    this.app.stop();
  };

  private update = () => {
    // Update game state, animations, etc.
  };

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
    });
  };

  private getCurrentPlayer = (): Player => {
    return this.playersManager.get(this.activePlayer);
  };

  private getNextPlayer = (): Player => {
    const currentIndex = this.playersManager.getAll().findIndex((player) => player.id === this.activePlayer);
    return this.playersManager.getAll()[(currentIndex + 1) % this.playersManager.getAll().length];
  };

  getStats = (): Stats => {
    const playerToJSON = (player: Player): Models.PlayerJSON => ({
      id: player.id,
      name: player.name,
      score: player.score,
      ready: player.ready,
      status: player.status,
      cardCount: player.cardCount,
      jouerCount: player.jouerCount,
    });

    const roomName = this.roomName;
    const mode = this.mode;
    const state = this.state;

    const players: Models.PlayerJSON[] = this.playersManager.getAll().map(playerToJSON);

    return {
      roomName,
      mode,
      state,
      players,
      playersMaxCount: this.maxPlayers,
      playersCount: this.playersManager.getAll().length,
    };
  };

  playerAdd = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
    const player = new Player(attributes.id, attributes.name, attributes.cardCount, attributes.score);

    this.playersManager.add(player.id, player);

    if (isMe) {
      this.me = player;
    }

    // TODO: ready button
    this.onActionSend({
      type: 'ready',
      playerId,
      ts: 1,
      value: '',
    });
  };

  playerRemove = (playerId: string, isMe: boolean) => {
    this.playersManager.remove(playerId);

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

  gameUpdate = (gameState: any) => {
    // TODO: 这里的 state 等信息没有 update 成功
    this.mode = gameState.mode;
    this.state = gameState.state;
    this.roomName = gameState.roomName;
    this.awardEndsAt = gameState.awardEndsAt;
    this.gameEndsAt = gameState.gameEndsAt;
    this.maxPlayers = gameState.maxPlayers;
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
    this.handManager.setBorrowingCard(
      new Card(idx, card.id, card.values, card.owner, card.state, this.handManager, 'borrow')
    );
  };
}
