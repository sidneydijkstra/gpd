<script setup>
import { onBeforeMount, reactive, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getStorageByRepository, addStorage, updateStorage, deleteStorage } from '@/modules/serverApi.js';
import { useConfirm } from "primevue/useconfirm";

import StorageJsonEditor from '@/components/Storage/StorageJsonEditor.vue'
import StorageFileEditor from '@/components/Storage/StorageFileEditor.vue';


const storageTypes = [
    'Json', 'File'
]

const route = useRoute()
const router = useRouter()

const updateKey = ref(0)
const isLoading = ref(true)
const repo = ref(null)
const storages = ref(null)
const selectedStorage = ref(null)
const storageError = ref(null)
const storageForm = reactive({
    name: '',
    type: 'Json',
    content: '',
    isLocal: false
})

const confirm = useConfirm();
const onDeleteStorage = async (storage) => {
    confirm.require({
        message: 'Are you sure you want delete this storage?',
        header: `Removing ${storage.name}`,
        icon: 'icon-delete',
        rejectLabel: 'Cancel',
        acceptLabel: 'Remove',
        acceptClass: 'p-button-danger',
        accept: () => removeStorage(storage),
    });
}

async function selectStorage(storage){
    selectedStorage.value = storage
    storageForm.name = storage.name
    storageForm.type = storage.type
    storageForm.content = storage.content
    storageForm.isLocal = storage.repoId != null
    storageError.value = null
    updateKey.value++
}

async function createStorage(){
    selectedStorage.value = null
    storageForm.name = ''
    storageForm.type = 'Json'
    storageForm.content = {}
    storageForm.isLocal = false
    storageError.value = null
    updateKey.value++
    console.log(storageForm)
}

async function buildStorage(){
    if(storageForm.name == ''){
        storageError.value = 'Storage name is required'
        return
    }

    var content = storageForm.content
    try {
        if(storageForm.type == 'Json'){
            content = JSON.stringify(storageForm.content)
        }
    } catch (error) {
        storageError.value = 'Invalid JSON'
        return
    }

    const repoGuid = storageForm.isLocal ? route.params.guid : null

    if(isNewStorage.value){
        addStorage(storageForm.name, storageForm.type, content, repoGuid)
            .then(async response => {
                await reload()

                // Select the new storage
                const storage = storages.value.find(storage => storage.guid == response)
                if(storage)
                    selectStorage(storage)
            })
            .catch(error => {
                storageError.value = error
            })
    } else {
        updateStorage(selectedStorage.value.guid, storageForm.name, storageForm.type, content, repoGuid)
            .then(async response => {
                await reload()

                // Select the updated storage
                const storage = storages.value.find(storage => storage.guid == response)
                if(storage)
                    selectStorage(storage)
            })
            .catch(error => {
                storageError.value = error
            })
    }
}

async function removeStorage(storage){
    deleteStorage(storage.guid)
        .then(async response => {
            await reload()
            createStorage()
        })
        .catch(error => {
            storageError.value = error
        })
}

async function reload(){
    isLoading.value = true
    await getRepositoryByGuid(route.params.guid)
        .then(response => {
            repo.value = response
        })
        .catch(error => {
            console.error(error)
        })

    await getStorageByRepository(route.params.guid)
        .then(response => {
            storages.value = response
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            isLoading.value = false
        })
}

const isNewStorage = computed(() => {
    return selectedStorage.value == null
})

onBeforeMount(async () => {
    await reload()
});
</script>

<template>
  <div v-if="!isLoading">
    <Card>
        <template #title>{{ repo.username }}/{{ repo.repository }}&nbsp;-&nbsp;Storage</template>
        <template #content>
            <div class="row p-0 m-0">
                <div class="col-4">
                    <h5><b>Storages</b></h5>
                    <ScrollPanel style="width: 100%; height: 720px; padding-right: 8px;">
                        <div v-for="storage in storages" class="m-1 d-flex">
                            <Panel :collapsed="true" toggleable @click="selectStorage(storage)" style="width: 100%;">
                                <template #header>
                                    <span>{{ storage.name }}</span>
                                </template>
                                <template #icons>
                                    <Button label="delete" severity="danger" rounded text @click="onDeleteStorage(storage)" />
                                    &nbsp;
                                </template>
                                {{ storage.guid }}
                            </Panel>
                        </div>
                        <div>
                            <Button class="m-1" style="width: 100%;" :label="`New`" severity="secondary" @click="createStorage()" />
                        </div>
                    </ScrollPanel>
                </div>
                
                <div class="col-8">
                    <p v-if="storageError" class="error-text">
                        {{ storageError }}
                    </p>

                    <div class="d-flex">
                        <div class="col-5 p-1">
                            <InputText style="width: 100%;" placeholder="Storage Name" v-model="storageForm.name" />
                        </div>
                        <div class="col-3 p-1">
                            <Button style="width: 100%;" :label="isNewStorage ? `Create Storage` : `Update Storage`" severity="secondary" @click="buildStorage" />
                        </div>
                        <div class="col-2 p-1">
                            <Select style="width: 100%;" v-model="storageForm.type" :options="storageTypes" placeholder="Select Type" />
                        </div>
                        <div class="col-2 p-1 d-flex justify-content-center align-items-center">
                            <label>Local</label>
                            <ToggleSwitch class="m-2" v-model="storageForm.isLocal" />
                        </div>
                    </div>
                    <br>
                    <StorageJsonEditor :key="updateKey" v-if="storageForm.type == 'Json'" v-model="storageForm.content" />
                    <StorageFileEditor :key="updateKey" v-if="storageForm.type == 'File'" v-model="storageForm.content" />
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
.error-text {
    color: red;
}
</style>
