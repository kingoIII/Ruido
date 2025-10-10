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
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

const ffprobe = promisify(ffmpeg.ffprobe);

interface AudioMetadata {
  duration: number | null;
  bpm: number | null;
  key: string | null;
}

function normalizeKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 8).toUpperCase();
}

function parseBpm(value: unknown): number | null {
  const number = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(number)) return null;
  if (number <= 0 || number > 400) return null;
  return number;
}

async function probeAudioMetadata(url: string): Promise<AudioMetadata> {
  try {
    const data = await ffprobe(url);
    const duration = data.format?.duration;

    const tagCandidates: Array<unknown> = [];
    const keyCandidates: Array<unknown> = [];

    if (data.format?.tags) {
      tagCandidates.push(data.format.tags.BPM, data.format.tags.bpm, data.format.tags.TBPM);
      keyCandidates.push(
        data.format.tags.initial_key,
        data.format.tags.initialkey,
        data.format.tags.KEY,
        data.format.tags.key,
      );
    }

    for (const stream of data.streams ?? []) {
      if (stream.tags) {
        tagCandidates.push(stream.tags.BPM, stream.tags.bpm, stream.tags.TBPM);
        keyCandidates.push(stream.tags.initial_key, stream.tags.KEY, stream.tags.key);
      }
    }

    const bpmCandidate = tagCandidates.map(parseBpm).find((value) => value !== null) ?? null;
    const keyCandidate = keyCandidates.map(normalizeKey).find((value) => value !== null) ?? null;

    const numericDuration = typeof duration === "number" && Number.isFinite(duration) ? duration : null;

    return {
      duration: numericDuration,
    }

    for (const stream of data.streams ?? []) {
      if (stream.tags) {
        tagCandidates.push(stream.tags.BPM, stream.tags.bpm, stream.tags.TBPM);
        keyCandidates.push(stream.tags.initial_key, stream.tags.KEY, stream.tags.key);
      }
    }

    const bpmCandidate = tagCandidates.map(parseBpm).find((value) => value !== null) ?? null;
    const keyCandidate = keyCandidates.map(normalizeKey).find((value) => value !== null) ?? null;

    return {
      duration: duration && Number.isFinite(duration) ? Math.round(duration) : null,
      bpm: bpmCandidate,
      key: keyCandidate,
    };
  } catch {
    return { duration: null, bpm: null, key: null };
  }
}

const WAVEFORM_SAMPLES = 200;
const WAVEFORM_SAMPLE_RATE = 8_000;

function generateFallbackWaveform(samples = WAVEFORM_SAMPLES): number[] {
  return Array.from({ length: samples }, (_, index) => {
    const sine = Math.abs(Math.sin((index / samples) * Math.PI));
    return Number(sine.toFixed(3));
  });
}

async function generateWaveformFromAudio(url: string, duration: number | null, samples = WAVEFORM_SAMPLES) {
  if (!duration || !Number.isFinite(duration) || duration <= 0) {
    return generateFallbackWaveform(samples);
  }

  return new Promise<number[]>((resolve) => {
    let settled = false;
    const settle = (value: number[]) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    try {
      const totalSamples = Math.max(samples, Math.ceil(duration * WAVEFORM_SAMPLE_RATE));
      const bucketSize = Math.max(1, Math.ceil(totalSamples / samples));
      const maxima = new Array<number>(samples).fill(0);
      let sampleIndex = 0;

      const command = ffmpeg(url)
        .audioChannels(1)
        .audioFrequency(WAVEFORM_SAMPLE_RATE)
        .format("f32le")
        .on("error", () => settle(generateFallbackWaveform(samples)));

      const stream = command.pipe();
      if (!stream) {
        settle(generateFallbackWaveform(samples));
        return;
      }

      stream.on("data", (chunk: Buffer) => {
        for (let offset = 0; offset + 4 <= chunk.length; offset += 4) {
          const value = Math.abs(chunk.readFloatLE(offset));
          const bucket = Math.min(samples - 1, Math.floor(sampleIndex / bucketSize));
          if (value > maxima[bucket]) {
            maxima[bucket] = value;
          }
          sampleIndex += 1;
        }
      });

      stream.on("end", () => {
        if (sampleIndex === 0) {
          settle(generateFallbackWaveform(samples));
          return;
        }

        const normalized = maxima.map((value) => Number(Math.min(1, value).toFixed(3)));
        if (normalized.every((value) => value === 0)) {
          settle(generateFallbackWaveform(samples));
          return;
        }
        settle(normalized);
      });

      stream.on("error", () => {
        settle(generateFallbackWaveform(samples));
      });
    } catch {
      settle(generateFallbackWaveform(samples));
    }
  });
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

  try {
    const metadata = await probeAudioMetadata(audioUrl);
    const durationSec = Math.max(1, Math.round(metadata.duration ?? 0) || 1);
    const waveform = await generateWaveformFromAudio(audioUrl, metadata.duration);

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
    const tagJoinData = tagRecords.map((tag) => ({ tagId: tag.id }));

    const track = await prisma.track.create({
      data: {
        id: randomUUID(),
        profileId,
        title: parsed.data.title,
        description: parsed.data.description,
        license: parsed.data.license,
        durationSec,
        bpm: parsed.data.bpm ?? metadata.bpm ?? undefined,
        key: parsed.data.key ?? metadata.key ?? undefined,
        audioUrl,
        coverUrl,
        waveform,
        tagJoins: tagJoinData.length ? { create: tagJoinData } : undefined,
  const metadata = await probeAudioMetadata(audioUrl);
  const duration = metadata.duration ?? 1;

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
      bpm: parsed.data.bpm ?? metadata.bpm ?? undefined,
      key: parsed.data.key ?? metadata.key ?? undefined,
      audioUrl,
      coverUrl,
      waveform: generateWaveform(),
      tagJoins: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
      include: {
        profile: true,
        tagJoins: { include: { tag: true } },
      },
    });

    const tagVectorSource = [parsed.data.title, parsed.data.description, normalizedTags.join(" ")]
      .filter(Boolean)
      .join(" ");
    await prisma.$executeRaw(
      Prisma.sql`UPDATE "Track" SET "tags" = to_tsvector('simple', ${tagVectorSource}) WHERE "id" = ${track.id}`
    );

    revalidatePath("/library");
    revalidatePath(`/profile/${track.profile.handle}`);

    return NextResponse.json({ track });
  } catch (error) {
    console.error("Failed to finalize upload", error);
    return NextResponse.json({ error: "Failed to finalize upload" }, { status: 500 });
  }
}
