#!/usr/bin/env node

const path = require('path')
const cassandra = require('cassandra-driver')
const cassandraConfig = require(path.join(__dirname, '..', 'config',
  'cassandra.config.json'))
const cassandraClient = new cassandra.Client(cassandraConfig)
const cassandraMigrator = require(path.join(__dirname, 'cassandra_migrator.js'))

async function migrate() {
  try {
    await cassandraMigrator.migrate({
      cassandraClient: cassandraClient,
      path2MigrationsDir: path.resolve(path.join(__dirname, '..',
        'migrations_cassandra'))
    })
    return process.exit(0)
  } catch (exception) {
    return process.exit(1)
  }
}

migrate()
