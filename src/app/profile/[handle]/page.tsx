import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LicenseBadge } from "@/components/LicenseBadge";

export default async function ProfilePage({ params }: { params: { handle: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { handle: params.handle },
    include: {
      user: true,
      tracks: { include: { tagJoins: { include: { tag: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="container space-y-8 py-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border">
            {profile.user.image ? (
              <Image src={profile.user.image} alt={profile.displayName} width={96} height={96} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold uppercase">
                {profile.displayName[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.displayName}</h1>
            <p className="text-muted-foreground">@{profile.handle}</p>
            {profile.bio ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{profile.bio}</p> : null}
            {profile.links && "website" in profile.links ? (
              <Link href={String(profile.links.website)} className="text-sm text-primary" target="_blank" rel="noreferrer">
                {profile.links.website as string}
              </Link>
            ) : null}
          </div>
        </div>
        <Button variant="outline">Create collection</Button>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Tracks</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {profile.tracks.map((track) => (
            <Card key={track.id} className="flex h-full flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{track.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{track.description}</p>
                <LicenseBadge license={track.license} />
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {track.tagJoins.map((join) => (
                    <span key={join.tagId}>#{join.tag.name}</span>
                  ))}
                </div>
                <Link href={`/track/${track.id}`} className="text-sm text-primary">
                  Open track →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
