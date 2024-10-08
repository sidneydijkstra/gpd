<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelinesByRepository, getArtifacts, downloadArtifact } from '@/modules/serverApi.js';

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipelines = ref([])
const selectedPipeline = ref(null)
const artifacts = ref(null)

function onDownloadArtifact(artifact){
  downloadArtifact(artifact.guid)
      .then(response => {
          var fileUrl = URL.createObjectURL(response)
          window.location.assign(fileUrl)
      })
}

function onClickBack(){
  selectedPipeline.value = null
}

function onSelectPipelineTable(selected){
  selectedPipeline.value = selected.data
  getArtifacts({ pipeline: selectedPipeline.value.guid })
    .then(response => {
      artifacts.value = response.reverse()
    })
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
      <template #title>
        <Button icon="pi pi-arrow-left"  size="small" severity="secondary" v-if="selectedPipeline" v-on:click="onClickBack" text />
        {{ repo.username }}/{{ repo.repository }}&nbsp;-&nbsp;Artifacts
      </template>
      <template #content>
          <template v-if="!selectedPipeline">
            <DataTable :value="pipelines" selectionMode="single" tableStyle="min-width: 50rem" @rowSelect="onSelectPipelineTable">
              <Column field="name" header="Name"></Column>
              <Column field="lastUpdated" header="Updated At"></Column>
            </DataTable>
          </template>
          <template v-else>
            <DataTable :value="artifacts" selectionMode="none" tableStyle="min-width: 50rem">
              <Column field="id" header="Id"></Column>
              <Column field="guid" header="Guid"></Column>
              <!-- TODO: refactor object parameters, currently missing link to transaction (we only have trans id) -->
              <!-- <Column field="" header="">
                  <template #body="slotProps">
                      <Button class="m-1" style="width: 100%;" :label="`Navigate To Transaction`" severity="secondary" />
                  </template>
              </Column> -->
              <Column field="" header="">
                  <template #body="slotProps">
                      <Button class="m-1" style="width: 100%;" :label="`Download Artifacts`" severity="primary" @click="onDownloadArtifact(slotProps.data)" />
                  </template>
              </Column>
            </DataTable>
          </template>
      </template>
    </Card>
  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
