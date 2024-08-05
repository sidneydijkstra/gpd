import express from 'express'
import { getRepositoryByGuid } from '#src/modules/database/repositories.js'
import { getAllStorage, getAllStorageByRepositoryId, updateStorage, removeStorageByGuid, addStorage } from '#src/modules/database/storage.js'

const router = express.Router()

router.get('/api/storage', async (req, res) => {
    getAllStorage()
        .then(response => {
            res.status(200).json(response)
        })
        .catch(error => {
            res.status(500).json({message: 'Error getting storage'})
        })
})

router.get('/api/storage/:guid', async (req, res) => {
    getStorageByGuid(req.params.guid)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(error => {
            res.status(500).json({message: 'Error getting storage'})
        })
})

router.get('/api/storage/repository/:repoGuid', async (req, res) => {
    getRepositoryByGuid(req.params.repoGuid)
        .then(async repo => {
            if(repo == null){
                res.status(404).json({message: 'Repository not found'})
                return
            }

            getAllStorageByRepositoryId(repo.id)
                .then(response => {
                    res.status(200).json(response)
                })
                .catch(error => {
                    res.status(500).json({message: 'Error getting storage'})
                })
        })
        .catch(error => {
            res.status(500).json({message: 'Repository not found'})
        })
})

router.post('/api/storage', async (req, res) => {
    console.log('add storage')
    const storage = req.body

    if(storage.name == null || storage.type == null || storage.content == null){
        res.status(400).json({message: 'Missing required fields'})
        return
    }

    var repoId = null
    if(storage.repoGuid != null && storage.repoGuid != ''){
        await getRepositoryByGuid(storage.repoGuid)
            .then(repo => {
                repoId = repo.id ?? null
            })
    }

    addStorage(storage.name, storage.type, storage.content, repoId)
        .then((guid) => {
            res.status(200).json(guid)
        })
        .catch(() => {
            res.status(500).json({message: 'Error adding storage'})
        })
})

router.post('/api/storage/:guid', async (req, res) => {
    console.log('update storage')
    const storage = req.body

    if(storage.name == null || storage.type == null || storage.content == null){
        res.status(400).json({message: 'Missing required fields'})
        return
    }

    var repoId = null
    if(storage.repoGuid != null && storage.repoGuid != ''){
        await getRepositoryByGuid(storage.repoGuid)
            .then(repo => {
                repoId = repo.id ?? null
            })
    }

    updateStorage(req.params.guid, storage.name, storage.type, storage.content, repoId ?? null)
        .then(() => {
            res.status(200).json(req.params.guid)
        })
        .catch(() => {
            res.status(500).json({message: 'Error adding storage'})
        })
})

router.delete('/api/storage/:guid', async (req, res) => {
    console.log('delete storage')
    removeStorageByGuid(req.params.guid)
        .then(() => {
            res.status(200).json()
        })
        .catch(() => {
            res.status(500).json({message: 'Error removing storage'})
        })
})

export default router