import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AgentsView from '@/views/AgentsView.vue'
import SettingsView from '@/views/SettingsView.vue'

import RepoView from '@/views/RepoView.vue'
import StorageView from '@/views/StorageView.vue'
import PipeView from '@/views/PipeView.vue'
import PipeEditView from '@/views/PipeEditView.vue'
import PipeTransView from '@/views/PipeTransView.vue'
import PipeTasksView from '@/views/PipeTasksView.vue'
import PipeArtifactView from '@/views/PipeArtifactView.vue'
import RepoSettingsView from '@/views/RepoSettingsView.vue'

const routes = [
  { name: 'home', path: '/', component: HomeView },
  { name: 'home-agents', path: '/agents', component: AgentsView },
  { name: 'home-settings', path: '/settings', component: SettingsView },
  { name: 'repo', path: '/repo/:guid', component: RepoView },
  { name: 'repo-storage', path: '/storage/:guid', component: StorageView },
  { name: 'repo-view', path: '/repo/:guid/:folders(.*)*', component: RepoView },
  { name: 'pipe', path: '/pipe/:guid', component: PipeView },
  { name: 'pipe-editn', path: '/pipe/:guid/edit', component: PipeEditView },
  { name: 'pipe-edit', path: '/pipe/:guid/edit/:pipeGuid', component: PipeEditView },
  { name: 'pipe-trans', path: '/pipe/:guid/trans/:pipeGuid', component: PipeTransView },
  { name: 'pipe-trans-tasks', path: '/pipe/:guid/trans/:pipeGuid/tasks/:transGuid', component: PipeTasksView },
  { name: 'pipe-artifact', path: '/arti/:guid', component: PipeArtifactView },
  { name: 'repo-settings', path: '/settings/:guid', component: RepoSettingsView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router