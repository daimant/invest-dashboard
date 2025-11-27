import { defineStore } from "pinia";
import { ref } from "vue";
import { getToken } from "../helpers/getToken.ts";
import type { IStocks, IStocksInfo, IStocksPrices } from "../types.ts";
import { prepareTData } from "../helpers/prepareTData.ts";
import { getStaticStocks } from "../helpers/getStaticStocks.ts";

const token = getToken()
const initialData: IStocks[] = JSON.parse(getStaticStocks())

export const useStocksStore = defineStore('stocksStore', () => {
  const isLoading = ref(false)
  const stocks = ref<IStocks[]>([])
  const stocksShortList = ref(new Set(initialData.map(el => el.ticker.replace('-RM', ''))))
  const stocksInfo = ref<IStocksInfo[]>([
    { ticker: 'TECH', name: 'Тинькофф Технологии заблокированные активы' },
    { ticker: 'TSPX', name: 'Тинькофф США 500 заблокированные активы' },
    { ticker: 'POLY', name: 'Polymetal' },
    { ticker: 'SBSP', name: 'ETF Sberbank S&P 500' },
    { ticker: 'META', name: 'Meta Platforms' },
  ])
  const usdPrice = ref(0)

  async function getTStocks() {
    isLoading.value = true
    try {
      const params: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ "accountId": "2137117749", "currency": "RUB" })
      }

      const res = await fetch('https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio', params)

      if (res.ok) {
        const preparedRes = await res.json()
        const { units, nano } = preparedRes.positions.find((el: {
          ticker: string
        }) => el.ticker === 'USD000UTSTOM')?.currentPrice
        usdPrice.value = +`${units}.${nano}`

        stocks.value = [...initialData, ...prepareTData(preparedRes, usdPrice.value)]

        stocks.value.forEach(el => {
          stocksShortList.value.add(el.ticker)
        })
      }
    } catch {
      console.log('shit happens')
    } finally {
      isLoading.value = false
    }
  }

  async function getTStocksInfo() {
    isLoading.value = true
    try {
      const params: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          "instrumentStatus": "INSTRUMENT_STATUS_UNSPECIFIED",
          "instrumentExchange": "INSTRUMENT_EXCHANGE_UNSPECIFIED"
        })
      }
      const res = await fetch('https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares', params)

      if (res.ok) {
        stocksInfo.value = [...stocksInfo.value, ...(await res.json()).instruments.filter((el: {
          ticker: string
        }) => el.ticker !== 'TECH' && stocksShortList.value.has(el.ticker))]
        await getTStocksUnfoundInfo()
      }
    } catch {
      console.log('shit happens')
    } finally {
      isLoading.value = false
    }
  }

  async function getTStocksUnfoundInfo() {
    isLoading.value = true
    try {
      const params: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          "instrumentId": stocksInfo.value.map(el => el.uid).filter((el) => el),
          "values": [
            "INSTRUMENT_VALUE_UNSPECIFIED"
          ]
        })
      }
      const res = await fetch('https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.MarketDataService/GetMarketValues', params)

      if (res.ok) {
        (await res.json()).instruments.forEach(({ instrumentUid, values }: IStocksPrices) => {
          const getStock = stocksInfo.value.find(el => el.uid === instrumentUid)
          const lastPrice = values.find(el => el.type === 'INSTRUMENT_VALUE_LAST_PRICE')
          const closePrice = values.find(el => el.type === 'INSTRUMENT_VALUE_CLOSE_PRICE')

          if (getStock && lastPrice?.value) {
            const { units, nano } = lastPrice.value
            getStock.current_price = +`${units}.${nano}`
          }
          if (getStock && lastPrice?.value && closePrice?.value) {
            const { units, nano } = closePrice.value
            getStock.daily_profit = +`${lastPrice.value.units}.${lastPrice.value.nano}` - +`${units}.${nano}`
          }
        })
      }
    } catch {
      console.log('shit happens')
    } finally {
      isLoading.value = false
    }
  }

  async function getTETFsInfo() {
    isLoading.value = true
    try {
      const params: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          "instrumentStatus": "INSTRUMENT_STATUS_UNSPECIFIED",
          "instrumentExchange": "INSTRUMENT_EXCHANGE_UNSPECIFIED"
        })
      }

      const res = await fetch('https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/Etfs', params)

      if (res.ok) {
        stocksInfo.value = [...stocksInfo.value, ...(await res.json()).instruments.filter((el: {
          ticker: string
        }) => stocksShortList.value.has(el.ticker))]
      }
    } catch {
      console.log('shit happens')
    } finally {
      isLoading.value = false
    }
  }

  async function getTCurrenciesInfo() {
    isLoading.value = true
    try {
      const params: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          "instrumentStatus": "INSTRUMENT_STATUS_UNSPECIFIED",
          "instrumentExchange": "INSTRUMENT_EXCHANGE_UNSPECIFIED"
        })
      }

      const res = await fetch('https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/Currencies', params)

      if (res.ok) {
        stocksInfo.value = [...stocksInfo.value, ...(await res.json()).instruments.filter((el: {
          ticker: string
        }) => stocksShortList.value.has(el.ticker))]
      }
    } catch {
      console.log('shit happens')
    } finally {
      isLoading.value = false
    }
  }

  return { stocks, stocksInfo, usdPrice, getTStocks, getTStocksInfo, getTETFsInfo, getTCurrenciesInfo, getTStocksUnfoundInfo }
})