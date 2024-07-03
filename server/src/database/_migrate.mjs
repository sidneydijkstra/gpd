import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

(async () => {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    })

    await db.exec(`
        CREATE TABLE IF NOT EXISTS repos (
            id integer PRIMARY KEY AUTOINCREMENT,
            guid varchar(255),
            username varchar(255),
            repository varchar(255),
            content text,
            lastUpdated time,
            PRIMARY KEY (id)
        );

        DROP TABLE IF EXISTS pipelines;
        CREATE TABLE IF NOT EXISTS pipelines (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid varchar(255) NOT NULL,
            repoId integer NOT NULL,
            name varchar(255) NOT NULL,
            content text,
            lastUpdated time NOT NULL,
            FOREIGN KEY (repoId) REFERENCES repos(id)
        );
        
        CREATE TABLE IF NOT EXISTS pipeline_transactions (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid varchar(255) NOT NULL,
            pipelineId integer NOT NULL,
            repoId integer NOT NULL,
            type varchar(255) NOT NULL,
            completed boolean NOT NULL,
            status varchar(255) NOT NULL,
            content text,
            lastUpdated time NOT NULL,
            FOREIGN KEY (pipelineId) REFERENCES pipelines(id),
            FOREIGN KEY (repoId) REFERENCES repos(id)
        );
    `)
})()

