import { getRepositories } from '#src/modules/database/repositories.js'
import { pullRepository } from '#src/modules/gitClient.js'
import { getRepositorySetting } from '#src/modules/database/settings.js'
import { getPipelineByGuid } from '#src/modules/database/pipelines.js'
import { runPipeline } from '#src/modules/agent.js'

import config from '#src/server.config.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function initializeChecker(){
    while(true) {
        await getRepositories()
            .then(async response => {
                response.forEach(async repo => {
                    const checkerEnabled = await getRepositorySetting(repo.id, 'checkerEnabled')
                    if(checkerEnabled == null || checkerEnabled.value == '0')
                        return

                    await pullRepository(`${repo.username}-${repo.repository}`)
                        .then(async response => {
                            if(response){
                                console.log(`[checker] Repository ${repo.username}-${repo.repository} has been updated.`)
                                const checkerPipeline = await getRepositorySetting(repo.id, 'checkerPipeline')
                                if(checkerPipeline == null || checkerPipeline.value == '')
                                    return

                                getPipelineByGuid(checkerPipeline.value)
                                    .then(async pipeline => {
                                        if(pipeline == null)
                                            return

                                        console.log(`[checker] Pipeline ${pipeline.name} found, executing...`)
                                        // Execute CI/CD pipeline
                                        await runPipeline(repo.id, pipeline.id, "Automatic checker pipeline")
                                    })
                                    .catch(error => {
                                        console.error(`[checker] Error getting pipeline ${checkerPipeline.value}: ${error}`)
                                    })
                            }else{
                                console.log(`[checker] Repository ${repo.username}-${repo.repository} has not been updated.`)
                            }
                        })
                        .catch(error => {
                            console.error(`[checker] Error pulling repository ${repo.username}-${repo.repository}: ${error}`)
                        })
                });

            })
            .catch(error => {
                console.error(`[checker] Error getting repositories: ${error}`)
            })

        await sleep(config.repositoryCheckInterval)
    }
}