import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import RepoView from '@/views/RepoView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/repo/:username/:repository', component: RepoView },
  { path: '/repo/:username/:repository/:folders(.*)*', component: RepoView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router