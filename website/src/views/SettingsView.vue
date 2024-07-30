<script setup>
import PipelineSelect from '@/components/PipelineSelect.vue';
import { onBeforeMount, onMounted, reactive, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, updateRepository, deleteRepository, getSettings, updateSetting, updateRepositorySetting } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)

const modeOptions = [
  'None',
  'Local',
  'Docker'
]

const settingsError = ref('')
const savedSettings = reactive({})
const settings = reactive({
  githubAccessToken: 'Not implemented',
  gitlabAccessToken: 'Not implemented',
  mode: ''
})

async function saveSettings(){
  if(!settingsChanged)
    return

  await updateSetting('mode', settings.mode)
  settingsError.value = null
  await reloadSettings()
}

const settingsChanged = computed(() => {
  return settings.githubAccessToken != savedSettings.githubAccessToken || 
         settings.gitlabAccessToken != savedSettings.gitlabAccessToken || 
         settings.mode != savedSettings.mode
})

async function reloadSettings(){
  isLoading.value = true
  await getSettings(route.params.guid)
    .then(response => {
      var mode = response.find(x => x.key == 'mode')
      settings.mode = mode == null ? 'None' : mode.value

      savedSettings.githubAccessToken = settings.githubAccessToken
      savedSettings.gitlabAccessToken = settings.gitlabAccessToken
      savedSettings.mode = settings.mode
    })
    .catch(error => {
      settingsError.value = error
    })
    .finally(() => {
      isLoading.value = false
    })
}

onBeforeMount(async () => {
  await reloadSettings()
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center m-0">
    <Card>
      <template #title>
        <div class="d-flex justify-content-between">
          <h4 class="p-0 m-0">Global Settings</h4>
          <Button v-if="settingsChanged" v-on:click="saveSettings" class="p-0" label="Save Changes" text />
        </div>
      </template>
      <template #content>
        <br>
        <div class="d-flex justify-content-center">
          <div class="col-6 m-0 p-1">
            <!-- <div class="d-flex justify-content-between">
              <h4 class="p-0 m-0">Global Settings</h4>
              <Button v-if="globalSettingsChanged" v-on:click="saveGlobalSettings" class="p-0" label="Save" text />
              <p></p>
            </div> -->
            <!-- <hr> -->
            <p v-if="settingsError" class="error-text">
              {{ settingsError }}
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
