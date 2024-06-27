import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

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

export function addRepository(username, repository, content){
  return new Promise(async (resolve, reject) => {
      await getConnection()
        .then(async conn => {
          var result = await conn.all('insert into repos values (?, ?, ?)', [
            username, 
            repository,
            JSON.stringify(content)
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