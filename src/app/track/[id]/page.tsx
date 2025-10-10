import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LicenseBadge } from "@/components/LicenseBadge";
import { LikeButton } from "@/components/LikeButton";
import Link from "next/link";

function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = totalSeconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

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

  const formatter = new Intl.NumberFormat();

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
          <LikeButton trackId={track.id} initialLiked={liked} initialCount={Number(track.likes)} />
          <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <dt className="font-medium text-foreground">Plays</dt>
              <dd>{formatter.format(Number(track.plays))}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Duration</dt>
              <dd>{formatDuration(track.durationSec)}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">BPM</dt>
              <dd>{track.bpm ? formatter.format(track.bpm) : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Key</dt>
              <dd>{track.key ?? "—"}</dd>
            </div>
          </dl>
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
            durationSec={track.durationSec}
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
