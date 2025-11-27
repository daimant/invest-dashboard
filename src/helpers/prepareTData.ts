import type { IStocks, ITData } from "../types.ts";

const filtredFiat = ['USD000UTSTOM', 'RUB000UTSTOM', 'TRYRUB_TOM_CETS']

export const prepareTData = (data: ITData, dollarPrice: number): IStocks[] => {
  return data.positions
    .filter(el => !filtredFiat.includes(el.ticker))
    .map(({ ticker, figi, quantity, averagePositionPrice, currentPrice, dailyYield }) => {
      const addUsdPrice = dailyYield.currency === "usd" ? dollarPrice : 1
      return {
        ticker: ticker,
        figi: figi,
        quantity: quantity.units,
        avg_price: +`${averagePositionPrice.units}.${averagePositionPrice.nano}` * addUsdPrice,
        current_price: +`${currentPrice.units}.${currentPrice.nano}` * addUsdPrice,
        daily_profit: dailyYield.units * addUsdPrice,
      }
    })
}