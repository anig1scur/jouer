export class Card {
  constructor (public suit: string, public value: number) { }
  // 可能还有其他方法，如 toString(), compare(), 等
}

export class Player {
  private hand: Card[] = [];

  constructor (public id: string, public name: string) { }

  setHand(cards: Card[]) {
    this.hand = cards;
  }

  getHand(): Card[] {
    return this.hand;
  }

  removeCardsFromHand(cards: Card[]) {
    // 实现从手牌中移除特定卡牌的逻辑
  }

  addCardToHand(card: Card) {
    this.hand.push(card);
  }

  removeRandomCard(): Card {
    // 实现从手牌中随机移除一张卡牌的逻辑
    const index = Math.floor(Math.random() * this.hand.length);
    return this.hand.splice(index, 1)[0];
  }
}

export class Deck {
  private cards: Card[] = [];

  constructor () {
    // 初始化一副完整的牌
  }

  shuffle() {
    // 实现洗牌算法
  }

  draw(count: number): Card[] {
    // 从牌堆顶部抽取指定数量的牌
    return this.cards.splice(0, count);
  }

  remainingCards(): number {
    return this.cards.length;
  }
}