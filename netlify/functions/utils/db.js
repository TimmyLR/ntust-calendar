import { MongoClient } from 'mongodb';

let cachedDb = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedDb = client.db('ntust_calendar');
  return cachedDb;
}
