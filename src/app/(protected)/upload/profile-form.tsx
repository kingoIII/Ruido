"use client";

import { useFormState } from "react-dom";
import { createProfile } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialState = { error: undefined as string | undefined, success: false };

export default function CreateProfileForm() {
  const [state, action] = useFormState(createProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="handle">Handle</Label>
        <Input id="handle" name="handle" placeholder="your-handle" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" name="displayName" placeholder="Your Name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" placeholder="Tell the world who you are" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" placeholder="https://" />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">Profile created. Reloading…</p> : null}
      <Button type="submit">Create profile</Button>
    </form>
  );
}
