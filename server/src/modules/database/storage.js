import { v4 } from 'uuid'
import { getConnection } from "#src/modules/database/databaseClient.js"

export function addStorage(name, type, content, repoId = null){
    return new Promise(async (resolve, reject) => {
        const guid = v4()

        await getConnection()
          .then(async conn => {
            var result = await conn.all('insert into storage (guid, name, type, content, repoId, lastUpdated) values (?, ?, ?, ?, ?, datetime("now"))',
                guid,
                name,
                type,
                content,
                repoId
            )
            conn.close()
            resolve(guid)
          })
          .catch(reject)
    })
}

export function updateStorage(guid, name, type, content, repoId = null){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('update storage set name = ?, type = ?, content = ?, repoId = ?, lastUpdated = datetime("now") where guid = ?', 
                name,
                type,
                content,
                repoId,
                guid
            )
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getAllStorage(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from storage')
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getStorageByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from storage where guid = ?', guid)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getAllStorageByRepositoryId(repoId){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from storage where repoId = ? or repoId is null', repoId)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function removeStorageByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('delete from storage where guid = ?', guid)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}