import { onBeforeMount, onUnmounted, reactive } from "vue";
import { useMqttClient } from "@/plugins/mqttClient.js";

export default function useMqttCallbackOnce(topic, callback, force = false) {
    const mqttClient = useMqttClient()

    if(mqttClient == null){
        return
    }

    function _createEvent(){
        // console.log(`[useMqttCallbackOnce] Creating event for topic ${topic}`)
        mqttClient.on("message", (_topic, message) => {
            if(topic != _topic) 
                return

            callback(JSON.parse(message.toString()))
            mqttClient.unsubscribe(topic)
            // console.log(`[useMqttCallbackOnce] Event received for topic ${_topic}`)
        });

        mqttClient.subscribe(topic, (err) => {
            // console.log(`[useMqttCallbackOnce] Subscribed to topic ${topic}`)
        })
    }

    if(force){
        _createEvent()
    }
}