<script setup>
import SideMenu from '@/components/SideMenu.vue'
import DynamicTable from '@/components/Utilities/DynamicTable.vue'
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelineByGuid, getPipelineTransactions, runPipeline, deletePipeline } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipeline = ref(null)
const transactions = ref(null)

async function onClickRun(){
    await runPipeline(route.params.pipeGuid)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        })

    await getPipelineTransactions(route.params.pipeGuid)
        .then(response => {
            transactions.value = response.reverse()
        })
        .catch(error => {
            console.log(error)
        })
}

async function onClickEdit(){
    router.push('/pipe/' + route.params.guid + '/edit/' + route.params.pipeGuid)
}

async function onClickDelete(){
    await deletePipeline(route.params.pipeGuid)
        .then(response => {
            router.push('/pipe/' + route.params.guid)
        })
        .catch(error => {
            console.log(error)
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
    
    await getPipelineByGuid(route.params.pipeGuid)
        .then(response => {
            pipeline.value = response
        })
        .catch(error => {
            console.log(error)
        })

    await getPipelineTransactions(route.params.pipeGuid)
        .then(response => {
            transactions.value = response.reverse()
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

        <div class="d-flex justify-content-between">
            <div>
                <h3>{{ pipeline.name }}</h3>    
            </div>

            <div>
                <div class="input-group">
                    <button type="button" class="btn btn-outline-secondary" v-on:click="onClickRun">Run Pipeline</button>
                    <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" v-on:click="onClickRun">Run Pipeline</a></li>
                        <li><a class="dropdown-item" v-on:click="onClickEdit">Edit Pipeline</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" v-on:click="onClickDelete">Delete</a></li>
                    </ul>
                </div>
            </div>
        </div>


        <!-- Transaction table -->
        <template v-if="transactions != []">
            <DynamicTable 
                :key="transactions" 
                :data="transactions" 
                :scroll="true"
                include="['type', 'status', 'lastUpdated']"
            />
        </template>
        <template v-else>
            <p>No transactions</p>
        </template>

    </div>

  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
