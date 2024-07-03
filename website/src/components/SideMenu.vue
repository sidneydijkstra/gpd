<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function navigateBack() {
    router.push('/')
}

function navigateTo(routeName) {
    router.push(`/${routeName}/${route.params.guid}`)
}
</script>

<template>
    <div class="list-group list-group-flush">
        <button type="button" class="list-group-item list-group-item-action" v-on:click="navigateBack">Back</button>
        <button type="button" class="list-group-item list-group-item-action" v-on:click="navigateTo('repo')" :class="{'activated': route.name == 'repo'}">Repository</button>
        <button type="button" class="list-group-item list-group-item-action" v-on:click="navigateTo('pipe')" :class="{'activated': route.name == 'pipe'}">Pipelines</button>
        <button type="button" class="list-group-item list-group-item-action" :class="{'activated': route.name == 'storage'}">Storage</button>
        <button type="button" class="list-group-item list-group-item-action" v-on:click="navigateTo('settings')" :class="{'activated': route.name == 'settings'}">Settings</button>
        <button type="button" class="list-group-item list-group-item-action" disabled>History</button>
    </div>
</template>

<style scoped>
.activated {
    background-color: lightgray;
}
</style>
