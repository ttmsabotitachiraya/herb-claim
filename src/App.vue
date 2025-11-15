<template>
  <Sidebar />
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
</script>