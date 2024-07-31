import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import router from './router'
import mqtt from './plugins/mqttClient.js'
import primevue from './plugins/primevue.js'
import fontAwesome from './plugins/fontAwesome.js'
import directives from "./directives"
import App from './App.vue'

import config from './website.config.js'

createApp(App)
    .use(router)
    .use(directives)
    .use(mqtt, { url: config.mqttServerUrl })
    .use(primevue)
    .use(fontAwesome)
    .mount('#app')
