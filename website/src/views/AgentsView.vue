<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getAgents } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const agents = ref([])

function onSelectTable(selected){
  console.log(selected)
}

async function reload(){
  await getAgents()
    .then(response => {
      agents.value = response ?? []
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
      <template #title>Agents</template>
      <template #content>
          <DataTable :value="agents" selectionMode="single" tableStyle="min-width: 50rem" @rowSelect="onSelectTable">
              <Column field="name" header="Name"></Column>
              <Column field="running" header="Is Running"></Column>
              <Column field="version" header="Version"></Column>
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
