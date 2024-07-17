<script setup>
import { onBeforeMount, onMounted, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useConfirm } from "primevue/useconfirm";
import { getRepositoryByGuid, getPipelineByGuid, getPipelineTransactions, runPipeline, deletePipeline } from '@/modules/serverApi.js'
import pipelineStatus from '@/enums/pipelineStatus.js'
import onMqttCallback from '@/composables/onMqttCallback.js';

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipeline = ref(null)
const transactions = ref(null)

// Variables for popup
const confirm = useConfirm();
const isVisible = ref(false);

const dropdownItems = [
    { label: 'Run Pipeline', icon: 'pi pi-fw pi-play', command: () => onClickRun() },
    { label: 'Edit Pipeline', icon: 'pi pi-fw pi-pencil', command: () => onClickEdit() },
    { separator: true },
    { label: 'Delete', icon: 'pi pi-fw pi-trash', command: () => openDeletePopup() }
]

function onNavigateBack(){
    router.push(`/pipe/${route.params.guid}`)
}

function openDeletePopup(event) {
    confirm.require({
        message: 'Are you sure you want to delete this pipeline?',
        header: 'Confirmation',
        accept: () => onClickDelete(),
        onShow: () => {
            isVisible.value = true;
        },
        onHide: () => {
            isVisible.value = false;
        }
    });
}

async function onClickRun(){
    await runPipeline(route.params.pipeGuid)
        .then(response => {
            onMqttCallback(`trans/${response.guid}`, (transaction, cancelEvent) => {
                // Replace received transaction with the one in the list
                const index = transactions.value.findIndex(x => x.guid === transaction.guid)
                if (index == -1) return
                transactions.value.splice(index, 1, transaction)

                // If the transaction is completed or failed, remove the listener
                if (transaction.status == pipelineStatus.completed || transaction.status == pipelineStatus.failed) {
                    cancelEvent()
                }
            }, true)
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

function onSelectTable(selected){
    router.push(`/pipe/${route.params.guid}/trans/${route.params.pipeGuid}/tasks/${selected.data.guid}`)
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
            if(response.length <= 0)
                return
            
            transactions.value = response.reverse()

            // Loop all transactions and listen for updates if there still running
            for(let i = 0; i < response.length; i++){
                // Skip completed and failed transactions
                if(response[i].status == pipelineStatus.completed || response[i].status == pipelineStatus.failed)
                    continue

                onMqttCallback(`trans/${response[i].guid}`, (transaction, cancelEvent) => {
                    // Replace received transaction with the one in the list
                    const index = transactions.value.findIndex(x => x.guid === transaction.guid)
                    if (index == -1) return
                    transactions.value.splice(index, 1, transaction)

                    // If the transaction is completed or failed, remove the listener
                    if (transaction.status == pipelineStatus.completed || transaction.status == pipelineStatus.failed) {
                        cancelEvent()
                    }
                }, true)
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
  <div v-if="!isLoading" class="row justify-content-center p-0 m-0">
    <Card>
      <template #title><Button icon="pi pi-arrow-left"  size="small" severity="secondary" v-on:click="onNavigateBack" text /> {{ repo.username }}/{{ repo.repository }}</template>
      <template #content>
            <div class="d-flex justify-content-between">
                <div>
                    <h5>{{ pipeline.name }}</h5>    
                </div>

                <ConfirmDialog>
                    <template #accepticon>
                        Yes
                    </template>
                    <template #rejecticon>
                        No
                    </template>
                </ConfirmDialog>
                <SplitButton label="Run" @click="onClickRun" :model="dropdownItems" severity="secondary" />
            </div>

            <DataTable :value="transactions" selectionMode="single" tableStyle="min-width: 50rem" @rowSelect="onSelectTable">
                <Column field="type" header="Type"></Column>
                <Column field="status" header="Status"></Column>
                <Column field="lastUpdated" header="Updated At"></Column>
                <Column field="price" header="">
                    <template #body="slotProps">
                        <ProgressSpinner v-if="slotProps.data.status == pipelineStatus.running" style="width: 1rem; height: 1rem; color: white !important" strokeWidth="8" />
                        <i v-else-if="slotProps.data.status == pipelineStatus.completed" class="pi pi-check-circle" style="font-size: 1rem"></i>
                        <i v-else-if="slotProps.data.status == pipelineStatus.failed" class="pi pi-times-circle" style="font-size: 1rem"></i>
                    </template>
                </Column>
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
