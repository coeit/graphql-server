const cassandra = require('cassandra-driver')
const path = require('path')
const cassandraConfig = require(path.join(__dirname, 'config',
  'cassandra.config.json'))

module.exports.cassandraClient = new cassandra.Client(cassandraConfig)
