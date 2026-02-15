<script setup lang="ts">
import { numFormat } from "../helpers/numFormat.ts";
import { computed } from "vue";
import type { IStocks } from "../types.ts";

const { filteredStocks, checkedItems } = defineProps<{ filteredStocks: IStocks[], checkedItems: string[] }>()

const checkedItemsExtended = computed(() => filteredStocks.filter(el => checkedItems.includes(el.ticker)))
const calculateSellingPrice = computed(() => checkedItemsExtended.value.reduce((acc, curr) => acc + Math.trunc(curr.value || 0), 0))
const calculateSellingDiff = computed(() => checkedItemsExtended.value.reduce((acc, curr) => acc + Math.trunc(curr.profit || 0), 0))

</script>

<template>
  <div v-if="checkedItems.length" class="sell-block">
    <b>Продать на: {{ numFormat(calculateSellingPrice) }}</b>
    <b>Разница с покупкой: {{ numFormat(calculateSellingDiff) }}</b>
  </div>
</template>

<style scoped lang="scss">

.sell-block {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
}

</style>