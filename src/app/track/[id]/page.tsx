import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LicenseBadge } from "@/components/LicenseBadge";
import { LikeButton } from "@/components/LikeButton";
import Link from "next/link";

export default async function TrackPage({ params }: { params: { id: string } }) {
  const track = await prisma.track.findUnique({
    where: { id: params.id },
    include: {
      profile: true,
      tagJoins: { include: { tag: true } },
      likedBy: true,
    },
  });

  if (!track) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const liked = session?.user?.profileId
    ? track.likedBy.some((like) => like.profileId === session.user?.profileId)
    : false;

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {track.coverUrl ? (
            <Image src={track.coverUrl} alt={track.title} width={600} height={600} className="w-full rounded-xl object-cover" />
          ) : (
            <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              No cover
            </div>
          )}
          <LicenseBadge license={track.license} />
          <LikeButton trackId={track.id} initialLiked={liked} initialCount={track.likes} />
          <p className="text-sm text-muted-foreground">{track.plays.toString()} plays</p>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{track.title}</h1>
            <p className="text-muted-foreground">{track.description}</p>
            <Link href={`/profile/${track.profile.handle}`} className="mt-2 inline-flex text-sm text-primary">
              @{track.profile.handle}
            </Link>
          </div>
          <AudioPlayer
            src={track.audioUrl}
            waveform={Array.isArray(track.waveform) ? (track.waveform as number[]) : undefined}
            trackId={track.id}
          />
          <div className="flex flex-wrap gap-2">
            {track.tagJoins.map((join) => (
              <span key={join.tagId} className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                #{join.tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
