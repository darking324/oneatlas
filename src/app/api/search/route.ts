import { listModels } from "@/lib/models";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return Response.json({ models: [], total: 0 });
  const result = await listModels({ q, limit: 10, sort: "popular" });
  return Response.json({
    models: result.models.map((m) => ({
      slug: m.slug,
      name: m.name,
      lab: m.lab?.name ?? null,
      type: m.type,
      inputPrice: m.inputPrice,
      contextLength: m.contextLength,
    })),
    total: result.total,
  });
}
