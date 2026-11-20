"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export default function Home() {
  const trpc = useTRPC();
  const health = useQuery(trpc.health.queryOptions());
  return (
    <main>
      <h1>Office Hours Heatmap</h1>
      <p>API: {health.data ? health.data.service : "…"}</p>
    </main>
  );
}
