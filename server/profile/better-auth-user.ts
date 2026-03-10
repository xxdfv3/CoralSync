/**
 * Прямое обновление документа пользователя Better Auth в MongoDB.
 * Коллекция по умолчанию у mongodb-adapter — `user` (без usePlural).
 * Поля name / image используются в session.user.
 */
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";

/** Имя коллекции пользователей Better Auth в MongoDB */
const USER_COLLECTION = "user";

function getDb() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(MONGODB_URI);
  return { client, db: client.db() };
}

export async function updateBetterAuthUser(
  userId: string,
  patch: { name?: string | null; image?: string | null }
): Promise<void> {
  const { client, db } = getDb();
  try {
    let oid: ObjectId;
    try {
      oid = new ObjectId(userId);
    } catch {
      throw new Error("INVALID_USER_ID");
    }
    const $set: Record<string, string | null> = {};
    if ("name" in patch) $set.name = patch.name ?? null;
    if ("image" in patch) $set.image = patch.image ?? null;
    if (Object.keys($set).length === 0) return;

    const result = await db
      .collection(USER_COLLECTION)
      .updateOne({ _id: oid }, { $set });

    if (result.matchedCount === 0) {
      throw new Error("USER_NOT_FOUND");
    }
  } finally {
    await client.close();
  }
}
