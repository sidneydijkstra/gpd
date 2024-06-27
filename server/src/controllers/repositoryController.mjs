import express from 'express'
import { getRepo, onError, rateLimit } from "../modules/githubApi.mjs"
import { getRepositories, getRepositoryByGuid, addRepository } from '../modules/databaseClient.mjs'
import { cloneRepository } from '../modules/fileClient.mjs'

const router = express.Router()

// Create variable for cashed repositories
var cashedRepositories = [];
// Load cached repositories
(async () => {
    await getRepositories().then(response => {
            response.forEach(x => {
                cashedRepositories[`${x.username}:${x.repository}`] = x
            })
        });
})();

router.get('/api/repository', async (req, res) => {
    var result = Object.values(cashedRepositories);
    console.log(result)
    res.status(200).json(result);
}), 

router.get('/api/repository/:user/:repository', async (req, res) => {
    // Get cache key from this repository
    var cacheKey = `${req.params.user}:${req.params.repository}`
    // Check if there is a cached repository and node forced to load
    if(cashedRepositories[cacheKey] != null && !req.query.force){
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
        .catch(onError)
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
            res.status(200).json(responses);
        })
        .catch(_ => {
            res.status(404).json({message: 'Repository not found'})
        })
})

export default router