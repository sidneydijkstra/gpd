import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import repositoryRouter from './src/controllers/repositoryController.js'
import settingRouter from './src/controllers/settingController.js'
import fileRouter from './src/controllers/fileController.js'
import pipelineRouter from './src/controllers/pipelineController.js'
import workerRouter from './src/controllers/workerController.js'
import agentRouter from './src/controllers/agentController.js'
import storageRouter from './src/controllers/storageController.js'

import initializeMqtt from './src/modules/mqtt/mqttServer.js'
import initializeListener from './src/modules/agent.js'
import initializeChecker from './src/modules/checker.js'

const app = express()
const port = 3000
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(repositoryRouter)
app.use(settingRouter)
app.use(fileRouter)
app.use(pipelineRouter)
app.use(workerRouter)
app.use(agentRouter)
app.use(storageRouter)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

initializeMqtt()
initializeListener()
initializeChecker()