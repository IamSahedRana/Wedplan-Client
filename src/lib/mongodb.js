import { MongoClient } from "mongodb";

let client;
let cachedDb;

function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  client = new MongoClient(uri);
  return client.db(process.env.DB_NAME || undefined);
}

/**
 * Returns the MongoDB database, deferring the connection until the first
 * real operation. Keeps module init (and builds) safe when env vars are
 * placeholders; invalid URIs still fail loudly at first query.
 */
export function getMongoDb() {
  if (!cachedDb) {
    cachedDb = new Proxy(
      {},
      {
        get(_target, prop) {
          const db = connect();
          const value = Reflect.get(db, prop, db);
          return typeof value === "function" ? value.bind(db) : value;
        },
      }
    );
  }
  return cachedDb;
}
