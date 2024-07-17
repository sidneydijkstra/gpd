import express from 'express'
import { getGithubRepository } from "../modules/githubApi.mjs"
import { getGitlabRepository } from "../modules/gitlabApi.mjs"
import { getRepositories, getRepositoryByGuid, addRepository, updateRepository, removeRepositoryByGuid } from '../modules/database/repositories.mjs'
import { removeRepositoryFolder } from '../modules/fileClient.mjs'
import { cloneRepository, pullRepository } from '../modules/gitClient.mjs'

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
    
    // Get repository based on source, if source is not provided, default to github
    var result = null;
    var source = req.query.source == null ? 'github' : req.query.source
    if(source == 'github'){
        await getGithubRepository(req.params.user, req.params.repository)
            .then(response => {
                result = response.status == 404 ? null : response
            })
            .catch(_ => {
                result = null
            })
    }else if (source == 'gitlab'){
        await getGitlabRepository(req.params.user, req.params.repository)
            .then(response => {
                result = response.status == 404 ? null : response

                // TODO: Gitlab returns invalid response make this inline
                if(result != null){
                    result.clone_url = result.http_url_to_repo
                }
            })
            .catch(_ => {
                result = null
            })
    }else{
        res.status(400).json({message: 'Invalid source'})
        return
    }

    if(result == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    // Add repository to database
    await addRepository(source, req.params.user, req.params.repository, result)
        .then(async guid => {
            // Clone repository
            await cloneRepository(result.clone_url, result.default_branch, `${req.params.user}-${req.params.repository}`)

            // Return the created repository
            await getRepositoryByGuid(guid)
                .then(response => {
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
            await getGithubRepository(response.username, response.repository)
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
                .catch(_ => {
                    res.status(404).json({message: 'Repository not found'})
                })
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