import express from 'express'
import { getRepositoryByGuid } from '#src/modules/database/repositories.js'
import { getAllGlobalSettings, updateGlobalSetting, getAllRepositorySettings, updateRepositorySetting, addGlobalSetting, getGlobalSetting, getRepositorySetting, addRepositorySetting } from '#src/modules/database/settings.js'
import { isDockerInstalled } from '#src/modules/dockerClient.js'
import { checkLocalAgent } from '#src/modules/agent.js'

const router = express.Router()

router.get(`/api/setting/isDockerInstalled`, async (req, res) => {
    isDockerInstalled()
        .then(response => {
            res.status(200).json({installed: true})
        })
        .catch(_ => {
            res.status(200).json({installed: false})
        })
})

router.get(`/api/setting/global`, async (req, res) => {
    getAllGlobalSettings()
        .then(response => {
            res.status(200).json(response)
        })
        .catch(_ => {
            res.status(404).json({message: 'Settings not found'})
        })
})

router.get(`/api/setting/global/:key`, async (req, res) => {
    getGlobalSetting(req.params.key)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(_ => {
            res.status(404).json({message: 'Setting not found'})
        })
})

router.post(`/api/setting/global/:key`, async (req, res) => {
    if(req.body.value == null){
        res.status(400).json({message: 'Value is required'})
        return
    }

    var setting = await getGlobalSetting(req.params.key)

    if(setting == null){
        await addGlobalSetting(req.params.key, req.body.value)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(_ => {
                res.status(404).json({message: 'Setting not found'})
            })
    }else{
        await updateGlobalSetting(req.params.key, req.body.value)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(_ => {
                res.status(404).json({message: 'Setting not found'})
            })
    }
    
    // Check if the mode is changed to local
    checkLocalAgent()
})

router.get('/api/setting/repository/:guid', async (req, res) => {
    var repo = await getRepositoryByGuid(req.params.guid)
    if(repo == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    getAllRepositorySettings(repo.id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(_ => {
            res.status(404).json({message: 'Settings not found'})
        })
})

router.get(`/api/setting/repository/:guid/:key`, async (req, res) => {
    var repo = await getRepositoryByGuid(req.params.guid)
    if(repo == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    getRepositorySetting(repo.id, req.params.key)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(_ => {
            res.status(404).json({message: 'Setting not found'})
        })
})

router.post('/api/setting/repository/:guid/:key', async (req, res) => {
    if(req.body.value == null){
        res.status(400).json({message: 'Value is required'})
        return
    }

    var repo = await getRepositoryByGuid(req.params.guid)
    if(repo == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    var setting = await getRepositorySetting(repo.id, req.params.key)

    if(setting == null){
        addRepositorySetting(repo.id, req.params.key, req.body.value)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(_ => {
                res.status(404).json({message: 'Setting not found'})
            })
    } else{
        updateRepositorySetting(repo.id, req.params.key, req.body.value)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(_ => {
                res.status(404).json({message: 'Setting not found'})
            })
    }
})



export default router