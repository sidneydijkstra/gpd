import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import RepoView from '@/views/RepoView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/repo/:guid', component: RepoView },
  { path: '/repo/:guid/:folders(.*)*', component: RepoView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router