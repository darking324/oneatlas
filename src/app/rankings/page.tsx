import Link from "next/link";
import { getBenchmarkNames, getRankings } from "@/lib/models";
import { formatContext, formatPrice, TYPE_LABELS } from "@/lib/format";

const BENCHMARK_BLURBS: Record<string, string> = {
  "Artificial Analysis Intelligence Index":
    "Composite intelligence score from Artificial Analysis (via OpenRouter). Higher is better.",
  MMLU: "Massive Multitask Language Understanding — % correct across 57 subjects.",
  "MMLU-Pro": "Harder, 10-option version of MMLU — % correct.",
  HumanEval: "Python code generation — % of problems solved (pass@1).",
  GPQA: "Graduate-level science questions (Diamond split) — % correct.",
  "GPQA Diamond": "Graduate-level science questions (Diamond split) — % correct.",
  "MATH-500": "Competition mathematics — % correct on 500 problems.",
  "AIME 2025": "American Invitational Mathematics Examination 2025 — % correct.",
  "SWE-bench Verified": "Real-world software engineering tasks — % resolved.",
};

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const names = await getBenchmarkNames();
  const benchmark =
    typeof sp.benchmark === "string" && names.includes(sp.benchmark)
      ? sp.benchmark
      : (names.includes("Artificial Analysis Intelligence Index")
          ? "Artificial Analysis Intelligence Index"
          : names[0] ?? "");
  const type = typeof sp.type === "string" ? sp.type : undefined;

  const rows = benchmark ? await getRankings(benchmark, type) : [];

  const base = (b: string, t?: string) =>
    `/rankings?benchmark=${encodeURIComponent(b)}${t ? `&type=${t}` : ""}`;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
        Rankings &amp; benchmarks
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Leaderboards built only from published, sourced scores. Models without a
        score for the selected benchmark simply don&apos;t appear — nothing is
        estimated or invented.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {names.map((n) => (
          <Link
            key={n}
            href={base(n, type)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              n === benchmark
                ? "border-amber-400 bg-amber-400/15 text-amber-300"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {n}
          </Link>
        ))}
      </div>

      {benchmark && (
        <p className="mt-3 text-xs text-zinc-500">
          {BENCHMARK_BLURBS[benchmark] ?? "Published benchmark score. Higher is better."}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={base(benchmark)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            !type
              ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
              : "border-zinc-700 text-zinc-400"
          }`}
        >
          All types
        </Link>
        {["chat", "reasoning", "multimodal", "code"].map((t) => (
          <Link
            key={t}
            href={base(benchmark, t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              type === t
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                : "border-zinc-700 text-zinc-400"
            }`}
          >
            {TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-400">
          No scores recorded for this benchmark yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Lab</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Input / 1M</th>
                <th className="px-4 py-3 font-medium">Context</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 font-mono text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/models/${r.model.slug}`}
                      className="font-semibold text-zinc-50 hover:text-emerald-400"
                    >
                      {r.model.name}
                    </Link>
                    <span className="block text-xs text-zinc-500">{r.source}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{r.model.lab?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {TYPE_LABELS[r.model.type] ?? r.model.type}
                  </td>
                  <td className="px-4 py-3 font-mono text-base font-bold text-amber-300">
                    {r.score}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {formatPrice(r.model.inputPrice)}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">
                    {formatContext(r.model.contextLength)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
