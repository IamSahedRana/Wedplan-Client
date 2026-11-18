import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { ObjectId } from "mongodb";

import { getMongoDb } from "./mongodb";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

let authInstance;

/** Lazily initializes Better Auth so importing this module never touches Mongo. */
export function getAuth() {
  if (!authInstance) {
    authInstance = betterAuth({
      baseURL,
      secret: process.env.BETTER_AUTH_SECRET,
      trustedOrigins: [process.env.BETTER_AUTH_URL].filter(Boolean),
      database: mongodbAdapter(getMongoDb()),
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
      },
      user: {
        modelName: "users",
        additionalFields: {
          role: { type: "string", required: false, defaultValue: "customer", input: true },
          isBlocked: { type: "boolean", defaultValue: false, input: false },
          onboarded: { type: "boolean", defaultValue: false, input: false },
          businessName: { type: "string", required: false, input: true },
          phone: { type: "string", required: false, input: false },
          address: { type: "string", required: false, input: false },
          bio: { type: "string", required: false, input: false },
          subscriptionPlan: { type: "string", defaultValue: "free", input: false },
          subscriptionExpiresAt: { type: "date", required: false, input: false },
        },
      },
      socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : undefined,
      hooks: {
        before: createAuthMiddleware(async (ctx) => {
          if (ctx.path === "/sign-up/email" && ctx.body?.password) {
            const password = ctx.body.password;
            if (!/^(?=.*[A-Z])(?=.*[a-z]).{6,}$/.test(password)) {
              throw new APIError("BAD_REQUEST", {
                message: "Password must be at least 6 characters and include an uppercase and a lowercase letter",
              });
            }
          }
        }),
      },
      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              return {
                data: {
                  ...user,
                  role: ["vendor", "customer"].includes(user.role) ? user.role : "customer",
                },
              };
            },
          },
        },
        session: {
          create: {
            before: async (session) => {
              const user = await getMongoDb()
                .collection("users")
                .findOne({ _id: new ObjectId(session.userId) });
              if (user?.isBlocked) {
                throw new APIError("FORBIDDEN", { message: "Account is blocked" });
              }
            },
          },
        },
      },
      plugins: [jwt(), nextCookies()],
    });
  }
  return authInstance;
}
