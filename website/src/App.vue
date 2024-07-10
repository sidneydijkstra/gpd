<script setup>
import Navbar from '@/components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
import { RouterView } from 'vue-router'
</script>

<template>
  <Navbar />
  <div class="row p-1 m-0">
    <div class="col-auto p-1 m-1">
      <Sidebar />
    </div>
    <div class="col p-1 m-1">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
</style>
