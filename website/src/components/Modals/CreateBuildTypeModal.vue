<script setup>
import { ref } from "vue";
import DynamicModal from '@/components/Utility/DynamicModal.vue'
import FormCreateBuildType from "@/components/Form/FormCreateBuildType.vue"
import useBuildTypes from '@/composables/machine/useBuildTypes.js'

const props = defineProps({
	name: {
		type: String,
		default: null,
	},
	memory: {
		type: Number,
		default: null,
	},
	cores: {
		type: Number,
		default: null,
	},
	sockets: {
		type: Number,
		default: null,
	},
})

const { create } = useBuildTypes()
const state = ref(false)

function toggle(){
    state.value = !state.value
}

async function onCreateBuildType(result){	
    await create(result.name, result.memory, result.cores, result.sockets)
	state.value = false
}

defineExpose({
    toggle
})
</script>

<template>
<Transition name="dm">
    <template v-if="state">
        <DynamicModal 
            :title="'Create Build Type'" 
            :acceptButton="{disabled: true}" 
            :declineButton="{disabled: true}" 
            @onClose="state = false"
        >
            <FormCreateBuildType :name="props.name" :memory="props.memory" :cores="props.cores" :sockets="props.sockets" :onCompletion="onCreateBuildType" />
        </DynamicModal>
    </template>
</Transition>
</template>

<style>

</style>