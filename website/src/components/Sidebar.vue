<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = [
    {
        label: 'Repository',
        icon: 'pi pi-folder',
        command: () => navigateTo('repo')
    },
    {
        label: 'Pipelines',
        icon: 'pi pi-box',
        command: () => navigateTo('pipe')
    },
    {
        label: 'Artifacts',
        icon: 'pi pi-shopping-bag',
        command: () => navigateTo('pipe')
    },
    {
        label: 'Storage',
        icon: 'pi pi-warehouse',
        command: () => navigateTo('pipe')
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => navigateTo('settings')
    }
];

function navigateTo(routeName) {
    router.push(`/${routeName}/${route.params.guid}`)
}

</script>

<template>
    <Menu v-if="route.name != 'home'" :model="items" class="w-full md:w-60">
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