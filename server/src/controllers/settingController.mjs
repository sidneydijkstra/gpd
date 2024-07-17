import express from 'express'
import { getRepositoryByGuid } from '../modules/database/repositories.mjs'
import { getAllGlobalSettings, updateGlobalSetting, getAllRepositorySettings, updateRepositorySetting } from '../modules/database/settings.mjs'
import { isDockerInstalled } from '../modules/dockerClient.mjs'

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

    updateGlobalSetting(req.params.key, req.body.value)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(_ => {
            res.status(404).json({message: 'Setting not found'})
        })
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

    updateRepositorySetting(repo.id, req.params.key, req.body.value)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(_ => {
            res.status(404).json({message: 'Setting not found'})
        })
})



export default router