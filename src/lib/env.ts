import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().optional(),
  STORAGE_ENDPOINT: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_REGION: z.string().min(1),
  STORAGE_ACCESS_KEY: z.string().min(1),
  STORAGE_SECRET_KEY: z.string().min(1),
  EMAIL_SERVER: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  STORAGE_REGION: process.env.STORAGE_REGION,
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
  EMAIL_SERVER: process.env.EMAIL_SERVER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
});
