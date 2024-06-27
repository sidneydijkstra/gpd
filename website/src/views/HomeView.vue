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
      repos.value.push(response)
    })
}

function onNavigateToRepo(fullName){
  router.push(`/repo/${fullName}`)
}

onMounted(async () => {
  await getStoredRepositories()
    .then(response => {
      repos.value = response
    })
})

</script>

<template>
    <!-- Add repository card -->
    <div class="row justify-content-center">
        <div class="col-4">

        <h1 class="text-center">Gitter</h1>
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
            <a v-for="repo in repos" href="#" class="list-group-item list-group-item-action" aria-current="true" v-on:click="onNavigateToRepo(repo.full_name)">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ repo.full_name }}</h5>
                    <small>{{ repo.language }}</small>
                </div>
                <p class="mb-1">{{ repo.description }}</p>
                <small>Not updated.</small>
            </a>
        </div>
        </div>
    </div>
</template>

<style scoped>
</style>
