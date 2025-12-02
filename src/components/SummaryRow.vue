<script setup lang="ts">
import { numFormat } from "../helpers/numFormat.ts";
import { computed } from "vue";
import type { IStocks } from "../types.ts";

const { stocks } = defineProps<{ stocks: IStocks[] }>()

const stocksSpent = computed(() => stocks.reduce((acc, curr) => acc + curr.quantity * curr.avg_price, 0))
const stocksAll = computed(() => stocks.reduce((acc, curr) => acc + curr.quantity * (curr.current_price || 0), 0))
const stocksProfit = computed(() => stocksAll.value - stocksSpent.value)
const stocksDailyProfit = computed(() => stocks.reduce((acc, curr) => acc + (curr.daily_profit || 0), 0))
</script>

<template>
  <tr>
    <td>Всего</td>
    <td/>
    <td/>
    <td><b>{{ numFormat(stocksSpent) }} ₽</b></td>
    <td><b>{{ numFormat(stocksAll) }} ₽</b></td>
    <td><b>{{ numFormat(stocksProfit) }} ₽</b></td>
    <td><b>{{ numFormat(stocksDailyProfit) }} ₽</b></td>
  </tr>
</template>

<style scoped lang="scss">

</style>