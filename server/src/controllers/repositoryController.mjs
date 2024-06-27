import express from 'express'
import { getRepo, onError, rateLimit } from "../modules/githubApi.mjs"
import { getRepositories, addRepository } from '../modules/databaseClient.mjs'
import { cloneRepository } from '../modules/fileClient.mjs'

const router = express.Router()

// Create variable for cashed repositories
var cashedRepositories = [];
// Load cached repositories
(async () => {
    await getRepositories().then(response => {
            response.forEach(x => {
                cashedRepositories[`${x.username}:${x.repository}`] = JSON.parse(x.content)
            })
        });
})();

router.get('/api/repository', async (req, res) => {
    var result = Object.values(cashedRepositories);
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
        .then(_ => {
            // Cache the repository
            cashedRepositories[cacheKey] = result
        })

    // Clone repository
    await cloneRepository(result.clone_url, result.default_branch, `${req.params.user}-${req.params.repository}`)

    // Return the result
    res.status(200).json(result);
})

export default router