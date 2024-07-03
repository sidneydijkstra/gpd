import { getRepositories } from '../databaseClient.mjs'
import { pullRepository } from '../fileClient.mjs'

const CHECKER_INTERVAL = 30000

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function checkRepositories(){
    while(true) {
        await getRepositories()
            .then(async response => {
                response.forEach(async repo => {
                    await pullRepository(`${repo.username}-${repo.repository}`)
                        .then(async response => {
                            if(response){
                                console.log(`Repository ${repo.username}-${repo.repository} has been updated. Running pipelines!`)
                                // TODO: Execute CI/CD pipeline
                            }else{
                                console.log(`Repository ${repo.username}-${repo.repository} has not been updated.`)
                            }
                        })
                        .catch(error => {
                            console.error(`Error pulling repository ${repo.username}-${repo.repository}: ${error}`)
                        })
                });

            })
            .catch(error => {
                console.error(`Error getting repositories: ${error}`)
            })

        await sleep(CHECKER_INTERVAL)
    }
}