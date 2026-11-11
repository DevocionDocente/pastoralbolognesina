"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { friendlyError } from "@/shared/lib/error-messages";

interface MutationOptions {
  success: string;
  onSuccess?: () => void;
}

export function useMutation<Args extends unknown[]>(
  action: (...args: Args) => Promise<unknown>,
  { success, onSuccess }: MutationOptions,
) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run(...args: Args) {
    setPending(true);
    try {
      await action(...args);
      toast.success(success);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setPending(false);
    }
  }

  return { run, pending };
}
