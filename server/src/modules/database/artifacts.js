import { getConnection } from "#src/modules/database/databaseClient.js"

export function addArtifact(guid, transactionId, name, path){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('insert into artifacts (guid, transactionid, name, path) values (?, ?, ?, ?)', 
              guid, 
              transactionId,
              name,
              path
            )
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getArtifacts(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from artifacts')
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getArtifactByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from artifacts where guid = ?', guid)
            conn.close()
            resolve(result.length <= 0 ? null : result[0])
          })
          .catch(reject)
    })
}

export function getArtifactByTransactionGuid(transactionGuid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select a.* from pipeline_transactions pt join artifacts a on a.transactionid = pt.id where pt.guid = ?', transactionGuid)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getArtifactByPipelineGuid(pipelineGuid) {
  return new Promise(async (resolve, reject) => {
    await getConnection()
      .then(async conn => {
        var result = await conn.all('select a.* from pipelines p join pipeline_transactions pt on pt.pipelineid = p.id join artifacts a on a.transactionid = pt.id where p.guid = ?', pipelineGuid)
        conn.close()
        resolve(result)
      })
      .catch(reject)
  })
}

export function getArtifactByRepositoryGuid(repoGuid){
  return new Promise(async (resolve, reject) => {
    await getConnection()
      .then(async conn => {
        var result = await conn.all('select a.* from repos r join pipelines p on p.repoId = r.id join pipeline_transactions pt on pt.pipelineid = p.id join artifacts a on a.transactionid = pt.id where r.guid = ?', repoGuid)
        conn.close()
        resolve(result)
      })
      .catch(reject)
  })
}

export function removeArtifactByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('delete from artifacts where guid = ?', guid)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}