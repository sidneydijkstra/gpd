import { createApp } from 'vue'
import router from './router'
import fontAwesome from './plugins/fontAwesome.js'
import directives from "./directives"
import App from './App.vue'

createApp(App)
    .use(router)
    .use(fontAwesome)
    .use(directives)
    .mount('#app')
