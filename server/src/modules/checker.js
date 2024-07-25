import { getRepositories } from '#src/modules/database/repositories.js'
import { pullRepository } from '#src/modules/gitClient.js'

import config from '#src/server.config.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function initializeChecker(){
    while(true) {
        await getRepositories()
            .then(async response => {
                response.forEach(async repo => {
                    await pullRepository(`${repo.username}-${repo.repository}`)
                        .then(async response => {
                            if(response){
                                console.log(`[checker] Repository ${repo.username}-${repo.repository} has been updated. Running pipelines!`)
                                // TODO: Execute CI/CD pipeline
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