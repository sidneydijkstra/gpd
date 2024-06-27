import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

(async () => {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    })

    await db.exec(`
        DROP TABLE IF EXISTS repos;
        CREATE TABLE IF NOT EXISTS repos (
            id integer PRIMARY KEY AUTOINCREMENT,
            guid varchar(255),
            username varchar(255),
            repository varchar(255),
            content text,
            lastUpdated time
        )
    `)
})()

