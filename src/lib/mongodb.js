import { MongoClient } from "mongodb";

/**
 * Serverless-safe MongoDB connection.
 *
 * A single connection promise is stored on `globalThis` so every module
 * instance in the same Vercel function reuses the same pool. The promise is
 * cleared on failure so a transient Atlas outage cannot poison warm
 * invocations forever. The client is never closed during a request.
 */
const globalForMongo = globalThis;
const CACHE_KEY = "__wedplanMongoClientPromise";

function createClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
    waitQueueTimeoutMS: 5_000,
  });

  return client.connect().then(
    () => client,
    (err) => {
      // Do not leave a rejected promise cached; the next request retries.
      if (globalForMongo[CACHE_KEY]) globalForMongo[CACHE_KEY] = null;
      return Promise.reject(err);
    },
  );
}

export function getMongoClientPromise() {
  if (!globalForMongo[CACHE_KEY]) {
    globalForMongo[CACHE_KEY] = createClientPromise();
  }
  return globalForMongo[CACHE_KEY];
}

export async function getMongoClient() {
  return getMongoClientPromise();
}

export async function getMongoDb() {
  const client = await getMongoClientPromise();
  return client.db(process.env.DB_NAME || undefined);
}
