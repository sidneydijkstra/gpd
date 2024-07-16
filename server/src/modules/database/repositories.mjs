
import { v4 } from 'uuid';
import { getConnection } from "./databaseClient.mjs"

export function getRepositories(){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('select * from repos')
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}

export function getRepositoryById(id){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get('select * from repos where id = ?', id)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}
  
export function getRepositoryByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.get(`select * from repos where guid = ?`, guid)
            conn.close()
            resolve(result)
          })
          .catch(reject)
    })
}
  
export function addRepository(source, username, repository, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var guid = v4() // generate guid
            var parsedContent = JSON.stringify(content)
  
            var result = await conn.all(`insert into repos values (null, ?, ?, ?, ?, ?, datetime('now'))`, [
              guid,
              source,
              username,
              repository,
              parsedContent
            ])
            conn.close()
  
            resolve(guid)
          })
          .catch(reject)
    })
}
  
export function updateRepository(guid, content){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all("update repos set content = ?, lastUpdated = datetime('now') where guid = ?", [
              JSON.stringify(content),
              guid
            ])
            conn.close()
  
            resolve(result)
          })
          .catch(reject)
    })
}
  
export function removeRepository(username, repository){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('delete from repos where username = ? and repository = ?', [
              username, 
              repository
            ])
            conn.close()
            
            resolve(result)
          })
          .catch(reject)
    })
}
  
export function removeRepositoryByGuid(guid){
    return new Promise(async (resolve, reject) => {
        await getConnection()
          .then(async conn => {
            var result = await conn.all('delete from repos where guid = ?', guid)
            conn.close()
            
            resolve(result)
          })
          .catch(reject)
    })
}