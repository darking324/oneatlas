import Link from "next/link";
import { getLabs, listModels } from "@/lib/models";

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const selected = typeof sp.lab === "string" ? sp.lab : undefined;
  const labs = await getLabs();

  const selectedLab = selected ? labs.find((l) => l.slug === selected) : undefined;
  const labModels = selectedLab
    ? (await listModels({ labSlug: selectedLab.slug, limit: 100 })).models
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-50">AI Labs</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        The companies and research labs building the models in the catalog. Pick
        a lab to see its models and releases.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => {
          const count = lab.models;
          const active = lab.slug === selected;
          return (
            <Link
              key={lab.id}
              href={`/labs?lab=${lab.slug}`}
              className={`rounded-xl border p-5 transition ${
                active
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-zinc-50">{lab.name}</h2>
                <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {count} {count === 1 ? "model" : "models"}
                </span>
              </div>
              {lab.description && (
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{lab.description}</p>
              )}
              <p className="mt-3 text-xs text-zinc-500">
                {lab.headquarters ? `${lab.headquarters} · ` : ""}
                {lab.founded ? `founded ${lab.founded}` : ""}
              </p>
              {lab.website && (
                <span className="mt-1 block truncate text-xs text-emerald-400">
                  {lab.website}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {selectedLab && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-zinc-50">
            Models by {selectedLab.name}
          </h2>
          {labModels.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">No models recorded for this lab.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Input / 1M</th>
                    <th className="px-4 py-3 font-medium">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {labModels.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-800/60 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/models/${m.slug}`}
                          className="font-semibold text-zinc-50 hover:text-emerald-400"
                        >
                          {m.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{m.type}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">
                        ${m.inputPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-300">
                        {m.contextLength.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
