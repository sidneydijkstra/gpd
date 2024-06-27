<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepository, getFiles } from '@/modules/serverApi.js'


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
  await router.push(`/repo/${route.params.username}/${route.params.repository}/${path}`)
}

async function loadFiles(){
  isLoading.value = true
  var path = route.params.folders ? route.params.folders.join('/') : ''
  await getFiles(route.params.username, route.params.repository, path)
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
  await getRepository(route.params.username, route.params.repository)
    .then(response => {
      console.log(response)
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
        <h3>{{ repo.full_name }}</h3>
        <div v-if="files.inDirectory" class="card">
          <div class="card-header">
            Updated at: {{ repo.updated_at }}
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
