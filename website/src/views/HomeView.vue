<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router'
import { getStoredRepositories, getRepository } from '@/modules/serverApi.js'

const router = useRouter()

const repos = ref([])
const repoForm = reactive({
  username: '',
  repository: ''
})

function onAddRepository(){
  console.log(repoForm)

  if(repoForm.username == null || repoForm.username == '' ||
    repoForm.repository == null || repoForm.repository == '')
    return

  getRepository(repoForm.username, repoForm.repository)
    .then(response => {
      response.content = JSON.parse(response.content)
      repos.value.push(response)
    })
}

function onNavigateToRepo(guid){
  router.push(`/repo/${guid}`)
}

onMounted(async () => {
  await getStoredRepositories()
    .then(response => {
      response.forEach(repo => {
        repo.content = JSON.parse(repo.content)
      })
      repos.value = response
    })
})

</script>

<template>
    <!-- Add repository card -->
    <div class="row justify-content-center">
        <div class="col-4">
        
        <br>
        <p>Enter a username and repository name to add the repository to your list.</p>
        <div class="input-group mb-3">
            <input v-model="repoForm.username" type="text" class="form-control" placeholder="Username" aria-label="Username">
            <span class="input-group-text">/</span>
            <input v-model="repoForm.repository" type="text" class="form-control" placeholder="Repository" aria-label="Repository">
        </div>
        <div class="d-grid gap-2 col-8 mx-auto">
            <button type="button" class="btn btn-dark" v-on:click="onAddRepository">Add Repository</button>
        </div>

        </div>
    </div>

    <br>

    <div class="row justify-content-center">
        <div class="col-4">
        <div class="list-group">
            <a v-for="repo in repos" href="#" class="list-group-item list-group-item-action" aria-current="true" v-on:click="onNavigateToRepo(repo.guid)">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ repo.content.full_name }}</h5>
                    <small>{{ repo.content.language }}</small>
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
