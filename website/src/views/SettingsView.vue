<script setup>
import PipelineSelect from '@/components/PipelineSelect.vue';
import { onBeforeMount, onMounted, reactive, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, updateRepository, deleteRepository, getSettings, updateSetting, updateRepositorySetting } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)

const modeOptions = [
  'None',
  'Local',
  'Docker'
]
const pipelineOptions = [
  { name: 'Build', value: 'build'},
  { name: 'Test', value: 'test'},
  { name: 'Deploy', value: 'deploy'}
]

const globalSettingsError = ref('')
const repositorySettingsError = ref('')
const savedSettings = reactive({})
const settings = reactive({
  githubAccessToken: '...',
  gitlabAccessToken: '...',
  mode: '',
  checkerEnabled: false,
  checkerPipeline: ''
})

async function saveGlobalSettings(){
  if(!globalSettingsChanged)
    return

  await updateSetting('mode', settings.mode)
  globalSettingsError.value = null
  await reloadSettings()
}

async function saveRepositorySettings(){
  if(!repositorySettingsChanged)
    return

  // Check if checker is enabled and a pipeline is selected
  if(settings.checkerEnabled && !settings.checkerPipeline){
    repositorySettingsError.value = 'Please select a pipeline.'
    return
  }

  // Disable checker if it is not enabled
  settings.checkerPipeline = settings.checkerEnabled ? settings.checkerPipeline : ''

  await updateRepositorySetting(route.params.guid, 'checkerEnabled', settings.checkerEnabled)
  await updateRepositorySetting(route.params.guid, 'checkerPipeline', settings.checkerPipeline)
  repositorySettingsError.value = null
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

const globalSettingsChanged = computed(() => {
  return settings.githubAccessToken != savedSettings.githubAccessToken || settings.gitlabAccessToken != savedSettings.gitlabAccessToken || settings.mode != savedSettings.mode
})
const repositorySettingsChanged = computed(() => {
  return settings.checkerEnabled != savedSettings.checkerEnabled || settings.checkerPipeline != savedSettings.checkerPipeline
})

async function reloadSettings(){
  isLoading.value = true
  await getSettings(route.params.guid)
    .then(response => {
      console.log(response)
      var mode = response.find(x => x.key == 'mode')
      settings.mode = mode == null ? 'None' : mode.value
      var checkerEnabled = response.find(x => x.key == 'checkerEnabled')
      settings.checkerEnabled = checkerEnabled == null ? false : checkerEnabled.value == '1'
      var checkerPipeline = response.find(x => x.key == 'checkerPipeline')
      settings.checkerPipeline = checkerPipeline == null ? null : checkerPipeline.value

      savedSettings.githubAccessToken = settings.githubAccessToken
      savedSettings.gitlabAccessToken = settings.gitlabAccessToken
      savedSettings.mode = settings.mode
      savedSettings.checkerEnabled = settings.checkerEnabled
      savedSettings.checkerPipeline = settings.checkerPipeline
    })
    .catch(error => {
      console.log(error)
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
    .finally(() => {
    })

  await reloadSettings()
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center m-0">
    <Card>
      <template #title>{{ repo.username }}/{{ repo.repository }}</template>
      <template #content>
        <br>
        <div class="d-flex justify-content-center">
          <div class="col-4 m-0 p-1">
            <div class="d-flex justify-content-between">
              <h4 class="p-0 m-0">Global Settings</h4>
              <Button v-if="globalSettingsChanged" v-on:click="saveGlobalSettings" class="p-0" label="Save" text />
              <p></p>
            </div>
            <hr>
            <p v-if="globalSettingsError" class="error-text">
              {{ globalSettingsError }}
            </p>
            <small>These tokens are used to connect to the different git platforms.</small>
            
            <div class="d-grid gap-2 m-1">
              <p class="m-0">Github Access Token</p>
              <InputText class="" v-model="settings.githubAccessToken" />
            </div>
            <div class="d-grid gap-2 m-1">
              <p class="m-0">Gitlab Access Token</p>
              <InputText class="" v-model="settings.gitlabAccessToken" />
            </div>
            <hr>
            
            <div class="row p-0 m-0">
              <div class="col-6">
                <small>Different modes can be used for CI/CD. Local mode is running the pipelines directly on the host machine. With Docker we run the pipelines inside agent containers.</small>
              </div>
              <div class="col-6">
                <div class="d-flex justify-content-center m-1">
                  <Listbox v-model="settings.mode" :options="modeOptions" style="width: 230px;" />
                </div>
              </div>
            </div>

          </div>
          <div class="col-5 m-0 p-1">
            <div class="d-flex justify-content-between">
              <h4 class="p-0 m-0">Repository Settings</h4>
              <Button v-if="repositorySettingsChanged" v-on:click="saveRepositorySettings" class="p-0" label="Save" text />
              <p></p>
            </div>
            <hr>
            <p v-if="repositorySettingsError" class="error-text">
              {{ repositorySettingsError }}
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
                <Button class="p-button-danger" @click="onClickDelete">Delete</Button>
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
