import express from 'express'
import { getAllAgents } from '#src/modules/manager.js'

const router = express.Router()

router.get('/api/agents', async (req, res) => {
    const agents = getAllAgents()
    res.status(200).json(agents)
})

export default router