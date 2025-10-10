import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildTrackOrderBy, buildTrackWhere, getPagination, PAGE_SIZE_VALUE } from "@/lib/search";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;
  const license = url.searchParams.get("license") ?? undefined;
  const sort = (url.searchParams.get("sort") as "newest" | "plays" | "likes" | null) ?? undefined;
  const page = Number(url.searchParams.get("page") ?? "1");

  const where = buildTrackWhere({ query, tag, license });
  const orderBy = buildTrackOrderBy(sort);
  const { take, skip } = getPagination(Number.isFinite(page) && page > 0 ? page : 1);

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  type TrackList = Awaited<ReturnType<typeof prisma.track.findMany>>;
  let tracks: TrackList = [];
  let total = 0;

  if (query) {
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
    if (license) {
      conditions.push(Prisma.sql`t."license" = ${license}`);
    }
    if (tag) {
      conditions.push(Prisma.sql`tag."name" = ${tag}`);
    }

    const whereSql = Prisma.join(conditions, Prisma.sql` AND `);
    const searchSql = Prisma.sql`
      (
        to_tsvector('english', coalesce(t."title", '') || ' ' || coalesce(t."description", '')) @@ plainto_tsquery('english', ${query})
        OR t."tags" @@ plainto_tsquery('simple', ${query})
        OR similarity(t."title", ${query}) > 0.2
        OR similarity(t."description", ${query}) > 0.2
      )
    `;

    const orderSql =
      sort === "plays"
        ? Prisma.sql`t."plays" DESC`
        : sort === "likes"
          ? Prisma.sql`t."likes" DESC`
          : Prisma.sql`rank DESC, sim DESC, t."createdAt" DESC`;

    const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT DISTINCT t."id",
        ts_rank_cd(to_tsvector('english', coalesce(t."title", '') || ' ' || coalesce(t."description", '')), plainto_tsquery('english', ${query})) AS rank,
        GREATEST(similarity(t."title", ${query}), similarity(t."description", ${query})) AS sim
      FROM "Track" t
      LEFT JOIN "TrackTag" tt ON tt."trackId" = t."id"
      LEFT JOIN "Tag" tag ON tag."id" = tt."tagId"
      WHERE ${whereSql} AND ${searchSql}
      ORDER BY ${orderSql}
      LIMIT ${take} OFFSET ${skip}
    `);

    const idOrder = rows.map((row) => row.id);
    const list = await prisma.track.findMany({
      where: { id: { in: idOrder }, ...where },
      include: {
        profile: true,
        tagJoins: { include: { tag: true } },
        likedBy: true,
      },
    });
    const lookup = new Map(list.map((item) => [item.id, item]));
    tracks = idOrder.map((id) => lookup.get(id)).filter((value): value is NonNullable<typeof value> => Boolean(value));

    const totalRows = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(DISTINCT t."id") AS count
      FROM "Track" t
      LEFT JOIN "TrackTag" tt ON tt."trackId" = t."id"
      LEFT JOIN "Tag" tag ON tag."id" = tt."tagId"
      WHERE ${whereSql} AND ${searchSql}
    `);
    total = Number(totalRows[0]?.count ?? 0);
  } else {
    const [list, count] = await Promise.all([
      prisma.track.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          profile: true,
          tagJoins: { include: { tag: true } },
          likedBy: true,
        },
      }),
      prisma.track.count({ where }),
    ]);
    tracks = list;
    total = count;
  }

  return NextResponse.json({
    data: tracks.map((track) => ({
      id: track.id,
      title: track.title,
      description: track.description,
      durationSec: track.durationSec,
      bpm: track.bpm,
      key: track.key,
      license: track.license,
      audioUrl: track.audioUrl,
      coverUrl: track.coverUrl,
      createdAt: track.createdAt,
      plays: Number(track.plays),
      likes: track.likedBy.length,
      profile: {
        id: track.profile.id,
        handle: track.profile.handle,
        displayName: track.profile.displayName,
      },
      tags: track.tagJoins.map((join) => join.tag.name),
    })),
    page,
    pageSize: PAGE_SIZE_VALUE,
    total,
    availableTags: tags.map((tagRecord) => tagRecord.name),
  });
}
