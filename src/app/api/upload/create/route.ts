import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/storage";
import { randomUUID } from "node:crypto";

const audioMime = new Set(["audio/wav", "audio/x-wav", "audio/mpeg", "audio/flac", "audio/x-flac"]);
const imageMime = new Set(["image/jpeg", "image/png", "image/webp"]);

const schema = z.object({
  audio: z.object({
    fileName: z.string().min(1),
    contentType: z.string().min(1),
    size: z.number().max(50 * 1024 * 1024),
  }),
  cover: z
    .object({
      fileName: z.string().min(1),
      contentType: z.string().min(1),
      size: z.number().max(5 * 1024 * 1024),
    })
    .optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.profileId) {
    return new NextResponse("Profile required", { status: 403 });
  }

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!audioMime.has(parsed.data.audio.contentType)) {
    return NextResponse.json({ error: "Unsupported audio type" }, { status: 415 });
  }

  if (parsed.data.cover && !imageMime.has(parsed.data.cover.contentType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }

  const audioKey = `profiles/${session.user.profileId}/tracks/${randomUUID()}-${parsed.data.audio.fileName}`;
  const audioUrl = await getPresignedUploadUrl({ key: audioKey, contentType: parsed.data.audio.contentType });

  const coverKey = parsed.data.cover
    ? `profiles/${session.user.profileId}/covers/${randomUUID()}-${parsed.data.cover.fileName}`
    : null;

  const coverUrl = coverKey
    ? await getPresignedUploadUrl({ key: coverKey, contentType: parsed.data.cover.contentType })
    : null;

  return NextResponse.json({
    audio: { uploadUrl: audioUrl, key: audioKey },
    cover: coverKey && coverUrl ? { uploadUrl: coverUrl, key: coverKey } : undefined,
  });
}
