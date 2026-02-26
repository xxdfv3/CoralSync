import { createAuthClient } from "better-auth/react";

/**
 * Better Auth клиент для React.
 * Используется для sign-in, sign-up и управления сессией на клиенте.
 * baseURL должен совпадать с BETTER_AUTH_URL на сервере.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { useSession } = authClient;
