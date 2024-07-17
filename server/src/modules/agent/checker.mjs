import { getRepositories } from '../database/repositories.mjs'
import { pullRepository } from '../gitClient.mjs'

import config from '../../server.config.mjs'

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
                                console.log(`[checkRepository] Repository ${repo.username}-${repo.repository} has been updated. Running pipelines!`)
                                // TODO: Execute CI/CD pipeline
                            }else{
                                console.log(`[checkRepository] Repository ${repo.username}-${repo.repository} has not been updated.`)
                            }
                        })
                        .catch(error => {
                            console.error(`[checkRepository] Error pulling repository ${repo.username}-${repo.repository}: ${error}`)
                        })
                });

            })
            .catch(error => {
                console.error(`[checkRepository] Error getting repositories: ${error}`)
            })

        await sleep(config.repositoryCheckInterval)
    }
}