<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';
import { hasTokens } from '@/modules/serverApi.js';

import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const route = useRoute();
const router = useRouter();
const isActionNeeded = ref(false);

onBeforeMount(async () => {
  await hasTokens()
    .then(response => {
      isActionNeeded.value = !response.githubToken && !response.gitlabToken;

      if(isActionNeeded.value){
        router.push({ name: 'home-settings' });
      }
    });
});

</script>

<template>
  <template v-if="!isActionNeeded">
    <Navbar />
    <div class="row p-1 m-0">
      <div class="col-auto p-1 m-1">
        <Sidebar />
      </div>
      <div class="col p-1 m-1">
        <RouterView :key="route.fullPath" />
      </div>
    </div>
  </template>
  <template v-else>
    <div class="row p-1 m-0">
      <div class="col p-1 m-1">
        <RouterView :key="route.fullPath" />
      </div>
    </div>
  </template>

  <!-- Confirm Dialog from primevue -->
  <ConfirmDialog />
</template>

<style scoped>
</style>
