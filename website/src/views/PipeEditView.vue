<script setup>
import SideMenu from '@/components/SideMenu.vue'
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelineByGuid, addPipeline, updatePipeline } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipeline = ref(null)

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
    
    if(route.params.pipeGuid != null){
        await getPipelineByGuid(route.params.pipeGuid)
          .then(response => {
            response.content = response.content.replace(/\\n/g, '\n').replace(/\\"/g, '\"').slice(1,-1)
            pipeline.value = response
          })
          .catch(error => {
              console.log(error)
          })
          .finally(() => {
              isLoading.value = false
          })
    }else{
        pipeline.value = {
          name: 'New Pipeline',
          content: ''
        }
        isLoading.value = false
    }
}

async function createPipeline(){
  console.log(pipeline.value)


  if(route.params.pipeGuid != null){
    await savePipeline()
    return
  }

  if(pipeline.value.name == '' || pipeline.value.content == ''){
    return
  }

  await addPipeline(repo.value.guid, pipeline.value.name, pipeline.value.content)
    .then(response => {
        console.log(response)
        router.push(`/pipe/${repo.value.guid}/view/${response.guid}`)
    })
    .catch(error => {
        console.log(error)
    })
}

async function savePipeline(){
  if(pipeline.value.name == '' || pipeline.value.content == ''){
    return
  }

  await updatePipeline(route.params.pipeGuid, pipeline.value.name, pipeline.value.content)
    .then(response => {
        console.log(response)
    })
    .catch(error => {
        console.log(error)
    })
}

onBeforeMount(async () => {
    await reload()

    if(route.params.pipeGuid){
    }
});
</script>

<template>
  <div v-if="!isLoading" class="row justify-content-center">

    <div class="col-4">
      <SideMenu />
    </div>

    <div class="col-6">
      <div class="d-flex align-items-center">
        <fa-icon icon="fa-solid fa-file" size="2x" />
        <h2>&nbsp;{{ repo.content.full_name }}</h2>
      </div>
      <hr>
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="Enter Pipeline Name" v-model="pipeline.name">
        <button class="btn btn-outline-secondary" type="button" v-on:click="createPipeline">{{ route.params.pipeGuid == null ? 'Create' : 'Save' }}</button>
      </div>
      <div class="col-12">
        <textarea style="white-space: pre-wrap;" rows="32" v-model="pipeline.content" spellcheck="false"></textarea>
      </div>
    </div>

  </div>
  <div v-else>
    <p>loading</p>
  </div>
</template>

<style scoped>
textarea {
     width:100%;
     display:block 
}
</style>
