import { getRepositoryByGuid } from '../database/repositories.mjs';
import { getPipelineByGuid, addPipelineTask, updatePipelineTask, updatePipelineTransaction } from '../database/pipelines.mjs';
import pipelineStatus from '../../enums/pipelineStatus.mjs';
import pipelineTaskStatus from '../../enums/pipelineTaskStatus.mjs';
import { prepareWorkerFolder, removeWorkerFolder } from '../fileClient.mjs';
import { parseConfigString } from './configParser.mjs';
import { jobs as storedJobs } from './jobs/index.mjs';
import { FileLogger } from './logger.mjs';

const DEBUG_MODE = true

export async function runConfig(repoGuid, pipelineGuid, transactionGuid){
    return new Promise(async (resolve, reject) => {
        // Get the repository
        var repo = await getRepositoryByGuid(repoGuid)
        if(repo == null){
            reject('Repository not found')
            return
        }

        // Get the pipeline
        var pipeline = await getPipelineByGuid(pipelineGuid)
        if(pipeline == null){
            reject('Pipeline not found')
            return
        }

        // Prepare worker folder, creates project, storage and artifacts folders
        var folderPath = prepareWorkerFolder(`${repo.username}-${repo.repository}`, `${Math.random()*1}`)
        // Create file logger
        var logger = new FileLogger(`${folderPath}/log.txt`)
        // Log the start of the job
        logger.log(`Running pipeline ${pipeline.guid} for repository ${repo.username}/${repo.repository}`)

        // Escape the config file
        var config = pipeline.content.replace(/\\n/g, '\n').replace(/\\"/g, '\"').slice(1,-1)
        // Parse the config file
        var parsedConfig = parseConfigString(config)
        
        logger.log(`Config parsed`)
        
        // Get all jobs
        var jobs = parsedConfig.jobs;

        // Create a sequence number for the tasks
        var seq = 0
        // Run each job
        for (var job of jobs){
            logger.log(`Running job ${job.name}`)
            var tasks = job.tasks;

            // Run each task
            for(const task of tasks){
                logger.log(`Running task ${task.name}`)

                // Start to record the logger
                logger.record()
                
                // Add the task to the database
                var guid = await addPipelineTask(pipeline.id, job.name, seq, task.name, false, pipelineTaskStatus.running, '')

                // Run the job
                var taskResult = false
                if(storedJobs.hasOwnProperty(task.name)){
                    taskResult = storedJobs[task.name](task, logger)
                } else {
                    logger.log(`Job ${task.name} not found`)
                }
                
                // Update the task in the database
                await updatePipelineTask(guid, true, taskResult ? pipelineTaskStatus.completed : pipelineTaskStatus.failed, logger.recordResult())
                // Increment the sequence number
                seq++
            }
        }

        if (!DEBUG_MODE) removeWorkerFolder(repo.guid)
        
        // Complete the transaction
        await updatePipelineTransaction(transactionGuid, true, pipelineStatus.completed, '')

        // Resolve the promise
        resolve()
    })
}