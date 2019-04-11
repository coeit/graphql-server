const expect = require('chai').expect
const path = require('path')
const cassandra = require('cassandra-driver')
const cassandraMigrator = require(path.join(__dirname, '..', 'utils',
  'cassandra_migrator.js'))
const cassandraConfig = require(path.join(__dirname, '..', 'config',
  'cassandra.config.json'))

describe('Client setup and migrations', function() {

  it('Should create the default keyspace if it does not exist yet', async function() {
    let cassandraConfigNoKeyspace = Object.assign({}, cassandraConfig)
    delete cassandraConfigNoKeyspace.keyspace
    expect(cassandraMigrator).not.to.be.null
    let cassandraClient = new cassandra.Client(
      cassandraConfigNoKeyspace)
    let res = await cassandraMigrator.createKeyspaceIfNotExits({
      cassandraClient: cassandraClient,
      keyspace: cassandraConfig.keyspace,
      replication: cassandraConfig.replication
    })
    expect(res.info.isSchemaInAgreement).to.be.true
    expect(cassandraClient.metadata.keyspaces).to.have.any.keys('ks1')
  })

  it('Should create the migrations table if does not exist yet', async function() {
    let migrationsQuery = 'SELECT * FROM migrations'
    let cassandraClient = new cassandra.Client(cassandraConfig)
    try {
      await cassandraClient.execute(migrationsQuery)
    } catch (selErr) {
      expect(selErr.constructor.name).to.equal('ResponseError')
      expect(selErr.message).to.equal('unconfigured table migrations')
    }
    let migRes = await cassandraMigrator.createMigrationTableIfNotExists({
      cassandraClient: cassandraClient
    })
    expect(migRes.info.isSchemaInAgreement).to.be.true
    let selRes = await cassandraClient.execute(migrationsQuery)
    expect(selRes.rows.length).to.equal(0)
  })

  it('Should be able to insert into and find migrations in the migrations table',
    async function() {
      let cassandraClient = new cassandra.Client(cassandraConfig)
      let migrationName = 'testMigration'
      let res = await cassandraMigrator.hasMigrationBeenExecuted({
        cassandraClient: cassandraClient,
        migrationName: migrationName
      })
      expect(res).to.be.false
      await cassandraMigrator.insertMigration({
        cassandraClient: cassandraClient,
        migrationName: migrationName
      })
      res = await cassandraMigrator.hasMigrationBeenExecuted({
        cassandraClient: cassandraClient,
        migrationName: migrationName
      })
      expect(res).to.be.true
    })

})
