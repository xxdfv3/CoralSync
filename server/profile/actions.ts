"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/server/auth";
import { syncSiteUserToPayload } from "@/server/collections/actions";
import { updateBetterAuthUser } from "@/server/profile/better-auth-user";

const nicknameSchema = z
  .string()
  .trim()
  .min(1, "Введите никнейм")
  .max(64, "Не более 64 символов");

async function requireUserId(): Promise<string> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/**
 * Обновить никнейм (Better Auth user.name).
 */
export async function updateProfileNickname(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const raw = formData.get("nickname");
    const parsed = nicknameSchema.safeParse(
      typeof raw === "string" ? raw : ""
    );
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Ошибка" };
    }
    await updateBetterAuthUser(userId, { name: parsed.data });
    await syncSiteUserToPayload();
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { ok: false, error: "Нужна авторизация" };
    }
    return { ok: false, error: "Не удалось сохранить" };
  }
}

/**
 * Сбросить аватар (user.image = null).
 */
export async function clearProfileAvatar(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    const userId = await requireUserId();
    // Файл лежит в Payload Media; запись в БД не удаляем автоматически (можно почистить
    // в админке по usage === avatar перед релизом / после миграции в object storage).
    await updateBetterAuthUser(userId, { image: null });
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { ok: false, error: "Нужна авторизация" };
    }
    return { ok: false, error: "Не удалось удалить аватар" };
  }
}
