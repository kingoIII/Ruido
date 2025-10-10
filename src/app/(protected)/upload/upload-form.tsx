"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/TagInput";
import { toast } from "sonner";
import { normalizeTags } from "@/lib/tags";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  license: z.enum(["cc_by", "cc_by_sa", "cc0", "custom"]),
});

type FormValues = z.infer<typeof schema>;

export default function UploadForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", license: "cc_by" },
  });
  const [tags, setTags] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = form.handleSubmit(async (values) => {
    if (!audioFile) {
      toast.error("Audio file is required");
      return;
    }

    try {
      const normalized = normalizeTags(tags);
      if (normalized.length > 12) {
        toast.error("Maximum 12 tags");
        return;
      }
      const response = await fetch("/api/upload/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: { fileName: audioFile.name, contentType: audioFile.type, size: audioFile.size },
          cover: coverFile ? { fileName: coverFile.name, contentType: coverFile.type, size: coverFile.size } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to create upload");
      }

      const presign = await response.json();
      await Promise.all([
        fetch(presign.audio.uploadUrl, { method: "PUT", headers: { "Content-Type": audioFile.type }, body: audioFile }),
        coverFile
          ? fetch(presign.cover.uploadUrl, { method: "PUT", headers: { "Content-Type": coverFile.type }, body: coverFile })
          : Promise.resolve(),
      ]);

      const finalizeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          license: values.license,
          tags: normalized,
          audioKey: presign.audio.key,
          coverKey: presign.cover?.key,
        }),
      });

      if (!finalizeResponse.ok) {
        const error = await finalizeResponse.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to complete upload");
      }

      const payload = await finalizeResponse.json();
      toast.success("Track uploaded");
      startTransition(() => {
        router.push(`/track/${payload.track.id}`);
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Track title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Describe your track" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc_by">Creative Commons BY</SelectItem>
                    <SelectItem value="cc_by_sa">Creative Commons BY-SA</SelectItem>
                    <SelectItem value="cc0">CC0</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <TagInput value={tags} onChange={setTags} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormItem>
            <FormLabel>Audio file</FormLabel>
            <FormControl>
              <Input type="file" accept="audio/*" onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)} required />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Cover image</FormLabel>
            <FormControl>
              <Input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </Form>
  );
}
