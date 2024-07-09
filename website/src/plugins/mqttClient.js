import mqtt from "mqtt"

var mqttClient = null

export default {
    install: (app) => {
        console.log('MQTT client plugin installed');
        mqttClient = mqtt.connect("ws://192.168.1.2:8888")

        mqttClient.on('connect', function () {
            console.log('Connected to MQTT server');
        })
    }
};