import aedes from 'aedes'
import { createServer } from 'aedes-server-factory'

import config from "../../server.config.mjs"

const mqttServer = aedes()
const server = createServer(mqttServer, { ws: true})

export default function initializeMqtt(){
    console.log('MQTT server initialized');
    server.listen(config.mqttServerPort, function () {
        console.log('[MQTT] Server started and listening on port ', config.mqttServerPort)
    })

    if(!config.DEBUG_MODE)
        return
    
    server.on('error', function (err) {
        console.log('[MQTT] Server error', err)
    })
    
    mqttServer.on('subscribe', function (subscriptions, client) {
        console.log('[MQTT] Client subscribed to topics: ', subscriptions)
    })
    
    mqttServer.on('unsubscribe', function (subscriptions, client) {
        console.log('[MQTT] Client unsubscribed to topics: ', subscriptions)
    })
    
    mqttServer.on('client', function (client) {
        console.log('[MQTT] Client connected')
    })
    
    mqttServer.on('clientDisconnect', function (client) {
        console.log('[MQTT] Client disconnected')
    })
    
    mqttServer.on('publish', async function (packet, client) {
        if (client) {
            console.log('[MQTT] Client published message: ', packet.payload.toString())
        }else{
            console.log('[MQTT] Message published: ', packet.payload.toString())
        }    
    })
}

export {
    mqttServer
};