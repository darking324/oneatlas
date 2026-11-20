import Link from "next/link";
import { getProviders, listModels } from "@/lib/models";

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const selected = typeof sp.provider === "string" ? sp.provider : undefined;
  const providers = await getProviders();

  const selectedProvider = selected
    ? providers.find((p) => p.slug === selected)
    : undefined;
  const providerModels = selectedProvider
    ? (await listModels({ providerSlug: selectedProvider.slug, limit: 100 })).models
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Providers</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Inference providers serving the models in the catalog. Pick a provider
        to see every model it serves on OneAtlas.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => {
          const count = provider.models;
          const active = provider.slug === selected;
          return (
            <Link
              key={provider.id}
              href={`/providers?provider=${provider.slug}`}
              className={`rounded-xl border p-5 transition ${
                active
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-zinc-50">{provider.name}</h2>
                <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {count} {count === 1 ? "model" : "models"}
                </span>
              </div>
              {provider.description && (
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                  {provider.description}
                </p>
              )}
              {provider.website && (
                <span className="mt-3 block truncate text-xs text-emerald-400">
                  {provider.website}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {selectedProvider && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-zinc-50">
            Models served by {selectedProvider.name}
          </h2>
          {providerModels.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">
              No models recorded for this provider.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Lab</th>
                    <th className="px-4 py-3 font-medium">Input / 1M</th>
                    <th className="px-4 py-3 font-medium">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {providerModels.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-800/60 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/models/${m.slug}`}
                          className="font-semibold text-zinc-50 hover:text-emerald-400"
                        >
                          {m.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{m.lab?.name ?? "—"}</td>
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
