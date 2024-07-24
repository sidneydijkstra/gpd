import { spawn } from 'gpd-agent'
import { mqttServer } from '../mqtt/mqttServer.mjs';
import { onExit } from '../../helpers/processHelper.mjs';
import { prepareWorkerFolder } from '../fileClient.mjs';
import { parseConfigString } from './configParser.mjs';
import { addPipelineTask, addPipelineTransaction, updatePipelineTask, updatePipelineTransaction, getPipelineTransactionByGuid } from '../database/pipelines.mjs';
import { getGlobalSetting } from '../database/settings.mjs';

import pipelineStatus from '../../enums/pipelineStatus.mjs';
import pipelineTaskStatus from '../../enums/pipelineTaskStatus.mjs';
import agentModes from '../../enums/agentModes.mjs';

import config from '../../server.config.mjs';

const agentCache = []

onExit(() => {
    stopLocalAgent()
})

export default async function initializeListener(){
    mqttServer.on('publish', async (packet, client) => {
        // Check if message is from client
        if(!client)
            return

        var parsedTopic = packet.topic.split('/')

        // Add agent to cache
        if(parsedTopic.length == 2 && parsedTopic[0] == 'agent' && parsedTopic[1] == 'register'){
            var agentGuid = packet.payload.toString()
            console.log(`[agent] Registered agent: ${agentGuid}`)
            agentCache.push({
                name: agentGuid,
                running: false
            })
        }
        // Remove agent from cache
        else if (parsedTopic.length == 2 && parsedTopic[0] == 'agent' && parsedTopic[1] == 'unregister'){
            var agentGuid = packet.payload.toString()
            if(agentCache.length == 0 || !agentCache.find(x => x.name == agentGuid))
                return

            console.log(`[agent] Unregistered agent: ${agentGuid}`)
            agentCache.splice(agentCache.findIndex(x => x.name == agentGuid), 1)
        }

        if(parsedTopic.length != 3)
            return

        if(parsedTopic[0] == 'agent' && parsedTopic[2] == 'trans-running'){
            var agentGuid = parsedTopic[1]
            var transaction = JSON.parse(packet.payload.toString())
            await updatePipelineTransaction(transaction.guid, false, transaction.status, transaction.content ?? '')

            // Update agent status
            var agent = agentCache.find(x => x.name == agentGuid)
            if(agent != null)
                agent.running = true

        }else if(parsedTopic[0] == 'agent' && parsedTopic[2] == 'trans-completed'){
            var agentGuid = parsedTopic[1]
            var transaction = JSON.parse(packet.payload.toString())
            await updatePipelineTransaction(transaction.guid, true, transaction.status, transaction.content ?? '')
            
            // Update agent status
            var agent = agentCache.find(x => x.name == agentGuid)
            if(agent != null)
                agent.running = false

        }else if(parsedTopic[0] == 'agent' && parsedTopic[2] == 'task-running'){
            var agentGuid = parsedTopic[1]
            var task = JSON.parse(packet.payload.toString())
            await updatePipelineTask(task.guid, false, task.status, task.content ?? '')
        }else if(parsedTopic[0] == 'agent' && parsedTopic[2] == 'task-completed'){
            var agentGuid = parsedTopic[1]
            var task = JSON.parse(packet.payload.toString())
            await updatePipelineTask(task.guid, false, task.status, task.content ?? '')
        }
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
    if(agentCache.length == 0){
        console.log('[agent] No agents available')
        return false
    }

    var mode = await getGlobalSetting('mode')
    if(mode == null || mode.value == '' || mode.value == agentModes.none){
        console.log('[agent] Mode set to None')
        return false
    }

    var workFolderPath = mode.value == agentModes.docker ? `/workdir${workFolderPath.substring(8)}` : `${process.cwd()}${workFolderPath.substring(1)}`
    var agentGuid = mode.value == agentModes.local ? 'local' : agentCache.find(x => x.running == false)?.name ?? agentCache[0].name

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
    if(agentCache.find(x => x.name == 'local'))
        return

    console.log('[agent] Starting local agent')
    spawn(config.mqttServerUrl, config.apiServerUrl, 'local', false)
}

export function stopLocalAgent(){
    if(!agentCache.find(x => x.name == 'local'))
        return

    console.log('[agent] Stopping local agent')
    mqttServer.publish({
        topic: 'agent/quit',
        payload: Buffer.from('local')
    })
    
    agentCache.splice(agentCache.findIndex(x => x.name == 'local'), 1)
}