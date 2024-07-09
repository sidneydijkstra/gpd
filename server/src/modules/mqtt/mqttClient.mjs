import mqtt from "mqtt"


export default function useMqttClient(){
    const mqttClient = mqtt.connect("ws://192.168.1.2:8888")

    mqttClient.on('connect', function () {
        console.log('Connected to MQTT server');
    })

    return mqttClient
}