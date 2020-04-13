import { createConnection, Connection, getConnection } from 'typeorm'

export default class TestUtils {

  static async connect(): Promise<Connection> {
    Error.stackTraceLimit = 20

    const connection = await createConnection({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '(Melopasos*1951',
        database: 'MelophonyTest',
        entities: [ __dirname + '/../models/*.ts' ]
    })

    return connection
  }

  static async disconnect(): Promise<void> {
    await getConnection().close()
  }
}
