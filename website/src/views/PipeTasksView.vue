<script setup>
import { onBeforeMount, ref} from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelineByGuid, getPipelineTasks, getArtifacts, downloadArtifact } from '@/modules/serverApi.js'
import pipelineTaskStatus from '@/enums/pipelineTaskStatus.js'
import onMqttCallback from '@/composables/onMqttCallback';
import pipelineStatus from '@/enums/pipelineStatus.js';

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipeline = ref(null)
const tasks = ref(null)
const selectedTask = ref(null)
const artifact = ref(null)

function onDownloadArtifact(){
    downloadArtifact(artifact.value.guid)
        .then(response => {
            var fileUrl = URL.createObjectURL(response)
            window.location.assign(fileUrl)
        })
}

function onNavigateBack(){
    router.push(`/pipe/${route.params.guid}/trans/${route.params.pipeGuid}`)
}

async function onClickTask(task){
    selectedTask.value = task
}

function listenToTransaction(){ 
    onMqttCallback(`trans/${route.params.transGuid}`, (transaction, cancelEvent) => {
        if(transaction.status == pipelineStatus.completed) {
            reload()
            cancelEvent()
        }
    }, true)
}

function listenToTask(taskGuid){
    onMqttCallback(`task/${taskGuid}`, (task, cancelEvent) => {
        // Replace received transaction with the one in the list
        const index = tasks.value.findIndex(x => x.guid === task.guid)
        if (index == -1) return
        tasks.value.splice(index, 1, task)
        // If the transaction is completed or failed, remove the listener
        if (task.status == pipelineTaskStatus.completed || task.status == pipelineTaskStatus.failed) {
            // If the selected task is the one that is completed, set the next task as selected
            var nextIndex = index + 1
            if(selectedTask.value.guid == task.guid && nextIndex < tasks.value.length){
                selectedTask.value = tasks.value[nextIndex]
                // Listen to the next task output
                listenToTaskOutput(selectedTask.value.guid)
            }

            cancelEvent()
        }
    }, true)
}

function listenToTaskOutput(taskGuid){
    onMqttCallback(`task/${taskGuid}/stream`, (stream, cancelEvent) => {
        // Append output to selected task content or cancel event if task is not running anymore
        if (stream.status == pipelineTaskStatus.running) {
            selectedTask.value.content += stream.output
        }else{
            cancelEvent()
        }
    }, true)
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
        .then(async response => {
            if(response.length <= 0)
                return
            
            // Set tasks
            tasks.value = response
            // Set selected task to running task or first task
            selectedTask.value = response.find(x => x.status == pipelineTaskStatus.running) || response[0]

            if(selectedTask.value.status == pipelineTaskStatus.running){
                listenToTaskOutput(selectedTask.value.guid)
            }

            // Loop all tasks and listen for updates if there still running
            var allTaskCompleted = true
            for(let i = 0; i < response.length; i++){
                // Skip completed and failed tasks
                if(response[i].status == pipelineTaskStatus.completed || response[i].status == pipelineTaskStatus.failed)
                    continue

                listenToTask(response[i].guid)
                allTaskCompleted = false
            }

            if(allTaskCompleted){
                await getArtifacts({ transaction: route.params.transGuid})
                    .then(response => {
                        artifact.value = response.length > 0 ? response[0] : null
                    })
            }else{
                listenToTransaction()
            }
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
  <div v-if="!isLoading">
    <Card>
        <template #title>
            <Button icon="pi pi-arrow-left"  size="small" severity="secondary" v-on:click="onNavigateBack" text /> 
            {{ repo.username }}/{{ repo.repository }}
        </template>
        <template #content>
            <div class="row p-0 m-0">
                <div class="col-4">
                    <h5><b>Tasks</b></h5>
                    <ScrollPanel style="width: 100%; height: 720px; padding-right: 8px;">
                        <div v-for="task in tasks" class="m-1">
                            <Panel :collapsed="true" toggleable v-on:click="onClickTask(task)">
                                <template #header>
                                    <span>{{ task.title }}</span>
                                </template>
                                <template #icons>
                                    <ProgressSpinner v-if="task.status == pipelineTaskStatus.running" style="width: 1rem; height: 1rem; color: white !important" strokeWidth="8" />
                                    <i v-else-if="task.status == pipelineTaskStatus.completed" class="pi pi-check-circle" style="font-size: 1rem"></i>
                                    <i v-else-if="task.status == pipelineTaskStatus.failed" class="pi pi-times-circle" style="font-size: 1rem"></i>
                                    &nbsp;
                                </template>
                                <div class="flex flex-row">
                                    <p class="font-bold m-0">Type: {{ task.type }}</p>
                                    <p class="font-bold">Status: {{ task.status }}</p>
                                    <small class="m-0">Updated 2 hours ago</small>
                                </div>
                            </Panel>
                        </div>
                    </ScrollPanel>
                    

                    <div class="d-flex justify-content-center" v-if="artifact">
                        <Button class="m-1" style="width: 100%;" :label="`Download Artifacts`" severity="secondary" @click="onDownloadArtifact()" />
                    </div>
                </div>
                
                <div class="col-8" v-if="selectedTask != null">
                    <h4>{{ selectedTask.type }} - {{ selectedTask.title }}</h4>
                    <Textarea style="width: 100%;font-size: 12px;" rows="40" v-model="selectedTask.content" spellcheck="false"></Textarea>
                </div>
            </div>
        </template>
    </Card>
  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
