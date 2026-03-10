import { NextResponse } from "next/server";
import { headers } from "next/headers";
import sharp from "sharp";
import { getPayload } from "payload";
import config from "@payload-config";
import { auth } from "@/server/auth";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * POST multipart/form-data, поле "file".
 * Постер пользовательского тайтла → Payload Media (usage: title_banner), возвращает URL для coverUrl.
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
  if (!ALLOWED.has(file.type || "")) {
    return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(buffer)
      .rotate()
      .resize(600, 900, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "PROCESSING_FAILED" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const filename = `title-poster-${userId}-${Date.now()}.webp`;

  const doc = await (payload as unknown as {
    create: (args: Record<string, unknown>) => Promise<{ url?: string }>;
  }).create({
    collection: "media",
    data: {
      alt: `Постер тайтла пользователя ${userId}`,
      usage: "title_banner",
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
    typeof doc === "object" && doc !== null && typeof doc.url === "string"
      ? doc.url
      : null;
  if (!url) {
    return NextResponse.json({ error: "NO_URL" }, { status: 500 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  const imageUrl = url.startsWith("http")
    ? url
    : base
      ? `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`
      : url;

  return NextResponse.json({ ok: true, imageUrl });
}
