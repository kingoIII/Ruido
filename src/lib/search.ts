import { Prisma } from "@prisma/client";

export interface TrackSearchParams {
  query?: string;
  tag?: string;
  license?: string;
  sort?: "newest" | "plays" | "likes";
  page?: number;
}

const PAGE_SIZE = 24;

export function buildTrackWhere(
  { query, tag, license }: TrackSearchParams,
  options: { includeTextSearch?: boolean } = { includeTextSearch: true }
): Prisma.TrackWhereInput {
  const where: Prisma.TrackWhereInput = {};

  if (license) {
    where.license = license as Prisma.License;
  }

  if (tag) {
    where.tagJoins = { some: { tag: { name: tag } } };
  }

  if (options.includeTextSearch !== false && query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}

export function buildTrackOrderBy(sort?: TrackSearchParams["sort"]): Prisma.TrackOrderByWithRelationInput {
  switch (sort) {
    case "plays":
      return { plays: "desc" };
    case "likes":
      return { likes: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export function getPagination(page = 1) {
  const current = Number.isFinite(page) && page > 0 ? page : 1;
  return {
    take: PAGE_SIZE,
    skip: (current - 1) * PAGE_SIZE,
  };
}

export function buildSearchSql(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  return Prisma.sql`
    (
      to_tsvector('english', coalesce(t."title", '') || ' ' || coalesce(t."description", '')) @@ plainto_tsquery('english', ${trimmed})
      OR t."tags" @@ plainto_tsquery('simple', ${trimmed})
      OR similarity(t."title", ${trimmed}) > 0.2
      OR similarity(t."description", ${trimmed}) > 0.2
    )
  `;
}

export const PAGE_SIZE_VALUE = PAGE_SIZE;
