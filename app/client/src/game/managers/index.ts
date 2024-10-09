// managers.ts

import { Container, Sprite } from 'pixi.js';
import { Card, Player } from './entities';

export class CardsManager extends Container {
  private playerHands: Map<string, Sprite[]> = new Map();
  private lastPlayedCards: Sprite[] = [];

  addPlayerHand(playerId: string, cards: Card[]) {
    // 为玩家创建手牌精灵并添加到容器中
  }

  updatePlayerHand(playerId: string, cards: Card[]) {
    // 更新玩家手牌的显示
  }

  setLastPlayedCards(cards: Card[]) {
    // 更新最后打出的牌的显示
  }

  // 其他用于管理卡牌显示的方法
}

export class PlayersManager extends Container {
  private players: Map<string, Player> = new Map();

  add(player: Player) {
    this.players.set(player.id, player);
  }

  get(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getAll(): Player[] {
    return Array.from(this.players.values());
  }

  // 其他用于管理玩家的方法
}
