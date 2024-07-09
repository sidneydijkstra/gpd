<script setup>
import SideMenu from '@/components/SideMenu.vue'
import DynamicTable from '@/components/Utilities/DynamicTable.vue'
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelinesByRepository } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipelines = ref([])

function navigateToEdit(){
  router.push(`/pipe/${route.params.guid}/edit`)
}

function onSelectTable(selected){
  router.push(`/pipe/${route.params.guid}/trans/${selected.guid}`)
}

async function reload(){
  isLoading.value = true
  await getRepositoryByGuid(route.params.guid)
    .then(response => {
        response.content = JSON.parse(response.content)
        repo.value = response
    })
    .catch(error => {
        console.log(error)
        router.push('/')
    })

  await getPipelinesByRepository(route.params.guid)
    .then(response => {
      console.log(response)
        pipelines.value = response ?? []
    })
    .catch(error => {
        console.log(error)
    })
    .finally(() => {
        isLoading.value = false
    })

}

onBeforeMount(async () => {
  await reload()
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center">

    <div class="col-4">
      <SideMenu />
    </div>

    <div class="col-6" v-if="!isLoading">
      <div class="d-flex align-items-center">
        <fa-icon icon="fa-solid fa-file" size="2x" />
        <h2>&nbsp;{{ repo.content.full_name }}</h2>
      </div>
      <hr>
      <button type="button" class="btn btn-dark" v-on:click="navigateToEdit">Create Pipeline</button>
      <DynamicTable
          :key="pipelines"
          :data="pipelines"
          :select="true"
          :sort="false"
          :search="false"
          :scroll="true"
          :pages="false"
          :include="['name', 'lastUpdated']"
          v-on:onSelect="onSelectTable"
        />
    </div>

  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
