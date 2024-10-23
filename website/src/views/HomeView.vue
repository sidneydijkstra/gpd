<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router'
import { getStoredRepositories, getRepository } from '@/modules/serverApi.js'

import BlackCircleLoader from '@/components/Utilities/BlackCircleLoader.vue';

const router = useRouter()

const isLoading = ref(false)
const repos = ref([])
const repoForm = reactive({
  username: '',
  repository: ''
})
const formErrorMessage = ref(null)

const source = ref('github')
const sourceOptions = [
  'github',
  'gitlab'
]

function onAddRepository(){
  if(repoForm.username == null || repoForm.username == '' ||
    repoForm.repository == null || repoForm.repository == '')
    return

  if(repos.value.find(x => x.username == repoForm.username && x.repository == repoForm.repository))
    return

  isLoading.value = true
  formErrorMessage.value = null

  getRepository(repoForm.username, repoForm.repository, source.value)
    .then(response => {
      response.content = JSON.parse(response.content)
      repos.value.push(response)
    })
    .catch(error => {
      formErrorMessage.value = error
    })
    .finally(() => {
      isLoading.value = false
      repoForm.username = ''
      repoForm.repository = ''
    })
}

function onNavigateToRepo(guid){
  router.push(`/repo/${guid}`)
}

onMounted(async () => {
  isLoading.value = true
  await getStoredRepositories()
    .then(response => {
      response.forEach(repo => {
        repo.content = JSON.parse(repo.content)
      })
      repos.value = response
    })
    .finally(() => {
      isLoading.value = false
    })
})

</script>

<template>
    <!-- Add repository card -->
    <div class="row justify-content-center">
        <div class="col-6">
        
          <div class="d-flex justify-content-center">
            <SelectButton v-model="source" :options="sourceOptions" aria-labelledby="basic" />
          </div>
          <br>
          <p>Enter a username and repository name to add the repository to your list.</p>
          <div class="input-group mb-3">
              <input v-model="repoForm.username" type="text" class="form-control" placeholder="Username" aria-label="Username">
              <span class="input-group-text">/</span>
              <input v-model="repoForm.repository" type="text" class="form-control" placeholder="Repository" aria-label="Repository">
          </div>
          <div class="d-grid gap-2 col-8 mx-auto">
              <button type="button" class="btn btn-dark" v-on:click="onAddRepository" :disabled="isLoading">Add Repository</button>
          </div>

        </div>
    </div>

    <br>

    <div class="row justify-content-center">
        <div class="col-6">
        <p v-if="formErrorMessage">{{ formErrorMessage }}</p>
        <div v-if="isLoading" class="d-flex justify-content-center">
          <BlackCircleLoader />
        </div>
        <div v-else class="list-group">
            <a v-for="repo in repos" href="#" class="list-group-item list-group-item-action" aria-current="true" v-on:click="onNavigateToRepo(repo.guid)">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ repo.username }}/{{ repo.repository }}</h5>
                    <small>{{ repo.source }}</small>
                </div>
                <p class="mb-1">{{ repo.content.description }}</p>
                <small>Last update at {{ repo.lastUpdated }}</small>
            </a>
        </div>
        </div>
    </div>
</template>

<style scoped>
</style>
