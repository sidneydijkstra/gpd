import express from 'express'
import { v4 } from 'uuid'
import { getRepositoryById } from '#src/modules/database/repositories.js'
import { getPipelineTransactionByGuid } from '#src/modules/database/pipelines.js'
import { addArtifact } from '#src/modules/database/artifacts.js'
import { getStorageByGuid, getStorageByName } from '#src/modules/database/storage.js'
import { saveFileFromRequest } from '#src/modules/fileClient.js'

import { zipFolder } from '#src/helpers/zipHelper.js'

const router = express.Router()

router.get('/api/worker/:transactionGuid/work', async (req, res) => {
    var transaction = await getPipelineTransactionByGuid(req.params.transactionGuid)
    if(transaction == null){
        res.status(404).json({message: 'Transaction not found'})
        return
    }

    var repository = await getRepositoryById(transaction.repoId)
    if(repository == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    var path = `${process.cwd()}/.regpd/${repository.username}-${repository.repository}`
    zipFolder(path, `${path}.zip`)
        .then(() => {
            res.status(200).download(`${path}.zip`)
        })
        .catch(() => {
            res.status(500).json({message: 'Error downloading artifacts'})
        })
})

router.use(express.raw({ type: 'application/zip', limit: '50mb' }));
router.post('/api/worker/:transactionGuid/artifacts', async (req, res) => {
    var transaction = await getPipelineTransactionByGuid(req.params.transactionGuid)
    if(transaction == null){
        res.status(404).json({message: 'Transaction not found'})
        return
    }
    
    var guid = v4()
    var path = `${guid}.zip`;

    saveFileFromRequest(req, path)
        .then(() => {
            addArtifact(guid, transaction.id, guid, path)
                .then(() => {
                    res.status(200).json({message: 'Artifact uploaded'})
                })
                .catch((error) => {
                    res.status(500).json({message: 'Error uploading artifact: ' + error})
                })
        })
        .catch((error) => {
            res.status(500).json({message: 'Error zipping artifact: ' + error})
        })
})

router.get('/api/worker/:transactionGuid/storage', async (req, res) => {
    if((req.query.name == null || req.query.name == '') && (req.query.guid == null || req.query.guid == '')){
        res.status(400).json({message: 'Invalid request'})
        return
    }
    
    var transaction = await getPipelineTransactionByGuid(req.params.transactionGuid)
    if(transaction == null){
        res.status(404).json({message: 'Transaction not found'})
        return
    }

    if(req.query.name){
        getStorageByName(req.query.name, transaction.repoId)
            .then(storage => {
                res.status(200).json(storage)
            })
            .catch(() => {
                res.status(500).json({message: 'Error getting storage'})
            })
    }else {
        getStorageByGuid(req.query.guid)
            .then(storage => {
                res.status(200).json(storage)
            })
            .catch(() => {
                res.status(500).json({message: 'Error getting storage'})
            })
    }
})

export default router