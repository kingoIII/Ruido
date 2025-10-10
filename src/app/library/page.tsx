import Link from "next/link";
import LibraryFilters from "./search-filters";
import { LicenseBadge } from "@/components/LicenseBadge";
import { PAGE_SIZE_VALUE } from "@/lib/search";

interface LibraryPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const query = typeof searchParams.query === "string" ? searchParams.query : undefined;
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : undefined;
  const license = typeof searchParams.license === "string" ? searchParams.license : undefined;
  const sort = typeof searchParams.sort === "string" ? (searchParams.sort as "newest" | "plays" | "likes") : undefined;
  const pageParam = Number(searchParams.page ?? "1");
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const numberFormatter = new Intl.NumberFormat();

  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (tag) params.set("tag", tag);
  if (license) params.set("license", license);
  if (sort) params.set("sort", sort);
  params.set("page", String(currentPage));

  const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/tracks?${params.toString()}`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Unable to load tracks");
  }

  const payload: {
    data: any[];
    total: number;
    availableTags: string[];
  } = await response.json();

  return (
    <div className="container space-y-8 py-10">
      <LibraryFilters
        query={query ?? ""}
        license={license ?? ""}
        sort={sort ?? "newest"}
        tags={payload.availableTags ?? []}
        selectedTag={tag ?? ""}
        total={payload.total}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {payload.data.map((track) => (
          <div key={track.id} className="rounded-lg border bg-card p-6 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{track.title}</h3>
              <LicenseBadge license={track.license} />
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{track.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {track.tags.map((tagName: string) => (
                <span key={tagName}>#{tagName}</span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>@{track.profile.handle}</span>
              <div className="flex items-center gap-2">
                <span>{numberFormatter.format(track.plays)} plays</span>
                <span>•</span>
                <span>{numberFormatter.format(track.likes)} likes</span>
              </div>
            </div>
            <Link href={`/track/${track.id}`} className="mt-4 inline-flex text-sm text-primary">
              Listen →
            </Link>
          </div>
        ))}
      </div>
      {payload.total > PAGE_SIZE_VALUE ? (
        <div className="flex justify-center gap-4">
          {Array.from({ length: Math.ceil(payload.total / PAGE_SIZE_VALUE) }, (_, index) => index + 1).map((pageNumber) => {
            const pageParams = new URLSearchParams(params.toString());
            pageParams.set("page", String(pageNumber));
            const href = `/library?${pageParams.toString()}`;
            const isActive = pageNumber === currentPage;
            return (
              <Link key={pageNumber} href={href} className={`text-sm ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {pageNumber}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
