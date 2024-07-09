import { createApp } from 'vue'
import router from './router'
import mqtt from './plugins/mqttClient.js'
import fontAwesome from './plugins/fontAwesome.js'
import directives from "./directives"
import App from './App.vue'

createApp(App)
    .use(router)
    .use(mqtt)
    .use(fontAwesome)
    .use(directives)
    .mount('#app')
