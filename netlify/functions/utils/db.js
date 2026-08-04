const { MongoClient } = require('mongodb');

let cachedClient = null;

async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return cachedClient.db('ntust_calendar');
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client.db('ntust_calendar');
}

module.exports = { getDb };
