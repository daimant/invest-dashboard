export interface IStocks {
  ticker: string
  figi?: string
  isin?: string
  quantity: number
  avg_price: number
  currency?: '$' | '₽'

  name?: string
  current_price?: number
  profit?: number
  daily_profit?: number
  profitPercent?: string
}

export interface ITData {
  positions: {
    ticker: string,
    figi: string,
    quantity: ITDataObj,
    averagePositionPrice: ITDataObj,
    currentPrice: ITDataObj,
    dailyYield: ITDataObj
  }[]
}

type ITDataObj = { units: number, nano: number, currency: 'usd' | 'rub' }

export interface IStocksInfo {
  ticker: string,
  name: string,
  uid?: string,
  current_price?: number
  daily_profit?: number
}

export interface IStocksPrices {
  instrumentUid: string,
  values: {
    type: "INSTRUMENT_VALUE_LAST_PRICE" | 'INSTRUMENT_VALUE_CLOSE_PRICE',
    value: {
      units: string,
      nano: number
    },
  }[],
  ticker: string
}