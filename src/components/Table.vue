<script setup lang="ts">
import { useStocksStore } from "../store/stocksStore.ts";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { numFormat } from "../helpers/numFormat.ts";
import SummaryRow from "./SummaryRow.vue";
import LoaderImage from '../assets/Loader.vue'
import { illiquidShares } from "../const/illiquidShares.ts";
import type { IStocks } from "../types.ts";
import SellBlock from "./SellBlock.vue";

const { stocks, stocksInfo, usdPrice, isLoading } = storeToRefs(useStocksStore())
const {
  getTStocks,
  getTStocksInfo,
  getTETFsInfo,
  getTCurrenciesInfo,
  getTStocksUnfoundInfo,
  getCryptoPrice
} = useStocksStore()

const interval = ref()
const isShowIlliquid = ref(false)
const checkedItems = ref<string[]>([])

const preparedStocks = computed<IStocks[]>(() => stocks.value.map(stock => {
  const findStockInfo = stocksInfo.value.find(el => el.ticker === stock.ticker)

  const invested = stock.quantity * stock.avg_price
  const value = stock.current_price ? stock.quantity * stock.current_price : 0
  const profit = value - invested

  const profitRowPercent = profit && invested ? profit / invested * 100 : 0
  const profitPercent = (profitRowPercent).toFixed(profitRowPercent < 1 && profitRowPercent * 100 > -1 ? 2 : 0)

  const dailyProfitRowPercent = stock.daily_profit ? stock.daily_profit / invested * 100 : 0
  const dailyProfitPercent = (dailyProfitRowPercent).toFixed(dailyProfitRowPercent < 1 && dailyProfitRowPercent * 100 > -1 ? 2 : 0)

  stock.isChecked = checkedItems.value.includes(stock.ticker)

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
const filteredStocks = computed(() => sortedStocks.value.filter(el => isShowIlliquid.value ? sortedStocks.value : !illiquidShares.includes(el.ticker)))

async function updateStocksHandler() {
  await Promise.allSettled([getTStocks(), getTStocksUnfoundInfo])
}

function checkStock(item: IStocks) {
  if (checkedItems.value.includes(item.ticker)) checkedItems.value = checkedItems.value.filter(el => el !== item.ticker)
  else checkedItems.value.push(item.ticker)
}

onMounted(async () => {
  await getTStocks()
  await Promise.allSettled([getTStocksInfo(), getTETFsInfo(), getTCurrenciesInfo(), getCryptoPrice()])

  interval.value = setInterval(updateStocksHandler, 5000, true)
})

onBeforeUnmount(() => {
  window.clearInterval(interval.value)
})
</script>

<template>
  <sell-block :filteredStocks :checkedItems/>

  <table v-show="stocks.length">
    <div v-if="isLoading" class="loader">
      <LoaderImage/>
    </div>

    <thead>
    <tr>
      <th>№</th>
      <th>
        <div class="input-container">
          <span>Актив</span>
          <input class='pointer' type="checkbox" id="toggleSwitch" v-model="isShowIlliquid"/>
          <label class='pointer' for="toggleSwitch">Неликвид</label>
        </div>
      </th>
      <th>Количество</th>
      <th>Вложено</th>
      <th>Текущая стоимость</th>
      <th>Прибыль</th>
      <th>Прибыль за день</th>
    </tr>
    </thead>

    <tbody>
    <summary-row :stocks="filteredStocks"/>

    <tr
      v-for="(stock, i) of filteredStocks" :key="stock.ticker + i"
      :style="{background: i % 2 ? '#fff' : '#D3D3D340'}"
    >
      <td>{{ i + 1 }}</td>

      <td>
        <div class="pointer" @click="checkStock(stock)">
          <input class='mr-2' type="checkbox" v-model="stock.isChecked"/>
          <span>{{ stock.name }}</span>
          <span class="description">{{ stock.ticker }}</span>
        </div>
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

      <td :class="stock.profit! > 0 ? 'green' : stock.profit! < 0 ? 'red' : ''">
        <span>{{ numFormat(stock.profit) }}₽</span>
        <span v-if="stock.profitPercent !== '0.00'" class="description">{{ stock.profitPercent }}%</span>
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
  overflow: hidden;
  position: relative;
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 8px;
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

  .input-container {
    display: flex;
    gap: 4px;
    align-items: center;

    :first-child {
      margin-right: 16px;
    }
  }

  input {
    margin: 0;
    height: 16px;
    width: 16px;
    border-radius: 4px;
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

  .loader {
    position: absolute;
    display: flex;
    justify-content: center;
    width: 100%;
    min-width: 60vw;
    height: 100%;
    min-height: 40vh;
    background: rgba(lightgray, 0.7);
    top: 0;
    z-index: 1;

    svg {
      margin-top: 100px;
      width: 150px;
      height: 150px;
    }
  }

  .pointer {
    cursor: pointer;
  }

  .mr-2 {
    margin-right: 8px;
  }
}

</style>
