import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import config from '../../server.config.mjs'

export function getConnection () {
  return open({
    filename: config.databaseFilePath,
    driver: sqlite3.Database
  })
}