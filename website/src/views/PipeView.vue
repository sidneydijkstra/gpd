<script setup>
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
  console.log(selected)
  router.push(`/pipe/${route.params.guid}/trans/${selected.data.guid}`)
}

async function reload(){
  isLoading.value = true
  await getRepositoryByGuid(route.params.guid)
    .then(response => {
        response.content = JSON.parse(response.content)
        repo.value = response
        console.log(response)
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
  <div v-if="!isLoading" class="row justify-content-center m-0">
    <Card>
      <template #title>{{ repo.username }}/{{ repo.repository }}</template>
      <template #content>
          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <Button label="Create Pipeline" icon="pi pi-home" aria-label="Save" severity="secondary" v-on:click="navigateToEdit" />  
          </div>

          <DataTable :value="pipelines" selectionMode="single" tableStyle="min-width: 50rem" @rowSelect="onSelectTable">
              <Column field="name" header="Name"></Column>
              <Column field="lastUpdated" header="Updated At"></Column>
          </DataTable>
      </template>
    </Card>
  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
