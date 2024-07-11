import { onBeforeMount, onUnmounted, reactive } from "vue";
import { useMqttClient } from "@/plugins/mqttClient.js";

export default function useMqttCallback(topic, callback, force = false) {
    const mqttClient = useMqttClient()

    if(mqttClient == null){
        return
    }

    function _createEvent(){
        // console.log(`[useMqttCallback] Creating event for topic ${topic}`)
        mqttClient.on("message", (_topic, message) => {
            if(topic != _topic) 
                return

            callback(JSON.parse(message.toString()), cancelEvent)
            // console.log(`[useMqttCallback] Event received for topic ${_topic}`)
        });

        mqttClient.subscribe(topic, (err) => {
            // console.log(`[useMqttCallback] Subscribed to topic ${topic}`)
        })
    }

    function cancelEvent(){
        mqttClient.unsubscribe(topic)
    }

    if(force){
        _createEvent()
    }
}