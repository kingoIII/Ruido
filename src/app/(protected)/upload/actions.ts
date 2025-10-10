"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";

const schema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-z0-9-_]+$/i),
  displayName: z.string().min(3),
  bio: z.string().max(280).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function createProfile(_: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const parsed = schema.safeParse({
    handle: formData.get("handle"),
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: "Invalid data", success: false };
  }

  try {
    await prisma.profile.create({
      data: {
        userId: session.user.id,
        handle: parsed.data.handle.toLowerCase(),
        displayName: parsed.data.displayName,
        bio: parsed.data.bio,
        links: parsed.data.website ? { website: parsed.data.website } : undefined,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Handle already in use", success: false };
  }

  revalidatePath("/upload");
  return { success: true, error: undefined };
}
