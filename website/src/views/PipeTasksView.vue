<script setup>
import SideMenu from '@/components/SideMenu.vue'
import DynamicTable from '@/components/Utilities/DynamicTable.vue'
import { onBeforeMount, ref} from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelineByGuid, getPipelineTasks } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipeline = ref(null)
const tasks = ref(null)
const selectedTask = ref(null)

async function onSelectTable(selected){
    selected.content = selected.content.replace(/\\n/g, '\n').replace(/\\"/g, '\"').slice(1,-1)
    console.log(selected)
    selectedTask.value = selected
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

    await getPipelineTasks(route.params.pipeGuid, route.params.transGuid)
        .then(response => {
            tasks.value = response
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
                    <button type="button" class="btn btn-outline-secondary" v-on:click="onClickRun">X Tasks</button>
                    <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item">Run Pipeline</a></li>
                        <li><a class="dropdown-item">Edit Pipeline</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item">Delete</a></li>
                    </ul>
                </div>
            </div>
        </div>


        <!-- Transaction table -->
        <template v-if="tasks != []">
            <DynamicTable 
                :key="tasks" 
                :data="tasks" 
                :scroll="true"
                :select="true"
                include="['type', 'status', 'lastUpdated']"
                v-on:onSelect="onSelectTable"
            />
        </template>
        <template v-else>
            <p>No tasks</p>
        </template>
        <br>
        <div class="row">
            <div class="col-12" v-if="selectedTask != null">
                <h4>{{ selectedTask.type }}</h4>
                <textarea style="white-space: pre-wrap;width: 100%;" rows="16" v-model="selectedTask.content" spellcheck="false"></textarea>
            </div>
        </div>

    </div>

  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
