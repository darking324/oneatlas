import Link from "next/link";
import { Suspense } from "react";
import { getFilterOptions, getStats, listModels } from "@/lib/models";
import { SORT_OPTIONS, TYPE_LABELS } from "@/lib/format";
import ModelCard from "@/components/ModelCard";
import SearchInput from "@/components/SearchInput";

const selectCls =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500";

function buildHref(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const lab = typeof sp.lab === "string" ? sp.lab : undefined;
  const provider = typeof sp.provider === "string" ? sp.provider : undefined;
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const capability = typeof sp.capability === "string" ? sp.capability : undefined;
  const modality = typeof sp.modality === "string" ? sp.modality : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "popular";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const [result, options, stats] = await Promise.all([
    listModels({ q, labSlug: lab, providerSlug: provider, type, capability, modality, sort, page }),
    getFilterOptions(),
    getStats(),
  ]);

  const base = { q: q || undefined, lab, provider, type, capability, modality, sort };
  const hasFilters = Boolean(q || lab || provider || type || capability || modality);

  return (
    <div>
      {/* Hero */}
      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 p-6 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Discover every AI model.{" "}
          <span className="text-emerald-400">Compare them honestly.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Browse {stats.models} models from {stats.labs} AI labs and{" "}
          {stats.providers} providers — with real pricing, context windows,
          capabilities and benchmark scores, all served live from the database.
        </p>
        <div className="mt-6 max-w-xl">
          <Suspense>
            <SearchInput defaultValue={q} />
          </Suspense>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !type
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            All types
          </Link>
          {options.types.map((t) => (
            <Link
              key={t}
              href={buildHref(base, { type: t, page: undefined })}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                type === t
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {TYPE_LABELS[t] ?? t}
            </Link>
          ))}
        </div>
      </section>

      {/* Filters */}
      <form
        method="get"
        action="/"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
      >
        {q && <input type="hidden" name="q" value={q} />}
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Lab
          <select name="lab" defaultValue={lab ?? ""} className={selectCls}>
            <option value="">All labs</option>
            {options.labs.map((l) => (
              <option key={l.id} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Provider
          <select name="provider" defaultValue={provider ?? ""} className={selectCls}>
            <option value="">All providers</option>
            {options.providers.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Capability
          <select name="capability" defaultValue={capability ?? ""} className={selectCls}>
            <option value="">Any capability</option>
            {options.capabilities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Input modality
          <select name="modality" defaultValue={modality ?? ""} className={selectCls}>
            <option value="">Any modality</option>
            {options.modalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Sort by
          <select name="sort" defaultValue={sort} className={selectCls}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
        >
          Apply filters
        </button>
        {hasFilters && (
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Clear all
          </Link>
        )}
      </form>

      {/* Results */}
      <p className="mt-6 text-sm text-zinc-400">
        <span className="font-semibold text-zinc-100">{result.total}</span>{" "}
        {result.total === 1 ? "model" : "models"} found
        {result.totalPages > 1 && (
          <span className="text-zinc-500">
            {" "}
            · page {result.page} of {result.totalPages}
          </span>
        )}
      </p>

      {result.models.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <p className="text-lg font-semibold text-zinc-200">No models match those filters</p>
          <p className="mt-2 text-sm text-zinc-400">
            Try a different search term or clear some filters.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {result.page > 1 ? (
            <Link
              href={buildHref(base, { page: String(result.page - 1) })}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-600">
              ← Previous
            </span>
          )}
          <span className="text-sm text-zinc-400">
            Page {result.page} of {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Link
              href={buildHref(base, { page: String(result.page + 1) })}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-600">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
