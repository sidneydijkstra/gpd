import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { v4 } from 'uuid';

export function getConnection () {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  })
}

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

export function getRepositoryByGuid(guid){
  return new Promise(async (resolve, reject) => {
      await getConnection()
        .then(async conn => {
          var result = await conn.get('select * from repos where guid = ?', guid)
          conn.close()
          resolve(result)
        })
        .catch(reject)
  })
}

export function addRepository(username, repository, content){
  return new Promise(async (resolve, reject) => {
      await getConnection()
        .then(async conn => {
          var guid = v4() // generate guid
          var parsedContent = JSON.stringify(content)

          var result = await conn.all("insert into repos values (null, ?, ?, ?, ?, datetime('now'))", [
            guid,
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