<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, updateRepository, deleteRepository } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)

async function onClickUpdate(){
  await updateRepository(route.params.guid)
    .then(async response => {
      await loadRepository()
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
    })
}

async function onClickDelete(){
  await deleteRepository(route.params.guid)
    .then(response => {
      router.push('/')
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
    })
}

onBeforeMount(async () => {
  await getRepositoryByGuid(route.params.guid)
    .then(response => {
        response.content = JSON.parse(response.content)
        repo.value = response
    })
    .catch(error => {
        console.log(error)
        router.push('/')
    })
    .finally(() => {
        isLoading.value = false
    })
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center">

    <div class="col-6">
      <div class="d-flex align-items-center">
        <fa-icon icon="fa-solid fa-file" size="2x" />
        <h2>&nbsp;{{ repo.content.full_name }}</h2>
      </div>
      <hr>
      <button class="btn btn-dark m-1" v-on:click="onClickUpdate">Update</button>
      <button class="btn btn-danger m-1" v-on:click="onClickDelete">delete</button>
      <br>
      <small>Last update: {{ repo.lastUpdated }}</small>
    </div>

  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
