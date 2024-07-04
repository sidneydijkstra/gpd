import { getRepositoryByGuid } from '../database/repositories.mjs';
import { getPipelineByGuid } from '../database/pipelines.mjs';
import { prepareWorkerFolder, removeWorkerFolder } from '../fileClient.mjs';
import { parseConfigFile, parseConfigString } from './configParser.mjs';
import { jobs as storedJobs } from './jobs/index.mjs';
import { FileLogger } from './logger.mjs';

const DEBUG_MODE = true

export async function runConfig(repoGuid, pipelineGuid){
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
        
        var jobs = parsedConfig.jobs;

        jobs.forEach(job => {
            logger.log(`Running job ${job.name}`)
            var tasks = job.tasks;

            tasks.forEach(task => {
                logger.log(`Running task ${task.name}`)
                if(storedJobs.hasOwnProperty(task.name)){
                    storedJobs[task.name](task, logger)
                } else {
                    logger.error(`Job ${task.name} not found`)
                }
            });
        });

        if (!DEBUG_MODE) removeWorkerFolder(repo.guid)
        
        // Resolve the promise
        resolve()
    })
}