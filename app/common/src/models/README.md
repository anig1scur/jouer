
## Game

### Card

id: string
value: number
owner: string | null
state: string

getPossibleValues: () => number[]

### Deck

maxCardValue: number
cards: Card[]
discards: Card[]

draw: () => Card

### Player

id: string
name: string
hand: Card[]
eaten: Card[]

score: number
accumulatedScore: number
isMyTurn: boolean

jouerCount: number

playCards: (cards: Card[]) => void
borrowCard: (card: Card) => void
eatCards: (cards: Card[]) => void

### Table

cards: Card[]


### Deck