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
            source varchar(255),
            username varchar(255),
            repository varchar(255),
            content text,
            lastUpdated time
        );

        CREATE TABLE IF NOT EXISTS settings (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            repoId integer,
            key varchar(255) NOT NULL,
            value text NOT NULL,
            lastUpdated time NOT NULL,
            FOREIGN KEY (repoId) REFERENCES repos(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pipelines (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid varchar(255) NOT NULL,
            repoId integer NOT NULL,
            name varchar(255) NOT NULL,
            content text,
            lastUpdated time NOT NULL,
            FOREIGN KEY (repoId) REFERENCES repos(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS pipeline_transactions (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid varchar(255) NOT NULL,
            pipelineId integer NOT NULL,
            repoId integer NOT NULL,
            type varchar(255) NOT NULL,
            config text NOT NULL,
            completed boolean NOT NULL,
            status varchar(255) NOT NULL,
            content text,
            lastUpdated time NOT NULL,
            FOREIGN KEY (pipelineId) REFERENCES pipelines(id) ON DELETE CASCADE,
            FOREIGN KEY (repoId) REFERENCES repos(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pipeline_tasks (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid varchar(255) NOT NULL,
            transactionId integer NOT NULL,
            job varchar(255) NOT NULL,
            seq integer NOT NULL,
            title varchar(255) NOT NULL,
            type varchar(255) NOT NULL,
            completed boolean NOT NULL,
            status varchar(255) NOT NULL,
            content text,
            lastUpdated time NOT NULL,
            FOREIGN KEY (transactionId) REFERENCES pipeline_transactions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS artifacts (
            id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid varchar(255) NOT NULL,
            transactionId integer NOT NULL,
            name varchar(255) NOT NULL,
            path varchar(255) NOT NULL,
            FOREIGN KEY (transactionId) REFERENCES pipeline_transactions(id) ON DELETE CASCADE
        );
    `)
})()

