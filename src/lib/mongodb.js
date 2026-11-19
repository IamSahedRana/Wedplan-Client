import { MongoClient } from "mongodb";

let client;
let cachedDb;

function createClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  return new MongoClient(uri);
}

/**
 * Returns a stable database handle. A single MongoClient is created lazily
 * per process so the driver's connection pool is reused — creating a client
 * on every property access exhausts Atlas connections during auth requests.
 */
export function getMongoDb() {
  if (!cachedDb) {
    client = client || createClient();
    const db = client.db(process.env.DB_NAME || undefined);

    cachedDb = new Proxy(db, {
      get(target, prop) {
        const value = Reflect.get(target, prop, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  }
  return cachedDb;
}
