<script setup>
import { ref, onBeforeMount } from 'vue'

const props = defineProps({
    default: {
        type: Object,
        default: { Variable: '' },
        required: false
    }
})

const model = defineModel() 
const variables = ref([])
const savedVariables = ref([])

onBeforeMount(() => {
    // Try to parse the model value to JSON, 
    // if it fails set it to an default object
    var value = updateVariables(model.value)
    model.value = value
})

/**
 * Updates the variables based on the provided JSON string.
 * 
 * @param {string} value - The JSON string to parse and update variables from.
 * @returns {object} - The parsed and validated object.
 */
function updateVariables(value){
    try {
        value = JSON.parse(value)

        // If parsed value is not an object set default object
        if(value == null || value == '' || typeof value !== 'object'){
            value = props.default
        }
        // If parsed value is number also set default object
        else if(typeof value === 'number'){
            value = props.default
        }
    } catch (error) {
        value = props.default
    }

    // Get all keys of model object
    var keys = Object.keys(value)
    // Loop over all keys and create a variable object
    for (var i = 0; i < keys.length; i++) {
        var variable = {
            index : i,
            key: keys[i],
            value: value[keys[i]]
        }

        // Push variable to variables and savedVariables
        variables.value[i] = variable
        savedVariables.value[i] = {...variable}
    }

    return value
}

/**
 * Function to handle key change in the storage JSON editor.
 * 
 * @param {string} nValue - The new value of the key.
 * @param {object} savedVariable - The saved variable object containing the key and value.
 */
function onKeyChange(nValue, savedVariable){
    // Create new key in model and delete old key
    Object.defineProperty(model.value, nValue,
        Object.getOwnPropertyDescriptor(model.value, savedVariable.key));
    delete model.value[savedVariable.key]

    // Get all variables with saved key, if there are more than one make sure it stays
    const sameVariables = savedVariables.value.filter(x => x.key == savedVariable.key)
    if(sameVariables.length > 1){
        var diffVariable = sameVariables.find(x => x.index != savedVariable.index)
        if(diffVariable == null)
            return

        model.value[diffVariable.key] = diffVariable.value
    }
    
    // Update savedVariable key
    savedVariable.key = `${nValue}`
}

/**
 * Updates the model value and savedVariables with the new value.
 * 
 * @param {any} nValue - The new value to be assigned to the model.
 * @param {object} savedVariable - The saved variable object containing the key and value.
 */
function onValueChange(nValue, savedVariable){
    // Update model value and savedVariables
    model.value[savedVariable.key] = nValue
    savedVariable.value = nValue
}

/**
 * Adds a new variable to the list of variables.
 */
function addVariable(){
    // Create new variable object
    var variable = {
        index : variables.value.length,
        key: `Variable${variables.value.length}`,
        value: ''
    }

    // Push variable to variables and savedVariables
    variables.value.push(variable)
    savedVariables.value.push({...variable})

    // Update model
    model.value[variable.key] = variable.value
}

function removeVariable(variable){
    // Remove variable from variables and savedVariables
    variables.value.splice(variable.index, 1)
    savedVariables.value.splice(variable.index, 1)

    // Update index
    for (var i = 0; i < variables.value.length; i++) {
        variables.value[i].index = i
        savedVariables.value[i].index = i
    }

    // Update model
    delete model.value[variable.key]
}

</script>

<template>
    <div>
        <h3>Variables</h3>
        <div class="p-1" v-for="variable, i in variables">
            <InputGroup>
                <InputText placeholder="Name" v-model="variable.key" @input="onKeyChange(variable.key, savedVariables[i])" />
                <InputText placeholder="Value" v-model="variable.value" @input="onValueChange(variable.value, savedVariables[i])" />
                <Button icon="pi pi-times" severity="danger" @click="removeVariable(variable)" />
            </InputGroup>
        </div>
        <div class="p-1">
            <Button style="width: 100%;" label="Add Variable" severity="secondary" @click="addVariable" />
        </div>
    </div>
    <!-- {{ variables }}
    <br>
    {{ savedVariables }}
    <br>
    {{ model }} -->
</template>