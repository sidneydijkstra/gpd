import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import config from '#src/server.config.js'

export function getConnection () {
  return open({
    filename: config.databaseFilePath,
    driver: sqlite3.Database
  })
}