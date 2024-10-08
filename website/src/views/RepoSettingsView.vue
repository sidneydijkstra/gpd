<script setup>
import PipelineSelect from '@/components/PipelineSelect.vue';
import { onBeforeMount, onMounted, reactive, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, updateRepository, deleteRepository, getSettings, updateSetting, updateRepositorySetting } from '@/modules/serverApi.js'
import { useConfirm } from 'primevue/useconfirm';

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)

const settingsError = ref('')
const savedSettings = reactive({})
const settings = reactive({
  checkerEnabled: false,
  checkerPipeline: ''
})

const confirm = useConfirm();
const onDeleteRepository = async () => {
    confirm.require({
        message: 'Are you sure you want delete this repository?',
        header: `Removing ${repo.value.username}/${repo.value.repository}`,
        icon: 'icon-delete',
        rejectLabel: 'Cancel',
        acceptLabel: 'Remove',
        acceptClass: 'p-button-danger',
        accept: onClickDelete,
    });
}

async function saveSettings(){
  if(!settingsChanged)
    return

  // Check if checker is enabled and a pipeline is selected
  if(settings.checkerEnabled && !settings.checkerPipeline){
    settingsError.value = 'Please select a pipeline.'
    return
  }
  
  // Disable checker if it is not enabled
  settings.checkerPipeline = settings.checkerEnabled ? settings.checkerPipeline : ''

  await updateRepositorySetting(route.params.guid, 'checkerEnabled', settings.checkerEnabled)
  await updateRepositorySetting(route.params.guid, 'checkerPipeline', settings.checkerPipeline)
  settingsError.value = null
  await reloadSettings()
}

async function onClickUpdate(){
  await updateRepository(route.params.guid)
    .then(async response => {
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

const settingsChanged = computed(() => {
  return settings.checkerEnabled != savedSettings.checkerEnabled || 
         settings.checkerPipeline != savedSettings.checkerPipeline
})

async function reloadSettings(){
  isLoading.value = true
  await getSettings(route.params.guid)
    .then(response => {
      var checkerEnabled = response.find(x => x.key == 'checkerEnabled')
      settings.checkerEnabled = checkerEnabled == null ? false : checkerEnabled.value == '1'
      var checkerPipeline = response.find(x => x.key == 'checkerPipeline')
      settings.checkerPipeline = checkerPipeline == null ? null : checkerPipeline.value
      
      savedSettings.checkerEnabled = settings.checkerEnabled
      savedSettings.checkerPipeline = settings.checkerPipeline
    })
    .catch(error => {
      settingsError.value = error
    })
    .finally(() => {
      isLoading.value = false
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

  await reloadSettings()
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center m-0">
    <Card>
      <template #title>
        <div class="d-flex justify-content-between">
          <span>
            {{ repo.username }}/{{ repo.repository }}&nbsp;-&nbsp;Settings
          </span>
          <Button v-if="settingsChanged" v-on:click="saveSettings()" class="p-0" label="Save" text />
        </div>
      </template>
      <template #content>
        <br>
        <div class="d-flex justify-content-center">
          <hr>
          <div class="col-6 m-0 p-1">
            <p v-if="settingsError" class="error-text">
              {{ settingsError }}
            </p>
            <small>Automatically start a pipeline when there is a new commit. Enable the git checker and select the pipeline to run.</small>
            
            <div class="row m-1 p-2">
              <div class="col-6 d-flex justify-content-center align-items-center">
                <label>Enable Checker</label>
                <ToggleSwitch class="m-2" v-model="settings.checkerEnabled" />
              </div>
              <div class="col-6">
                <PipelineSelect class="w-100" :repoGuid="route.params.guid" :pipelineGuid="settings.checkerPipeline" v-model="settings.checkerPipeline" />
              </div>
            </div>

            <hr>

            <div class="row m-1 p-2">
              <small>If you don't want to enable the checker you can also use the update button to manual update the repository.</small>
              <div class="d-grid gap-2 p-2">
                <Button class="p-button-success" @click="onClickUpdate">Update</Button>
              </div>
              <small>If you want to delete the repository you can use the delete button. Deleting the repository will also delete all the related resources!</small>
              <div class="d-grid gap p-2">
                <Button class="p-button-danger" @click="onDeleteRepository">Delete</Button>
              </div>
            </div>
            
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
  color: #ff0000;
}
</style>
