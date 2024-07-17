
import { v4 } from 'uuid';
import { getConnection } from "./databaseClient.mjs"

export function getPipelines(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from pipelines')
            conn.close()

            resolve(result)
          })
          .catch(reject)
    })
}

export function getPipelinesByRepository(repoId){
  return new Promise(async (resolve, reject) => {
      await getConnection()
        .then(async conn => {
          var result = await conn.all('select * from pipelines where repoId = ?', repoId)
          conn.close()

          resolve(result)
        })
        .catch(reject)
  })
}
  
export function getPipelineByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get(`select * from pipelines where guid = ?`, guid)
            conn.close()

            resolve(result)
          })
          .catch(reject)
    })
}
  
export function addPipeline(repoId, name, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var guid = v4() // generate guid
  
            var result = await conn.all(`insert into pipelines values (null, ?, ?, ?, ?, datetime('now'))`, [
                guid,
                repoId,
                name,
                JSON.stringify(content)
            ])

            conn.close()
  
            resolve(guid)
          })
          .catch(reject)
    })
}

export function updatePipeline(guid, name, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all("update pipelines set name = ?, content = ?, lastUpdated = datetime('now') where guid = ?", [
                name,
                JSON.stringify(content),
                guid
            ])
            conn.close()

            resolve()
          })
          .catch(reject)
    })
}

export function removePipeline(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all("delete from pipelines where guid = ?", guid)
            conn.close()

            resolve()
          })
          .catch(reject)
    })
}

export function getPipelineTransactions(pipeId){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from pipeline_transactions where pipelineId = ?', pipeId)
            conn.close()

            resolve(result)
          })
          .catch(reject)
    })
}

export function getPipelineTransactionByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get('select * from pipeline_transactions where guid = ?', guid)
            conn.close()

            resolve(result)
          })
          .catch(reject)
    })
}

export function addPipelineTransaction(pipelineId, repoId, type, config, completed, status, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var guid = v4() // generate guid
            var parsedContent = JSON.stringify(content)
  
            var result = await conn.all(`insert into pipeline_transactions values (null, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`, [
                guid,
                pipelineId,
                repoId,
                type,
                config,
                completed,
                status,
                parsedContent
            ])
            conn.close()
  
            resolve(guid)
          })
          .catch(reject)
    })
}

export function updatePipelineTransaction(guid, completed, status, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all("update pipeline_transactions set completed = ?, status = ?, content = ?, lastUpdated = datetime('now') where guid = ?", [
                completed, 
                status,    
                content,
                guid
            ])
            conn.close()
            
            resolve()
          })
          .catch(reject)
    })
}

export function getPipelineTasks(transactionId){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from pipeline_tasks where transactionId = ?', transactionId)
            conn.close()

            resolve(result)
          })
          .catch(reject)
    })
}

export function getPipelineTaskByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get('select * from pipeline_tasks where guid = ?', guid)
            conn.close()

            resolve(result)
          })
          .catch(reject)
    })
}

export function addPipelineTask(transactionId, job, seq, title, type, completed, status, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var guid = v4() // generate guid
  
            var result = await conn.all(`insert into pipeline_tasks values (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`, [
                guid,
                transactionId,
                job,
                seq,
                title,
                type,
                completed,
                status,
                content
            ])
            conn.close()
  
            resolve(guid)
          })
          .catch(reject)
    })
}

export function updatePipelineTask(guid, completed, status, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all("update pipeline_tasks set completed = ?, status = ?, content = ?, lastUpdated = datetime('now') where guid = ?", [
                completed, 
                status,    
                content,
                guid
            ])
            conn.close()
            
            resolve()
          })
          .catch(reject)
    })
}