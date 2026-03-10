import { NextResponse } from "next/server";
import { headers } from "next/headers";
import sharp from "sharp";
import { getPayload } from "payload";

import config from "@payload-config";
import { auth } from "@/server/auth";
import { updateBetterAuthUser } from "@/server/profile/better-auth-user";
import { syncSiteUserToPayload } from "@/server/collections/actions";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * POST multipart/form-data, поле "file".
 * Загружает аватар в коллекцию Payload Media (upload) и пишет doc.url в user.image.
 * Перед релизом хранилище можно сменить на S3/R2/Blob — миграция по полю usage === 'avatar'.
 */
export async function POST(request: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const type = file.type || "";
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(buffer)
      .rotate()
      .resize(256, 256, { fit: "cover", position: "centre" })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "PROCESSING_FAILED" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const filename = `avatar-${userId}.webp`;

  // Типы Config могут не включать media — как в server/collections/actions
  const doc = await (payload as unknown as {
    create: (args: Record<string, unknown>) => Promise<{ url?: string }>;
  }).create({
    collection: "media",
    data: {
      alt: `Аватар пользователя ${userId}`,
      usage: "avatar",
    },
    file: {
      data: webpBuffer,
      mimetype: "image/webp",
      name: filename,
      size: webpBuffer.length,
    },
    overrideAccess: true,
  });

  const url =
    typeof doc === "object" &&
    doc !== null &&
    "url" in doc &&
    typeof (doc as { url: unknown }).url === "string"
      ? (doc as { url: string }).url
      : null;

  if (!url) {
    return NextResponse.json({ error: "NO_URL" }, { status: 500 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "";
  const imageUrl = url.startsWith("http")
    ? url
    : base
      ? `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`
      : url;

  await updateBetterAuthUser(userId, { image: imageUrl });
  await syncSiteUserToPayload();

  return NextResponse.json({ ok: true, imageUrl });
}
