import { PrismaClient, License, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const demoTracks = [
  {
    title: "Neon Skyline Kick",
    description: "Punchy kick sample forged in a neon-soaked skyline.",
    durationSec: 12,
    bpm: 120,
    key: "C",
    license: License.cc0,
    tags: ["kick", "drums", "analog"],
  },
  {
    title: "Gravity Well Bass",
    description: "Low-end growl captured from a gravity well experiment.",
    durationSec: 18,
    bpm: 90,
    key: "F#",
    license: License.cc_by,
    tags: ["bass", "sci-fi"],
  },
  {
    title: "Solar Winds Pad",
    description: "Ethereal pad sampled from solar wind resonance.",
    durationSec: 26,
    bpm: 70,
    key: "D",
    license: License.cc_by_sa,
    tags: ["pad", "ambient"],
  },
  {
    title: "Quantum Perc Loop",
    description: "Percussive loop generated from quantum lattice vibrations.",
    durationSec: 32,
    bpm: 110,
    key: "A",
    license: License.cc_by,
    tags: ["percussion", "loop"],
  },
  {
    title: "Aurora Vox Texture",
    description: "Choral texture recorded beneath an aurora storm.",
    durationSec: 22,
    bpm: null,
    key: null,
    license: License.custom,
    tags: ["vocal", "texture"],
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@ruido.dev" },
    update: {},
    create: {
      id: randomUUID(),
      email: "demo@ruido.dev",
      name: "Demo Creator",
    },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      id: randomUUID(),
      userId: user.id,
      handle: "ruido-demo",
      displayName: "ruido demo",
      bio: "Synthesizing tomorrow's frequencies today.",
      links: { website: "https://ruido.dev" },
    },
  });

  for (const track of demoTracks) {
    const tagRecords = await Promise.all(
      track.tags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { id: randomUUID(), name },
        })
      )
    );

    const created = await prisma.track.upsert({
      where: { title: track.title },
      update: {},
      create: {
        id: randomUUID(),
        profileId: profile.id,
        title: track.title,
        description: track.description,
        durationSec: track.durationSec,
        bpm: track.bpm ?? undefined,
        key: track.key ?? undefined,
        license: track.license,
        audioUrl: `https://cdn.ruido.dev/demo/${track.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp3`,
        coverUrl: `https://images.ruido.dev/demo/${track.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
        waveform: Array.from({ length: 200 }, (_, i) => Number(Math.abs(Math.sin((i / 200) * Math.PI)).toFixed(3))),
        tagJoins: {
          createMany: {
            data: tagRecords.map((tag) => ({ tagId: tag.id })),
            skipDuplicates: true,
          },
        },
      },
    });

    const tagVectorSource = track.tags.join(" ");
    await prisma.$executeRaw(Prisma.sql`UPDATE "Track" SET "tags" = to_tsvector('simple', ${tagVectorSource}) WHERE "id" = ${created.id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
