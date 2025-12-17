<script setup lang="ts">
import Table from './components/Table.vue'
import { computed } from "vue";
import { getAuthPass } from "./helpers/getAuthPass.ts";

const isAuth = computed(() => localStorage.pass === getAuthPass())
</script>

<template>
  <Table v-if="isAuth"/>
</template>
