import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { normalizeTags } from "@/lib/tags";
import ffmpeg from "fluent-ffmpeg";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  license: z.enum(["cc_by", "cc_by_sa", "cc0", "custom"]),
  tags: z.array(z.string().min(1)).max(12),
  audioKey: z.string().min(1),
  coverKey: z.string().optional(),
  bpm: z.number().int().positive().max(300).optional(),
  key: z.string().max(5).optional(),
});

function buildPublicUrl(key: string) {
  const endpoint = env.STORAGE_ENDPOINT.replace(/\/$/, "");
  return `${endpoint}/${env.STORAGE_BUCKET}/${key}`;
}

async function probeDuration(url: string): Promise<number | null> {
  const ffprobe = promisify(ffmpeg.ffprobe);
  try {
    const data = await ffprobe(url);
    const duration = data.format?.duration;
    if (duration && Number.isFinite(duration)) {
      return Math.round(duration);
    }
    return null;
  } catch {
    return null;
  }
}

function generateWaveform(samples = 200): number[] {
  return Array.from({ length: samples }, (_, i) => Number(Math.abs(Math.sin((i / samples) * Math.PI)).toFixed(3)));
}

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

  const profileId = session.user.profileId;
  const audioUrl = buildPublicUrl(parsed.data.audioKey);
  const coverUrl = parsed.data.coverKey ? buildPublicUrl(parsed.data.coverKey) : null;

  const duration = (await probeDuration(audioUrl)) ?? 1;

  const normalizedTags = normalizeTags(parsed.data.tags);

  const tagRecords = await Promise.all(
    normalizedTags.map((tag) =>
      prisma.tag.upsert({
        where: { name: tag },
        update: {},
        create: { id: randomUUID(), name: tag },
      })
    )
  );

  const track = await prisma.track.create({
    data: {
      id: randomUUID(),
      profileId,
      title: parsed.data.title,
      description: parsed.data.description,
      license: parsed.data.license,
      durationSec: duration,
      bpm: parsed.data.bpm,
      key: parsed.data.key,
      audioUrl,
      coverUrl,
      waveform: generateWaveform(),
      tagJoins: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: {
      profile: true,
      tagJoins: { include: { tag: true } },
    },
  });

  await prisma.$executeRaw`UPDATE "Track" SET "tags" = to_tsvector('simple', ${normalizedTags.join(' ')}) WHERE "id" = ${track.id}`;

  return NextResponse.json({ track });
}
