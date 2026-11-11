"use client";

import { PlayCircleIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { activityApi } from "../api/activity-api";

export function YoutubeForm({ activityId }: { activityId: string }) {
  const { run, pending } = useMutation((url: string) => activityApi.addYoutube(activityId, url), {
    success: "Video de YouTube agregado.",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await run(String(new FormData(form).get("url")));
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input name="url" type="url" required placeholder="Pega un enlace de YouTube" aria-label="Enlace de YouTube" />
      <Button type="submit" variant="outline" disabled={pending}>
        <PlayCircleIcon />
        {pending ? "Agregando…" : "Agregar video"}
      </Button>
    </form>
  );
}
