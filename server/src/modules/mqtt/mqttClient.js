import mqtt from "mqtt"

import config from "../../server.config.js"

export default function useMqttClient(){
    const mqttClient = mqtt.connect(config.mqttServerUrl)

    mqttClient.on('connect', function () {
        console.log('[MQTT-Client] Connected to MQTT server');
    })

    return mqttClient
}