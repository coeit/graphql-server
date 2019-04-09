const expect = require('chai').expect;
const path = require('path')
const cassandra = require('cassandra-driver');
const cassandraMigrator = require(path.join(__dirname, '..', 'utils',
  'cassandra_migrator.js'))

describe('Client setup and migrations', function() {

  it('Should create the default keyspace if it does not exist yet', async function() {
    // Cassandra takes a bit for creating a keyspace
    this.timeout(10000)

    let cassandraConfig = require(path.join(__dirname, '..',
      'unit_test_misc', 'cassandra.config.json'))
    let cassandraConfigNoKeyspace = Object.assign({}, cassandraConfig)
    delete cassandraConfigNoKeyspace.keyspace
    let cassandraClient = new cassandra.Client(
      cassandraConfigNoKeyspace)
    let res = await cassandraMigrator.createKeyspaceIfNotExits({
      cassandraClient: cassandraClient,
      keyspace: cassandraConfig.keyspace,
      replication: cassandraConfig.replication
    })
    expect(res.info.isSchemaInAgreement).to.be.true
    expect(cassandraClient.metadata.keyspace).to.have.any.keys('ks1')
  });

});
