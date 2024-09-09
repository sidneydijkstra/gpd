import mqtt from "mqtt"

var mqttClient = null

export default {
    install: (app, config) => {
        if (config.url == null || config.url == '') {
            console.error('Please provide a valid MQTT server URL');
            return;
        }

        console.log('MQTT client plugin installed');
        mqttClient = mqtt.connect(config.url)
        mqttClient.setMaxListeners(50) // <-- TODO: this is bad practice... But works for now.

        mqttClient.on('connect', function () {
            console.log('Connected to MQTT server');
        })
    }
};

export function useMqttClient() {
    return mqttClient
}