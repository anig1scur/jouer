## Game

1. 准备
依照玩家人数拿取适当的卡牌。再将余下的牌洗混。

初始牌组为 [[10, 9], [10, 8], [10, 7] ..... [3, 2], [3,1], [2, 1]]

需要的卡牌：

玩家人数	卡牌
3	除掉所有有10的卡牌。
4	除掉同时有9&10的卡牌。
5	所有卡牌均可用。

每张牌均有两个数字（左上和右下），玩家在游戏开始前选择是否反转调整手上的卡牌，待所有玩家完成选择后游戏开始。（玩家不能且不可调整卡牌顺序。）

流程

由手上有［1、2］数字牌的玩家拿取起始玩家指示物，并依自己的手上的牌出牌。
出牌规则
牌型	注意事项
单张	无特别注意事项
对子	对子间不能有任何牌将两张牌隔开。
（即是如果A先生的手牌中的挑序是［2、4、2、5］，由于A先生不可改变牌的排序。因此若果A先生要出对2的话，则必需先将4单独打出，使得两张2之间不存在任何非2的牌，才能再打出对2。）
顺子	顺子间不能有任何牌将顺子隔开。（同上）
顺子的排序必需正确。（可以［4、5、6］也可以［6、5、4］，但不可以［5、4、6］等方式排序）

下一个玩家出牌，若果该玩家出的牌大于场上的牌则可以将该牌整组拿走，一张牌一分。无牌可出则喊jouer。

喊jouer的时候玩家可以拿取场上的牌，但只能拿取该牌的头尾任何一张。玩家在拿到牌时可以将牌转至自己想要的数字及将牌放入手牌中任意位置，而被拿牌的人拿取一个分数指示物。
游戏中每人有一次机会将刚拿走的牌打出。
若无人能够出牌或某一人首先出完手牌则游戏结束。

结束
计算手牌、分数指示物及赢得的牌的数量，手中每张牌扣一分，其余两个每个加一分，分数最多者获胜。

### Card

id: string
value: number
owner: string | null
state: string

getPossibleValues: () => number[]

### Deck

cards: Card[]
discards: Card[]
generateCards: (shuffle: boolean) => void
draw: () => Card
getCardsType: (cards: Card[]) => string
compareTwoCardList: (cards1: Card[], cards2: Card[]) => number

### Player

id: string
name: string
hand: Card[]
eaten: Card[]

score: number
borrowedCount: number
jouerCount: number // borrow and play count

isMyTurn: boolean

playCards: (cards: Card[]) => void
borrowCard: (card: Card) => void
eatCards: (cards: Card[]) => void

### Table

cards: Card[]
getCanBeBorrowedCards: () => Card[]
getCurrentPlayer: () => Player
