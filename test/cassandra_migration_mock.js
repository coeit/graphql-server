module.exports.up = async function({
  cassandraClient
}) {
  return cassandraClient.execute(
    `CREATE TABLE IF NOT EXISTS test_table (id bigint, name text, PRIMARY KEY(id))`
  )
}

module.exports.down = async function({
  cassandraClient
}) {
  return cassandraClient.execute(`DROP TABLE IF EXISTS test_table`)
}
