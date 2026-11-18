import { MongoClient } from "mongodb";

let client;
let cachedDb;

/** Lazily creates (and caches per process) the MongoDB client + database. */
export function getMongoDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!cachedDb) {
    client = new MongoClient(process.env.MONGODB_URI);
    cachedDb = client.db(process.env.DB_NAME || undefined);
  }
  return cachedDb;
}

export function getMongoClient() {
  getMongoDb();
  return client;
}
