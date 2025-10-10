"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  waveform: number[];
  progress: number;
  duration: number;
}

export function Waveform({ waveform, progress, duration }: WaveformProps) {
  const activeIndex = useMemo(() => {
    if (!duration) return 0;
    const ratio = progress / duration;
    return Math.floor(ratio * waveform.length);
  }, [progress, duration, waveform.length]);

  return (
    <div className="flex h-24 items-end gap-0.5 overflow-hidden rounded-md border border-border bg-muted/30 p-2">
      {waveform.map((value, index) => (
        <div
          key={index}
          className={cn("w-0.5 rounded-full bg-muted-foreground/40", index <= activeIndex && "bg-primary")}
          style={{ height: `${Math.max(4, value * 100)}%` }}
        />
      ))}
    </div>
  );
}
