import { runConfig } from './jobRunner.mjs'
import { updatePipelineTransaction } from '../database/pipelines.mjs'

// Get arguments string transactionGuid, config and repo
if(process.argv.length < 5){
    console.log('Missing arguments')
    process.exit(1)
}

// Parse arguments
var transactionGuid = process.argv[2]
var repoGuid = process.argv[3]
var pipelineGuid = process.argv[4]

// Run the job
async function run(){
    await runConfig(repoGuid, pipelineGuid)
        .then(async result => {
            await updatePipelineTransaction(transactionGuid, true, 'Finished', result)
            console.log('Finished')
            process.exit(0)
        })
        .catch(async error => {
            await updatePipelineTransaction(transactionGuid, true, 'Error', error)
            console.log('Error')
            process.exit(1)
        })
}

(async () => await run())()