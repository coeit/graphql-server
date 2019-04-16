#!/usr/bin/env node

const path = require('path')
const cassandra = require('cassandra-driver')
const cassandraConfig = require(path.join(__dirname, '..', 'config',
  'cassandra.config.json'))
const cassandraMigrator = require(path.join(__dirname, 'cassandra_migrator.js'))

async function migrate() {
  try {
    // Create Keyspace:
    let cassandraConfigNoKeyspace = Object.assign({}, cassandraConfig)
    delete cassandraConfigNoKeyspace.keyspace
    let cassandraClient = new cassandra.Client(cassandraConfigNoKeyspace)
    await cassandraMigrator.createKeyspaceIfNotExits({
      cassandraClient: cassandraClient,
      keyspace: cassandraConfig.keyspace,
      replication: cassandraConfig.replication
    })
    // Run Migrations:
    cassandraClient = new cassandra.Client(cassandraConfig)
    await cassandraMigrator.createMigrationTableIfNotExists({
      cassandraClient: cassandraClient
    })
    await cassandraMigrator.migrate({
      cassandraClient: cassandraClient,
      path2MigrationsDir: path.resolve(path.join(__dirname, '..',
        'migrations-cassandra'))
    })
    return process.exit(0)
  } catch (exception) {
    console.log(`Error while setting up Cassandra:\n${exception}`)
    return process.exit(1)
  }
}

migrate()
