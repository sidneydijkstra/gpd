<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryByGuid, getPipelineByGuid, addPipeline, updatePipeline } from '@/modules/serverApi.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const repo = ref(null)
const pipeline = ref(null)

function onNavigateBack(){
    if(route.params.pipeGuid == null){
      router.push(`/pipe/${route.params.guid}`)
    } else {
      router.push(`/pipe/${route.params.guid}/trans/${route.params.pipeGuid}`)
    }
}

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
        router.push(`/pipe/${repo.value.guid}/trans/${response.guid}`)
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
  <div v-if="!isLoading">
    <Card>
      <template #title><Button icon="pi pi-arrow-left" size="small" severity="secondary" v-on:click="onNavigateBack" text /> {{ repo.username }}/{{ repo.repository }}</template>
      <template #content>
          <InputGroup>
              <InputText placeholder="Pipeline Name" v-model="pipeline.name" />
              <Button :label="`${route.params.pipeGuid == null ? 'Create' : 'Save'} Pipeline`" severity="secondary" v-on:click="createPipeline" />
          </InputGroup>

          <br>
          
          <Textarea style="width: 100%;font-size: 12px;" rows="30" v-model="pipeline.content" spellcheck="false"></Textarea>
      </template>
    </Card>
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
