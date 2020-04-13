
require('ts-node/register')
require('tsconfig-paths/register')

const createConnection = require('typeorm').createConnection

module.exports = async function setup() {
  const connection = await createConnection({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '(Melopasos*1951',
    database: 'MelophonyTest',
    entities: [ __dirname + '/../models/*.ts' ]
  })

  await connection.synchronize(true)
}