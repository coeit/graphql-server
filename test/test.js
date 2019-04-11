const expect = require('chai').expect;
const path = require('path')
const cassandra = require('cassandra-driver');
const cassandraMigrator = require(path.join(__dirname, '..', 'utils',
  'cassandra_migrator.js'))

describe('Client setup and migrations', function() {

  it('Should create the default keyspace if it does not exist yet', async function() {
    let cassandraConfig = require(path.join(__dirname, '..',
      'config', 'cassandra.config.json'))
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
  });

});
