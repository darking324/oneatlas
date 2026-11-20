"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { readCompareSlugs } from "./CompareToggle";

/** Floating bar that appears whenever models are selected for comparison. */
export default function CompareBar() {
  const searchParams = useSearchParams();
  const slugs = readCompareSlugs(new URLSearchParams(searchParams.toString()));

  if (slugs.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <Link
        href={`/compare?models=${slugs.join(",")}`}
        className="flex items-center gap-3 rounded-full border border-emerald-500/50 bg-zinc-900/95 px-5 py-2.5 text-sm font-medium text-zinc-100 shadow-2xl shadow-emerald-500/20 backdrop-blur transition hover:bg-zinc-800"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-zinc-950">
          {slugs.length}
        </span>
        {slugs.length === 1 ? "model selected" : "models selected"} — Compare now →
      </Link>
    </div>
  );
}
