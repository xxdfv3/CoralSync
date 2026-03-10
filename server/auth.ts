import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "";
const client = new MongoClient(MONGODB_URI);
const db = client.db();

/**
 * Better Auth instance.
 *
 * Пользователи и сессии хранятся в MongoDB (та же БД, что и для Payload/приложения).
 * При standalone MongoDB без replica set при ошибках транзакций задать transaction: false в database.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db, {
    client,
    transaction: false, // standalone MongoDB (Docker без replica set) не поддерживает транзакции
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.68.101:3000", // доступ с другого устройства в LAN
  ],
  emailAndPassword: {
    enabled: true,
  },
});

