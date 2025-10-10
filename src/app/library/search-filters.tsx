"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LibraryFiltersProps {
  query: string;
  license: string;
  sort: "newest" | "plays" | "likes";
  tags: string[];
  selectedTag: string;
  total: number;
}

export default function LibraryFilters({ query, license, sort, tags, selectedTag, total }: LibraryFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    startTransition(() => {
      router.replace(`/library?${next.toString()}`);
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateParam("query", (formData.get("query") as string) ?? "");
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow">
      <div className="flex flex-wrap items-end gap-4">
        <form onSubmit={onSubmit} className="flex-1 space-y-2 min-w-[200px]">
          <label className="text-sm font-medium" htmlFor="query">
            Search ({total} results)
          </label>
          <div className="flex gap-2">
            <Input id="query" name="query" defaultValue={query} placeholder="Search tracks" />
            <Button type="submit" disabled={isPending}>
              Search
            </Button>
          </div>
        </form>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tag</label>
          <Select value={selectedTag} onValueChange={(value) => updateParam("tag", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">License</label>
          <Select value={license} onValueChange={(value) => updateParam("license", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All licenses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All licenses</SelectItem>
              <SelectItem value="cc_by">CC-BY</SelectItem>
              <SelectItem value="cc_by_sa">CC-BY-SA</SelectItem>
              <SelectItem value="cc0">CC0</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort</label>
          <Select value={sort} onValueChange={(value) => updateParam("sort", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="plays">Most plays</SelectItem>
              <SelectItem value="likes">Most likes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
