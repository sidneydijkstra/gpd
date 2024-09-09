import express from 'express'
import { getArtifacts, getArtifactByGuid, getArtifactByRepositoryGuid, getArtifactByPipelineGuid, getArtifactByTransactionGuid } from '#src/modules/database/artifacts.js'

import config from '#src/server.config.js';

const router = express.Router()

router.get('/api/artifact', async (req, res) => {
    console.log(req.query)

    if(req.query?.repository){
        getArtifactByRepositoryGuid(req.query.repository)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(error => {
                res.status(500).json({message: 'Error getting artifacts r'})
            })
    }else if(req.query?.pipeline){
        getArtifactByPipelineGuid(req.query.pipeline)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(error => {
                res.status(500).json({message: 'Error getting artifacts p'})
            })
    }else if(req.query?.transaction){
        getArtifactByTransactionGuid(req.query.transaction)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(error => {
                res.status(500).json({message: 'Error getting artifacts t'})
            })
    }else{
        getArtifacts()
            .then(response => {
                res.status(200).json(response)
            })
            .catch(error => {
                res.status(500).json({message: 'Error getting artifacts'})
            })
    }
})

router.get('/api/artifact/:artifactGuid', async (req, res) => {
    getArtifactByGuid(req.params.artifactGuid)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(error => {
            res.status(500).json({message: 'Error getting artifact'})
        })
})

router.get('/api/artifact/:artifactGuid/download', async (req, res) => {
    getArtifactByGuid(req.params.artifactGuid)
        .then(response => {
            res.status(200).download(`${config.defaultArtifactFolderPath}/${response.path}`)
        })
        .catch(error => {
            res.status(500).json({message: 'Error downloading artifact'})
        })
})

export default router