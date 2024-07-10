import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import router from './router'
import mqtt from './plugins/mqttClient.js'
import primevue from './plugins/primevue.js'
import fontAwesome from './plugins/fontAwesome.js'
import directives from "./directives"
import App from './App.vue'

createApp(App)
    .use(router)
    .use(directives)
    .use(mqtt)
    .use(primevue)
    .use(fontAwesome)
    .mount('#app')
