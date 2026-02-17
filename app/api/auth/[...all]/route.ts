import { auth } from "@/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Делегируем все запросы /api/auth/* в better-auth
export const { GET, POST } = toNextJsHandler(auth);

