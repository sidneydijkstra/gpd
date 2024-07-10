<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const items = [{
        label: 'Gitter',
        icon: 'pi pi-fw pi-home',
        command: navigateToHome,
    }
];

function navigateToHome() {
    router.push('/');
}

</script>

<template>
    <Menubar :model="items" style="border-radius: 0%;">
        <template #start>
        </template>
        <template #item="{ item, props, hasSubmenu, root }">
            <a class="flex items-center" v-bind="props.action">
                <span :class="item.icon" />
                <span class="ml-2">{{ item.label }}</span>
                <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                <i v-if="hasSubmenu" :class="['pi pi-angle-down', { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root }]"></i>
            </a>
        </template>
        <template #end></template>
    </Menubar>
</template>