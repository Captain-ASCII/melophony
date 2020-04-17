
require('ts-node/register')
require('tsconfig-paths/register')

const getConnection = require('typeorm').getConnection

module.exports = async function s() {
  // await getConnection().synchronize(true)
  await getConnection().close()
}
