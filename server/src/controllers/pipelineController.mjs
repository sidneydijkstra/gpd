import express from 'express'
import { getRepositoryByGuid, getRepositoryById } from '../modules/database/repositories.mjs'
import { getPipelinesByRepository, getPipelineByGuid, addPipeline, updatePipeline, removePipeline, getPipelineTransactions, addPipelineTransaction, getPipelineTasks, getPipelineTaskByGuid, getPipelineTransactionByGuid, updatePipelineTransaction } from '../modules/database/pipelines.mjs'

import { runPipeline } from '../modules/agent/agent.mjs'

const router = express.Router()

router.post('/api/pipeline/:guid/run', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    var repository = await getRepositoryById(pipeline.repoId)
    if(repository == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    var guid = await runPipeline(repository, pipeline, 'Manual Run')
    if(guid == null){
        res.status(500).json({message: 'Error running pipeline'})
        return
    }

    res.status(200).json({guid: guid})
})

router.get('/api/pipeline/:guid', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    res.status(200).json(pipeline);
})

router.post('/api/pipeline/:guid/update', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    if(req.body.name == null || req.body.content == null){
        res.status(400).json({message: 'Missing required fields'})
        return
    }

    await updatePipeline(req.params.guid, req.body.name, req.body.content)
    res.status(200).json();
})

router.delete('/api/pipeline/:guid', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    await removePipeline(req.params.guid)
    res.status(200).json();
})

router.get('/api/from/:repoGuid/pipeline', async (req, res) => {
    var repo = await getRepositoryByGuid(req.params.repoGuid)
    if(repo == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    var pipelines = await getPipelinesByRepository(repo.id)
    res.status(200).json(pipelines);
})

router.post('/api/from/:repoGuid/pipeline', async (req, res) => {
    if(req.body.name == null || req.body.content == null){
        res.status(400).json({message: 'Missing required fields'})
        return
    }
    
    var repo = await getRepositoryByGuid(req.params.repoGuid)
    if(repo == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    var guid = await addPipeline(repo.id, req.body.name, req.body.content)
    res.status(200).json({guid: guid})
})

router.get('/api/pipeline/:guid/transaction', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    var transactions = await getPipelineTransactions(pipeline.id)
    res.status(200).json(transactions)
})

router.get('/api/pipeline/:guid/transaction/:transactionGuid', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    var transaction = await getPipelineTransactionByGuid(req.params.transactionGuid)
    if(transaction == null){
        res.status(404).json({message: 'Transaction not found'})
        return
    }

    res.status(200).json(transaction)
})

router.get('/api/pipeline/:guid/transaction/:transactionGuid/task', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }
    
    var transaction = await getPipelineTransactionByGuid(req.params.transactionGuid)
    if(transaction == null){
        res.status(404).json({message: 'Transaction not found'})
        return
    }

    var tasks = await getPipelineTasks(transaction.id)
    res.status(200).json(tasks)
})


router.get('/api/pipeline/:guid/transaction/:transactionGuid/task/:taskGuid', async (req, res) => {
    var pipeline = await getPipelineByGuid(req.params.guid)
    if(pipeline == null){
        res.status(404).json({message: 'Pipeline not found'})
        return
    }

    var task = await getPipelineTaskByGuid(req.params.transactionGuid)
    res.status(200).json(task)
})

export default router