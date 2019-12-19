export interface Bet {
  id?: number
  auctionId: number
  userId: number
  date: number
  price: number
}

export interface BetQueryOptions {
  id?: number
  auctionId?: number
  userId?: number
  date?: number
  price?: number
}
