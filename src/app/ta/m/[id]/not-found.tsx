import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState title="That misconception doesn't exist">
      It may have been a mistyped link. Go back to the <Link href="/ta">teach-first list</Link>.
    </EmptyState>
  );
}
