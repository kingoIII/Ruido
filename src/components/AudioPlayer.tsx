"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause } from "lucide-react";
import { Waveform } from "@/components/Waveform";

interface AudioPlayerProps {
  src: string;
  waveform?: number[];
  trackId?: string;
  durationSec?: number;
}

export function AudioPlayer({ src, waveform, trackId, durationSec }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(durationSec ?? 0);

  useEffect(() => {
    if (typeof durationSec === "number") {
      setDuration(durationSec);
    }
  }, [durationSec]);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    setProgress(0);
    setIsPlaying(false);
    const onLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onTime = () => setProgress(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
      if (trackId) {
        fetch(`/api/tracks/${trackId}/play`, { method: "POST" }).catch(() => {});
      }
    }
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = value[0];
    audio.currentTime = target;
    setProgress(target);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="icon" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Slider
          min={0}
          max={duration || 1}
          step={0.1}
          value={[progress]}
          onValueChange={seek}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground">
          {Math.floor(progress)}/{Math.max(Math.floor(duration), 1)}s
        </span>
      </div>
      {waveform ? <Waveform waveform={waveform} progress={progress} duration={duration} /> : null}
    </div>
  );
}
