import { Prisma } from "@prisma/client";

export interface TrackSearchParams {
  query?: string;
  tag?: string;
  license?: string;
  sort?: "newest" | "plays" | "likes";
  page?: number;
}

const PAGE_SIZE = 24;

export function buildTrackWhere({ query, tag, license }: TrackSearchParams): Prisma.TrackWhereInput {
  const where: Prisma.TrackWhereInput = {};

  if (license) {
    where.license = license as Prisma.License;
  }

  if (tag) {
    where.tagJoins = { some: { tag: { name: tag } } };
  }

  if (query) {
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
  return {
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  };
}

export const PAGE_SIZE_VALUE = PAGE_SIZE;
