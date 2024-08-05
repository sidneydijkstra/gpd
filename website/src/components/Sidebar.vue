<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const homeItems = [
    {
        label: 'Repositories',
        icon: 'pi pi-folder',
        command: () => navigateTo()
    },
    {
        label: 'Agents',
        icon: 'pi pi-box',
        command: () => navigateTo('agents')
    },
    {
        label: 'Global Settings',
        icon: 'pi pi-cog',
        command: () => navigateTo('settings')
    }
]

const repoItems = [
    {
        label: 'Back',
        icon: 'pi pi-arrow-left',
        command: () => navigateTo()
    },
    {
        separator: true
    },
    {
        label: 'Repository',
        icon: 'pi pi-folder',
        command: () => navigateToRepo('repo')
    },
    {
        label: 'Pipelines',
        icon: 'pi pi-box',
        command: () => navigateToRepo('pipe')
    },
    {
        label: 'Artifacts',
        icon: 'pi pi-shopping-bag',
        command: () => navigateToRepo('pipe')
    },
    {
        label: 'Storage',
        icon: 'pi pi-warehouse',
        command: () => navigateToRepo('storage')
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => navigateToRepo('settings')
    }
];

function navigateTo(routeName = '') {
    router.push(`/${routeName}`)
}

function navigateToRepo(routeName) {
    router.push(`/${routeName}/${route.params.guid}`)
}

const getItems = computed(() => route.name != null && route.name.includes('home') ? homeItems : repoItems)

</script>

<template>
    <Menu :model="getItems" class="w-full md:w-60">
        <template #start></template>
        <template #submenulabel="{ item }">
            <span class="text-primary font-bold">{{ item.label }}</span>
        </template>
        <template #item="{ item, props }">
            <a class="flex items-center" v-bind="props.action" v-on:click="item.command">
                <span :class="item.icon" />
                <span>{{ item.label }}</span>
                <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
            </a>
        </template>
        <template #end>
        </template>
    </Menu>
</template>