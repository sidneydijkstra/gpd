import express from 'express'
import { getAllFiles } from '../modules/fileClient.mjs'

const router = express.Router()

router.get('/api/files/:user/:repository/*', async (req, res) => {
    console.log(req.params[0])
    var folders = req.params[0].replace(',', '/')
    console.log(req.params[0])
    var result = getAllFiles(`${req.params.user}-${req.params.repository}`, folders)
    res.status(200).json(result);
})

export default router