import { getConnection } from "#src/modules/database/databaseClient.js"

export function addArtifact(guid, name, path){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('insert into artifacts (guid, name, path, lastUpdated) values (?, ?, ?, datetime("now"))', 
              guid, 
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