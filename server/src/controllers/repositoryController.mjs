import express from 'express'
import { getRepo, onError, rateLimit } from "../modules/githubApi.mjs"
import { getRepositories, getRepositoryByGuid, addRepository, updateRepository, removeRepositoryByGuid } from '../modules/database/repositories.mjs'
import { cloneRepository, pullRepository, removeRepositoryFolder } from '../modules/fileClient.mjs'

const router = express.Router()

// Create variable for cashed repositories
var cashedRepositories = [];
// Load cached repositories
(async () => {
    await getRepositories().then(response => {
            response.forEach(repo => {
                cashedRepositories[`${repo.username}:${repo.repository}`] = repo
            })
        });
})();

router.get('/api/repository', async (req, res) => {
    var result = Object.values(cashedRepositories);
    console.log(result)
    res.status(200).json(result);
})

router.get('/api/repository/:user/:repository', async (req, res) => {
    // Get cache key from this repository
    var cacheKey = `${req.params.user}:${req.params.repository}`
    // Check if there is a cached repository and node forced to load
    if(cashedRepositories[cacheKey] != null){
        res.status(200).json(cashedRepositories[cacheKey])
        return
    }
    
    var result;
    // Get repository retails
    console.log(await rateLimit())
    await getRepo(req.params.user, req.params.repository)
        .then(response => {
            result = response
        })
        .catch(_ => {
            res.status(404).json({message: 'Repository not found'})
            return
        })
    console.log(await rateLimit())

    // Add repository to database
    await addRepository(req.params.user, req.params.repository, result)
        .then(async guid => {
            // Clone repository
            await cloneRepository(result.clone_url, result.default_branch, `${req.params.user}-${req.params.repository}`)

            // Return the created repository
            await getRepositoryByGuid(guid)
                .then(response => {
                    console.log(response)
                    // Cache the repository
                    cashedRepositories[cacheKey] = response
                    // Return the repository
                    res.status(200).json(response);
                })
                .catch(_ => {
                    res.status(404).json({message: 'Repository not found'})
                })
        })
        .catch(_ => {
            res.status(500).json({message: 'Error adding repository to database'})
        })
})

router.get('/api/repository/:guid', async (req, res) => {
    // Add repository to database
    await getRepositoryByGuid(req.params.guid)
        .then(response => {
            // Return the repository
            res.status(200).json(response);
        })
        .catch(_ => {
            res.status(404).json({message: 'Repository not found'})
        })
})

router.post('/api/repository/:guid/update', async (req, res) => {
    // Add repository to database
    await getRepositoryByGuid(req.params.guid)
        .then(async response => {
            // Check if repository exists
            var pullRequest = await pullRepository(`${response.username}-${response.repository}`)
            console.log(`Pull request completed: ${pullRequest}`)

            // Get repository retails
            console.log(await rateLimit())
            await getRepo(response.username, response.repository)
                .then(async response => {
                    // Update repository
                    await updateRepository(req.params.guid, response)
                        .then(async _ => {
                            // Return the updated repository
                            await getRepositoryByGuid(req.params.guid)
                                .then(response => {
                                    // Return the repository
                                    res.status(200).json(response);
                                })
                                .catch(_ => {
                                    res.status(404).json({message: '2.Repository not found'})
                                })
                        })
                        .catch(_ => {
                            res.status(500).json({message: 'Error updating repository'})
                        })
                })
                .catch(onError)
            console.log(await rateLimit())
        })
        .catch(_ => {
            res.status(404).json({message: 'Repository not found ' + _})
        })
})

router.delete('/api/repository/:guid', async (req, res) => {
    // Add repository to database
    await getRepositoryByGuid(req.params.guid)
        .then(async response => {
            // Check if repository exists
            if(response == null){
                res.status(404).json({message: 'Repository not found'})
                return
            }

            // Delete repository
            await removeRepositoryByGuid(req.params.guid)
                .then(async _ => {
                    console.log('Repository deleted')

                    // Remove repository folder
                    await removeRepositoryFolder(`${response.username}-${response.repository}`)

                    // Delete repository from cache
                    if(cashedRepositories[`${response.username}:${response.repository}`] != null){
                        delete cashedRepositories[`${response.username}:${response.repository}`]
                    }

                    // Return the deleted repository
                    res.status(200).json(response);
                })
                .catch(_ => {
                    res.status(500).json({message: 'Error deleting repository'})
                })
        })
        .catch(_ => {
            res.status(404).json({message: 'Repository not found'})
        })
})

export default router