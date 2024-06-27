import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

(async () => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  })

  var res = await db.all(`select * from repos where guid = 'c726909d-384f-4ebb-91e2-e111dc1c4cf5'`)
  console.log(res)
  // console.log(await db.get('delete from repos where 1 = 1'))
  // console.log(await db.get('select * from repos'))
})()