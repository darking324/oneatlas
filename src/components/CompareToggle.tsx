"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PARAM = "compare";
const MAX_COMPARE = 4;

export function readCompareSlugs(searchParams: URLSearchParams): string[] {
  const raw = searchParams.get(PARAM);
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Adds/removes a model from the compare list, stored in the `?compare=` URL param. */
export default function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(readCompareSlugs(new URLSearchParams(searchParams.toString())).includes(slug));
  }, [searchParams, slug]);

  const toggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const current = readCompareSlugs(params);
    let next: string[];
    if (current.includes(slug)) {
      next = current.filter((s) => s !== slug);
    } else {
      if (current.length >= MAX_COMPARE) return;
      next = [...current, slug];
    }
    if (next.length === 0) params.delete(PARAM);
    else params.set(PARAM, next.join(","));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams, slug]);

  return (
    <button
      type="button"
      onClick={toggle}
      title={selected ? `Remove ${name} from comparison` : `Add ${name} to comparison`}
      className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
        selected
          ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
          : "border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
      }`}
    >
      {selected ? "✓ Comparing" : "+ Compare"}
    </button>
  );
}
