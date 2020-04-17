
import MySQL from 'mysql'

const connection = MySQL.createConnection({
  host: 'localhost',
  user: 'root',
  password: '(Melopasos*1951'
})

connection.connect(function(error) {
  if (error) {
    throw error
  }

  connection.query('DROP DATABASE IF EXISTS MelophonyDb', function (error, result) {
    if (error) {
      throw error
    }
    console.log('Database dropped')

    connection.query('CREATE DATABASE MelophonyDb', function (error, result) {
      if (error) {
        throw error
      }
      console.log('Database created')
      connection.end()
    })
  })

})