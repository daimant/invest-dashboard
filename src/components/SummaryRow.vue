<script setup lang="ts">
import { numFormat } from "../helpers/numFormat.ts";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useStocksStore } from "../store/stocksStore.ts";

const { stocks } = storeToRefs(useStocksStore())

const stocksSpent = computed(() => stocks.value.reduce((acc, curr) => acc + curr.quantity * curr.avg_price, 0))
const stocksAll = computed(() => stocks.value.reduce((acc, curr) => acc + curr.quantity * (curr.current_price || 0), 0))
const stocksProfit = computed(() => stocksAll.value - stocksSpent.value)
const stocksDailyProfit = computed(() => stocks.value.reduce((acc, curr) => acc + (curr.daily_profit || 0), 0))
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