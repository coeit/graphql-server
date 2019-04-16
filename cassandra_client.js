const cassandra = require('cassandra-driver')
const path = require('path')
const cassandraConfig = require(path.join(__dirname, 'config',
  'cassandra.config.json'))

/**
 * @var {object} The new and ready to use cassandraClient
 */
module.exports = new cassandra.Client(cassandraConfig)
