<script setup>
import { onBeforeMount } from 'vue';

const model = defineModel()

onBeforeMount(() => {
    // Try to parse the model value to JSON
    const o = model.value
    if (o && typeof o === "object") {
        model.value = JSON.stringify(model.value, null, 4)
    }
})

</script>

<template>
    <div>
        <h3>File</h3>
        <div class="p-1">
            <Textarea style="width: 100%;font-size: 18px;" rows="20" v-model="model" spellcheck="false"></Textarea>
        </div>
    </div>
</template>