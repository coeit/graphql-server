const fs = require('fs')
const path = require('path')

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
    `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = ${replication}`
  )
}

/**
 * Create the 'migrations' table if does not exist yet.
 *
 * @param {object} cassandraClient - The connected cassandraClient having set a
 * keyspace.
 *
 * @return {Promise} The result of invoking cassandraClient.execute(...)
 */
module.exports.createMigrationTableIfNotExists = function({
  cassandraClient
}) {
  return cassandraClient.execute(
    `CREATE TABLE IF NOT EXISTS migrations ( name text, migration_date timestamp, PRIMARY KEY (name) )`
  )
}

/**
 * Inserts a single row into the 'migrations' table using the argument 'name'
 * and the current time as 'migration_date'.
 *
 * @param {object} cassandraClient - The connected cassandraClient having set a
 * keyspace.
 * @param {string} migrationName - The name of the migration that has been
 * executed and has to be stored in thte migration table.
 *
 * @return {Promise} The result of invoking cassandraClient.execute(...)
 */
module.exports.insertMigration = function({
  cassandraClient,
  migrationName
}) {
  return cassandraClient.execute(
    `INSERT INTO migrations (name, migration_date) VALUES ('${migrationName}', toTimestamp(now()))`
  )
}

/**
 * Finds a single row in the 'migrations' table using the argument 'name' (PRIMARY KEY).
 *
 * @param {object} cassandraClient - The connected cassandraClient having set a
 * keyspace.
 * @param {string} migrationName - The name of the migration that has been
 * executed and should be stored in the migrations table.
 *
 * @return {Promise} The result of invoking cassandraClient.execute(...)
 */
module.exports.selectMigration = function({
  cassandraClient,
  migrationName
}) {
  return cassandraClient.execute(
    `SELECT name, migration_date FROM migrations WHERE name = '${migrationName}'`
  )
}

/**
 * Checks whether a migration of argument 'migrationName' (PRIMARY KEY) is
 * present in the respective migrations table.
 *
 * @param {object} cassandraClient - The connected cassandraClient having set a
 * keyspace.
 * @param {string} migrationName - The name of the migration for which to find
 * out if it has been executed and thus stored within the migrations table. 
 *
 * @return {boolean} true if and only if the migration with PRIMARY KEY
 * 'migrationName' is found in the migrations table.
 */
module.exports.hasMigrationBeenExecuted = async function({
  cassandraClient,
  migrationName
}) {
  let res = await module.exports.selectMigration({
    cassandraClient: cassandraClient,
    migrationName: migrationName
  })
  if (res.rows.length == 1) {
    return true
  } else {
    return false
  }
}

/**
 * Executes the migration of argument 'migrationName' using 'upFunk' if it not
 * already has been executed in the past (see hasMigrationBeenExecuted for
 * details).
 *
 * @param {object} cassandraClient - The connected cassandraClient having set a 
 * keyspace.
 * @param {string} migrationName - The name of the migration for which to find
 * out if it has been executed and thus stored within the migrations table. 
 * @param {function} upFunk - The function to invoke to execute the migration.
 * The function must accept the named argument {cassandraClient:
 * cassandraClient}. It may be async.
 *
 * @return {object} The result of invoking 'upFunk' or 'true' if the migration
 * already had been executed in the past.
 */
module.exports.executeMigrationIfNotAlreadyDone = async function({
  cassandraClient,
  migrationName,
  upFunk
}) {
  let hasMigBeenExecuted = await module.exports.hasMigrationBeenExecuted({
    cassandraClient: cassandraClient,
    migrationName: migrationName
  })
  if (hasMigBeenExecuted) {
    console.log(
      `Cassandra migration '${migrationName}' has already been executed`)
    return true
  } else {
    return await upFunk({
      cassandraClient: cassandraClient
    })
  }
}

/**
 * Execute all migrations found in directory 'path2MigrationsDir'. All files
 * ending in '.js' are considered migrations and are expected to export at
 * least a function called 'up'. This function should receive a single named
 * argument {cassandraClient}.
 *
 * @param {object} cassandraClient - The connected cassandraClient having set a 
 * keyspace.
 * @param {string} path2MigrationsDir - The valid file path to the directory
 * containing all migrations to be executed.
 *
 * @return {array} the cumulative returns of each migration
 */
module.exports.migrate = async function({
  cassandraClient,
  path2MigrationsDir
}) {
  return await Promise.all(fs.readdirSync(path2MigrationsDir).filter(f => {
    return !!f.match(/\.js$/)
  }).map(async f => {
    let migName = f.replace(/\.js$/, '')
    let upFunk = require(path.resolve(path.join(path2MigrationsDir,
      f))).up
    if (upFunk === undefined) {
      throw new Error(
        `Migration '${f}' does not export a function 'up'.`)
    }
    return await module.exports.executeMigrationIfNotAlreadyDone({
      cassandraClient: cassandraClient,
      migrationName: migName,
      upFunk: upFunk
    })
  }))
}
