import { betterAuth } from "better-auth";

/**
 * Better Auth instance.
 *
 * По умолчанию включаем email+password и статeless-сессии (без БД).
 * При необходимости можно добавить:
 * - database: { ... } для Mongo/Postgres и т.п.
 * - socialProviders: { github, google, ... }
 */
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  // Пример настройки stateless-сессий (можно раскомментировать и донастроить позже):
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 7 * 24 * 60 * 60,
  //     strategy: "jwe",
  //     refreshCache: true,
  //   },
  // },
});

