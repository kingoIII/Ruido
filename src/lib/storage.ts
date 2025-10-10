import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

export const s3 = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET_KEY,
  },
});

export interface PresignOptions {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export async function getPresignedUploadUrl({ key, contentType, expiresIn = 300 }: PresignOptions) {
  const command = new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}
