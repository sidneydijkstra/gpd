import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export function getConnection () {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  })
}