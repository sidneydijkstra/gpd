import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import repositoryRouter from './src/controllers/repositoryController.mjs'
import settingRouter from './src/controllers/settingController.mjs'
import fileRouter from './src/controllers/fileController.mjs'
import pipelineRouter from './src/controllers/pipelineController.mjs'

import initializeMqtt from './src/modules/mqtt/mqttServer.mjs'
import { initializeListener } from './src/modules/agent/agent.mjs'
import { checkRepositories } from './src/modules/agent/repoChecker.mjs'

const app = express()
const port = 3000
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(repositoryRouter)
app.use(settingRouter)
app.use(fileRouter)
app.use(pipelineRouter)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

initializeMqtt()
initializeListener()
checkRepositories()