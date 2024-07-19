import { mqttServer } from '../mqtt/mqttServer.mjs';
import { prepareWorkerFolder } from '../fileClient.mjs';
import { parseConfigString } from './configParser.mjs';
import { addPipelineTask, addPipelineTransaction, updatePipelineTask, updatePipelineTransaction, getPipelineTransactionByGuid } from '../database/pipelines.mjs';
import { spawn } from 'child_process';

import pipelineStatus from '../../enums/pipelineStatus.mjs';
import pipelineTaskStatus from '../../enums/pipelineTaskStatus.mjs';

export default function initializeListener(){
    mqttServer.on('publish', async (packet, client) => {
        // Check if message is from client
        if(!client)
            return

        var parsedTopic = packet.topic.split('/')
        if(parsedTopic.length != 3)
            return

        if(parsedTopic[0] == 'agent' && parsedTopic[2] == 'trans-running'){
            var agentGuid = parsedTopic[1]
            var transaction = JSON.parse(packet.payload.toString())
            await updatePipelineTransaction(transaction.guid, false, transaction.status, transaction.content ?? '')
        }else if(parsedTopic[0] == 'agent' && parsedTopic[2] == 'trans-completed'){
            var agentGuid = parsedTopic[1]
            var transaction = JSON.parse(packet.payload.toString())
            await updatePipelineTransaction(transaction.guid, true, transaction.status, transaction.content ?? '')
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
                await updatePipelineTransaction(transactionGuid, pipelineStatus.error, 'Error preparing agent')
                    .then(() => {
                        guid = transactionGuid
                    })
                return
            }

            // Create the agent process
            spawnAgent('local', agent.path, pipeline.guid, transactionGuid)

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

function spawnAgent(agentGuid, workFolderPath, pipelineGuid, transactionGuid){
    mqttServer.publish({
        topic: 'agent/exec',
        payload: Buffer.from(JSON.stringify({
            agentGuid: agentGuid,
            workFolderPath: `/workdir${workFolderPath.substring(8)}`,
            pipelineGuid: pipelineGuid,
            transactionGuid: transactionGuid
        }))
    })
    // var command = `node ./src/modules/agent/go.mjs ${agentGuid} ${workFolderPath} ${pipelineGuid} ${transactionGuid}`

    // const child = spawn(command, [], { shell: true, cwd: process.cwd()})

    // child.stdout.on('data', (data) => {
    //     console.log(`[spawnRunner] stdout: ${data}`);
    // });
    
    // child.stderr.on('data', (data) => {
    //     console.error(`[spawnRunner] stderr: ${data}`);
    // });

    // child.on('close', async (code) => {
    //     console.log(`[spawnRunner] Process exited with code ${code}`);
    // }); 
}