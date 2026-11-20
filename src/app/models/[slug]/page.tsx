import Link from "next/link";
import { notFound } from "next/navigation";
import { getModelBySlug, listModels } from "@/lib/models";
import {
  formatContext,
  formatDate,
  formatPricePerMillion,
  TYPE_LABELS,
} from "@/lib/format";
import ModelCard from "@/components/ModelCard";
import CompareToggle from "@/components/CompareToggle";

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const related = model.lab
    ? (await listModels({ labSlug: model.lab.slug, limit: 4 })).models.filter(
        (m) => m.slug !== model.slug,
      ).slice(0, 3)
    : [];

  const benchmarks = [...(model.benchmarks ?? [])].sort((a, b) => b.score - a.score);

  return (
    <div>
      <Link href="/" className="text-sm text-zinc-400 hover:text-emerald-400">
        ← Back to Discover
      </Link>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                {TYPE_LABELS[model.type] ?? model.type}
              </span>
              {model.lab && (
                <Link
                  href={`/labs?lab=${model.lab.slug}`}
                  className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-300 hover:border-zinc-500"
                >
                  {model.lab.name}
                </Link>
              )}
              {model.provider && (
                <Link
                  href={`/providers?provider=${model.provider.slug}`}
                  className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-300 hover:border-zinc-500"
                >
                  via {model.provider.name}
                </Link>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50">
              {model.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">{model.openRouterId}</p>
          </div>
          <CompareToggle slug={model.slug} name={model.name} />
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
          {model.description ?? "No description available for this model."}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Input price</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-emerald-400">
              {formatPricePerMillion(model.inputPrice)}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Output price</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-emerald-400">
              {formatPricePerMillion(model.outputPrice)}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Context window</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-zinc-100">
              {formatContext(model.contextLength)} tokens
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Released</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-zinc-100">
              {formatDate(model.releaseDate)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Modalities
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200">
                {model.modality ?? "text → text"}
              </span>
              {model.inputModalities.map((m) => (
                <span
                  key={`in-${m}`}
                  className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                >
                  in: {m}
                </span>
              ))}
              {model.outputModalities.map((m) => (
                <span
                  key={`out-${m}`}
                  className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                >
                  out: {m}
                </span>
              ))}
              {model.maxCompletionTokens && (
                <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                  max completion: {formatContext(model.maxCompletionTokens)}
                </span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Capabilities
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {model.capabilities.length === 0 && (
                <span className="text-sm text-zinc-500">None listed</span>
              )}
              {model.capabilities.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benchmarks */}
      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-bold text-zinc-50">Benchmarks</h2>
        {benchmarks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">
            No published benchmark scores recorded for this model yet. Scores are
            only shown when they come from a published source — nothing here is
            estimated.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="pb-2 pr-4 font-medium">Benchmark</th>
                  <th className="pb-2 pr-4 font-medium">Score</th>
                  <th className="pb-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b) => (
                  <tr key={b.id} className="border-b border-zinc-800/60 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-zinc-100">{b.benchmark}</td>
                    <td className="py-2.5 pr-4 font-mono font-semibold text-amber-300">
                      {b.score}
                    </td>
                    <td className="py-2.5 text-xs text-zinc-400">{b.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-zinc-50">
            More from {model.lab?.name}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
