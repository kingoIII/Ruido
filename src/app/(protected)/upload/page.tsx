import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import UploadForm from "./upload-form";
import CreateProfileForm from "./profile-form";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  if (!profile) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Create your profile</CardTitle>
            <CardDescription>You need a profile before uploading tracks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <CreateProfileForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload a new track</CardTitle>
          <CardDescription>Share your latest sound with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
