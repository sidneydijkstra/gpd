<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, updateRepository, deleteRepository, getFiles } from '@/modules/serverApi.js'


const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const files = ref([])

watch(
  route,
  async () => {
    await loadFiles()
  }
)

async function onClickFile(file){
  var path = route.params.folders ? route.params.folders.join('/') + '/' + file.name : file.name
  await router.push(`/repo/${route.params.guid}/${path}`)
}

async function loadRepository(){
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
    .finally(() => {
      isLoading.value = false
    })
}

async function loadFiles(){
  isLoading.value = true
  var path = route.params.folders ? route.params.folders.join('/') : ''
  await getFiles(route.params.guid, path)
    .then(response => {
      if(response.inDirectory){
        response.files.sort((a, b) => (a.isDirectory && !b.isDirectory) ? -1 : (!a.isDirectory && b.isDirectory) ? 1 : a.name.localeCompare(b.name))
      }

      files.value = response
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

onBeforeMount(async () => {
  console.log(route.params.folders)
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

  await loadFiles()
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center">

    <div class="col-6">
      <div class="d-flex align-items-center">
        <fa-icon icon="fa-solid fa-file" size="2x" />
        <h2>&nbsp;{{ repo.username }}/{{ repo.repository }}</h2>
      </div>
      <hr>
      <div v-if="files.inDirectory" class="card">
        <div class="card-header">
          Updated at: {{ repo.content.updated_at }}
        </div>
        <ul class="list-group list-group-flush">
          <li v-for="file in files.files" class="list-group-item list-group-item-action" v-on:click="onClickFile(file)">
            <fa-icon v-if="file.isDirectory" icon="fa-solid fa-folder" size="1x" />
            <fa-icon v-else icon="fa-solid fa-file" size="1x" />
            &nbsp;{{ file.name }}
          </li>
        </ul>
      </div>
      <div v-else class="card">
        <div class="card-header">
          File
        </div>
        <textarea rows="32">{{ files.content }}</textarea>
      </div>
    </div>

  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
</style>
