import { getBenchmarkNames, getRankings } from "@/lib/models";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const names = await getBenchmarkNames();
  const benchmark = url.searchParams.get("benchmark");
  if (!benchmark || !names.includes(benchmark)) {
    return Response.json({ benchmarks: names }, { status: 400 });
  }
  const rows = await getRankings(benchmark, url.searchParams.get("type") ?? undefined);
  return Response.json({ benchmark, rows });
}
