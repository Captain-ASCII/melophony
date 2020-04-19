
import MySQL from 'mysql'

import Log from '@utils/Log'

const connection = MySQL.createConnection({
  host: 'localhost',
  user: 'root',
  password: '(Melopasos*1951'
})

connection.connect(function(error) {
  if (error) {
    throw error
  }

  connection.query('DROP DATABASE IF EXISTS MelophonyTest', function (error, result) {
    if (error) {
      throw error
    }
    Log.i('Database dropped')

    connection.query('CREATE DATABASE MelophonyTest', function (error, result) {
      if (error) {
        throw error
      }
      Log.i('Database created')
      connection.end()
    })
  })

})