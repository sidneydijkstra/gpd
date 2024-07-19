<script setup>
import { getPipelinesByRepository } from '@/modules/serverApi.js';
import { onMounted, ref } from 'vue';

const pipeline = defineModel()
const props = defineProps({
    repoGuid: {
        type: String,
        required: true
    },
    pipelineGuid: {
        type: String,
        default: null,
        required: false
    }
})

const isLoading = ref(true)
const pipelines = ref([])

onMounted(async () => {
    getPipelinesByRepository(props.repoGuid)
        .then(response => {
            pipelines.value = response

            if (props.pipelineGuid) {
                var pipe = pipelines.value.find(p => p.guid === props.pipelineGuid)
                pipeline.value = pipe ? pipe.guid : null
            }
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            isLoading.value = false
        })
})
</script>

<template>
    <Select v-model="pipeline" :options="pipelines" optionLabel="name" optionValue="guid" :loading="isLoading" placeholder="Select pipeline" />
</template>

<style scoped>
</style>