import { spawn } from 'gpd-agent'
import { mqttServer, onTopic } from '#src/modules/mqtt/mqttServer.js';
import { onExit } from '#src/helpers/processHelper.js';
import { prepareWorkerFolder } from '#src/modules/fileClient.js';
import { parseConfigString } from '#src/helpers/configParser.js';
import { addPipelineTask, addPipelineTransaction, updatePipelineTask, updatePipelineTransaction, getPipelineTransactionByGuid } from '#src/modules/database/pipelines.js';
import { getGlobalSetting } from '#src/modules/database/settings.js';
import { addAgent, getAvailableAgent, updateAgent, removeAgent, isAnyAgentAvailable, getAnyAgent, containsAgent } from '#src/modules/manager.js';

import pipelineStatus from '#src/enums/pipelineStatus.js';
import pipelineTaskStatus from '#src/enums/pipelineTaskStatus.js';
import agentModes from '#src/enums/agentModes.js';

import config from '#src/server.config.js';

export default async function initializeListener(){
    // Register agent
    onTopic(['agent', 'register'], (parsedTopic, payload) => {
        var agentName = payload
        console.log(`[agent] Registered agent: ${agentName}`)
        
        addAgent(agentName)
    })

    // Unregister agent
    onTopic(['agent', 'unregister'], (parsedTopic, payload) => {
        var agentName = payload
        console.log(`[agent] Unregistered agent: ${agentName}`)

        // Remove the agent
        removeAgent(agentName)
    })

    // Agent transaction running
    onTopic(['agent', '*', 'trans-running'], async (parsedTopic, payload) => {
        var agentName = parsedTopic[1]
        var transaction = JSON.parse(payload)
        await updatePipelineTransaction(transaction.guid, false, transaction.status, transaction.content ?? '')

        // Update agent status
        updateAgent(agentName, true)
    })

    // Agent transaction completed
    onTopic(['agent', '*', 'trans-completed'], async (parsedTopic, payload) => {
        var agentName = parsedTopic[1]
        var transaction = JSON.parse(payload)
        await updatePipelineTransaction(transaction.guid, true, transaction.status, transaction.content ?? '')
        
        // Update agent status
        updateAgent(agentName, false)
    })

    // Agent task running
    onTopic(['agent', '*', 'task-running'], async (parsedTopic, payload) => {
        var agentName = parsedTopic[1]
        var task = JSON.parse(payload)
        await updatePipelineTask(task.guid, false, task.status, task.content ?? '')
    })

    // Agent task completed
    onTopic(['agent', '*', 'task-completed'], async (parsedTopic, payload) => {
        var agentName = parsedTopic[1]
        var task = JSON.parse(payload)
        await updatePipelineTask(task.guid, false, task.status, task.content ?? '')
    })
    
    onExit(() => {
        stopLocalAgent()
    })
    
    var mode = await getGlobalSetting('mode')
    if(mode != null && mode.value == agentModes.local){
        startLocalAgent()
    }
}

export async function runPipeline(repository, pipeline, type='Manual Run'){
    var guid = null
    // Create the pipeline transaction
    await addPipelineTransaction(pipeline.id, repository.id, type, pipeline.content, false, pipelineStatus.pending, '')
        .then(async transactionGuid => {
            var agent = await prepareAgent(transactionGuid, repository, pipeline.content)
            
            // Check if the agent was prepared
            if(agent == null){
                // Update the transaction status, and return false
                await updatePipelineTransaction(transactionGuid, true, pipelineStatus.error, 'Error preparing agent')
                    .then(() => {
                        guid = transactionGuid
                    })
                return
            }

            // Create the agent process
            var spawnAgentResult = await spawnAgent(agent.path, pipeline.guid, transactionGuid)
            if(!spawnAgentResult){
                // Update the transaction status, and return false
                await updatePipelineTransaction(transactionGuid, true, pipelineStatus.failed, 'Error spawning agent')
            }
            
            guid = transactionGuid
        })

    return guid
}

async function prepareAgent(transactionGuid, repository, config){
    var transaction = await getPipelineTransactionByGuid(transactionGuid)
    if(transaction == null)
        return null

    // Escape the config file
    var jobConfig = config.replace(/\\n/g, '\n').replace(/\\"/g, '\"').slice(1,-1)
    try {
        // Parse the config file
        var parsedConfig = parseConfigString(jobConfig)
    } catch (error) {
        return null
    }
    
    // Prepare worker folder, creates project, storage and artifacts folders
    var folderPath = prepareWorkerFolder(`${repository.username}-${repository.repository}`, transactionGuid)

    // Create all task transactions
    var taskTransactionGuids = []
    for (var job of parsedConfig.jobs){
        // Create a sequence number for the tasks
        var seq = 0
        for (var task of job.tasks){
            var guid = await addPipelineTask(transaction.id, job.name, seq, task.title, task.name, false, pipelineTaskStatus.pending, '')
            taskTransactionGuids.push(guid)
            // Increment the sequence number
            seq++
        }
    }

    return {
        transaction: transaction,
        path: folderPath, 
        tasks: taskTransactionGuids,
        config: parsedConfig
    }
}

async function spawnAgent(workFolderPath, pipelineGuid, transactionGuid){
    if(!isAnyAgentAvailable()){
        console.log('[agent] No agents available')
        return false
    }

    var mode = await getGlobalSetting('mode')
    if(mode == null || mode.value == '' || mode.value == agentModes.none){
        console.log('[agent] Mode set to None')
        return false
    }

    var workFolderPath = mode.value == agentModes.docker ? `/workdir${workFolderPath.substring(8)}` : `${process.cwd()}${workFolderPath.substring(1)}`
    var agentGuid = mode.value == agentModes.local ? 'local' : getAvailableAgent()?.name ?? getAnyAgent().name

    console.log(`[agent] Sending pipeline to agent: ${agentGuid}`)

    mqttServer.publish({
        topic: 'agent/exec',
        payload: Buffer.from(JSON.stringify({
            agentGuid: agentGuid,
            workFolderPath: workFolderPath,
            pipelineGuid: pipelineGuid,
            transactionGuid: transactionGuid
        }))
    })

    return true
}

export async function checkLocalAgent(){
    var mode = await getGlobalSetting('mode')
    if(mode != null && mode.value == agentModes.local){
        startLocalAgent()
    }else{
        stopLocalAgent()
    }
}

export function startLocalAgent(){
    if(containsAgent('local'))
        return

    console.log('[agent] Starting local agent')
    spawn(config.mqttServerUrl, config.apiServerUrl, 'local', false)
}

export function stopLocalAgent(){
    if(!containsAgent('local'))
        return

    console.log('[agent] Stopping local agent')
    mqttServer.publish({
        topic: 'agent/quit',
        payload: Buffer.from('local')
    })
}