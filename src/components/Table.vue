<script setup lang="ts">
import { useStocksStore } from "../store/stocksStore.ts";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { numFormat } from "../helpers/numFormat.ts";
import SummaryRow from "./SummaryRow.vue";

const { stocks, stocksInfo, usdPrice } = storeToRefs(useStocksStore())
const { getTStocks, getTStocksInfo, getTETFsInfo, getTCurrenciesInfo, getTStocksUnfoundInfo } = useStocksStore()

const interval = ref()

const preparedStocks = computed(() => stocks.value.map(stock => {
  const findStockInfo = stocksInfo.value.find(el => el.ticker === stock.ticker)

  const invested = stock.quantity * stock.avg_price
  const value = stock.current_price ? stock.quantity * stock.current_price : 0
  const profit = value - invested

  const profitRowPercent = profit && invested ? profit / invested * 100 : 0
  const profitPercent = (profitRowPercent).toFixed(profitRowPercent < 1 && profitRowPercent * 100 > -1 ? 2 : 0)

  const dailyProfitRowPercent = stock.daily_profit ? stock.daily_profit / invested * 100 : 0
  const dailyProfitPercent = (dailyProfitRowPercent).toFixed(dailyProfitRowPercent < 1 && dailyProfitRowPercent * 100 > -1 ? 2 : 0)

  if (!stock.current_price && findStockInfo?.current_price) {
    stock.current_price = findStockInfo.current_price * (stock.currency === '$' ? usdPrice.value : 1)
  }

  if (!stock.daily_profit && findStockInfo?.daily_profit) {
    stock.daily_profit = findStockInfo.daily_profit * (stock.currency === '$' ? usdPrice.value : 1)
  }

  return {
    ...stock,
    name: findStockInfo?.name,
    invested,
    value,
    profit,
    profitPercent,
    dailyProfitPercent,
  }
}))
const sortedStocks = computed(() => preparedStocks.value.sort((stockA, stockB) => (stockB.current_price ? +stockB.quantity * +stockB.current_price : 0) - (stockA.current_price ? +stockA.quantity * +stockA.current_price : 0)))

const updateStocksHandler = async () => {
  await Promise.allSettled([getTStocks(), getTStocksUnfoundInfo])
}

onMounted(async () => {
  await getTStocks()
  await Promise.allSettled([getTStocksInfo(), getTETFsInfo(), getTCurrenciesInfo()])

  interval.value = setInterval(updateStocksHandler, 5000, true)
})

onBeforeUnmount(() => {
  window.clearInterval(interval.value)
})
</script>

<template>
  <table>
    <thead>
    <tr>
      <th>№</th>
      <th>Актив</th>
      <th>Количество</th>
      <th>Вложено</th>
      <th>Текущая стоимость</th>
      <th>Прибыль</th>
      <th>Прибыль за день</th>
    </tr>
    </thead>

    <tbody>
    <summary-row/>

    <tr v-for="(stock, i) of sortedStocks" :key="stock.ticker + i" :style="{background: i % 2 ? '#fff' : '#D3D3D340'}">
      <td>{{ i + 1 }}</td>

      <td>
        <span>{{ stock.name }}</span>
        <span class="description">{{ stock.ticker }}</span>
      </td>

      <td> {{ stock.quantity }}шт</td>
      <td>
        <span>{{ numFormat(stock.invested) }}₽</span>
        <span v-if="stock.avg_price" class="description">{{ numFormat(stock.avg_price) }}₽</span>
      </td>

      <td>
        <span>{{ numFormat(stock.value) }}₽</span>
        <span v-if="stock.current_price" class="description">{{ numFormat(stock.current_price) }}₽</span>
      </td>

      <td :class="stock.profit > 0 ? 'green' : stock.profit < 0 ? 'red' : ''">
        <span>{{ numFormat(stock.profit) }}₽</span>
        <span  v-if="stock.profitPercent !== '0.00'" class="description">{{ stock.profitPercent }}%</span>
      </td>

      <td :class="{green: Number(stock.daily_profit) > 0, red: Number(stock.daily_profit) < 0 }">
        <span>{{ numFormat(stock.daily_profit) }}₽</span>
        <span v-if="stock.dailyProfitPercent !== '0.00'" class="description">{{ stock.dailyProfitPercent }}%</span>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style lang="scss">
table {
  white-space: nowrap;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 8px;
  overflow: hidden;
  font-weight: 600;

  td, th {
    padding: 6px 12px;
    text-align: start;
    border-bottom: 1px solid #000;
  }

  tr:last-child {
    td {
      border-bottom: none
    }
  }

  thead {
    position: sticky;
    top: 0;
    background: #eee;
  }

  .description {
    margin-left: 4px;
    color: #aaa;
    font-size: 12px;
  }

  .green {
    color: #02b662;

    .description {
      color: inherit;

      &:before {
        content: '+'
      }
    }
  }

  .red {
    color: #ff474c;

    .description {
      color: inherit;
    }
  }
}
</style>
