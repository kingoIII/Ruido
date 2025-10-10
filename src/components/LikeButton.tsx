"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  trackId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ trackId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const toggleLike = () => {
    startTransition(async () => {
      const previousLiked = liked;
      const previousCount = count;
      const nextLiked = !previousLiked;
      setLiked(nextLiked);
      setCount(previousCount + (nextLiked ? 1 : -1));
      const res = await fetch(`/api/tracks/${trackId}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(previousLiked);
        setCount(previousCount);
        toast.error("Unable to update like");
      }
    });
  };

  return (
    <Button type="button" variant={liked ? "default" : "outline"} onClick={toggleLike} disabled={isPending} className="gap-2">
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {count}
    </Button>
  );
}
