import { createApp } from 'vue'
import fontAwesome from './plugins/fontAwesome.js'
import router from './router'
import App from './App.vue'

createApp(App)
    .use(router)
    .use(fontAwesome)
    .mount('#app')
