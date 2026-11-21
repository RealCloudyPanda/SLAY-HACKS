"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTRPC } from "@/trpc/client";


export function useInvalidateAll() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: trpc.dashboard.pathKey() }),
        qc.invalidateQueries({ queryKey: trpc.cluster.pathKey() }),
        qc.invalidateQueries({ queryKey: trpc.review.pathKey() }),
        qc.invalidateQueries({ queryKey: trpc.compare.pathKey() }),
      ]),
    [qc, trpc],
  );
}
