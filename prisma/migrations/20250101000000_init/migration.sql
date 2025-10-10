-- Enable extensions for search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Users and auth tables
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Profile" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "handle" TEXT NOT NULL UNIQUE,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "links" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE "License" AS ENUM ('cc_by','cc_by_sa','cc0','custom');

CREATE TABLE "Track" (
    "id" TEXT PRIMARY KEY,
    "profileId" TEXT NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "bpm" INTEGER,
    "key" TEXT,
    "tags" TSVECTOR,
    "license" "License" NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "coverUrl" TEXT,
    "waveform" JSONB,
    "plays" BIGINT NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Track_profileId_title_key" ON "Track" ("profileId", "title");

CREATE TABLE "Tag" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "TrackTag" (
    "trackId" TEXT NOT NULL REFERENCES "Track"("id") ON DELETE CASCADE,
    "tagId" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("trackId", "tagId")
);

CREATE TABLE "Collection" (
    "id" TEXT PRIMARY KEY,
    "profileId" TEXT NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CollectionItem" (
    "collectionId" TEXT NOT NULL REFERENCES "Collection"("id") ON DELETE CASCADE,
    "trackId" TEXT NOT NULL REFERENCES "Track"("id") ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY ("collectionId", "trackId")
);

CREATE TABLE "Like" (
    "profileId" TEXT NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
    "trackId" TEXT NOT NULL REFERENCES "Track"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("profileId", "trackId")
);

CREATE TABLE "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT account_provider UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expires" TIMESTAMP NOT NULL
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP NOT NULL,
    PRIMARY KEY ("identifier", "token")
);

-- Search indexes
CREATE INDEX "Track_tags_tsvector_idx" ON "Track" USING GIN (("tags"));
CREATE INDEX "Track_title_trgm_idx" ON "Track" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Track_description_trgm_idx" ON "Track" USING GIN ("description" gin_trgm_ops);
