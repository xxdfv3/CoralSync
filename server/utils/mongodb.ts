import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/coralsync";

/**
 * Фактический тип после await mongoose.connect — без рекурсивного вывода
 * через global, который раньше давал Promise<{ conn, promise }>.
 */
type MongooseConnection = Awaited<ReturnType<typeof mongoose.connect>>;

interface MongooseServerCache {
  conn: MongooseConnection | null;
  promise: Promise<MongooseConnection> | null;
}

declare global {
  // Не используем имя `mongoose` на global — пересечение с импортом ломало тип promise
  // eslint-disable-next-line no-var -- расширение global для HMR в dev
  var mongooseServerCache: MongooseServerCache | undefined;
}

const cached: MongooseServerCache =
  global.mongooseServerCache ??
  (global.mongooseServerCache = { conn: null, promise: null });

/**
 * Одно подключение на процесс (кэш в global), без лишних .then.
 */
export async function connectDB(): Promise<MongooseConnection> {
  if (cached.conn !== null) return cached.conn;
  if (cached.promise === null) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
