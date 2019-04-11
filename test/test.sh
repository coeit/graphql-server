#!/usr/bin/env bash

# Start a local Cassandra server with Docker
echo -e '\nStarting Cassandra server:'
docker run --name sdb_cassandra -d --rm -p 7000:7000 -p 7001:7001 -p 7199:7199 -p 9042:9042 cassandra:3.11.4

# Wait until the Cassandra server is up and running
waited=0
until node ./utils/testCassandraServerAvailable.js
do
	if [ $waited == 240 ]; then
		echo -e '\nERROR: Time out reached while waiting for Cassandra server to be available.\n'
		exit 1
	fi
	sleep 2
	waited=$(expr $waited + 2)
done
echo -e '\nCassandra server up and running.\n'

# Run the tests
mocha test/test.js --exit

# Stop Cassandra server and clean up
echo -e '\nShutting down Cassandra servers:'
docker stop sdb_cassandra
