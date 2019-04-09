/**
 * Uses the instance cassandraClient to create the argument keyspace if it not
 * already exists with the argument replication.
 *
 * @param {object} cassandraClient - An instance of cassandra.Client from npm
 * package cassandra-driver
 * @param {string} keyspace - the name of the keyspace to create if not does
 * not already exist
 * @param {string} replication - The replication configuration in the form
 * of a string. See CASSANDRA documentation for more details.
 *
 * @return  
 */
module.exports.createKeyspaceIfNotExits = function({
  cassandraClient,
  keyspace,
  replication
}) {
  return cassandraClient.execute(
    `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = ${replication}`)
}
