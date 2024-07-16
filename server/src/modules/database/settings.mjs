import { getConnection } from "./databaseClient.mjs"

export function getAllSettings(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from settings')
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getAllGlobalSettings(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from settings where repoId is null')
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getGlobalSetting(key){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get('select * from settings where repoId is null and key = ?', key)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function addGlobalSetting(key, value){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            await conn.run('insert into settings (key, value, lastUpdated) values (?, ?, datetime("now"))', key, value)
            conn.close()
            resolve()
          })
          .catch(reject)
    })
}

export function updateGlobalSetting(key, value){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            await conn.run('update settings set value = ?, lastUpdated = datetime("now") where repoId is null and key = ?', value, key)
            conn.close()
            resolve()
          })
          .catch(reject)
    })
}

export function getAllRepositorySettings(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from settings where repoId is not null')
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getRepositorySettings(repoId){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get('select * from settings where repoId = ?', repoId)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getRepositorySetting(repoId, key){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get('select * from settings where repoId = ? and key = ?', repoId, key)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function addRepositorySetting(repoId, key, value){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            await conn.run('insert into settings (repoId, key, value, lastUpdated) values (?, ?, ?, datetime("now"))', repoId, key, value)
            conn.close()
            resolve()
          })
          .catch(reject)
    })
}

export function updateRepositorySetting(repoId, key, value){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            await conn.run('update settings set value = ?, lastUpdated = datetime("now") where repoId = ? and key = ?', value, repoId, key)
            conn.close()
            resolve()
          })
          .catch(reject)
    })
}