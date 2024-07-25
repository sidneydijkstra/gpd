import express from 'express'
import { getAllFiles } from '#src/modules/fileClient.js'
import { getRepositoryByGuid } from '#src/modules/database/repositories.js'

const router = express.Router()

router.get('/api/files/:guid/*', async (req, res) => {
    var repo = await getRepositoryByGuid(req.params.guid)
    if(repo == null){
        res.status(404).json({message: 'Repository not found'})
        return
    }

    var folders = req.params[0].replace(',', '/')
    var result = getAllFiles(`${repo.username}-${repo.repository}`, folders)
    res.status(200).json(result);
})

export default router