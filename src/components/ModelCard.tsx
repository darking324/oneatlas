import Link from "next/link";
import type { ModelRow } from "@/lib/models";
import { formatContext, formatPrice, TYPE_LABELS } from "@/lib/format";
import { intelligenceIndex } from "@/lib/models";
import CompareToggle from "./CompareToggle";

export default function ModelCard({ model }: { model: ModelRow }) {
  const ii = intelligenceIndex(model);
  return (
    <article className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-emerald-500/50 hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/models/${model.slug}`}
            className="block truncate text-base font-semibold text-zinc-50 hover:text-emerald-400"
          >
            {model.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {model.lab?.name ?? "Unknown lab"} · {model.provider?.name ?? "OpenRouter"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
          {TYPE_LABELS[model.type] ?? model.type}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">
        {model.description ?? "No description available."}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-4 text-center">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Input</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-emerald-400">
            {formatPrice(model.inputPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Output</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-emerald-400">
            {formatPrice(model.outputPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Context</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-100">
            {formatContext(model.contextLength)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2">
        {ii !== null ? (
          <span className="rounded-md bg-zinc-800 px-2 py-1 font-mono text-xs text-amber-300">
            Intelligence {ii.toFixed(1)}
          </span>
        ) : (
          <span className="text-xs text-zinc-600">No benchmark yet</span>
        )}
        <div className="flex items-center gap-2">
          <CompareToggle slug={model.slug} name={model.name} />
          <Link
            href={`/models/${model.slug}`}
            className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-emerald-500 hover:text-zinc-950"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
