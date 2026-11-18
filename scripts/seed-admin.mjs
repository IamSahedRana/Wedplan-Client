import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient, ObjectId } from "mongodb";

const { MONGODB_URI, DB_NAME, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

if (!MONGODB_URI || !BETTER_AUTH_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
  console.error("Missing required env vars: MONGODB_URI, BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME");
  process.exit(1);
}

if (!/^(?=.*[A-Z])(?=.*[a-z]).{6,}$/.test(ADMIN_PASSWORD)) {
  console.error("ADMIN_PASSWORD must be min 6 characters and include an uppercase and a lowercase letter");
  process.exit(1);
}

const mongo = new MongoClient(MONGODB_URI);
const db = mongo.db(DB_NAME || undefined);

const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  database: mongodbAdapter(db, { client: mongo }),
  user: { modelName: "users" },
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
});

const email = ADMIN_EMAIL.toLowerCase();
const existing = await db.collection("users").findOne({ email });

let userId;
if (existing) {
  userId = existing._id;
  console.log(`Admin user already exists: ${email}`);
} else {
  const res = await auth.api.signUpEmail({
    body: { email, password: ADMIN_PASSWORD, name: ADMIN_NAME },
  });
  userId = res.user.id;
  console.log(`Created admin user: ${email}`);
}

await db.collection("users").updateOne(
  { _id: new ObjectId(String(userId)) },
  { $set: { role: "admin", onboarded: true } }
);
console.log("role=admin, onboarded=true set.");

await mongo.close();
