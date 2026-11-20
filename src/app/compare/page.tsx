import Link from "next/link";
import { getModelsBySlugs } from "@/lib/models";
import { formatContext, formatDate, formatPrice, TYPE_LABELS } from "@/lib/format";

function Row({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-zinc-800/60 last:border-0">
      <th className="w-36 py-3 pr-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-3 align-top text-sm text-zinc-200">
          {v}
        </td>
      ))}
    </tr>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = typeof sp.models === "string" ? sp.models : "";
  const slugs = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 4);
  const models = await getModelsBySlugs(slugs);

  const benchmarkNames = [
    ...new Set(models.flatMap((m) => m.benchmarks.map((b) => b.benchmark))),
  ].sort();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Compare models</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Side-by-side pricing, context, capabilities and benchmarks. Share this
        comparison by copying the page URL — the selection lives in the link.
      </p>

      {models.length < 2 ? (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <p className="text-lg font-semibold text-zinc-200">
            Pick at least two models to compare
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            On any model card, use the <span className="text-zinc-200">+ Compare</span>{" "}
            button (up to 4 models), then come back here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Browse models →
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="w-36 px-4 py-4" />
                {models.map((m) => (
                  <th key={m.id} className="px-3 py-4 align-top">
                    <Link
                      href={`/models/${m.slug}`}
                      className="block text-base font-semibold text-zinc-50 hover:text-emerald-400"
                    >
                      {m.name}
                    </Link>
                    <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                      {m.lab?.name ?? "Unknown lab"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="px-4">
              <Row label="Type" values={models.map((m) => TYPE_LABELS[m.type] ?? m.type)} />
              <Row
                label="Input / 1M"
                values={models.map((m) => (
                  <span key={m.id} className="font-mono font-semibold text-emerald-400">
                    {formatPrice(m.inputPrice)}
                  </span>
                ))}
              />
              <Row
                label="Output / 1M"
                values={models.map((m) => (
                  <span key={m.id} className="font-mono font-semibold text-emerald-400">
                    {formatPrice(m.outputPrice)}
                  </span>
                ))}
              />
              <Row
                label="Context"
                values={models.map((m) => (
                  <span key={m.id} className="font-mono">
                    {formatContext(m.contextLength)} tokens
                  </span>
                ))}
              />
              <Row
                label="Released"
                values={models.map((m) => formatDate(m.releaseDate))}
              />
              <Row
                label="Provider"
                values={models.map((m) => m.provider?.name ?? "—")}
              />
              <Row
                label="Modalities"
                values={models.map((m) => (
                  <span key={m.id} className="text-xs leading-relaxed">
                    {m.modality ?? "text → text"}
                  </span>
                ))}
              />
              <Row
                label="Capabilities"
                values={models.map((m) => (
                  <span key={m.id} className="text-xs leading-relaxed">
                    {m.capabilities.length ? m.capabilities.join(", ") : "—"}
                  </span>
                ))}
              />
              {benchmarkNames.map((name) => (
                <Row
                  key={name}
                  label={name}
                  values={models.map((m) => {
                    const b = m.benchmarks.find((x) => x.benchmark === name);
                    return b ? (
                      <span key={m.id} className="font-mono font-semibold text-amber-300">
                        {b.score}
                      </span>
                    ) : (
                      <span key={m.id} className="text-zinc-600">
                        —
                      </span>
                    );
                  })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {models.length > 0 && (
        <p className="mt-4 text-xs text-zinc-500">
          Cheapest input highlighted by price alone is not the whole story — check
          the benchmark rows and context window before choosing.
        </p>
      )}
    </div>
  );
}
