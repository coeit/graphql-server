#!/usr/bin/env node

const path = require('path')
const cassandra = require('cassandra-driver')
const cassandraConfig = require(path.join(__dirname, '..', 'config',
  'cassandra.config.json'))
const cassandraConfigNoKeyspace = Object.assign({}, cassandraConfig)
delete cassandraConfigNoKeyspace.keyspace
const cassandraClient = new cassandra.Client(cassandraConfigNoKeyspace)

async function checkConnection() {
  try {
    await cassandraClient.connect()
    return process.exit(0)
  } catch (exception) {
    return process.exit(1)
  }
}

checkConnection()
